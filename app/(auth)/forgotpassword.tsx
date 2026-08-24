import React from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Text, useColorScheme, useWindowDimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useAppTheme } from '@/constants/theme';
import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import { AuthInputField } from '@/components/AuthComponents/AuthInputField';

import { useForgotPassword } from '@/hooks/useForgotPassword';

export default function ForgotPassword() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        email, error, loading, isButtonDisabled,
        handleEmailChange, handleSendResetLink, goBack,
    } = useForgotPassword('advertiser');

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme();
    const theme = useAppTheme();

    const brandPink = theme.tint;
    const errorRed = theme.statusRed;
    const inputBg = theme.inputBg;

    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={brandPink} />
                </TouchableOpacity>

                <Image
                    source={logoSource}
                    style={[styles.logoImage, { width: isTablet ? 150 : 120 }]}
                    contentFit="contain"
                />

                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AuthPromoCard
                    title="Reset Password"
                    subtitle="Enter the email address associated with your account, and we'll send you a secure link to reset your password."
                    bgColor={theme.brandNavy}
                    iconName="lock-closed-outline"
                />

                <View style={styles.formContainer}>
                    <AuthInputField
                        label="Email Address"
                        placeholder="name@company.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={handleEmailChange}
                        borderColor={error ? errorRed : theme.border}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                        accentColor={error ? errorRed : brandPink}
                    />

                    <TouchableOpacity
                        style={[styles.mainBtn, { backgroundColor: brandPink }, isButtonDisabled && { opacity: 0.5 }]}
                        onPress={handleSendResetLink}
                        activeOpacity={0.85}
                        disabled={isButtonDisabled}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.mainBtnText}>Send Reset Link</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backToLoginBtn} onPress={goBack} disabled={loading}>
                        <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                            Remember your password?{' '}
                            <Text style={{ color: brandPink, fontWeight: '700' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, height: 60 },
    backButton: { padding: 5, width: 40 },
    logoImage: { height: 35 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 40 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    backToLoginBtn: { marginTop: 24, alignItems: 'center' },
    backToLoginText: { fontSize: 14 },
});