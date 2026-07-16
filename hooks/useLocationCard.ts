import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useReservationStore } from '@/store/useReservationStore';
import { ScreenResponseDto } from '@/api/screenService';

export function useLocationCard(item: ScreenResponseDto) {
    const router = useRouter();
    const wishlist = useWishlistStore((state) => state.wishlist);
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
    const openReservation = useReservationStore((state) => state.openReservation);

    const [activeIndex, setActiveIndex] = useState(0);

    const validMediaUrls = useMemo(() => {
        if (!item?.mediaUrls) return [];
        return item.mediaUrls.filter(url => url && url.startsWith('http'));
    }, [item?.mediaUrls]);

    const currentUrl = validMediaUrls[activeIndex];
    const isCurrentVideo = currentUrl && currentUrl.toLowerCase().includes('.mp4');

    useEffect(() => {
        if (validMediaUrls.length <= 1 || isCurrentVideo) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % validMediaUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [validMediaUrls.length, isCurrentVideo, activeIndex]);

    const handleVideoEnd = useCallback(() => {
        setActiveIndex(prev => (prev + 1) % validMediaUrls.length);
    }, [validMediaUrls.length]);

    const handleNavigate = useCallback(() => {
        if (!item?.id) return;
        router.push({
            pathname: '/homeSubScreens/viewdetails',
            params: { id: item.id },
        });
    }, [router, item?.id]);

    const handleWishlist = useCallback(() => {
        if (!item) return;
        toggleWishlist(item);
    }, [toggleWishlist, item]);

    const handleReserve = useCallback(() => {
        if (!item) return;
        openReservation(item);
    }, [openReservation, item]);

    const isWished = useMemo(() => {
        if (!item?.id) return false;
        return wishlist.some((i) => i.id === item.id);
    }, [wishlist, item?.id]);

    return {
        activeIndex,
        validMediaUrls,
        handleNavigate,
        handleWishlist,
        handleReserve,
        isWished,
        handleVideoEnd,
    };
}
