import { create } from 'zustand';
import { LocationItem } from '@/constants/mockData';

interface ReservationState {
    activeLocation: LocationItem | null;
    isModalVisible: boolean;

    openReservation: (item: LocationItem) => void;
    closeReservation: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
    activeLocation: null,
    isModalVisible: false,

    openReservation: (item) => set({
        activeLocation: item,
        isModalVisible: true,
    }),

    /**
     * FIX: Always null out activeLocation on close.
     * Leaving stale data in the store causes Zustand to notify all
     * subscribers on the next openReservation call with two rapid
     * state diffs (activeLocation change → isModalVisible change),
     * which triggers two re-render waves instead of one.
     */
    closeReservation: () => set({
        isModalVisible: false,
        activeLocation: null,
    }),
}));