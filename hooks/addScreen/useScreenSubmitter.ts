import { useState } from 'react';
import ownerScreenApi from '@/api/ownerScreenService';
import { useAlertStore } from '@/store/useAlertStore';
import { useOwnerScreenStore } from '@/store/useOwnerScreenStore';
import { useRouter } from 'expo-router';
import { AddScreenForm, AddScreenExtra, LocalMediaFile } from './types';
import { parsePercentage, parseScreenCount, appendScreenMetadata, appendLocalMedia } from './screenFormData';

const buildFormData = (
    action: 'draft' | 'submit',
    form: AddScreenForm,
    extra: AddScreenExtra,
    customVenueType: string,
    mediaFiles: LocalMediaFile[]
) => {
    const formData = new FormData();
    formData.append('action', action);
    appendScreenMetadata(formData, form, extra, customVenueType);
    appendLocalMedia(formData, mediaFiles);
    return formData;
};

const saveDraftSafely = async (formData: FormData, currentDraftId?: string, onProgress?: (p: number) => void) => {
    try {
        if (currentDraftId) {
            const updated = await ownerScreenApi.updateScreen(currentDraftId, formData, onProgress);
            return updated.id;
        } else {
            const created = await ownerScreenApi.createScreen(formData, onProgress);
            return created.id;
        }
    } catch (error: any) {
        const msg = error.response?.data?.error?.message || error.message || 'Could not save draft.';
        useAlertStore.getState().showAlert('Draft Error', msg);
        return null;
    }
};

const submitScreenSafely = async (formData: FormData, currentDraftId?: string, onProgress?: (p: number) => void) => {
    try {
        if (currentDraftId) {
            await ownerScreenApi.updateScreen(currentDraftId, formData, onProgress);
        } else {
            await ownerScreenApi.createScreen(formData, onProgress);
        }
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.error?.message || error.message || 'Failed to submit screen for review.';
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
            !form.countryId || !form.stateId || !form.dimensions.trim() ||
            !form.targetAudience.trim() || !form.monthlyVisitors.trim();

        if (hasMissingCoreFields) return 'Please complete all required fields marked with *';

        const requiredExtras: Array<keyof AddScreenExtra> = [
            'weekdaysHours', 'weekendsHours', 'ageRange', 'dwellTime',
            'screenCount', 'orientation', 'malePercentage', 'femalePercentage',
            'priceDaily', 'priceWeekly', 'priceMonthly',
        ];
        const hasMissingExtraFields = requiredExtras.some((key) => !extra[key]?.trim());
        if (hasMissingExtraFields)
            return 'Every input metric, demographic segment, and pricing field must be completely filled.';

        const malePct = parsePercentage(extra.malePercentage) ?? 0;
        const femalePct = parsePercentage(extra.femalePercentage) ?? 0;
        if (malePct + femalePct !== 100)
            return 'Male and female percentage must add up to 100.';

        if (mediaFiles.length === 0)
            return 'Please attach at least one valid image or video asset showcasing the physical billboard layout.';

        return null;
    };

    const handleSaveDraft = async (): Promise<boolean> => {
        if (!form.name.trim()) {
            useAlertStore.getState().showAlert("Hold On", "Please give your screen a 'Venue Title' before saving it as a draft.");
            return false;
        }

        setLoading(true);
        setUploadProgress(0);
        const formData = buildFormData('draft', form, extra, customVenueType, mediaFiles);
        const savedId = await saveDraftSafely(formData, currentDraftId, setUploadProgress);
        setLoading(false);

        if (savedId) {
            await useOwnerScreenStore.getState().refreshScreens();
            useAlertStore.getState().showAlert(
                'Draft Saved',
                'You can continue setting up this screen later from your dashboard.',
                [{ text: 'OK', onPress: () => router.push('/(screen-owner-tabs)/dashboard') }]
            );
            return true;
        }
        return false;
    };

    const submitScreen = async (): Promise<boolean> => {
        const validationError = validateForSubmit();
        if (validationError) {
            useAlertStore.getState().showAlert('Missing Fields', validationError);
            return false;
        }

        setLoading(true);
        setUploadProgress(0);
        const formData = buildFormData('submit', form, extra, customVenueType, mediaFiles);
        const success = await submitScreenSafely(formData, currentDraftId, setUploadProgress);
        setLoading(false);

        if (success) {
            await useOwnerScreenStore.getState().refreshScreens();
            useAlertStore.getState().showAlert(
                'Success',
                'Your screen has been submitted for review.',
                [{ text: 'OK', onPress: () => router.push('/(screen-owner-tabs)/dashboard') }]
            );
            return true;
        }
        return false;
    };

    return { loading, uploadProgress, handleSaveDraft, submitScreen };
}
