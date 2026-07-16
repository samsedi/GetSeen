import { useState, useEffect, useMemo, useCallback } from 'react';
import screenApi, { ScreenResponseDto } from '@/api/screenService';
import { clearCache } from '@/api/cacheService';
import { useReservationStore } from '@/store/useReservationStore';
import { CATEGORY_MAP } from '@/components/HomeScreenComponents/VenueNavigation';

export function useHomeScreen() {
    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const [screens, setScreens] = useState<ScreenResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState('For You');

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadDiscoverFeed = async () => {
            try {
                setLoading(true);
                const data = await screenApi.getAllScreens();
                setScreens(data);
            } catch (error) {
                console.error("Failed to load marketplace screens:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadDiscoverFeed();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        clearCache('screens_all');
        try {
            const data = await screenApi.getAllScreens();
            setScreens(data);
        } catch (error) {
            console.error("Failed to refresh marketplace screens:", error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const filteredLocations = useMemo(() => {
        let result = screens;

        if (selectedVenue !== 'For You') {
            result = result.filter((item) => {
                const venueType = item.venueType?.toLowerCase() || '';
                if (CATEGORY_MAP[selectedVenue]) {
                    return CATEGORY_MAP[selectedVenue].some(keyword => venueType.includes(keyword));
                }
                return venueType.includes(selectedVenue.toLowerCase());
            });
        }

        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((item) => {
                const name = item.name?.toLowerCase() || '';
                const location = item.address?.toLowerCase() || '';
                return name.includes(lowerQuery) || location.includes(lowerQuery);
            });
        }

        return result;
    }, [selectedVenue, screens, searchQuery]);

    const handleVenueSelect = useCallback((venue: string) => {
        setSelectedVenue(venue);
    }, []);

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
    };
}
