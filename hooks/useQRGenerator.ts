import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { useAlertStore } from '@/store/useAlertStore';
import { SavedQR } from '@/constants/mockData';
import { fetchQrCodes, createQrCode, deleteQrCode } from '@/api/qrService';

const buildQrImageUrl = (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&color=2B4373`;

export function useQRGenerator() {
    const showAlert = useAlertStore((state) => state.showAlert);

    const [qrName, setQrName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewedQR, setViewedQR] = useState<SavedQR | null>(null);

    // Fetch QRs on focus
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const loadQRs = async () => {
                try {
                    const data = await fetchQrCodes();
                    if (isActive) {
                        setSavedQRs(data);
                    }
                } catch (error) {
                    console.error("Failed to load QR codes:", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };
            loadQRs();
            return () => { isActive = false; };
        }, [])
    );

    // Dynamic QR API URL Construction
    const qrImageUrl = useMemo(() => buildQrImageUrl(websiteUrl || "https://getseen.app"), [websiteUrl]);

    const handleCreateQR = useCallback(async () => {
        if (!qrName || !websiteUrl) {
            showAlert("Missing Info", "Please provide a name and a link to generate your code.");
            return;
        }

        try {
            const newQR = await createQrCode({ name: qrName, url: websiteUrl });
            setSavedQRs(prev => [newQR, ...prev]);
            setQrName('');
            setWebsiteUrl('');
            showAlert("Success", "New QR Code has been created and saved!");
        } catch (error) {
            console.error("Failed to create QR code:", error);
            showAlert("Error", "Failed to save QR code. Please try again.");
        }
    }, [qrName, websiteUrl, showAlert]);

    const handleDownload = useCallback(async (qr: SavedQR) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                showAlert("Permission Denied", "We need access to your photos to save the QR code.");
                return;
            }

            showAlert("Downloading", "Please wait...");
            
            const imageUrl = buildQrImageUrl(qr.url);
            const filename = `qr_${qr.id || Date.now()}.png`;
            const fileUri = FileSystem.documentDirectory + filename;
            
            const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
            await MediaLibrary.saveToLibraryAsync(uri);
            
            showAlert("Success", "QR Code saved to your photos!");
        } catch (error: any) {
            console.warn("Download error:", error);
            const errMsg = error?.message || "An unexpected error occurred.";
            showAlert("Download Failed", `Failed to download the QR code: ${errMsg}`);
        }
    }, [showAlert]);

    const handleView = useCallback((qr: SavedQR) => {
        setViewedQR(qr);
    }, []);

    const handleDismissView = useCallback(() => {
        setViewedQR(null);
    }, []);

    const handleReport = useCallback(() => {
        showAlert("Analytics", "Loading real-time scan data...");
    }, [showAlert]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            await deleteQrCode(id);
            setSavedQRs(prev => prev.filter(q => q.id !== id));
            showAlert("Deleted", "The campaign was successfully removed.");
        } catch (error) {
            console.error("Failed to delete QR code:", error);
            showAlert("Error", "Failed to delete QR code.");
        }
    }, [showAlert]);

    return {
        qrName,
        setQrName,
        websiteUrl,
        setWebsiteUrl,
        savedQRs,
        loading,
        qrImageUrl,
        viewedQR,
        handleCreateQR,
        handleDownload,
        handleView,
        handleDismissView,
        handleReport,
        handleDelete,
        buildQrImageUrl,
    };
}

