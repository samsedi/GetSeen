import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { useAlertStore } from '@/store/useAlertStore';
import { LocalMediaFile } from './types';

export function useMediaPicker(initialFiles: LocalMediaFile[] = []) {
    const [mediaFiles, setMediaFiles] = useState<LocalMediaFile[]>(initialFiles);

    const pickMedia = async () => {
        if (mediaFiles.length >= 5) {
            useAlertStore.getState().showAlert('Limit Reached', 'You can only upload a maximum of 5 media files.');
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            useAlertStore.getState().showAlert('Permission Denied', 'We need camera roll access to select photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: Platform.OS !== 'ios',
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            const asset = result.assets[0];
            const isImage = asset.type === 'image';
            const isVideo = asset.type === 'video';

            if (!isImage && !isVideo) {
                useAlertStore.getState().showAlert('Invalid Format', 'Please upload an image or video file only.');
                return;
            }

            let safeName = asset.fileName || asset.uri.split('/').pop() || `media_${Date.now()}`;
            if (!safeName.includes('.')) {
                safeName = isVideo ? `${safeName}.mp4` : `${safeName}.jpeg`;
            }

            setMediaFiles((prev) => [
                ...prev,
                { uri: asset.uri, type: isVideo ? 'video' : 'image', name: safeName, isRemote: false },
            ]);
        }
    };

    const removeMedia = useCallback((index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const resetMedia = useCallback(() => {
        setMediaFiles([]);
    }, []);

    return { mediaFiles, setMediaFiles, pickMedia, removeMedia, resetMedia };
}
