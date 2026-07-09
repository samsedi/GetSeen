import React, { useMemo, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    useColorScheme,
    useWindowDimensions,
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { useHomeScreen } from '@/hooks/useHomeScreen';

import HomeHeader from '@/components/HomeScreenComponents/HomeHeader';
import VenueNavigation from '@/components/HomeScreenComponents/VenueNavigation';
import LocationCardList from '@/components/HomeScreenComponents/LocationCardList';
import CampaignOverview from '@/components/HomeScreenComponents/CampaignOverview';
import PackageModal from '@/components/HomeScreenComponents/PackageSelectionModal';

type Theme = AppTheme;

export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const {
        loading,
        selectedVenue,
        handleVenueSelect,
        filteredLocations,
        isModalVisible,
        activeLocation,
        closeReservation,
        searchQuery,
        setSearchQuery,
    } = useHomeScreen();

    const styles = useMemo(
        () => createStyles(isTablet, theme, insets.bottom),
        [isTablet, theme, insets.bottom],
    );

    return (
        <View style={styles.rootContainer}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={Platform.OS === 'android'}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <CampaignOverview />

                <View style={styles.listSection}>
                    <View style={styles.listHeader}>
                        <Text style={styles.headerTitle}>Top Locations</Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <VenueNavigation
                    selected={selectedVenue}
                    setSelected={handleVenueSelect}
                />

                {loading ? (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator size="large" color={theme.tint} />
                    </View>
                ) : (
                    <LocationCardList
                        data={filteredLocations}
                        selectedVenue={selectedVenue}
                    />
                )}
            </ScrollView>

            <PackageModal
                visible={isModalVisible}
                onClose={closeReservation}
                item={activeLocation}
                theme={theme}
                isTablet={isTablet}
            />
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: Theme, bottomInset: number) => {
    const safeBottomPadding = bottomInset + (isTablet ? 120 : 100);

    return StyleSheet.create({
        rootContainer: { flex: 1, backgroundColor: theme.background },
        scrollContainer: { paddingBottom: safeBottomPadding },
        listSection: { marginTop: 15, paddingHorizontal: 20 },
        listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        headerTitle: { ...Typography.h2, color: theme.text, fontSize: isTablet ? 20 : 14, fontWeight: '800' },
        seeAllText: { fontSize: isTablet ? 16 : 12, color: theme.tint, fontWeight: '600' },
        loadingWrapper: { paddingTop: 40, alignItems: 'center', justifyContent: 'center' }
    });
};