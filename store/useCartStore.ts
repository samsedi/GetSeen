import { create } from 'zustand';
import { CartItemResponse } from '@/api/cartService';

// ─────────────────────────────────────────────────────────────
// State shape — a pure cache of the backend's cart response.
// All mutations flow through cartService, then setCartData.
// ─────────────────────────────────────────────────────────────

interface CartStore {
    items: CartItemResponse[];
    totalAmount: number;
    setCartData: (items: CartItemResponse[], totalAmount: number) => void;
    clearCartData: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    totalAmount: 0,
    setCartData: (items, totalAmount) => set({ items, totalAmount }),
    clearCartData: () => set({ items: [], totalAmount: 0 }),
}));