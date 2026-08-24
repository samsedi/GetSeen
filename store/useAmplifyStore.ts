import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import amplifyApi, { AmplifyCampaign, PreviousScreenCampaign, AmplifyCheckoutRequest, AmplifyExtendRequest, AmplifyRelaunchRequest, AmplifyAnalyticsResponse } from '@/api/amplifyService';
import { PaginationMeta } from '@/api/advertiserScreenService';

interface AmplifyState {
    campaigns: AmplifyCampaign[];
    pagination: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    selectedStatus: string;
    
    // For Amplify Setup (Previous campaigns)
    previousCampaigns: PreviousScreenCampaign[];
    previousPagination: PaginationMeta | null;
    isFetchingPrevious: boolean;

    // Detail-specific state
    activeCampaign: AmplifyCampaign | null;
    activeAnalytics: AmplifyAnalyticsResponse | null;
    isFetchingDetail: boolean;
    isFetchingAnalytics: boolean;
    actionError: string | null;

    // Actions
    setSelectedStatus: (status: string) => void;
    fetchCampaigns: (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        date_range?: string;
        forceRefresh?: boolean;
    }) => Promise<void>;
    loadMoreCampaigns: () => Promise<void>;
    
    fetchPreviousCampaigns: (page?: number) => Promise<void>;
    loadMorePreviousCampaigns: () => Promise<void>;
    
    fetchCampaignById: (id: number | string) => Promise<void>;
    fetchAnalytics: (id: number | string, range?: string, startDate?: string, endDate?: string) => Promise<void>;
    clearActiveData: () => void;
    
    // Mutation Actions
    checkoutAmplify: (data: AmplifyCheckoutRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
    extendCampaign: (id: number | string, data: AmplifyExtendRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
    relaunchCampaign: (id: number | string, data: AmplifyRelaunchRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useAmplifyStore = create<AmplifyState>()(
    persist(
        (set, get) => ({
            campaigns: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            selectedStatus: 'all',
            
            previousCampaigns: [],
            previousPagination: null,
            isFetchingPrevious: false,

            activeCampaign: null,
            activeAnalytics: null,
            isFetchingDetail: false,
            isFetchingAnalytics: false,
            actionError: null,

            setSelectedStatus: (status: string) => set({ selectedStatus: status }),

            fetchCampaigns: async (params = {}) => {
                const { page = 1, per_page = 10, status, date_range, forceRefresh = false } = params;
                const currentStatus = status ?? get().selectedStatus;
                
                if (forceRefresh) set({ refreshing: true });
                else if (page === 1) set({ loading: true, error: null });

                try {
                    const response = await amplifyApi.getCampaigns({ page, per_page, status: currentStatus, date_range });
                    set({
                        campaigns: page === 1 ? response.campaigns : [...get().campaigns, ...response.campaigns],
                        pagination: response.pagination,
                    });
                } catch (error: any) {
                    console.error('[useAmplifyStore] fetchCampaigns failed:', error);
                    if (page === 1) set({ error: error.message || 'Failed to fetch amplify campaigns' });
                } finally {
                    set({ loading: false, refreshing: false });
                }
            },

            loadMoreCampaigns: async () => {
                const { pagination, loading, selectedStatus } = get();
                if (loading || !pagination || !pagination.has_next) return;
                await get().fetchCampaigns({ page: pagination.page + 1, status: selectedStatus });
            },

            fetchPreviousCampaigns: async (page = 1) => {
                set({ isFetchingPrevious: page === 1 });
                try {
                    const response = await amplifyApi.getPreviousScreenCampaigns(page);
                    set({
                        previousCampaigns: page === 1 ? response.campaigns : [...get().previousCampaigns, ...response.campaigns],
                        previousPagination: response.pagination
                    });
                } catch (error: any) {
                    console.error('Failed to fetch previous campaigns:', error);
                } finally {
                    set({ isFetchingPrevious: false });
                }
            },

            loadMorePreviousCampaigns: async () => {
                const { previousPagination, isFetchingPrevious } = get();
                if (isFetchingPrevious || !previousPagination || !previousPagination.has_next) return;
                await get().fetchPreviousCampaigns(previousPagination.page + 1);
            },

            fetchCampaignById: async (id: number | string) => {
                set({ isFetchingDetail: true, actionError: null });
                try {
                    const campaign = await amplifyApi.getCampaignDetail(id);
                    set({ activeCampaign: campaign });
                } catch (error: any) {
                    set({ actionError: error.message || 'Failed to load details', activeCampaign: null });
                } finally {
                    set({ isFetchingDetail: false });
                }
            },

            fetchAnalytics: async (id: number | string, range = 'all', startDate?: string, endDate?: string) => {
                set({ isFetchingAnalytics: true });
                try {
                    const analytics = await amplifyApi.getAnalytics(id, range, startDate, endDate);
                    set({ activeAnalytics: analytics });
                } catch (error: any) {
                    console.error('Failed to load amplify analytics:', error);
                    set({ activeAnalytics: null });
                } finally {
                    set({ isFetchingAnalytics: false });
                }
            },

            clearActiveData: () => set({ activeCampaign: null, activeAnalytics: null, actionError: null }),

            checkoutAmplify: async (data: AmplifyCheckoutRequest) => {
                try {
                    const response = await amplifyApi.checkoutAmplify(data);
                    return { success: true, data: response };
                } catch (error: any) {
                    return { success: false, error: error.message || 'Checkout failed' };
                }
            },

            extendCampaign: async (id: number | string, data: AmplifyExtendRequest) => {
                try {
                    const response = await amplifyApi.extendCampaign(id, data);
                    return { success: true, data: response };
                } catch (error: any) {
                    return { success: false, error: error.message || 'Extend failed' };
                }
            },

            relaunchCampaign: async (id: number | string, data: AmplifyRelaunchRequest) => {
                try {
                    const response = await amplifyApi.relaunchCampaign(id, data);
                    return { success: true, data: response };
                } catch (error: any) {
                    return { success: false, error: error.message || 'Relaunch failed' };
                }
            },
        }),
        {
            name: 'amplify-store-cache',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
            partialize: (state) => ({
                campaigns: state.campaigns,
                pagination: state.pagination,
            }),
        }
    )
);
