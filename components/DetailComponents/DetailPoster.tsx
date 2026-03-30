import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    useColorScheme,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function DetailPoster({ isTablet, item }: { isTablet: boolean, item: LocationItem }) {
    // 1. HOOKS FIRST: Initialize all hooks at the top
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { toggleWishlist, isItemWished } = useWishlistStore();

    // 2. IMAGE EXCEPTION: Fallback for empty image arrays
    const displayImages = useMemo(() => {
        return (item.images && item.images.length > 0)
            ? item.images
            : [require('@/assets/images/resturant.jpg')];
    }, [item.images]);

    // Auto-transition logic with Safety Guards
    useEffect(() => {
        if (displayImages.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % displayImages.length;

            // Safety: Ensure the ref is valid before scrolling
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setActiveIndex(nextIndex);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [activeIndex, displayImages.length]);


    // 3. EXCEPTION: Early return after hooks to satisfy React rules
    if (!item || !item.id) return null;

    const isWished = isItemWished(item.id);
    const containerWidth = isTablet ? 450 : 320;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / (containerWidth - 16));
        if (index !== activeIndex && index >= 0 && index < displayImages.length) {
            setActiveIndex(index);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.posterWrapper, {
                width: containerWidth,
                backgroundColor: colorScheme === 'dark' ? '#111' : '#F5F5F5',
                borderColor: theme.border
            }]}>

                {/* WISHLIST HEART BUTTON */}
                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isWished ? "heart" : "heart-outline"}
                        size={22}
                        color={isWished ? "#FF2D55" : "#888"}
                    />
                </TouchableOpacity>

                <FlatList
                    ref={flatListRef}
                    data={displayImages}
                    horizontal
                    pagingEnabled
                    snapToAlignment="center"
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: img }) => (
                        <View style={{ width: containerWidth - 16 }}>
                            <Image
                                source={img}
                                style={styles.mainImage}
                                contentFit="cover"
                                transition={400}
                                cachePolicy="disk"
                                // Network Exception Placeholder
                                placeholder={{ uri: 'https://placehold.jp/24/f0f0f0/cccccc/300x200.png?text=GetSeen' }}
                            />
                        </View>
                    )}
                />

                {/* PAGINATION DOTS */}
                {displayImages.length > 1 && (
                    <View style={styles.pagination}>
                        {displayImages.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    { backgroundColor: i === activeIndex ? '#FF2D55' : 'rgba(150,150,150,0.4)' }
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    mainImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 18,
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});