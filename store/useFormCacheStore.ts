import { create } from 'zustand';

interface FormCacheState {
    cache: Record<string, any>;
    setFormCache: (formName: string, data: any) => void;
    clearFormCache: (formName: string) => void;
}

export const useFormCacheStore = create<FormCacheState>((set) => ({
    cache: {},
    setFormCache: (formName, data) => set((state) => ({
        cache: {
            ...state.cache,
            [formName]: { ...(state.cache[formName] || {}), ...data }
        }
    })),
    clearFormCache: (formName) => set((state) => {
        const newCache = { ...state.cache };
        delete newCache[formName];
        return { cache: newCache };
    }),
}));
