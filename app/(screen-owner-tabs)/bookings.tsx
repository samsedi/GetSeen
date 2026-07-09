import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    Platform,
    Animated,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { BookingCard, Booking } from '@/components/ScreenOwnerComponents/BookingsComponents/BookingCard';
import { fetchOwnerBookings, CampaignData } from '@/api/campaignService';

export default function BookingsScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    const ownerTint = theme.brandNavy;
    const styles = useMemo(() => createStyles(isTablet, theme, insets), [isTablet, theme, insets]);

    const scrollY = useRef(new Animated.Value(0)).current;

    const [bookings, setBookings] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<CampaignData | null>(null);
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    useFocusEffect(
        useCallback(() => {
            const loadBookings = async () => {
                try {
                    const data = await fetchOwnerBookings();
                    setBookings(data);
                } catch (error) {
                    console.error("Failed to load owner bookings", error);
                } finally {
                    setLoading(false);
                }
            };
            loadBookings();
        }, [])
    );

    const mapCampaignToBooking = (campaign: CampaignData): Booking => {
        let mappedStatus: 'Pending' | 'Completed' | 'Active' | 'Cancelled' = 'Pending';
        if (campaign.status === 'ACTIVE') mappedStatus = 'Active';
        if (campaign.status === 'COMPLETED') mappedStatus = 'Completed';
        if (campaign.status === 'REJECTED') mappedStatus = 'Cancelled';
        
        const locationStr = campaign.screen?.city 
            ? `${campaign.screen.city}, ${campaign.screen.country || ''}`
            : campaign.screen?.location || 'Unknown Location';

        return {
            id: campaign.id,
            venue: `${campaign.screen?.name || 'Screen'}, ${locationStr}`,
            orderNo: campaign.transactionReference.substring(0, 10).toUpperCase(),
            startDate: new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: mappedStatus,
        };
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(campaign => {
            const booking = mapCampaignToBooking(campaign);
            
            // Search filter
            const matchesSearch = booking.venue.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                booking.orderNo.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Status filter
            const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchQuery, statusFilter]);

    const renderItem = ({ item, index }: { item: CampaignData; index: number }) => {
        const ITEM_SIZE = 160; 
        
        const scale = scrollY.interpolate({
            inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)],
            outputRange: [1, 1, 1, 0.8]
        });

        const opacity = scrollY.interpolate({
            inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 1)],
            outputRange: [1, 1, 1, 0]
        });

        return (
            <Animated.View style={{ opacity, transform: [{ scale }] }}>
                <BookingCard 
                    booking={mapCampaignToBooking(item)}
                    onView={() => setSelectedBooking(item)}
                    onAccept={() => {}}
                    onDecline={() => {}}
                />
            </Animated.View>
        );
    };

    const statuses = ['All', 'Pending', 'Active', 'Completed', 'Cancelled'];

    return (
        <View style={styles.rootContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bookings</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconCircle} onPress={() => setShowFilters(!showFilters)}>
                        <Ionicons name="search-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle} onPress={() => setShowFilters(!showFilters)}>
                        <Ionicons name={showFilters ? "close-outline" : "filter-outline"} size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {showFilters && (
                <View style={[styles.filterContainer, { backgroundColor: theme.background }]}>
                    <View style={[styles.searchInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search venue or order no..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <View style={{ marginTop: 12 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
                            {statuses.map(status => (
                                <TouchableOpacity 
                                    key={status} 
                                    style={[
                                        styles.statusChip, 
                                        { 
                                            backgroundColor: statusFilter === status ? ownerTint : theme.card,
                                            borderColor: statusFilter === status ? ownerTint : theme.border 
                                        }
                                    ]}
                                    onPress={() => setStatusFilter(status)}
                                >
                                    <Text style={[
                                        styles.statusChipText, 
                                        { color: statusFilter === status ? 'white' : theme.textSecondary }
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={ownerTint} />
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.illustrationCard}>
                        <View style={[styles.innerGraphic, { backgroundColor: ownerTint + '15' }]}>
                            <Ionicons name="calendar-outline" size={100} color={ownerTint} style={{opacity: 0.2}} />
                            <Ionicons name="document-text" size={120} color={ownerTint} style={styles.floatingIcon} />
                        </View>
                    </View>
                    <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                    <Text style={styles.emptySubtitle}>When advertisers book your screens, they will appear here.</Text>
                </View>
            ) : filteredBookings.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.illustrationCard}>
                        <View style={[styles.innerGraphic, { backgroundColor: ownerTint + '15' }]}>
                            <Ionicons name="search-outline" size={100} color={ownerTint} style={{opacity: 0.2}} />
                            <Ionicons name="filter" size={120} color={ownerTint} style={styles.floatingIcon} />
                        </View>
                    </View>
                    <Text style={styles.emptyTitle}>
                        {statusFilter !== 'All' 
                            ? `No bookings are ${statusFilter.toLowerCase()}` 
                            : 'No matches found'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        Try adjusting your filters or search term to find what you're looking for.
                    </Text>
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredBookings}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                />
            )}

            {/* Booking Details Modal */}
            <Modal visible={!!selectedBooking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedBooking(null)}>
                {selectedBooking && (
                    <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="information-circle" size={24} color={theme.text} style={{ marginRight: 8 }} />
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Booking Details</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedBooking(null)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalContent}>
                            <View style={styles.modalRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Venue</Text>
                                    <Text style={[styles.modalValue, { color: theme.text }]} numberOfLines={2}>{selectedBooking.screen?.name}</Text>
                                    <Text style={[styles.modalSubValue, { color: theme.textSecondary }]}>{selectedBooking.screen?.city || selectedBooking.screen?.location}, {selectedBooking.screen?.country}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Amount Paid</Text>
                                    <Text style={[styles.modalValue, { color: ownerTint }]}>₦{selectedBooking.pricePaid?.toLocaleString() || '0.00'}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.modalRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Order Number</Text>
                                    <Text style={[styles.modalValue, { color: theme.text }]}>{selectedBooking.transactionReference.substring(0, 10).toUpperCase()}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.modalRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Start Date</Text>
                                    <Text style={[styles.modalValue, { color: theme.text }]}>{new Date(selectedBooking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>End Date</Text>
                                    <Text style={[styles.modalValue, { color: theme.text }]}>{new Date(selectedBooking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                </View>
                            </View>
                            
                            <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 24, marginBottom: 12 }]}>Preview</Text>
                            <View style={[styles.previewContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {selectedBooking.mediaUrl ? (
                                    <Image source={{ uri: selectedBooking.mediaUrl }} style={styles.previewImage} contentFit="contain" />
                                ) : (
                                    <Text style={{ color: theme.textSecondary }}>No Preview Available</Text>
                                )}
                            </View>
                            
                            <View style={[styles.statusBanner, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="information-circle" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                <Text style={[styles.statusBannerText, { color: theme.textSecondary }]}>This booking is currently {selectedBooking.status.toLowerCase()}.</Text>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any) => StyleSheet.create({
    rootContainer: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42, paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { ...Typography.h2, color: theme.text, fontSize: isTablet ? 28 : 24, fontWeight: '800' },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    listContent: { paddingHorizontal: 20, paddingBottom: insets.bottom + 100, paddingTop: 10 },
    
    // Filter Styles
    filterContainer: { paddingBottom: 16 },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1 },
    searchInput: { flex: 1, fontSize: 15 },
    statusChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    statusChipText: { fontSize: 13, fontWeight: '600' },
    
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalContent: { padding: 24 },
    modalRow: { flexDirection: 'row', marginBottom: 20 },
    modalLabel: { fontSize: 13, marginBottom: 4, fontWeight: '500' },
    modalValue: { fontSize: 16, fontWeight: '700' },
    modalSubValue: { fontSize: 13, marginTop: 2 },
    previewContainer: { width: '100%', height: 200, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 24 },
    previewImage: { width: '100%', height: '100%' },
    statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
    statusBannerText: { fontSize: 14, fontWeight: '500' },
    
    // Empty State Styles
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 20 },
    illustrationCard: { width: 260, height: 260, backgroundColor: theme.card, borderRadius: 30, padding: 20, marginBottom: 35, borderWidth: 1, borderColor: theme.border },
    innerGraphic: { flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    floatingIcon: { position: 'absolute', bottom: -20 },
    emptyTitle: { ...Typography.h1, color: theme.text, fontSize: 24, textAlign: 'center' },
    emptySubtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22, fontWeight: '500' },
});
