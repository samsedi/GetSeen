import { useState, useCallback } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import authApi from '@/api/authService';
import { AUTH_REGEX } from './useAdvertiserAuth';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
type ScreenOwnerForm = {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type ScreenOwnerErrors = Record<keyof ScreenOwnerForm, boolean>;

// --------------------------------------------------------------------------
// Isolated Try/Catch API wrappers
// --------------------------------------------------------------------------
const attemptLoginSafely = async (credentials: any) => {
    try {
        return await authApi.login(credentials);
    } catch (error: any) {
        useAlertStore.getState().showAlert('Login Failed', error.message || 'Please check your details and try again.');
        return null;
    }
};

const attemptRegisterSafely = async (details: any) => {
    try {
        const response = await authApi.registerScreenOwner(details);
        return response;
    } catch (error: any) {
        useAlertStore.getState().showAlert('Registration Failed', error.message || 'Please check your details and try again.');
        return null;
    }
};

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------
export function useScreenOwnerAuth() {
    const router = useRouter();

    const [isSignIn, setIsSignIn] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ScreenOwnerForm>({
        companyName: '', email: '', password: '', confirmPassword: '',
    });

    const [errors, setErrors] = useState<ScreenOwnerErrors>({
        companyName: false, email: false, password: false, confirmPassword: false,
    });

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------
    const COMPANY_REGEX = /^[a-zA-Z0-9\s]{2,}$/;

    const validateField = useCallback((field: keyof ScreenOwnerForm, value: string): boolean => {
        if (value.length === 0) return false;

        const validationStrategies: Record<string, (val: string) => boolean> = {
            email: (v) => AUTH_REGEX.email.test(v),
            password: (v) => AUTH_REGEX.password.test(v),
            companyName: (v) => COMPANY_REGEX.test(v),
            confirmPassword: (v) => v === form.password,
        };

        const strategy = validationStrategies[field as string];
        return strategy ? strategy(value) : true;
    }, [form.password]);

    const handleInputChange = useCallback((field: keyof ScreenOwnerForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: value.length > 0 && !validateField(field, value) }));
    }, [validateField]);

    // ------------------------------------------------------------------
    // Sub-actions (Single Responsibility)
    // ------------------------------------------------------------------
    const processLogin = async () => {
        const response = await attemptLoginSafely({
            email: form.email.trim(),
            password: form.password,
        });

        if (!response) return;

        if (!response.roles.includes('SCREEN_OWNER')) {
            useAlertStore.getState().showAlert(
                'Access Denied',
                'This email is registered as an Advertiser. Please use the Advertiser login or create a new Screen Owner account.'
            );
            return;
        }

        await SecureStore.setItemAsync('userToken', response.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.refreshToken);
        await SecureStore.setItemAsync('activeRole', 'SCREEN_OWNER');
        await SecureStore.setItemAsync('userEmail', response.email);
        await SecureStore.setItemAsync('isEmailVerified', String(response.isEmailVerified));

        if (!response.isEmailVerified) {
            router.push({
                pathname: '/(auth)/verify-otp',
                params: { email: form.email.trim(), autoSend: 'true' },
            });
        } else {
            router.replace('/(screen-owner-tabs)/dashboard');
        }
    };

    const processRegistration = async () => {
        const response = await attemptRegisterSafely({
            companyName: form.companyName.trim(),
            email: form.email.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            agreedToTerms: agreeTerms,
        });

        if (response) {
            await SecureStore.setItemAsync('userToken', response.accessToken);
            await SecureStore.setItemAsync('refreshToken', response.refreshToken);
            await SecureStore.setItemAsync('activeRole', 'SCREEN_OWNER');
            await SecureStore.setItemAsync('userEmail', response.email);
            await SecureStore.setItemAsync('isEmailVerified', String(response.isEmailVerified));

            if (!response.isEmailVerified) {
                useAlertStore.getState().showAlert('Success', 'Account created! Please verify your email.');
                router.push({
                    pathname: '/(auth)/verify-otp',
                    params: { email: form.email.trim(), autoSend: 'true' },
                });
            } else {
                useAlertStore.getState().showAlert('Success', 'Account created successfully!');
                // useAlertStore.getState().showAlert('Success', 'Role added to your verified account!');
                router.replace('/(screen-owner-tabs)/dashboard');
            }
        }
    };

    // ------------------------------------------------------------------
    // Main Submit
    // ------------------------------------------------------------------
    const handleAuthSubmit = async () => {
        setLoading(true);
        if (isSignIn) {
            await processLogin();
        } else {
            await processRegistration();
        }
        setLoading(false);
    };

    // ------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------
    const isButtonDisabled =
        loading ||
        (isSignIn
            ? !form.email || !form.password
            : !form.companyName || !form.email || !form.password || !agreeTerms);

    return {
        isSignIn, setIsSignIn,
        agreeTerms, setAgreeTerms,
        loading, form, errors,
        isButtonDisabled,
        handleInputChange,
        handleAuthSubmit,
        goForgotPassword: () => router.push('/(auth)/forgotpassword-screenowner'),
    };
}
