import { create } from 'zustand';
import { fetchBootstrap, AppBootstrapData } from '@/api/bootstrapService';
import { useAuthStore } from '@/store/authStore';

interface AppState {
    bootstrapData: AppBootstrapData | null;
    isBootstrapping: boolean;
    hasBootstrapped: boolean;
    error: string | null;
    isServerDown: boolean;

    fetchBootstrap: () => Promise<void>;
    clearBootstrap: () => void;
    setServerDown: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    bootstrapData: null,
    isBootstrapping: false,
    hasBootstrapped: false,
    error: null,
    isServerDown: false,

    setServerDown: (status: boolean) => set({ isServerDown: status }),

    fetchBootstrap: async () => {
        // Prevent overlapping requests
        if (get().isBootstrapping) return;

        set({ isBootstrapping: true, error: null });

        try {
            const data = await fetchBootstrap();
            set({ 
                bootstrapData: data,
                isBootstrapping: false,
                hasBootstrapped: true
            });
        } catch (error: any) {
            console.error("Bootstrap fetch failed:", error);
            set({ 
                error: error.message || 'Failed to load app data',
                isBootstrapping: false,
                hasBootstrapped: true 
            });
        }
    },

    clearBootstrap: () => {
        set({
            bootstrapData: null,
            hasBootstrapped: false,
            error: null
        });
    }
}));
