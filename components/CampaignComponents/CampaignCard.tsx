import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';

// ── Status Colour Map ──
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    approved:  { bg: '#E8F5E9', text: '#2E7D32' },
    active:    { bg: '#E8F5E9', text: '#2E7D32' },
    completed: { bg: '#E3F2FD', text: '#1565C0' },
    pending:   { bg: '#FFF3E0', text: '#EF6C00' },
    scheduled: { bg: '#F3E5F5', text: '#7B1FA2' },
    cancelled: { bg: '#FFEBEE', text: '#C62828' },
    rejected:  { bg: '#FFEBEE', text: '#C62828' },
};

const getStatusColors = (status: string) =>
    STATUS_COLORS[status.toLowerCase()] ?? { bg: '#F5F5F5', text: '#616161' };

export interface CampaignCardItem {
    id: number | string;
    orderNumber: string;
    status: string;
    amountPaid: number;
    itemsCount: number;
    createdAt: string;
    screenTitle?: string;
    duration?: string;
    totalMediaPlay?: number | string;
    onPress?: () => void;
    onSupportPress?: () => void;
    onViewLivePlay?: () => void;
    onExtendDuration?: () => void;
    onReport?: () => void;
    onRelaunch?: () => void;
    onDelete?: () => void;
}

export default function CampaignCard({ item }: { item: CampaignCardItem }) {
    const theme = useAppTheme();
    const colors = getStatusColors(item.status);

    // Format date to something readable
    const formattedDate = (() => {
        try {
            const dateStr = item.createdAt;
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return item.createdAt || 'N/A';
        }
    })();

    // If we have a screen title and there's only 1 item, use it. Otherwise, show "Multiple Screens" if itemsCount > 1.
    const displayTitle = item.screenTitle 
        ? (item.itemsCount > 1 ? `${item.screenTitle} +${item.itemsCount - 1} more` : item.screenTitle)
        : item.orderNumber;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={item.onPress}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
            {/* Left icon block */}
            <View style={[styles.iconBlock, { backgroundColor: colors.bg }]}>
                <Ionicons name="receipt-outline" size={24} color={colors.text} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.statusText, { color: colors.text }]}>
                            {item.status.toLowerCase() === 'approved' ? 'active' : item.status}
                        </Text>
                    </View>
                    <Text style={[styles.price, { color: theme.tint }]}>
                        ₦{item.amountPaid.toLocaleString('en-NG')}
                    </Text>
                </View>

                <Text style={[styles.orderNumber, { color: theme.text }]} numberOfLines={1}>
                    {displayTitle}
                </Text>

                <View style={styles.metaRow}>
                    {item.duration ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {item.duration}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.metaItem}>
                            <Ionicons name="tv-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {item.itemsCount} screen{item.itemsCount !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                    {item.totalMediaPlay !== undefined ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="play-circle-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {Number(item.totalMediaPlay).toLocaleString('en-US')} plays
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {formattedDate}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Active (Approved) Actions */}
                {(item.status.toLowerCase() === 'approved' || item.status.toLowerCase() === 'active') && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.08)' }]} onPress={(e) => { e.stopPropagation(); item.onViewLivePlay?.(); }}>
                            <Ionicons name="eye-outline" size={14} color="#4F46E5" />
                            <Text style={[styles.actionBtnText, { color: '#4F46E5' }]}>View live play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} onPress={(e) => { e.stopPropagation(); item.onExtendDuration?.(); }}>
                            <Ionicons name="calendar-outline" size={14} color="#10B981" />
                            <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Extend duration</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint + '15' }]} onPress={(e) => { e.stopPropagation(); item.onReport?.(); }}>
                            <Ionicons name="stats-chart-outline" size={14} color={theme.tint} />
                            <Text style={[styles.actionBtnText, { color: theme.tint }]}>Report</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Completed Actions */}
                {item.status.toLowerCase() === 'completed' && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)' }]} onPress={(e) => { e.stopPropagation(); item.onRelaunch?.(); }}>
                            <Ionicons name="refresh-outline" size={14} color="#10B981" />
                            <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Relaunch campaign</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint + '15' }]} onPress={(e) => { e.stopPropagation(); item.onReport?.(); }}>
                            <Ionicons name="stats-chart-outline" size={14} color={theme.tint} />
                            <Text style={[styles.actionBtnText, { color: theme.tint }]}>Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint + '15', paddingHorizontal: 12 }]} onPress={(e) => { e.stopPropagation(); item.onDelete?.(); }}>
                            <Ionicons name="trash-outline" size={16} color={theme.tint} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Cancelled / Rejected Actions */}
                {(item.status.toLowerCase() === 'cancelled' || item.status.toLowerCase() === 'rejected') && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { borderColor: theme.tint, backgroundColor: theme.tint + '15' }]}
                            activeOpacity={0.7}
                            onPress={(e) => {
                                e.stopPropagation();
                                item.onSupportPress?.();
                            }}
                        >
                            <Ionicons name="headset-outline" size={14} color={theme.tint} />
                            <Text style={[styles.actionBtnText, { color: theme.tint }]}>Contact support</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.moreBtn} onPress={item.onPress}>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconBlock: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    price: {
        fontSize: 13,
        fontWeight: '900',
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    moreBtn: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
    actionRow: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 30,
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: 11,
        fontWeight: '700',
    }
});