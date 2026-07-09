import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';

import authApi from '@/api/authService';
import { AUTH_REGEX } from './useAdvertiserAuth';

/**
 * Shared forgot-password hook used by both the advertiser and screen-owner
 * forgot-password screens. The only difference between the two screens is
 * their accentColor and the promo card text — all logic is identical.
 */
export function useForgotPassword() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // ------------------------------------------------------------------
    // Input handler — validates on every keystroke
    // ------------------------------------------------------------------
    const handleEmailChange = useCallback((value: string) => {
        setEmail(value);
        setError(value.length > 0 && !AUTH_REGEX.email.test(value));
    }, []);

    // ------------------------------------------------------------------
    // Submit
    // ------------------------------------------------------------------
    const handleSendResetLink = async () => {
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !AUTH_REGEX.email.test(cleanEmail)) {
            setError(true);
            useAlertStore.getState().showAlert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword(cleanEmail);
            useAlertStore.getState().showAlert(
                'Link Sent',
                'If this email is registered, a password reset link has been sent.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err: any) {
            useAlertStore.getState().showAlert('Error', err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        error,
        loading,
        isButtonDisabled: !email || error || loading,
        handleEmailChange,
        handleSendResetLink,
        goBack: () => router.back(),
    };
}
