import React, { memo, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    FlatList,
    Pressable,
    ScrollView,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

// ✨ Real backend type and global store
import { ScreenResponseDto } from '@/api/screenService';
import { usePackageSelectionModal, GeneratedPackage } from '@/hooks/usePackageSelectionModal';

interface PackageSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    item: ScreenResponseDto | null;
    theme: any;
    isTablet: boolean;
}

const keyExtractor = (pkg: GeneratedPackage) => pkg.id;

const PackageCard = memo(function PackageCard({
                                                   pkg,
                                                   isSelected,
                                                   onSelect,
                                                   theme,
                                               }: {
    pkg: GeneratedPackage;
    isSelected: boolean;
    onSelect: (id: string) => void;
    theme: any;
}) {
    const handlePress = useCallback(() => onSelect(pkg.id), [onSelect, pkg.id]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[
                styles.durationCard,
                {
                    backgroundColor: isSelected ? '#FF2D5510' : theme.card,
                    borderColor: isSelected ? '#FF2D55' : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                },
            ]}
        >
            <Text style={[styles.durationCardLabel, { color: isSelected ? '#FF2D55' : theme.text }]}>
                {pkg.emoji} {pkg.name}
            </Text>
            <Text style={[styles.durationCardSub, { color: isSelected ? '#FF2D55' : theme.textSecondary }]}>
                ₦{pkg.basePrice.toLocaleString('en-NG')}
            </Text>
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
        ? height * 0.95
        : height * 0.92;

    const sheetWidth = isTablet || isLandscape
        ? Math.min(width, 640)
        : '100%';

    const {
        selectedId,
        setSelectedId,
        startDate,
        showPicker,
        setShowPicker,
        derivedPackages,
        selectedPkg,
        endDate,
        quantity,
        incrementQuantity,
        decrementQuantity,
        handleDateChange,
        handleAddToCart,
        formatDate,
        isAlreadyInCart,
    } = usePackageSelectionModal(item, onClose);

    const renderItem = useCallback(
        ({ item: pkg }: { item: GeneratedPackage }) => (
            <PackageCard
                pkg={pkg}
                isSelected={selectedId === pkg.id}
                onSelect={setSelectedId}
                theme={theme}
            />
        ),
        [selectedId, theme],
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
            supportedOrientations={['portrait', 'landscape']}
        >
            <View style={styles.overlay}>
                {/* Touch outside to close */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                
                <View
                    style={[
                        styles.modalContent,
                        { backgroundColor: theme.background }
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.handle} />

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
                            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                                <Ionicons
                                    name="close"
                                    size={24}
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
                            {/* ─── Ad Duration ─── */}
                            <Text style={[styles.sectionLabel, { color: theme.text }]}>Ad Duration</Text>
                            <View style={styles.durationRow}>
                                {derivedPackages.map((pkg) => (
                                    <PackageCard
                                        key={pkg.id}
                                        pkg={pkg}
                                        isSelected={selectedId === pkg.id}
                                        onSelect={setSelectedId}
                                        theme={theme}
                                    />
                                ))}
                            </View>
                            {selectedPkg && (
                                <Text style={[styles.durationHint, { color: theme.textSecondary }]}>
                                    {selectedPkg.features?.[0] || 'Select an ad duration to continue.'}
                                </Text>
                            )}

                            {/* ─── Extend Duration ─── */}
                            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Extend Duration</Text>
                            <View style={styles.multiplierRow}>
                                <TouchableOpacity
                                    style={[styles.multiplierBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={decrementQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <Ionicons name="remove" size={20} color={quantity <= 1 ? theme.textSecondary + '40' : '#FF2D55'} />
                                </TouchableOpacity>
                                <View style={[styles.multiplierDisplay, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <Text style={[styles.multiplierValue, { color: theme.text }]}>{quantity}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.multiplierBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={incrementQuantity}
                                    disabled={quantity >= 12}
                                >
                                    <Ionicons name="add" size={20} color={quantity >= 12 ? theme.textSecondary + '40' : '#FF2D55'} />
                                </TouchableOpacity>
                            </View>
                            {selectedPkg && (
                                <Text style={[styles.durationHint, { color: theme.textSecondary, marginTop: 8 }]}>
                                    Your campaign will run for {quantity} {quantity === 1 ? (selectedPkg.id === 'daily' ? 'Day' : selectedPkg.id === 'weekly' ? 'Week' : 'Month') : (selectedPkg.id === 'daily' ? 'Days' : selectedPkg.id === 'weekly' ? 'Weeks' : 'Months')} ({selectedPkg.name} x{quantity})
                                </Text>
                            )}

                            {/* ─── Date Pickers ─── */}
                            <View style={styles.dateSection}>
                                <View style={styles.dateColumn}>
                                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign Start Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { backgroundColor: theme.card, borderColor: theme.border }]}
                                        onPress={() => setShowPicker(true)}
                                    >
                                        <Text style={[styles.dateInputText, { color: theme.text }]}>
                                            {formatDate(startDate)}
                                        </Text>
                                        <Ionicons name="calendar" size={18} color="#FF2D55" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateColumn}>
                                    <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign End Date</Text>
                                    <View style={[styles.dateInput, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.7 }]}>
                                        <Text style={[styles.dateInputText, { color: theme.textSecondary }]}>
                                            {formatDate(endDate)}
                                        </Text>
                                        <Ionicons name="calendar" size={18} color={theme.textSecondary} />
                                    </View>
                                </View>
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
                                { height: ctaHeight, marginTop: isLandscape ? 6 : 10, backgroundColor: isAlreadyInCart ? theme.border : theme.tint },
                                isAlreadyInCart && { backgroundColor: theme.border }
                            ]}
                            onPress={isAlreadyInCart ? undefined : handleAddToCart}
                            activeOpacity={0.85}
                            disabled={isAlreadyInCart}
                        >
                            <Ionicons
                                name={isAlreadyInCart ? "checkmark-circle" : "cart-outline"}
                                size={isTablet ? 24 : isLandscape ? 18 : 20}
                                color={isAlreadyInCart ? theme.textSecondary : "white"}
                                style={{ marginRight: 10 }}
                            />
                            <Text style={[styles.mainActionText, { fontSize: ctaFontSize, color: isAlreadyInCart ? theme.textSecondary : "white" }]}>
                                {isAlreadyInCart ? "Already in Cart" : `Add to Cart • ₦${((selectedPkg?.basePrice || 0) * quantity).toLocaleString('en-NG')}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: { fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { marginTop: 2, fontWeight: '500' },
    closeBtn: { padding: 4 },
    scrollContent: { paddingBottom: 8 },
    listPadding: { paddingBottom: 4 },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    durationRow: {
        flexDirection: 'row',
        gap: 10,
    },
    durationCard: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 14,
        alignItems: 'center',
    },
    durationCardLabel: {
        fontSize: 14,
        fontWeight: '800',
    },
    durationCardSub: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    durationHint: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
    },
    multiplierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    multiplierBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiplierDisplay: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiplierValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    dateSection: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    dateColumn: {
        flex: 1,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
    },
    dateInputText: {
        fontSize: 14,
        fontWeight: '600',
    },
    mainActionBtn: {
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainActionText: { color: 'white', fontWeight: '800' },
    iosDoneBtn: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 },
    iosDoneText: { color: '#FF2D55', fontWeight: '700', fontSize: 15 },
});