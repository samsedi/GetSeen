import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * HapticService - Centralized feedback for GetSeen.
 * Ensures consistent physical response on Infinix Xpad and phones.
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success') => {
    // Avoid errors on web/simulators
    if (Platform.OS === 'web') return;

    switch (type) {
        case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
        case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
        case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
        default:
            Haptics.selectionAsync();
    }
};