import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    useColorScheme,
    Image,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthToggle from '@/components/AuthComponents/AuthToggle';
import AuthInputField from '@/components/AuthComponents/AuthInputField';

// --- 1. REGEX PATTERNS ---
const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Min 8 chars, 1 letter, 1 number
    phone: /^(\+234|0)[789][01]\d{8}$/, // Supports Nigeria formats
    name: /^[a-zA-Z]{2,}$/ // Letters only, min 2 chars
};

export default function AdvertiserAuth() {
    // --- 2. STATE MANAGEMENT ---
    const [isSignIn, setIsSignIn] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        phone: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    // Scaling & Theme
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandPink = theme.tint;
    const errorRed = '#FF3B30'; // Standard iOS/Android error red

    // --- 3. VALIDATION LOGIC ---
    const validateField = (field: string, value: string) => {
        let isValid = true;

        // Skip validation if field is empty (optional, depending on your preference)
        if (value.length === 0) return false;

        switch (field) {
            case 'email': isValid = REGEX.email.test(value); break;
            case 'password': isValid = REGEX.password.test(value); break;
            case 'phone': isValid = REGEX.phone.test(value); break;
            case 'firstName':
            case 'lastName': isValid = REGEX.name.test(value); break;
            case 'confirmPassword': isValid = value === form.password; break;
        }
        return isValid;
    };

    const handleInputChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));

        // Check validity
        const isValid = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: !isValid }));
    };

    // Theme-aware styles
    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const inputBorder = colorScheme === 'dark' ? '#333333' : '#D1D5DB';
    const textColor = theme.text;
    const labelColor = theme.text;

    const handleNavigationTohome = () => {
        router.push({ pathname: '/(tabs)/home' });
    }

    // Button Logic: Disable if errors exist or required fields are missing
    const hasErrors = Object.values(errors).some(e => e === true);
    const isSignUpIncomplete = !isSignIn && (!form.firstName || !form.lastName || !form.phone || !agreeTerms);
    const isSignInIncomplete = isSignIn && (!form.email || !form.password);
    const isButtonDisabled = hasErrors || (isSignIn ? isSignInIncomplete : isSignUpIncomplete);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={brandPink} />
                </TouchableOpacity>

                <Image
                    source={logoSource}
                    style={[styles.logoImage, { width: isTablet ? 130 : 100 }]}
                    resizeMode="contain"
                />
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AuthPromoCard
                    title={isSignIn ? "Welcome Back!" : "Advertise Your Brand"}
                    subtitle={isSignIn ? "Sign in to manage your active campaigns." : "Reach your target audience through our network of high-traffic digital screens."}
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
                    {/* --- SIGN UP ONLY FIELDS --- */}
                    {!isSignIn && (
                        <>
                            <View style={styles.row}>
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="First Name"
                                    value={form.firstName}
                                    onChangeText={(val) => handleInputChange('firstName', val)}
                                    borderColor={errors.firstName ? errorRed : inputBorder}
                                    inputBgColor={inputBg}
                                    labelColor={labelColor}
                                    textColor={textColor}
                                />
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="Last Name"
                                    value={form.lastName}
                                    onChangeText={(val) => handleInputChange('lastName', val)}
                                    borderColor={errors.lastName ? errorRed : inputBorder}
                                    inputBgColor={inputBg}
                                    labelColor={labelColor}
                                    textColor={textColor}
                                />
                            </View>

                            <AuthInputField
                                label="Phone Number"
                                keyboardType="phone-pad"
                                placeholder="+234"
                                value={form.phone}
                                onChangeText={(val) => handleInputChange('phone', val)}
                                borderColor={errors.phone ? errorRed : inputBorder}
                                inputBgColor={inputBg}
                                labelColor={labelColor}
                                textColor={textColor}
                            />

                            <AuthInputField
                                label="Country"
                                placeholder="Nigeria"
                                editable={false}
                                rightIcon="chevron-down"
                                inputBgColor={inputBg}
                                borderColor={inputBorder}
                                labelColor={labelColor}
                                textColor={textColor}
                            />
                        </>
                    )}

                    {/* --- SHARED FIELDS --- */}
                    <AuthInputField
                        label="Email Address"
                        keyboardType="email-address"
                        placeholder='example@gmail.com'
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(val) => handleInputChange('email', val)}
                        borderColor={errors.email ? errorRed : inputBorder}
                        accentColor={errors.email ? errorRed : brandPink}
                        inputBgColor={inputBg}
                        labelColor={labelColor}
                        textColor={textColor}
                    />

                    <AuthInputField
                        label="Password"
                        isPassword
                        showForgotLink={isSignIn}
                        value={form.password}
                        onChangeText={(val) => handleInputChange('password', val)}
                        borderColor={errors.password ? errorRed : inputBorder}
                        accentColor={errors.password ? errorRed : brandPink}
                        inputBgColor={inputBg}
                        labelColor={labelColor}
                        textColor={textColor}
                    />

                    {/* --- SIGN UP ONLY: CONFIRM PASSWORD --- */}
                    {!isSignIn && (
                        <>
                            <AuthInputField
                                label="Confirm Password"
                                isPassword
                                value={form.confirmPassword}
                                onChangeText={(val) => handleInputChange('confirmPassword', val)}
                                borderColor={errors.confirmPassword ? errorRed : inputBorder}
                                inputBgColor={inputBg}
                                labelColor={labelColor}
                                textColor={textColor}
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
                                    I agree to the <Text style={{ color: brandPink }}>Terms</Text> and <Text style={{ color: brandPink }}>Privacy</Text>
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
                    onPress={handleNavigationTohome}
                    disabled={isButtonDisabled}
                >
                    <Text style={styles.mainBtnText}>
                        {isSignIn ? "Sign In" : "Create Account"}
                    </Text>
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
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 30 },
    row: { flexDirection: 'row', gap: 15 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    checkbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    checkboxText: { fontSize: 13, flex: 1 },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});