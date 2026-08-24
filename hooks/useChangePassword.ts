import { useState } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';

import authApi from '@/api/authService';
import { AUTH_REGEX } from './useAdvertiserAuth';

export function useChangePassword() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    /**
     * Executes the password change by validating inputs, sending the request, and processing the result.
     */
    const executeChangePassword = async () => {
        validatePasswordInputs(password, confirmPassword, setError);
        
        // Pass current_password only if it's not empty, according to the API spec (current_password?)
        const payload: any = {
            password: password,
            password_confirmation: confirmPassword
        };
        
        if (currentPassword.trim()) {
            payload.current_password = currentPassword.trim();
        }

        const response = await authApi.changePassword(payload);
        showChangeSuccess(response, router);
    };

    /**
     * Safely wraps the change execution inside a try-catch block and toggles loading states.
     */
    const handleChangePassword = async () => {
        setLoading(true);
        try {
            await executeChangePassword();
        } catch (err: any) {
            handleChangeError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        currentPassword, setCurrentPassword,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, setError,
        loading,
        isButtonDisabled: isSubmitDisabled(password, confirmPassword, loading),
        handleChangePassword,
        goBack: () => router.back(),
    };
}

// --------------------------------------------------------------------------
// Micro-functions
// --------------------------------------------------------------------------

/**
 * Orchestrates validations required before attempting a password change.
 */
const validatePasswordInputs = (password: string, confirmPassword: string, setError: any) => {
    if (!AUTH_REGEX.password.test(password)) {
        setError(true);
        useAlertStore.getState().showAlert('Invalid Password', 'Password must be at least 8 characters long and contain both letters and numbers.');
        throw new Error('Validation Error');
    }

    if (password !== confirmPassword) {
        setError(true);
        useAlertStore.getState().showAlert('Passwords Mismatch', 'The new passwords do not match.');
        throw new Error('Validation Error');
    }
};

/**
 * Triggers a success alert explicitly routing the user back.
 */
const showChangeSuccess = (response: any, router: any) => {
    useAlertStore.getState().showAlert(
        'Success',
        response.message || 'Password changed successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
    );
};

/**
 * Intercepts errors during the change request.
 */
const handleChangeError = (err: any) => {
    if (err.message !== 'Validation Error') {
        useAlertStore.getState().showAlert('Error', err.response?.data?.message || err.message || 'Failed to change password. Please check your current password and try again.');
    }
};

/**
 * Computes whether the submit button should be locked to prevent incomplete or duplicate requests.
 */
const isSubmitDisabled = (password: string, confirmPassword: string, loading: boolean) => {
    return !password || !confirmPassword || loading;
};
