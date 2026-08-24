import { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAlertStore } from '@/store/useAlertStore';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import ownerScreenApi, { OwnerScreenImage, OwnerScreenResponse } from '@/api/ownerScreenService';
import { useOwnerScreenStore } from '@/store/useOwnerScreenStore';

const IMAGE_SLOT_COUNT = 5;

// --------------------------------------------------------------------------
// Isolated Try/Catch API wrappers
// --------------------------------------------------------------------------
const fetchScreenDetailsSafely = async (id: string) => {
    try {
        const response = await ownerScreenApi.getScreenById(id);
        // Extract screen from the expected backend response: { success: true, data: { screen: {...} } }
        // Note: the backend might return { data: { ... } } without 'screen' key depending on exact layout, we adapt dynamically.
        return response.data?.screen || (response.data as unknown as OwnerScreenResponse);
    } catch (error: any) {
        useAlertStore.getState().showAlert("Error", "Could not load screen details.");
        return null;
    }
};

const toggleVisibilitySafely = async (id: string, currentStatus: string) => {
    try {
        const newStatus = currentStatus === 'online' ? 'offline' : 'online';
        await ownerScreenApi.updateScreenStatus(id, newStatus);
        return true;
    } catch (error: any) {
        useAlertStore.getState().showAlert("Error", "Could not change visibility.");
        return false;
    }
};

const deleteScreenSafely = async (id: string) => {
    try {
        await ownerScreenApi.deleteScreen(id);
        useAlertStore.getState().showAlert("Deleted", "Screen removed successfully.");
        return true;
    } catch (error: any) {
        const msg = error.response?.data?.error?.message || "Could not delete screen.";
        useAlertStore.getState().showAlert("Error", msg);
        return false;
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
    const updateScreenInStore = useOwnerScreenStore(state => state.updateScreenInStore);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [screenData, setScreenData] = useState<OwnerScreenResponse | null>(null);

    // Index of the image slot currently being uploaded to / removed from
    // (image_1..image_5, by position), or null when none is in flight.
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

    // Handle primary image and image urls array
    const carouselMediaUrls = screenData?.image_urls || (screenData?.primary_image_url ? [screenData.primary_image_url] : []);
    const carousel = useScreenCarousel(carouselMediaUrls);

    // Slots are positional: slot i maps to image_{i+1} on the backend. The
    // list endpoint doesn't return which key each image was uploaded under,
    // so array order is treated as the slot order (matching upload order).
    const imageSlots: (OwnerScreenImage | null)[] = Array.from(
        { length: IMAGE_SLOT_COUNT },
        (_, i) => screenData?.images?.[i] ?? null
    );

    // Refetch on every focus, not just first mount — this screen stays
    // mounted in the stack while the user edits full details or manages
    // media on the add-screen page, so returning via router.back() needs a
    // fresh fetch to pick up what changed there.
    useFocusEffect(
        useCallback(() => {
            if (!screenId) return;
            loadScreenDetails();
        }, [screenId])
    );

    const loadScreenDetails = async () => {
        setLoading(true);
        const data = await fetchScreenDetailsSafely(screenId);
        if (data) {
            setScreenData(data);
        } else {
            router.back();
        }
        setLoading(false);
    };

    const handleToggleVisibility = async (newValue: boolean) => {
        const newStatus = newValue ? 'online' : 'offline';
        const oldStatus = newValue ? 'offline' : 'online';

        // Optimistic UI update (both local and Zustand)
        setScreenData(prev => prev ? { ...prev, status: newStatus } : null);
        updateScreenInStore(screenId, newStatus);

        const success = await toggleVisibilitySafely(screenId, screenData?.status || 'offline');
        if (!success) {
            // Revert on failure
            setScreenData(prev => prev ? { ...prev, status: oldStatus } : null);
            updateScreenInStore(screenId, oldStatus);
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
                        await useOwnerScreenStore.getState().refreshScreens();
                        router.push('/(screen-owner-tabs)/dashboard');
                    }
                    setUpdating(false);
                }
            }
        ]);
    };

    const handleCopyDetails = async () => {
        if (!screenData) return;
        const detailsText = `Slot ID: ${screenId}\nName: ${screenData.title}\nLocation: ${screenData.address}`;
        await Clipboard.setStringAsync(detailsText);
        useAlertStore.getState().showAlert("Copied", "Slot details copied to clipboard.");
    };

    const handleEditFull = () => {
        router.push({
            pathname: '/(screen-owner-tabs)/add-screen',
            params: { draftId: screenId, mode: 'edit', timestamp: Date.now() },
        });
    };

    const handleDuplicate = () => {
        router.push({
            pathname: '/(screen-owner-tabs)/add-screen',
            params: { cloneFrom: screenId, timestamp: Date.now() },
        });
    };

    const handleReplaceImageSlot = async (slotIndex: number) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            useAlertStore.getState().showAlert('Permission Denied', 'We need camera roll access to select photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        const isVideo = asset.type === 'video';
        let name = asset.fileName || asset.uri.split('/').pop() || `media_${Date.now()}`;
        if (!name.includes('.')) name = `${name}.${isVideo ? 'mp4' : 'jpeg'}`;
        const ext = name.split('.').pop() as string;
        const mime = isVideo ? `video/${ext}` : `image/${ext}`;

        setUploadingSlot(slotIndex);
        try {
            await ownerScreenApi.uploadScreenImage(screenId, `image_${slotIndex + 1}`, asset.uri, name, mime);
            const data = await fetchScreenDetailsSafely(screenId);
            if (data) setScreenData(data);
            await useOwnerScreenStore.getState().refreshScreens();
        } catch (error: any) {
            const msg = error.response?.data?.error?.message || error.message || 'Could not upload media.';
            useAlertStore.getState().showAlert('Upload Failed', msg);
        } finally {
            setUploadingSlot(null);
        }
    };

    const handleDeleteImageSlot = (slotIndex: number) => {
        useAlertStore.getState().showAlert('Remove Media', 'Remove this photo or video from the screen?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    setUploadingSlot(slotIndex);
                    try {
                        await ownerScreenApi.deleteScreenImage(screenId, `image_${slotIndex + 1}`);
                        const data = await fetchScreenDetailsSafely(screenId);
                        if (data) setScreenData(data);
                        await useOwnerScreenStore.getState().refreshScreens();
                    } catch (error: any) {
                        const msg = error.response?.data?.error?.message || error.message || 'Could not remove media.';
                        useAlertStore.getState().showAlert('Error', msg);
                    } finally {
                        setUploadingSlot(null);
                    }
                },
            },
        ]);
    };

    return {
        screenId,
        loading,
        updating,
        screenData,
        activeIndex: carousel.activeIndex,
        setActiveIndex: carousel.setActiveIndex,
        flatListRef: carousel.flatListRef,
        imageSlots,
        uploadingSlot,
        handleReplaceImageSlot,
        handleDeleteImageSlot,
        handleToggleVisibility,
        handleDelete,
        handleCopyDetails,
        handleEditFull,
        handleDuplicate,
        router
    };
}
