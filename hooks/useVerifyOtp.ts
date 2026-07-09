import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { TextInput } from 'react-native';

import authApi from '@/api/authService';

export function useVerifyOtp() {
    const router = useRouter();
    const params = useLocalSearchParams<{ email: string; autoSend?: string }>();
    
    const [email, setEmail] = useState<string | undefined>(params.email);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const fetchEmail = async () => {
            if (!email) {
                const storedEmail = await SecureStore.getItemAsync('userEmail');
                if (storedEmail) setEmail(storedEmail);
            }
        };
        fetchEmail();
    }, [email]);

    const [hasAutoSent, setHasAutoSent] = useState(false);

    // Ref array for auto-advancing focus between OTP boxes
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // ------------------------------------------------------------------
    // Countdown timer
    // ------------------------------------------------------------------
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && !canResend) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, canResend]);

    // ------------------------------------------------------------------
    // OTP input handlers
    // ------------------------------------------------------------------
    const handleOtpChange = useCallback((text: string, index: number) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = cleaned;
        setOtp(newOtp);

        // Auto-advance focus
        if (cleaned && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [otp]);

    const handleKeyPress = useCallback((e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }, [otp]);

    // ------------------------------------------------------------------
    // Verify submission
    // ------------------------------------------------------------------
    const handleVerifySubmit = async () => {
        const otpString = otp.join('');
        if (otpString.length < 6 || !email) return;

        setLoading(true);
        try {
            await authApi.verifyEmail({ email, otp: otpString });
            useAlertStore.getState().showAlert('Success', 'Email verified successfully!');

            // Route based on which role just logged in
            const role = await SecureStore.getItemAsync('activeRole');
            if (role === 'SCREEN_OWNER') {
                router.replace('/(screen-owner-tabs)/dashboard');
            } else {
                router.replace('/(tabs)/home');
            }
        } catch (error: any) {
            useAlertStore.getState().showAlert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // Resend OTP
    // ------------------------------------------------------------------
    const handleResend = useCallback(async (silent = false) => {
        if (!email) {
            if (!silent) useAlertStore.getState().showAlert('Error', 'Email not found. Please log in again.');
            return;
        }
        try {
            await authApi.resendOtp(email);
            if (!silent) useAlertStore.getState().showAlert('Code Sent', 'A new 6-digit code has been sent to your email.');
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            if (!silent) useAlertStore.getState().showAlert('Failed', error.message || 'Could not resend OTP. Please try again later.');
        }
    }, [email]);

    useEffect(() => {
        if (email && params.autoSend === 'true' && !hasAutoSent) {
            setHasAutoSent(true);
            handleResend(true);
        }
    }, [email, params.autoSend, hasAutoSent, handleResend]);

    return {
        email,
        otp,
        loading,
        timer,
        canResend,
        inputRefs,
        isButtonDisabled: otp.join('').length < 6 || loading,
        handleOtpChange,
        handleKeyPress,
        handleVerifySubmit,
        handleResend,
    };
}
