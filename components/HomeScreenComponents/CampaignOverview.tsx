import React, { useMemo, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, useColorScheme, useWindowDimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';

type Theme = typeof Colors.light;

export default function CampaignOverview() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { bootstrapData, isBootstrapping } = useAppStore();
    
    // Wire up active campaigns from bootstrap data.
    // The others are stubbed to 0 until the backend provides them.
    const activeCampaigns = bootstrapData?.dashboard?.active_orders_count || 0;
    const totalQrCodes = 0;
    const monthlySpend = 0;
    const totalSpend = 0;

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const formattedMonthlySpend = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(monthlySpend);
    const formattedTotalSpend = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalSpend);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Campaign overview</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.mediaButton} onPress={() => router.push('/homeSubScreens/mymedia')}>
                    <Ionicons name="images-outline" size={isTablet ? 18 : 14} color={theme.tint} />
                    <Text style={styles.mediaButtonText}>My Media</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
                {isBootstrapping && !bootstrapData ? (
                    <ActivityIndicator size="small" color={theme.tint} style={{ marginVertical: 30 }} />
                ) : (
                    <>
                        <View style={styles.row}>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{activeCampaigns}</Text>
                                <Text style={styles.metricLabel}>Active Campaigns</Text>
                            </View>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{totalQrCodes}</Text>
                                <Text style={styles.metricLabel}>Total QR Codes</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{formattedMonthlySpend}</Text>
                                <Text style={styles.metricLabel}>Monthly Spend</Text>
                            </View>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{formattedTotalSpend}</Text>
                                <Text style={styles.metricLabel}>Total Spend</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: Theme) => StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginVertical: isTablet ? 20 : 13,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        ...Typography.h2,
        color: theme.text,
        fontSize: isTablet ? 22 : 16,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${theme.tint}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    mediaButtonText: {
        fontSize: isTablet ? 14 : 12,
        color: theme.tint,
        fontWeight: '600',
    },
    gridContainer: {
        backgroundColor: theme.cardGrid,
        borderRadius: 24,
        padding: isTablet ? 20 : 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },
    card: {
        backgroundColor: theme.cardSurface,
        borderRadius: 16,
        padding: isTablet ? 24 : 14,
        justifyContent: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    fullWidthCard: {
        width: '100%',
        minHeight: isTablet ? 120 : 50,
    },
    halfWidthCard: {
        flex: 1,
        minHeight: isTablet ? 110 : 50,
    },
    metricValue: {
        fontSize: isTablet ? 32 : 20,
        fontWeight: '800',
        color: '#000000',
    },
    metricLabel: {
        fontSize: isTablet ? 16 : 12,
        color: theme.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
});