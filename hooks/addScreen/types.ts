export interface LocalMediaFile {
    uri: string;
    type: 'image' | 'video';
    name: string;
    isRemote?: boolean;
}

export interface AddScreenForm {
    name: string;
    venueType: string;
    address: string;
    city: string;
    state: string;
    resolution: string;
    dailyTraffic: string;
    targetAudience: string;
}

export interface AddScreenExtra {
    emails: string;
    description: string;
    country: string;
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
    name: '', venueType: '', address: '', city: '', state: '',
    resolution: '', dailyTraffic: '', targetAudience: '',
};

export const DEFAULT_EXTRA: AddScreenExtra = {
    emails: '', description: '', country: 'Nigeria', weekdaysHours: '',
    weekendsHours: '', ageRange: '', dwellTime: '', screenCount: '',
    orientation: '', malePercentage: '', femalePercentage: '',
    priceDaily: '', priceWeekly: '', priceMonthly: '',
};
