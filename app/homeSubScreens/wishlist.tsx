import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ScrollView,
    useWindowDimensions,
    useColorScheme
} from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '@/store/useWishlistStore';
import LocationCard from '@/components/HomeScreenComponents/LocationCard';
import { Colors, Typography } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';

// Mock recommendations transformed into the full LocationItem shape to prevent card crashes
const RECOMMENDATIONS: Partial<LocationItem>[] = [
    { id: 'rec1', name: 'Premium Lounge VI', price: '12,000', rating: 4.9, images: [require('@/assets/images/office.jpg')], category: 'Lounge' },
    { id: 'rec2', name: 'Workstation Ikeja', price: '5,500', rating: 4.6, images: [require('@/assets/images/gym.jpg')], category: 'Offices' },
    { id: 'rec3', name: 'Cafe One Yaba', price: '7,900', rating: 4.5, images: [require('@/assets/images/resturant.jpg')], category: 'Co-working' },
];

export default function WishlistScreen() {
    const { wishlist } = useWishlistStore();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // EXCEPTION: Filter out any null or corrupted items in the wishlist array
    const validatedWishlist = useMemo(() => {
        return (wishlist ?? []).filter(item => item && item.id);
    }, [wishlist]);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            {/* Page Header */}
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Your Wishlist</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* SECTION 1: Wished Locations */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Wished Locations</Text>
                    {validatedWishlist.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="heart-outline" size={32} color={theme.textSecondary} />
                            <Text style={styles.emptyText}>Your wishlist is empty</Text>
                            <TouchableOpacity
                                style={styles.exploreLink}
                                onPress={() => router.push('/(tabs)/home')}
                            >
                                <Text style={styles.exploreLinkText}>Find places to save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {validatedWishlist.map((item) => (
                                <View key={item.id} style={styles.gridCardWrapper}>
                                    {/* LocationCard already has internal exceptions, so it's safe */}
                                    <LocationCard item={item} />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.sectionDivider} />

                {/* SECTION 2: Recommended For You */}
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
                                {/* Using 'as any' safely because LocationCard handles missing props */}
                                <LocationCard item={item as LocationItem} />
                            </View>
                        )}
                    />
                </View>

            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background
    },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
        backgroundColor: theme.background,
    },
    backButton: {
        marginRight: 10,
    },
    pageTitle: {
        fontSize: isTablet ? 26 : 22,
        color: theme.text,
        fontWeight: '800',
    },
    scrollContent: {
        paddingBottom: 60
    },
    sectionContainer: {
        marginTop: 15,
    },
    sectionHeader: {
        fontSize: isTablet ? 18 : 16,
        marginHorizontal: 20,
        marginBottom: 15,
        color: theme.text,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: theme.border,
        marginHorizontal: 20,
        marginVertical: 25,
    },
    grid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCardWrapper: {
        width: isTablet ? '48%' : '100%',
        marginBottom: 10,
    },
    horizontalList: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    horizontalCardWrapper: {
        marginRight: 16,
    },
    emptyBox: {
        marginHorizontal: 20,
        paddingVertical: 40,
        backgroundColor: theme.card,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: theme.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        marginTop: 12,
        color: theme.text,
        fontSize: 16,
        fontWeight: '600',
    },
    exploreLink: {
        marginTop: 8,
    },
    exploreLinkText: {
        color: '#FF2D55',
        fontSize: 14,
        fontWeight: '600',
    }
});