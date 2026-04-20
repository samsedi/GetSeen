import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    useColorScheme,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
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

/**
 * Stable renderItem defined outside the component so its reference never
 * changes. This prevents FlatList from re-rendering all visible cards on
 * every parent render.
 */
const renderItem = ({ item }: { item: LocationItem }) => (
    <LocationCard item={item} />
);

/**
 * Stable keyExtractor outside the component for the same reason.
 */
const keyExtractor = (item: LocationItem) => item.id;

function LocationCardList({ data, selectedVenue }: Props) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme as 'light' | 'dark'];

    const flatListRef = useRef<FlatList>(null);
    const [showArrow, setShowArrow] = useState(true);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            if (offsetX > 20 && showArrow) {
                setShowArrow(false);
            } else if (offsetX <= 20 && !showArrow) {
                setShowArrow(true);
            }
        },
        [showArrow],
    );

    const scrollToEnd = useCallback(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowArrow(false);
    }, []);

    const emptyComponent = useMemo(
        () => (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📍</Text>
                <Text style={styles.emptyTitle}>No locations yet</Text>
                <Text style={styles.emptySubtitle}>
                    No {selectedVenue} spots available right now.
                </Text>
            </View>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [selectedVenue, styles],
    );

    return (
        <View style={styles.wrapper}>
            <FlatList
                ref={flatListRef}
                horizontal
                nestedScrollEnabled={true}
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.locationList}
                extraData={selectedVenue}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                /**
                 * FIX: windowSize + maxToRenderPerBatch tuned for horizontal
                 * lists. Reduces the number of off-screen items kept in memory,
                 * which directly lowers JS-thread pressure when the modal opens.
                 */
                windowSize={5}
                maxToRenderPerBatch={4}
                initialNumToRender={4}
                ListEmptyComponent={emptyComponent}
            />

            {showArrow && data.length > 1 && (
                <TouchableOpacity
                    style={styles.arrowContainer}
                    onPress={scrollToEnd}
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

export default React.memo(LocationCardList);

const createStyles = (isTablet: boolean, theme: Theme) =>
    StyleSheet.create({
        wrapper: { position: 'relative', justifyContent: 'center' },
        locationList: {
            paddingLeft: 20,
            paddingRight: 80,
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
            zIndex: 10,
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
