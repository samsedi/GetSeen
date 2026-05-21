import React, { useMemo, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    Platform,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { BookingCard, Booking } from '@/components/ScreenOwnerComponents/BookingsComponents/BookingCard';

const BOOKINGS: Booking[] = [
    { id: '1', venue: 'Body Love Gym, Ogba, Lagos.', orderNo: 'GS-000206', startDate: 'Feb 26, 2026', endDate: 'Mar 05, 2026', status: 'Completed' },
    { id: '2', venue: 'Body Love Gym, Ogba, Lagos.', orderNo: 'GS-000196', startDate: 'Feb 26, 2026', endDate: 'Feb 28, 2026', status: 'Completed' },
    { id: '3', venue: 'Fitness Central, Ikeja.', orderNo: 'GS-000189', startDate: 'Feb 19, 2026', endDate: 'Feb 21, 2026', status: 'Pending' },
    { id: '4', venue: 'The Palms Mall, Lekki.', orderNo: 'GS-000179', startDate: 'Feb 15, 2026', endDate: 'Feb 22, 2026', status: 'Completed' },
];

export default function BookingsScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    const ownerTint = theme.brandNavy;
    const styles = useMemo(() => createStyles(isTablet, theme, insets), [isTablet, theme, insets]);

    const scrollY = useRef(new Animated.Value(0)).current;

    const renderItem = ({ item, index }: { item: Booking; index: number }) => {
        const ITEM_SIZE = 160; // Approximate height of the card with margins
        
        const scale = scrollY.interpolate({
            inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 2)],
            outputRange: [1, 1, 1, 0.8]
        });

        const opacity = scrollY.interpolate({
            inputRange: [-1, 0, ITEM_SIZE * index, ITEM_SIZE * (index + 1)],
            outputRange: [1, 1, 1, 0]
        });

        return (
            <Animated.View style={{ opacity, transform: [{ scale }] }}>
                <BookingCard 
                    booking={item}
                    onView={() => {}}
                    onAccept={() => {}}
                    onDecline={() => {}}
                />
            </Animated.View>
        );
    };

    return (
        <View style={styles.rootContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bookings</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Ionicons name="search-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle}>
                        <Ionicons name="filter-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.FlatList
                data={BOOKINGS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            />
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any) => StyleSheet.create({
    rootContainer: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42, paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { ...Typography.h2, color: theme.text, fontSize: isTablet ? 28 : 24, fontWeight: '800' },
    headerActions: { flexDirection: 'row', gap: 12 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    listContent: { paddingHorizontal: 20, paddingBottom: insets.bottom + 100, paddingTop: 10 },
});
