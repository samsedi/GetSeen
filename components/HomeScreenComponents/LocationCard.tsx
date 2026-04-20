import React, { useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useReservationStore } from '@/store/useReservationStore';

type Theme = typeof Colors.light;

interface LocationCardProps {
    item: LocationItem;
}

/**
 * Wrapped in React.memo so the FlatList only re-renders cards whose
 * item reference has actually changed (e.g. wishlist toggle).
 */
function LocationCard({ item }: LocationCardProps) {
    const { toggleWishlist, isItemWished } = useWishlistStore();

    /**
     * FIX: Subscribe only to the action, not the full store slice.
     * Actions are stable references in Zustand — this component will
     * never re-render because of reservation-store state changes.
     */
    const openReservation = useReservationStore((state) => state.openReservation);

    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme as 'light' | 'dark'];
    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);
    const router = useRouter();

    // useCallback so the function reference is stable across renders
    const handleNavigate = useCallback(() => {
        router.push({
            pathname: '/homeSubScreens/viewdetails',
            params: { id: item.id },
        });
    }, [router, item.id]);

    const handleWishlist = useCallback(() => {
        toggleWishlist(item);
    }, [toggleWishlist, item]);

    const handleReserve = useCallback(() => {
        openReservation(item);
    }, [openReservation, item]);

    if (!item || !item.id) return null;

    const isWished = isItemWished(item.id);

    const displayImage =
        item.images && item.images.length > 0
            ? item.images[0]
            : require('@/assets/images/resturant.jpg');

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={handleNavigate}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={displayImage}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="disk"
                    transition={200}
                    placeholder={{
                        uri: 'https://placehold.jp/24/f0f0f0/cccccc/300x200.png?text=Loading...',
                    }}
                />

                <View style={styles.adBadge}>
                    <Text style={styles.adText}>Ad here</Text>
                </View>

                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={handleWishlist}
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
                    <Text style={styles.locationName} numberOfLines={1}>
                        {item.name || 'Unnamed Location'}
                    </Text>

                    <View style={styles.ratingPill}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {(item.rating || 0).toFixed(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.middleRow}>
                    <Text style={styles.priceText}>
                        ₦{item.price || '0'}
                        <Text style={styles.perDay}>/day</Text>
                    </Text>
                    <TouchableOpacity onPress={handleNavigate}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.reserveButton}
                    activeOpacity={0.8}
                    onPress={handleReserve}
                >
                    <Text style={styles.reserveButtonText}>Reserve now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

export default React.memo(LocationCard);

const createStyles = (isTablet: boolean, theme: Theme) =>
    StyleSheet.create({
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
        image: { width: '100%', height: '100%' },
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
        adText: { color: 'white', fontSize: 9, fontWeight: '800' },
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
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        details: { paddingTop: 8, paddingHorizontal: 2 },
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
        },
        ratingPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            backgroundColor: theme.background,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 20,
        },
        ratingText: { fontSize: 10, fontWeight: '700', color: theme.text },
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
        },
        perDay: {
            fontSize: 10,
            color: theme.textSecondary,
            fontWeight: '400',
        },
        viewDetailsText: {
            fontSize: isTablet ? 11 : 10,
            color: '#FF2D55',
            fontWeight: '600',
        },
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
        },
    });
