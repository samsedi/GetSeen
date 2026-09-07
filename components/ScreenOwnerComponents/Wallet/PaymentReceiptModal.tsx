import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, Typography } from '@/constants/theme';
import { PayoutHistoryData } from '@/hooks/useWallet';
import { useAuthStore } from '@/store/authStore';

interface PaymentReceiptModalProps {
    visible: boolean;
    payout: PayoutHistoryData | null;
    onClose: () => void;
}

export default function PaymentReceiptModal({ visible, payout, onClose }: PaymentReceiptModalProps) {
    const theme = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const user = useAuthStore(state => state.user);

    if (!payout) return null;

    const vendorName = user?.vendor_name || user?.name || 'Unknown Vendor';
    // Using ID as Reference since it's the closest we have
    const reference = `#${payout.id}`;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.background, width: isTablet ? 500 : '90%' }]}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="receipt" size={20} color={theme.text} style={{ marginRight: 8 }} />
                            <Text style={[styles.title, { color: theme.text }]}>Payment Receipt</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        
                        <View style={styles.centerSection}>
                            <Text style={[styles.mainHeading, { color: theme.text }]}>PAYMENT RECEIPT</Text>
                            <Text style={[styles.reference, { color: theme.textSecondary }]}>Reference: {reference}</Text>
                        </View>

                        <View style={styles.detailsContainer}>
                            <DetailRow label="Date:" value={payout.actualPayoutDate || payout.expectedPayoutDate} theme={theme} />
                            <DetailRow label="Vendor:" value={vendorName} theme={theme} />
                            <DetailRow label="Venue:" value={payout.screenTitle} theme={theme} />
                            <DetailRow label="Period:" value={`${payout.weekStart} - ${payout.weekEnd}`} theme={theme} />
                            <DetailRow label="Campaigns:" value={payout.totalCampaigns.toString()} theme={theme} />
                        </View>

                        <View style={[styles.totalRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount:</Text>
                            <Text style={[styles.totalValue, { color: theme.success }]}>{payout.earnings}</Text>
                        </View>

                        <View style={[styles.successBanner, { backgroundColor: theme.success + '15', borderColor: theme.success + '40' }]}>
                            <Ionicons name="checkmark-circle" size={18} color={theme.success} style={{ marginRight: 6 }} />
                            <Text style={[styles.successText, { color: theme.success }]}>
                                Payment completed successfully on {payout.actualPayoutDate || payout.expectedPayoutDate}.
                            </Text>
                        </View>

                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.brandRed }]} onPress={onClose} activeOpacity={0.8}>
                            <Text style={styles.actionBtnText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.brandNavy }]} activeOpacity={0.8}>
                            <Ionicons name="print" size={16} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.actionBtnText}>Print</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function DetailRow({ label, value, theme }: { label: string, value: string, theme: any }) {
    return (
        <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.text }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: theme.textSecondary }]} numberOfLines={2}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 12,
        maxHeight: '90%',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
    },
    centerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    mainHeading: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    reference: {
        fontSize: 14,
    },
    detailsContainer: {
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        flex: 2,
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    successText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    }
});
