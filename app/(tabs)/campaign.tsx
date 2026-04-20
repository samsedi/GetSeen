import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';

// 1. Import the standalone component
import CampaignCard from '@/components/CampaignComponents/CampaignCard';

const MOCK_CAMPAIGNS = [
    {
        id: '1',
        name: 'The Palms Mall Main Screen',
        package: 'Premium Visibility',
        price: '250,000',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop',
    },
    {
        id: '2',
        name: 'Silverbird Cinemas Entry',
        package: 'Standard Loop',
        price: '120,000',
        status: 'Pending',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1459&auto=format&fit=crop',
    },
    {
        id: '3',
        name: 'Ikeja City Mall Totem',
        package: 'Gold Package',
        price: '450,000',
        status: 'Scheduled',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1474&auto=format&fit=crop',
    }
];

const CAMPAIGN_CATEGORIES = [
    { id: 'All', label: 'All', icon: 'layers-outline' },
    { id: 'Active', label: 'Active', icon: 'play-circle-outline' },
    { id: 'Pending', label: 'Pending', icon: 'time-outline' },
    { id: 'Scheduled', label: 'Scheduled', icon: 'calendar-outline' },
];

export default function CampaignScreen() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState('All');

    const hasCampaigns = MOCK_CAMPAIGNS.length > 0;
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={styles.root}>
            {/* HEADER */}
            <View style={styles.header}>

                <Text style={styles.headerTitle}>Campaigns</Text>
                <TouchableOpacity style={styles.iconCircle}>
                    <Ionicons name="search-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* HORIZONTAL NAV WITH ICONS */}
            <View style={styles.navContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {CAMPAIGN_CATEGORIES.map((item) => {
                        const isActive = selectedTab === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedTab(item.id)}
                                activeOpacity={0.7}
                                style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={14}
                                    color={isActive ? 'white' : '#FF2D55'}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.labelText, { color: isActive ? 'white' : theme.textSecondary }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* LIST OR EMPTY STATE */}
            {hasCampaigns ? (
                <FlatList
                    data={MOCK_CAMPAIGNS}
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
                            <Ionicons name="megaphone" size={100} color="#FF2D55" style={{opacity: 0.1}} />
                            <Ionicons name="person" size={140} color="#FF2D55" style={styles.floatingIcon} />
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
    root: { flex: 1, backgroundColor: theme.background },
    header: {
        paddingTop: insets.top + 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: { ...Typography.h2, color: theme.text, fontSize: 20, fontWeight: '800',
left:100},
    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,

        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    navContainer: { marginVertical: 8 },
    scrollContent: { paddingHorizontal: 20, gap: 10 },
    tab: {
        flexDirection: 'row',
        borderRadius: 30,
        borderWidth: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    activeTab: { backgroundColor: '#FF2D55', borderColor: '#FF2D55' },
    inactiveTab: { backgroundColor: theme.card, borderColor: theme.border },
    labelText: { fontSize: 12, fontWeight: '700' },
    listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: -60 },
    illustrationCard: {
        width: 280,
        height: 280,
        backgroundColor: theme.card,
        borderRadius: 30,
        padding: 20,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: theme.border,
    },
    innerGraphic: { flex: 1, backgroundColor: '#FFF0F3', borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    floatingIcon: { position: 'absolute', bottom: -20 },
    emptyTitle: { ...Typography.h1, color: theme.text, fontSize: 26, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, fontWeight: '500' },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: Platform.OS === 'ios' ? 100 : 80,
        width: 65,
        height: 65,
        borderRadius: 20,
        backgroundColor: '#FF2D55',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF2D55',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }
});