import React, { useMemo } from "react";
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions
} from "react-native";
import { Colors, Typography } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';

type Theme = typeof Colors.light;

// ✨ 1. Define and EXPORT the map here so HomeScreen can use the exact same logic
export const CATEGORY_MAP: Record<string, string[]> = {
    'Restaurants': ['restaurant', 'cafe', 'bistro', 'eatery', 'food'],
    'Bars & Lounges': ['bar', 'lounge', 'club', 'pub', 'nightclub', 'chill'],
    'Malls & Marts': ['mall', 'shopping', 'plaza', 'retail', 'center', 'supermarket', 'grocery', 'mart', 'store'],
    'BRT Buses': ['brt', 'bus', 'transit', 'terminal', 'transport'],
    'Laundry': ['laundry', 'laundromat', 'cleaners', 'wash'],
    'Gyms': ['gym', 'fitness', 'workout', 'health club', 'training'],
    'Cinemas': ['cinema', 'movie', 'theater', 'theatre'],
    'Co-working': ['co-working', 'workspace', 'office', 'hub'],
    'Offices': ['office', 'corporate', 'business']
};

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    'For You': 'sparkles',
    'Restaurants': 'restaurant',
    'Bars & Lounges': 'wine',
    'Malls & Marts': 'cart',
    'BRT Buses': 'bus',
    'Laundry': 'shirt',
    'Gyms': 'barbell',
    'Cinemas': 'film',
    'Co-working': 'laptop',
    'Offices': 'business'
};

// ✨ 2. Dynamically generate the tabs based on the map keys!
// This guarantees your UI and your filtering logic are never out of sync.
export const VENUE_CATEGORIES = ["For You", ...Object.keys(CATEGORY_MAP)];

interface Props {
    selected: string;
    setSelected: (venue: string) => void;
}

const VenueNavigation = ({ selected, setSelected }: Props) => {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {VENUE_CATEGORIES.map((item) => {
                    const isActive = selected === item;
                    const iconName = ICON_MAP[item] || 'location';
                    return (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setSelected(item)}
                            activeOpacity={0.7}
                            style={[
                                styles.tab,
                                isActive ? styles.activeTab : styles.inactiveTab
                            ]}
                        >
                            <Ionicons 
                                name={iconName} 
                                size={isTablet ? 16 : 14} 
                                color={isActive ? theme.whiteHeader : theme.textSecondary} 
                            />
                            <Text style={[
                                styles.labelText,
                                { color: isActive ? theme.whiteHeader : theme.textSecondary }
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const createStyles = (isTablet: boolean, theme: Theme) => StyleSheet.create({
    container: {
        marginVertical: isTablet ? 16 : 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: isTablet ? 12 : 8,
    },
    tab: {
        flexDirection: 'row',
        gap: 6,
        borderRadius: 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: isTablet ? 22 : 14,
        paddingVertical: isTablet ? 10 : 8,
    },
    activeTab: {
        backgroundColor: theme.brandNavy,
        borderColor: theme.brandNavy,
    },
    inactiveTab: {
        backgroundColor: theme.card,
        borderColor: theme.border,
    },
    labelText: {
        ...Typography.label,
        fontSize: isTablet ? 14 : 10,
        fontWeight: '600',
        textTransform: 'none',
    }
});

export default VenueNavigation;