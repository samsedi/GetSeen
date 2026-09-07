import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useWindowDimensions, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';
import { PayoutHistoryData } from '@/hooks/useWallet';

interface WeeklyBreakdownModalProps {
    visible: boolean;
    venueName: string;
    breakdowns: PayoutHistoryData[];
    onClose: () => void;
}

export default function WeeklyBreakdownModal({ visible, venueName, breakdowns, onClose }: WeeklyBreakdownModalProps) {
    const theme = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.background, width: isTablet ? 600 : '95%' }]}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="calendar" size={20} color={theme.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                                Weekly Breakdown - {venueName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Table Headers (Hide on very small screens, or style as cards) */}
                        <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.columnHeader, { flex: 2, color: theme.textSecondary }]}>Period</Text>
                            <Text style={[styles.columnHeader, { flex: 1, color: theme.textSecondary, textAlign: 'center' }]}>Camps</Text>
                            <Text style={[styles.columnHeader, { flex: 1.5, color: theme.textSecondary, textAlign: 'right' }]}>Earnings</Text>
                            <Text style={[styles.columnHeader, { flex: 1, color: theme.textSecondary, textAlign: 'right' }]}>Status</Text>
                        </View>

                        {/* List */}
                        {breakdowns.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textSecondary }}>No data available.</Text>
                        ) : (
                            breakdowns.map((b) => (
                                <View key={b.id} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={[styles.rowTextMain, { color: theme.text }]}>{b.weekStart}</Text>
                                        <Text style={[styles.rowTextSub, { color: theme.textSecondary }]}>{b.weekEnd}</Text>
                                    </View>
                                    <Text style={[styles.rowTextMain, { flex: 1, textAlign: 'center', color: theme.text }]}>
                                        {b.totalCampaigns}
                                    </Text>
                                    <Text style={[styles.rowTextMain, { flex: 1.5, textAlign: 'right', color: theme.text, fontWeight: '700' }]}>
                                        {b.earnings}
                                    </Text>
                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                        <View style={[styles.statusBadge, { backgroundColor: b.status === 'Paid' ? theme.success + '20' : theme.statusWarning + '20' }]}>
                                            <Text style={[styles.statusText, { color: b.status === 'Paid' ? theme.success : theme.statusWarning }]}>
                                                {b.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.brandRed }]} onPress={onClose} activeOpacity={0.8}>
                            <Text style={styles.actionBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 12,
        maxHeight: '85%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        ...Platform.select({ ios: { marginTop: 40 } }), // keep it off top safe area slightly
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        flexShrink: 1,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    columnHeader: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowTextMain: {
        fontSize: 13,
        fontWeight: '500',
    },
    rowTextSub: {
        fontSize: 11,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    }
});
