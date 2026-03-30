import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthInputField from '@/components/AuthComponents/AuthInputField';

export default function ForgotPassword() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandPink = theme.tint;

    // Theme-aware colors to support Dark Mode perfectly
    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const inputBorder = colorScheme === 'dark' ? '#333333' : '#D1D5DB';
    const textColor = theme.text;
    const labelColor = theme.text;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

            {/* 1. Header Navigation */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={brandPink} />
                </TouchableOpacity>
                <Text style={[styles.logoText, { color: brandPink }]}>GETSEEN</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 2. Promo Card tailored for Password Reset */}
                <AuthPromoCard
                    title="Reset Password"
                    subtitle="Enter the email address associated with your account, and we'll send you a secure link to reset your password."
                    bgColor="#4A5C7F" // Keeps the consistent navy branding
                    iconName="lock-closed-outline" // Swapped megaphone for a lock icon
                />

                <View style={styles.formContainer}>

                    {/* 3. Reusable Email Input */}
                    <AuthInputField
                        label="Email Address"
                        placeholder="name@company.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        inputBgColor={inputBg}
                        borderColor={inputBorder}
                        labelColor={labelColor}
                        textColor={textColor}
                        accentColor={brandPink}
                    />

                    {/* 4. Action Button */}
                    <TouchableOpacity
                        style={[styles.mainBtn, { backgroundColor: brandPink }]}
                        onPress={() => {
                            // API call to send reset email goes here
                            console.log("Reset link sent!");
                            router.back(); // Or navigate to a "Check Your Email" confirmation screen
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.mainBtnText}>Send Reset Link</Text>
                    </TouchableOpacity>

                    {/* 5. Back to Login Helper */}
                    <TouchableOpacity
                        style={styles.backToLoginBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                            Remember your password? <Text style={{ color: brandPink, fontWeight: '700' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    backButton: {
        padding: 5,
        zIndex: 10
    },
    logoText: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -1
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    formContainer: {
        marginTop: 40 // Extra top margin since there is no toggle switch here
    },
    mainBtn: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        marginTop: 10
    },
    mainBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16
    },
    backToLoginBtn: {
        marginTop: 24,
        alignItems: 'center',
    },
    backToLoginText: {
        fontSize: 14,
    }
});