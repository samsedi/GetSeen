import { useCallback, useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import cartService, { CartItemResponse, AddToCartData } from '@/api/cartService';
import { useAlertStore } from '@/store/useAlertStore';

// ─────────────────────────────────────────────────────────────
// Hook: useCartScreen
// Orchestrates all cart screen interactions with the backend.
// ─────────────────────────────────────────────────────────────

import * as ImagePicker from 'expo-image-picker';

export function useCartScreen() {
    const { items, totalAmount, setCartData, clearCartData } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgresses, setUploadProgresses] = useState<Record<string, number>>({});

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
        setCartData(cart.items, cart.totalAmount);
    };

    const handleRemoveItem = useCallback(async (itemId: string) => {
        await removeItemSafely(itemId);
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

    const handleUploadMedia = useCallback(async (item: CartItemResponse) => {
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
            await replaceItemWithMedia(item, mediaFile, (progress) => {
                setUploadProgresses(prev => ({ ...prev, [item.id]: progress }));
            });
            await fetchCartOrHandleError();
        } catch (e) {
            handleCartError('Failed to upload media.', e);
        } finally {
            setUploadProgresses(prev => {
                const newP = { ...prev };
                delete newP[item.id];
                return newP;
            });
            setIsLoading(false);
        }
    }, []);

    const handleRemoveMedia = useCallback(async (item: CartItemResponse) => {
        try {
            setIsLoading(true);
            await cartService.removeFromCart(item.id);
            const data = buildReAddData(item);
            const formData = cartService.buildAddToCartFormData(data);
            await cartService.addToCart(formData);
            await fetchCartOrHandleError();
        } catch (e) {
            handleCartError('Failed to remove media.', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { cartItems: items, totalAmount, isLoading, uploadProgresses, handleRemoveItem, handleClearCart, handleUploadMedia, handleRemoveMedia };

}

// ─────────────────────────────────────────────────────────────
// Private helpers — gradually lower-level detail below
// ─────────────────────────────────────────────────────────────

const replaceItemWithMedia = async (item: CartItemResponse, mediaFile: { uri: string; name: string; type: string }, onProgress?: (progress: number) => void): Promise<void> => {
    await cartService.removeFromCart(item.id);
    const data = buildReAddData(item);
    const formData = cartService.buildAddToCartFormData(data, mediaFile);
    await cartService.addToCart(formData, onProgress);
};

const buildReAddData = (item: CartItemResponse): AddToCartData => ({
    screenId: item.screenId,
    startDate: item.startDate,
    endDate: item.endDate,
});

const handleCartError = (message: string, error: unknown): void => {
    console.error(message, error);
    useAlertStore.getState().showAlert('Cart Error', message);
};
