/**
 * A Zustand persist storage adapter backed by expo-file-system.
 * This avoids needing @react-native-async-storage/async-storage (which requires a native rebuild).
 * Works with any existing Expo development build.
 *
 * Uses documentDirectory (not cacheDirectory): cacheDirectory is OS-managed and can be
 * purged at any time (low storage, or a user clearing the app's cache in device settings),
 * which was wiping persisted store data unpredictably.
 */
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_DIR = FileSystem.documentDirectory;

function getStoragePath(name: string): string {
    return `${STORAGE_DIR}zustand_${name}.json`;
}

export const fileSystemStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const path = getStoragePath(name);
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            const content = await FileSystem.readAsStringAsync(path);
            // Guard against partial/corrupted writes (e.g. app killed mid-write) so a bad
            // file self-heals instead of crashing every launch until manually cleared.
            try {
                JSON.parse(content);
            } catch {
                await FileSystem.deleteAsync(path, { idempotent: true });
                return null;
            }
            return content;
        } catch {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            const path = getStoragePath(name);
            await FileSystem.writeAsStringAsync(path, value);
        } catch {
            // Silently fail — in-memory store is still intact
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            const path = getStoragePath(name);
            const info = await FileSystem.getInfoAsync(path);
            if (info.exists) {
                await FileSystem.deleteAsync(path);
            }
        } catch {
            // Silently fail
        }
    },
    clearAllStorage: async (): Promise<void> => {
        try {
            if (!STORAGE_DIR) return;
            const files = await FileSystem.readDirectoryAsync(STORAGE_DIR);
            const zustandFiles = files.filter(f => f.startsWith('zustand_') && f.endsWith('.json'));
            for (const file of zustandFiles) {
                await FileSystem.deleteAsync(`${STORAGE_DIR}${file}`, { idempotent: true });
            }
        } catch {
            // Silently fail
        }
    },
};
