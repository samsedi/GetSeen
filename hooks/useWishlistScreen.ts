import { useMemo, useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { useWishlistStore } from '@/store/useWishlistStore';
import { useReservationStore } from '@/store/useReservationStore';
import screenApi, { ScreenResponseDto } from '@/api/screenService';

export function useWishlistScreen() {
    const router = useRouter();
    const wishlist = useWishlistStore((state) => state.wishlist);

    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);

    const [recommendedScreens, setRecommendedScreens] = useState<ScreenResponseDto[]>([]);
    const wishlistIds = useMemo(() => new Set((wishlist || []).map(w => w.id)), [wishlist]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const data = await screenApi.getAllScreens();
                // Filter out items already in the wishlist, and limit to 4
                const recs = data.filter((item: any) => !wishlistIds.has(item.id)).slice(0, 4);
                setRecommendedScreens(recs);
            } catch (error) {
                console.error("Failed to load recommendations:", error);
            }
        };

        fetchRecommendations();
    }, [wishlistIds.size]);

    const validatedWishlist = useMemo(() => {
        return (wishlist ?? []).filter(item => item && item.id);
    }, [wishlist]);

    return {
        router,
        validatedWishlist,
        recommendedScreens,
        isModalVisible,
        activeLocation,
        closeReservation
    };
}
