import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    useColorScheme,
    useWindowDimensions,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { useReservationStore } from '@/store/useReservationStore';

import HomeHeader from '@/components/HomeScreenComponents/HomeHeader';
import VenueNavigation from '@/components/HomeScreenComponents/VenueNavigation';
import LocationCardList from '@/components/HomeScreenComponents/LocationCardList';
import CampaignOverview from '@/components/HomeScreenComponents/CampaignOverview';
import PackageModal from '@/components/HomeScreenComponents/PackageSelectionModal';

import { MOCK_LOCATIONS } from '@/constants/mockData';

type Theme = AppTheme;

export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const [selectedVenue, setSelectedVenue] = useState('For You');

    const filteredLocations = useMemo(() => {
        if (selectedVenue === 'For You') return MOCK_LOCATIONS;
        return MOCK_LOCATIONS.filter((item) => item.category === selectedVenue);
    }, [selectedVenue]);

    const styles = useMemo(
        () => createStyles(isTablet, theme, insets.bottom),
        [isTablet, theme, insets.bottom],
    );

    /**
     * Stable callback — prevents VenueNavigation from re-rendering
     * every time HomeScreen re-renders due to modal visibility change.
     */
    const handleVenueSelect = useCallback((venue: string) => {
        setSelectedVenue(venue);
    }, []);

    return (
        <View style={styles.rootContainer}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <HomeHeader />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={Platform.OS === 'android'}
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

                <LocationCardList
                    data={filteredLocations}
                    selectedVenue={selectedVenue}
                />

                <LocationCardList
                    data={filteredLocations}
                    selectedVenue={selectedVenue}
                />
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
        rootContainer: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContainer: {
            paddingBottom: safeBottomPadding,
        },
        listSection: {
            marginTop: 15,
            paddingHorizontal: 20,
        },
        listHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitle: {
            ...Typography.h2,
            color: theme.text,
            fontSize: isTablet ? 20 : 14,
            fontWeight: '800',
        },
        seeAllText: {
            fontSize: isTablet ? 16 : 12,
            color: theme.tint,
            fontWeight: '600',
        },
    });
};
