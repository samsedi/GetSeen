import { useColorScheme } from 'react-native';

const GETSEEN_PINK = '#FF2D55';
const BRAND_NAVY = '#2B4373';
const BRAND_NAVY_LIGHT = '#283593';

export const Colors: {
    light: {
        text: string;
        textSecondary: string;
        textMuted: string;
        background: string;
        tint: string;
        icon: string;
        card: string;
        border: string;
        tabIconDefault: string;
        tabIconSelected: string;
        brandNavy: string;
        brandNavyLight: string;
        brandRed: string;
        cardOverlay: string;
        whiteHeader: string;
        cardGrid: string;
        cardSurface: string;
        shadow: string;
        adRed: string;
        star: string;
        cardSoft: string;
        success: string;
        error: string;
        statusGreen: string;
        statusWarning: string;
        statusRed: string;
        statusBlue: string;
        toggleOff: string;
        inputBg: string;
        inputBorder: string;
    };
    dark: {
        text: string;
        textSecondary: string;
        textMuted: string;
        background: string;
        tint: string;
        icon: string;
        card: string;
        border: string;
        tabIconDefault: string;
        tabIconSelected: string;
        brandNavy: string;
        brandNavyLight: string;
        brandRed: string;
        cardOverlay: string;
        whiteHeader: string;
        cardGrid: string;
        cardSurface: string;
        shadow: string;
        adRed: string;
        star: string;
        cardSoft: string;
        success: string;
        error: string;
        statusGreen: string;
        statusWarning: string;
        statusRed: string;
        statusBlue: string;
        toggleOff: string;
        inputBg: string;
        inputBorder: string;
    };
    [key: string]: any;
} = {
    light: {
        text: '#11181C',
        textSecondary: '#687076',
        textMuted: '#8E8E93',
        background: '#FFFFFF',
        tint: GETSEEN_PINK,
        icon: '#687076',
        card: '#F2F2F2',
        border: '#E1E4E8',
        tabIconDefault: '#687076',
        tabIconSelected: GETSEEN_PINK,
        brandNavy: BRAND_NAVY,
        brandNavyLight: BRAND_NAVY_LIGHT,
        brandRed: '#D11243',
        cardOverlay: 'rgba(0,0,0,0.35)',
        whiteHeader: '#FFFFFF',
        cardGrid: '#E8EFFF',
        cardSurface: '#FFFFFF',
        shadow: '#000000',
        adRed: '#D32F2F',
        star: '#FFD700',
        cardSoft: '#F8F9FA',
        success: '#2E7D32',
        error: '#D32F2F',
        statusGreen: '#34C759',
        statusWarning: '#FF9500',
        statusRed: '#FF3B30',
        statusBlue: '#2196F3',
        toggleOff: '#E5E5EA',
        inputBg: '#FFFFFF',
        inputBorder: '#D1D5DB',
    },
    dark: {
        text: '#FFFFFF',
        textSecondary: '#9BA1A6',
        textMuted: '#8E8E93',
        background: '#000000',
        tint: GETSEEN_PINK,
        icon: '#9BA1A6',
        card: '#121212',
        border: '#262626',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: GETSEEN_PINK,
        brandNavy: BRAND_NAVY,
        brandNavyLight: BRAND_NAVY_LIGHT,
        brandRed: '#D11243',
        cardOverlay: 'rgba(0,0,0,0.45)',
        whiteHeader: '#FFFFFF',
        cardGrid: '#E8EFFF',
        cardSurface: '#FFFFFF',
        shadow: '#000000',
        adRed: '#D32F2F',
        star: '#FFD700',
        cardSoft: '#1A1A1A',
        success: '#4CAF50',
        error: '#F44336',
        statusGreen: '#34C759',
        statusWarning: '#FF9500',
        statusRed: '#FF3B30',
        statusBlue: '#2196F3',
        toggleOff: '#39393D',
        inputBg: '#1A1A1A',
        inputBorder: '#333333',
    },
};

export type AppTheme = typeof Colors.light;

export function useAppTheme(): AppTheme {
    const scheme = useColorScheme();
    const validScheme = (scheme === 'dark') ? 'dark' : 'light';
    return Colors[validScheme];
}

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