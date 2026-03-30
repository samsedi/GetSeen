import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    useColorScheme,
    Image, // Fixed: Added Image
    useWindowDimensions // Fixed: Added useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthToggle from '@/components/AuthComponents/AuthToggle';
import AuthInputField from '@/components/AuthComponents/AuthInputField';

export default function AdvertiserAuth() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false); // Checkbox state

    // Fixed: Integrated useWindowDimensions for scaling
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandPink = theme.tint;

    // Fixed: Theme-aware logo selection
    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    // Theme-aware colors to support Dark Mode perfectly
    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const inputBorder = colorScheme === 'dark' ? '#333333' : '#D1D5DB';
    const textColor = theme.text;
    const labelColor = theme.text;

    const handleNavigationTohome =()=>{
        router.push({
            pathname:'/(tabs)/home',
        })
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={brandPink} />
                </TouchableOpacity>

                {/* Fixed: Replaced Text with Image and applied scaling */}
                <Image
                    source={logoSource}
                    style={[
                        styles.logoImage,
                        { width: isTablet ? 130 : 100 }
                    ]}
                    resizeMode="contain"
                />

                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <AuthPromoCard
                    title={isSignIn ? "Welcome Back!" : "Advertise Your Brand"}
                    subtitle={isSignIn ? "Sign in to manage your active campaigns." : "Reach your target audience through our network of high-traffic digital screens. Launch campaigns in minutes and track real-time performance."}
                    bgColor="#2B4373"
                    iconName="megaphone-outline"
                />

                {/* Using a subtle toggle color to match the clean aesthetic */}
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
                            {/* Side-by-Side Name Row */}
                            <View style={styles.row}>
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="First Name"
                                    inputBgColor={inputBg}
                                    borderColor={inputBorder}
                                    labelColor={labelColor}
                                    textColor={textColor}
                                />
                                <AuthInputField
                                    containerStyle={{ flex: 1 }}
                                    label="Last Name"
                                    inputBgColor={inputBg}
                                    borderColor={inputBorder}
                                    labelColor={labelColor}
                                    textColor={textColor}
                                />
                            </View>

                            <AuthInputField
                                label="Phone Number"
                                keyboardType="phone-pad"
                                inputBgColor={inputBg}
                                borderColor={inputBorder}
                                labelColor={labelColor}
                                textColor={textColor}
                            />

                            {/* Dropdown Mockup */}
                            <AuthInputField
                                label="Country"
                                placeholder="Choose Country"
                                editable={false} // Acts like a dropdown selector
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
                        autoCapitalize="none"
                        inputBgColor={inputBg}
                        borderColor={inputBorder}
                        labelColor={labelColor}
                        textColor={textColor}
                        accentColor={brandPink}
                    />

                    <AuthInputField
                        label="Password"
                        isPassword
                        showForgotLink={isSignIn}
                        inputBgColor={inputBg}
                        borderColor={inputBorder}
                        labelColor={labelColor}
                        textColor={textColor}
                        accentColor={brandPink}
                    />

                    {/* --- SIGN UP ONLY: CONFIRM PASSWORD & CHECKBOX --- */}
                    {!isSignIn && (
                        <>
                            <AuthInputField
                                label="Confirm Password"
                                isPassword
                                inputBgColor={inputBg}
                                borderColor={inputBorder}
                                labelColor={labelColor}
                                textColor={textColor}
                            />

                            {/* Custom Terms Checkbox */}
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
                                    I agree to the <Text style={{ color: '#4A5C7F' }}>Terms of Service</Text> and <Text style={{ color: '#4A5C7F' }}>Privacy Policy</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Main Action Button */}
                <TouchableOpacity
                    style={[
                        styles.mainBtn,
                        { backgroundColor: brandPink },
                        (!isSignIn && !agreeTerms) && { opacity: 0.5 }
                    ]}
                    onPress={handleNavigationTohome}
                    disabled={!isSignIn && !agreeTerms} // Prevents click if box isn't checked
                    activeOpacity={0.85}
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
    // Fixed: Added logoImage styling
    logoImage: {
        height: 35,
    },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    formContainer: { marginTop: 30 },
    row: { flexDirection: 'row', gap: 15 },

    // Checkbox Styles
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    checkboxText: { fontSize: 13, flex: 1 },

    mainBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, marginTop: 10 },
    mainBtnText: { color: 'white', fontWeight: '700', fontSize: 16 }
});