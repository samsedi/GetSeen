import { useEffect, useMemo, useCallback } from 'react';
import { useReservationStore } from '@/store/useReservationStore';
import { CATEGORY_MAP } from '@/components/HomeScreenComponents/VenueNavigation';
import { useAdvertiserScreenStore } from '@/store/useAdvertiserScreenStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import useDebounce from './useDebounce';

const PAGE_SIZE = 10;

export function useHomeScreen() {
    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const screens = useAdvertiserScreenStore((state) => state.screens);
    const loading = useAdvertiserScreenStore((state) => state.loading);
    const refreshing = useAdvertiserScreenStore((state) => state.refreshing);
    const fetchScreens = useAdvertiserScreenStore((state) => state.fetchScreens);
    const refreshScreens = useAdvertiserScreenStore((state) => state.refreshScreens);
    const loadMoreScreens = useAdvertiserScreenStore((state) => state.loadMoreScreens);
    const loadLessScreens = useAdvertiserScreenStore((state) => state.loadLessScreens);
    const pagination = useAdvertiserScreenStore((state) => state.pagination);
    
    const searchQuery = useAdvertiserScreenStore((state) => state.searchQuery);
    const setSearchQuery = useAdvertiserScreenStore((state) => state.setSearchQuery);
    const selectedVenue = useAdvertiserScreenStore((state) => state.selectedVenue);
    const setSelectedVenue = useAdvertiserScreenStore((state) => state.setSelectedVenue);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

    // On search query change: reset to page 1 and fetch fresh 10 from backend
    useEffect(() => {
        fetchWishlist();
        fetchScreens({ search: debouncedSearchQuery, page: 1, per_page: PAGE_SIZE });
    }, [debouncedSearchQuery, fetchScreens, fetchWishlist]);

    // On category change: reset to page 1 and fetch fresh 10 from backend
    useEffect(() => {
        fetchScreens({ search: debouncedSearchQuery, page: 1, per_page: PAGE_SIZE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVenue]);

    const onRefresh = useCallback(async () => {
        await refreshScreens();
    }, [refreshScreens]);

    // Local category filter applied on top of whatever the backend returned.
    // Since the backend doesn't support category_id yet, we filter the loaded pages locally.
    const filteredLocations = useMemo(() => {
        let result = screens || [];

        if (selectedVenue !== 'For You') {
            result = result.filter((item) => {
                const keywords = CATEGORY_MAP[selectedVenue] || [selectedVenue.toLowerCase()];
                const searchableText = `${item.name} ${item.description} ${item.address} ${item.venueType || ''}`.toLowerCase();
                return keywords.some(keyword => searchableText.includes(keyword));
            });
        }

        return result;
    }, [selectedVenue, screens]);

    const handleVenueSelect = useCallback((venue: string) => {
        setSelectedVenue(venue);
    }, [setSelectedVenue]);

    return {
        loading,
        selectedVenue,
        handleVenueSelect,
        filteredLocations,
        isModalVisible,
        activeLocation,
        closeReservation,
        searchQuery,
        setSearchQuery,
        refreshing,
        onRefresh,
        // Wire directly to the store's real backend paginator
        loadMoreScreens,
        loadLessScreens,
        hasMore: pagination?.has_next ?? false,
        canLoadLess: (pagination?.page ?? 1) > 1,
        pagination,
    };
}
