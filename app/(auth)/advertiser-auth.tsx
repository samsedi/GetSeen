import React from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Text, useColorScheme, Image, useWindowDimensions, ActivityIndicator,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthToggle from '@/components/AuthComponents/AuthToggle';
import { AuthInputField, PasswordInputField } from '@/components/AuthComponents/AuthInputField';

import { useAdvertiserAuth } from '@/hooks/useAdvertiserAuth';

export default function AdvertiserAuth() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        isSignIn, setIsSignIn,
        agreeTerms, setAgreeTerms,
        loading, form, errors,
        isButtonDisabled,
        handleInputChange,
        handleAuthSubmit,
        goForgotPassword,
    } = useAdvertiserAuth();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandPink = theme.tint;
    const errorRed = '#FF3B30';
    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const inputBorder = colorScheme === 'dark' ? '#333333' : '#D1D5DB';

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
                    style={[styles.logoImage, { width: isTablet ? 150 : 80 }]}
                />

                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <AuthPromoCard
                    title={isSignIn ? 'Welcome Back!' : 'Advertise Your Brand'}
                    subtitle={
                        isSignIn
                            ? 'Sign in to manage your active campaigns.'
                            : 'Reach your target audience through our network of high-traffic digital screens.'
                    }
                    bgColor="#2B4373"
                    iconName="megaphone-outline"
                />

                <AuthToggle
                    isSignIn={isSignIn}
                    onToggle={setIsSignIn}
                    activeColor={brandPink}
                    bgColor={colorScheme === 'dark' ? '#222' : '#F3F4F6'}
                />

                <View style={styles.formContainer}>
                    {/* Sign-up only fields */}
                    {!isSignIn && (
                        <>
                            <View style={styles.row}>
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="First Name"
                                    value={form.firstName}
                                    onChangeText={(val) => handleInputChange('firstName', val)}
                                    borderColor={errors.firstName ? errorRed : inputBorder}
                                    errorText={errors.firstName ? "At least 2 letters" : undefined}
                                    inputBgColor={inputBg}
                                    labelColor={theme.text}
                                    textColor={theme.text}
                                />
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="Last Name"
                                    value={form.lastName}
                                    onChangeText={(val) => handleInputChange('lastName', val)}
                                    borderColor={errors.lastName ? errorRed : inputBorder}
                                    errorText={errors.lastName ? "At least 2 letters" : undefined}
                                    inputBgColor={inputBg}
                                    labelColor={theme.text}
                                    textColor={theme.text}
                                />
                            </View>

                            <AuthInputField
                                label="Phone Number"
                                keyboardType="phone-pad"
                                placeholder="+234"
                                value={form.phone}
                                onChangeText={(val) => handleInputChange('phone', val)}
                                borderColor={errors.phone ? errorRed : inputBorder}
                                errorText={errors.phone ? "Invalid phone format" : undefined}
                                inputBgColor={inputBg}
                                labelColor={theme.text}
                                textColor={theme.text}
                            />

                            <AuthInputField
                                label="Country"
                                placeholder="Nigeria"
                                editable={false}
                                rightInputNode={<Ionicons name="chevron-down" size={20} color={theme.text} />}
                                inputBgColor={inputBg}
                                borderColor={inputBorder}
                                labelColor={theme.text}
                                textColor={theme.text}
                            />
                        </>
                    )}

                    {/* Shared fields */}
                    <AuthInputField
                        label="Email Address"
                        keyboardType="email-address"
                        placeholder="example@gmail.com"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(val) => handleInputChange('email', val)}
                        borderColor={errors.email ? errorRed : inputBorder}
                        errorText={errors.email ? "Invalid email address" : undefined}
                        accentColor={errors.email ? errorRed : brandPink}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                    />

                    <PasswordInputField
                        label="Password"
                        onForgotPress={isSignIn ? goForgotPassword : undefined}
                        value={form.password}
                        onChangeText={(val) => handleInputChange('password', val)}
                        borderColor={errors.password ? errorRed : inputBorder}
                        errorText={errors.password ? "Min 8 chars, 1 letter, 1 number" : undefined}
                        accentColor={errors.password ? errorRed : brandPink}
                        inputBgColor={inputBg}
                        labelColor={theme.text}
                        textColor={theme.text}
                    />

                    {/* Sign-up only: confirm password + terms */}
                    {!isSignIn && (
                        <>
                            <PasswordInputField
                                label="Confirm Password"
                                value={form.confirmPassword}
                                onChangeText={(val) => handleInputChange('confirmPassword', val)}
                                borderColor={errors.confirmPassword ? errorRed : inputBorder}
                                errorText={errors.confirmPassword ? "Passwords do not match" : undefined}
                                inputBgColor={inputBg}
                                labelColor={theme.text}
                                textColor={theme.text}
                            />

                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setAgreeTerms(!agreeTerms)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: inputBorder },
                                    agreeTerms && { backgroundColor: brandPink, borderColor: brandPink }
                                ]}>
                                    {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text style={[styles.checkboxText, { color: theme.textSecondary }]}>
                                    I agree to the{' '}
                                    <Text style={{ color: brandPink }}>Terms</Text> and{' '}
                                    <Text style={{ color: brandPink }}>Privacy</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.mainBtn,
                        { backgroundColor: brandPink },
                        isButtonDisabled && { opacity: 0.5 }
                    ]}
                    onPress={handleAuthSubmit}
                    disabled={isButtonDisabled}
                >
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.mainBtnText}>{isSignIn ? 'Sign In' : 'Create Account'}</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 5, zIndex: 10 },
    logoImage: { height: 35 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 30 },
    row: { flexDirection: 'row', gap: 15 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    checkbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    checkboxText: { fontSize: 13, flex: 1 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});