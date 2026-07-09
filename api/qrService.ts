import client from './client';
import { SavedQR } from '@/constants/mockData';

export interface CreateQrRequest {
    name: string;
    url: string;
}

export const fetchQrCodes = async (): Promise<SavedQR[]> => {
    const response = await client.get('/qrcodes');
    return response.data;
};

export const createQrCode = async (data: CreateQrRequest): Promise<SavedQR> => {
    const response = await client.post('/qrcodes', data);
    return response.data;
};

export const deleteQrCode = async (id: string): Promise<void> => {
    await client.delete(`/qrcodes/${id}`);
};
