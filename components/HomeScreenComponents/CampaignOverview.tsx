import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type Theme = typeof Colors.light;

export default function CampaignOverview() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Campaign overview</Text>

            <View style={styles.gridContainer}>
                <View style={[styles.card, styles.fullWidthCard]}>
                    <Text style={styles.metricValue}>0</Text>
                    <Text style={styles.metricLabel}>Active Campaigns</Text>
                </View>

                <View style={styles.row}>
                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>5</Text>
                        <Text style={styles.metricLabel}>Total QR Codes</Text>
                    </View>

                    <View style={[styles.card, styles.halfWidthCard]}>
                        <Text style={styles.metricValue}>₦0.00</Text>
                        <Text style={styles.metricLabel}>Monthly Spend</Text>
                    </View>
                </View>
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
        color: '#11181C',
    },
    metricLabel: {
        fontSize: isTablet ? 16 : 12,
        color: '#687076',
        marginTop: 4,
        fontWeight: '500',
    },
});