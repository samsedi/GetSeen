import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LocationItem } from '@/constants/mockData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DetailContent({ isTablet, data }: { isTablet: boolean, data: LocationItem }) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [showLocation, setShowLocation] = useState(true);
    const [showMedia, setShowMedia] = useState(true);

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    if (!data) return null;

    return (
        <View style={styles.container}>
            {/* 1. TITLE ROW */}
            <View style={styles.titleRow}>
                <Text style={styles.mainTitle} numberOfLines={2}>
                    {data.name || "Unknown Location"}
                </Text>
                <TouchableOpacity style={styles.miniReserveBtn} activeOpacity={0.8}>
                    <Text style={styles.reserveText}>RESERVE NOW</Text>
                </TouchableOpacity>
            </View>

            {/* 2. PRICE SECTION - NEW */}
            <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                    <Text style={{ color: '#FF2D55', fontWeight: '900' }}>₦</Text>
                    {data.price || "0.00"}
                    <Text style={styles.priceUnit}>/day</Text>
                </Text>
            </View>

            {/* 3. LOCATION ROW */}
            <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={isTablet ? 14 : 10} color="#FF2D55" />
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
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowLocation(!showLocation);
                }}
            >
                <Text style={styles.sectionTitle}>Location Information</Text>
                <Ionicons name={showLocation ? "chevron-up" : "chevron-down"} size={20} color="#FF2D55" />
            </TouchableOpacity>

            {showLocation && (
                <View style={styles.infoBox}>
                    {data.locationInfo?.map((info, index) => (
                        <Text key={`loc-${index}`} style={styles.infoText}>
                            • <Text style={{ fontWeight: 'bold' }}>{info.label}:</Text> {info.value}
                        </Text>
                    ))}
                </View>
            )}

            <View style={styles.itemSpacer} />

            {/* 6. SCREEN & MEDIA INFO ACCORDION */}
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowMedia(!showMedia);
                }}
            >
                <Text style={styles.sectionTitle}>Screen & Media Information</Text>
                <Ionicons name={showMedia ? "chevron-up" : "chevron-down"} size={20} color="#FF2D55" />
            </TouchableOpacity>

            {showMedia && (
                <View style={styles.infoBox}>
                    {data.mediaInfo?.map((info, index) => (
                        <Text key={`media-${index}`} style={styles.infoText}>
                            • <Text style={{fontWeight: '700'}}>{info.label}:</Text> {info.value}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 25,
        paddingBottom: 40
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    mainTitle: {
        flex: 1,
        color: theme.text,
        fontSize: isTablet ? 24 : 20,
        fontWeight: '800',
        marginRight: 10,
        lineHeight: 28
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4
    },
    locationText: {
        color: theme.textSecondary,
        fontSize: isTablet ? 13 : 11,
        fontWeight: '500'
    },
    // NEW PRICE STYLES
    priceContainer: {
        marginTop: 12,
        backgroundColor: theme.background === '#FFFFFF' ? '#F9F9F9' : '#1A1A1A',
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
    summarySection: {
        marginTop: 15,
        marginBottom: 5
    },
    summaryText: {
        color: theme.textSecondary,
        fontSize: isTablet ? 15 : 13,
        lineHeight: 20,
        fontWeight: '400'
    },
    miniReserveBtn: {
        backgroundColor: '#FF2D55',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#FF2D55',
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    reserveText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 15
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },
    sectionTitle: {
        color: '#FF2D55',
        fontSize: 15,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    infoBox: {
        backgroundColor: theme.card,
        padding: 18,
        borderRadius: 14,
        marginTop: 5,
        borderWidth: 1,
        borderColor: theme.border
    },
    infoText: {
        color: theme.text,
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 20
    },
    itemSpacer: {
        height: 15
    }
});