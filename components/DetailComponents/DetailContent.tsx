import React, { useState, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppTheme } from '@/constants/theme';
import { useReservationStore } from '@/store/useReservationStore';
import { LocationItem } from '@/constants/mockData';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
    isTablet: boolean;
    data: LocationItem;
}

/**
 * Wrapped in React.memo — this is the heaviest component on the detail
 * screen. Without memo, every Zustand update (e.g. isModalVisible toggle)
 * re-renders the entire accordion tree, causing the freeze.
 */
function DetailContent({ isTablet, data }: Props) {
    const theme = useAppTheme();

    /**
     * FIX: Subscribe only to the action selector.
     * Actions are always the same reference in Zustand, so this subscription
     * will NEVER trigger a re-render of DetailContent — even when
     * isModalVisible or activeLocation change in the store.
     */
    const openReservation = useReservationStore((state) => state.openReservation);

    const [showLocation, setShowLocation] = useState(true);
    const [showMedia, setShowMedia] = useState(true);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    const toggleSection = useCallback((type: 'location' | 'media') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (type === 'location') setShowLocation((prev) => !prev);
        else setShowMedia((prev) => !prev);
    }, []);

    /**
     * FIX: Stable callback so the TouchableOpacity child never re-renders
     * due to a changed onPress reference.
     */
    const handleReserve = useCallback(() => {
        openReservation(data);
    }, [openReservation, data]);

    const handleToggleLocation = useCallback(() => toggleSection('location'), [toggleSection]);
    const handleToggleMedia = useCallback(() => toggleSection('media'), [toggleSection]);

    if (!data) return null;

    return (
        <View style={styles.container}>
            {/* 1. TITLE ROW */}
            <View style={styles.titleRow}>
                <Text style={styles.mainTitle} numberOfLines={2}>
                    {data.name || 'Unknown Location'}
                </Text>

                <TouchableOpacity
                    style={styles.miniReserveBtn}
                    activeOpacity={0.8}
                    onPress={handleReserve}
                >
                    <Text style={styles.reserveText}>RESERVE NOW</Text>
                </TouchableOpacity>
            </View>

            {/* 2. PRICE SECTION */}
            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                    <Text style={{ color: '#FF2D55', fontWeight: '900' }}>₦</Text>
                    {data.price || '0.00'}
                    <Text style={styles.priceUnit}>/day</Text>
                </Text>
            </View>

            {/* 3. LOCATION ROW */}
            <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={isTablet ? 14 : 12} color="#FF2D55" />
                <Text style={styles.locationText} numberOfLines={1}>
                    {data.address} {data.distance ? `· ${data.distance}` : ''}
                </Text>
            </View>

            {/* 4. SUMMARY */}
            <View style={styles.summarySection}>
                <Text style={styles.summaryText}>{data.summary}</Text>
            </View>

            <View style={styles.divider} />

            {/* 5. LOCATION INFO ACCORDION */}
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={handleToggleLocation}
            >
                <Text style={styles.sectionTitle}>Location Information</Text>
                <Ionicons
                    name={showLocation ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#FF2D55"
                />
            </TouchableOpacity>

            {showLocation && (
                <View style={styles.infoBox}>
                    {data.locationInfo?.map((info, index) => (
                        <Text key={`loc-${index}`} style={styles.infoText}>
                            • <Text style={{ fontWeight: 'bold' }}>{info.label}:</Text>{' '}
                            {info.value}
                        </Text>
                    ))}
                </View>
            )}

            <View style={styles.itemSpacer} />

            {/* 6. SCREEN & MEDIA INFO ACCORDION */}
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={handleToggleMedia}
            >
                <Text style={styles.sectionTitle}>Screen & Media Information</Text>
                <Ionicons
                    name={showMedia ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#FF2D55"
                />
            </TouchableOpacity>

            {showMedia && (
                <View style={styles.infoBox}>
                    {data.mediaInfo?.map((info, index) => (
                        <Text key={`media-${index}`} style={styles.infoText}>
                            • <Text style={{ fontWeight: '700' }}>{info.label}:</Text>{' '}
                            {info.value}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}

export default React.memo(DetailContent);

const createStyles = (isTablet: boolean, theme: AppTheme) =>
    StyleSheet.create({
        container: { paddingHorizontal: 20, marginTop: 25, paddingBottom: 40 },
        titleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        mainTitle: {
            flex: 1,
            color: theme.text,
            fontSize: isTablet ? 24 : 20,
            fontWeight: '800',
            marginRight: 10,
            lineHeight: 28,
        },
        locationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            gap: 4,
        },
        locationText: {
            color: theme.textSecondary,
            fontSize: isTablet ? 13 : 11,
            fontWeight: '500',
        },
        priceContainer: {
            marginTop: 12,
            backgroundColor: theme.card,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        priceText: {
            color: theme.text,
            fontSize: isTablet ? 18 : 16,
            fontWeight: '800',
        },
        priceUnit: {
            fontSize: isTablet ? 12 : 10,
            color: theme.textSecondary,
            fontWeight: '500',
        },
        summarySection: { marginTop: 15, marginBottom: 5 },
        summaryText: {
            color: theme.textSecondary,
            fontSize: isTablet ? 15 : 13,
            lineHeight: 20,
            fontWeight: '400',
        },
        miniReserveBtn: {
            backgroundColor: '#FF2D55',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 25,
            elevation: 4,
        },
        reserveText: {
            color: 'white',
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 0.5,
        },
        divider: {
            height: 1,
            backgroundColor: theme.border,
            marginVertical: 15,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
        },
        sectionTitle: {
            color: '#FF2D55',
            fontSize: 15,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        infoBox: {
            backgroundColor: theme.card,
            padding: 18,
            borderRadius: 14,
            marginTop: 5,
            borderWidth: 1,
            borderColor: theme.border,
        },
        infoText: {
            color: theme.text,
            fontSize: 13,
            marginBottom: 8,
            lineHeight: 20,
        },
        itemSpacer: { height: 15 },
    });
