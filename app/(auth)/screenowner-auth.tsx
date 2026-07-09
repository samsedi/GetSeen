import React from 'react';
import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Text, useColorScheme, useWindowDimensions, ActivityIndicator,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { useAppTheme } from '@/constants/theme';
import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthToggle from '@/components/AuthComponents/AuthToggle';
import { AuthInputField, PasswordInputField } from '@/components/AuthComponents/AuthInputField';

import { useScreenOwnerAuth } from '@/hooks/useScreenOwnerAuth';

export default function VenueOwnerAuth() {
    // ─── Logic ────────────────────────────────────────────────────────────
    const {
        isSignIn, setIsSignIn,
        agreeTerms, setAgreeTerms,
        loading, form, errors,
        isButtonDisabled,
        handleInputChange,
        handleAuthSubmit,
        goForgotPassword,
    } = useScreenOwnerAuth();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme();
    const theme = useAppTheme();
    const router = useRouter();

    const brandBlue = theme.brandNavy;
    const errorRed = '#FF3B30';
    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : theme.background;
    const inputBorder = theme.border;

    const promo = isSignIn
        ? { title: 'Welcome Back!', subtitle: 'Sign in to continue earning with screens in your venues.', icon: 'tv-outline' }
        : { title: 'Monetize Your Venue', subtitle: 'Earn revenue by hosting digital screens in your location. Manage screens and track earnings.', icon: 'tv-outline' };

    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={loading}>
                    <Ionicons name="arrow-back" size={24} color={brandBlue} />
                </TouchableOpacity>
                <Image source={logoSource} style={styles.logo} contentFit="contain" />
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <AuthPromoCard
                    title={promo.title}
                    subtitle={promo.subtitle}
                    bgColor="#D11243"
                    iconName={promo.icon as any}
                />

                <AuthToggle
                    isSignIn={isSignIn}
                    onToggle={setIsSignIn}
                    activeColor={brandBlue}
                    bgColor={colorScheme === 'dark' ? '#222' : theme.card}
                />

                <View style={styles.formContainer}>
                    {!isSignIn && (
                        <AuthInputField
                            label="Company Name"
                            placeholder="e.g. Silverbird Cinemas"
                            autoCapitalize="none"
                            value={form.companyName}
                            onChangeText={(v) => handleInputChange('companyName', v)}
                            borderColor={errors.companyName ? errorRed : inputBorder}
                            errorText={errors.companyName ? "At least 2 characters" : undefined}
                            inputBgColor={inputBg}
                            textColor={theme.text}
                            labelColor={theme.text}
                            accentColor={brandBlue}
                        />
                    )}

                    <AuthInputField
                        label="Email Address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(v) => handleInputChange('email', v)}
                        borderColor={errors.email ? errorRed : inputBorder}
                        errorText={errors.email ? "Invalid email address" : undefined}
                        inputBgColor={inputBg}
                        textColor={theme.text}
                        labelColor={theme.text}
                        accentColor={brandBlue}
                    />

                    <PasswordInputField
                        label="Password"
                        autoCapitalize="none"
                        onForgotPress={isSignIn ? goForgotPassword : undefined}
                        value={form.password}
                        onChangeText={(v) => handleInputChange('password', v)}
                        borderColor={errors.password ? errorRed : inputBorder}
                        errorText={errors.password ? "Min 8 chars, 1 letter, 1 number" : undefined}
                        inputBgColor={inputBg}
                        textColor={theme.text}
                        labelColor={theme.text}
                        accentColor={brandBlue}
                    />

                    {!isSignIn && (
                        <>
                            <PasswordInputField
                                label="Confirm Password"
                                autoCapitalize="none"
                                value={form.confirmPassword}
                                onChangeText={(v) => handleInputChange('confirmPassword', v)}
                                borderColor={errors.confirmPassword ? errorRed : inputBorder}
                                errorText={errors.confirmPassword ? "Passwords do not match" : undefined}
                                inputBgColor={inputBg}
                                textColor={theme.text}
                                labelColor={theme.text}
                                accentColor={brandBlue}
                            />
                            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: inputBorder },
                                    agreeTerms && { backgroundColor: brandBlue, borderColor: brandBlue }
                                ]}>
                                    {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                                    I agree to the <Text style={{ color: brandBlue }}>Terms</Text> and <Text style={{ color: brandBlue }}>Privacy</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.mainBtn, { backgroundColor: brandBlue }, isButtonDisabled && { opacity: 0.5 }]}
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
    backBtn: { padding: 5 },
    logo: { height: 35, width: 100 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 20 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    checkbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});