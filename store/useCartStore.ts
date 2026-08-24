import { create } from 'zustand';
import { CartItemResponse } from '@/api/cartService';

// ─────────────────────────────────────────────────────────────
// State shape — a pure cache of the backend's cart response.
// All mutations flow through cartService, then setCartData.
// ─────────────────────────────────────────────────────────────

interface CartStore {
    items: CartItemResponse[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    coupon: any | null; // using any since CouponData is not strictly imported here
    setCartData: (items: CartItemResponse[], subtotal: number, totalAmount: number, discount?: number, coupon?: any) => void;
    clearCartData: () => void;
    setCouponData: (discount: number, totalAmount: number, coupon: any) => void;
    clearCouponData: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    subtotal: 0,
    discount: 0,
    totalAmount: 0,
    coupon: null,
    setCartData: (items, subtotal, totalAmount, discount = 0, coupon = null) => set({ items, subtotal, totalAmount, discount, coupon }),
    clearCartData: () => set({ items: [], subtotal: 0, totalAmount: 0, discount: 0, coupon: null }),
    setCouponData: (discount, totalAmount, coupon) => set({ discount, totalAmount, coupon }),
    clearCouponData: () => set((state) => ({ discount: 0, totalAmount: state.subtotal, coupon: null })),
}));