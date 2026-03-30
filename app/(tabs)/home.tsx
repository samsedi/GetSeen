import React, { useState, useMemo } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    useColorScheme,
    useWindowDimensions,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 1. Import this

import HomeHeader from "@/components/HomeScreenComponents/HomeHeader";
import VenueNavigation from "@/components/HomeScreenComponents/VenueNavigation";
import LocationCardList from "@/components/HomeScreenComponents/LocationCardList";
import CampaignOverview from "@/components/HomeScreenComponents/CampaignOverview";

import { Colors, Typography } from "@/constants/theme";
import { MOCK_LOCATIONS } from '@/constants/mockData';

type Theme = typeof Colors.light;

export default function HomeScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // 2. Get the bottom inset (e.g., height of the 3-button nav)
    const insets = useSafeAreaInsets();

    const [selectedVenue, setSelectedVenue] = useState("For You");

    const filteredLocations = useMemo(() => {
        if (selectedVenue === "For You") return MOCK_LOCATIONS;
        return MOCK_LOCATIONS.filter(item => item.category === selectedVenue);
    }, [selectedVenue]);

    // 3. Pass insets.bottom to the styles
    const styles = useMemo(() =>
            createStyles(isTablet, theme, insets.bottom),
        [isTablet, theme, insets.bottom]
    );

    return (
        <View style={styles.rootContainer}>
            <StatusBar style="light" />

            <HomeHeader />

            <ScrollView
                // 4. Styles are now applied correctly to contentContainer
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
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
                    setSelected={setSelectedVenue}
                />

                <LocationCardList
                    data={filteredLocations}
                    selectedVenue={selectedVenue}
                />

                {/* Second list for testing scroll */}
                <LocationCardList
                    data={filteredLocations}
                    selectedVenue={selectedVenue}
                />
            </ScrollView>
        </View>
    );
}

// 5. Added bottomInset parameter
const createStyles = (isTablet: boolean, theme: Theme, bottomInset: number) => {
    // Logic: TabBar height (~65-80) + Floating Bottom gap (~10-20) + Extra breathing room
    const safeBottomPadding = bottomInset + (isTablet ? 120 : 100);

    return StyleSheet.create({
        rootContainer: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContainer: {
            // This is the magic fix:
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