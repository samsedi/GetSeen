import { Platform } from 'react-native';



const GETSEEN_PINK = '#FF2D55';
const BRAND_NAVY = '#2B4373';
const BRAND_NAVY_LIGHT = '#283593';

export const Colors = {
    light: {
        text: '#11181C',
        textSecondary: '#687076',
        background: '#FFFFFF',
        tint: GETSEEN_PINK,
        icon: '#687076',
        card: '#F2F2F2',
        border: '#E1E4E8',
        tabIconDefault: '#687076',
        tabIconSelected: GETSEEN_PINK,
        brandNavy: BRAND_NAVY,
        brandNavyLight: BRAND_NAVY_LIGHT,
        cardOverlay: 'rgba(0,0,0,0.35)',
        whiteHeader: '#FFFFFF',

        cardGrid: '#E8EFFF',
        cardSurface: '#FFFFFF',
        shadow: '#000000',
        adRed: '#D32F2F',
        star: '#FFD700',
    },
    dark: {
        text: '#FFFFFF',
        textSecondary: '#9BA1A6',
        background: '#000000',
        tint: GETSEEN_PINK,
        icon: '#9BA1A6',
        card: '#121212',
        border: '#262626',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: GETSEEN_PINK,
        brandNavy: BRAND_NAVY,
        brandNavyLight: BRAND_NAVY_LIGHT,
        cardOverlay: 'rgba(0,0,0,0.45)',
        whiteHeader: '#FFFFFF',
        cardGrid: '#E8EFFF',
        cardSurface: '#FFFFFF',
        shadow: '#000000',
        adRed: '#D32F2F',
        star: '#FFD700',
    },
};

export const Typography = {
    h1: {
        fontSize: 30,
        fontWeight: '900' as const,
        letterSpacing: -1.5,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '800' as const,
        letterSpacing: -0.5,
        lineHeight: 30,
    },
    h3: {
        fontSize: 18,
        fontWeight: '700' as const,
        lineHeight: 24,
    },
    body: {
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 22,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 18,
    },
    label: {
        fontSize: 12,
        fontWeight: '700' as const,
        textTransform: 'uppercase' as const,
    }
};