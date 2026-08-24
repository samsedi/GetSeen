import { useState, useCallback } from 'react';
import ownerScreenApi, { OwnerScreenResponse, ScreenOptionsData } from '@/api/ownerScreenService';
import { useAlertStore } from '@/store/useAlertStore';
import { AddScreenForm, AddScreenExtra, LocalMediaFile, DEFAULT_FORM, DEFAULT_EXTRA } from './types';

// Pure mapper functions
const resolveVenueType = (
    category: OwnerScreenResponse['category'],
    venueType: string,
    categoryNames: string[]
): { venueType: string; customType: string; categoryId: number | null } => {
    if (category) {
        const isKnown = categoryNames.some((n) => n.toLowerCase() === category.name.toLowerCase());
        return isKnown
            ? { venueType: category.name, customType: '', categoryId: category.id }
            : { venueType: 'Other', customType: category.name, categoryId: category.id };
    }
    if (venueType && categoryNames.some((n) => n.toLowerCase() === venueType.toLowerCase())) {
        return { venueType, customType: '', categoryId: null };
    }
    return { venueType: '', customType: '', categoryId: null };
};

const mapScreenToForm = (
    screen: OwnerScreenResponse,
    resolved: { venueType: string; categoryId: number | null },
    countryId: number | null,
    stateId: number | null
): AddScreenForm => ({
    name: screen.title || '',
    venueType: resolved.venueType,
    categoryId: resolved.categoryId,
    address: screen.address || '',
    country: screen.country || 'Nigeria',
    countryId,
    state: screen.state || '',
    stateId,
    dimensions: screen.dimensions || '',
    monthlyVisitors: screen.monthly_visitors?.toString() || '',
    targetAudience: screen.target_audience || '',
});

const mapScreenToExtra = (screen: OwnerScreenResponse): AddScreenExtra => ({
    emails: screen.emails ? screen.emails.join(', ') : '',
    description: screen.description || '',
    vendorNote: '',
    weekdaysHours: screen.weekdays_hours || '',
    weekendsHours: screen.weekends_hours || '',
    ageRange: screen.age_range || '',
    dwellTime: screen.dwell_time || '',
    screenCount: screen.no_of_screens?.toString() || '',
    orientation: screen.orientation || '',
    malePercentage: screen.male_percentage?.toString() || '',
    femalePercentage: screen.female_percentage?.toString() || '',
    priceDaily: screen.price?.toString() || '',
    priceWeekly: screen.price_per_week?.toString() || '',
    priceMonthly: screen.price_per_month?.toString() || '',
});

const mapDraftMedia = (mediaUrls: string[] | undefined): LocalMediaFile[] => {
    if (!mediaUrls || mediaUrls.length === 0) return [];
    return mediaUrls.map((url, i) => ({
        uri: url,
        type: url.includes('.mp4') ? 'video' : 'image',
        name: `remote_media_${i}`,
        isRemote: true,
    }));
};

const fetchScreenSafely = async (id: string) => {
    try {
        const response = await ownerScreenApi.getScreenById(id);
        return response.data.screen;
    } catch (error) {
        console.error('Failed to load draft:', error);
        useAlertStore.getState().showAlert('Error', 'Could not load the draft data.');
        return null;
    }
};

// Clone data already carries ids (category_id/country_id/state_id) rather
// than names, so it's mapped straight from the loaded options lists instead
// of the name-matching resolveVenueType/findByName path draft loading uses.
const mapCloneToForm = (
    clone: {
        title: string; address: string; category_id: number | null; custom_category_name: string | null;
        country_id: number; state_id: number; monthly_visitors: number; target_audience: string; dimensions: string;
    },
    options: ScreenOptionsData
): { form: AddScreenForm; customVenueType: string } => {
    const category = clone.category_id != null ? options.categories.find((c) => c.id === clone.category_id) : undefined;
    const country = options.countries.find((c) => c.id === clone.country_id);
    const state = options.states.find((s) => s.id === clone.state_id);

    const venueType = clone.custom_category_name ? 'Other' : category?.name || '';
    const customVenueType = clone.custom_category_name || '';

    return {
        form: {
            name: clone.title || '',
            venueType,
            categoryId: clone.category_id,
            address: clone.address || '',
            country: country?.name || 'Nigeria',
            countryId: clone.country_id,
            state: state?.name || '',
            stateId: clone.state_id,
            dimensions: clone.dimensions || '',
            monthlyVisitors: clone.monthly_visitors?.toString() || '',
            targetAudience: clone.target_audience || '',
        },
        customVenueType,
    };
};

const mapCloneToExtra = (clone: {
    description: string; weekdays_hours: string; weekends_hours: string; age_range: string; dwell_time: string;
    no_of_screens: number; orientation: string; male_percentage: number; female_percentage: number;
    price: number; price_per_week: number; price_per_month: number; screen_email: string[];
}): AddScreenExtra => ({
    emails: clone.screen_email ? clone.screen_email.join(', ') : '',
    description: clone.description || '',
    vendorNote: '',
    weekdaysHours: clone.weekdays_hours || '',
    weekendsHours: clone.weekends_hours || '',
    ageRange: clone.age_range || '',
    dwellTime: clone.dwell_time || '',
    screenCount: clone.no_of_screens?.toString() || '',
    orientation: clone.orientation || '',
    malePercentage: clone.male_percentage?.toString() || '',
    femalePercentage: clone.female_percentage?.toString() || '',
    priceDaily: clone.price?.toString() || '',
    priceWeekly: clone.price_per_week?.toString() || '',
    priceMonthly: clone.price_per_month?.toString() || '',
});

export function useDraftLoader(
    setForm: (form: AddScreenForm) => void,
    setExtra: (extra: AddScreenExtra) => void,
    setCustomVenueType: (val: string) => void,
    setMediaFiles: (files: LocalMediaFile[]) => void,
    categoryNames: string[],
    findCountryByName: (name: string) => { id: number } | null,
    findStateByName: (name: string) => { id: number } | null,
    screenOptions: ScreenOptionsData
) {
    const [fetchingDraft, setFetchingDraft] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(undefined);

    const loadDraft = useCallback(async (id: string) => {
        setCurrentDraftId(id);
        setFetchingDraft(true);

        const screen = await fetchScreenSafely(id);
        if (screen) {
            const resolved = resolveVenueType(screen.category, screen.venue_type, categoryNames);
            const countryId = screen.country ? findCountryByName(screen.country)?.id ?? null : null;
            const stateId = screen.state ? findStateByName(screen.state)?.id ?? null : null;

            setForm(mapScreenToForm(screen, resolved, countryId, stateId));
            setCustomVenueType(resolved.customType);
            setExtra(mapScreenToExtra(screen));
            setMediaFiles(mapDraftMedia(screen.image_urls));
        }

        setFetchingDraft(false);
    }, [setForm, setExtra, setCustomVenueType, setMediaFiles, categoryNames, findCountryByName, findStateByName]);

    // Prefills a brand new screen from another screen's reusable details.
    // currentDraftId is intentionally left unset — Save/Submit will create a
    // new screen, not update the one being copied from. Media is never
    // copied, matching the backend's clone-data contract.
    const loadClone = useCallback(async (id: string) => {
        setFetchingDraft(true);
        try {
            const clone = await ownerScreenApi.getCloneData(id);
            const { form, customVenueType } = mapCloneToForm(clone, screenOptions);
            setForm(form);
            setCustomVenueType(customVenueType);
            setExtra(mapCloneToExtra(clone));
            setMediaFiles([]);
        } catch (error) {
            console.error('Failed to load clone data:', error);
            useAlertStore.getState().showAlert('Error', 'Could not load screen data to duplicate.');
        } finally {
            setFetchingDraft(false);
        }
    }, [screenOptions, setForm, setExtra, setCustomVenueType, setMediaFiles]);

    const resetDraftState = useCallback(() => {
        setCurrentDraftId(undefined);
        setForm(DEFAULT_FORM);
        setCustomVenueType('');
        setExtra(DEFAULT_EXTRA);
        setMediaFiles([]);
        setFetchingDraft(false);
    }, [setForm, setExtra, setCustomVenueType, setMediaFiles]);

    return { loadDraft, loadClone, resetDraftState, fetchingDraft, currentDraftId, setCurrentDraftId };
}
