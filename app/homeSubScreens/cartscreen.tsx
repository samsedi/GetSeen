import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks
import { CartItemResponse } from '@/api/cartService';
import TermsModal from '@/components/AuthComponents/TermsModal';
import { AD_GUIDELINES_DATA } from '@/constants/TermsData';
import { useCartScreen } from '@/hooks/useCartScreen';
import { useCheckout } from '@/hooks/useCheckout';
import { useAlertStore } from '@/store/useAlertStore';
import { useCartStore } from '@/store/useCartStore';

// Modals
import MediaSelectionModal from '@/components/CartComponents/MediaSelectionModal';
import PreviousMediaModal from '@/components/CartComponents/PreviousMediaModal';

// --- THEME DEFINITIONS ---
const Colors = {
    light: {
        background: '#F2F2F7',
        text: '#000000',
        textSecondary: '#6C6C70',
        glassBorder: 'rgba(255, 255, 255, 0.6)',
        border: '#E1E4E8',
        cardSurface: '#FFFFFF',
        tint: '#FF2D55',
        blurTint: 'light' as const,
        dangerBg: 'rgba(255, 59, 48, 0.1)',
        dangerBorder: 'rgba(255, 59, 48, 0.2)',
        icon: '#000000',
        inputBg: 'rgba(255,255,255,0.7)',
    },
    dark: {
        background: '#000000',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
        border: '#262626',
        cardSurface: '#121212',
        tint: '#FF2D55',
        blurTint: 'dark' as const,
        dangerBg: 'rgba(255, 59, 48, 0.15)',
        dangerBorder: 'rgba(255, 59, 48, 0.3)',
        icon: '#FFFFFF',
        inputBg: 'rgba(255,255,255,0.1)',
    }
};

function getDurationLabel(item: CartItemResponse): string {
    const durationName = item.duration.charAt(0).toUpperCase() + item.duration.slice(1);
    return `${durationName} ×${item.durationMultiplier || 1}`;
}

function formatDateShort(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function CartScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
    const theme = Colors[colorScheme];
    const styles = useMemo(() => createStyles(theme, isTablet), [theme, isTablet]);
    const [isGuidelinesVisible, setIsGuidelinesVisible] = useState(false);

    const {
        cartItems,
        totalAmount,
        isLoading,
        uploadProgresses,
        handleRemoveItem,
        handleClearCart,
        handleUploadMedia,
        handleCancelUpload,
        couponCode,
        setCouponCode,
        handleApplyCoupon,
        additionalInstructions,
        setAdditionalInstructions,
        hasAnyPendingUpload,
        isMediaSelectionVisible,
        setIsMediaSelectionVisible,
        isPreviousMediaVisible,
        setIsPreviousMediaVisible,
        selectedCartItem,
        handleDeviceUpload,
        handleAttachExistingMedia,
    } = useCartScreen();

    const {
        agreed,
        setAgreed,
        isInitializing,
        startCheckout
    } = useCheckout();

    // ── EMPTY STATE ──
    if (cartItems.length === 0 && !isLoading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                <View style={styles.mainHeader}>
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={theme.icon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Campaign Cart</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color={theme.textSecondary} />
                    <Text style={styles.emptyText}>Your cart is empty.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            {/* ── HEADER ── */}
            <View style={styles.mainHeader}>
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.icon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Campaign Cart</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="add" size={28} color={theme.tint} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {/* ── CART ITEMS (GLASS CARDS) ── */}
                {cartItems.map((item: CartItemResponse) => {
                    const isMediaUploaded = item.hasMedia || !!item.mediaUrl;
                    const durationLabel = getDurationLabel(item);

                    return (
                        <View key={item.id} style={styles.cardContainer}>
                            <BlurView intensity={colorScheme === 'dark' ? 30 : 60} tint={theme.blurTint} style={[styles.cardGlass, { padding: 14 }]}>

                                {/* ── Top Row: Image & Details ── */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Image
                                        source={{ uri: item.screenImageUrl ?? 'https://placehold.jp/24/f0f0f0/cccccc/300x200.png?text=No+Image' }}
                                        style={styles.thumbnailImage}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text style={styles.titleText} numberOfLines={2}>
                                                {item.screenName}
                                            </Text>
                                            <TouchableOpacity hitSlop={10} onPress={() => handleRemoveItem(item.id)}>
                                                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.subtitleText} numberOfLines={1}>
                                            {durationLabel}
                                        </Text>
                                        <Text style={styles.priceText}>
                                            ₦{Number(item.totalPrice).toLocaleString('en-NG')}
                                        </Text>
                                    </View>
                                </View>

                                {/* ── Bottom Row: Dates & Media ── */}
                                <View style={styles.compactDivider} />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={styles.compactDateText}>
                                            {formatDateShort(item.startDate)} - {formatDateShort(item.endDate)}
                                        </Text>

                                        {/* Status Badge */}
                                        <View style={[styles.compactStatusBadge, isMediaUploaded ? styles.statusBadgeSuccess : styles.statusBadgePending, { alignSelf: 'flex-start', marginTop: 4 }]}>
                                            <View style={[styles.statusDot, { backgroundColor: isMediaUploaded ? '#4CAF50' : '#F57F17' }]} />
                                            <Text style={[styles.statusBadgeText, { color: isMediaUploaded ? '#2E7D32' : '#F57F17' }]}>
                                                {isMediaUploaded ? 'Media Uploaded' : 'Media Pending'}
                                            </Text>
                                        </View>
                                    </View>

                                    {isMediaUploaded ? (
                                        <TouchableOpacity
                                            style={[styles.compactPreviewContainer, { backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border }]}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                if (uploadProgresses[item.id] !== undefined) {
                                                    void handleCancelUpload(item.id);
                                                } else {
                                                    void handleUploadMedia(item);
                                                }
                                            }}
                                            onLongPress={() => {
                                                useAlertStore.getState().showAlert('Media URL', item.mediaUrl || 'No URL');
                                            }}
                                        >
                                            {/* Fallback icon behind the image in case of video or failed load */}
                                            <View style={StyleSheet.absoluteFill}>
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Ionicons name="document-text-outline" size={20} color={theme.textSecondary} />
                                                </View>
                                            </View>
                                            <Image source={{ uri: item.mediaUrl! }} style={styles.compactPreviewImage} contentFit="cover" />

                                            {uploadProgresses[item.id] !== undefined ? (
                                                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}>
                                                    <ActivityIndicator size="small" color="#FFF" />
                                                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>Uploading</Text>
                                                </View>
                                            ) : (
                                                <View style={[styles.compactRemoveBadge, { backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12 }]}>
                                                    <Ionicons name="pencil" size={14} color="#FFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.compactUploadBtn}
                                            activeOpacity={0.6}
                                            onPress={() => {
                                                if (uploadProgresses[item.id] !== undefined) {
                                                    void handleCancelUpload(item.id);
                                                } else {
                                                    void handleUploadMedia(item);
                                                }
                                            }}
                                        >
                                            {uploadProgresses[item.id] !== undefined ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <ActivityIndicator color={theme.tint} size="small" />
                                                    <Ionicons name="close" size={14} color={theme.tint} />
                                                </View>
                                            ) : (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Ionicons name="cloud-upload-outline" size={16} color={theme.tint} />
                                                    <Text style={{ color: theme.tint, fontSize: 11, fontWeight: '700' }}>Upload</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </BlurView>
                        </View>
                    );
                })}

                {/* ── ADDITIONAL INFO SECTIONS (GLASS PANELS) ── */}
                <View style={styles.cardContainer}>
                    <BlurView intensity={colorScheme === 'dark' ? 30 : 60} tint={theme.blurTint} style={styles.panelGlass}>

                        {/* Guidelines */}
                        <TouchableOpacity
                            style={styles.guidelinesLink}
                            onPress={() => setIsGuidelinesVisible(true)}
                        >
                            <Ionicons name="document-text-outline" size={16} color={theme.tint} />
                            <Text style={styles.guidelinesLinkText}>View Advertising Guidelines</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.7} onPress={() => setAgreed(!agreed)}>
                            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={24} color={agreed ? theme.tint : theme.textSecondary} />
                            <Text style={styles.checkboxText}>
                                I&apos;ve read, understood, and agree to GetSeen&apos;s advertising guidelines.
                            </Text>
                        </TouchableOpacity>

                        {/* Price Breakdown */}
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Price Breakdown</Text>
                        {cartItems.map((item: CartItemResponse) => (
                            <View key={`price-${item.id}`} style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel} numberOfLines={1}>
                                    {item.screenName} ({getDurationLabel(item)})
                                </Text>
                                <Text style={styles.breakdownValue}>₦{Number(item.totalPrice).toLocaleString('en-NG')}</Text>
                            </View>
                        ))}

                        {/* Coupon Code */}
                        <View style={styles.couponRow}>
                            <TextInput
                                style={styles.couponInput}
                                placeholder="Enter coupon code"
                                placeholderTextColor={theme.textSecondary}
                                value={couponCode}
                                onChangeText={setCouponCode}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity style={styles.couponApplyBtn} onPress={handleApplyCoupon}>
                                <Text style={styles.couponApplyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Instructions */}
                        <Text style={styles.sectionTitle}>Additional Instructions</Text>
                        <TextInput
                            style={styles.instructionsInput}
                            placeholder="Optional special instructions for your campaign..."
                            placeholderTextColor={theme.textSecondary}
                            value={additionalInstructions}
                            onChangeText={setAdditionalInstructions}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </BlurView>
                </View>

                {/* Clear All */}
                <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearCart}>
                    <Text style={styles.clearAllText}>Clear Cart</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* ── FROSTED GLASS BOTTOM SUMMARY & CTAs ── */}
            <View style={styles.summaryWrapper}>
                <BlurView intensity={colorScheme === 'dark' ? 50 : 80} tint={theme.blurTint} style={styles.summaryGlass}>

                    {hasAnyPendingUpload && (
                        <View style={styles.warningBanner}>
                            <Ionicons name="warning" size={16} color="#F57F17" />
                            <Text style={styles.warningText}>Please upload media for all screens before checkout.</Text>
                        </View>
                    )}

                    {/* Display Subtotal & Discount if available */}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₦{Number(useCartStore.getState().subtotal || totalAmount).toLocaleString('en-NG')}</Text>
                    </View>

                    {useCartStore.getState().discount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Discount ({useCartStore.getState().coupon?.code})</Text>
                            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>-₦{Number(useCartStore.getState().discount).toLocaleString('en-NG')}</Text>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabelTotal}>Total Amount</Text>
                        <Text style={styles.summaryValueTotal}>₦{Number(totalAmount).toLocaleString('en-NG')}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.ctaSecondary, isInitializing && styles.ctaDisabled]}
                        activeOpacity={0.8}
                        disabled={isInitializing}
                        onPress={() => {
                            if (!agreed) {
                                useAlertStore.getState().showAlert('Terms & Guidelines', 'You must agree to the upload guidelines before checking out.');
                                return;
                            }
                            startCheckout(useCartStore.getState().coupon?.code, additionalInstructions);
                        }}
                    >
                        <Text style={styles.ctaSecondaryText}>Skip Amplify & Make Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkoutButton, isInitializing && styles.ctaDisabled]}
                        activeOpacity={0.8}
                        disabled={isInitializing}
                        onPress={() => {
                            if (!agreed) {
                                useAlertStore.getState().showAlert('Terms & Guidelines', 'You must agree to the upload guidelines before checking out.');
                                return;
                            }
                            router.push('/homeSubScreens/cartAmplifySetup');
                        }}
                    >
                        <Text style={styles.checkoutButtonText}>
                            Continue to Amplify
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </TouchableOpacity>

                </BlurView>
            </View>

            {/* Removed Paystack component as we use expo-web-browser */}

            <TermsModal 
                visible={isGuidelinesVisible} 
                onClose={() => setIsGuidelinesVisible(false)} 
                brandColor={theme.tint} 
                title="Advertising Guidelines"
                data={AD_GUIDELINES_DATA}
            />

            <MediaSelectionModal
                visible={isMediaSelectionVisible}
                onClose={() => setIsMediaSelectionVisible(false)}
                onSelectDeviceUpload={handleDeviceUpload}
                onSelectPreviousMedia={() => setIsPreviousMediaVisible(true)}
                cartItem={selectedCartItem}
            />

            <PreviousMediaModal
                visible={isPreviousMediaVisible}
                onClose={() => setIsPreviousMediaVisible(false)}
                onSelectMedia={handleAttachExistingMedia}
            />
        </SafeAreaView>
    );
}

// ── DYNAMIC STYLESHEET ──
const createStyles = (theme: typeof Colors.light | typeof Colors.dark, isTablet: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 16
    },
    headerTitle: {
        color: theme.text,
        fontSize: isTablet ? 22 : 18,
        fontWeight: '800'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 280, // High padding so it scrolls behind the large glass summary
    },

    /* --- Glass Card Styles --- */
    cardContainer: {
        backgroundColor: theme.cardSurface,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border,
    },
    cardGlass: { width: '100%' },
    panelGlass: { width: '100%', padding: 20 },
    
    /* ── Compact Card Top Row ── */
    thumbnailImage: {
        width: 72,
        height: 72,
        borderRadius: 12,
        marginRight: 14,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    subtitleText: {
        color: theme.tint,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '800',
        marginBottom: 4,
        marginTop: 2,
    },
    titleText: {
                        flex: 1,
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '800',
                    lineHeight: 20,
                    paddingRight: 8,
    },
                    priceText: {
                        color: theme.text,
                    fontSize: 18,
                    fontWeight: '900',
    },

                    /* ── Compact Card Bottom Row ── */
                    compactDivider: {
                        height: 1,
                    backgroundColor: theme.border,
                    marginBottom: 12,
                    opacity: 0.6,
    },
                    compactDateText: {
                        color: theme.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
    },
                    compactStatusBadge: {
                        flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    borderWidth: 1,
                    gap: 4,
    },
                    compactUploadBtn: {
                        paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.tint,
                    backgroundColor: 'rgba(255, 45, 85, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
    },
                    compactPreviewContainer: {
                        width: 60,
                    height: 44,
                    borderRadius: 8,
                    position: 'relative',
    },
                    compactPreviewImage: {
                        width: '100%',
                    height: '100%',
                    borderRadius: 8,
    },
                    compactRemoveBadge: {
                        position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: theme.background,
                    borderRadius: 12,
                    zIndex: 10,
    },

                    statusBadgePending: {backgroundColor: 'rgba(255, 152, 0, 0.1)', borderColor: 'rgba(255, 152, 0, 0.2)' },
                    statusBadgeSuccess: {backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.2)' },
                    statusDot: {width: 6, height: 6, borderRadius: 3 },
                    statusBadgeText: {fontSize: 10, fontWeight: '800' },

                    /* --- Sections & Panels --- */
                    divider: {
                        height: 1,
                    backgroundColor: theme.border,
                    marginVertical: 16,
    },
                    sectionTitle: {
                        color: theme.text,
                    fontSize: 14,
                    fontWeight: '800',
                    marginBottom: 12,
    },
                    guidelinesLink: {
                        flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 14,
    },
                    guidelinesLinkText: {
                        color: theme.tint,
                    fontSize: 13,
                    fontWeight: '700',
    },
                    checkboxRow: {
                        flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
    },
                    checkboxText: {
                        flex: 1,
                    color: theme.text,
                    fontSize: 13,
                    lineHeight: 20,
                    fontWeight: '600',
    },
                    breakdownRow: {
                        flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
    },
                    breakdownLabel: {
                        flex: 1,
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '500',
                    marginRight: 8,
    },
                    breakdownValue: {
                        color: theme.text,
                    fontSize: 14,
                    fontWeight: '800',
    },
                    couponRow: {
                        flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 10,
    },
                    couponInput: {
                        flex: 1,
                    height: 44,
                    backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    color: theme.text,
                    fontSize: 14,
    },
                    couponApplyBtn: {
                        height: 44,
                    paddingHorizontal: 20,
                    backgroundColor: theme.tint,
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
    },
                    couponApplyText: {
                        color: '#FFF',
                    fontSize: 13,
                    fontWeight: '700',
    },
                    instructionsInput: {
                        backgroundColor: theme.inputBg,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    padding: 14,
                    color: theme.text,
                    fontSize: 14,
                    minHeight: 80,
    },
                    clearAllBtn: {
                        alignSelf: 'center',
                    paddingVertical: 16,
    },
                    clearAllText: {
                        color: theme.textSecondary,
                    fontSize: 14,
                    fontWeight: '700',
    },

                    /* --- Frosted Glass Bottom Summary --- */
                    summaryWrapper: {
                        position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    overflow: 'hidden',
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
    },
                    summaryGlass: {
                        padding: 24,
                    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
                    warningBanner: {
                        flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 152, 0, 0.3)',
                    borderRadius: 12,
                    padding: 12,
                    gap: 8,
                    marginBottom: 16,
    },
                    warningText: {
                        flex: 1,
                    color: '#F57F17',
                    fontSize: 12,
                    fontWeight: '600',
    },
                    summaryRow: {
                        flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
    },
                    summaryLabelTotal: {
                        color: theme.text,
                    fontSize: 18,
                    fontWeight: '700'
    },
                    summaryValueTotal: {
                        color: theme.text,
                    fontSize: 18,
                    fontWeight: '800'
    },
                    summaryLabel: {
                        color: theme.textSecondary,
                    fontSize: 15,
                    fontWeight: '600'
    },
                    summaryValue: {
                        color: theme.text,
                    fontSize: 15,
                    fontWeight: '700'
    },
                    ctaSecondary: {
                        borderWidth: 1.5,
                    borderColor: theme.text,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 14,
                    borderRadius: 30,
                    marginBottom: 10,
    },
                    ctaSecondaryText: {
                        color: theme.text,
                    fontSize: 15,
                    fontWeight: '800'
    },
                    checkoutButton: {
                        backgroundColor: theme.tint,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    borderRadius: 30,
                    gap: 8
    },
                    checkoutButtonText: {
                        color: '#FFF',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginRight: 8
    },
                    guidelineLink: {
                        color: theme.tint,
                    textDecorationLine: 'underline',
                    fontWeight: '600'
    },
                    ctaDisabled: {
                        opacity: 0.5,
    },

                    emptyContainer: {
                        flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: 100
    },
                    emptyText: {
                        color: theme.textSecondary,
                    fontSize: 16,
                    marginTop: 12,
                    fontWeight: '600'
    },
});