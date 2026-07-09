import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useColorScheme,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import { useAlertStore } from '@/store/useAlertStore';

import { useAppTheme } from '@/constants/theme';

export default function ReceiptScreen() {
    const router = useRouter();
    const { reference, amount } = useLocalSearchParams<{ reference: string, amount: string }>();

    // Theme Detection
    const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
    const theme = useAppTheme();
    const blurTint = colorScheme === 'dark' ? 'dark' : 'light';
    const glassBorder = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)';
    
    const styles = useMemo(() => createStyles(theme, blurTint, glassBorder), [theme, blurTint, glassBorder]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconBackground}>
                    <Ionicons name="checkmark" size={48} color={theme.success} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Payment Successful</Text>
                <Text style={styles.subtitle}>Your campaign has been successfully booked.</Text>

                {/* Receipt Card */}
                <View style={styles.cardWrapper}>
                    <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint={blurTint} style={styles.receiptCard}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Amount Paid</Text>
                            <Text style={styles.valueLarge}>
                                ₦{Number(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        
                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.label}>Transaction Ref</Text>
                            <TouchableOpacity 
                                style={styles.copyRow}
                                onPress={async () => {
                                    if (reference) {
                                        await Clipboard.setStringAsync(reference);
                                        useAlertStore.getState().showAlert('Copied', 'Transaction reference copied to clipboard!');
                                    }
                                }}
                            >
                                <Text style={styles.valueSmall}>
                                    {reference ? `${reference.substring(0, 8)}...` : 'N/A'}
                                </Text>
                                <Ionicons name="copy-outline" size={16} color={theme.tint} style={{ marginLeft: 6 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Completed</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>
            </View>

            {/* Action Button */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => router.replace('/(tabs)/home')}
                >
                    <Text style={styles.primaryButtonText}>Return to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: any, blurTint: 'light'|'dark', glassBorder: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: theme.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    cardWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: glassBorder,
    },
    receiptCard: {
        padding: 20,
        backgroundColor: Platform.OS === 'android' ? (blurTint === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)') : 'transparent',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: glassBorder,
        marginVertical: 6,
    },
    label: {
        fontSize: 14,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    valueLarge: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
    },
    valueSmall: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text,
    },
    copyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: 'rgba(52, 199, 89, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: theme.success,
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 10 : 24,
    },
    primaryButton: {
        backgroundColor: theme.tint,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: theme.tint,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
