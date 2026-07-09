import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';
import CampaignCard from '@/components/CampaignComponents/CampaignCard';
import { fetchMyCampaigns, CampaignData } from '@/api/campaignService';

const CAMPAIGN_CATEGORIES = [
    { id: 'All', label: 'All', icon: 'layers-outline' },
    { id: 'ACTIVE', label: 'Active', icon: 'play-circle-outline' },
    { id: 'PENDING', label: 'Pending', icon: 'time-outline' },
    { id: 'SCHEDULED', label: 'Scheduled', icon: 'calendar-outline' },
];

export default function DigitalScreensCampaign() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState('All');
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCampaigns = async () => {
            try {
                const data = await fetchMyCampaigns();
                setCampaigns(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load campaigns", error);
            } finally {
                setLoading(false);
            }
        };
        loadCampaigns();
    }, []);

    const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
    const filteredCampaigns = safeCampaigns.filter(c => 
        selectedTab === 'All' ? true : c.status === selectedTab
    );

    // Map backend data to the format expected by CampaignCard
    const mappedCampaigns = filteredCampaigns.map(c => ({
        id: c.id,
        name: c.screen?.name || 'Unknown Screen',
        package: c.screen?.screenType || 'Digital Screen',
        price: c.pricePaid ? c.pricePaid.toLocaleString() : '0',
        status: c.status,
        image: c.mediaUrl || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop',
    }));

    const hasCampaigns = mappedCampaigns.length > 0;
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={styles.mainContent}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={{ width: 45 }} />
                <Text style={styles.headerTitle}>Digital screens</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Ionicons name="search-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* HORIZONTAL NAV WITH ICONS */}
            <View style={styles.navContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {CAMPAIGN_CATEGORIES.map((item) => {
                        const isActive = selectedTab === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedTab(item.id)}
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
            ) : hasCampaigns ? (
                <FlatList
                    data={mappedCampaigns}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={Platform.OS === 'android'}
                    renderItem={({ item }) => <CampaignCard item={item} />}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.illustrationCard}>
                        <View style={styles.innerGraphic}>
                            <Ionicons name="megaphone" size={100} color={theme.tint} style={{opacity: 0.1}} />
                            <Ionicons name="person" size={140} color={theme.tint} style={styles.floatingIcon} />
                        </View>
                    </View>
                    <Text style={styles.emptyTitle}>No campaigns found</Text>
                    <Text style={styles.emptySubtitle}>Start your first campaign to see{"\n"}them here.</Text>
                </View>
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <Ionicons name="add" size={35} color="white" />
            </TouchableOpacity>
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
        position: 'absolute', right: 25, bottom: Platform.OS === 'ios' ? 100 : 80,
        width: 65, height: 65, borderRadius: 20, backgroundColor: theme.tint,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: theme.tint, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    }
});
