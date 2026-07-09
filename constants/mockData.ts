// --- 1. INTERFACES ---

export interface Package {
    id: string;
    name: string;          // e.g. "Boost (24 Hours)"
    emoji: string;         // e.g. "⚡"
    days: number;          // base duration in days
    basePrice: number;     // price for 1 unit (parsed, no commas)
    discountVsBoost?: number; // e.g. 8 means "-8% vs Boost"
    description: string;   // shown below selected tab
    features: string[];
}

export interface RoleData {
    id: 'advertiser' | 'owner';
    title: string;
    tag: string;
    description: string;
    icon: any;
    buttonColor: string[];
    themeColor: string;
}

export interface SavedQR {
    id: string;
    name: string;
    url: string;
    createdAt: string;
    scans?: number;
}

// --- 2. ROLE DATA ---

export const ROLES: RoleData[] = [
    {
        id: 'advertiser',
        tag: 'ADVERTISER',
        title: 'Advertiser',
        description: 'Launch campaigns on screens across the city and scale your visibility instantly.',
        icon: 'megaphone',
        buttonColor: ['#D11243', '#FF5B7F'],
        themeColor: '#FFF0F3',
    },
    {
        id: 'owner',
        tag: 'SCREEN OWNER',
        title: 'Screen Owner',
        description: 'Monetize your venue\'s screens by hosting ads from premium brands.',
        icon: 'storefront',
        buttonColor: ['#2B4373'],
        themeColor: '#EDF2F7',
    }
];