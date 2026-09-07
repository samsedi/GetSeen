import { useEffect } from 'react';
import { useAlertStore } from '@/store/useAlertStore';

export function useAppUpdate() {
    const { showAlert, hideAlert } = useAlertStore();

    useEffect(() => {
        const checkAndApplyUpdate = async () => {
            try {
                // In development (expo go or dev client locally), updates api might not be available or throw errors
                if (__DEV__) {
                    return;
                }

                // Dynamically import to prevent native module crash in Expo Go
                const Updates = require('expo-updates');

                if (Updates && Updates.checkForUpdateAsync) {
                    const update = await Updates.checkForUpdateAsync();

                    if (update.isAvailable) {
                        // Show an alert while downloading
                        showAlert(
                            'Update Available',
                            'Downloading the latest version of Get Seen. Please wait a moment...',
                            [] // No buttons so they can't dismiss it
                        );

                        await Updates.fetchUpdateAsync();
                        await Updates.reloadAsync();
                    }
                }
            } catch (error) {
                // Silently fail if offline or updates API is unavailable
                console.log('Error checking for OTA updates:', error);
                hideAlert();
            }
        };

        checkAndApplyUpdate();
    }, [hideAlert, showAlert]);
}
