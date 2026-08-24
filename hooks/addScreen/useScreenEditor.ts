import { useState } from 'react';
import ownerScreenApi from '@/api/ownerScreenService';
import { useAlertStore } from '@/store/useAlertStore';
import { useOwnerScreenStore } from '@/store/useOwnerScreenStore';
import { useRouter } from 'expo-router';
import { AddScreenForm, AddScreenExtra } from './types';
import { appendScreenMetadata } from './screenFormData';

// For editing an already-submitted screen: action=update doesn't require
// every field to be filled (an incomplete edit just drops the screen back
// to draft, per the backend contract) and never touches media — images are
// managed one slot at a time from the manage-screen page instead.
export function useScreenEditor(screenId: string | undefined, form: AddScreenForm, extra: AddScreenExtra, customVenueType: string) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const saveChanges = async (): Promise<boolean> => {
        if (!screenId) return false;

        if (!form.name.trim() || !form.address.trim()) {
            useAlertStore.getState().showAlert('Missing Fields', 'Title and address are required.');
            return false;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('action', 'update');
        appendScreenMetadata(formData, form, extra, customVenueType);

        try {
            await ownerScreenApi.updateScreen(screenId, formData);
            await useOwnerScreenStore.getState().refreshScreens();
            useAlertStore.getState().showAlert(
                'Saved',
                'Your changes have been saved.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.error?.message || error.message || 'Could not save changes.';
            useAlertStore.getState().showAlert('Update Failed', msg);
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { saving, saveChanges };
}
