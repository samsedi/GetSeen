import React from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Text, useColorScheme, Image, useWindowDimensions,
    ActivityIndicator, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/constants/theme';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import { useVerifyOtp } from '@/hooks/useVerifyOtp';

export default function VerifyOTP() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        email, otp, loading, timer, canResend,
        inputRefs, isButtonDisabled,
        handleOtpChange, handleKeyPress,
        handleVerifySubmit, handleResend,
    } = useVerifyOtp();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme();
    const theme = useAppTheme();
    const router = useRouter();

    const brandPink = theme.tint;
    const inputBg = theme.inputBg;

    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={brandPink} />
                </TouchableOpacity>

                <Image
                    source={logoSource}
                    style={[styles.logoImage, { width: isTablet ? 130 : 100 }]}
                />
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AuthPromoCard
                    title="Verify Your Email"
                    subtitle={`We've sent a 6-digit verification code to ${email || 'your email'}. Please enter it below.`}
                    bgColor="#2B4373"
                    iconName="shield-checkmark-outline"
                />

                {/* OTP boxes */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.otpBox,
                                {
                                    backgroundColor: inputBg,
                                    borderColor: digit ? brandPink : theme.border,
                                    color: theme.text,
                                }
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Resend row */}
                <View style={styles.resendContainer}>
                    <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                        Didn't receive the code?
                    </Text>
                    {canResend ? (
                        <TouchableOpacity onPress={() => handleResend()} activeOpacity={0.7}>
                            <Text style={[styles.resendLink, { color: brandPink }]}> Resend</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[styles.resendLink, { color: theme.textSecondary }]}> Resend in {timer}s</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.mainBtn, { backgroundColor: brandPink }, isButtonDisabled && { opacity: 0.5 }]}
                    onPress={handleVerifySubmit}
                    disabled={isButtonDisabled}
                >
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.mainBtnText}>Verify Account</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 5, zIndex: 10 },
    logoImage: { height: 35 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 30 },
    otpBox: { width: 50, height: 60, borderWidth: 1.5, borderRadius: 12, fontSize: 24, fontWeight: '700', textAlign: 'center' },
    resendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
    resendText: { fontSize: 14 },
    resendLink: { fontSize: 14, fontWeight: '700' },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});