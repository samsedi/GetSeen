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

type Theme = typeof Colors.light;

const VENUE_CATEGORIES = [
    "For You", "Gyms", "Restaurants", "Co-working", "Lounge", "Offices", "Malls"
];

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
                            <Text style={[
                                styles.labelText,
                                { color: isActive ? theme.whiteHeader : theme.textSecondary } // ✅ was "#FFFFFF"
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

const createStyles = (isTablet: boolean, theme: Theme) => StyleSheet.create({  // ✅ theme: any → Theme
    container: {
        marginVertical: isTablet ? 16 : 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: isTablet ? 12 : 8,
    },
    tab: {
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