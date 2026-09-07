import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { EarningsSummary, VenueEarningsData } from '@/hooks/useWallet';
import { TimeFilterPreset } from '@/utils/dateFilters';
import WeeklyBreakdownModal from './WeeklyBreakdownModal';

interface EarningsViewProps {
    earningsSummary: EarningsSummary;
    venueEarnings: VenueEarningsData[];
    timeFilter: TimeFilterPreset;
    setTimeFilter: (filter: TimeFilterPreset) => void;
}

export function EarningsView({ earningsSummary, venueEarnings, timeFilter, setTimeFilter }: EarningsViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;

    const [selectedVenue, setSelectedVenue] = useState<VenueEarningsData | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    const hasEarnings = earningsSummary.totalEarningsRaw > 0;

    const openBreakdown = (venue: VenueEarningsData) => {
        setSelectedVenue(venue);
        setIsModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Global Summary */}
            <View style={styles.section}>
                {renderSectionTitle("Earnings Overview", styles.sectionTitle, theme)}
                {hasEarnings ? renderSummaryCard(earningsSummary, styles, theme, ownerTint) : renderEmptyState(styles, theme)}
            </View>

            {/* Venue Summaries */}
            <View style={styles.section}>
                {renderSectionTitle("Venue Earnings Summary", styles.sectionTitle, theme)}
                
                {/* Time Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {(['All Time', 'Last 30 Days', 'This Month', 'Last Month', 'This Quarter', 'This Year'] as TimeFilterPreset[]).map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.chip,
                                { backgroundColor: timeFilter === filter ? theme.brandNavy : theme.cardSoft },
                                timeFilter !== filter && { borderWidth: 1, borderColor: theme.border }
                            ]}
                            onPress={() => setTimeFilter(filter)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: timeFilter === filter ? '#FFF' : theme.textSecondary }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {venueEarnings.length === 0 ? (
                    <Text style={{ color: theme.textSecondary, marginTop: 8 }}>No venue earnings to display.</Text>
                ) : (
                    venueEarnings.map((venue, index) => (
                        <View key={index} style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {/* Venue Header */}
                            <View style={styles.cardHeader}>
                                <Ionicons name="location" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                    {venue.venueName}
                                </Text>
                            </View>
                            
                            {/* Stats Grid */}
                            <View style={styles.gridContainer}>
                                {renderGridItem("Total Campaigns", venue.totalCampaigns, theme.text, styles, theme)}
                                {renderGridItem("Pending Payout", venue.pendingPayout, theme.statusWarning, styles, theme)}
                                {renderGridItem("Paid Amount", venue.paidAmount, theme.success, styles, theme)}
                                {renderGridItem("Total Earnings", venue.totalEarnings, theme.text, styles, theme)}
                                {renderGridItem("Last Payout", venue.lastPayoutDate || 'N/A', theme.textSecondary, styles, theme)}
                            </View>

                            {/* Action Footer */}
                            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { borderColor: theme.border }]}
                                    onPress={() => openBreakdown(venue)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={theme.text} style={{ marginRight: 6 }} />
                                    <Text style={[styles.actionBtnText, { color: theme.text }]}>Weekly Breakdown</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {selectedVenue && (
                <WeeklyBreakdownModal 
                    visible={isModalVisible}
                    venueName={selectedVenue.venueName}
                    breakdowns={selectedVenue.weeklyBreakdowns}
                    onClose={() => setIsModalVisible(false)}
                />
            )}
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
        <View style={[styles.dataCard, { backgroundColor: theme.brandNavy, borderColor: theme.border, marginBottom: 8 }]}>
            <View style={[styles.cardHeader, { borderBottomWidth: 0 }]}>
                <Ionicons name="wallet" size={24} color="#FFF" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: '#FFF' }]}>All-Time Total</Text>
                </View>
            </View>
            <View style={styles.gridContainer}>
                {renderGridItem("Total Earnings", summary.totalEarnings, "#FFF", styles, theme, "#FFFFFFCC")}
                {renderGridItem("Pending Payout", summary.pendingPayout, "#FFD700", styles, theme, "#FFFFFFCC")}
                {renderGridItem("Paid Amount", summary.totalPaid, "#4ADE80", styles, theme, "#FFFFFFCC")}
            </View>
        </View>
    );
}

function renderGridItem(label: string, value: string | number, valueColor: string, styles: any, theme: AppTheme, overrideLabelColor?: string) {
    return (
        <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: overrideLabelColor || theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.gridValue, { color: valueColor }]}>{value}</Text>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, ownerTint: string) => StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 40,
    },
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
    cardTitle: { fontSize: 16, fontWeight: '700' },
    
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
        padding: 12,
        paddingHorizontal: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: theme.background
    },
    actionBtnText: { fontSize: 13, fontWeight: '600' },
    
    filterScroll: {
        marginBottom: 16,
        marginHorizontal: -20, // Negative margin to allow full-bleed scroll
    },
    filterScrollContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        height: 36,
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
