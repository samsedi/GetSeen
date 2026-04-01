import { ImageSourcePropType } from 'react-native';


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
    price: string;
    rating: number;
    category: string;
    images: ImageSourcePropType[];
    address: string;
    distance: string;
    summary: string;
    locationInfo: InfoDetail[];
    mediaInfo: InfoDetail[];
}

export interface SavedQR {
    id: string;
    name: string;
    url: string;
    createdAt: string;
    scans?: number; // Optional field for the "Report" feature
}
// --- 1. THE ROLE DATA (For your ChooseRoleScreen) ---

export const ROLES: RoleData[] = [
    {
        id: 'advertiser',
        tag: 'ADVERTISER',
        title: 'Advertiser',
        description: 'Launch campaigns on screens across the city and scale your visibility instantly.',
        icon: 'megaphone',
        buttonColor: ['#D11243', '#FF5B7F'], // Pink/Red Gradient
        themeColor: '#FFF0F3', // Very light pink
    },
    {
        id: 'owner',
        tag: 'SCREEN OWNER',
        title: 'Screen Owner',
        description: 'Monetize your venue’s screens by hosting ads from premium brands.',
        icon: 'storefront',
        buttonColor: [ '#2B4373'], // Dark Slate Gradient
        themeColor: '#EDF2F7', // Very light blue/gray
    }
];


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
        summary: "Two screens (1 Standing LED & 1 TV Screen) Madagascar is a hot spot lounge in the city of Abuja with guests from all walks of life. It’s buzzing daily and overly so on weekends. This is a sure place to get your brand seen.",
        locationInfo: [
            { label: "Opening hours weekdays", value: "10am to 12pm" },
            { label: "Opening hours weekends", value: "10am to 3am" },
            { label: "Estimated monthly visitors", value: "7000" },
            { label: "Age range", value: "25 to 60" },
            { label: "Average dwell time", value: "2 hours" },
        ],
        mediaInfo: [
            { label: "No of screens", value: "2" },
            { label: "Dimensions", value: "1920/1080" },
            { label: "Format", value: "Static Image or Mp4 video (15 Sec max)" },
            { label: "Estimated daily Ad play", value: "Min 600 times" },
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
        summary: "Premium co-working space powered by Sterling Bank, ideal for tech talents and innovators in the heart of Yaba.",
        locationInfo: [
            { label: "Opening hours", value: "8am to 8pm" },
            { label: "Monthly traffic", value: "2500" },
        ],
        mediaInfo: [
            { label: "Screens", value: "4 Indoor Monitors" },
            { label: "Format", value: "JPEG/PNG" },
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
        mediaInfo: [{ label: "Screens", value: "2 Portrait LEDs" }]
    },
    {
        id: '4',
        name: 'Ikeja City Mall',
        price: '5,000',
        rating: 4.7,
        category: 'Malls',
        images: [
            require('@/assets/images/supermarket.jpg'),
            require('@/assets/images/gym.jpg'),
            require('@/assets/images/resturant.jpg'),
        ],
        address: "176/174 Obafemi Awolowo Way, Ikeja, Lagos",
        distance: "4.2 km",
        summary: "The premier shopping destination in Lagos Mainland. High footfall with multiple digital touchpoints at every entrance and exit.",
        locationInfo: [
            { label: "Opening hours", value: "9am to 9pm daily" },
            { label: "Estimated monthly footfall", value: "850,000" },
            { label: "Target audience", value: "Shoppers, Families, Gen Z" },
            { label: "Peak times", value: "Weekends & Public Holidays" },
        ],
        mediaInfo: [
            { label: "No of screens", value: "12 Digital Pillars" },
            { label: "Dimensions", value: "1080x1920 (Portrait)" },
            { label: "Content format", value: "Video (10 Sec) or Static Image" },
            { label: "Audio", value: "No" },
        ]
    },
    {
        id: '5',
        name: 'Lounge 42',
        price: '4,200',
        rating: 4.3,
        category: 'Lounge',
        images: [
            require('@/assets/images/office.jpg'),
            require('@/assets/images/resturant.jpg'),
        ],
        address: "42 Gana Street, Maitama, Abuja",
        distance: "1.5 km",
        summary: "An exclusive rooftop lounge in Maitama. Known for its luxury ambiance and a high concentration of high-net-worth individuals.",
        locationInfo: [
            { label: "Opening hours", value: "4pm to 2am" },
            { label: "Average dwell time", value: "3.5 hours" },
            { label: "Gender demographic", value: "55% Male 45% Female" },
        ],
        mediaInfo: [
            { label: "No of screens", value: "4 TV Screens" },
            { label: "Dimensions", value: "1920/1080" },
            { label: "Placement", value: "Behind the Bar & VIP Section" },
        ]
    },
    {
        id: '6',
        name: 'HQ Offices VI',
        price: '6,000',
        rating: 4.6,
        category: 'Offices',
        images: [
            require('@/assets/images/office.jpg'),
            require('@/assets/images/office.jpg'), // Added duplicate as placeholder for carousel
        ],
        address: "Plot 12, Adetokunbo Ademola St, Victoria Island, Lagos",
        distance: "8.9 km",
        summary: "A Grade-A corporate office building. Get your brand seen by top executives and professionals in the heart of Nigeria's financial hub.",
        locationInfo: [
            { label: "Active hours", value: "8am to 6pm (Mon-Fri)" },
            { label: "Audience", value: "Professionals & Executives" },
            { label: "Monthly traffic", value: "15,000" },
        ],
        mediaInfo: [
            { label: "No of screens", value: "2 Lift Lobby LEDs" },
            { label: "Dimensions", value: "1280x720" },
            { label: "Format", value: "Short looping Mp4 (5 Sec max)" },
        ]
    },

];
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