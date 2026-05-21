import {useState} from "react";
import { useAppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authApi from '@/api/authService';

import AuthInputField from '@/components/AuthComponents/AuthInputField';
import AuthPromoCard from '@/components/AuthComponents/AuthPromoCard';

export default function ForgotPasswordScreenOwner() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const router = useRouter();

    const brandBlue = theme.brandNavy;

    const handleSendResetLink = async () => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            Alert.alert("Required", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            await authApi.forgotPassword(cleanEmail);
            Alert.alert(
                "Link Sent",
                "If an account exists for this email, we have sent a password reset link. Please check your inbox.",
                [{ text: "Back to Sign In", onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.log("Forgot Password Error:", error.response?.data);
            const data = error.response?.data;
            const errorMsg = data?.message || data?.error || "Unable to process request.";
            Alert.alert("Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const logoSource = colorScheme === 'dark'
        ? require('@/assets/images/getseen-dark-removebg-preview.png')
        : require('@/assets/images/getseen-light-removebg-preview.png');

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={brandBlue} />
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
                    title="Reset Password"
                    subtitle="Enter the email address linked to your venue account and we'll send you a secure reset link."
                    bgColor={theme.promoPink}
                    iconName="tv-outline"
                />

                <View style={styles.formContainer}>
                    <AuthInputField
                        label="Email Address"
                        placeholder="name@venuebusiness.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        accentColor={brandBlue}
                        value={email}
                        onChangeText={setEmail}
                        editable={!isLoading}
                    />

                    <TouchableOpacity
                        style={[styles.mainBtn, { backgroundColor: brandBlue, opacity: isLoading ? 0.6 : 1 }]}
                        onPress={handleSendResetLink}
                        activeOpacity={0.85}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.mainBtnText}>Send Reset Link</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backToLoginBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                            Remember your password?{' '}
                            <Text style={{ color: brandBlue, fontWeight: '700' }}>Sign In</Text>
                        </Text>
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
