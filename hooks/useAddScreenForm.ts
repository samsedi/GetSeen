import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { DEFAULT_FORM, DEFAULT_EXTRA, AddScreenForm, AddScreenExtra } from './addScreen/types';
import { useDraftLoader } from './addScreen/useDraftLoader';
import { useMediaPicker } from './addScreen/useMediaPicker';
import { useScreenSubmitter } from './addScreen/useScreenSubmitter';

export function useAddScreenForm() {
    const params = useLocalSearchParams<{ draftId?: string; timestamp?: string }>();

    const [form, setForm] = useState<AddScreenForm>(DEFAULT_FORM);
    const [extra, setExtra] = useState<AddScreenExtra>(DEFAULT_EXTRA);
    const [customVenueType, setCustomVenueType] = useState('');

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerData, setPickerData] = useState<{
        title: string;
        options: string[];
        onSelect: (value: string) => void;
    }>({ title: '', options: [], onSelect: () => {} });

    const lastProcessedKey = React.useRef<string | undefined>(undefined);

    const { mediaFiles, setMediaFiles, pickMedia, removeMedia } = useMediaPicker();
    
    const { loadDraft, resetDraftState, fetchingDraft, currentDraftId } = useDraftLoader(
        setForm, setExtra, setCustomVenueType, setMediaFiles
    );

    const { loading, handleSaveDraft, submitScreen } = useScreenSubmitter(
        form, extra, customVenueType, mediaFiles, currentDraftId
    );

    useEffect(() => {
        const currentKey = `${params.draftId}-${params.timestamp}`;
        if (currentKey === lastProcessedKey.current) return;
        lastProcessedKey.current = currentKey;

        if (params.draftId && params.draftId !== 'NEW') {
            loadDraft(params.draftId);
        } else {
            resetDraftState();
        }
    }, [params.draftId, params.timestamp, loadDraft, resetDraftState]);

    const handleFormChange = useCallback((key: keyof AddScreenForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleExtraChange = useCallback((key: keyof AddScreenExtra, value: string) => {
        setExtra((prev) => ({ ...prev, [key]: value }));
    }, []);

    const openDropdown = useCallback((title: string, options: string[], onSelect: (val: string) => void) => {
        setPickerData({ title, options, onSelect });
        setPickerVisible(true);
    }, []);

    return {
        form, extra, customVenueType, setCustomVenueType,
        mediaFiles, loading, fetchingDraft, currentDraftId, params,
        pickerVisible, setPickerVisible, pickerData, openDropdown,
        handleFormChange, handleExtraChange, pickMedia, removeMedia,
        handleSaveDraft, submitScreen,
    };
}
