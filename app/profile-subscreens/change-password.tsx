import React from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Text, useWindowDimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/constants/theme';
import { PasswordInputField } from '@/components/AuthComponents/AuthInputField';
import { useChangePassword } from '@/hooks/useChangePassword';

export default function ChangePassword() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        currentPassword, setCurrentPassword,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, loading, isButtonDisabled,
        handleChangePassword, goBack,
    } = useChangePassword();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const theme = useAppTheme();
    const brandColor = theme.tint; // Or whatever primary color is appropriate
    const errorRed = theme.statusRed;
    const inputBg = theme.inputBg;
    const inputBorder = theme.inputBorder;

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
                <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.7} disabled={loading}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
                        Please enter your current password to verify your identity, then enter your new password.
                    </Text>

                    <PasswordInputField
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        borderColor={inputBorder}
                        accentColor={brandColor}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
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
                        onPress={handleChangePassword}
                        activeOpacity={0.85}
                        disabled={isButtonDisabled}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.mainBtnText}>Change Password</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        height: 60 
    },
    backButton: { padding: 4, width: 40 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 24 },
    instructionText: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
