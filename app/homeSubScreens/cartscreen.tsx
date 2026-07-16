import React, { useMemo, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Platform,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import { Paystack, paystackProps } from 'react-native-paystack-webview';

// Hooks
import { useCartScreen } from '@/hooks/useCartScreen';
import { useCheckout } from '@/hooks/useCheckout';

// --- THEME DEFINITIONS ---
const Colors = {
    light: {
        background: '#F2F2F7', // Standard iOS light gray background
        text: '#000000',
        textSecondary: '#6C6C70',
        glassBorder: 'rgba(255, 255, 255, 0.6)',
        tint: '#FF2D55',
        blurTint: 'light' as const,
        dangerBg: 'rgba(255, 59, 48, 0.1)',
        dangerBorder: 'rgba(255, 59, 48, 0.2)',
        icon: '#000000',
    },
    dark: {
        background: '#000000', // Deep black background
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
        tint: '#FF2D55',
        blurTint: 'dark' as const,
        dangerBg: 'rgba(255, 59, 48, 0.15)',
        dangerBorder: 'rgba(255, 59, 48, 0.3)',
        icon: '#FFFFFF',
    }
};

export default function CartScreen() {
    const router = useRouter();
    // Theme Detection — cast colorScheme to avoid 'unspecified' index error
    const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
    const theme = Colors[colorScheme];
    const styles = useMemo(() => createStyles(theme), [theme]);

    // Pull custom logic from useCartScreen hook
    const {
        cartItems,
        totalAmount,
        isLoading,
        uploadProgresses,
        handleRemoveItem,
        handleClearCart,
        handleUploadMedia,
        handleRemoveMedia
    } = useCartScreen();

    const {
        agreed,
        setAgreed,
        userEmail,
        amountInKobo,
        reference,
        isInitializing,
        startCheckout,
        handlePaymentSuccess,
        handlePaymentCancel,
    } = useCheckout();


    const renderCartItem = ({ item }: { item: any }) => {
        const isMediaUploaded = !!item.mediaUrl;

        return (
            <View style={styles.cardContainer}>
                {/* GLASS BACKGROUND FOR CARD */}
                <BlurView
                    intensity={colorScheme === 'dark' ? 30 : 60}
                    tint={theme.blurTint}
                    style={styles.cardGlass}
                >
                    {/* TOP: Large Edge-to-Edge Image */}
                    <Image
                        source={{ uri: item.screenImageUrl ?? 'https://placehold.jp/24/f0f0f0/cccccc/300x200.png?text=No+Image' }}
                        style={styles.cardImage}
                        contentFit="cover"
                        transition={200}
                    />

                    {/* BOTTOM: Content & Actions */}
                    <View style={styles.cardBody}>

                        {/* Header Row: Name & Price */}
                        <View style={styles.titleRow}>
                            <View style={styles.titleTextContainer}>
                                <Text style={styles.subtitleText} numberOfLines={1}>
                                    {item.screenName}, {item.screenCity}
                                </Text>
                                <Text style={styles.titleText} numberOfLines={1}>
                                    {item.startDate} → {item.endDate}
                                </Text>
                            </View>
                            <Text style={styles.priceText}>
                                ₦{Number(item.totalPrice).toLocaleString('en-NG')}
                            </Text>
                        </View>

                        {/* Description: Dates */}
                        <Text style={styles.descText}>
                            Your campaign runs from <Text style={styles.boldDate}>{item.startDate}</Text> to <Text style={styles.boldDate}>{item.endDate}</Text>.
                        </Text>

                        {/* Media Upload Area */}
                        <View style={styles.mediaUploadSection}>
                            <Text style={styles.mediaUploadTitle}>CAMPAIGN MEDIA</Text>
                            <View style={styles.actionRow}>
                                {isMediaUploaded ? (
                                    <View style={[styles.uploadBox, { borderColor: theme.glassBorder }]}>
                                        <Image source={{ uri: item.mediaUrl }} style={styles.previewImage} contentFit="cover" />
                                        <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveMedia(item)}>
                                            <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.uploadBox, { borderColor: theme.textSecondary, borderStyle: 'dashed' }]}
                                        activeOpacity={0.6}
                                        onPress={() => handleUploadMedia(item)}
                                    >
                                        {uploadProgresses[item.id] !== undefined ? (
                                            <>
                                                <ActivityIndicator color={theme.tint} />
                                                <Text style={[styles.uploadBoxText, { color: theme.tint, marginTop: 4 }]}>
                                                    {uploadProgresses[item.id]}%
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="cloud-upload-outline" size={24} color={theme.textSecondary} />
                                                <Text style={[styles.uploadBoxText, { color: theme.textSecondary }]}>Add Media</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                                
                                <View style={{ flex: 1 }} />
                                
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleRemoveItem(item.id)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <View style={styles.mainHeader}>
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={()=>router.back()}>
                    <Ionicons name="chevron-back" size={28} color={theme.icon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Campaign Cart</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={renderCartItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={64} color={theme.textSecondary} />
                        <Text style={styles.emptyText}>Your cart is empty.</Text>
                    </View>
                }
            />

            {/* FROSTED GLASS BOTTOM SUMMARY */}
            {cartItems.length > 0 && (
                <View style={styles.summaryWrapper}>
                    <BlurView
                        intensity={colorScheme === 'dark' ? 50 : 80}
                        tint={theme.blurTint}
                        style={styles.summaryGlass}
                    >
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Campaigns</Text>
                            <Text style={styles.summaryValue}>{cartItems.length}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabelTotal}>Subtotal</Text>
                            <Text style={styles.summaryValueTotal}>
                                ₦{Number(totalAmount).toLocaleString('en-NG')}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            activeOpacity={0.7}
                            onPress={() => setAgreed(!agreed)}
                        >
                            <Ionicons
                                name={agreed ? 'checkbox' : 'square-outline'}
                                size={20}
                                color={agreed ? theme.tint : theme.textSecondary}
                            />
                            <Text style={styles.checkboxText}>
                                I agree to GetSeen's advertising guidelines.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.checkoutButton,
                                (!agreed || isInitializing) && styles.checkoutButtonDisabled
                            ]}
                            activeOpacity={0.8}
                            disabled={!agreed || isInitializing}
                            onPress={startCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>
                                {isInitializing ? "Initializing..." : "Continue to Checkout"}
                            </Text>
                            {!isInitializing && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </BlurView>
                </View>
            )}

            {reference && (
                <Paystack
                    paystackKey="pk_test_6284d9ec09474b72ad898b40e3f42502941265a8"
                    billingEmail={userEmail || "user@getseen.com"}
                    amount={amountInKobo / 100} // Paystack v4 expects Naira not Kobo!
                    onCancel={handlePaymentCancel}
                    onSuccess={handlePaymentSuccess}
                    refNumber={reference} // Pass the backend generated reference
                    autoStart={true}
                />
            )}
        </SafeAreaView>
    );
}

// --- DYNAMIC STYLESHEET ---
const createStyles = (theme: typeof Colors.light | typeof Colors.dark) => StyleSheet.create({
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
        paddingBottom: 20
    },
    headerTitle: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '700'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 200 // Extra padding so cards scroll behind the glass summary
    },

    /* --- Glass Card Styles --- */
    cardContainer: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden', // Clips the BlurView to the border radius
        borderWidth: 1,
        borderColor: theme.glassBorder,
        // Optional: Add shadow for iOS/Android to make glass pop
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardGlass: {
        width: '100%',
    },
    cardImage: {
        width: '100%',
        height: 180,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    cardBody: {
        padding: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    subtitleText: {
        color: theme.textSecondary,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
        marginBottom: 4,
    },
    titleText: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '800',
    },
    priceText: {
        color: theme.text,
        fontSize: 20,
        fontWeight: '900',
    },
    descText: {
        color: theme.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 16,
    },
    boldDate: {
        color: theme.text,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.dangerBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.dangerBorder,
    },
    mediaUploadSection: {
        marginTop: 8,
    },
    mediaUploadTitle: {
        color: theme.textSecondary,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '700',
        marginBottom: 8,
    },
    uploadBox: {
        width: 100,
        height: 90,
        borderWidth: 1.5,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: theme.background,
        borderRadius: 12,
        zIndex: 10,
    },
    uploadBoxText: {
        fontSize: 11,
        marginTop: 6,
    },

    /* --- Frosted Glass Bottom Summary --- */
    summaryWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden', // Clips the BlurView
        borderTopWidth: 1,
        borderTopColor: theme.glassBorder,
    },
    summaryGlass: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    summaryLabel: {
        color: theme.textSecondary,
        fontSize: 14
    },
    summaryValue: {
        color: theme.text,
        fontSize: 14,
        fontWeight: '600'
    },
    summaryLabelTotal: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '700'
    },
    summaryValueTotal: {
        color: theme.tint,
        fontSize: 22,
        fontWeight: '900'
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    checkboxText: {
        color: theme.textSecondary,
        fontSize: 12,
        marginLeft: 8
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
    checkoutButtonDisabled: {
        backgroundColor: theme.textSecondary,
        opacity: 0.5,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800'
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100
    },
    emptyText: {
        color: theme.textSecondary,
        fontSize: 16,
        marginTop: 12,
        fontWeight: '500'
    },
});