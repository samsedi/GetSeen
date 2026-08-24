import { useCallback, useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import cartService, { CartItemResponse } from '@/api/cartService';
import { useAlertStore } from '@/store/useAlertStore';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────
// Hook: useCartScreen
// Orchestrates all cart screen interactions with the backend.
// ─────────────────────────────────────────────────────────────

import * as ImagePicker from 'expo-image-picker';

export function useCartScreen() {
    const { items, totalAmount, setCartData, clearCartData } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgresses, setUploadProgresses] = useState<Record<string, number>>({});
    const [uploadControllers, setUploadControllers] = useState<Record<string, AbortController>>({});

    // New: Coupon code
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);

    // New: Additional instructions
    const [additionalInstructions, setAdditionalInstructions] = useState('');

    // Phase 6: Cart Media
    const [isMediaSelectionVisible, setIsMediaSelectionVisible] = useState(false);
    const [isPreviousMediaVisible, setIsPreviousMediaVisible] = useState(false);
    const [selectedCartItem, setSelectedCartItem] = useState<CartItemResponse | null>(null);

    useEffect(() => { loadCartSafely(); }, []);

    const loadCartSafely = useCallback(async () => {
        setIsLoading(true);
        await fetchCartOrHandleError();
        setIsLoading(false);
    }, []);

    const fetchCartOrHandleError = async () => {
        try {
            await fetchAndSyncCart();
        } catch (e) {
            handleCartError('Failed to load your cart.', e);
        }
    };

    const fetchAndSyncCart = async () => {
        const cart = await cartService.getCart();
        setCartData(cart.items, cart.subtotal, cart.totalAmount);
    };

    const handleRemoveItem = useCallback((itemId: string) => {
        useAlertStore.getState().showAlert(
            "Remove Item",
            "Are you sure you want to remove this from your cart?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes", 
                    style: "destructive",
                    onPress: async () => {
                        await removeItemSafely(itemId);
                    }
                }
            ]
        );
    }, []);

    const removeItemSafely = async (itemId: string) => {
        try {
            await cartService.removeFromCart(itemId);
            await fetchAndSyncCart();
        } catch (e) {
            handleCartError('Failed to remove item.', e);
        }
    };

    const handleClearCart = useCallback(async () => {
        await clearCartSafely();
    }, [clearCartData]);

    const clearCartSafely = async () => {
        try {
            await cartService.clearCart();
            clearCartData();
        } catch (e) {
            handleCartError('Failed to clear cart.', e);
        }
    };

    const handleApplyCoupon = useCallback(async () => {
        if (!couponCode.trim()) return;
        try {
            const data = await cartService.validateCoupon(couponCode);
            useCartStore.getState().setCouponData(data.discount, data.total, data.coupon);
            setCouponApplied(true);
            setCouponDiscount(data.discount);
            useAlertStore.getState().showAlert('Success', 'Coupon applied successfully!');
        } catch (error: any) {
            useAlertStore.getState().showAlert('Coupon Error', error.message || 'Invalid coupon code.');
            useCartStore.getState().clearCouponData();
            setCouponApplied(false);
            setCouponDiscount(0);
        }
    }, [couponCode]);

    const handleUploadMedia = useCallback((item: CartItemResponse) => {
        setSelectedCartItem(item);
        setIsMediaSelectionVisible(true);
    }, []);

    const handleDeviceUpload = useCallback(async () => {
        if (!selectedCartItem) return;
        const item = selectedCartItem;
        setIsMediaSelectionVisible(false);
        try {
            // Ask for permissions
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                handleCartError('Permission to access camera roll is required!', new Error('Permission denied'));
                return;
            }

            // Pick an image
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });

            if (pickerResult.canceled) {
                return;
            }

            const asset = pickerResult.assets[0];
            const uri = asset.uri;
            const name = asset.fileName || uri.split('/').pop() || 'upload.jpg';
            const type = asset.mimeType || 'image/jpeg';
            
            const mediaFile = { uri, name, type };

            setIsLoading(true);
            setUploadProgresses(prev => ({ ...prev, [item.id]: 0 }));
            
            const controller = new AbortController();
            setUploadControllers(prev => ({ ...prev, [item.id]: controller }));

            await cartService.uploadCartItemMedia(item.id, mediaFile, (progress) => {
                setUploadProgresses(prev => ({ ...prev, [item.id]: progress }));
            }, controller.signal);
            await fetchCartOrHandleError();
        } catch (e: any) {
            if (e.message === 'canceled' || e.name === 'CanceledError' || e.name === 'AbortError') {
                // upload cancelled, do nothing
            } else {
                handleCartError('Failed to upload media.', e);
            }
        } finally {
            setUploadProgresses(prev => {
                const newP = { ...prev };
                delete newP[item.id];
                return newP;
            });
            setUploadControllers(prev => {
                const newC = { ...prev };
                delete newC[item.id];
                return newC;
            });
            setIsLoading(false);
            setSelectedCartItem(null);
        }
    }, [selectedCartItem, fetchCartOrHandleError]);

    const handleAttachExistingMedia = useCallback(async (filename: string) => {
        if (!selectedCartItem) return;
        setIsPreviousMediaVisible(false);
        setIsLoading(true);
        try {
            await cartService.attachExistingMedia(selectedCartItem.id, filename);
            await fetchCartOrHandleError();
            useAlertStore.getState().showAlert('Success', 'Media attached successfully!');
        } catch (e: any) {
            handleCartError('Failed to attach media.', e);
        } finally {
            setIsLoading(false);
            setSelectedCartItem(null);
        }
    }, [selectedCartItem, fetchCartOrHandleError]);

    const handleCancelUpload = useCallback((itemId: string) => {
        useAlertStore.getState().showAlert(
            "Cancel Upload",
            "Are you sure you want to cancel the media upload?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes, Cancel", 
                    style: "destructive",
                    onPress: () => {
                        if (uploadControllers[itemId]) {
                            uploadControllers[itemId].abort();
                        }
                    }
                }
            ]
        );
    }, [uploadControllers]);

    // Compute whether all items have media uploaded
    const allMediaUploaded = items.length > 0 && items.every(item => !!item.mediaUrl);
    const hasAnyPendingUpload = items.some(item => !item.mediaUrl);

    return {
        cartItems: items,
        totalAmount,
        isLoading,
        uploadProgresses,
        handleRemoveItem,
        handleClearCart,
        handleUploadMedia,
        handleCancelUpload,
        // New
        couponCode,
        setCouponCode,
        couponApplied,
        couponDiscount,
        handleApplyCoupon,
        additionalInstructions,
        setAdditionalInstructions,
        allMediaUploaded,
        hasAnyPendingUpload,
        isMediaSelectionVisible,
        setIsMediaSelectionVisible,
        isPreviousMediaVisible,
        setIsPreviousMediaVisible,
        selectedCartItem,
        handleDeviceUpload,
        handleAttachExistingMedia,
    };

}

// ─────────────────────────────────────────────────────────────
// Private helpers — gradually lower-level detail below
// ─────────────────────────────────────────────────────────────



const handleCartError = (message: string, error: unknown): void => {
    console.error(message, error);
    useAlertStore.getState().showAlert('Cart Error', message);
};
