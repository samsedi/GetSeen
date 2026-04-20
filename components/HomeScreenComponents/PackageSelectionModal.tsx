import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    Pressable,
    ScrollView,
    Alert,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LocationItem, Package } from '@/constants/mockData';



const formatDate = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};



interface PackageSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    item: LocationItem | null;
    theme: any;
    isTablet: boolean;
}



const keyExtractor = (pkg: Package) => pkg.id;



const PackageCard = memo(function PackageCard({
                                                  pkg,
                                                  isSelected,
                                                  onSelect,
                                                  theme,
                                                  isLandscape,
                                                  isTablet,
                                              }: {
    pkg: Package;
    isSelected: boolean;
    onSelect: (id: string) => void;
    theme: any;
    isLandscape: boolean;
    isTablet: boolean;
}) {
    const handlePress = useCallback(() => onSelect(pkg.id), [onSelect, pkg.id]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[
                styles.packageCard,
                {
                    backgroundColor: theme.background,
                    borderColor: isSelected ? '#FF2D55' : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                    // Landscape: tighter vertical padding to fit more on screen
                    padding: isLandscape ? 10 : 16,
                    marginBottom: isLandscape ? 8 : 12,
                },
            ]}
        >
            <View style={styles.pkgHeader}>
                <Text
                    style={[
                        styles.pkgName,
                        {
                            color: theme.text,
                            fontSize: isTablet ? 16 : isLandscape ? 13 : 15,
                        },
                    ]}
                >
                    {pkg.emoji} {pkg.name}
                </Text>
                <Text
                    style={[
                        styles.pkgPrice,
                        { fontSize: isTablet ? 20 : isLandscape ? 15 : 18 },
                    ]}
                >
                    ₦{pkg.basePrice.toLocaleString('en-NG')}
                    <Text style={styles.perDay}>/day</Text>
                </Text>
            </View>

            {/* Landscape: show features in a horizontal wrap to save vertical space */}
            <View style={isLandscape ? styles.featuresWrap : undefined}>
                {pkg.features?.map((feat, i) => (
                    <View
                        key={i}
                        style={[
                            styles.featureRow,
                            isLandscape && styles.featureRowLandscape,
                            { marginBottom: isLandscape ? 2 : 5 },
                        ]}
                    >
                        <Ionicons name="checkmark-circle" size={isLandscape ? 12 : 14} color="#4CAF50" />
                        <Text
                            style={[
                                styles.featureText,
                                {
                                    color: theme.textSecondary,
                                    fontSize: isLandscape ? 11 : 13,
                                },
                            ]}
                        >
                            {feat}
                        </Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );
});


export default memo(function PackageSelectionModal({
                                                       visible,
                                                       onClose,
                                                       item,
                                                       theme,
                                                       isTablet,
                                                   }: PackageSelectionModalProps) {

    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const sheetMaxHeight = isLandscape
        ? height * 0.95          // almost full height in landscape (height is small)
        : height * 0.92;         // standard bottom sheet in portrait


    const sheetWidth = isTablet || isLandscape
        ? Math.min(width, 640)   // max 640px wide, centred
        : '100%';

    // ── State ───────────────────────────────────────────────────────────────
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const itemId = item?.id;

    useEffect(() => {
        if (item?.packages?.length) {
            setSelectedId(item.packages[0].id);
            setStartDate(new Date());
        }
    }, [itemId]);

    const selectedPkg = useMemo(
        () => item?.packages?.find((p) => p.id === selectedId) ?? null,
        [item, selectedId],
    );

    const endDate = selectedPkg
        ? addDays(startDate, selectedPkg.days)
        : addDays(startDate, 1);


    const handleDateChange = useCallback((_: any, date?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (date) setStartDate(date);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!item || !selectedPkg) return;
        Alert.alert(
            'Added to Cart',
            `${selectedPkg.emoji} ${selectedPkg.name} for ${item.name} has been added to your campaign.\n\n📅 ${formatDate(startDate)} → ${formatDate(endDate)}`,
        );
        onClose();
    }, [selectedId, item, selectedPkg, onClose, startDate, endDate]);

    const renderItem = useCallback(
        ({ item: pkg }: { item: Package }) => (
            <PackageCard
                pkg={pkg}
                isSelected={selectedId === pkg.id}
                onSelect={setSelectedId}
                theme={theme}
                isLandscape={isLandscape}
                isTablet={isTablet}
            />
        ),
        [selectedId, theme, isLandscape, isTablet],
    );

    if (!item) return null;

    // ── Responsive values ────────────────────────────────────────────────────
    const titleFontSize    = isTablet ? 26 : isLandscape ? 18 : 22;
    const subtitleFontSize = isTablet ? 16 : isLandscape ? 12 : 14;
    const sectionFontSize  = isTablet ? 17 : isLandscape ? 13 : 15;
    const dateFontSize     = isTablet ? 14 : isLandscape ? 11 : 13;
    const dateLabelSize    = isTablet ? 12 : isLandscape ? 10 : 11;
    const ctaHeight        = isTablet ? 68 : isLandscape ? 50 : 60;
    const ctaFontSize      = isTablet ? 18 : isLandscape ? 14 : 16;
    const sheetPadding     = isTablet ? 32 : isLandscape ? 16 : 24;
    const sheetPaddingBottom = isTablet ? 48 : isLandscape ? 24 : 40;
    const headerMarginBottom = isLandscape ? 10 : 20;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            // Ensures the modal re-evaluates layout on rotation
            supportedOrientations={['portrait', 'landscape']}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

                {/*
                 * Landscape / tablet: centre the sheet horizontally so it
                 * doesn't stretch the full width of the screen.
                 */}
                <View
                    style={[
                        styles.sheetWrapper,
                        isLandscape || isTablet
                            ? styles.sheetWrapperCentered
                            : styles.sheetWrapperBottom,
                    ]}
                >
                    <View
                        style={[
                            styles.sheet,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                maxHeight: sheetMaxHeight,
                                width: sheetWidth,
                                padding: sheetPadding,
                                paddingBottom: sheetPaddingBottom,
                                // Tablet / landscape: round all corners, not just top
                                borderRadius: isTablet || isLandscape ? 28 : undefined,
                                borderTopLeftRadius: isTablet || isLandscape ? 28 : 35,
                                borderTopRightRadius: isTablet || isLandscape ? 28 : 35,
                            },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.dragHandle} />

                        {/* ── Header ──────────────────────────────────────── */}
                        <View style={[styles.header, { marginBottom: headerMarginBottom }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: theme.text, fontSize: titleFontSize }]}>
                                    Select Package
                                </Text>
                                <Text
                                    style={[styles.subtitle, { color: theme.textSecondary, fontSize: subtitleFontSize }]}
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} hitSlop={10}>
                                <Ionicons
                                    name="close-circle"
                                    size={isTablet ? 38 : isLandscape ? 28 : 32}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* ── Scrollable body ─────────────────────────────── */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/*
                             * Landscape: render package cards in a 2-column grid
                             * so the list doesn't require scrolling just to see all options.
                             * Portrait / tablet: normal single-column FlatList.
                             */}
                            {isLandscape ? (
                                <View style={styles.landscapeGrid}>
                                    {(item.packages || []).map((pkg) => (
                                        <View key={pkg.id} style={styles.landscapeCardWrapper}>
                                            <PackageCard
                                                pkg={pkg}
                                                isSelected={selectedId === pkg.id}
                                                onSelect={setSelectedId}
                                                theme={theme}
                                                isLandscape={isLandscape}
                                                isTablet={isTablet}
                                            />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <FlatList
                                    data={item.packages || []}
                                    keyExtractor={keyExtractor}
                                    renderItem={renderItem}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listPadding}
                                    scrollEnabled={false}
                                    windowSize={3}
                                    maxToRenderPerBatch={5}
                                    initialNumToRender={5}
                                />
                            )}


                            <View
                                style={[
                                    styles.datesCard,
                                    {
                                        backgroundColor: theme.background,
                                        borderColor: theme.border,
                                        padding: isLandscape ? 12 : 16,
                                        marginBottom: isLandscape ? 8 : 12,
                                    },
                                ]}
                            >
                                <Text style={[styles.datesTitle, { color: theme.text, fontSize: sectionFontSize }]}>
                                    📅 Campaign Dates
                                </Text>

                                <View style={styles.datesRow}>
                                    {/* Start date — tappable */}
                                    <View style={styles.dateBlock}>
                                        <Text style={[styles.dateLabel, { color: theme.textSecondary, fontSize: dateLabelSize }]}>
                                            Start Date
                                        </Text>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => setShowPicker(true)}
                                            style={[
                                                styles.dateField,
                                                {
                                                    borderColor: '#FF2D55',
                                                    paddingVertical: isLandscape ? 7 : 10,
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.dateValue, { color: theme.text, fontSize: dateFontSize }]}>
                                                {formatDate(startDate)}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={isLandscape ? 14 : 16} color="#FF2D55" />
                                        </TouchableOpacity>
                                    </View>

                                    <Ionicons
                                        name="arrow-forward"
                                        size={isLandscape ? 14 : 18}
                                        color={theme.textSecondary}
                                        style={styles.arrowIcon}
                                    />

                                    {/* End date — read-only */}
                                    <View style={styles.dateBlock}>
                                        <Text style={[styles.dateLabel, { color: theme.textSecondary, fontSize: dateLabelSize }]}>
                                            End Date
                                        </Text>
                                        <View
                                            style={[
                                                styles.dateField,
                                                {
                                                    borderColor: theme.border,
                                                    paddingVertical: isLandscape ? 7 : 10,
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.dateValue, { color: theme.text, fontSize: dateFontSize }]}>
                                                {formatDate(endDate)}
                                            </Text>
                                            <Ionicons name="lock-closed-outline" size={isLandscape ? 12 : 14} color={theme.textSecondary} />
                                        </View>
                                    </View>
                                </View>

                                {selectedPkg && (
                                    <Text style={[styles.durationHint, { color: theme.textSecondary, fontSize: isLandscape ? 11 : 12 }]}>
                                        Campaign runs for {selectedPkg.days} day{selectedPkg.days > 1 ? 's' : ''}
                                    </Text>
                                )}
                            </View>

                            {/* Native date picker */}
                            {showPicker && (
                                <>
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity
                                            onPress={() => setShowPicker(false)}
                                            style={styles.iosDoneBtn}
                                        >
                                            <Text style={styles.iosDoneText}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                    <DateTimePicker
                                        value={startDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={new Date()}
                                        onChange={handleDateChange}
                                    />
                                </>
                            )}
                        </ScrollView>

                        {/* ── CTA ─────────────────────────────────────────── */}
                        <TouchableOpacity
                            style={[
                                styles.mainActionBtn,
                                { height: ctaHeight, marginTop: isLandscape ? 6 : 10 },
                            ]}
                            onPress={handleAddToCart}
                            activeOpacity={0.85}
                        >
                            <Ionicons
                                name="cart-outline"
                                size={isTablet ? 24 : isLandscape ? 18 : 20}
                                color="white"
                                style={{ marginRight: 10 }}
                            />
                            <Text style={[styles.mainActionText, { fontSize: ctaFontSize }]}>
                                Add to Campaign Cart
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
});



const styles = StyleSheet.create({
    overlay: { flex: 1 },

    // Sheet positioning wrappers
    sheetWrapper: {
        flex: 1,
    },
    sheetWrapperBottom: {
        // Portrait: sheet sticks to the bottom (original behaviour)
        justifyContent: 'flex-end',
    },
    sheetWrapperCentered: {
        // Landscape / tablet: centre vertically and horizontally
        justifyContent: 'center',
        alignItems: 'center',
    },

    sheet: {
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
    },

    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#888',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: { fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { marginTop: 2, fontWeight: '500' },

    scrollContent: { paddingBottom: 8 },

    listPadding: { paddingBottom: 4 },


    packageCard: { borderRadius: 20 },
    pkgHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    pkgName: { fontWeight: '800', flex: 1, marginRight: 8 },
    pkgPrice: { fontWeight: '900', color: '#FF2D55' },
    perDay: { fontSize: 11, fontWeight: '500', color: '#FF2D55' },

    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    featuresWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    featureRowLandscape: {
        marginRight: 8,
    },
    featureText: { fontWeight: '500' },


    landscapeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    landscapeCardWrapper: {

        flex: 1,
        minWidth: '30%',
    },


    mainActionBtn: {
        backgroundColor: '#FF2D55',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainActionText: { color: 'white', fontWeight: '800' },
    datesCard: { borderRadius: 20, borderWidth: 1 },
    datesTitle: { fontWeight: '800', marginBottom: 14 },
    datesRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateBlock: { flex: 1 },
    dateLabel: {
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    dateField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 10,
    },
    dateValue: { fontWeight: '700' },
    arrowIcon: { marginTop: 18 },
    durationHint: { fontWeight: '500', marginTop: 10 },


    iosDoneBtn: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 },
    iosDoneText: { color: '#FF2D55', fontWeight: '700', fontSize: 15 },
});