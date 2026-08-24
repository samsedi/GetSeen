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
import { AuthInputField, PasswordInputField } from '@/components/AuthComponents/AuthInputField';

import { useResetPassword } from '@/hooks/useResetPassword';

export default function ResetPassword() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        token, setToken,
        accountType,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, loading, isButtonDisabled,
        handleResetPassword, goBack,
    } = useResetPassword();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme();
    const theme = useAppTheme();

    const brandColor = accountType === 'advertiser' ? theme.tint : theme.brandNavy;
    const errorRed = theme.statusRed;
    const inputBg = theme.inputBg;
    const inputBorder = theme.inputBorder;

    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={brandColor} />
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
                    title="Set New Password"
                    subtitle="Please enter the reset token sent to your email and choose a new password."
                    bgColor={theme.brandNavy}
                    iconName="key-outline"
                />

                <View style={styles.formContainer}>
                    <AuthInputField
                        label="Reset Token"
                        placeholder="Paste your reset token here"
                        autoCapitalize="none"
                        value={token}
                        onChangeText={setToken}
                        borderColor={error && !token ? errorRed : inputBorder}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                        accentColor={brandColor}
                    />

                    <PasswordInputField
                        label="New Password"
                        value={password}
                        onChangeText={setPassword}
                        borderColor={error && !password ? errorRed : inputBorder}
                        errorText={error && !password ? "Password is required" : undefined}
                        accentColor={brandColor}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                    />

                    <PasswordInputField
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        borderColor={error && password !== confirmPassword ? errorRed : inputBorder}
                        errorText={error && password !== confirmPassword ? "Passwords do not match" : undefined}
                        accentColor={brandColor}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                    />

                    <TouchableOpacity
                        style={[styles.mainBtn, { backgroundColor: brandColor }, isButtonDisabled && { opacity: 0.5 }]}
                        onPress={handleResetPassword}
                        activeOpacity={0.85}
                        disabled={isButtonDisabled}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.mainBtnText}>Reset Password</Text>
                        }
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
});
