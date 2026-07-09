import React, { useMemo, useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';

import OwnerHeader from '@/components/ScreenOwnerComponents/DashboardComponents/OwnerHeader';
import DashboardOverview from '@/components/ScreenOwnerComponents/DashboardComponents/DashboardOverview';
import ScreenCard from '@/components/ScreenOwnerComponents/DashboardComponents/ScreenCard';

import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardScreen() {
    // ─── Logic (all state + data-fetching lives in the hook) ───────────────
    const { displayedScreens, loading, activeTab, setActiveTab, searchQuery, setSearchQuery, stats } = useDashboard();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const ownerTint = theme.brandNavy;
    const activePink = theme.tint;

    const styles = useMemo(
        () => createStyles(isTablet, theme, insets, ownerTint),
        [isTablet, theme, insets, ownerTint]
    );

    const handleAddNew = () =>
        router.replace({
            pathname: '/(screen-owner-tabs)/add-screen',
            params: { draftId: 'NEW', timestamp: Date.now() },
        });

    // ─── Shared "Add New" card ─────────────────────────────────────────────
    const AddScreenCard = () => (
        <TouchableOpacity
            style={[styles.addScreenCard, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={handleAddNew}
        >
            <View style={[styles.addIconWrapper, { backgroundColor: ownerTint + '15' }]}>
                <Ionicons name="add" size={32} color={ownerTint} />
            </View>
            <Text style={[styles.addScreenText, { color: theme.text }]}>Add New</Text>
            <Text style={[styles.addScreenSubText, { color: theme.textSecondary }]}>Screen</Text>
        </TouchableOpacity>
    );

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <View style={styles.rootContainer}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <OwnerHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <DashboardOverview stats={stats} />

                <View style={styles.section}>
                    {/* Section header + tab toggle */}
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>My Screens</Text>

                        <View style={[styles.tabContainer, { backgroundColor: theme.cardSoft }]}>
                            {(['ACTIVE', 'DRAFTS'] as const).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[
                                        styles.tab,
                                        activeTab === tab && {
                                            backgroundColor: activePink,
                                            shadowColor: activePink,
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={tab === 'ACTIVE' ? 'tv-outline' : 'document-text-outline'}
                                        size={14}
                                        color={activeTab === tab ? '#FFFFFF' : theme.textSecondary}
                                    />
                                    <Text style={[styles.tabText, { color: activeTab === tab ? '#FFFFFF' : theme.textSecondary }]}>
                                        {tab === 'ACTIVE' ? 'Active' : 'Drafts'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Screen list or loading state */}
                    {loading ? (
                        <View style={{ height: 160, alignItems: 'center', flexDirection: 'row' }}>
                            <AddScreenCard />
                            <ActivityIndicator size="large" color={ownerTint} style={{ marginLeft: 30 }} />
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
                                        {activeTab === 'DRAFTS' ? 'You have no drafts.' : 'No active screens yet.'}
                                    </Text>
                                </View>
                            )}
                            ListHeaderComponent={AddScreenCard}
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

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any, ownerTint: string) =>
    StyleSheet.create({
        rootContainer: { flex: 1, backgroundColor: theme.background },
        scrollContainer: { paddingBottom: insets.bottom + (isTablet ? 120 : 100) },
        section: { marginTop: 24, paddingHorizontal: 20 },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sectionTitle: { ...Typography.h3, fontWeight: '800' },
        tabContainer: { flexDirection: 'row', padding: 4, borderRadius: 24 },
        tab: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
        },
        tabText: { fontSize: 13, fontWeight: '700' },
        emptyContainer: { height: 160, justifyContent: 'center', paddingHorizontal: 20 },
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
        addScreenText: { fontSize: 14, fontWeight: '700' },
        addScreenSubText: { fontSize: isTablet ? 16 : 13, fontWeight: '500' }
    });