import React, { useMemo } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    useWindowDimensions, ScrollView
} from 'react-native';
import { useAppTheme, AppTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import VideoPlayerItem from '@/components/VideoPlayerItem';
import { useScreenCarousel } from '@/hooks/useScreenCarousel';

export interface ScreenItem {
    id: string;
    name: string;
    status: string;
    location: string;
    resolution: string;
    activeAds: number;
    images: string[];
    verificationStatus: string;
}

interface ScreenCardProps {
    item: ScreenItem;
    ownerTint: string;
}

export default function ScreenCard({ item, ownerTint }: ScreenCardProps) {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();

    const CARD_WIDTH = isTablet ? 160 : 130;
    const IMAGE_HEIGHT = isTablet ? 110 : 90;

    const {
        activeIndex,
        scrollRef,
        handleScroll,
        onScrollBeginDrag,
        onMomentumScrollEnd,
        advanceToNext
    } = useScreenCarousel(item.images, CARD_WIDTH, 2500);

    const styles = useMemo(
        () => createStyles(CARD_WIDTH, IMAGE_HEIGHT, isTablet, theme, ownerTint),
        [CARD_WIDTH, IMAGE_HEIGHT, isTablet, theme, ownerTint]
    );

    const isOnline = item.status === 'Online';
    const isDraft = item.status === 'Draft';
    const statusColor = isDraft
        ? theme.textSecondary
        : isOnline ? theme.success : theme.error;

    const handleManagePress = () => {
        if (isDraft) {
            router.replace({
                pathname: '/(screen-owner-tabs)/add-screen',
                params: { draftId: item.id, timestamp: Date.now() }
            });
        } else {
            router.push({
                pathname: "/screen-owner-homeSubScreens/manage-screen",
                params: {
                    id: item.id,
                    name: item.name,
                    status: item.status,
                    location: item.location,
                    resolution: item.resolution,
                    activeAds: item.activeAds.toString(),
                    image: item.images[0],
                    verificationStatus: item.verificationStatus
                }
            });
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.imageWrapper}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    onScrollBeginDrag={onScrollBeginDrag}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    directionalLockEnabled
                    bounces={false}
                    style={{ width: CARD_WIDTH }}
                    contentContainerStyle={{ width: CARD_WIDTH * item.images.length }}
                >
                    {item.images.map((imgUri, index) => {
                        const isVideo = imgUri.toLowerCase().includes('.mp4');
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.9}
                                onPress={handleManagePress}
                            >
                                {isVideo ? (
                                    <VideoPlayerItem
                                        uri={imgUri}
                                        style={styles.image}
                                        onFinish={advanceToNext}
                                        shouldPlay={index === activeIndex}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: imgUri }}
                                        style={styles.image}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>

                {/* Dot indicator */}
                {item.images.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {item.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === activeIndex
                                        ? { backgroundColor: '#FFFFFF', width: 12 }
                                        : { backgroundColor: 'rgba(255,255,255,0.45)', width: 5 }
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.nameRow}>
                    <Text style={styles.screenName} numberOfLines={1}>{item.name}</Text>
                </View>

                <View style={styles.middleRow}>
                    <Text style={styles.adsText}>
                        {item.activeAds} <Text style={styles.adsLabel}>Active Ads</Text>
                    </Text>
                    <Text style={styles.resolutionText}>{item.resolution}</Text>
                </View>

                <TouchableOpacity
                    style={styles.manageButton}
                    activeOpacity={0.8}
                    onPress={handleManagePress}
                >
                    <Text style={styles.manageButtonText}>
                        {isDraft ? "Continue Setup" : "Manage Screen"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (CARD_WIDTH: number, IMAGE_HEIGHT: number, isTablet: boolean, theme: AppTheme, ownerTint: string) => StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        marginBottom: 15,
        marginRight: isTablet ? 12 : 10,
    },
    imageWrapper: {
        width: CARD_WIDTH,
        height: IMAGE_HEIGHT,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.cardSoft,
    },
    image: {
        width: CARD_WIDTH,
        height: IMAGE_HEIGHT,
    },
    statusBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    statusText: { color: 'white', fontSize: 8, fontWeight: '800' },
    dotsContainer: {
        position: 'absolute',
        bottom: 6,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        zIndex: 2,
    },
    dot: {
        height: 5,
        borderRadius: 3,
    },
    details: { paddingTop: 8, paddingHorizontal: 2 },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    screenName: {
        flex: 1,
        fontSize: isTablet ? 13 : 11,
        color: theme.text,
        fontWeight: '700',
        marginRight: 4,
    },
    middleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    adsText: {
        fontSize: isTablet ? 12 : 10,
        color: theme.text,
        fontWeight: '700',
    },
    adsLabel: {
        fontSize: 9,
        color: theme.textSecondary,
        fontWeight: '400',
    },
    resolutionText: {
        fontSize: isTablet ? 10 : 9,
        color: theme.textSecondary,
        fontWeight: '600',
    },
    manageButton: {
        backgroundColor: ownerTint,
        height: isTablet ? 28 : 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    manageButtonText: {
        color: 'white',
        fontSize: isTablet ? 11 : 10,
        fontWeight: '600',
    },
});