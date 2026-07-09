import { useState, useEffect, useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export function useScreenCarousel(mediaUrls?: string[], cardWidth: number = 0, intervalMs: number = 3000) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<any>(null); // ScrollView or FlatList ref
    const activeIndexRef = useRef(0);
    const isManualScrolling = useRef(false);

    useEffect(() => {
        if (!mediaUrls || mediaUrls.length <= 1 || cardWidth === 0) return;

        const interval = setInterval(() => {
            if (isManualScrolling.current) return;
            const nextIndex = (activeIndexRef.current + 1) % mediaUrls.length;
            
            if (scrollRef.current?.scrollTo) {
                // ScrollView implementation
                scrollRef.current.scrollTo({ x: nextIndex * cardWidth, animated: true });
            } else if (scrollRef.current?.scrollToIndex) {
                // FlatList implementation
                scrollRef.current.scrollToIndex({ index: nextIndex, animated: true });
            }
            
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [mediaUrls, cardWidth, intervalMs]);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (cardWidth === 0) return;
        const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
        if (index !== activeIndexRef.current) {
            activeIndexRef.current = index;
            setActiveIndex(index);
        }
    }, [cardWidth]);

    const onScrollBeginDrag = useCallback(() => {
        isManualScrolling.current = true;
    }, []);

    const onMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        isManualScrolling.current = false;
        if (cardWidth === 0) return;
        const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
        activeIndexRef.current = index;
        setActiveIndex(index);
    }, [cardWidth]);

    return { 
        activeIndex, 
        setActiveIndex, 
        scrollRef,
        handleScroll,
        onScrollBeginDrag,
        onMomentumScrollEnd
    };
}
