import { useState, useCallback, useEffect } from 'react';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';

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
// Hook
// --------------------------------------------------------------------------
export function useAdvertiserAuth() {
    const router = useRouter();

    const [isSignIn, setIsSignIn] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState<AdvertiserForm>(() => loadInitialForm());
    const [errors, setErrors] = useState<AdvertiserErrors>(() => getInitialErrors());

    /**
     * Persist the form input automatically to the cache store on every change.
     */
    useEffect(() => {
        cacheForm(form);
    }, [form]);

    /**
     * Validates a single field against predefined regex strategies.
     */
    const validateField = useCallback((field: keyof AdvertiserForm, value: string): boolean => {
        return performFieldValidation(field, value, form.password);
    }, [form.password]);

    /**
     * Updates the form's state and checks for errors in real-time as the user types.
     */
    const handleInputChange = useCallback((field: keyof AdvertiserForm, value: string) => {
        updateFormState(setForm, field, value);
        updateErrorsState(setErrors, field, value, validateField);
    }, [validateField]);

    /**
     * Executes the login process by firing the API request and persisting the resulting tokens.
     */
    const executeLoginFlow = async () => {
        const credentials = buildLoginCredentials(form);
        const response = await authApi.login(credentials);
        verifyAdvertiserRole(response);
        await persistSession(response);
        finalizeAuth(router);
    };

    /**
     * Safely wraps the entire login flow inside an isolated try-catch block to handle errors.
     */
    const processLogin = async () => {
        try {
            await executeLoginFlow();
        } catch (error: any) {
            handleLoginError(error, setIsSignIn);
        }
    };


    /**
     * Executes the first step of registration by requesting an OTP and navigating to the verification screen.
     */
    const executeRegistrationFlow = async () => {
        const email = getCleanEmail(form);
        await authApi.sendAdvertiserSignupOtp({ email });
        cacheForm(form);
        router.push(`/(auth)/verify-otp?email=${encodeURIComponent(email)}&account_type=advertiser&autoSend=false`);
    };

    /**
     * Safely wraps the registration flow inside an isolated try-catch block to handle errors.
     */
    const processRegistration = async () => {
        try {
            await executeRegistrationFlow();
        } catch (error: any) {
            handleRegistrationError(error);
        }
    };

    /**
     * Acts as the main submit router, delegating to either the login or registration flow.
     */
    const handleAuthSubmit = async () => {
        setLoading(true);
        if (isSignIn) {
            await processLogin();
        } else {
            await processRegistration();
        }
        setLoading(false);
    };

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

// --------------------------------------------------------------------------
// Micro-functions
// --------------------------------------------------------------------------

/**
 * Loads the initial form state by prioritizing cached data from the global store.
 */
const loadInitialForm = (): AdvertiserForm => ({
    firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '',
    ...(useFormCacheStore.getState().cache['advertiserAuth'] || {})
});

/**
 * Initializes the error state map for the advertiser form fields.
 */
const getInitialErrors = (): AdvertiserErrors => ({
    firstName: false, lastName: false, phone: false, email: false, password: false, confirmPassword: false,
});

/**
 * Caches the current form state globally to prevent data loss across navigations.
 */
const cacheForm = (form: AdvertiserForm) => {
    useFormCacheStore.getState().setFormCache('advertiserAuth', form);
};

/**
 * Performs field-specific regex validation to ensure the input meets requirements.
 */
const performFieldValidation = (field: keyof AdvertiserForm, value: string, passwordCompare: string): boolean => {
    if (value.length === 0) return false;
    const strategies = getValidationStrategies(passwordCompare);
    return strategies[field as string] ? strategies[field as string](value) : true;
};

/**
 * Provides the map of field validation strategies used by performFieldValidation.
 */
const getValidationStrategies = (passwordCompare: string): Record<string, (val: string) => boolean> => ({
    email: (v) => AUTH_REGEX.email.test(v),
    password: (v) => AUTH_REGEX.password.test(v),
    phone: (v) => AUTH_REGEX.phone.test(v),
    firstName: (v) => AUTH_REGEX.name.test(v),
    lastName: (v) => AUTH_REGEX.name.test(v),
    confirmPassword: (v) => v === passwordCompare,
});

/**
 * Updates a specific key within the local form state object.
 */
const updateFormState = (setForm: any, field: keyof AdvertiserForm, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
};

/**
 * Evaluates the new input value and updates the local error state if the input fails validation.
 */
const updateErrorsState = (setErrors: any, field: keyof AdvertiserForm, value: string, validateField: any) => {
    setErrors((prev: any) => ({ ...prev, [field]: value.length > 0 && !validateField(field, value) }));
};

/**
 * Assembles the standardized payload required by the backend to log in an advertiser.
 */
const buildLoginCredentials = (form: AdvertiserForm) => ({
    email: form.email.trim(),
    password: form.password,
    account_type: 'advertiser' as const,
    device_name: Device.modelName || Device.deviceName || 'Mobile App'
});

/**
 * Halts execution if the user's role does not strictly match the expected "advertiser" role.
 */
const verifyAdvertiserRole = (response: any) => {
    if (response.user.role !== 'advertiser') {
        throw new Error('This email is registered as a Screen Owner. Please use the Screen Owner login or create a new Advertiser account.');
    }
};

/**
 * Pushes the newly acquired authentication tokens into the global Zustand state.
 */
const persistSession = async (response: any) => {
    await useAuthStore.getState().login({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        role: 'advertiser',
    });
};

/**
 * Clears the cache and completes the login process by navigating the user to the home screen.
 */
const finalizeAuth = (router: any) => {
    useFormCacheStore.getState().clearFormCache('advertiserAuth');
    router.replace('/(tabs)/home');
};

/**
 * Parses and routes the API error encountered during login to the appropriate alert handlers.
 */
const handleLoginError = (error: any, setIsSignIn: any) => {
    const msg = (error.response?.data?.message || error.message || '').toLowerCase();
    if (isUserNotFoundError(msg, error.response?.status)) {
        promptForSignUp(setIsSignIn);
        return;
    }
    if (isBadCredentialsError(msg, error.response?.status)) {
        showBadCredentialsAlert();
        return;
    }
    showGenericErrorAlert('Login Failed', error);
};

/**
 * Identifies whether an error message implies that the requested user account does not exist.
 */
const isUserNotFoundError = (msg: string, status?: number) => {
    return msg.includes('not found') || status === 404;
};

/**
 * Identifies whether an error message implies that the provided login credentials were incorrect.
 */
const isBadCredentialsError = (msg: string, status?: number) => {
    return msg.includes('bad credentials') || msg.includes('incorrect') || status === 401;
};

/**
 * Triggers an interactive alert offering the user a quick shortcut to the sign-up flow.
 */
const promptForSignUp = (setIsSignIn: any) => {
    useAlertStore.getState().showAlert(
        'Account Not Found',
        'We could not find an account with this email/password. Would you like to create a new account?',
        [
            { text: 'Try Again', style: 'cancel' },
            { text: 'Sign Up', onPress: () => setIsSignIn(false) }
        ]
    );
};

/**
 * Triggers a specific alert indicating that the password was incorrect.
 */
const showBadCredentialsAlert = () => {
    useAlertStore.getState().showAlert('Login Failed', 'Incorrect email or password. Please try again.');
};

/**
 * Triggers a generalized error alert when an unspecified backend error occurs.
 */
const showGenericErrorAlert = (title: string, error: any) => {
    useAlertStore.getState().showAlert(title, error.response?.data?.message || error.message || 'Please check your details and try again.');
};

/**
 * Extracts and cleans the email value from the form for payload usage.
 */
const getCleanEmail = (form: AdvertiserForm) => form.email.trim();

/**
 * Parses and routes the API error encountered during registration to the general alert handler.
 */
const handleRegistrationError = (error: any) => {
    showGenericErrorAlert('Registration Failed', error);
};
