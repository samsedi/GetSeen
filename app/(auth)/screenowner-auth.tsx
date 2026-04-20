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

const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    company: /^[a-zA-Z0-9\s]{2,}$/
};

export default function VenueOwnerAuth() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const [form, setForm] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        companyName: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandBlue = '#2B4373';
    const errorRed = '#FF3B30';
    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';

    const handleInputChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        let isValid = true;
        if (value.length > 0) {
            if (field === 'email') isValid = REGEX.email.test(value);
            else if (field === 'password') isValid = REGEX.password.test(value);
            else if (field === 'companyName') isValid = REGEX.company.test(value);
            else if (field === 'confirmPassword') isValid = value === form.password;
        }
        setErrors(prev => ({ ...prev, [field]: !isValid }));
    };

    const handlePress = () => {
        if (isForgotPassword) {
            setIsForgotPassword(false);
        } else {
            router.push('/(tabs)/home');
        }
    };

    // --- UPDATED PROMO LOGIC ---
    const getPromoContent = () => {
        if (isForgotPassword) {
            return {
                title: "Forgot Password?",
                subtitle: "Enter your registered vendor email to receive a reset link.",
                icon: "lock-open-outline"
            };
        }
        if (isSignIn) {
            return {
                title: "Welcome Back!",
                subtitle: "Sign in to continue earning with screens in your venues.",
                icon: "tv-outline"
            };
        }
        return {
            title: "Monetize Your Venue",
            subtitle: "Earn revenue by hosting digital screens in your location. Manage screens and track earnings.",
            icon: "tv-outline"
        };
    };

    const promo = getPromoContent();

    const isButtonDisabled = isSignIn
        ? (!form.email || !form.password)
        : (!form.companyName || !form.email || !form.password || !agreeTerms);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={brandBlue} />
                </TouchableOpacity>
                <Image
                    source={colorScheme === 'dark' ? require('@/assets/images/getseen-dark-removebg-preview.png') : require('@/assets/images/getseen-light-removebg-preview.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AuthPromoCard
                    title={promo.title}
                    subtitle={promo.subtitle}
                    bgColor='#D11243'

                    iconName={promo.icon as any}
                />

                {!isForgotPassword && (
                    <AuthToggle
                        isSignIn={isSignIn}
                        onToggle={setIsSignIn}
                        activeColor={brandBlue}

                        bgColor={colorScheme === 'dark' ? '#222' : '#F3F4F6'}
                    />
                )}

                <View style={styles.formContainer}>
                    {isForgotPassword ? (
                        <AuthInputField
                            label="Email Address"
                            placeholder="Enter your vendor email"
                            inputBgColor={inputBg}
                            value={form.email}
                            onChangeText={(v) => handleInputChange('email', v)}

                        />
                    ) : (
                        <>
                            {!isSignIn && (
                                <AuthInputField
                                    label="Company Name"
                                    placeholder="e.g. Silverbird Cinemas"
                                    value={form.companyName}
                                    inputBgColor={inputBg}
                                    onChangeText={(v) => handleInputChange('companyName', v)}
                                    borderColor={errors.companyName ? errorRed : '#D1D5DB'}
                                />
                            )}
                            <AuthInputField
                                label="Email Address"
                                value={form.email}
                                onChangeText={(v) => handleInputChange('email', v)}
                                borderColor={errors.email ? errorRed : '#D1D5DB'}
                                inputBgColor={inputBg}
                            />
                            <AuthInputField
                                label="Password"
                                isPassword
                                showForgotLink={isSignIn}
                                value={form.password}
                                inputBgColor={inputBg}
                                onChangeText={(v) => handleInputChange('password', v)}
                                onForgotPress={() => setIsForgotPassword(true)}
                                borderColor={errors.password ? errorRed : '#D1D5DB'}
                                accentColor={brandBlue}
                            />
                            {!isSignIn && (
                                <>
                                    <AuthInputField
                                        label="Confirm Password"
                                        isPassword
                                        value={form.confirmPassword}
                                        inputBgColor={inputBg}
                                        onChangeText={(v) => handleInputChange('confirmPassword', v)}
                                        borderColor={errors.confirmPassword ? errorRed : '#D1D5DB'}
                                    />
                                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setAgreeTerms(!agreeTerms)}>
                                        <View style={[
                                            styles.checkbox,
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
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.mainBtn,
                        { backgroundColor: brandBlue },
                        isButtonDisabled && { opacity: 0.5 }
                    ]}
                    onPress={handlePress}
                    disabled={isButtonDisabled}
                >
                    <Text style={styles.mainBtnText}>
                        {isForgotPassword ? "Send Reset Link" : isSignIn ? "Sign In" : "Create Account"}
                    </Text>
                </TouchableOpacity>

                {isForgotPassword && (
                    <TouchableOpacity onPress={() => setIsForgotPassword(false)} style={styles.backLink}>
                        <Ionicons name="arrow-back" size={16} color={brandBlue} />
                        <Text style={{ color: brandBlue, fontWeight: '600' }}> Back to Login</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
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
    checkbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderColor: '#D1D5DB' },
    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    backLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }
});