import { useState } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

import authApi from '@/api/authService';
import { AUTH_REGEX } from './useAdvertiserAuth';

export function useResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const initialToken = getInitialToken(params);
    const initialAccountType = getInitialAccountType(params);

    const [token, setToken] = useState(initialToken);
    const [accountType, setAccountType] = useState<'advertiser' | 'screen_owner'>(initialAccountType);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    /**
     * Executes the password reset by validating inputs, sending the request, and processing the result.
     */
    const executePasswordReset = async () => {
        validateResetInputs(token, password, confirmPassword, setError);
        const response = await authApi.resetPassword({
            account_type: accountType,
            token: token.trim(),
            password: password,
            password_confirmation: confirmPassword
        });
        showResetSuccess(response, router);
    };

    /**
     * Safely wraps the reset execution inside a try-catch block and toggles loading states.
     */
    const handleResetPassword = async () => {
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
        token, setToken,
        accountType, setAccountType,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, setError,
        loading,
        isButtonDisabled: isSubmitDisabled(token, password, confirmPassword, loading),
        handleResetPassword,
        goBack: () => router.back(),
    };
}

// --------------------------------------------------------------------------
// Micro-functions
// --------------------------------------------------------------------------

/**
 * Safely extracts the token string from the dynamic route parameters if it exists.
 */
const getInitialToken = (params: any) => {
    return typeof params.token === 'string' ? params.token : '';
};

/**
 * Safely extracts the account type from the route parameters, defaulting to advertiser.
 */
const getInitialAccountType = (params: any) => {
    const type = params.account_type;
    return typeof type === 'string' && (type === 'advertiser' || type === 'screen_owner') 
           ? type 
           : 'advertiser';
};

/**
 * Orchestrates the full suite of validations required before attempting a password reset.
 */
const validateResetInputs = (token: string, password: string, confirmPassword: string, setError: any) => {
    validateTokenPresence(token);
    validatePasswordFormat(password, setError);
    validatePasswordMatch(password, confirmPassword, setError);
};

/**
 * Halts execution if the user has not provided a reset token.
 */
const validateTokenPresence = (token: string) => {
    if (!token.trim()) {
        useAlertStore.getState().showAlert('Missing Token', 'Please enter the reset token from your email.');
        throw new Error('Validation Error');
    }
};

/**
 * Halts execution and triggers an alert if the proposed password fails complexity requirements.
 */
const validatePasswordFormat = (password: string, setError: any) => {
    if (!AUTH_REGEX.password.test(password)) {
        setError(true);
        useAlertStore.getState().showAlert('Invalid Password', 'Password must be at least 8 characters long and contain both letters and numbers.');
        throw new Error('Validation Error');
    }
};

/**
 * Halts execution and triggers an alert if the confirmation password does not perfectly match the original.
 */
const validatePasswordMatch = (password: string, confirmPassword: string, setError: any) => {
    if (password !== confirmPassword) {
        setError(true);
        useAlertStore.getState().showAlert('Passwords Mismatch', 'The new passwords do not match.');
        throw new Error('Validation Error');
    }
};

/**
 * Triggers a success alert explicitly routing the user back to the login screen once they hit OK.
 */
const showResetSuccess = (response: any, router: any) => {
    useAlertStore.getState().showAlert(
        'Success',
        response.message || 'Password reset successfully. Please log in with your new password.',
        [{ text: 'Go to Login', onPress: () => router.replace('/(auth)') }]
    );
};

/**
 * Intercepts errors during the reset request, ignoring intentional validation halts while alerting actual API failures.
 */
const handleResetError = (err: any) => {
    if (err.message !== 'Validation Error') {
        useAlertStore.getState().showAlert('Error', err.response?.data?.message || err.message || 'Failed to reset password. Please check your token and try again.');
    }
};

/**
 * Computes whether the submit button should be locked to prevent incomplete or duplicate requests.
 */
const isSubmitDisabled = (token: string, password: string, confirmPassword: string, loading: boolean) => {
    return !token || !password || !confirmPassword || loading;
};
