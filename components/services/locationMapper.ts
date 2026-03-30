import { LocationItem } from '@/constants/mockData';

export const mapBackendToUI = (raw: any): LocationItem => {
    return {
        // Fallback to '0' if ID is missing to prevent crashes
        id: String(raw.id || raw.location_id || '0'),

        // Handles different naming conventions (Spring Boot vs Node.js)
        name: raw.name || raw.venue_name || 'Untitled Venue',

        // Formats price immediately so the UI doesn't have to
        price: raw.price?.toLocaleString() || '0',

        rating: Number(raw.rating || 0),
        category: raw.category || 'General',

        // Converts a single image string OR an array of strings into the correct format
        images: Array.isArray(raw.images)
            ? raw.images.map((img: any) => typeof img === 'string' ? { uri: img } : img)
            : [{ uri: raw.image || raw.thumbnail }],

        address: raw.address || 'Address not available',
        distance: raw.distance || '0m',
        summary: raw.summary || raw.description || 'No description provided.',

        // Ensures these are always arrays even if the backend sends null
        locationInfo: Array.isArray(raw.location_info) ? raw.location_info : [],
        mediaInfo: Array.isArray(raw.media_info) ? raw.media_info : []
    };
};