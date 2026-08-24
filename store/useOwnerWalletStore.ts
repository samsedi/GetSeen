import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import ownerWalletApi, { OwnerEarnings, OwnerPayout, PayoutQueryParams } from '@/api/ownerWalletService';
import { PaginationMeta } from '@/api/ownerScreenService';

interface OwnerWalletState {
    earnings: OwnerEarnings | null;
    payouts: OwnerPayout[];
    pagination: PaginationMeta | null;
    
    loadingEarnings: boolean;
    loadingPayouts: boolean;
    refreshing: boolean;
    
    errorEarnings: string | null;
    errorPayouts: string | null;
    
    lastFetchedEarningsAt: number | null;
    lastFetchedPayoutsAt: number | null;
    
    fetchEarnings: (forceRefresh?: boolean) => Promise<void>;
    fetchPayouts: (params?: PayoutQueryParams & { forceRefresh?: boolean }) => Promise<void>;
    refreshWallet: () => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export const useOwnerWalletStore = create<OwnerWalletState>()(
    persist(
        (set, get) => ({
            earnings: null,
            payouts: [],
            pagination: null,
            
            loadingEarnings: false,
            loadingPayouts: false,
            refreshing: false,
            
            errorEarnings: null,
            errorPayouts: null,
            
            lastFetchedEarningsAt: null,
            lastFetchedPayoutsAt: null,
            
            fetchEarnings: async (forceRefresh = false) => {
                const { earnings, lastFetchedEarningsAt } = get();
                
                if (
                    !forceRefresh &&
                    earnings &&
                    lastFetchedEarningsAt &&
                    Date.now() - lastFetchedEarningsAt < CACHE_TTL_MS
                ) {
                    return;
                }

                set({ loadingEarnings: true, errorEarnings: null });
                try {
                    const data = await ownerWalletApi.fetchEarnings();
                    set({
                        earnings: data,
                        lastFetchedEarningsAt: Date.now(),
                        loadingEarnings: false,
                    });
                } catch (error: any) {
                    console.error('Error fetching owner earnings:', error);
                    set({ errorEarnings: error.message || 'An error occurred', loadingEarnings: false });
                }
            },

            fetchPayouts: async (params = {}) => {
                const { page = 1, per_page = 10, status, forceRefresh = false } = params;
                const { payouts, lastFetchedPayoutsAt } = get();

                if (
                    !forceRefresh &&
                    page === 1 &&
                    !status &&
                    payouts.length > 0 &&
                    lastFetchedPayoutsAt &&
                    Date.now() - lastFetchedPayoutsAt < CACHE_TTL_MS
                ) {
                    return;
                }

                set({ loadingPayouts: true, errorPayouts: null });
                try {
                    const data = await ownerWalletApi.fetchPayouts({ page, per_page, status });
                    set({
                        payouts: data.payouts,
                        pagination: data.pagination,
                        lastFetchedPayoutsAt: page === 1 ? Date.now() : lastFetchedPayoutsAt,
                        loadingPayouts: false,
                    });
                } catch (error: any) {
                    console.error('Error fetching owner payouts:', error);
                    set({ errorPayouts: error.message || 'An error occurred', loadingPayouts: false });
                }
            },

            refreshWallet: async () => {
                set({ refreshing: true, errorEarnings: null, errorPayouts: null });
                try {
                    const [earningsData, payoutsData] = await Promise.all([
                        ownerWalletApi.fetchEarnings(),
                        ownerWalletApi.fetchPayouts({ page: 1, per_page: 10 })
                    ]);
                    set({
                        earnings: earningsData,
                        payouts: payoutsData.payouts,
                        pagination: payoutsData.pagination,
                        lastFetchedEarningsAt: Date.now(),
                        lastFetchedPayoutsAt: Date.now(),
                        refreshing: false,
                    });
                } catch (error: any) {
                    console.error('Error refreshing wallet:', error);
                    set({ 
                        errorEarnings: error.message || 'An error occurred', 
                        errorPayouts: error.message || 'An error occurred',
                        refreshing: false 
                    });
                }
            },
        }),
        {
            name: 'owner-wallet-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
        }
    )
);
