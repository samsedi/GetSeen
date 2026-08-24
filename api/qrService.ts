import client from './client';

export interface QrCodeResponse {
    id: number | string;
    name: string;
    original_url: string;
    short_code: string;
    status: string;
    image_url: string;
    tracking_url: string;
    total_clicks: number;
    created_at: string;
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface QrCodesListResponse {
    success: boolean;
    data: {
        qr_codes?: QrCodeResponse[];
        qr_code?: QrCodeResponse;
        pagination?: PaginationMeta;
    };
}

export interface CreateQrRequest {
    name?: string;
    url: string;
}

export interface UpdateQrRequest {
    name?: string;
    url?: string;
}

const QR_ROUTE = '/advertiser/qr-codes';

const qrApi = {
    getQrCodes: async (params?: { page?: number; per_page?: number }): Promise<QrCodesListResponse> => {
        const response = await client.get<QrCodesListResponse>(QR_ROUTE, { params });
        return response.data;
    },

    getQrCodeById: async (id: string | number): Promise<QrCodeResponse> => {
        const response = await client.get<QrCodesListResponse>(`${QR_ROUTE}/${id}`);
        if (response.data && response?.data?.data && response?.data?.data?.qr_code) {
            return response?.data?.data?.qr_code;
        }
        throw new Error('QR Code not found');
    },

    createQrCode: async (data: CreateQrRequest): Promise<QrCodeResponse> => {
        const response = await client.post<QrCodesListResponse>(QR_ROUTE, data);
        if (response.data && response?.data?.data && response?.data?.data?.qr_code) {
            return response?.data?.data?.qr_code;
        }
        throw new Error('Failed to create QR Code');
    },

    updateQrCode: async (id: string | number, data: UpdateQrRequest): Promise<QrCodeResponse> => {
        const response = await client.patch<QrCodesListResponse>(`${QR_ROUTE}/${id}`, data);
        if (response.data && response?.data?.data && response?.data?.data?.qr_code) {
            return response?.data?.data?.qr_code;
        }
        throw new Error('Failed to update QR Code');
    },

    deleteQrCode: async (id: string | number): Promise<void> => {
        await client.delete(`${QR_ROUTE}/${id}`);
    }
};

export default qrApi;
