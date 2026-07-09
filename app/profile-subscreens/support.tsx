import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    useColorScheme,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function ContactSupportScreen() {
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    
    const role = useAuthStore(state => state.role);
    const activeTint = role === 'advertiser' ? theme.tint : theme.brandNavy;

    const handleWhatsApp = async () => {
        // Replace with actual support number
        const phoneNumber = "+2348000000000"; 
        const message = "Hi Get Seen Support, I need some help.";
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                // Fallback if WhatsApp is not installed
                alert("WhatsApp is not installed on this device.");
            }
        } catch (error) {
            console.error("Error opening WhatsApp:", error);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={activeTint} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Contact Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                    How can we help you today? Choose an option below to get in touch with our team.
                </Text>

                <TouchableOpacity 
                    style={[styles.supportCard, { backgroundColor: theme.cardSoft }]}
                    onPress={() => router.push("/profile-subscreens/report")}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconBox,]}>
                        <Ionicons name="bug-outline" size={24} color={activeTint} />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Report a Bug or Issue</Text>
                        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Let us know if something isn't working right.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.supportCard, { backgroundColor: theme.cardSoft }]}
                    onPress={handleWhatsApp}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                        <FontAwesome name="whatsapp" size={26} color="#4CAF50" />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Chat on WhatsApp</Text>
                        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>Get instant help from our live support team.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
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
        paddingVertical: 10 
    },
    backButton: { padding: 5, zIndex: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { 
        flex: 1,
        paddingHorizontal: 24, 
        paddingTop: 20 
    },
    helperText: { 
        fontSize: 15, 
        lineHeight: 22, 
        marginBottom: 30,
        textAlign: 'center'
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 18,
    }
});
