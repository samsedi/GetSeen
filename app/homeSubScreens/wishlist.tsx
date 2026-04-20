import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    ScrollView,
    FlatList,
Platform
} from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';


import { useWishlistStore } from '@/store/useWishlistStore';
import { useReservationStore } from '@/store/useReservationStore';
import { useAppTheme, AppTheme } from '@/constants/theme';
import PackageSelectionModal from '@/components/HomeScreenComponents/PackageSelectionModal';
import LocationCard from '@/components/HomeScreenComponents/LocationCard';

import { LocationItem, MOCK_LOCATIONS } from '@/constants/mockData';

const RECOMMENDATIONS: Partial<LocationItem>[] = [
    { id: 'rec1', name: 'Premium Lounge VI', price: '12,000', rating: 4.9, images: [require('@/assets/images/office.jpg')], category: 'Lounge', packages: MOCK_LOCATIONS[0].packages },
    { id: 'rec2', name: 'Workstation Ikeja', price: '5,500', rating: 4.6, images: [require('@/assets/images/gym.jpg')], category: 'Offices', packages: MOCK_LOCATIONS[1].packages },
];

export default function WishlistScreen() {
    const wishlist = useWishlistStore((state) => state.wishlist);


    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const theme = useAppTheme();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();

    const validatedWishlist = useMemo(() => {
        return (wishlist ?? []).filter(item => item && item.id);
    }, [wishlist]);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Your Wishlist</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                // FIX 2: De-prioritize background rendering during scroll
                removeClippedSubviews={Platform.OS === 'android'}
            >
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Wished Locations</Text>
                    {validatedWishlist.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="heart-outline" size={32} color={theme.textSecondary} />
                            <Text style={styles.emptyText}>Your wishlist is empty</Text>
                            <TouchableOpacity style={styles.exploreLink} onPress={() => router.push('/(tabs)/home')}>
                                <Text style={styles.exploreLinkText}>Find places to save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {validatedWishlist.map((item) => (
                                <View key={item.id} style={styles.gridCardWrapper}>
                                    {/* LocationCard now uses its own internal Zustand logic,
                                        so it won't trigger a parent re-render when clicked */}
                                    <LocationCard item={item} />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Recommended for You</Text>
                    <FlatList
                        horizontal
                        data={RECOMMENDATIONS}
                        keyExtractor={(item) => item.id || Math.random().toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => (
                            <View style={styles.horizontalCardWrapper}>
                                <LocationCard item={item as LocationItem} />
                            </View>
                        )}
                    />
                </View>
            </ScrollView>

            {/* THE GLOBAL MODAL LISTENER */}
            <PackageSelectionModal
                visible={isModalVisible}
                onClose={closeReservation}
                item={activeLocation}
                theme={theme}
                isTablet={isTablet}
            />
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    backButton: { marginRight: 10 },
    pageTitle: { fontSize: isTablet ? 26 : 22, color: theme.text, fontWeight: '800' },
    scrollContent: { paddingBottom: 60 },
    sectionContainer: { marginTop: 15 },
    sectionHeader: {
        fontSize: isTablet ? 18 : 16,
        marginHorizontal: 20,
        marginBottom: 15,
        color: theme.text,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    sectionDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 20, marginVertical: 25 },
    grid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCardWrapper: { width: isTablet ? '48%' : '100%', marginBottom: 10 },
    horizontalList: { paddingLeft: 20, paddingRight: 20 },
    horizontalCardWrapper: { marginRight: 16 },
    emptyBox: {
        marginHorizontal: 20, paddingVertical: 40, backgroundColor: theme.card,
        borderRadius: 24, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed',
    },
    emptyText: { marginTop: 12, color: theme.text, fontSize: 16, fontWeight: '600' },
    exploreLink: { marginTop: 8 },
    exploreLinkText: { color: '#FF2D55', fontSize: 14, fontWeight: '600' }
});