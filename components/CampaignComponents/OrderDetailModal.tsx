import reviewApi from '@/api/reviewService';
import { useAppTheme } from '@/constants/theme';
import { useOrderStore } from '@/store/useOrderStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeaveReviewModal from '../ReviewComponents/LeaveReviewModal';

interface OrderDetailModalProps {
    visible: boolean;
    onClose: () => void;
    orderId: number | null;
}

export default function OrderDetailModal({ visible, onClose, orderId }: OrderDetailModalProps) {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const { orders, enrichedOrders, isFetchingOrder, fetchOrderById } = useOrderStore();

    const summaryOrder = orders.find(o => o.id === orderId);
    const detailOrder = orderId ? enrichedOrders[orderId] : null;

    // Review state
    const [reviewStatus, setReviewStatus] = React.useState<any>(null);
    const [checkingReview, setCheckingReview] = React.useState(false);
    const [leaveReviewVisible, setLeaveReviewVisible] = React.useState(false);

    useEffect(() => {
        if (visible && orderId) {
            if (!detailOrder && !isFetchingOrder) {
                fetchOrderById(orderId);
            }

            const checkReviewStatus = async () => {
                const order = detailOrder || summaryOrder;
                if (order?.status.toLowerCase() === 'completed') {
                    setCheckingReview(true);
                    try {
                        const res = await reviewApi.getOrderReviewStatus(orderId);
                        setReviewStatus(res.review);
                    } catch (e) {
                        console.log("Failed to fetch review status", e);
                    } finally {
                        setCheckingReview(false);
                    }
                } else {
                    setReviewStatus(null);
                }
            };
            checkReviewStatus();
        }
    }, [visible, orderId, detailOrder]);

    if (!visible || !orderId) return null;

    // Use detailOrder if available, fallback to summaryOrder
    const orderData = detailOrder || summaryOrder;
    if (!orderData) return null;

    const formattedDate = (() => {
        try {
            const dateStr = summaryOrder?.created_at || (orderData as any).createdAt;
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return summaryOrder?.created_at || 'N/A';
        }
    })();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return '#2E7D32';
            case 'completed': return '#1565C0';
            case 'pending': return '#EF6C00';
            case 'scheduled': return '#7B1FA2';
            case 'cancelled':
            case 'rejected': return '#C62828';
            default: return '#616161';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return '#E8F5E9';
            case 'completed': return '#E3F2FD';
            case 'pending': return '#FFF3E0';
            case 'scheduled': return '#F3E5F5';
            case 'cancelled':
            case 'rejected': return '#FFEBEE';
            default: return '#F5F5F5';
        }
    };

    const statusColor = getStatusColor(orderData.status);
    const statusBg = getStatusBg(orderData.status);

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>
                                {orderData.order_number}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                                <Text style={[styles.statusText, { color: statusColor }]}>{orderData.status}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.card }]} onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Summary Section */}
                        <View style={[styles.summaryBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Amount Paid</Text>
                                <Text style={[styles.summaryValue, { color: theme.tint }]}>
                                    ₦{Number(orderData.amount_paid).toLocaleString('en-NG')}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Date Placed</Text>
                                <Text style={[styles.summaryValue, { color: theme.text }]}>{formattedDate}</Text>
                            </View>
                            {summaryOrder?.transaction_ref && (
                                <View style={styles.summaryRow}>
                                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Ref</Text>
                                    <Text style={[styles.summaryValue, { color: theme.text, fontSize: 11 }]} numberOfLines={1}>
                                        {summaryOrder.transaction_ref}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>

                        {/* Items Section */}
                        {!detailOrder ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={theme.tint} />
                                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading items...</Text>
                            </View>
                        ) : detailOrder.items.length === 0 ? (
                            <View style={[styles.emptyBox, { borderColor: theme.border }]}>
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No items found in this order.</Text>
                            </View>
                        ) : (
                            detailOrder.items.map((item, index) => (
                                <View key={item.id || index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <View style={styles.itemHeader}>
                                        <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>
                                            {item.screen_title}
                                        </Text>
                                        <Text style={[styles.itemPrice, { color: theme.text }]}>
                                            ₦{Number(item.price).toLocaleString('en-NG')}
                                        </Text>
                                    </View>

                                    <View style={styles.itemMetaRow}>
                                        <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                                        <Text style={[styles.itemMetaText, { color: theme.textSecondary }]}>
                                            {item.start_date} to {item.end_date}
                                        </Text>
                                    </View>

                                    <View style={styles.itemMetaRow}>
                                        <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                                        <Text style={[styles.itemMetaText, { color: theme.textSecondary, textTransform: 'capitalize' }]}>
                                            {item.duration}
                                        </Text>
                                        <Text style={{ color: theme.textSecondary, marginHorizontal: 6 }}>•</Text>
                                        <Ionicons name="images-outline" size={14} color={theme.textSecondary} />
                                        <Text style={[styles.itemMetaText, { color: theme.textSecondary, textTransform: 'capitalize' }]}>
                                            {item.media_type}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}

                        {/* Review Section */} 
                        {orderData.status.toLowerCase() === 'completed' && (
                            <View style={styles.reviewSection}>
                                {checkingReview ? (
                                    <ActivityIndicator size="small" color={theme.tint} />
                                ) : reviewStatus?.can_review && !reviewStatus?.has_review ? (
                                    <TouchableOpacity
                                        style={[styles.reviewBtn, { backgroundColor: theme.tint }]}
                                        onPress={() => setLeaveReviewVisible(true)}
                                    >
                                        <Ionicons name="star" size={20} color="#FFF" />
                                        <Text style={styles.reviewBtnText}>Leave a Review</Text>
                                    </TouchableOpacity>
                                ) : reviewStatus?.has_review ? (
                                    <View style={[styles.hasReviewBox, { backgroundColor: theme.tint + '15' }]}>
                                        <Ionicons name="checkmark-circle" size={20} color={theme.tint} />
                                        <Text style={[styles.hasReviewText, { color: theme.tint }]}>You have reviewed this order</Text>
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </ScrollView>

                </View>
            </View>

            <LeaveReviewModal
                visible={leaveReviewVisible}
                orderId={orderId}
                onClose={() => setLeaveReviewVisible(false)}
                onSuccess={() => {
                    setLeaveReviewVisible(false);
                    // Refresh review status locally
                    setReviewStatus((prev: any) => ({ ...prev, has_review: true }));
                }}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    summaryBox: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        marginBottom: 24,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyBox: {
        padding: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    itemTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '800',
        lineHeight: 22,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '900',
    },
    itemMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    itemMetaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    reviewSection: {
        marginTop: 24,
        alignItems: 'center',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    reviewBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    hasReviewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    hasReviewText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});
