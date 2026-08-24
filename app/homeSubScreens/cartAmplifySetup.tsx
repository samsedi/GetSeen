import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme, Typography } from '@/constants/theme';
import { useCartStore } from '@/store/useCartStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useAmplifyCheckout } from '@/hooks/useAmplifyCheckout';

export default function CartAmplifySetup() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    const { totalAmount } = useCartStore();

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [dailyImpressions, setDailyImpressions] = useState('5000');
    const [destinationUrl, setDestinationUrl] = useState('');
    const [mediaFiles, setMediaFiles] = useState<{uri: string, type: string}[]>([]);
    const [couponCode, setCouponCode] = useState('');

    const parsedImpressions = parseInt(dailyImpressions) || 0;
    const pricePerImpression = 6;
    
    // Calculate days between dates
    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Add 1 so same day counts as 1 day, etc (depending on business logic)
        return diffDays >= 0 ? diffDays + 1 : 0; 
    };

    const campaignDays = calculateDays();
    const mobileRetargetingCost = parsedImpressions * campaignDays * pricePerImpression;
    const grandTotal = totalAmount + mobileRetargetingCost;

    const handlePickMedia = async () => {
        if (mediaFiles.length >= 5) {
            useAlertStore.getState().showAlert('Limit Reached', 'You can only add up to 5 media files.');
            return;
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setMediaFiles(prev => [...prev, { uri: asset.uri, type: asset.type || 'image' }]);
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const { startCombinedCheckout, isProcessing } = useAmplifyCheckout();

    const handleProceedToPayment = async () => {
        if (!startDate || !endDate) {
            useAlertStore.getState().showAlert('Validation Error', 'Please select campaign dates.');
            return;
        }
        if (parsedImpressions < 3000) {
            useAlertStore.getState().showAlert('Validation Error', 'Daily impressions must be at least 3,000.');
            return;
        }
        if (mediaFiles.length === 0) {
            useAlertStore.getState().showAlert('Validation Error', 'Please upload at least 1 image or video.');
            return;
        }
        if (!destinationUrl) {
            useAlertStore.getState().showAlert('Validation Error', 'Please enter a destination URL.');
            return;
        }

        await startCombinedCheckout({
            startDate,
            endDate,
            parsedImpressions,
            destinationUrl,
            mediaFiles,
            couponCode,
            grandTotal
        });
    };

    const onStartChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setShowStartPicker(Platform.OS === 'ios');
        if (currentDate) {
            setStartDate(currentDate);
            // Auto adjust end date if needed
            if (endDate && currentDate > endDate) {
                setEndDate(currentDate);
            }
        }
    };

    const onEndChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || endDate;
        setShowEndPicker(Platform.OS === 'ios');
        if (currentDate) {
            if (startDate && currentDate < startDate) {
                useAlertStore.getState().showAlert('Invalid Date', 'End date cannot be before start date.');
                return;
            }
            setEndDate(currentDate);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                    <Ionicons name="arrow-back" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Amplify Your Campaign</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                {/* 1. Campaign Dates */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Campaign Dates</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Campaign Start Date</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
                                <Text style={[styles.dateText, !startDate && { color: theme.textSecondary }]}>
                                    {startDate ? startDate.toLocaleDateString() : 'DD/MM/YYYY'}
                                </Text>
                                <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Campaign End Date</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
                                <Text style={[styles.dateText, !endDate && { color: theme.textSecondary }]}>
                                    {endDate ? endDate.toLocaleDateString() : 'DD/MM/YYYY'}
                                </Text>
                                <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {!startDate && <Text style={styles.errorText}><Ionicons name="alert-circle" size={14} /> Please select a start date</Text>}
                    <Text style={styles.helperText}>Retargeting begins 24hours after digital screen campaign start date</Text>
                </View>

                {/* 2. Budget */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Budget</Text>
                    <Text style={styles.label}>ENTER DESIRED DAILY IMPRESSIONS</Text>
                    <View style={styles.budgetInputContainer}>
                        <TextInput
                            style={styles.budgetInput}
                            placeholder="e.g. 5000"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={dailyImpressions}
                            onChangeText={setDailyImpressions}
                        />
                        <View style={styles.budgetCalculations}>
                            <Text style={styles.calcText}>₦{pricePerImpression} per impression</Text>
                            <Text style={styles.calcTotalText}>Total price: ₦{mobileRetargetingCost.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                    {parsedImpressions < 3000 && <Text style={styles.errorText}><Ionicons name="alert-circle" size={14} /> Minimum impressions is 3,000</Text>}
                    <Text style={styles.helperText}>Impressions will be spread across selected screen locations. The more impressions, the more people you'll reach multiple times</Text>
                </View>

                {/* 3. Campaign Media */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Campaign Media</Text>
                    <Text style={styles.helperText}>At least 1 image or video is required. You can add up to 5 media files.</Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <Text style={styles.label}>Selected Media</Text>
                        <Text style={styles.mediaCount}>{mediaFiles.length}/5</Text>
                    </View>
                    
                    <View style={styles.mediaGrid}>
                        {mediaFiles.map((file, index) => (
                            <View key={index} style={styles.mediaItemContainer}>
                                <Image source={{ uri: file.uri }} style={styles.mediaPreview} />
                                {file.type === 'video' && (
                                    <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                                        <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
                                    </View>
                                )}
                                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => handleRemoveMedia(index)}>
                                    <Ionicons name="close" size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {mediaFiles.length < 5 && (
                            <TouchableOpacity style={styles.addMediaBtn} onPress={handlePickMedia}>
                                <Ionicons name="add" size={32} color={theme.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 4. Destination URL */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Destination URL</Text>
                    <Text style={[styles.helperText, { marginTop: 0, marginBottom: 12 }]}>Tell us where you want your traffic sent e.g website, app, whatsapp, social media link etc.</Text>
                    <TextInput
                        style={styles.urlInput}
                        placeholder="https://example.com"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="url"
                        autoCapitalize="none"
                        value={destinationUrl}
                        onChangeText={setDestinationUrl}
                    />
                    {!destinationUrl && <Text style={styles.errorText}><Ionicons name="alert-circle" size={14} /> Destination URL is required</Text>}
                </View>

                {/* 5. Order Summary */}
                <View style={[styles.card, { backgroundColor: '#F8F9FA' }]}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Screen Booking</Text>
                        <Text style={styles.summaryValue}>₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Mobile Retargeting</Text>
                        <Text style={styles.summaryValue}>₦{mobileRetargetingCost.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    
                    <View style={styles.couponContainer}>
                        <Text style={styles.label}>Coupon Code</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput
                                style={[styles.urlInput, { flex: 1, marginBottom: 0 }]}
                                placeholder="Enter coupon code"
                                placeholderTextColor={theme.textSecondary}
                                value={couponCode}
                                onChangeText={setCouponCode}
                            />
                            <TouchableOpacity style={styles.applyBtn}>
                                <Text style={styles.applyBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₦{grandTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>
                
                <Text style={styles.bottomHelperText}>85% of advertisers who run mobile retargeting campaigns see increase in performance</Text>

                <View style={styles.footerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={16} color={theme.tint} style={{ marginRight: 6 }} />
                        <Text style={styles.backBtnText}>Back to Cart</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.proceedBtn} onPress={handleProceedToPayment} disabled={isProcessing}>
                        <Text style={styles.proceedBtnText}>{isProcessing ? "Processing..." : "Proceed to Checkout"}</Text>
                        {!isProcessing && <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />}
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Date Pickers */}
            {showStartPicker && Platform.OS !== 'ios' && (
                <DateTimePicker value={startDate || new Date()} mode="date" display="default" onChange={onStartChange} />
            )}
            {showEndPicker && Platform.OS !== 'ios' && (
                <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={onEndChange} />
            )}
            {Platform.OS === 'ios' && showStartPicker && (
                <View style={styles.iosPickerContainer}>
                    <View style={styles.iosPickerHeader}>
                        <TouchableOpacity onPress={() => setShowStartPicker(false)}><Text style={{color: theme.tint, fontWeight: 'bold'}}>Done</Text></TouchableOpacity>
                    </View>
                    <DateTimePicker value={startDate || new Date()} mode="date" display="spinner" onChange={onStartChange} />
                </View>
            )}
            {Platform.OS === 'ios' && showEndPicker && (
                <View style={styles.iosPickerContainer}>
                    <View style={styles.iosPickerHeader}>
                        <TouchableOpacity onPress={() => setShowEndPicker(false)}><Text style={{color: theme.tint, fontWeight: 'bold'}}>Done</Text></TouchableOpacity>
                    </View>
                    <DateTimePicker value={endDate || new Date()} mode="date" display="spinner" onChange={onEndChange} />
                </View>
            )}

        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: any, insets: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: insets.top + 10,
        paddingBottom: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    headerTitle: {
        ...Typography.h3,
        color: theme.text,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        ...Typography.h3,
        fontSize: 16,
        color: theme.text,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        ...Typography.caption,
        color: theme.text,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    dateText: {
        color: theme.text,
        fontSize: 14,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        marginTop: 6,
    },
    helperText: {
        color: theme.textSecondary,
        fontSize: 12,
        marginTop: 8,
    },
    budgetInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    budgetInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 36,
        marginRight: 12,
        fontSize: 14,
        color: theme.text,
    },
    budgetCalculations: {
        flex: 1.5,
    },
    calcText: {
        color: theme.textSecondary,
        fontSize: 12,
    },
    calcTotalText: {
        color: theme.text,
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 2,
    },
    mediaCount: {
        color: theme.textSecondary,
        fontSize: 12,
    },
    mediaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    addMediaBtn: {
        width: 80,
        height: 80,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: theme.border,
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaItemContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
    },
    removeMediaBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 2,
    },
    urlInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        fontSize: 14,
        color: theme.text,
        marginBottom: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: theme.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        color: theme.text,
        fontSize: 14,
        fontWeight: '600',
    },
    couponContainer: {
        marginTop: 12,
    },
    applyBtn: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyBtnText: {
        color: theme.text,
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 16,
    },
    totalLabel: {
        color: theme.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        color: theme.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomHelperText: {
        color: theme.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 16,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    backBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: theme.tint,
        borderRadius: 24,
        height: 48,
    },
    backBtnText: {
        color: theme.tint,
        fontSize: 14,
        fontWeight: '600',
    },
    proceedBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D81B60', // Matching the pinkish color in the screenshot
        borderRadius: 24,
        height: 48,
    },
    proceedBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    iosPickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderColor: '#EFEFEF',
        paddingBottom: 20, // for safe area
        zIndex: 999,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderColor: '#EFEFEF',
    },
});
