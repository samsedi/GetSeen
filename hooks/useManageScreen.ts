import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { useAlertStore } from '@/store/useAlertStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import screenApi, { ScreenResponseDto } from '@/api/screenService';

// --------------------------------------------------------------------------
// Isolated Try/Catch API wrappers
// --------------------------------------------------------------------------
const fetchScreenDetailsSafely = async (id: string) => {
    try {
        return await screenApi.getScreenById(id);
    } catch (error: any) {
        useAlertStore.getState().showAlert("Error", "Could not load screen details.");
        return null;
    }
};

const toggleVisibilitySafely = async (id: string) => {
    try {
        await screenApi.toggleVisibility(id);
        return true;
    } catch (error: any) {
        useAlertStore.getState().showAlert("Error", "Could not change visibility.");
        return false;
    }
};

const deleteScreenSafely = async (id: string) => {
    try {
        await screenApi.deleteScreen(id);
        useAlertStore.getState().showAlert("Deleted", "Screen removed successfully.");
        return true;
    } catch (error) {
        useAlertStore.getState().showAlert("Error", "Could not delete screen.");
        return false;
    }
};

const updateScreenSafely = async (id: string, payload: any) => {
    try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        const updated = await screenApi.updateScreen(id, formData);
        useAlertStore.getState().showAlert("Success", "Slot specifications updated.");
        return updated;
    } catch (error: any) {
        useAlertStore.getState().showAlert("Update Failed", error.message);
        return null;
    }
};

// --------------------------------------------------------------------------
// Custom Hook for Carousel UI Logic
// --------------------------------------------------------------------------
function useScreenCarousel(mediaUrls?: string[]) {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!mediaUrls || mediaUrls.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => {
                const nextIndex = (prev + 1) % mediaUrls.length;
                try {
                    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                } catch {
                    // Silently ignore if items aren't laid out yet
                }
                return nextIndex;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [mediaUrls]);

    return { activeIndex, setActiveIndex, flatListRef };
}

// --------------------------------------------------------------------------
// Main Hook
// --------------------------------------------------------------------------
export function useManageScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const screenId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [screenData, setScreenData] = useState<ScreenResponseDto | null>(null);

    const [form, setForm] = useState({
        name: '',
        resolution: '',
        address: ''
    });

    const carousel = useScreenCarousel(screenData?.mediaUrls);

    useEffect(() => {
        if (!screenId) return;
        loadScreenDetails();
    }, [screenId]);

    const loadScreenDetails = async () => {
        setLoading(true);
        const data = await fetchScreenDetailsSafely(screenId);
        if (data) {
            setScreenData(data);
            setForm({
                name: data.name || '',
                resolution: data.resolution || '',
                address: data.address || ''
            });
        } else {
            router.back();
        }
        setLoading(false);
    };

    const handleToggleVisibility = async (newValue: boolean) => {
        // Optimistic UI update
        setScreenData(prev => prev ? { ...prev, active: newValue } : null);
        const success = await toggleVisibilitySafely(screenId);
        if (!success) {
            // Revert on failure
            setScreenData(prev => prev ? { ...prev, active: !newValue } : null);
        }
    };

    const handleDelete = () => {
        useAlertStore.getState().showAlert("Delete Slot", "Are you sure you want to permanently delete this screen?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    setUpdating(true);
                    const success = await deleteScreenSafely(screenId);
                    if (success) {
                        router.push('/(screen-owner-tabs)/dashboard');
                    }
                    setUpdating(false);
                }
            }
        ]);
    };

    const handleSaveUpdates = async () => {
        setUpdating(true);
        const payload = {
            ...screenData,
            name: form.name,
            resolution: form.resolution,
            address: form.address
        };

        const updated = await updateScreenSafely(screenId, payload);
        if (updated) {
            setScreenData(updated);
        }
        setUpdating(false);
    };

    const handleCopyDetails = async () => {
        if (!screenData) return;
        const detailsText = `Slot ID: ${screenId}\nName: ${screenData.name}\nResolution: ${screenData.resolution}\nLocation: ${screenData.address}`;
        await Clipboard.setStringAsync(detailsText);
        useAlertStore.getState().showAlert("Copied", "Slot details copied to clipboard.");
    };

    return {
        screenId,
        loading,
        updating,
        screenData,
        form,
        setForm,
        activeIndex: carousel.activeIndex,
        setActiveIndex: carousel.setActiveIndex,
        flatListRef: carousel.flatListRef,
        handleToggleVisibility,
        handleDelete,
        handleSaveUpdates,
        handleCopyDetails,
        router
    };
}
