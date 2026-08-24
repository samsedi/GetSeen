import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/useAlertStore';
import * as Device from 'expo-device';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import authApi from '@/api/authService';
import { useFormCacheStore } from '@/store/useFormCacheStore';

export function useVerifyOtp() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email: string; account_type?: string; autoSend?: string }>();

    const [email, setEmail] = useState<string | undefined>(params.email);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [hasAutoSent, setHasAutoSent] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    /**
     * Initializes the email state from the Zustand store if it wasn't provided via route params.
     */
    useEffect(() => {
        loadMissingEmail(email, setEmail);
    }, [email]);

    /**
     * Manages the 60-second countdown timer for resending OTPs.
     */
    useEffect(() => {
        const interval = startTimerInterval(timer, canResend, setTimer, setCanResend);
        return () => clearTimerInterval(interval);
    }, [timer, canResend]);

    /**
     * Handles typing inside the 6 individual OTP boxes, auto-advancing focus when a number is entered.
     */
    const handleOtpChange = useCallback((text: string, index: number) => {
        updateOtpState(text, index, otp, setOtp, inputRefs);
    }, [otp]);

    /**
     * Detects backspace presses on empty OTP boxes to move focus backwards automatically.
     */
    const handleKeyPress = useCallback((e: any, index: number) => {
        handleBackspace(e, index, otp, inputRefs);
    }, [otp]);

    /**
     * Executes the OTP verification by combining the cached form data with the OTP and submitting the final registration.
     */
    const executeVerification = async () => {
        const otpString = otp.join('');
        const accountType = params.account_type || 'advertiser';

        // Retrieve the cached form data
        const cacheKey = accountType === 'advertiser' ? 'advertiserAuth' : 'screenOwnerAuth';
        const cachedForm = useFormCacheStore.getState().cache[cacheKey];

        if (!cachedForm) {
            throw new Error('Registration session expired. Please start over.');
        }

        // Build the payload depending on account type
        const payload = buildRegistrationPayload(cachedForm, otpString, accountType as 'advertiser' | 'screen_owner');

        // Submit Registration
        const response = accountType === 'advertiser'
            ? await authApi.registerAdvertiser(payload as any)
            : await authApi.registerScreenOwner(payload as any);

        // Persist session tokens
        await persistSession(response, accountType as 'advertiser' | 'screen_owner');

        // Clear cache and navigate
        useFormCacheStore.getState().clearFormCache(cacheKey);
        showVerificationSuccess();
        routeUserByRole(router, accountType as 'advertiser' | 'screen_owner');
    };

    /**
     * Wraps the verification process in a try-catch, manages loading state, and handles incomplete OTP entries.
     */
    const handleVerifySubmit = async () => {
        if (!isOtpComplete(otp) || !email) return;
        setLoading(true);
        try {
            await executeVerification();
        } catch (error: any) {
            handleVerificationError(error, setOtp, inputRefs, router);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the user explicitly tapping the "Resend OTP" button, displaying alerts for success or failure.
     */
    const handleResendWithAlert = useCallback(async () => {
        if (!email) {
            showMissingEmailError();
            return;
        }
        try {
            await executeResend(email, params.account_type);
            resetResendState(setTimer, setCanResend, setOtp, inputRefs);
            showResendSuccess();
        } catch (error: any) {
            showResendError(error);
        }
    }, [email, params.account_type]);

    /**
     * Handles auto-sending an OTP in the background without disturbing the user with success/failure alerts.
     */
    const handleResendSilently = useCallback(async () => {
        if (!email) return;
        try {
            await executeResend(email, params.account_type);
            resetResendState(setTimer, setCanResend, setOtp, inputRefs);
        } catch {
            // Silently ignore background resend failures
        }
    }, [email, params.account_type]);

    /**
     * Automatically triggers a silent OTP resend if the route params dictate it (e.g. immediately after signup).
     */
    useEffect(() => {
        if (shouldAutoSend(email, params.autoSend, hasAutoSent)) {
            setHasAutoSent(true);
            void handleResendSilently();
        }
    }, [email, params.autoSend, hasAutoSent, handleResendSilently]);

    return {
        email,
        otp,
        loading,
        timer,
        canResend,
        inputRefs,
        isButtonDisabled: !isOtpComplete(otp) || loading,
        handleOtpChange,
        handleKeyPress,
        handleVerifySubmit,
        handleResend: handleResendWithAlert,
    };
}

// --------------------------------------------------------------------------
// Micro-functions
// --------------------------------------------------------------------------

/**
 * Checks the global auth store for an email if one wasn't passed via routing params.
 */
const loadMissingEmail = (currentEmail: string | undefined, setEmail: any) => {
    if (!currentEmail) {
        const storedUser = useAuthStore.getState().user;
        if (storedUser?.email) setEmail(storedUser.email);
    }
};

/**
 * Initiates the countdown interval for the OTP resend timer.
 */
const startTimerInterval = (timer: number, canResend: boolean, setTimer: any, setCanResend: any) => {
    if (timer > 0 && !canResend) {
        return setInterval(() => setTimer((prev: number) => prev - 1), 1000);
    }
    if (timer === 0) setCanResend(true);
    return undefined;
};

/**
 * Cleans up the interval timer to prevent memory leaks when the component unmounts.
 */
const clearTimerInterval = (interval: NodeJS.Timeout | undefined) => {
    if (interval) clearInterval(interval);
};

/**
 * Cleans the input to ensure only numbers are entered, updates the state, and attempts to advance focus.
 */
const updateOtpState = (text: string, index: number, otp: string[], setOtp: any, inputRefs: any) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    autoAdvanceFocus(cleaned, index, inputRefs);
};

/**
 * Moves the user's cursor to the next OTP input box automatically after they type a digit.
 */
const autoAdvanceFocus = (cleaned: string, index: number, inputRefs: any) => {
    if (cleaned && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
};

/**
 * Moves the user's cursor to the previous OTP input box automatically if they hit backspace on an empty box.
 */
const handleBackspace = (e: any, index: number, otp: string[], inputRefs: any) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
};

/**
 * Verifies that the user has filled in all 6 digits of the OTP.
 */
const isOtpComplete = (otp: string[]) => {
    return otp.join('').length === 6;
};

/**
 * Constructs the final registration payload using the cached form data and the 6-digit OTP.
 */
const buildRegistrationPayload = (form: any, emailOtp: string, accountType: 'advertiser' | 'screen_owner') => {
    if (accountType === 'advertiser') {
        return {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: form.phone.trim(),
            country_id: 1, // Defaulting to Nigeria per original logic
            email: form.email.trim(),
            email_otp: emailOtp.trim(),
            password: form.password,
            password_confirmation: form.confirmPassword,
            account_type: 'advertiser',
            device_name: Device.modelName || Device.deviceName || 'Mobile App'
        };
    } else {
        return {
            phone: form.phone.trim(),
            email: form.email.trim(),
            email_otp: emailOtp.trim(),
            password: form.password,
            password_confirmation: form.confirmPassword,
            account_type: 'screen_owner',
            device_name: Device.modelName || Device.deviceName || 'Mobile App'
        };
    }
};

/**
 * Saves the session into Zustand.
 */
const persistSession = async (response: any, accountType: 'advertiser' | 'screen_owner') => {
    await useAuthStore.getState().login({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        role: accountType === 'advertiser' ? 'advertiser' : 'owner',
    });
};

/**
 * Sends the appropriate OTP resend request based on the account type.
 */
const executeResend = async (email: string, accountType?: string) => {
    if (accountType === 'advertiser') {
        await authApi.sendAdvertiserSignupOtp({ email });
    } else if (accountType === 'screen_owner') {
        await authApi.sendSignupOtp({ email });
    } else {
        await authApi.resendOtp(email); // Fallback to general endpoint if missing
    }
};

/**
 * Triggers a success alert when the backend confirms the OTP is valid.
 */
const showVerificationSuccess = () => {
    useAlertStore.getState().showAlert('Success', 'Account created successfully!');
};

/**
 * Routes the verified user to either the advertiser home page or the screen owner dashboard depending on their role.
 */
const routeUserByRole = (router: any, accountType: 'advertiser' | 'screen_owner') => {
    if (accountType === 'screen_owner') {
        router.replace('/(screen-owner-tabs)/dashboard');
    } else {
        router.replace('/(tabs)/home');
    }
};

/**
 * Alerts the user that their OTP was incorrect, clears the input fields, and refocuses the first box.
 * Also handles expired session errors and routes them back to auth.
 */
const handleVerificationError = (error: any, setOtp: any, inputRefs: any, router: any) => {
    const msg = error.response?.data?.message || error.message || 'Invalid OTP. Please try again.';
    useAlertStore.getState().showAlert('Verification Failed', msg);

    if (msg.includes('expired')) {
        router.replace('/(auth)');
        return;
    }

    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
};

/**
 * Resets the countdown timer, locks the resend button, and clears the OTP inputs after a new code is sent.
 */
const resetResendState = (setTimer: any, setCanResend: any, setOtp: any, inputRefs: any) => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
};

/**
 * Alerts the user that the system lost track of their email, prompting a re-login.
 */
const showMissingEmailError = () => {
    useAlertStore.getState().showAlert('Error', 'Email not found. Please log in again.');
};

/**
 * Alerts the user that a fresh OTP has been successfully dispatched to their inbox.
 */
const showResendSuccess = () => {
    useAlertStore.getState().showAlert('Code Sent', 'A new 6-digit code has been sent to your email.');
};

/**
 * Alerts the user that the backend failed to send a new OTP.
 */
const showResendError = (error: any) => {
    useAlertStore.getState().showAlert('Failed', error.message || 'Could not resend OTP. Please try again later.');
};

/**
 * Determines whether the app should automatically fire off an OTP request in the background.
 */
const shouldAutoSend = (email: string | undefined, autoSendParams: string | undefined, hasAutoSent: boolean) => {
    return !!(email && autoSendParams === 'true' && !hasAutoSent);
};
