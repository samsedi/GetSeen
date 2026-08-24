import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Skeleton placeholder for ViewDetails.
 * Shows the full page skeleton immediately while the real data loads.
 * Text sections appear first, images stream in after.
 */
export default function ViewDetailsSkeleton({ isTablet }: { isTablet: boolean }) {
    const { width } = useWindowDimensions();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme as 'light' | 'dark'];

    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, [shimmer]);

    const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

    const isDark = colorScheme === 'dark';
    const baseColor = isDark ? '#2a2a2a' : '#e0e0e0';

    const Block = ({ w, h, radius = 8, mt = 0 }: { w: number | string; h: number; radius?: number; mt?: number }) => (
        <Animated.View
            style={{
                width: w as any,
                height: h,
                borderRadius: radius,
                backgroundColor: baseColor,
                marginTop: mt,
                opacity,
            }}
        />
    );

    const posterWidth = isTablet ? 450 : 320;
    const posterHeight = isTablet ? 280 : 220;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Poster area skeleton */}
            <View style={[styles.posterSection, { alignItems: 'center' }]}>
                <Block w={posterWidth} h={posterHeight} radius={20} />
                {/* Thumbnail strip */}
                <View style={styles.thumbRow}>
                    {[0, 1, 2].map(i => (
                        <Block key={i} w={isTablet ? 70 : 56} h={isTablet ? 55 : 44} radius={10} mt={0} />
                    ))}
                </View>
            </View>

            {/* Content area skeleton — text loads fast, shown right away */}
            <View style={styles.contentSection}>
                {/* Title */}
                <Block w="70%" h={isTablet ? 26 : 20} radius={6} />
                <Block w="45%" h={isTablet ? 18 : 14} radius={6} mt={8} />

                {/* Price tag */}
                <Block w="35%" h={isTablet ? 22 : 18} radius={6} mt={16} />

                {/* Section header */}
                <Block w="40%" h={isTablet ? 18 : 14} radius={6} mt={24} />

                {/* Info rows */}
                {[1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={styles.infoRow}>
                        <Block w="30%" h={12} radius={4} />
                        <Block w="50%" h={12} radius={4} />
                    </View>
                ))}

                {/* Reserve button */}
                <Block w="100%" h={isTablet ? 52 : 44} radius={24} mt={28} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    posterSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 10,
    },
    thumbRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    contentSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});
