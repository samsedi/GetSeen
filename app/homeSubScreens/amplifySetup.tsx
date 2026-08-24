import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAmplifyStore } from '@/store/useAmplifyStore';
import { useAlertStore } from '@/store/useAlertStore';
import * as WebBrowser from 'expo-web-browser';

export default function AmplifySetup() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

    const { previousCampaigns, isFetchingPrevious, fetchPreviousCampaigns, checkoutAmplify } = useAmplifyStore();

    const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([]);
    const [campaignName, setCampaignName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dailyImpressions, setDailyImpressions] = useState('3000');
    const [destinationUrl, setDestinationUrl] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        fetchPreviousCampaigns(1);
    }, []);

    const toggleSelection = (id: number) => {
        setSelectedCampaignIds(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleCheckout = async () => {
        if (selectedCampaignIds.length === 0) {
            useAlertStore.getState().showAlert('Validation Error', 'Please select at least one previous campaign to amplify.');
            return;
        }
        if (!campaignName || !startDate || !endDate || !destinationUrl) {
            useAlertStore.getState().showAlert('Validation Error', 'Please fill in all required fields.');
            return;
        }
        if (parseInt(dailyImpressions) < 3000) {
            useAlertStore.getState().showAlert('Validation Error', 'Daily impressions must be at least 3,000.');
            return;
        }

        setIsCheckingOut(true);

        const requestData = {
            campaign_name: campaignName,
            order_item_ids: selectedCampaignIds,
            start_date: startDate,
            end_date: endDate,
            daily_impressions: parseInt(dailyImpressions),
            destination_url: destinationUrl,
            media_files: [], // Assuming user uses previously attached media for now or adds here
            callback_url: 'mygetseen://payment-complete'
        };

        const result = await checkoutAmplify(requestData);

        if (result.success && result.data?.paystack?.authorization_url) {
            const authUrl = result.data.paystack.authorization_url;
            await WebBrowser.openBrowserAsync(authUrl);
            useAlertStore.getState().showAlert('Payment Initialized', 'Please complete your payment in the browser.');
            router.push('/(tabs)/campaign');
        } else {
            useAlertStore.getState().showAlert('Error', result.error || 'Failed to initialize Amplify checkout.');
        }

        setIsCheckingOut(false);
    };

    const renderCampaign = ({ item }: { item: any }) => {
        const isSelected = selectedCampaignIds.includes(item.order_item_id);
        return (
            <TouchableOpacity
                style={[styles.campaignCard, isSelected && { borderColor: theme.tint, borderWidth: 2 }]}
                onPress={() => toggleSelection(item.order_item_id)}
                activeOpacity={0.8}
            >
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.screen_title}</Text>
                    <Text style={styles.cardLocation}>{item.location}</Text>
                    <Text style={styles.cardOrderNumber}>{item.order_number}</Text>
                </View>
                <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={isSelected ? theme.tint : theme.border}
                />
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
                    <Ionicons name="arrow-back" size={20} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Amplify Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>1. Select Sources</Text>
                <Text style={styles.subtitle}>Choose which previous screen placements you want to amplify.</Text>
                
                {isFetchingPrevious && previousCampaigns.length === 0 ? (
                    <ActivityIndicator size="large" color={theme.tint} style={{ marginVertical: 20 }} />
                ) : (
                    <FlatList
                        data={previousCampaigns}
                        keyExtractor={(item) => item.order_item_id.toString()}
                        renderItem={renderCampaign}
                        scrollEnabled={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No eligible campaigns found.</Text>}
                    />
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>2. Campaign Details</Text>
                
                <Text style={styles.label}>Campaign Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., August Mall Retargeting"
                    placeholderTextColor={theme.textSecondary}
                    value={campaignName}
                    onChangeText={setCampaignName}
                />

                <Text style={styles.label}>Destination URL</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://example.com/offer"
                    placeholderTextColor={theme.textSecondary}
                    value={destinationUrl}
                    onChangeText={setDestinationUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Start Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textSecondary}
                            value={startDate}
                            onChangeText={setStartDate}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>End Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textSecondary}
                            value={endDate}
                            onChangeText={setEndDate}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Daily Impressions (Min 3000)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="3000"
                    placeholderTextColor={theme.textSecondary}
                    value={dailyImpressions}
                    onChangeText={setDailyImpressions}
                    keyboardType="numeric"
                />

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.checkoutBtn, isCheckingOut && { opacity: 0.7 }]} 
                    onPress={handleCheckout}
                    disabled={isCheckingOut}
                >
                    {isCheckingOut ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.checkoutBtnText}>Checkout Amplify</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    sectionTitle: {
        ...Typography.h3,
        color: theme.text,
        marginBottom: 8,
    },
    subtitle: {
        ...Typography.caption,
        color: theme.textSecondary,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 24,
    },
    campaignCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 12,
    },
    cardTitle: {
        ...Typography.body,
        color: theme.text,
    },
    cardLocation: {
        ...Typography.caption,
        color: theme.textSecondary,
        marginTop: 4,
    },
    cardOrderNumber: {
        ...Typography.caption,
        color: theme.tint,
        marginTop: 4,
    },
    emptyText: {
        ...Typography.caption,
        color: theme.textSecondary,
        textAlign: 'center',
        marginVertical: 20,
    },
    label: {
        ...Typography.body,
        color: theme.text,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: theme.inputBg,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 14,
        color: theme.text,
        ...Typography.body,
    },
    footer: {
        padding: 20,
        paddingBottom: insets.bottom || 20,
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    checkoutBtn: {
        backgroundColor: theme.tint,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    checkoutBtnText: {
        ...Typography.body,
        color: '#FFF',
    }
});
