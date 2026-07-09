import { create } from 'zustand';
import { ScreenResponseDto } from '@/api/screenService';

interface WishlistState {
    wishlist: ScreenResponseDto[];
    toggleWishlist: (item: ScreenResponseDto) => void;
    isItemWished: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],

    toggleWishlist: (item) => {
        const currentWishlist = get().wishlist;
        const isAlreadyWished = currentWishlist.some((i) => i.id === item.id);

        if (isAlreadyWished) {
            set({ wishlist: currentWishlist.filter((i) => i.id !== item.id) });
        } else {
            set({ wishlist: [...currentWishlist, item] });
        }
    },

    isItemWished: (id) => get().wishlist.some((i) => i.id === id),
}));