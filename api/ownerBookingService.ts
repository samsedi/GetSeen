import apiClient from './client';

export interface AdvertiserDetails {
    id: number;
    name: string;
    email: string;
    phone: string;
    business_name?: string;
}

export interface OwnerBooking {
    id: number;
    order_item_id: number;
    order_id: number;
    order_number: string;
    screen_id: number;
    venue: string;
    location: string;
    advertiser?: AdvertiserDetails;
    start_date: string;
    end_date: string;
    display_start_date: string;
    display_end_date: string;
    duration: string;
    media_type: string;
    media_filename?: string;
    media_url?: string;
    status: 'scheduled' | 'active' | 'approved' | 'completed' | 'cancelled' | 'rejected';
    status_display: string;
    amount_paid: number;
    currency_symbol: string;
}

export interface OwnerBookingsResponse {
    bookings: OwnerBooking[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

export interface BookingQueryParams {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
}

// Ensure function is small and does exactly one thing: fetching raw bookings.
export const fetchOwnerBookingsFromApi = async (params?: BookingQueryParams): Promise<OwnerBookingsResponse> => {
    return executeFetchBookings(params);
};

// Extracted internal method to isolate the try/catch logic per clean code rules.
const executeFetchBookings = async (params?: BookingQueryParams): Promise<OwnerBookingsResponse> => {
    try {
        const response = await apiClient.get<any>('/screen-owner/bookings', { params });
        return extractBookingsData(response);
    } catch (error) {
        throw error;
    }
};

export const fetchBookingById = async (id: string | number): Promise<OwnerBooking> => {
    return executeFetchBookingById(id);
};

const executeFetchBookingById = async (id: string | number): Promise<OwnerBooking> => {
    try {
        const response = await apiClient.get<any>(`/screen-owner/bookings/${id}`);
        return extractSingleBookingData(response);
    } catch (error) {
        throw error;
    }
};

const extractSingleBookingData = (response: any): OwnerBooking => {
    if (response.data && response?.data?.success && response?.data?.data) {
        return response?.data?.data?.booking || response?.data?.data;
    }
    return null as unknown as OwnerBooking; // Graceful null return
};

const extractBookingsData = (response: any): OwnerBookingsResponse => {
    if (response.data && response?.data?.success) {
        return response?.data?.data || { bookings: [], pagination: { page: 1, per_page: 20, total: 0, pages: 0, has_next: false, has_prev: false } };
    }
    if (response.data && response?.data?.bookings) {
        return response.data;
    }
    return { bookings: [], pagination: { page: 1, per_page: 20, total: 0, pages: 0, has_next: false, has_prev: false } };
};

export default {
    fetchOwnerBookingsFromApi,
    fetchBookingById,
};
