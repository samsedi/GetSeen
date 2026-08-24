import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import ownerDashboardApi, { OwnerDashboardData } from '@/api/ownerDashboardService';

interface OwnerDashboardState {
    dashboardData: OwnerDashboardData | null;
    loading: boolean;
    error: string | null;
    completingTutorial: boolean;

    fetchDashboard: (forceRefresh?: boolean) => Promise<void>;
    completeTutorial: () => Promise<{ success: boolean; message?: string }>;
}

export const useOwnerDashboardStore = create<OwnerDashboardState>()(
    persist(
        (set, get) => ({
            dashboardData: null,
            loading: false,
            error: null,
            completingTutorial: false,

            completeTutorial: async () => {
                set({ completingTutorial: true });
                try {
                    const onboarding = await ownerDashboardApi.completeTutorial();
                    const current = get().dashboardData;
                    if (current) {
                        set({ dashboardData: { ...current, onboarding } });
                    }
                    return { success: true };
                } catch (error: any) {
                    return { success: false, message: error.message || 'Could not complete the tutorial step.' };
                } finally {
                    set({ completingTutorial: false });
                }
            },

            fetchDashboard: async (forceRefresh = false) => {
                if (!forceRefresh && get().dashboardData !== null) {
                    // Start background refresh
                    set({ loading: false });
                } else {
                    set({ loading: true, error: null });
                }

                try {
                    const data = await ownerDashboardApi.fetchDashboardOverview();
                    set({ dashboardData: data, error: null });
                } catch (error: any) {
                    console.error('Failed to fetch owner dashboard:', error);
                    set({ error: error.message || 'Failed to fetch dashboard data' });
                } finally {
                    set({ loading: false });
                }
            }
        }),
        {
            name: 'owner-dashboard-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
            partialize: (state) => ({
                dashboardData: state.dashboardData
            }),
        }
    )
);
