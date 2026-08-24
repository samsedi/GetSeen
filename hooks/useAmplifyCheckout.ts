import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import cartService from '@/api/cartService';
import amplifyService from '@/api/amplifyService';
import { useCartStore } from '@/store/useCartStore';
import { useAlertStore } from '@/store/useAlertStore';

export function useAmplifyCheckout() {
    const [isProcessing, setIsProcessing] = useState(false);

    const startCombinedCheckout = async ({
        startDate,
        endDate,
        parsedImpressions,
        destinationUrl,
        mediaFiles,
        couponCode,
        grandTotal
    }: {
        startDate: Date;
        endDate: Date;
        parsedImpressions: number;
        destinationUrl: string;
        mediaFiles: {uri: string, type: string}[];
        couponCode: string;
        grandTotal: number;
    }) => {
        try {
            setIsProcessing(true);

            // --- STEP 1: INITIALIZE CART PAYMENT ---
            useAlertStore.getState().showAlert('Step 1 of 2', 'Initializing Screen Booking payment...');
            const cartSummary = await cartService.getCheckoutSummary(couponCode);
            if (!cartSummary.ready) {
                throw new Error(cartSummary.blocking_errors?.[0]?.message || 'Cart is not ready for checkout.');
            }

            const cartData = await cartService.initializePayment(couponCode);
            if (!cartData || !cartData.paystack) {
                throw new Error("Invalid response from server when initializing cart payment.");
            }
            const { authorization_url: cartAuthUrl, reference: cartRef } = cartData.paystack;

            if (!cartAuthUrl) throw new Error("No authorization URL received for Cart payment.");

            // Open browser to pay for cart
            await WebBrowser.openBrowserAsync(cartAuthUrl);

            // Verify cart payment
            useAlertStore.getState().showAlert('Verifying', 'Verifying Screen Booking payment...');
            const verifyRes = await cartService.verifyPayment(cartRef);
            if (verifyRes && verifyRes.success === false) {
                throw new Error(verifyRes.error?.message || 'Screen Booking payment failed.');
            }

            // Extract order_item_ids from the verified payment orders
            let orderItemIds: number[] = [];
            const orders = verifyRes?.data?.payment?.orders;
            if (Array.isArray(orders)) {
                orders.forEach((order: any) => {
                    if (Array.isArray(order.items)) {
                        order.items.forEach((item: any) => {
                            if (item?.id) orderItemIds.push(item.id);
                        });
                    }
                });
            }

            if (orderItemIds.length === 0) {
                useCartStore.getState().clearCartData();
                throw new Error("Screen booking successful, but couldn't retrieve order IDs for Amplify. Please set up Amplify from your Orders page.");
            }

            // --- STEP 2: INITIALIZE AMPLIFY PAYMENT ---
            useAlertStore.getState().showAlert('Step 2 of 2', 'Initializing Mobile Retargeting payment...');
            
            // Format media array for the API
            const formattedMedia = mediaFiles.map(file => {
                const filename = file.uri.split('/').pop() || 'media.jpg';
                return { filename, type: file.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video' };
            });

            const amplifyPayload = {
                campaign_name: `Amplify Campaign ${new Date().toISOString().split('T')[0]}`,
                order_item_ids: orderItemIds,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                daily_impressions: parsedImpressions,
                destination_url: destinationUrl,
                media_files: formattedMedia,
                coupon: couponCode || undefined,
                callback_url: 'https://standard.paystack.co/close'
            };

            const amplifyData = await amplifyService.checkoutAmplify(amplifyPayload);
            if (!amplifyData || !amplifyData.paystack) {
                throw new Error("Invalid response from server when initializing Amplify payment.");
            }
            const { authorization_url: ampAuthUrl, reference: ampRef } = amplifyData.paystack;

            if (!ampAuthUrl) throw new Error("No authorization URL received for Amplify payment.");

            // Open browser to pay for amplify
            await WebBrowser.openBrowserAsync(ampAuthUrl);

            // Verify amplify payment
            useAlertStore.getState().showAlert('Verifying', 'Verifying Mobile Retargeting payment...');
            const ampVerifyRes = await cartService.verifyPayment(ampRef);
            if (ampVerifyRes && ampVerifyRes.success === false) {
                throw new Error(ampVerifyRes.error?.message || 'Amplify payment failed.');
            }

            // Both successful!
            useCartStore.getState().clearCartData();
            router.replace({
                pathname: '/homeSubScreens/receipt',
                params: { reference: ampRef, amount: String(grandTotal) }
            });

        } catch (error: any) {
            console.error("Failed to complete combined checkout", error);
            useAlertStore.getState().showAlert(
                'Checkout Error',
                error.message || 'Failed to complete checkout process. Please check your Orders page.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        startCombinedCheckout,
        isProcessing
    };
}
