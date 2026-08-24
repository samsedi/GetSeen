import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { useAlertStore } from '@/store/useAlertStore';
import { useQRStore } from '@/store/useQRStore';
import { QrCodeResponse } from '@/api/qrService';

// Fallback preview generator for before the QR is saved.
const buildQrImageUrl = (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&color=2B4373`;

export function useQRGenerator() {
    const showAlert = useAlertStore((state) => state.showAlert);

    const [qrName, setQrName] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [viewedQR, setViewedQR] = useState<QrCodeResponse | null>(null);

    // Zustand store values
    const { qrCodes, pagination, loading, fetchQrCodes, createQrCode, deleteQrCode } = useQRStore();

    // Fetch QRs on focus
    useFocusEffect(
        useCallback(() => {
            fetchQrCodes({ page: 1, per_page: 5 });
        }, [fetchQrCodes])
    );

    const loadMoreQRs = useCallback(() => {
        if (!loading && pagination?.has_next) {
            fetchQrCodes({ page: pagination.page + 1, per_page: 5 });
        }
    }, [loading, pagination, fetchQrCodes]);

    // Dynamic QR API URL Construction (for preview before generating)
    const qrImageUrl = useMemo(() => buildQrImageUrl(websiteUrl || "https://getseen.app"), [websiteUrl]);

    const handleCreateQR = useCallback(async () => {
        if (!qrName || !websiteUrl) {
            showAlert("Missing Info", "Please provide a name and a link to generate your code.");
            return;
        }

        try {
            await createQrCode({ name: qrName, url: websiteUrl });
            setQrName('');
            setWebsiteUrl('');
            showAlert("Success", "New QR Code has been created and saved!");
        } catch (error) {
            console.error("Failed to create QR code:", error);
            showAlert("Error", "Failed to save QR code. Please try again.");
        }
    }, [qrName, websiteUrl, createQrCode, showAlert]);

    const handleDownload = useCallback(async (qr: QrCodeResponse) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                showAlert("Permission Denied", "We need access to your photos to save the QR code.");
                return;
            }

            showAlert("Downloading", "Please wait...");
            
            // Use the backend image_url instead of recreating it
            const imageUrl = qr.image_url;
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

    const handleView = useCallback((qr: QrCodeResponse) => {
        setViewedQR(qr);
    }, []);

    const handleDismissView = useCallback(() => {
        setViewedQR(null);
    }, []);

    const handleReport = useCallback(() => {
        showAlert("Analytics", "Loading real-time scan data...");
    }, [showAlert]);

    const handleDelete = useCallback(async (id: string | number) => {
        try {
            await deleteQrCode(id);
            showAlert("Deleted", "The campaign was successfully removed.");
        } catch (error) {
            console.error("Failed to delete QR code:", error);
            showAlert("Error", "Failed to delete QR code.");
        }
    }, [deleteQrCode, showAlert]);

    return {
        qrName,
        setQrName,
        websiteUrl,
        setWebsiteUrl,
        savedQRs: qrCodes,
        loading,
        qrImageUrl,
        viewedQR,
        handleCreateQR,
        handleDownload,
        handleView,
        handleDismissView,
        handleReport,
        handleDelete,
        loadMoreQRs,
        hasMore: pagination?.has_next || false,
        buildQrImageUrl,
    };
}
