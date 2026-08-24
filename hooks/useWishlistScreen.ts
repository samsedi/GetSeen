import { useMemo, useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { useWishlistStore } from '@/store/useWishlistStore';
import { useReservationStore } from '@/store/useReservationStore';
import { useAdvertiserScreenStore } from '@/store/useAdvertiserScreenStore';
import { ScreenResponseDto } from '@/api/screenService';

export function useWishlistScreen() {
    const router = useRouter();
    const wishlist = useWishlistStore((state) => state.wishlist);

    const isModalVisible = useReservationStore((state) => state.isModalVisible);
    const activeLocation = useReservationStore((state) => state.activeLocation);
    const closeReservation = useReservationStore((state) => state.closeReservation);
    
    const availableScreens = useAdvertiserScreenStore((state) => state.screens);

    const [recommendedScreens, setRecommendedScreens] = useState<ScreenResponseDto[]>([]);
    const wishlistIds = useMemo(() => new Set((wishlist || []).map(w => w.id)), [wishlist]);

    useEffect(() => {
        if (availableScreens && availableScreens.length > 0) {
            // Filter out items already in the wishlist, and limit to 4
            const recs = availableScreens.filter(item => !wishlistIds.has(item.id)).slice(0, 4);
            setRecommendedScreens(recs);
        }
    }, [availableScreens, wishlistIds]);

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
