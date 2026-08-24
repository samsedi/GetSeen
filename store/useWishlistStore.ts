import { create } from 'zustand';
import { ScreenResponseDto } from '@/api/screenService';
import advertiserWishlistApi from '@/api/advertiserWishlistService';

interface WishlistState {
    wishlist: ScreenResponseDto[];
    isLoading: boolean;
    hasFetched: boolean;
    fetchWishlist: () => Promise<void>;
    toggleWishlist: (item: ScreenResponseDto) => Promise<void>;
    isItemWished: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    isLoading: false,
    hasFetched: false,

    fetchWishlist: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
            const wishlistItems = await advertiserWishlistApi.getWishlist();
            set({ wishlist: wishlistItems, hasFetched: true });
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    toggleWishlist: async (item) => {
        const currentWishlist = get().wishlist;
        const isAlreadyWished = currentWishlist.some((i) => String(i.id) === String(item.id));

        // 1. Optimistic Update (update UI immediately)
        if (isAlreadyWished) {
            set({ wishlist: currentWishlist.filter((i) => String(i.id) !== String(item.id)) });
        } else {
            set({ wishlist: [...currentWishlist, item] });
        }

        // 2. Call Backend API
        try {
            await advertiserWishlistApi.toggleWishlist(item.id);
        } catch (error) {
            console.error("Failed to toggle wishlist on backend", error);
            // Revert on failure
            set({ wishlist: currentWishlist });
        }
    },

    isItemWished: (id) => get().wishlist.some((i) => String(i.id) === String(id)),
}));