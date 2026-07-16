import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    useColorScheme,
    TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import VideoPlayerItem from '@/components/VideoPlayerItem';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ScreenResponseDto } from '@/api/screenService';

export default function DetailPoster({ isTablet, item }: { isTablet: boolean; item: ScreenResponseDto }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { toggleWishlist, isItemWished } = useWishlistStore();

    const validMediaUrls = useMemo(() => {
        if (!item.mediaUrls) return [];
        return item.mediaUrls.filter(url => url && url.startsWith('http'));
    }, [item.mediaUrls]);

    const hasImages = validMediaUrls.length > 0;

    const currentUrl = validMediaUrls[activeIndex];
    const isCurrentVideo = currentUrl && currentUrl.toLowerCase().includes('.mp4');

    useEffect(() => {
        if (validMediaUrls.length <= 1 || isCurrentVideo) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % validMediaUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [validMediaUrls.length, isCurrentVideo, activeIndex]);

    if (!item || !item.id) return null;

    const isWished = isItemWished(item.id);
    const containerWidth = isTablet ? 450 : 320;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.posterWrapper, {
                width: containerWidth,
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
            }]}>

                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isWished ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isWished ? theme.tint : theme.textSecondary}
                    />
                </TouchableOpacity>

                {/* Single Media that swaps source based on activeIndex */}
                {(() => {
                    const activeUrl = hasImages ? validMediaUrls[activeIndex] : null;
                    const isVideo = activeUrl && activeUrl.toLowerCase().includes('.mp4');
                    return isVideo ? (
                        <VideoPlayerItem
                            uri={activeUrl!}
                            style={styles.mainImage}
                            onFinish={() => {
                                setActiveIndex(prev => (prev + 1) % validMediaUrls.length);
                            }}
                            shouldPlay={true}
                        />
                    ) : (
                        <Image
                            source={
                                hasImages
                                    ? { uri: activeUrl! }
                                    : require('@/assets/images/resturant.jpg')
                            }
                            style={styles.mainImage}
                            contentFit="cover"
                            transition={500}
                            cachePolicy="disk"
                        />
                    );
                })()}

                {/* Tap left/right zones to manually swipe */}
                <View style={styles.tapZones}>
                    <TouchableOpacity
                        style={styles.tapZone}
                        activeOpacity={1}
                        onPress={() =>
                            setActiveIndex(prev =>
                                prev === 0 ? validMediaUrls.length - 1 : prev - 1
                            )
                        }
                    />
                    <TouchableOpacity
                        style={styles.tapZone}
                        activeOpacity={1}
                        onPress={() =>
                            setActiveIndex(prev => (prev + 1) % validMediaUrls.length)
                        }
                    />
                </View>

                {validMediaUrls.length > 1 && (
                    <View style={styles.pagination}>
                        {validMediaUrls.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            i === activeIndex
                                                ? theme.tint
                                                : theme.textMuted,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    posterWrapper: {
        alignSelf: 'center',
        aspectRatio: 1,
        marginTop: 20,
        borderRadius: 16,
        padding: 8,
        position: 'relative',
        borderWidth: 1,
        overflow: 'hidden',
    },
    heartButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    mainImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    tapZones: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        zIndex: 5,
    },
    tapZone: {
        flex: 1,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 18,
        alignSelf: 'center',
        gap: 6,
        zIndex: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});