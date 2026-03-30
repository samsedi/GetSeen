import { create } from 'zustand';

// 1. Define the shape of your state so TypeScript can help you catch bugs
interface AuthState {
    role: 'advertiser' | 'owner' | null; // Null means they haven't chosen yet
    isLoggedIn: boolean;

    // Actions (Functions to change the state)
    setRole: (role: 'advertiser' | 'owner') => void;
    login: () => void;
    logout: () => void;
}

// 2. Create the actual store
export const useAuthStore = create<AuthState>((set) => ({
    // Initial values when the app first loads
    role: null,
    isLoggedIn: false,

    // Functions to update those values
    setRole: (newRole) => set({ role: newRole }),
    login: () => set({ isLoggedIn: true }),
    logout: () => set({ isLoggedIn: false, role: null }),
}));