import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    useColorScheme,
    useWindowDimensions,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    FlatList,
} from 'react-native';
import LocationCard from '@/components/HomeScreenComponents/LocationCard';
import { Colors, Typography } from '@/constants/theme';
import { ScreenResponseDto } from '@/api/screenService'; 

type Theme = typeof Colors.light;

interface Props {
    data: ScreenResponseDto[]; 
    selectedVenue: string;
    numColumns?: number;
    hasMore?: boolean;
    onLoadMore?: () => void;
    canLoadLess?: boolean;
    onLoadLess?: () => void;
    loadingMore?: boolean;
}

function LocationCardList({ 
    data, 
    selectedVenue, 
    numColumns = 3,
    hasMore = false,
    onLoadMore,
    canLoadLess = false,
    onLoadLess,
    loadingMore = false
}: Props) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme as 'light' | 'dark'];

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (hasMore) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [hasMore, pulseAnim]);

    const renderItem = useCallback(({ item }: { item: ScreenResponseDto }) => (
        <LocationCard item={item} numColumns={numColumns} />
    ), [numColumns]);

    const keyExtractor = useCallback((item: ScreenResponseDto) => item.id, []);

    const ListEmptyComponent = useMemo(() => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No locations yet</Text>
            <Text style={styles.emptySubtitle}>
                No {selectedVenue} spots available right now.
            </Text>
        </View>
    ), [selectedVenue, styles]);

    const ListFooterComponent = useMemo(() => {
        if (!hasMore && !canLoadLess) return null;
        if (data.length === 0) return null;

        return (
            <View style={styles.paginationContainer}>
                {canLoadLess ? (
                    <TouchableOpacity 
                        style={[styles.paginationButton, styles.loadLessButton]} 
                        onPress={onLoadLess}
                        disabled={loadingMore}
                    >
                        <Text style={[styles.paginationText, styles.loadLessText]}>Load Less</Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
                
                {hasMore && (
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity 
                            style={[styles.paginationButton, styles.loadMoreButton]} 
                            onPress={onLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.paginationText}>Load More</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        );
    }, [hasMore, canLoadLess, data.length, loadingMore, onLoadMore, onLoadLess, styles, pulseAnim]);

    return (
        <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={numColumns}
            key={`grid-${numColumns}`} // Forces re-mount when column count changes
            // Virtualization — only renders cards visible on screen
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            windowSize={5}
            initialNumToRender={6}
            updateCellsBatchingPeriod={50}
            // Performance — prevent unnecessary re-renders
            getItemLayout={(_, index) => ({
                length: isTablet ? 180 : 155, // approximate card height + margin
                offset: (isTablet ? 180 : 155) * Math.floor(index / numColumns),
                index,
            })}
            // Layout
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
            // Allow FlatList to be scrolled inside the outer ScrollView
            scrollEnabled={false}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
        />
    );
}

export default React.memo(LocationCardList);

const createStyles = (isTablet: boolean, theme: Theme) =>
    StyleSheet.create({
        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 10,
            paddingTop: 10,
        },
        columnWrapper: {
            gap: 10,
            marginBottom: isTablet ? 20 : 16,
        },
        emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40, width: '100%' },
        emptyIcon: { fontSize: 48, marginBottom: 12 },
        emptyTitle: { ...Typography.h3, color: theme.text, fontWeight: '700', fontSize: isTablet ? 18 : 16, marginBottom: 6 },
        emptySubtitle: { fontSize: isTablet ? 15 : 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22 },
        paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 0,
            marginTop: 10,
            marginBottom: 20,
        },
        paginationButton: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
        },
        loadMoreButton: {
            backgroundColor: '#FF2D55',
        },
        loadLessButton: {
            backgroundColor: theme.brandNavy,
        },
        paginationText: {
            color: 'white',
            fontWeight: '600',
            fontSize: isTablet ? 14 : 12,
        },
        loadLessText: {
            color: 'white',
        },
    });