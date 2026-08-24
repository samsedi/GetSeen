import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useCartStore } from '@/store/useCartStore';
import { useAlertStore } from '@/store/useAlertStore';
import cartService from '@/api/cartService';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// ─────────────────────────────────────────────────────────────
// Hook: useCheckout
// Manages the Paystack payment state from the cart screen.
// ─────────────────────────────────────────────────────────────

export function useCheckout() {
    const { totalAmount, clearCartData } = useCartStore();
    const [agreed, setAgreed] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const [reference, setReference] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        // Fetch email from secure store on mount
        SecureStore.getItemAsync('userEmail').then(email => {
            if (email) setUserEmail(email);
        });
    }, []);

    // Paystack expects amount in KOBO (naira × 100)
    const amountInKobo = Math.round(Number(totalAmount) * 100);

    const startCheckout = async (couponCode?: string, orderNote?: string, shouldAmplify: boolean = false) => {
        if (!agreed) {
            useAlertStore.getState().showAlert('Terms & Guidelines', 'You must agree to the upload guidelines before checking out.');
            return;
        }
        try {
            setIsInitializing(true);
            
            // 1. Verify checkout readiness
            const summary = await cartService.getCheckoutSummary(couponCode);
            if (!summary.ready && summary.blocking_errors && summary.blocking_errors.length > 0) {
                useAlertStore.getState().showAlert('Action Required', summary.blocking_errors[0].message);
                setIsInitializing(false);
                return;
            }

            // 2. Initialize Payment on Backend
            const data = await cartService.initializePayment(couponCode, orderNote);
            const { authorization_url, reference: paystackRef } = data.paystack;

            if (!authorization_url) {
                throw new Error("No authorization URL received from the server.");
            }

            // 3. Open WebBrowser to complete payment
            const result = await WebBrowser.openBrowserAsync(authorization_url);
            
            // 4. Check if payment was completed after browser closes
            // Note: If the user cancels or closes early, this will still run. 
            // We need to verify with the backend.
            try {
                useAlertStore.getState().showAlert('Verifying Payment', 'Please wait while we confirm your payment...');
                const verifyRes = await cartService.verifyPayment(paystackRef);
                
                // Ensure the verification actually reported success before proceeding
                if (verifyRes && verifyRes.success === false) {
                    throw new Error(verifyRes.error?.message || 'Payment was not successfully completed.');
                }
                
                // Assuming successful verification clears cart
                clearCartData(); 
                
                if (shouldAmplify) {
                    useAlertStore.getState().showAlert('Payment Successful', 'Your screens are booked. Now, let\'s amplify your campaign!');
                    router.replace('/homeSubScreens/amplifySetup');
                } else {
                    router.replace({
                        pathname: '/homeSubScreens/receipt',
                        params: { reference: paystackRef, amount: String(totalAmount) }
                    });
                }
            } catch (verifyError: any) {
                useAlertStore.getState().showAlert(
                    'Payment Status', 
                    verifyError.response?.data?.error?.message || 'Payment not completed or verification failed.'
                );
            }
            
        } catch (error: any) {
            console.error("Failed to initialize payment", error);
            useAlertStore.getState().showAlert(
                'Checkout Error',
                error.message || 'Failed to securely initialize your payment. Please try again.'
            );
        } finally {
            setIsInitializing(false);
        }
    };

    return {
        agreed,
        setAgreed,
        userEmail,
        amountInKobo,
        isInitializing,
        startCheckout,
    };
}
