import { fileSystemStorage } from '../fileSystemStorage';
import * as FileSystem from 'expo-file-system/legacy';

jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: 'file:///mock-documents/',
    cacheDirectory: 'file:///mock-cache/',
    getInfoAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    readDirectoryAsync: jest.fn(),
}));

describe('fileSystemStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('persists data under the durable document directory, not the OS-managed cache directory', async () => {
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);

        await fileSystemStorage.setItem('advertiser-orders-cache', '{"orders":[]}');

        const [path] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
        expect(path).toContain('mock-documents');
        expect(path).not.toContain('mock-cache');
    });

    it('self-heals from a corrupted persisted file instead of crashing on every future launch', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('{ not valid json ');
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

        const result = await fileSystemStorage.getItem('advertiser-orders-cache');

        expect(result).toBeNull();
        expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });

    it('returns valid persisted JSON untouched', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('{"orders":[]}');

        const result = await fileSystemStorage.getItem('advertiser-orders-cache');

        expect(result).toBe('{"orders":[]}');
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('returns null when the file does not exist yet, without touching deleteAsync', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

        const result = await fileSystemStorage.getItem('advertiser-orders-cache');

        expect(result).toBeNull();
        expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
});
