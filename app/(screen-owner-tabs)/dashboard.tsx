import React, { useMemo, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    useColorScheme,
    useWindowDimensions,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import OwnerHeader from '@/components/ScreenOwnerComponents/DashboardComponents/OwnerHeader';
import DashboardOverview from '@/components/ScreenOwnerComponents/DashboardComponents/DashboardOverview';

import screenApi, { ScreenResponseDto } from '@/api/screenService';
import ScreenCard, { ScreenItem } from "@/components/ScreenOwnerComponents/DashboardComponents/ScreenCard";

export default function DashboardScreen() {
    const [screens, setScreens] = useState<ScreenItem[]>([]);
    const [loading, setLoading] = useState(true);

    // State to manage the active tab (Active vs Drafts)
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'DRAFTS'>('ACTIVE');

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    // Colors
    const ownerTint = theme.brandNavy;
    const activePink = theme.tint;
    const router = useRouter();

    const fetchAllScreens = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch both Active Screens and Drafts concurrently
            const [activeData, draftData] = await Promise.all([
                screenApi.getMyScreens(),
                screenApi.getMyDrafts()
            ]);

            // Format Active Screens
            const formattedActive = activeData.map((s) => ({
                id: s.id,
                name: s.name,
                status: s.active ? 'Online' : 'Offline',
                location: s.address || 'No location set',
                resolution: s.resolution || 'TBD',
                activeAds: 0,
                images: s.mediaUrls && s.mediaUrls.length > 0 ? s.mediaUrls : ['https://via.placeholder.com/150'],
                verificationStatus: s.verificationStatus || 'PENDING'
            }));

            // Format Drafts (using safe fallbacks since drafts might be missing data)
            const formattedDrafts = draftData.map((d) => ({
                id: d.id,
                name: d.name || 'Untitled Draft',
                status: 'Draft',
                location: d.address || 'Location pending',
                resolution: d.resolution || 'TBD',
                activeAds: 0,
                images: d.mediaUrls && d.mediaUrls.length > 0 ? d.mediaUrls : ['https://via.placeholder.com/150'],
                verificationStatus: 'DRAFT'
            }));

            // Combine them into one master array
            setScreens([...formattedActive, ...formattedDrafts]);
        } catch (error) {
            console.log("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAllScreens();
        }, [fetchAllScreens])
    );

    const styles = useMemo(() => createStyles(isTablet, theme, insets, ownerTint), [isTablet, theme, insets, ownerTint]);

    // Filter the screens based on the currently selected tab
    const displayedScreens = useMemo(() => {
        if (activeTab === 'DRAFTS') {
            return screens.filter(s => s.status === 'Draft');
        }
        return screens.filter(s => s.status !== 'Draft');
    }, [screens, activeTab]);

    return (
        <View style={styles.rootContainer}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <OwnerHeader />

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <DashboardOverview />

                <View style={styles.section}>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Screens</Text>

                        {/* Rounded Tab Toggle UI */}
                        <View style={[styles.tabContainer, { backgroundColor: theme.cardSoft }]}>
                            <TouchableOpacity
                                onPress={() => setActiveTab('ACTIVE')}
                                style={[
                                    styles.tab,
                                    activeTab === 'ACTIVE' && { backgroundColor: activePink, shadowColor: activePink, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }
                                ]}
                            >
                                <Ionicons
                                    name="tv-outline"
                                    size={14}
                                    color={activeTab === 'ACTIVE' ? '#FFFFFF' : theme.textSecondary}
                                />
                                <Text style={[styles.tabText, { color: activeTab === 'ACTIVE' ? '#FFFFFF' : theme.textSecondary }]}>
                                    Active
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setActiveTab('DRAFTS')}
                                style={[
                                    styles.tab,
                                    activeTab === 'DRAFTS' && { backgroundColor: activePink, shadowColor: activePink, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }
                                ]}
                            >
                                <Ionicons
                                    name="document-text-outline"
                                    size={14}
                                    color={activeTab === 'DRAFTS' ? '#FFFFFF' : theme.textSecondary}
                                />
                                <Text style={[styles.tabText, { color: activeTab === 'DRAFTS' ? '#FFFFFF' : theme.textSecondary }]}>
                                    Drafts
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={ownerTint} />
                        </View>
                    ) : (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={displayedScreens}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={{ color: theme.textSecondary }}>
                                        {activeTab === 'DRAFTS' ? "You have no drafts." : "No active screens yet."}
                                    </Text>
                                </View>
                            )}
                            ListHeaderComponent={() => (
                                <TouchableOpacity
                                    style={[styles.addScreenCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}
                                    activeOpacity={0.8}
                                    // Replace instead of push so Expo Router fully re-evaluates
                                    // params even when already on the add-screen route.
                                    // Timestamp guarantees the screen resets if clicked multiple times.
                                    onPress={() => router.replace({
                                        pathname: '/(screen-owner-tabs)/add-screen',
                                        params: { draftId: 'NEW', timestamp: Date.now() }
                                    })}
                                >
                                    <View style={[styles.addIconWrapper, { backgroundColor: ownerTint + '15' }]}>
                                        <Ionicons name="add" size={32} color={ownerTint} />
                                    </View>
                                    <Text style={[styles.addScreenText, { color: theme.text }]}>Add New</Text>
                                    <Text style={[styles.addScreenSubText, { color: theme.textSecondary }]}>Screen</Text>
                                </TouchableOpacity>
                            )}
                            renderItem={({ item }) => <ScreenCard item={item} ownerTint={ownerTint} />}
                            style={{ marginHorizontal: -20 }}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any, ownerTint: string) => StyleSheet.create({
    rootContainer: { flex: 1, backgroundColor: theme.background },
    scrollContainer: { paddingBottom: insets.bottom + (isTablet ? 120 : 100) },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { ...Typography.h3, fontWeight: '800' },

    tabContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 24,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '700',
    },

    emptyContainer: {
        height: 160,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    addScreenCard: {
        width: isTablet ? 160 : 130,
        height: isTablet ? 180 : 160,
        borderRadius: 14,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 15,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    addScreenText: {
        fontSize: 14,
        fontWeight: '700',
    },
    addScreenSubText: {
        fontSize: 12,
        marginTop: 4,
    },
});