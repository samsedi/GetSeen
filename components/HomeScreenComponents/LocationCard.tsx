import React, { useMemo } from 'react';
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
import { Image } from 'expo-image';
import { ScreenResponseDto } from '@/api/screenService';
import { useLocationCard } from '@/hooks/useLocationCard';

type Theme = typeof Colors.light;

interface LocationCardProps {
    item: ScreenResponseDto;
    numColumns?: number;
}

function LocationCard({ item, numColumns = 1 }: LocationCardProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme as 'light' | 'dark'];
    const styles = useMemo(() => createStyles(isTablet, theme, numColumns), [isTablet, theme, numColumns]);

    // If numColumns is > 1 (Grid view), calculate dynamic width. Otherwise, use fixed carousel width.
    const containerPadding = 40; // 20 left + 20 right
    const gapTotal = (numColumns - 1) * 10;
    const dynamicWidth = (width - containerPadding - gapTotal) / numColumns;
    
    const cardWidth = numColumns > 1 ? dynamicWidth : (isTablet ? 220 : 180);
    const cardHeight = numColumns > 1 ? (isTablet ? 140 : 100) : (isTablet ? 140 : 120);


    const {
        activeIndex,
        validMediaUrls,
        handleNavigate,
        handleWishlist,
        handleReserve,
        isWished,
        handleVideoEnd,
    } = useLocationCard(item);

    if (!item || !item.id) return null;

    return (
        <TouchableOpacity style={[styles.card, { width: cardWidth }]} activeOpacity={0.9} onPress={handleNavigate}>
            <View style={[styles.imageWrapper, { height: cardHeight }]}>

                <View style={StyleSheet.absoluteFill}>
                    {validMediaUrls.length > 0 ? (
                        (() => {
                            const activeUrl = validMediaUrls[activeIndex];
                            const isVideo = activeUrl.toLowerCase().includes('.mp4') ||
                                            activeUrl.toLowerCase().includes('.mov') ||
                                            activeUrl.toLowerCase().includes('.webm');

                            // For videos in the list: show the FIRST image as a thumbnail.
                            // The video only plays inside the View Details page.
                            const thumbnailUrl = isVideo
                                ? (validMediaUrls.find(u => !u.toLowerCase().includes('.mp4') && !u.toLowerCase().includes('.mov') && !u.toLowerCase().includes('.webm')) ?? null)
                                : activeUrl;

                            return (
                                <>
                                    <Image
                                        source={thumbnailUrl ? { uri: thumbnailUrl } : require('@/assets/images/resturant.jpg')}
                                        style={{ width: cardWidth, height: cardHeight }}
                                        contentFit="cover"
                                        cachePolicy="disk"
                                        transition={300}
                                    />
                                    {/* Play button overlay for video cards */}
                                    {isVideo && (
                                        <View style={styles.playButtonOverlay}>
                                            <View style={styles.playButton}>
                                                <Ionicons name="play" size={numColumns > 1 ? 12 : 16} color="white" />
                                            </View>
                                        </View>
                                    )}
                                </>
                            );
                        })()
                    ) : (
                        <Image
                            source={require('@/assets/images/resturant.jpg')}
                            style={{ width: cardWidth, height: cardHeight }}
                            contentFit="cover"
                        />
                    )}
                </View>

                {/* Overlays */}
                <View style={styles.adBadge}>
                    <Text style={styles.adText}>Ad here</Text>
                </View>

                <TouchableOpacity style={styles.heartButton} onPress={handleWishlist} activeOpacity={0.8}>
                    <Ionicons
                        name={isWished ? 'heart' : 'heart-outline'}
                        size={14}
                        color={isWished ? '#FF2D55' : '#888'}
                    />
                </TouchableOpacity>

                {/* Pagination Dots */}
                {validMediaUrls.length > 1 && (
                    <View style={styles.paginationOverlay}>
                        {validMediaUrls.map((_, i) => (
                            <View key={i} style={[styles.dot, activeIndex === i && styles.activeDot]} />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.locationName} numberOfLines={1}>
                        {item.name || 'Unnamed Location'}
                    </Text>
                    <View style={styles.ratingPill}>
                        <Ionicons name="star" size={10} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating && item.rating.count > 0 ? item.rating.average.toFixed(1) : 'New'}</Text>
                    </View>
                </View>

                <View style={styles.middleRow}>
                    <Text style={styles.priceText}>
                        ₦{item.priceDaily?.toLocaleString('en-NG') || '0'}
                        <Text style={styles.perDay}>/day</Text>
                    </Text>
                    <TouchableOpacity onPress={handleNavigate}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.reserveButton} activeOpacity={0.8} onPress={handleReserve}>
                    <Text style={styles.reserveButtonText}>Reserve now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

export default React.memo(LocationCard);

const createStyles = (isTablet: boolean, theme: Theme, numColumns: number) =>
    StyleSheet.create({
        card: {
            marginBottom: 15,
            marginRight: numColumns > 1 ? 0 : (isTablet ? 12 : 10),
        },
        imageWrapper: {
            width: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#111',
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
            fontSize: numColumns > 1 ? 7 : 9,
            fontWeight: '800',
        },
        heartButton: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
            width: numColumns > 1 ? 22 : 26,
            height: numColumns > 1 ? 22 : 26,
            borderRadius: numColumns > 1 ? 11 : 13,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            zIndex: 2,
        },
        paginationOverlay: {
            position: 'absolute',
            bottom: 8,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
            zIndex: 2,
        },
        dot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.5)',
        },
        activeDot: {
            backgroundColor: 'white',
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        playButtonOverlay: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3,
        },
        playButton: {
            width: numColumns > 1 ? 28 : 36,
            height: numColumns > 1 ? 28 : 36,
            borderRadius: numColumns > 1 ? 14 : 18,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.6)',
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
            fontSize: numColumns > 1 ? (isTablet ? 12 : 10) : (isTablet ? 14 : 12),
            color: theme.text,
            fontWeight: '700',
            marginRight: 4,
        },
        ratingPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            backgroundColor: theme.background,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 20,
        },
        ratingText: {
            fontSize: numColumns > 1 ? 8 : 10,
            fontWeight: '700',
            color: theme.text,
        },
        middleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            flexWrap: 'wrap',
        },
        priceText: {
            fontSize: numColumns > 1 ? (isTablet ? 11 : 9) : (isTablet ? 13 : 11),
            color: theme.text,
            fontWeight: '700',
        },
        perDay: {
            fontSize: numColumns > 1 ? 8 : 10,
            color: theme.textSecondary,
            fontWeight: '400',
        },
        viewDetailsText: {
            fontSize: numColumns > 1 ? (isTablet ? 9 : 8) : (isTablet ? 11 : 10),
            color: '#FF2D55',
            fontWeight: '600',
        },
        reserveButton: {
            backgroundColor: '#FF2D55',
            height: numColumns > 1 ? (isTablet ? 28 : 24) : (isTablet ? 34 : 30),
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        reserveButtonText: {
            color: 'white',
            fontSize: numColumns > 1 ? (isTablet ? 10 : 9) : (isTablet ? 12 : 11),
            fontWeight: '700',
        },
    });