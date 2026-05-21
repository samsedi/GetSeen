import { AppTheme, Typography, useAppTheme } from '@/constants/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function DashboardOverview() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const theme = useAppTheme();

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Dashboard Overview</Text>

            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>0</Text>
                        <Text style={styles.metricLabel}>Active Screens</Text>
                    </View>

                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>₦0.00</Text>
                        <Text style={styles.metricLabel}>Total Earnings</Text>
                    </View>
                </View>

                <View style={[styles.row, { marginTop: 12 }]}>
                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>₦0.00</Text>
                        <Text style={styles.metricLabel}>Total Paid</Text>
                    </View>

                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>₦0.00</Text>
                        <Text style={styles.metricLabel}>Pending Payout</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme) => StyleSheet.create({
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
    halfWidthCard: {
        flex: 1,
        minHeight: isTablet ? 110 : 70,
    },
    metricValue: {
        fontSize: isTablet ? 32 : 18,
        fontWeight: '800',
        color: '#11181C',
    },
    metricLabel: {
        fontSize: isTablet ? 16 : 11,
        color: theme.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
});
