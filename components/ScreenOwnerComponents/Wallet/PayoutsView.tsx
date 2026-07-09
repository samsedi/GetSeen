import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { PayoutHistoryData } from '@/hooks/useWallet';

interface PayoutsViewProps {
    payoutHistory: PayoutHistoryData[];
}

export function PayoutsView({ payoutHistory }: PayoutsViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;

    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    return (
        <View style={styles.container}>
            {renderHistorySection(payoutHistory, styles, theme)}
        </View>
    );
}


function renderHistorySection(payoutHistory: PayoutHistoryData[], styles: any, theme: AppTheme) {
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payout History</Text>
            {payoutHistory.length === 0 ? renderEmptyState(styles, theme) : payoutHistory.map(payout => renderPayoutCard(payout, styles, theme))}
        </View>
    );
}

function renderEmptyState(styles: any, theme: AppTheme) {
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No payout history.</Text>
        </View>
    );
}

function renderPayoutCard(payout: PayoutHistoryData, styles: any, theme: AppTheme) {
    return (
        <View key={payout.id} style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {renderCardHeader(payout, styles, theme)}
            {renderCardGrid(payout, styles, theme)}
            {renderCardFooter(styles, theme)}
        </View>
    );
}

function renderCardHeader(payout: PayoutHistoryData, styles: any, theme: AppTheme) {
    const isPaid = payout.status === 'Paid';
    const badgeColor = isPaid ? theme.success : (payout.status === 'Processing' ? theme.tint : theme.statusWarning);
    return (
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{payout.venueName}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                    {payout.weekStart} - {payout.weekEnd}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badgeColor + '20' }]}>
                <Text style={[styles.statusText, { color: badgeColor }]}>{payout.status}</Text>
            </View>
        </View>
    );
}

function renderCardGrid(payout: PayoutHistoryData, styles: any, theme: AppTheme) {
    return (
        <View style={styles.gridContainer}>
            {renderGridItem("Earnings", payout.earnings, theme.success, styles, theme)}
            {renderGridItem("Campaigns", payout.campaigns, theme.text, styles, theme)}
            {renderGridItem("Expected", payout.expectedPayout, theme.text, styles, theme)}
            {renderGridItem("Actual", payout.actualPayout, theme.text, styles, theme)}
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

function renderCardFooter(styles: any, theme: AppTheme) {
    return (
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.success }]}>
                <Ionicons name="receipt-outline" size={14} color={theme.success} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: theme.success }]}>Receipt</Text>
            </TouchableOpacity>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, ownerTint: string) => StyleSheet.create({
    container: { flex: 1 },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { ...Typography.h3, fontWeight: '800', marginBottom: 16 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 12, fontSize: 16, fontWeight: '500' },
    
    bankDetailsContainer: {
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        marginTop: 10,
    },
    bankDetailsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    bankTitle: { fontSize: 14, fontWeight: '700' },
    bankSubtitle: { fontSize: 13, marginTop: 2 },
    editBtn: { fontSize: 14, fontWeight: '600', padding: 8 },
    withdrawBtn: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    withdrawBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    
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
    
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: { fontSize: 12, fontWeight: '700' },
    
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: theme.background,
    },
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
