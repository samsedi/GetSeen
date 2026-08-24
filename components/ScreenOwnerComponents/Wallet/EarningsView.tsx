import React, { useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { EarningsSummary } from '@/hooks/useWallet';

interface EarningsViewProps {
    earningsSummary: EarningsSummary;
}

export function EarningsView({ earningsSummary }: EarningsViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;

    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    const hasEarnings = earningsSummary.totalEarningsRaw > 0;

    return (
        <View style={styles.section}>
            {renderSectionTitle("Earnings Summary", styles.sectionTitle, theme)}
            {hasEarnings ? renderSummaryCard(earningsSummary, styles, theme, ownerTint) : renderEmptyState(styles, theme)}
        </View>
    );
}

function renderSectionTitle(title: string, style: any, theme: AppTheme) {
    return <Text style={[style, { color: theme.text }]}>{title}</Text>;
}

function renderEmptyState(styles: any, theme: AppTheme) {
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No earnings generated yet.</Text>
        </View>
    );
}

function renderSummaryCard(summary: EarningsSummary, styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <View style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {renderCardHeader(styles, theme, ownerTint)}
            {renderCardStatsGrid(summary, styles, theme)}
        </View>
    );
}

function renderCardHeader(styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={24} color={ownerTint} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>Earnings Overview</Text>
            </View>
        </View>
    );
}

function renderCardStatsGrid(summary: EarningsSummary, styles: any, theme: AppTheme) {
    return (
        <View style={styles.gridContainer}>
            {renderGridItem("Total Earnings", summary.totalEarnings, theme.text, styles, theme)}
            {renderGridItem("Pending Payout", summary.pendingPayout, theme.statusWarning, styles, theme)}
            {renderGridItem("Paid Amount", summary.totalPaid, theme.success, styles, theme)}
        </View>
    );
}

function renderGridItem(label: string, value: string | number, valueColor: string, styles: any, theme: AppTheme) {
    return (
        <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.gridValue, { color: valueColor }]}>{value}</Text>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, ownerTint: string) => StyleSheet.create({
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { ...Typography.h3, fontWeight: '800', marginBottom: 16 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
    dataCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    cardSubtitle: { fontSize: 13 },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    gridItem: {
        width: '50%',
        marginBottom: 12,
    },
    gridLabel: { fontSize: 12, marginBottom: 4 },
    gridValue: { fontSize: 15, fontWeight: '700' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: theme.background,
    },
    footerText: { fontSize: 13 },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    actionBtnText: { fontSize: 13, fontWeight: '600' }
});
