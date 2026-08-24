import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { DEFAULT_FORM, DEFAULT_EXTRA, AddScreenForm, AddScreenExtra } from './addScreen/types';
import { useDraftLoader } from './addScreen/useDraftLoader';
import { useMediaPicker } from './addScreen/useMediaPicker';
import { useScreenSubmitter } from './addScreen/useScreenSubmitter';
import { useScreenEditor } from './addScreen/useScreenEditor';
import { useScreenOptions } from './addScreen/useScreenOptions';
import { useAddScreenDraftStore } from '@/store/useAddScreenDraftStore';

export function useAddScreenForm() {
    const params = useLocalSearchParams<{ draftId?: string; timestamp?: string; mode?: string; cloneFrom?: string }>();
    const mode: 'create' | 'edit' = params.mode === 'edit' ? 'edit' : 'create';

    // Each in-progress screen gets its own locally-persisted slot so unsaved
    // input survives navigating away and is restored on return — cleared
    // only once Save Draft / Submit / Save Changes actually succeeds.
    const draftKey = params.cloneFrom
        ? `clone-${params.cloneFrom}`
        : params.draftId && params.draftId !== 'NEW'
            ? params.draftId
            : 'NEW';

    const [form, setForm] = useState<AddScreenForm>(DEFAULT_FORM);
    const [extra, setExtra] = useState<AddScreenExtra>(DEFAULT_EXTRA);
    const [customVenueType, setCustomVenueTypeRaw] = useState('');

    // Tracks whether the user has typed/selected anything since the form was
    // last loaded or saved, so we know whether to keep persisting it. Only
    // wrapped setters below flip this to true — programmatic loads (draft
    // loading, cloning, reset) bypass them on purpose.
    const [isDirty, setIsDirty] = useState(false);
    const setCustomVenueType = useCallback((val: string) => {
        setCustomVenueTypeRaw(val);
        setIsDirty(true);
    }, []);

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerData, setPickerData] = useState<{
        title: string;
        options: string[];
        onSelect: (value: string) => void;
    }>({ title: '', options: [], onSelect: () => {} });

    const lastProcessedKey = React.useRef<string | undefined>(undefined);

    const { mediaFiles, setMediaFiles, pickMedia, removeMedia } = useMediaPicker();

    const {
        options: screenOptions,
        loading: optionsLoading,
        categoryNames, countryNames, stateNames,
        findCategoryByName, findCountryByName, findStateByName,
        loadStatesForCountry,
    } = useScreenOptions();

    // Draft/clone loading is programmatic, not a user edit — it gets the raw
    // setters so it never flips isDirty.
    const { loadDraft, loadClone, resetDraftState, fetchingDraft, currentDraftId, setCurrentDraftId } = useDraftLoader(
        setForm, setExtra, setCustomVenueTypeRaw, setMediaFiles,
        categoryNames, findCountryByName, findStateByName, screenOptions
    );

    const {
        loading, uploadProgress,
        handleSaveDraft: handleSaveDraftImpl,
        submitScreen: submitScreenImpl,
    } = useScreenSubmitter(
        form, extra, customVenueType, mediaFiles, currentDraftId
    );

    const { saving: savingChanges, saveChanges: saveChangesImpl } = useScreenEditor(
        currentDraftId, form, extra, customVenueType
    );

    useEffect(() => {
        const currentKey = `${params.draftId}-${params.timestamp}-${params.cloneFrom}`;
        if (currentKey === lastProcessedKey.current) return;

        const pending = useAddScreenDraftStore.getState().entries[draftKey];
        if (pending) {
            // Resume unsaved local edits instead of re-fetching — they're
            // newer than whatever is on the server (or there's nothing on
            // the server yet). Still record the real screen id when resuming
            // an existing draft/edit, so saving updates it instead of
            // creating a duplicate. This never needs screen-options, so it
            // doesn't wait for them.
            lastProcessedKey.current = currentKey;
            if (params.draftId && params.draftId !== 'NEW') {
                setCurrentDraftId(params.draftId);
            }
            setForm(pending.form);
            setExtra(pending.extra);
            setCustomVenueTypeRaw(pending.customVenueType);
            setMediaFiles(pending.mediaFiles);
            setIsDirty(true);
            return;
        }

        // Resolving a loaded screen/clone's category/country/state to a
        // display name depends on screen-options being loaded — wait for it
        // rather than resolving against an empty list (this re-fires once
        // optionsLoading flips false, since it's a dependency below).
        // "Add New Screen" with nothing to load doesn't need to wait.
        const needsOptions = Boolean(params.cloneFrom || (params.draftId && params.draftId !== 'NEW'));
        if (needsOptions && optionsLoading) return;

        lastProcessedKey.current = currentKey;
        setIsDirty(false);
        if (params.cloneFrom) {
            loadClone(params.cloneFrom);
        } else if (params.draftId && params.draftId !== 'NEW') {
            loadDraft(params.draftId);
        } else {
            resetDraftState();
        }
    }, [params.draftId, params.timestamp, params.cloneFrom, draftKey, loadDraft, loadClone, resetDraftState, setMediaFiles, setCurrentDraftId, optionsLoading]);

    // Debounced local persistence of in-progress edits, so an accidental
    // (or deliberate but unsaved) navigation away doesn't lose them.
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            useAddScreenDraftStore.getState().saveEntry(draftKey, { form, extra, customVenueType, mediaFiles });
        }, 500);
        return () => clearTimeout(timer);
    }, [draftKey, isDirty, form, extra, customVenueType, mediaFiles]);

    // Only clear the locally-persisted copy once the save actually succeeds
    // — a failed attempt must leave the cached input intact.
    const handleSaveDraft = useCallback(async () => {
        const success = await handleSaveDraftImpl();
        if (success) {
            setIsDirty(false);
            useAddScreenDraftStore.getState().clearEntry(draftKey);
        }
        return success;
    }, [handleSaveDraftImpl, draftKey]);

    const submitScreen = useCallback(async () => {
        const success = await submitScreenImpl();
        if (success) {
            setIsDirty(false);
            useAddScreenDraftStore.getState().clearEntry(draftKey);
        }
        return success;
    }, [submitScreenImpl, draftKey]);

    const saveChanges = useCallback(async () => {
        const success = await saveChangesImpl();
        if (success) {
            setIsDirty(false);
            useAddScreenDraftStore.getState().clearEntry(draftKey);
        }
        return success;
    }, [saveChangesImpl, draftKey]);

    const handleFormChange = useCallback((key: keyof AddScreenForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const handleExtraChange = useCallback((key: keyof AddScreenExtra, value: string) => {
        setExtra((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }, []);

    const selectCategory = useCallback((name: string) => {
        setIsDirty(true);
        if (name === 'Other') {
            setForm((prev) => ({ ...prev, venueType: 'Other', categoryId: null }));
            return;
        }
        const match = findCategoryByName(name);
        setForm((prev) => ({ ...prev, venueType: name, categoryId: match?.id ?? null }));
        setCustomVenueTypeRaw('');
    }, [findCategoryByName]);

    const selectCountry = useCallback((name: string) => {
        setIsDirty(true);
        const match = findCountryByName(name);
        setForm((prev) => ({ ...prev, country: name, countryId: match?.id ?? null, state: '', stateId: null }));
        if (match) loadStatesForCountry(match.id);
    }, [findCountryByName, loadStatesForCountry]);

    const selectState = useCallback((name: string) => {
        setIsDirty(true);
        const match = findStateByName(name);
        setForm((prev) => ({ ...prev, state: name, stateId: match?.id ?? null }));
    }, [findStateByName]);

    const pickMediaTracked = useCallback(async () => {
        await pickMedia();
        setIsDirty(true);
    }, [pickMedia]);

    const removeMediaTracked = useCallback((index: number) => {
        removeMedia(index);
        setIsDirty(true);
    }, [removeMedia]);

    const openDropdown = useCallback((title: string, options: string[], onSelect: (val: string) => void) => {
        setPickerData({ title, options, onSelect });
        setPickerVisible(true);
    }, []);

    // While a screen/clone is being loaded, its category/country/state names
    // can't resolve until screen-options are ready either — show the loading
    // state through that whole window, not just the fetch itself.
    const needsOptionsToLoad = Boolean(params.cloneFrom || (params.draftId && params.draftId !== 'NEW'));
    const isLoadingScreen = fetchingDraft || (needsOptionsToLoad && optionsLoading);

    return {
        mode,
        form, extra, customVenueType, setCustomVenueType,
        mediaFiles, loading, uploadProgress, fetchingDraft: isLoadingScreen, currentDraftId, params,
        pickerVisible, setPickerVisible, pickerData, openDropdown,
        handleFormChange, handleExtraChange,
        pickMedia: pickMediaTracked, removeMedia: removeMediaTracked,
        handleSaveDraft, submitScreen,
        saveChanges, savingChanges,
        categoryNames, countryNames, stateNames,
        selectCategory, selectCountry, selectState,
    };
}
