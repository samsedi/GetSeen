import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    useColorScheme,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';

import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';
import AuthInputField from '@/components/AuthComponents/AuthInputField';

export default function ForgotPassword() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const brandPink = theme.tint;


    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    const inputBg = colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF';
    const inputBorder = colorScheme === 'dark' ? '#333333' : '#D1D5DB';
    const textColor = theme.text;
    const labelColor = theme.text;

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

                {/* --- THE BRAND LOGO --- */}
                <Image
                    source={logoSource}
                    style={[
                        styles.logoImage,
                        { width: isTablet ? 150 : 120 }
                    ]}
                    contentFit="contain"
                />


                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <AuthPromoCard
                    title="Reset Password"
                    subtitle="Enter the email address associated with your account, and we'll send you a secure link to reset your password."
                    bgColor="#4A5C7F"
                    iconName="lock-closed-outline"
                />

                <View style={styles.formContainer}>
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

                    <TouchableOpacity
                        style={[styles.mainBtn, { backgroundColor: brandPink }]}
                        onPress={() => {
                            console.log("Reset link sent!");
                            router.back();
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.mainBtnText}>Send Reset Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backToLoginBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                            Remember your password?
                            <Text style={{ color: brandPink, fontWeight: '700' }}>Sign In</Text>
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
        paddingVertical: 10,
        height: 60,
    },
    backButton: {
        padding: 5,
        width: 40,
    },
    logoImage: {
        height: 35,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    formContainer: {
        marginTop: 40
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