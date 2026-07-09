import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useCartStore } from '@/store/useCartStore';
import { useAlertStore } from '@/store/useAlertStore';
import cartService from '@/api/cartService';
import { router } from 'expo-router';

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

    const startCheckout = async () => {
        try {
            setIsInitializing(true);
            const data = await cartService.initializePayment(Number(totalAmount), userEmail);
            setReference(data.reference);
        } catch (error) {
            console.error("Failed to initialize payment", error);
            useAlertStore.getState().showAlert(
                'Checkout Error',
                'Failed to securely initialize your payment. Please try again.'
            );
        } finally {
            setIsInitializing(false);
        }
    };

    // Called by the Paystack SDK when payment is successful
    const handlePaymentSuccess = useCallback(async (response: any) => {
        const finalRef = response?.reference ?? reference ?? 'N/A';
        clearCartData(); // Clear local state
        
        try {
            // Explicitly tell the backend to verify the payment and record the campaigns right now!
            // This is a safety net in case the Paystack Webhook doesn't reach localhost in time.
            await cartService.verifyPayment(finalRef);
        } catch (error) {
            console.log("Failed to verify backend payment", error);
        }
        
        // Navigate to the beautiful receipt screen
        router.replace({
            pathname: '/homeSubScreens/receipt',
            params: { reference: finalRef, amount: String(totalAmount) }
        });
        
        setReference(null); // Reset for future checkouts
    }, [clearCartData, reference, totalAmount]);

    // Called by the Paystack SDK when user cancels
    const handlePaymentCancel = useCallback(() => {
        useAlertStore.getState().showAlert(
            'Payment Cancelled',
            'You cancelled the payment. Your cart items are still saved.'
        );
        setReference(null); // Reset for future checkouts
    }, []);

    return {
        agreed,
        setAgreed,
        userEmail,
        amountInKobo,
        reference,
        isInitializing,
        startCheckout,
        handlePaymentSuccess,
        handlePaymentCancel,
    };
}
