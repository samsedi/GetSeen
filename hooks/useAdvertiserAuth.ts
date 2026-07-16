import { useState, useCallback, useEffect } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import authApi from '@/api/authService';
import { useFormCacheStore } from '@/store/useFormCacheStore';

// --------------------------------------------------------------------------
// Shared validation patterns
// --------------------------------------------------------------------------
export const AUTH_REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    phone: /^(\+234|0)[789][01]\d{8}$/,
    name: /.+/,
};

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
type AdvertiserForm = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type AdvertiserErrors = Record<keyof AdvertiserForm, boolean>;

// --------------------------------------------------------------------------
// Isolated Try/Catch API wrappers
// --------------------------------------------------------------------------
const attemptLoginSafely = async (credentials: any, onUserNotFound?: () => void) => {
    try {
        return await authApi.login(credentials);
    } catch (error: any) {
        const msg = (error.response?.data?.message || error.message || '').toLowerCase();
        
        // If specifically user not found
        if (onUserNotFound && (msg.includes('not found') || error.response?.status === 404)) {
            onUserNotFound();
            return null;
        }

        // If wrong password / incorrect credentials
        if (msg.includes('bad credentials') || msg.includes('incorrect') || error.response?.status === 401) {
            useAlertStore.getState().showAlert('Login Failed', 'Incorrect email or password. Please try again.');
            return null;
        }

        // Generic fallback
        useAlertStore.getState().showAlert('Login Failed', error.response?.data?.message || error.message || 'Please check your details and try again.');
        return null;
    }
};

const attemptRegisterSafely = async (details: any) => {
    try {
        const response = await authApi.registerAdvertiser(details);
        return response;
    } catch (error: any) {
        useAlertStore.getState().showAlert('Registration Failed', error.message || 'Please check your details and try again.');
        return null;
    }
};

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------
export function useAdvertiserAuth() {
    const router = useRouter();

    const [isSignIn, setIsSignIn] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<AdvertiserForm>(() => ({
        firstName: '', lastName: '', phone: '',
        email: '', password: '', confirmPassword: '',
        ...(useFormCacheStore.getState().cache['advertiserAuth'] || {})
    }));

    useEffect(() => {
        useFormCacheStore.getState().setFormCache('advertiserAuth', form);
    }, [form]);

    const [errors, setErrors] = useState<AdvertiserErrors>({
        firstName: false, lastName: false, phone: false,
        email: false, password: false, confirmPassword: false,
    });

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------
    const validateField = useCallback((field: keyof AdvertiserForm, value: string): boolean => {
        if (value.length === 0) return false;

        const validationStrategies: Record<string, (val: string) => boolean> = {
            email: (v) => AUTH_REGEX.email.test(v),
            password: (v) => AUTH_REGEX.password.test(v),
            phone: (v) => AUTH_REGEX.phone.test(v),
            firstName: (v) => AUTH_REGEX.name.test(v),
            lastName: (v) => AUTH_REGEX.name.test(v),
            confirmPassword: (v) => v === form.password,
        };

        const strategy = validationStrategies[field as string];
        return strategy ? strategy(value) : true;
    }, [form.password]);

    const handleInputChange = useCallback((field: keyof AdvertiserForm, value: string) => {
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
        }, () => {
            useAlertStore.getState().showAlert(
                'Account Not Found',
                'We could not find an account with this email/password. Would you like to create a new account?',
                [
                    { text: 'Try Again', style: 'cancel' },
                    { text: 'Sign Up', onPress: () => setIsSignIn(false) }
                ]
            );
        });

        if (!response) return;

        if (!response.roles.includes('ADVERTISER')) {
            useAlertStore.getState().showAlert(
                'Access Denied',
                'This email is registered as a Screen Owner. Please use the Screen Owner login or create a new Advertiser account.'
            );
            return;
        }

        await SecureStore.setItemAsync('userToken', response.accessToken);
        await SecureStore.setItemAsync('refreshToken', response.refreshToken);
        await SecureStore.setItemAsync('activeRole', 'ADVERTISER');
        await SecureStore.setItemAsync('userEmail', response.email);
        await SecureStore.setItemAsync('isEmailVerified', String(response.isEmailVerified));

        if (!response.isEmailVerified) {
            router.push({
                pathname: '/(auth)/verify-otp',
                params: { email: form.email.trim(), autoSend: 'true' },
            });
        } else {
            useFormCacheStore.getState().clearFormCache('advertiserAuth');
            router.replace('/(tabs)/home');
        }
    };

    const processRegistration = async () => {
        const response = await attemptRegisterSafely({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phoneNumber: form.phone.trim(),
            country: 'Nigeria',
            email: form.email.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            agreedToTerms: agreeTerms,
        });

        if (response) {
            await SecureStore.setItemAsync('userToken', response.accessToken);
            await SecureStore.setItemAsync('refreshToken', response.refreshToken);
            await SecureStore.setItemAsync('activeRole', 'ADVERTISER');
            await SecureStore.setItemAsync('userEmail', response.email);
            await SecureStore.setItemAsync('isEmailVerified', String(response.isEmailVerified));

            if (!response.isEmailVerified) {
                useAlertStore.getState().showAlert('Success', 'Account created! Please verify your email.');
                router.push({
                    pathname: '/(auth)/verify-otp',
                    params: { email: form.email.trim(), autoSend: 'true' },
                });
            } else {
                useFormCacheStore.getState().clearFormCache('advertiserAuth');
                useAlertStore.getState().showAlert('Success', 'Account created successfully!');
                // useAlertStore.getState().showAlert('Success', 'Role added to your verified account!');
                router.replace('/(tabs)/home');
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
    const hasErrors = Object.values(errors).some((e) => e === true);
    const isSignUpIncomplete = !isSignIn && (!form.firstName || !form.lastName || !form.phone || !agreeTerms);
    const isSignInIncomplete = isSignIn && (!form.email || !form.password);
    const isButtonDisabled = hasErrors || (isSignIn ? isSignInIncomplete : isSignUpIncomplete) || loading;

    return {
        isSignIn, setIsSignIn,
        agreeTerms, setAgreeTerms,
        loading, form, errors,
        isButtonDisabled,
        handleInputChange,
        handleAuthSubmit,
        goForgotPassword: () => router.push('/(auth)/forgotpassword'),
    };
}
