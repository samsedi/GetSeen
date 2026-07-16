import { useState } from 'react';
import screenApi from '@/api/screenService';
import { useAlertStore } from '@/store/useAlertStore';
import { useRouter } from 'expo-router';
import { AddScreenForm, AddScreenExtra, LocalMediaFile } from './types';

// Pure payload builder
const buildPayload = (form: AddScreenForm, extra: AddScreenExtra, customVenueType: string) => {
    const resolvedVenueType = form.venueType === 'Other' ? customVenueType.trim() : form.venueType;
    const parsedEmails = extra.emails
        ? extra.emails.split(',').map((e) => e.trim()).filter((e) => e.length > 0)
        : [];

    return {
        name: form.name.trim() || undefined,
        venueType: resolvedVenueType.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        resolution: form.resolution.trim() || undefined,
        targetAudience: form.targetAudience.trim() || undefined,
        dailyTraffic: form.dailyTraffic ? parseInt(form.dailyTraffic, 10) : undefined,
        description: extra.description.trim() || undefined,
        country: extra.country || undefined,
        weekdaysHours: extra.weekdaysHours.trim() || undefined,
        weekendsHours: extra.weekendsHours.trim() || undefined,
        ageRange: extra.ageRange.trim() || undefined,
        dwellTime: extra.dwellTime.trim() || undefined,
        orientation: extra.orientation || undefined,
        malePercentage: extra.malePercentage || undefined,
        femalePercentage: extra.femalePercentage || undefined,
        screenCount: extra.screenCount ? parseInt(extra.screenCount, 10) : undefined,
        priceDaily: extra.priceDaily ? parseFloat(extra.priceDaily) : undefined,
        priceWeekly: extra.priceWeekly ? parseFloat(extra.priceWeekly) : undefined,
        priceMonthly: extra.priceMonthly ? parseFloat(extra.priceMonthly) : undefined,
        screenEmails: parsedEmails.length > 0 ? parsedEmails : undefined,
    };
};

const buildFormData = (payload: any, mediaFiles: LocalMediaFile[]) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    mediaFiles
        .filter((f) => !f.isRemote)
        .forEach((file) => {
            const ext = file.name.split('.').pop() || (file.type === 'video' ? 'mp4' : 'jpeg');
            const mime = file.type === 'video' ? `video/${ext}` : `image/${ext}`;
            formData.append('images', {
                uri: file.uri,
                name: file.name.endsWith(ext) ? file.name : `${file.name}.${ext}`,
                type: mime,
            } as any);
        });

    return formData;
};

// Isolated try/catch fetchers
const saveDraftSafely = async (formData: FormData, currentDraftId?: string, onProgress?: (p: number) => void) => {
    try {
        if (currentDraftId) {
            await screenApi.updateDraft(currentDraftId, formData, onProgress);
            return currentDraftId;
        } else {
            const newDraft = await screenApi.createDraft(formData, onProgress);
            return newDraft.id;
        }
    } catch (error: any) {
        useAlertStore.getState().showAlert('Draft Error', error.message || 'Could not save draft.');
        return null;
    }
};

const submitScreenSafely = async (formData: FormData, currentDraftId?: string, onProgress?: (p: number) => void) => {
    try {
        if (currentDraftId) {
            await screenApi.updateDraft(currentDraftId, formData, onProgress);
            await screenApi.publishDraft(currentDraftId);
        } else {
            await screenApi.createScreen(formData, onProgress);
        }
        return true;
    } catch (error: any) {
        const msg = error.message || error.response?.data?.debug_cause || 'Failed to finalize infrastructure asset submission.';
        useAlertStore.getState().showAlert('Submission Failed', msg);
        return false;
    }
};

export function useScreenSubmitter(
    form: AddScreenForm,
    extra: AddScreenExtra,
    customVenueType: string,
    mediaFiles: LocalMediaFile[],
    currentDraftId: string | undefined
) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const validateForSubmit = (): string | null => {
        const resolvedVenueType = form.venueType === 'Other' ? customVenueType.trim() : form.venueType;
        const hasMissingCoreFields =
            !form.name.trim() || !resolvedVenueType?.trim() || !form.address.trim() ||
            !form.city.trim() || !form.state.trim() || !form.resolution.trim() ||
            !form.targetAudience.trim() || !form.dailyTraffic.trim();

        if (hasMissingCoreFields) return 'Please complete all required fields marked with *';

        const hasMissingExtraFields = Object.values(extra).some(
            (val) => typeof val === 'string' && !val.trim()
        );
        if (hasMissingExtraFields)
            return 'Every input metric, demographic segment, and pricing field must be completely filled.';

        if (mediaFiles.length === 0)
            return 'Please attach at least one valid image or video asset showcasing the physical billboard layout.';

        return null; 
    };

    const handleSaveDraft = async () => {
        if (!form.name.trim()) {
            useAlertStore.getState().showAlert("Hold On", "Please give your screen a 'Venue Title' before saving it as a draft.");
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        const payload = buildPayload(form, extra, customVenueType);
        const formData = buildFormData(payload, mediaFiles);
        const savedId = await saveDraftSafely(formData, currentDraftId, setUploadProgress);
        setLoading(false);

        if (savedId) {
            useAlertStore.getState().showAlert(
                'Draft Saved',
                'You can continue setting up this screen later from your dashboard.',
                [{ text: 'OK', onPress: () => router.push('/(screen-owner-tabs)/dashboard') }]
            );
        }
    };

    const submitScreen = async () => {
        const validationError = validateForSubmit();
        if (validationError) {
            useAlertStore.getState().showAlert('Missing Fields', validationError);
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        const payload = buildPayload(form, extra, customVenueType);
        const formData = buildFormData(payload, mediaFiles);
        const success = await submitScreenSafely(formData, currentDraftId, setUploadProgress);
        setLoading(false);

        if (success) {
            useAlertStore.getState().showAlert(
                'Success',
                'Screen layout successfully initialized in background stream!',
                [{ text: 'OK', onPress: () => router.push('/(screen-owner-tabs)/dashboard') }]
            );
        }
    };

    return { loading, uploadProgress, handleSaveDraft, submitScreen };
}
