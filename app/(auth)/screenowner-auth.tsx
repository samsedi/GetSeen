import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme, useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInputField, PasswordInputField } from '@/components/AuthComponents/AuthInputField';
import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthToggle from '@/components/AuthComponents/AuthToggle';
import TermsModal from '@/components/AuthComponents/TermsModal';
import { PRIVACY_DATA } from '@/constants/PrivacyData';
import { useAppTheme } from '@/constants/theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    const [showTerms, setShowTerms] = React.useState(false);
    const [showPrivacy, setShowPrivacy] = React.useState(false);

    const brandBlue = theme.brandNavy;
    const errorRed = theme.statusRed;
    const inputBg = theme.inputBg;
    const inputBorder = theme.inputBorder;

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

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={20}
            >
                <AuthPromoCard
                    title={promo.title}
                    subtitle={promo.subtitle}
                    bgColor={theme.brandRed}
                    iconName={promo.icon as any}
                />

                <AuthToggle
                    isSignIn={isSignIn}
                    onToggle={setIsSignIn}
                    activeColor={brandBlue}
                    bgColor={theme.card}
                />

                <View style={styles.formContainer}>
                    {/* Show phone number instead of companyName */}
                    {!isSignIn && (
                        <AuthInputField
                            label="Phone Number"
                            keyboardType="phone-pad"
                            placeholder="+234"
                            value={form.phone}
                            maxLength={form.phone?.startsWith('+234') ? 14 : form.phone?.startsWith('0') ? 11 : 15}
                            onChangeText={(val) => handleInputChange('phone', val)}
                            borderColor={errors.phone ? errorRed : inputBorder}
                            errorText={errors.phone ? "Invalid phone format" : undefined}
                            inputBgColor={inputBg}
                            labelColor={theme.text}
                            textColor={theme.text}
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
                                <Text style={[styles.checkboxText, { color: theme.textSecondary }]}>
                                    I agree to the{' '}
                                    <Text
                                        style={{ color: brandBlue }}
                                        onPress={() => setShowTerms(true)}
                                    >
                                        General Terms of Service
                                    </Text> and{' '}
                                    <Text
                                        style={{ color: brandBlue }}
                                        onPress={() => setShowPrivacy(true)}
                                    >
                                        Privacy Policy
                                    </Text>
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
            </KeyboardAwareScrollView>

            <TermsModal
                visible={showTerms}
                onClose={() => setShowTerms(false)}
                brandColor={brandBlue}
                title="General Terms of Service"
            />

            <TermsModal
                visible={showPrivacy}
                onClose={() => setShowPrivacy(false)}
                brandColor={brandBlue}
                title="Privacy Policy"
                data={PRIVACY_DATA}
            />
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
    checkboxText: { fontSize: 14, flex: 1, lineHeight: 20 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});