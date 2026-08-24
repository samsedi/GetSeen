import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView, Platform } from 'react-native';
import { useAppTheme, Typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAmplifyStore } from '@/store/useAmplifyStore';

const AMPLIFY_TABS = [
    { id: 'all', label: 'All', icon: 'layers-outline' },
    { id: 'active', label: 'Active', icon: 'play-circle-outline' },
    { id: 'pending', label: 'Pending', icon: 'time-outline' },
    { id: 'scheduled', label: 'Scheduled', icon: 'calendar-outline' },
    { id: 'completed', label: 'Completed', icon: 'flag-outline' },
    { id: 'rejected', label: 'Rejected', icon: 'close-circle-outline' },
    { id: 'cancelled', label: 'Cancelled', icon: 'ban-outline' },
];

export default function AmplifyCampaign() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    const { campaigns, loading, refreshing, fetchCampaigns, loadMoreCampaigns } = useAmplifyStore();
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        fetchCampaigns({ status: selectedStatus, forceRefresh: true });
    }, [selectedStatus]);

    const renderCampaign = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity 
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/amplify-detail?id=${item.id}`)}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.display_name}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status_display}</Text>
                    </View>
                </View>
                <Text style={styles.cardSubtitle}>{item.campaign_display_name}</Text>
                
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Impressions</Text>
                        <Text style={styles.statValue}>{item.impressions_delivered?.toLocaleString() || 0} / {item.impressions?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Clicks</Text>
                        <Text style={styles.statValue}>{item.clicks?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>CTR</Text>
                        <Text style={styles.statValue}>{item.ctr}%</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{item.start_date} - {item.end_date}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/amplify-analytics?id=${item.id}`)}>
                            <Ionicons name="bar-chart-outline" size={20} color={theme.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => { /* extend or relaunch */ }}>
                            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={{ width: 45 }} />
                <Text style={styles.headerTitle}>Amplify</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Ionicons name="search-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* HORIZONTAL NAV */}
            <View style={styles.navContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {AMPLIFY_TABS.map((item) => {
                        const isActive = selectedStatus === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedStatus(item.id)}
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

            <FlatList
                data={campaigns}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCampaign}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchCampaigns({ forceRefresh: true })} tintColor={theme.tint} />
                }
                onEndReached={loadMoreCampaigns}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="megaphone-outline" size={48} color={theme.border} />
                            <Text style={styles.emptyTitle}>No Amplify Campaigns</Text>
                            <Text style={styles.emptySubtitle}>You don't have any {selectedStatus !== 'all' ? selectedStatus : ''} amplify campaigns yet.</Text>
                            
                            {selectedStatus === 'all' && (
                                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/homeSubScreens/amplifySetup')}>
                                    <Text style={styles.emptyBtnText}>Create Campaign</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
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
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    cardTitle: {
        ...Typography.h3,
        color: theme.text,
        flex: 1,
    },
    statusBadge: {
        backgroundColor: theme.inputBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        ...Typography.caption,
        color: theme.textSecondary,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        ...Typography.caption,
        color: theme.tint,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.background,
        padding: 12,
        borderRadius: 12,
    },
    statLabel: {
        ...Typography.caption,
        color: theme.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        ...Typography.body,
        color: theme.text,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingTop: 16,
    },
    dateText: {
        ...Typography.caption,
        color: theme.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        padding: 8,
        backgroundColor: theme.inputBg,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        ...Typography.body,
        color: theme.text,
        marginTop: 16,
    },
    emptySubtitle: {
        ...Typography.caption,
        color: theme.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 250,
    },
    emptyBtn: {
        marginTop: 24,
        backgroundColor: theme.tint,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyBtnText: {
        ...Typography.body,
        color: '#FFF',
    }
});
