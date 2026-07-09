import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import screenApi, { ScreenResponseDto } from '@/api/screenService';
import { useReservationStore } from '@/store/useReservationStore';

export function useViewDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [screen, setScreen] = useState<ScreenResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    useEffect(() => {
        if (!id) return;

        const fetchScreen = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await screenApi.getScreenById(String(id));
                setScreen(data);
            } catch (err: any) {
                console.error('Failed to load screen:', err);
                setError('Failed to load screen details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchScreen();
    }, [id]);

    const handleBack = useCallback(() => router.back(), [router]);

    return {
        screen,
        loading,
        error,
        isModalVisible,
        closeReservation,
        handleBack
    };
}
