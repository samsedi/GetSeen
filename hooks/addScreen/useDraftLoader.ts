import { useState, useCallback } from 'react';
import screenApi from '@/api/screenService';
import { useAlertStore } from '@/store/useAlertStore';
import { AddScreenForm, AddScreenExtra, LocalMediaFile, DEFAULT_FORM, DEFAULT_EXTRA } from './types';

// Pure mapper functions
const resolveVenueType = (draftType: string | undefined): { venueType: string; customType: string } => {
    let vType = draftType || '';
    let cType = '';
    const KNOWN_VENUE_OPTIONS = [
        "Cinemas", "Co-Working Spaces", "Gyms & Fitness Centers", "Laundromat",
        "Lounges & Bars", "Music Studio", "Restaurants", "Supermarket & Shopping Malls", "Transit"
    ];
    if (vType && !KNOWN_VENUE_OPTIONS.includes(vType) && vType !== 'Other') {
        cType = vType;
        vType = 'Other';
    }
    return { venueType: vType, customType: cType };
};

const mapDraftToForm = (draft: any, resolvedVenueType: string): AddScreenForm => ({
    name: draft.name || '',
    venueType: resolvedVenueType,
    address: draft.address || '',
    city: draft.city || '',
    state: draft.state || '',
    resolution: draft.resolution || '',
    dailyTraffic: draft.dailyTraffic?.toString() || '',
    targetAudience: draft.targetAudience || '',
});

const mapDraftToExtra = (draft: any): AddScreenExtra => ({
    emails: draft.screenEmails ? draft.screenEmails.join(', ') : '',
    description: draft.description || '',
    country: draft.country || 'Nigeria',
    weekdaysHours: draft.weekdaysHours || '',
    weekendsHours: draft.weekendsHours || '',
    ageRange: draft.ageRange || '',
    dwellTime: draft.dwellTime || '',
    screenCount: draft.screenCount?.toString() || '',
    orientation: draft.orientation || '',
    malePercentage: draft.malePercentage || '',
    femalePercentage: draft.femalePercentage || '',
    priceDaily: draft.priceDaily?.toString() || '',
    priceWeekly: draft.priceWeekly?.toString() || '',
    priceMonthly: draft.priceMonthly?.toString() || '',
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

// Isolated fetcher function
const fetchDraftSafely = async (id: string) => {
    try {
        return await screenApi.getDraftById(id);
    } catch (error) {
        console.error('Failed to load draft:', error);
        useAlertStore.getState().showAlert('Error', 'Could not load the draft data.');
        return null;
    }
};

export function useDraftLoader(
    setForm: (form: AddScreenForm) => void,
    setExtra: (extra: AddScreenExtra) => void,
    setCustomVenueType: (val: string) => void,
    setMediaFiles: (files: LocalMediaFile[]) => void
) {
    const [fetchingDraft, setFetchingDraft] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(undefined);

    const loadDraft = useCallback(async (id: string) => {
        setCurrentDraftId(id);
        setFetchingDraft(true);
        
        const draft = await fetchDraftSafely(id);
        if (draft) {
            const { venueType, customType } = resolveVenueType(draft.venueType);
            setForm(mapDraftToForm(draft, venueType));
            setCustomVenueType(customType);
            setExtra(mapDraftToExtra(draft));
            setMediaFiles(mapDraftMedia(draft.mediaUrls));
        }
        
        setFetchingDraft(false);
    }, [setForm, setExtra, setCustomVenueType, setMediaFiles]);

    const resetDraftState = useCallback(() => {
        setCurrentDraftId(undefined);
        setForm(DEFAULT_FORM);
        setCustomVenueType('');
        setExtra(DEFAULT_EXTRA);
        setMediaFiles([]);
        setFetchingDraft(false);
    }, [setForm, setExtra, setCustomVenueType, setMediaFiles]);

    return { loadDraft, resetDraftState, fetchingDraft, currentDraftId };
}
