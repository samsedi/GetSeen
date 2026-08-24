import { useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useReservationStore } from '@/store/useReservationStore';
import { useAdvertiserScreenStore } from '@/store/useAdvertiserScreenStore';

export function useViewDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // First: check if this screen is already in our home screen cache (instant)
    const screens = useAdvertiserScreenStore((state) => state.screens);
    const cachedScreen = screens.find(s => s.id === String(id)) ?? null;

    // Then: fetch fresh data from the backend in the background
    const activeScreen = useAdvertiserScreenStore((state) => state.activeScreen);
    const fetchScreenById = useAdvertiserScreenStore((state) => state.fetchScreenById);
    const clearActiveScreen = useAdvertiserScreenStore((state) => state.clearActiveScreen);

    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    useEffect(() => {
        if (!id) return;
        // Always fetch fresh data in the background (for latest price, availability etc.)
        // But since cachedScreen renders immediately, the user never waits
        fetchScreenById(String(id));
        return () => {
            clearActiveScreen();
        };
    }, [id, fetchScreenById, clearActiveScreen]);

    // Use the fresh backend data if available, otherwise fall back to the cached card data
    const screen = activeScreen ?? cachedScreen;

    const handleBack = useCallback(() => router.back(), [router]);

    return {
        // loading is only true when we have NO data at all (neither cache nor backend)
        loading: !screen,
        screen,
        error: null,
        isModalVisible,
        closeReservation,
        handleBack,
    };
}
