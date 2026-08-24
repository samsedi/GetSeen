export interface LocalMediaFile {
    uri: string;
    type: 'image' | 'video';
    name: string;
    isRemote?: boolean;
}

// `state`/`country` hold the display name shown in the picker; the numeric
// `*_id` backend needs is resolved from the loaded screen-options list by
// matching that name (existing screens only return names, not ids).
export interface AddScreenForm {
    name: string;
    venueType: string;
    categoryId: number | null;
    address: string;
    country: string;
    countryId: number | null;
    state: string;
    stateId: number | null;
    dimensions: string;
    monthlyVisitors: string;
    targetAudience: string;
}

export interface AddScreenExtra {
    emails: string;
    description: string;
    vendorNote: string;
    weekdaysHours: string;
    weekendsHours: string;
    ageRange: string;
    dwellTime: string;
    screenCount: string;
    orientation: string;
    malePercentage: string;
    femalePercentage: string;
    priceDaily: string;
    priceWeekly: string;
    priceMonthly: string;
}

export const DEFAULT_FORM: AddScreenForm = {
    name: '', venueType: '', categoryId: null, address: '',
    country: 'Nigeria', countryId: null, state: '', stateId: null,
    dimensions: '', monthlyVisitors: '', targetAudience: '',
};

export const DEFAULT_EXTRA: AddScreenExtra = {
    emails: '', description: '', vendorNote: '', weekdaysHours: '',
    weekendsHours: '', ageRange: '', dwellTime: '', screenCount: '',
    orientation: '', malePercentage: '', femalePercentage: '',
    priceDaily: '', priceWeekly: '', priceMonthly: '',
};
