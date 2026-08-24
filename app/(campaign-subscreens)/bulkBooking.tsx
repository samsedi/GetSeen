import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBulkBookingStore } from '@/store/useBulkBookingStore';
import { BulkScreen, BulkSortOption } from '@/api/bulkBookingService';

// ─────────────────────────────────────────────────────────────
// Duration options
// ─────────────────────────────────────────────────────────────

const SORT_OPTIONS: { id: BulkSortOption; label: string }[] = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'price_low', label: 'Price: Low → High' },
    { id: 'price_high', label: 'Price: High → Low' },
    { id: 'name_asc', label: 'Name: A → Z' },
    { id: 'name_desc', label: 'Name: Z → A' },
];

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function BulkBookingScreen() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const {
        screens,
        states: stateOptions,
        categories: categoryOptions,
        isLoading,
        isFetchingMore,
        hasMore,
        search,
        stateId,
        categoryId,
        sort,
        selectedIds,
        schedule,
        isSubmitting,
        fetchScreens,
        setSearch,
        setStateFilter,
        setCategoryFilter,
        setSort,
        applyFilters,
        toggleScreen,
        selectAll,
        deselectAll,
        setSchedule,
        submitToCart,
        reset,
    } = useBulkBookingStore();

    // Local state for UI controls
    const [showFilters, setShowFilters] = useState(false);
    const [localSearch, setLocalSearch] = useState(search);
    const [showSortModal, setShowSortModal] = useState(false);

    // Read schedule from route params (set by BulkScheduleModal)
    const params = useLocalSearchParams<{
        duration?: string;
        duration_multiplier?: string;
        start_date?: string;
        end_date?: string;
    }>();

    useEffect(() => {
        reset();

        // Apply schedule from route params
        if (params.duration) {
            setSchedule({
                duration: params.duration as any,
                duration_multiplier: Number(params.duration_multiplier) || 1,
                start_date: params.start_date || schedule.start_date,
                end_date: params.end_date || schedule.end_date,
            });
        }

        fetchScreens(true);
        return () => reset();
    }, []);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearch !== search) {
                setSearch(localSearch);
                applyFilters();
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [localSearch]);

    const selectedCount = selectedIds.size;

    // Calculate price for a screen based on selected duration
    const getPriceForScreen = useCallback((screen: BulkScreen): number => {
        switch (schedule.duration) {
            case 'daily': return screen.daily_price * schedule.duration_multiplier;
            case 'weekly': return screen.weekly_price * schedule.duration_multiplier;
            case 'monthly': return screen.monthly_price * schedule.duration_multiplier;
            default: return screen.weekly_price;
        }
    }, [schedule.duration, schedule.duration_multiplier]);

    // Calculate total price for selected screens
    const totalPrice = useMemo(() => {
        return screens
            .filter(s => selectedIds.has(s.id))
            .reduce((sum, s) => sum + getPriceForScreen(s), 0);
    }, [screens, selectedIds, getPriceForScreen]);

    const handleSubmit = async () => {
        const result = await submitToCart();
        if (result.success) {
            Alert.alert(
                'Added to Cart!',
                result.message,
                [{ text: 'Go to Cart', onPress: () => router.push('/homeSubScreens/cartscreen') }]
            );
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const handleLoadMore = () => {
        if (!isFetchingMore && hasMore) {
            fetchScreens(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Render helpers
    // ─────────────────────────────────────────────────────────

    const renderScreenCard = ({ item }: { item: BulkScreen }) => {
        const isSelected = selectedIds.has(item.id);
        const price = getPriceForScreen(item);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleScreen(item.id)}
                style={[
                    styles.screenCard,
                    {
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.tint : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                    },
                ]}
            >
                {/* Checkbox */}
                <View style={[
                    styles.checkbox,
                    {
                        backgroundColor: isSelected ? theme.tint : 'transparent',
                        borderColor: isSelected ? theme.tint : theme.textSecondary,
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <Text style={[styles.screenTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                        <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.location}
                        </Text>
                    </View>
                    <Text style={[styles.minBooking, { color: theme.textSecondary }]}>
                        Min: {item.min_booking_days} days
                    </Text>
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, { color: theme.tint }]}>
                        ₦{price.toLocaleString('en-NG')}
                    </Text>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                        {schedule.duration_multiplier > 1 ? `${schedule.duration_multiplier}x ` : ''}{schedule.duration}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderListFooter = () => (
        <View style={{ paddingBottom: 160 }}>
            {isFetchingMore && (
                <ActivityIndicator size="small" color={theme.tint} style={{ marginVertical: 16 }} />
            )}
        </View>
    );

    const renderEmpty = () => (
        !isLoading ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={theme.textSecondary + '40'} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No screens found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Try adjusting your filters or search query.
                </Text>
            </View>
        ) : null
    );

    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    return (
        <View style={[styles.root, { backgroundColor: theme.background }]}>

            {/* ─── HEADER ─── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Bulk Booking</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Select screens & schedule
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setShowSortModal(true)}
                >
                    <Ionicons name="swap-vertical-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* ─── SCHEDULE SUMMARY BANNER ─── */}
            <View style={[styles.scheduleBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="calendar" size={20} color={theme.tint} />
                <View style={styles.scheduleBannerInfo}>
                    <Text style={[styles.scheduleBannerTitle, { color: theme.text }]}>
                        {schedule.duration.charAt(0).toUpperCase() + schedule.duration.slice(1)} × {schedule.duration_multiplier}
                    </Text>
                    <Text style={[styles.scheduleBannerDates, { color: theme.textSecondary }]}>
                        {schedule.start_date} → {schedule.end_date}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.scheduleBannerEdit}>
                    <Ionicons name="create-outline" size={18} color={theme.tint} />
                    <Text style={[styles.scheduleBannerEditText, { color: theme.tint }]}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* ─── SEARCH & FILTER BAR ─── */}
            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={18} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search screens..."
                        placeholderTextColor={theme.textSecondary}
                        value={localSearch}
                        onChangeText={setLocalSearch}
                    />
                    {localSearch.length > 0 && (
                        <TouchableOpacity onPress={() => { setLocalSearch(''); setSearch(''); applyFilters(); }}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.filterToggle, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name="options-outline" size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* ─── FILTER CHIPS (collapsible) ─── */}
            {showFilters && (
                <View style={styles.filterSection}>
                    {/* State filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
                        <TouchableOpacity
                            style={[styles.filterChip, { backgroundColor: !stateId ? theme.tint : theme.card, borderColor: !stateId ? theme.tint : theme.border }]}
                            onPress={() => { setStateFilter(undefined); applyFilters(); }}
                        >
                            <Text style={[styles.filterChipText, { color: !stateId ? '#FFF' : theme.text }]}>All States</Text>
                        </TouchableOpacity>
                        {stateOptions.map(s => {
                            const isActive = stateId === s.id;
                            return (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.tint : theme.card, borderColor: isActive ? theme.tint : theme.border }]}
                                    onPress={() => { setStateFilter(s.id); applyFilters(); }}
                                >
                                    <Text style={[styles.filterChipText, { color: isActive ? '#FFF' : theme.text }]}>{s.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Category filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
                        <TouchableOpacity
                            style={[styles.filterChip, { backgroundColor: !categoryId ? theme.tint : theme.card, borderColor: !categoryId ? theme.tint : theme.border }]}
                            onPress={() => { setCategoryFilter(undefined); applyFilters(); }}
                        >
                            <Text style={[styles.filterChipText, { color: !categoryId ? '#FFF' : theme.text }]}>All Categories</Text>
                        </TouchableOpacity>
                        {categoryOptions.map(c => {
                            const isActive = categoryId === c.id;
                            return (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.filterChip, { backgroundColor: isActive ? theme.tint : theme.card, borderColor: isActive ? theme.tint : theme.border }]}
                                    onPress={() => { setCategoryFilter(c.id); applyFilters(); }}
                                >
                                    <Text style={[styles.filterChipText, { color: isActive ? '#FFF' : theme.text }]}>{c.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* ─── SELECT ALL / DESELECT ALL ─── */}
            {screens.length > 0 && (
                <View style={styles.selectionBar}>
                    <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
                        {screens.length} screen{screens.length !== 1 ? 's' : ''} found
                    </Text>
                    <TouchableOpacity onPress={selectedCount === screens.length ? deselectAll : selectAll}>
                        <Text style={[styles.selectAllText, { color: theme.tint }]}>
                            {selectedCount === screens.length ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── SCREEN LIST ─── */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading screens...</Text>
                </View>
            ) : (
                <FlatList
                    data={screens}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderScreenCard}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderListFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* ─── BOTTOM ACTION BAR ─── */}
            {selectedCount > 0 && (
                <View style={[styles.bottomBar, { backgroundColor: theme.card, borderColor: theme.border, paddingBottom: insets.bottom + 16 }]}>
                    <View style={styles.bottomBarInfo}>
                        <Text style={[styles.bottomBarCount, { color: theme.text }]}>
                            {selectedCount} screen{selectedCount !== 1 ? 's' : ''} selected
                        </Text>
                        <Text style={[styles.bottomBarPrice, { color: theme.tint }]}>
                            ₦{totalPrice.toLocaleString('en-NG')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addToCartButton, { backgroundColor: theme.tint, opacity: isSubmitting ? 0.7 : 1 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="cart" size={20} color="#FFF" />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* ─── SORT MODAL ─── */}
            <Modal visible={showSortModal} transparent animationType="fade" onRequestClose={() => setShowSortModal(false)}>
                <Pressable style={styles.sortOverlay} onPress={() => setShowSortModal(false)}>
                    <View style={[styles.sortSheet, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sortTitle, { color: theme.text }]}>Sort By</Text>
                        {SORT_OPTIONS.map(opt => {
                            const isActive = sort === opt.id;
                            return (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.sortOption, isActive && { backgroundColor: theme.tint + '15' }]}
                                    onPress={() => {
                                        setSort(opt.id);
                                        applyFilters();
                                        setShowSortModal(false);
                                    }}
                                >
                                    <Text style={[styles.sortOptionText, { color: isActive ? theme.tint : theme.text }]}>
                                        {opt.label}
                                    </Text>
                                    {isActive && <Ionicons name="checkmark" size={20} color={theme.tint} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    root: {
        flex: 1,
    },

    // Header
    header: {
        paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12),
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    sortButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Schedule banner
    scheduleBanner: {
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scheduleBannerInfo: {
        flex: 1,
    },
    scheduleBannerTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    scheduleBannerDates: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    scheduleBannerEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scheduleBannerEditText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Search
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 12,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    filterToggle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Filters
    filterSection: {
        paddingTop: 10,
        gap: 8,
    },
    filterChipScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // Selection bar
    selectionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    resultCount: {
        fontSize: 13,
        fontWeight: '600',
    },
    selectAllText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Screen card
    screenCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 16,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardContent: {
        flex: 1,
    },
    screenTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    minBooking: {
        fontSize: 11,
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    priceText: {
        fontSize: 15,
        fontWeight: '900',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },

    // List
    listContent: {
        paddingTop: 4,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 12 },
        }),
    },
    bottomBarInfo: {
        flex: 1,
    },
    bottomBarCount: {
        fontSize: 14,
        fontWeight: '700',
    },
    bottomBarPrice: {
        fontSize: 20,
        fontWeight: '900',
        marginTop: 2,
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },

    // Sort modal
    sortOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sortSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: insets.bottom + 24,
    },
    sortTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    sortOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
