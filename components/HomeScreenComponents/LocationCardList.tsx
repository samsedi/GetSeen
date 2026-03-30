import React, { useState, useMemo, useRef } from 'react'; // 1. Added useRef
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    useColorScheme,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity, // 2. Added TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationCard from '@/components/HomeScreenComponents/LocationCard';
import { Colors, Typography } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';

type Theme = typeof Colors.light;

interface Props {
    data: LocationItem[];
    selectedVenue: string;
}

export default function LocationList({ data, selectedVenue }: Props) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    // 3. Create a reference for the FlatList
    const flatListRef = useRef<FlatList>(null);
    const [showArrow, setShowArrow] = useState(true);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        // Keep the arrow hidden if we've moved past 20px
        if (offsetX > 20 && showArrow) {
            setShowArrow(false);
        } else if (offsetX <= 20 && !showArrow) {
            setShowArrow(true);
        }
    };

    // 4. Function to scroll to the end
    const scrollToEnd = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowArrow(false); // Hide immediately on press
    };

    return (
        <View style={styles.wrapper}>
            <FlatList
                ref={flatListRef} // 5. Attach the ref here
                horizontal
                nestedScrollEnabled={true}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LocationCard item={item} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.locationList}
                extraData={selectedVenue}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📍</Text>
                        <Text style={styles.emptyTitle}>No locations yet</Text>
                        <Text style={styles.emptySubtitle}>
                            No {selectedVenue} spots available right now.
                        </Text>
                    </View>
                }
            />

            {/* 6. Arrow is now a button */}
            {showArrow && data.length > 1 && (
                <TouchableOpacity
                    style={styles.arrowContainer}
                    onPress={scrollToEnd} // 7. Trigger the scroll
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 24 : 20}
                        color={theme.tint}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: Theme) => StyleSheet.create({
    wrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    locationList: {
        paddingLeft: 20,
        paddingRight: 80, // Slightly more padding to ensure the last card is clear of the edge
        paddingBottom: 10,
        marginTop: 10,
        gap: isTablet ? 20 : 16,
    },
    arrowContainer: {
        position: 'absolute',
        right: 15,
        width: isTablet ? 44 : 36,
        height: isTablet ? 44 : 36,
        borderRadius: isTablet ? 22 : 18,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        zIndex: 10, // Ensure it sits above the cards for tapping
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
        width: 300,
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyTitle: {
        ...Typography.h3,
        color: theme.text,
        fontWeight: '700',
        fontSize: isTablet ? 18 : 16,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: isTablet ? 15 : 14,
        color: theme.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});