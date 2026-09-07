import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { PayoutHistoryData } from '@/hooks/useWallet';
import PaymentReceiptModal from './PaymentReceiptModal';

interface PayoutsViewProps {
    payoutHistory: PayoutHistoryData[];
}

type StatusFilter = 'All' | 'Pending' | 'Paid';

export function PayoutsView({ payoutHistory }: PayoutsViewProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    
    const [selectedPayout, setSelectedPayout] = useState<PayoutHistoryData | null>(null);
    const [isReceiptVisible, setIsReceiptVisible] = useState(false);

    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    const filteredPayouts = useMemo(() => {
        return payoutHistory.filter(payout => {
            const matchesSearch = payout.screenTitle.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || payout.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payoutHistory, searchQuery, statusFilter]);

    const openReceipt = (payout: PayoutHistoryData) => {
        setSelectedPayout(payout);
        setIsReceiptVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Filters Section */}
            <View style={styles.filterSection}>
                <View style={[styles.searchContainer, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search venue"
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.chipsContainer}>
                    {(['All', 'Pending', 'Paid'] as StatusFilter[]).map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.chip,
                                { backgroundColor: statusFilter === status ? theme.brandNavy : theme.cardSoft },
                                statusFilter !== status && { borderWidth: 1, borderColor: theme.border }
                            ]}
                            onPress={() => setStatusFilter(status)}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: statusFilter === status ? '#FFF' : theme.textSecondary }
                            ]}>
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* History Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Payout History</Text>
                {filteredPayouts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No payouts found.</Text>
                    </View>
                ) : (
                    filteredPayouts.map(payout => (
                        <View key={payout.id} style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {renderCardHeader(payout, styles, theme)}
                            {renderCardGrid(payout, styles, theme)}
                            
                            {payout.status === 'Paid' && (
                                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                                    <TouchableOpacity 
                                        style={[styles.actionBtn, { borderColor: theme.border }]} 
                                        onPress={() => openReceipt(payout)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="receipt-outline" size={16} color={theme.success} style={{ marginRight: 6 }} />
                                        <Text style={[styles.actionBtnText, { color: theme.success }]}>View Receipt</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>

            <PaymentReceiptModal 
                visible={isReceiptVisible} 
                payout={selectedPayout} 
                onClose={() => setIsReceiptVisible(false)} 
            />
        </View>
    );
}

function renderCardHeader(payout: PayoutHistoryData, styles: any, theme: AppTheme) {
    const isPaid = payout.status === 'Paid';
    const badgeColor = isPaid ? theme.success : theme.statusWarning;
    return (
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{payout.screenTitle}</Text>
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
            {renderGridItem("Campaigns", payout.totalCampaigns, theme.text, styles, theme)}
            {renderGridItem("Expected", payout.expectedPayoutDate, theme.text, styles, theme)}
            {renderGridItem("Actual", payout.actualPayoutDate || 'Pending', theme.text, styles, theme)}
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
    container: { flex: 1 },
    
    filterSection: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
    },
    chipsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
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
        backgroundColor: '#FFF'
    },
    actionBtnText: { fontSize: 13, fontWeight: '600' }
});
