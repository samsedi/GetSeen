import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fileSystemStorage } from './fileSystemStorage';
import qrApi, { QrCodeResponse, PaginationMeta, CreateQrRequest, UpdateQrRequest } from '@/api/qrService';

interface QRState {
    qrCodes: QrCodeResponse[];
    pagination: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    lastFetchedAt: number | null;
    
    fetchQrCodes: (params?: { page?: number; per_page?: number; forceRefresh?: boolean }) => Promise<void>;
    refreshQrCodes: () => Promise<void>;
    createQrCode: (data: CreateQrRequest) => Promise<QrCodeResponse>;
    updateQrCode: (id: string | number, data: UpdateQrRequest) => Promise<QrCodeResponse>;
    deleteQrCode: (id: string | number) => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export const useQRStore = create<QRState>()(
    persist(
        (set, get) => ({
            qrCodes: [],
            pagination: null,
            loading: false,
            refreshing: false,
            error: null,
            lastFetchedAt: null,
            
            fetchQrCodes: async (params = {}) => {
                const { page = 1, per_page = 10, forceRefresh = false } = params;
                const { qrCodes, lastFetchedAt } = get();

                if (
                    !forceRefresh &&
                    page === 1 &&
                    qrCodes.length > 0 &&
                    lastFetchedAt &&
                    Date.now() - lastFetchedAt < CACHE_TTL_MS
                ) {
                    return;
                }

                set({ loading: true, error: null });
                try {
                    const response = await qrApi.getQrCodes({ page, per_page });
                    if (response.success && response.data && response.data.qr_codes) {
                        set((state) => ({
                            qrCodes: page === 1 ? response.data.qr_codes! : [...state.qrCodes, ...response.data.qr_codes!],
                            pagination: response.data.pagination || null,
                            lastFetchedAt: page === 1 ? Date.now() : lastFetchedAt,
                            loading: false,
                        }));
                    } else {
                        set({ error: 'Failed to fetch QR codes.', loading: false });
                    }
                } catch (error: any) {
                    console.error('Error fetching QR codes:', error);
                    set({ error: error.message || 'An error occurred', loading: false });
                }
            },

            refreshQrCodes: async () => {
                set({ refreshing: true, error: null });
                try {
                    const response = await qrApi.getQrCodes({ page: 1, per_page: 10 });
                    if (response.success && response.data && response.data.qr_codes) {
                        set({
                            qrCodes: response.data.qr_codes,
                            pagination: response.data.pagination || null,
                            lastFetchedAt: Date.now(),
                            refreshing: false,
                        });
                    } else {
                        set({ error: 'Failed to refresh QR codes.', refreshing: false });
                    }
                } catch (error: any) {
                    console.error('Error refreshing QR codes:', error);
                    set({ error: error.message || 'An error occurred', refreshing: false });
                }
            },
            
            createQrCode: async (data: CreateQrRequest) => {
                try {
                    const newQr = await qrApi.createQrCode(data);
                    const { qrCodes } = get();
                    set({ qrCodes: [newQr, ...qrCodes] });
                    return newQr;
                } catch (error: any) {
                    throw new Error(error.message || 'Failed to create QR code');
                }
            },
            
            updateQrCode: async (id: string | number, data: UpdateQrRequest) => {
                try {
                    const updatedQr = await qrApi.updateQrCode(id, data);
                    const { qrCodes } = get();
                    set({
                        qrCodes: qrCodes.map(qr => (qr.id === id ? updatedQr : qr))
                    });
                    return updatedQr;
                } catch (error: any) {
                    throw new Error(error.message || 'Failed to update QR code');
                }
            },
            
            deleteQrCode: async (id: string | number) => {
                try {
                    await qrApi.deleteQrCode(id);
                    const { qrCodes } = get();
                    set({
                        qrCodes: qrCodes.filter(qr => qr.id !== id)
                    });
                } catch (error: any) {
                    throw new Error(error.message || 'Failed to delete QR code');
                }
            }
        }),
        {
            name: 'qr-codes-storage',
            version: 1,
            migrate: (persistedState: any, version: number) => undefined as any,
            storage: createJSONStorage(() => fileSystemStorage),
        }
    )
);
