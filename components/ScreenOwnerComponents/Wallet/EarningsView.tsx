import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { VenueEarningData } from '@/hooks/useWallet';

interface EarningsViewProps {
    venueEarnings: VenueEarningData[];
}

export function EarningsView({ venueEarnings }: EarningsViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;
    
    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    return (
        <View style={styles.section}>
            {renderSectionTitle("Venue Earnings Summary", styles.sectionTitle, theme)}
            {venueEarnings.length === 0 ? renderEmptyState(styles, theme) : renderVenueList(venueEarnings, styles, theme, ownerTint)}
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

function renderVenueList(venues: VenueEarningData[], styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <>
            {venues.map(venue => renderVenueCard(venue, styles, theme, ownerTint))}
        </>
    );
}

function renderVenueCard(venue: VenueEarningData, styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <View key={venue.id} style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {renderCardHeader(venue, styles, theme, ownerTint)}
            {renderCardStatsGrid(venue, styles, theme)}
            {renderCardFooter(venue, styles, theme, ownerTint)}
        </View>
    );
}

function renderCardHeader(venue: VenueEarningData, styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <View style={styles.cardHeader}>
            <Ionicons name="tv" size={24} color={ownerTint} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{venue.venueName}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{venue.location}</Text>
            </View>
        </View>
    );
}

function renderCardStatsGrid(venue: VenueEarningData, styles: any, theme: AppTheme) {
    return (
        <View style={styles.gridContainer}>
            {renderGridItem("Total Campaigns", venue.totalCampaigns, theme.text, styles, theme)}
            {renderGridItem("Total Earnings", venue.totalEarnings, theme.text, styles, theme)}
            {renderGridItem("Pending Payout", venue.pendingPayout, theme.statusWarning, styles, theme)}
            {renderGridItem("Paid Amount", venue.paidAmount, theme.success, styles, theme)}
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

function renderCardFooter(venue: VenueEarningData, styles: any, theme: AppTheme, ownerTint: string) {
    return (
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Last Payout: <Text style={{ color: theme.text, fontWeight: '600' }}>{venue.lastPayout}</Text>
            </Text>
            {renderActionBtn("Weekly Breakdown", "calendar-outline", styles, ownerTint)}
        </View>
    );
}

function renderActionBtn(label: string, icon: keyof typeof Ionicons.glyphMap, styles: any, tint: string) {
    return (
        <TouchableOpacity style={[styles.actionBtn, { borderColor: tint }]}>
            <Ionicons name={icon} size={14} color={tint} style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: tint }]}>{label}</Text>
        </TouchableOpacity>
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
