import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Text,
    ActivityIndicator,
    RefreshControl,
    useWindowDimensions,
    TouchableOpacity,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useReviewStore } from '@/store/useReviewStore';
import { ReviewStatus, Review } from '@/api/reviewService';

// Reusing generic styles similar to wishlist/cart
const TABS: { id: ReviewStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
];

export default function MyReviewsScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const {
        advertiserReviews,
        loading,
        refreshing,
        selectedAdvertiserStatus,
        setSelectedAdvertiserStatus,
        fetchAdvertiserReviews,
        loadMoreAdvertiserReviews,
        refreshAdvertiserReviews
    } = useReviewStore();

    useEffect(() => {
        fetchAdvertiserReviews({ forceRefresh: true });
    }, []);

    const handleTabChange = useCallback((status: ReviewStatus) => {
        setSelectedAdvertiserStatus(status);
        fetchAdvertiserReviews({ page: 1, status, forceRefresh: true });
    }, [setSelectedAdvertiserStatus, fetchAdvertiserReviews]);

    const renderReviewCard = ({ item }: { item: Review }) => {
        // Status Colors
        let statusColor = theme.textSecondary;
        if (item.status === 'approved') statusColor = '#1E7E34'; // Green
        else if (item.status === 'pending') statusColor = '#F5A623'; // Orange
        else if (item.status === 'rejected') statusColor = '#D11243'; // Red

        return (
            <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.screenTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.screen?.title || 'Unknown Screen'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {String(item.status).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {item.order?.order_number && (
                    <Text style={[styles.orderNumber, { color: theme.textSecondary }]}>
                        Order: {item.order.order_number}
                    </Text>
                )}

                <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= item.rating ? 'star' : 'star-outline'}
                            size={16}
                            color={star <= item.rating ? '#FFD700' : theme.textSecondary + '50'}
                            style={{ marginRight: 2 }}
                        />
                    ))}
                    <Text style={[styles.ratingNumber, { color: theme.textSecondary }]}>
                        ({item.rating}/5)
                    </Text>
                </View>

                {item.review_text && (
                    <Text style={[styles.reviewText, { color: theme.text }]} numberOfLines={3}>
                        "{item.review_text}"
                    </Text>
                )}
            </View>
        );
    };

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={60} color={theme.tint + '80'} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Reviews Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {selectedAdvertiserStatus === 'all'
                    ? "You haven't submitted any reviews yet."
                    : `You have no ${selectedAdvertiserStatus} reviews.`}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Reviews</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {TABS.map((tab) => {
                    const isActive = selectedAdvertiserStatus === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabButton,
                                {
                                    backgroundColor: isActive ? theme.tint + '15' : 'transparent',
                                    borderBottomColor: isActive ? theme.tint : 'transparent'
                                }
                            ]}
                            onPress={() => handleTabChange(tab.id)}
                        >
                            <Text style={[
                                styles.tabText,
                                {
                                    color: isActive ? theme.tint : theme.textSecondary,
                                    fontWeight: isActive ? '600' : '400'
                                }
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            {loading && advertiserReviews.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={advertiserReviews}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    renderItem={renderReviewCard}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
                    ListEmptyComponent={ListEmptyComponent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refreshAdvertiserReviews} tintColor={theme.tint} />
                    }
                    onEndReached={loadMoreAdvertiserReviews}
                    onEndReachedThreshold={0.5}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 14,
    },
    listContent: {
        padding: 20,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    screenTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    orderNumber: {
        fontSize: 13,
        marginBottom: 12,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ratingNumber: {
        fontSize: 13,
        marginLeft: 6,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    emptyContainer: {
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
