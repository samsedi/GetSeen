import { create } from 'zustand';
import bulkBookingService, {
    BulkScreen,
    BulkFilterOption,
    BulkSortOption,
    BulkCartRequest,
} from '@/api/bulkBookingService';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type DurationType = 'daily' | 'weekly' | 'monthly';

interface ScheduleParams {
    duration: DurationType;
    duration_multiplier: number;
    start_date: string;
    end_date: string;
}

interface BulkBookingState {
    // Screen list
    screens: BulkScreen[];
    states: BulkFilterOption[];
    categories: BulkFilterOption[];
    isLoading: boolean;
    isFetchingMore: boolean;
    hasMore: boolean;
    page: number;

    // Filters
    search: string;
    stateId: number | undefined;
    categoryId: number | undefined;
    sort: BulkSortOption;

    // Selection
    selectedIds: Set<number>;

    // Schedule
    schedule: ScheduleParams;

    // Submission
    isSubmitting: boolean;

    // Actions
    fetchScreens: (reset?: boolean) => Promise<void>;
    setSearch: (search: string) => void;
    setStateFilter: (stateId: number | undefined) => void;
    setCategoryFilter: (categoryId: number | undefined) => void;
    setSort: (sort: BulkSortOption) => void;
    applyFilters: () => Promise<void>;
    toggleScreen: (id: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    setSchedule: (params: Partial<ScheduleParams>) => void;
    submitToCart: () => Promise<{ success: boolean; message: string; added_count?: number }>;
    reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getDefaultEndDate = (startDate: string, duration: DurationType, multiplier: number): string => {
    const start = new Date(startDate);
    let daysToAdd = 0;

    switch (duration) {
        case 'daily':
            daysToAdd = multiplier;
            break;
        case 'weekly':
            daysToAdd = multiplier * 7;
            break;
        case 'monthly':
            daysToAdd = multiplier * 30;
            break;
    }

    const end = new Date(start);
    end.setDate(end.getDate() + daysToAdd - 1);
    return end.toISOString().split('T')[0];
};

const getTomorrowDate = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

const initialSchedule: ScheduleParams = {
    duration: 'weekly',
    duration_multiplier: 1,
    start_date: getTomorrowDate(),
    end_date: getDefaultEndDate(getTomorrowDate(), 'weekly', 1),
};

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useBulkBookingStore = create<BulkBookingState>((set, get) => ({
    screens: [],
    states: [],
    categories: [],
    isLoading: false,
    isFetchingMore: false,
    hasMore: true,
    page: 1,

    search: '',
    stateId: undefined,
    categoryId: undefined,
    sort: 'recommended',

    selectedIds: new Set<number>(),

    schedule: { ...initialSchedule },

    isSubmitting: false,

    fetchScreens: async (reset = false) => {
        const { isLoading, isFetchingMore, hasMore, page, screens, search, stateId, categoryId, sort } = get();

        if (isLoading || isFetchingMore) return;
        if (!reset && !hasMore) return;

        const targetPage = reset ? 1 : page;

        if (reset) {
            set({ isLoading: true });
        } else {
            set({ isFetchingMore: true });
        }

        try {
            const params: any = { page: targetPage, per_page: 20, sort };
            if (search) params.search = search;
            if (stateId) params.state_id = stateId;
            if (categoryId) params.category_id = categoryId;

            const data = await bulkBookingService.getScreens(params);

            set({
                screens: reset ? data.screens : [...screens, ...data.screens],
                states: data.states,
                categories: data.categories,
                page: targetPage + 1,
                hasMore: data.pagination.has_next,
            });
        } catch (error) {
            console.error('Failed to fetch bulk screens:', error);
        } finally {
            set({ isLoading: false, isFetchingMore: false });
        }
    },

    setSearch: (search: string) => set({ search }),

    setStateFilter: (stateId: number | undefined) => set({ stateId }),

    setCategoryFilter: (categoryId: number | undefined) => set({ categoryId }),

    setSort: (sort: BulkSortOption) => set({ sort }),

    applyFilters: async () => {
        const store = get();
        set({ screens: [], page: 1, hasMore: true, selectedIds: new Set() });
        await store.fetchScreens(true);
    },

    toggleScreen: (id: number) => {
        const { selectedIds } = get();
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        set({ selectedIds: next });
    },

    selectAll: () => {
        const { screens } = get();
        set({ selectedIds: new Set(screens.map(s => s.id)) });
    },

    deselectAll: () => {
        set({ selectedIds: new Set() });
    },

    setSchedule: (params: Partial<ScheduleParams>) => {
        const current = get().schedule;
        const updated = { ...current, ...params };

        // Auto-calculate end_date when duration or start_date changes
        if (params.duration || params.duration_multiplier || params.start_date) {
            updated.end_date = getDefaultEndDate(
                updated.start_date,
                updated.duration,
                updated.duration_multiplier
            );
        }

        set({ schedule: updated });
    },

    submitToCart: async () => {
        const { selectedIds, schedule } = get();

        if (selectedIds.size === 0) {
            return { success: false, message: 'Please select at least one screen.' };
        }

        set({ isSubmitting: true });
        try {
            const payload: BulkCartRequest = {
                screen_ids: Array.from(selectedIds),
                duration: schedule.duration,
                duration_multiplier: schedule.duration_multiplier,
                start_date: schedule.start_date,
                end_date: schedule.end_date,
            };

            const result = await bulkBookingService.addToCart(payload);
            return { success: true, message: result.message, added_count: result.added_count };
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message || 'Failed to add screens to cart.';
            return { success: false, message: errorMessage };
        } finally {
            set({ isSubmitting: false });
        }
    },

    reset: () => {
        set({
            screens: [],
            states: [],
            categories: [],
            isLoading: false,
            isFetchingMore: false,
            hasMore: true,
            page: 1,
            search: '',
            stateId: undefined,
            categoryId: undefined,
            sort: 'recommended',
            selectedIds: new Set(),
            schedule: { ...initialSchedule },
            isSubmitting: false,
        });
    },
}));
