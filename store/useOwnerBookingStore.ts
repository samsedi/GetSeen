import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import ownerBookingApi, { OwnerBooking, BookingQueryParams } from '@/api/ownerBookingService';

interface OwnerBookingState {
    bookings: OwnerBooking[];
    pagination: any | null; // using any since pagination type is similar across the app but not rigidly exported
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    lastFetchedAt: number | null;
    
    fetchBookings: (params?: BookingQueryParams & { forceRefresh?: boolean }) => Promise<void>;
    refreshBookings: () => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export const useOwnerBookingStore = create<OwnerBookingState>()(
    persist(
        (set, get) => ({
            bookings: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            lastFetchedAt: null,
            
            fetchBookings: async (params = {}) => {
                const { page = 1, per_page = 10, status, search, start_date, end_date, forceRefresh = false } = params;
                const { bookings, lastFetchedAt } = get();

                if (shouldUseCachedBookings(forceRefresh, page, status, search, start_date, end_date, bookings, lastFetchedAt)) {
                    return;
                }

                set({ loading: true, error: null });
                try {
                    const response = await ownerBookingApi.fetchOwnerBookingsFromApi({ page, per_page, status, search, start_date, end_date });
                    set({
                        bookings: response.bookings || [],
                        pagination: response.pagination || null,
                        lastFetchedAt: page === 1 ? Date.now() : lastFetchedAt,
                        loading: false,
                    });
                } catch (error: any) {
                    console.error('Error fetching owner bookings:', error);
                    set({ error: error.message || 'An error occurred', loading: false });
                }
            },

            refreshBookings: async () => {
                set({ refreshing: true, error: null });
                try {
                    const response = await ownerBookingApi.fetchOwnerBookingsFromApi({ page: 1, per_page: 10 });
                    set({
                        bookings: response.bookings || [],
                        pagination: response.pagination || null,
                        lastFetchedAt: Date.now(),
                        refreshing: false,
                    });
                } catch (error: any) {
                    console.error('Error refreshing owner bookings:', error);
                    set({ error: error.message || 'An error occurred', refreshing: false });
                }
            },
        }),
        {
            name: 'owner-booking-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
        }
    )
);

const shouldUseCachedBookings = (
    forceRefresh: boolean, 
    page: number, 
    status?: string, 
    search?: string, 
    start_date?: string, 
    end_date?: string, 
    bookings: OwnerBooking[] = [], 
    lastFetchedAt: number | null = null
): boolean => {
    return (
        !forceRefresh &&
        page === 1 &&
        !status &&
        !search &&
        !start_date &&
        !end_date &&
        bookings.length > 0 &&
        lastFetchedAt !== null &&
        Date.now() - lastFetchedAt < CACHE_TTL_MS
    );
};
