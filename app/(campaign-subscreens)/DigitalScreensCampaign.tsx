import { OrderStatus } from '@/api/orderService';
import CampaignCard, { CampaignCardItem } from '@/components/CampaignComponents/CampaignCard';
import OrderDetailModal from '@/components/CampaignComponents/OrderDetailModal';
import SupportModal from '@/components/CampaignComponents/SupportModal';
import CampaignSelectionType from '@/components/CampaignComponents/CampaignSelectionType';
import BulkScheduleModal from '@/components/CampaignComponents/BulkScheduleModal';
import { Typography, useAppTheme } from '@/constants/theme';
import { useOrderStore } from '@/store/useOrderStore';
import { useAlertStore } from '@/store/useAlertStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const ORDER_TABS: { id: OrderStatus; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'layers-outline' },
    { id: 'approved', label: 'Active', icon: 'play-circle-outline' },
    { id: 'pending', label: 'Pending', icon: 'time-outline' },
    { id: 'scheduled', label: 'Scheduled', icon: 'calendar-outline' },
    { id: 'completed', label: 'Completed', icon: 'flag-outline' },
    { id: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
    { id: 'rejected', label: 'Rejected', icon: 'ban-outline' },
];

export default function DigitalScreensCampaign() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [selectedOrderId, setSelectedOrderId] = React.useState<number | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);

    // Support Modal state
    const [supportModalVisible, setSupportModalVisible] = React.useState(false);
    const [supportStatusContext, setSupportStatusContext] = React.useState<'cancelled' | 'rejected'>('cancelled');

    // Campaign Type Modal state
    const [campaignTypeModalVisible, setCampaignTypeModalVisible] = React.useState(false);

    // Bulk Schedule Modal state
    const [bulkScheduleVisible, setBulkScheduleVisible] = React.useState(false);

    const {
        orders,
        loading,
        refreshing,
        selectedStatus,
        setSelectedStatus,
        fetchOrders,
        loadMoreOrders,
        refreshOrders,
        enrichedOrders,
        relaunchOrder
    } = useOrderStore();

    // Fetch on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Re-fetch when the selected tab changes
    const handleTabChange = useCallback((status: OrderStatus) => {
        setSelectedStatus(status);
        fetchOrders({ page: 1, status, forceRefresh: true });
    }, [setSelectedStatus, fetchOrders]);

    // Map order data to CampaignCardItem
    const mappedOrders: CampaignCardItem[] = useMemo(() =>
        orders.map(o => {
            const detail = enrichedOrders[o.id];
            const screenTitle = detail && detail.items.length > 0
                ? detail.items[0].screen_title
                : undefined;
            const duration = o.duration || (detail && detail.items.length > 0 ? detail.items[0].duration : undefined);
            const totalMediaPlay = o.total_plays || (detail && detail.items.length > 0 ? detail.items[0].total_plays : undefined);

            return {
                id: o.id,
                orderNumber: o.order_number,
                status: o.status,
                amountPaid: o.amount_paid,
                itemsCount: o.items_count,
                createdAt: o.created_at,
                screenTitle,
                duration,
                totalMediaPlay,
                onPress: () => {
                    setSelectedOrderId(o.id);
                    setModalVisible(true);
                },
                onSupportPress: () => {
                    setSupportStatusContext(o.status.toLowerCase() as 'cancelled' | 'rejected');
                    setSupportModalVisible(true);
                },
                onViewLivePlay: () => alert(`Viewing live play for order ${o.order_number}`),
                onExtendDuration: () => alert(`Extending duration for order ${o.order_number}`),
                onReport: () => router.push(`/campaign-analytics?orderId=${o.id}`),
                onRelaunch: async () => {
                    const result = await relaunchOrder(o.id);
                    if (result.success) {
                        useAlertStore.getState().showAlert('Success', 'Campaign relaunched and added to your cart!', [{ text: 'OK' }]);
                        router.push('/homeSubScreens/cartscreen');
                    } else {
                        useAlertStore.getState().showAlert('Relaunch Failed', result.error || 'Failed to relaunch campaign. Please try again.', [{ text: 'OK' }]);
                    }
                },
                onDelete: () => alert(`Deleting order ${o.order_number}`),
            };
        }),
        [orders, enrichedOrders]);

    const hasOrders = mappedOrders.length > 0;
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={styles.mainContent}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={{ width: 45 }} />
                <Text style={styles.headerTitle}>Digital Screens</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Ionicons name="search-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* HORIZONTAL NAV */}
            <View style={styles.navContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {ORDER_TABS.map((item) => {
                        const isActive = selectedStatus === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleTabChange(item.id)}
                                activeOpacity={0.7}
                                style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
                            >
                                <Ionicons name={item.icon as any} size={14} color={isActive ? 'white' : theme.tint} style={{ marginRight: 6 }} />
                                <Text style={[styles.labelText, { color: isActive ? 'white' : theme.textSecondary }]}>{item.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* LIST OR EMPTY STATE */}
            {loading ? (
                <View style={[styles.emptyContainer, { marginTop: 0 }]}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : hasOrders ? (
                <FlatList
                    data={mappedOrders}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={Platform.OS === 'android'}
                    renderItem={({ item }) => <CampaignCard item={item} />}
                    onEndReached={loadMoreOrders}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refreshOrders} tintColor={theme.tint} />
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.illustrationCard}>
                        <View style={styles.innerGraphic}>
                            <Ionicons name="megaphone" size={100} color={theme.tint} style={{ opacity: 0.1 }} />
                            <Ionicons name="person" size={140} color={theme.tint} style={styles.floatingIcon} />
                        </View>
                    </View>
                    <Text style={styles.emptyTitle}>No orders found</Text>
                    <Text style={styles.emptySubtitle}>Start your first campaign to see{"\n"}your orders here.</Text>
                </View>
            )}

            {/* Extended FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setCampaignTypeModalVisible(true)}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.fabText}>New Campaign</Text>
            </TouchableOpacity>

            {/* Order Detail Modal */}
            <OrderDetailModal
                visible={modalVisible}
                orderId={selectedOrderId}
                onClose={() => {
                    setModalVisible(false);
                    setTimeout(() => setSelectedOrderId(null), 300); // Clear after animation finishes
                }}
            />

            {/* Support Modal */}
            <SupportModal
                visible={supportModalVisible}
                status={supportStatusContext}
                onClose={() => setSupportModalVisible(false)}
            />

            {/* Campaign Type Modal */}
            <CampaignSelectionType
                visible={campaignTypeModalVisible}
                onClose={() => setCampaignTypeModalVisible(false)}
                onSelectBulk={() => {
                    setCampaignTypeModalVisible(false);
                    setBulkScheduleVisible(true);
                }}
                onSelectIndividual={() => {
                    setCampaignTypeModalVisible(false);
                    router.push('/homeSubScreens/reservenow');
                }}
            />

            {/* Bulk Schedule Modal */}
            <BulkScheduleModal
                visible={bulkScheduleVisible}
                onClose={() => setBulkScheduleVisible(false)}
                onNext={(schedule) => {
                    setBulkScheduleVisible(false);
                    router.push({
                        pathname: '/(campaign-subscreens)/bulkBooking',
                        params: {
                            duration: schedule.duration,
                            duration_multiplier: String(schedule.duration_multiplier),
                            start_date: schedule.start_date,
                            end_date: schedule.end_date,
                        },
                    });
                }}
            />
        </View>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    mainContent: { flex: 1 },
    header: {
        paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.textSecondary + '20',
    },
    headerTitle: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    iconCircle: {
        width: 45, height: 45, borderRadius: 22.5, backgroundColor: theme.card,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border,
    },
    navContainer: { marginVertical: 8 },
    scrollContent: { paddingHorizontal: 20, gap: 10 },
    tab: {
        flexDirection: 'row', borderRadius: 30, borderWidth: 1, alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    activeTab: { backgroundColor: theme.tint, borderColor: theme.tint },
    inactiveTab: { backgroundColor: theme.card, borderColor: theme.border },
    labelText: { fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: -60 },
    illustrationCard: {
        width: 280, height: 280, backgroundColor: theme.card, borderRadius: 30, padding: 20,
        marginBottom: 35, borderWidth: 1, borderColor: theme.border,
    },
    innerGraphic: { flex: 1, backgroundColor: theme.tintLight, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    floatingIcon: { position: 'absolute', bottom: -20 },
    emptyTitle: { ...Typography.h1, color: theme.text, fontSize: 26, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, fontWeight: '500' },
    fab: {
        position: 'absolute', 
        right: 20, 
        bottom: Platform.OS === 'ios' ? 120 : 100, // Raised to clear the tab bar
        height: 48, // Sleeker height
        borderRadius: 24, // Fully rounded
        backgroundColor: theme.tint,
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: theme.tint, 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.35, 
        shadowRadius: 8, 
        elevation: 6,
    },
    fabText: {
        color: 'white',
        fontSize: 14, // Sleeker font size
        fontWeight: '700',
        marginLeft: 6,
    }
});
