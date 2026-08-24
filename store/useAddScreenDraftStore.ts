import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import { AddScreenForm, AddScreenExtra, LocalMediaFile } from '@/hooks/addScreen/types';

export interface InProgressScreenEntry {
    form: AddScreenForm;
    extra: AddScreenExtra;
    customVenueType: string;
    mediaFiles: LocalMediaFile[];
    savedAt: number;
}

interface AddScreenDraftState {
    entries: Record<string, InProgressScreenEntry>;
    saveEntry: (key: string, entry: Omit<InProgressScreenEntry, 'savedAt'>) => void;
    clearEntry: (key: string) => void;
}

// Keyed by the add-screen route's draftId param ('NEW' for a screen that
// hasn't been saved yet, or the real screen id when continuing a draft).
// Holds whatever the user has typed so it survives navigating away without
// hitting Save Draft / Submit — cleared only once that call succeeds.
export const useAddScreenDraftStore = create<AddScreenDraftState>()(
    persist(
        (set) => ({
            entries: {},

            saveEntry: (key, entry) =>
                set((state) => ({
                    entries: { ...state.entries, [key]: { ...entry, savedAt: Date.now() } },
                })),

            clearEntry: (key) =>
                set((state) => {
                    if (!(key in state.entries)) return state;
                    const entries = { ...state.entries };
                    delete entries[key];
                    return { entries };
                }),
        }),
        {
            name: 'add-screen-draft-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
        }
    )
);
