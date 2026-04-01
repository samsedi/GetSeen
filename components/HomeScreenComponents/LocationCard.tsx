import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useWishlistStore } from '@/store/useWishlistStore';

type Theme = typeof Colors.light;

export default function LocationCard({ item }: { item: LocationItem }) {

    const { toggleWishlist, isItemWished } = useWishlistStore();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);
    const router = useRouter();

    // Global Wishlist Store Connection


    // EXCEPTION 1: If item or ID is missing, hide the card to prevent app crash
    if (!item || !item.id) {
        console.warn('LocationCard: Data missing for item, skipping render.');
        return null;
    }

    const isWished = isItemWished(item.id);


    // Navigation logic with dynamic ID parameter
    const handleNavigationToviewdetails = () => {
        router.push({
            pathname: '/homeSubScreens/viewdetails',
            params: { id: item.id }
        });
    };

    const handleNavigationToreservenow = () =>{
        router.push({
            pathname: '/homeSubScreens/reservenow',
        })
    }

    // EXCEPTION 2: Safe image extraction with local asset fallback
    const displayImage = (item.images && item.images.length > 0)
        ? item.images[0]
        : require('@/assets/images/resturant.jpg');

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={handleNavigationToviewdetails}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={displayImage}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="disk"
                    transition={200}
                    // EXCEPTION 3: Network fallback/placeholder
                    placeholder={{ uri: 'https://placehold.jp/24/f0f0f0/cccccc/300x200.png?text=Loading...' }}
                />

                <View style={styles.adBadge}>
                    <Text style={styles.adText}>Ad here</Text>
                </View>

                {/* Heart/Wishlist Button */}
                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isWished ? 'heart' : 'heart-outline'}
                        size={14}
                        color={isWished ? '#FF2D55' : '#888'}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.details}>
                <View style={styles.nameRow}>
                    {/* EXCEPTION 4: Fallback for missing name */}
                    <Text style={styles.locationName} numberOfLines={1}>
                        {item.name || "Unnamed Location"}
                    </Text>

                    <View style={styles.ratingPill}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        {/* EXCEPTION 5: Protection for null/missing ratings */}
                        <Text style={styles.ratingText}>
                            {(item.rating || 0).toFixed(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.middleRow}>
                    <Text style={styles.priceText}>
                        ₦{item.price || "0"}<Text style={styles.perDay}>/day</Text>
                    </Text>
                    <TouchableOpacity onPress={handleNavigationToviewdetails}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.reserveButton}
                    activeOpacity={0.8}
                    onPress={handleNavigationToreservenow}
                >
                    <Text style={styles.reserveButtonText}>Reserve now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (isTablet: boolean, theme: Theme) => StyleSheet.create({
    card: {
        width: isTablet ? 220 : 180,
        marginBottom: 15,
        marginRight: isTablet ? 12 : 10,
    },
    imageWrapper: {
        width: '100%',
        height: isTablet ? 140 : 120,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    adBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF2D55',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        zIndex: 2,
    },
    adText: {
        color: 'white',
        fontSize: 9,
        fontWeight: '800',
    } as TextStyle,
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    details: {
        paddingTop: 8,
        paddingHorizontal: 2,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationName: {
        flex: 1,
        fontSize: isTablet ? 14 : 12,
        color: theme.text,
        fontWeight: '700',
        marginRight: 6,
    } as TextStyle,
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: theme.background,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 20,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.text,
    } as TextStyle,
    middleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    priceText: {
        fontSize: isTablet ? 13 : 11,
        color: theme.text,
        fontWeight: '700',
    } as TextStyle,
    perDay: {
        fontSize: 10,
        color: theme.textSecondary,
        fontWeight: '400',
    } as TextStyle,
    viewDetailsText: {
        fontSize: isTablet ? 11 : 10,
        color: '#FF2D55',
        fontWeight: '600',
    } as TextStyle,
    reserveButton: {
        backgroundColor: '#FF2D55',
        height: isTablet ? 34 : 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reserveButtonText: {
        color: 'white',
        fontSize: isTablet ? 12 : 11,
        fontWeight: '700',
    } as TextStyle,
});