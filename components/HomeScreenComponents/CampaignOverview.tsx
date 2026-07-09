import React, { useMemo, useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, useColorScheme, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';
import { fetchDashboardStats, DashboardStats } from '@/api/campaignService';

type Theme = typeof Colors.light;

export default function CampaignOverview() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const hasFetchedRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (hasFetchedRef.current) return;
            const loadStats = async () => {
                try {
                    const data = await fetchDashboardStats();
                    setStats(data);
                    hasFetchedRef.current = true;
                } catch (error) {
                    console.error("Failed to load dashboard stats", error);
                } finally {
                    setLoading(false);
                }
            };
            loadStats();
        }, [])
    );

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const formattedMonthlySpend = stats 
        ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats.monthlySpend || 0)
        : '₦0.00';

    const formattedTotalSpend = stats 
        ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats.totalSpend || 0)
        : '₦0.00';

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Campaign overview</Text>

            <View style={styles.gridContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color={theme.tint} style={{ marginVertical: 30 }} />
                ) : (
                    <>
                        <View style={styles.row}>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{stats?.activeCampaigns || 0}</Text>
                                <Text style={styles.metricLabel}>Active Campaigns</Text>
                            </View>
                            <View style={[styles.card, styles.halfWidthCard]}>
                                <Text style={styles.metricValue}>{stats?.totalQrCodes || 0}</Text>
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
    sectionTitle: {
        ...Typography.h2,
        color: theme.text,
        marginBottom: 10,
        fontSize: isTablet ? 22 : 16,
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