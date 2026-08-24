import apiClient, { BASE_URL } from './client';
import { ScreenResponseDto } from './screenService';

export interface AdvertiserScreenDTO {
    id: number;
    title: string;
    description: string;
    address: string;
    state: string;
    country: string;
    currency_symbol: string;
    status: string;
    review: string;
    auto_status: string;
    category_id?: number;
    category?: {
        id: number;
        name: string;
        description: string;
    };
    venue_type?: string;
    
    // Pricing
    price: number;
    price_per_week: number;
    price_per_month: number;
    daily_price?: number;
    weekly_price?: number;
    monthly_price?: number;
    daily_markup_price?: number;
    weekly_markup_price?: number;
    monthly_markup_price?: number;
    vendor_price?: number;
    vendor_price_per_week?: number;
    vendor_price_per_month?: number;
    pricing?: {
        currency_symbol: string;
        daily: number;
        weekly: number;
        monthly: number;
        base_daily: number;
        base_weekly: number;
        base_monthly: number;
    };
    
    // Images
    images?: Array<{ filename: string; url: string }>;
    image_urls?: string[];
    primary_image_url?: string;
    
    // Extended fields (assuming snake_case from backend)
    opening_hours_weekdays?: string;
    weekdays_hours?: string;
    opening_hours_weekends?: string;
    weekends_hours?: string;
    estimated_monthly_visitors?: string | number;
    daily_traffic?: string | number;
    age_range?: string;
    gender_demographic?: string;
    male_percentage?: string;
    female_percentage?: string;
    average_dwell_time?: string;
    dwell_time?: string;
    target_audience?: string;
    no_of_screens?: number;
    screen_count?: number;
    dimensions?: string;
    resolution?: string;
    orientation?: string;
    content_format?: string;
    support_audio?: string | boolean;
    estimated_daily_ad_play?: string;
    
    created_at?: string;
    updated_at?: string;
}

export interface PaginationMeta {
    has_next: boolean;
    has_prev: boolean;
    page: number;
    pages: number;
    per_page: number;
    total: number;
}

export interface AdvertiserScreensResponse {
    success: boolean;
    data: {
        screens: AdvertiserScreenDTO[];
        pagination: PaginationMeta;
    };
}

const ADVERTISER_SCREEN_ROUTE = "/advertiser/screens";

// Fallback image builder - will use standard storage path
const resolveImageUrl = (path: any): string => {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    
    const baseUrl = BASE_URL.replace('/api/v1', '');
    
    // Check if it's already a full path without domain
    if (path.startsWith('/')) {
        return `${baseUrl}${path}`;
    }
    
    return `${baseUrl}/static/images/cart_items/${path}`;
};

// Adapter to map AdvertiserScreenDTO to the ScreenResponseDto expected by the existing UI components
export const mapAdvertiserScreenToAppScreen = (dto: AdvertiserScreenDTO): ScreenResponseDto => {
    
    // 1. Compile media URLs based on documentation
    const rawMediaUrls: string[] = [];
    if (dto.primary_image_url) {
        rawMediaUrls.push(dto.primary_image_url);
    }
    if (dto.image_urls && Array.isArray(dto.image_urls)) {
        rawMediaUrls.push(...dto.image_urls);
    } else if (dto.images && Array.isArray(dto.images)) {
        // Handle both old string array and new object array formats
        rawMediaUrls.push(...dto.images.map(img => {
            if (typeof img === 'string') return img;
            return img?.url;
        }).filter(Boolean));
    }
    
    // Deduplicate and resolve to full HTTP URLs
    const mediaUrls = Array.from(new Set(rawMediaUrls))
        .map(resolveImageUrl)
        .filter(url => url !== '');

    // 2. Map pricing based on documentation (use advertiser-facing prices)
    const priceDaily = dto.pricing?.daily || dto.daily_price || dto.price || 0;
    const priceWeekly = dto.pricing?.weekly || dto.weekly_price || dto.price_per_week || 0;
    const priceMonthly = dto.pricing?.monthly || dto.monthly_price || dto.price_per_month || 0;

    return {
        id: String(dto.id),
        name: dto.title,
        description: dto.description || '',
        address: dto.address || '',
        state: dto.state || '',
        country: dto.country || '',
        priceDaily,
        priceWeekly,
        priceMonthly,
        mediaUrls,
        
        // Map extended fields gracefully using fallbacks
        venueType: dto.venue_type || dto.category?.name || '',
        screenEmails: [],
        city: '',
        resolution: dto.dimensions || dto.resolution || '',
        orientation: dto.orientation || '',
        screenCount: dto.no_of_screens || dto.screen_count || 1,
        weekdaysHours: dto.opening_hours_weekdays || dto.weekdays_hours || '',
        weekendsHours: dto.opening_hours_weekends || dto.weekends_hours || '',
        dailyTraffic: Number(dto.estimated_monthly_visitors || dto.daily_traffic || 0),
        targetAudience: dto.target_audience || '',
        ageRange: dto.age_range || '',
        dwellTime: dto.average_dwell_time || dto.dwell_time || '',
        malePercentage: dto.male_percentage 
            ? (String(dto.male_percentage).includes('%') ? String(dto.male_percentage) : `${dto.male_percentage}%`) 
            : (dto.gender_demographic?.includes('Male') ? dto.gender_demographic : ''),
        femalePercentage: dto.female_percentage 
            ? (String(dto.female_percentage).includes('%') ? String(dto.female_percentage) : `${dto.female_percentage}%`) 
            : '',
        verificationStatus: dto.review || 'approved',
        active: dto.status === 'online' || dto.auto_status === 'online',
    };
};

const advertiserScreenApi = {
    getScreens: async (params?: { page?: number; per_page?: number; country_id?: number; search?: string }): Promise<{ screens: ScreenResponseDto[], pagination: PaginationMeta }> => {
        const response = await apiClient.get<AdvertiserScreensResponse>(ADVERTISER_SCREEN_ROUTE, { params });
        
        const screens = (response?.data?.data?.screens || []).map(mapAdvertiserScreenToAppScreen);
        return {
            screens,
            pagination: response?.data?.data?.pagination
        };
    },

    getScreenById: async (id: number | string): Promise<ScreenResponseDto> => {
        const response = await apiClient.get<any>(`${ADVERTISER_SCREEN_ROUTE}/${id}`);
        const rawData = response?.data?.data;
        // The backend might return { data: { screen: { ... } } } or { data: { ... } }
        const screenDto = rawData.screen ? rawData.screen : rawData;
        return mapAdvertiserScreenToAppScreen(screenDto);
    }
};

export default advertiserScreenApi;
