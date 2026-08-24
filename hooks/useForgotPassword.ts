import { useState, useCallback } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';

import authApi from '@/api/authService';
import { AUTH_REGEX } from './useAdvertiserAuth';

export function useForgotPassword(account_type: 'advertiser' | 'screen_owner') {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    /**
     * Updates the email state and checks regex validation on every keystroke.
     */
    const handleEmailChange = useCallback((value: string) => {
        updateEmailState(value, setEmail, setError);
    }, []);

    /**
     * Executes the password reset request after cleaning and validating the email.
     */
    const executePasswordReset = async () => {
        const cleanEmail = getCleanEmail(email);
        validateEmailForReset(cleanEmail, setError);
        await authApi.forgotPassword({ email: cleanEmail, account_type });
        showResetLinkSentAlert(router);
    };

    /**
     * Safely wraps the password reset execution in a try-catch block and toggles loading states.
     */
    const handleSendResetLink = async () => {
        setLoading(true);
        try {
            await executePasswordReset();
        } catch (err: any) {
            handleResetError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        error,
        loading,
        isButtonDisabled: isSubmitDisabled(email, error, loading),
        handleEmailChange,
        handleSendResetLink,
        goBack: () => router.back(),
    };
}

// --------------------------------------------------------------------------
// Micro-functions
// --------------------------------------------------------------------------

/**
 * Syncs the provided text into the email state and toggles the error state if regex fails.
 */
const updateEmailState = (value: string, setEmail: any, setError: any) => {
    setEmail(value);
    setError(value.length > 0 && !AUTH_REGEX.email.test(value));
};

/**
 * Strips whitespace and forces lowercase to standardize the email before sending it to the backend.
 */
const getCleanEmail = (email: string) => {
    return email.trim().toLowerCase();
};

/**
 * Halts execution and displays an alert if the user attempts to submit an invalid email format.
 */
const validateEmailForReset = (email: string, setError: any) => {
    if (!email || !AUTH_REGEX.email.test(email)) {
        setError(true);
        useAlertStore.getState().showAlert('Invalid Email', 'Please enter a valid email address.');
        throw new Error('Validation Error'); 
    }
};

/**
 * Displays a success alert indicating that the reset link has been dispatched, and routes the user back.
 */
const showResetLinkSentAlert = (router: any) => {
    useAlertStore.getState().showAlert(
        'Link Sent',
        'If this email is registered, a password reset link has been sent.',
        [{ text: 'OK', onPress: () => router.back() }]
    );
};

/**
 * Intercepts errors during the reset request, ignoring intentional validation halts while alerting actual API failures.
 */
const handleResetError = (err: any) => {
    if (err.message !== 'Validation Error') {
        useAlertStore.getState().showAlert('Error', err.message || 'Failed to send reset link. Please try again.');
    }
};

/**
 * Computes whether the submit button should be locked to prevent invalid or duplicate requests.
 */
const isSubmitDisabled = (email: string, error: boolean, loading: boolean) => {
    return !email || error || loading;
};
