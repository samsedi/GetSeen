import { ImageSourcePropType } from 'react-native';

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

export interface InfoDetail {
    label: string;
    value: string;
}

export interface LocationItem {
    id: string;
    name: string;
    price: string;          // display price (cheapest package)
    rating: number;
    category: string;
    images: ImageSourcePropType[];
    address: string;
    distance: string;
    summary: string;
    locationInfo: InfoDetail[];
    mediaInfo: InfoDetail[];
    packages: Package[];
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

// --- 3. MOCK LOCATIONS ---

export const MOCK_LOCATIONS: LocationItem[] = [
    {
        id: 'vgv',
        name: 'Madagascar Restaurant & Grills Abuja',
        price: '15,000',
        rating: 4.9,
        category: 'Restaurants',
        images: [
            require('@/assets/images/resturant.jpg'),
            require('@/assets/images/office.jpg'),
            require('@/assets/images/gym.jpg'),
        ],
        address: "103 Bachita Cl, Garki, Abuja 900103, Federal Capital Territory",
        distance: "23 m",
        summary: "Two screens (1 Standing LED & 1 TV Screen) Madagascar is a hot spot lounge in the city of Abuja. This is a sure place to get your brand seen.",
        locationInfo: [
            { label: "Opening hours weekdays", value: "10am to 12pm" },
            { label: "Estimated monthly visitors", value: "7000" },
            { label: "Average dwell time", value: "2 hours" },
        ],
        mediaInfo: [
            { label: "No of screens", value: "2" },
            { label: "Format", value: "Static Image or Mp4 video" },
            { label: "Estimated daily Ad play", value: "Min 600 times" },
        ],
        packages: [
            {
                id: 'boost',
                name: 'Boost (24 Hours)',
                emoji: '⚡',
                days: 1,
                basePrice: 15000,
                description: 'Quick burst of visibility — ideal for launches and flash promos.',
                features: ['100 plays/day', 'Off-peak hours', '10s Video or Static'],
            },
            {
                id: 'campaign',
                name: 'Campaign (7 Days)',
                emoji: '⭐',
                days: 7,
                basePrice: 13800,
                discountVsBoost: 8,
                description: 'Sustained visibility & stronger results (~₦13,800/day).',
                features: ['300 plays/day', 'Peak time slots', '15s Video'],
            },
            {
                id: 'dominance',
                name: 'Dominance (30 Days)',
                emoji: '👑',
                days: 30,
                basePrice: 12300,
                discountVsBoost: 18,
                description: 'Maximum brand recall — own the screen for the full month (~₦12,300/day).',
                features: ['600+ plays/day', 'Top screen placement', 'Static + Video'],
            },
        ]
    },
    {
        id: '2',
        name: 'Cafe One Yaba, Lagos',
        price: '7,900',
        rating: 4.5,
        category: 'Co-working',
        images: [require('@/assets/images/office.jpg')],
        address: "17 Herbert Macaulay Way, Yaba, Lagos",
        distance: "1.2 km",
        summary: "Premium co-working space powered by Sterling Bank, ideal for tech talents.",
        locationInfo: [{ label: "Opening hours", value: "8am to 8pm" }],
        mediaInfo: [{ label: "Screens", value: "4 Indoor Monitors" }],
        packages: [
            {
                id: 'boost',
                name: 'Boost (24 Hours)',
                emoji: '⚡',
                days: 1,
                basePrice: 7900,
                description: 'Get your brand in front of Nigeria\'s tech community for a day.',
                features: ['50 plays/day', 'Static only'],
            },
            {
                id: 'campaign',
                name: 'Campaign (7 Days)',
                emoji: '⭐',
                days: 7,
                basePrice: 7268,
                discountVsBoost: 8,
                description: 'A week of consistent visibility in a high-focus environment (~₦7,268/day).',
                features: ['150 plays/day', 'Video enabled'],
            },
            {
                id: 'dominance',
                name: 'Dominance (30 Days)',
                emoji: '👑',
                days: 30,
                basePrice: 6478,
                discountVsBoost: 18,
                description: 'Own the co-working audience for the entire month (~₦6,478/day).',
                features: ['300 plays/day', 'Video + Static', 'Priority placement'],
            },
        ]
    },
    {
        id: '3',
        name: 'Fitness Central',
        price: '2,500',
        rating: 4.8,
        category: 'Gyms',
        images: [require('@/assets/images/gym.jpg')],
        address: "Ikeja GRA, Lagos",
        distance: "4.5 km",
        summary: "High-energy fitness hub with prime digital real estate located right in the cardio section.",
        locationInfo: [{ label: "Peak hours", value: "5pm to 9pm" }],
        mediaInfo: [{ label: "Screens", value: "2 Portrait LEDs" }],
        packages: [
            {
                id: 'boost',
                name: 'Boost (24 Hours)',
                emoji: '⚡',
                days: 1,
                basePrice: 2500,
                description: 'A single high-energy day targeting fitness-focused consumers.',
                features: ['10s Static Image', 'Random rotation'],
            },
            {
                id: 'campaign',
                name: 'Campaign (7 Days)',
                emoji: '⭐',
                days: 7,
                basePrice: 2300,
                discountVsBoost: 8,
                description: 'Hit gym-goers during their weekly routine (~₦2,300/day).',
                features: ['Prime time only', '15s Video loop'],
            },
            {
                id: 'dominance',
                name: 'Dominance (30 Days)',
                emoji: '👑',
                days: 30,
                basePrice: 2050,
                discountVsBoost: 18,
                description: 'Become the go-to brand for every workout this month (~₦2,050/day).',
                features: ['Peak + off-peak', 'Static + Video', 'Max frequency'],
            },
        ]
    },
    {
        id: '4',
        name: 'Ikeja City Mall',
        price: '5,000',
        rating: 4.7,
        category: 'Malls',
        images: [require('@/assets/images/supermarket.jpg')],
        address: "176/174 Obafemi Awolowo Way, Ikeja, Lagos",
        distance: "4.2 km",
        summary: "The premier shopping destination in Lagos Mainland. High footfall with multiple digital touchpoints.",
        locationInfo: [{ label: "Estimated monthly footfall", value: "850,000" }],
        mediaInfo: [{ label: "No of screens", value: "12 Digital Pillars" }],
        packages: [
            {
                id: 'boost',
                name: 'Boost (24 Hours)',
                emoji: '⚡',
                days: 1,
                basePrice: 5000,
                description: 'Flash your brand across 12 mall pillars for a full day.',
                features: ['2 Pillar screens', '10s loop', 'Static only'],
            },
            {
                id: 'campaign',
                name: 'Campaign (7 Days)',
                emoji: '⭐',
                days: 7,
                basePrice: 4600,
                discountVsBoost: 8,
                description: 'Capture weekend shoppers and weekday foot traffic (~₦4,600/day).',
                features: ['Center stage screens', 'Full video support'],
            },
            {
                id: 'dominance',
                name: 'Dominance (30 Days)',
                emoji: '👑',
                days: 30,
                basePrice: 4100,
                discountVsBoost: 18,
                description: 'Complete mall takeover — all 12 pillars, maximum frequency (~₦4,100/day).',
                features: ['All 12 pillars', 'Maximum frequency', 'Static + Video'],
            },
        ]
    }
];

// --- 4. SAVED QR DATA ---

export const MOCK_SAVED_QRS: SavedQR[] = [
    {
        id: '1',
        name: 'Cafe One Promotion',
        url: 'https://cafeone.com/promo',
        createdAt: '01 Apr 2026 · 10:24 AM',
        scans: 124
    },
    {
        id: '2',
        name: 'Easter Special',
        url: 'https://brand.ng/easter',
        createdAt: '28 Mar 2026 · 02:15 PM',
        scans: 89
    }
];