import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';
import { useWallet, WalletTab } from '@/hooks/useWallet';
import { EarningsView } from '@/components/ScreenOwnerComponents/Wallet/EarningsView';
import { PayoutsView } from '@/components/ScreenOwnerComponents/Wallet/PayoutsView';

export default function WalletScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    const { activeTab, setActiveTab, loading, earningsSummary, payoutHistory, venueEarnings, timeFilter, setTimeFilter } = useWallet();

    const styles = useMemo(() => createStyles(isTablet, theme, insets), [isTablet, theme, insets]);

    return (
        <View style={styles.rootContainer}>
            {renderHeader(styles)}
            {renderSegmentedControl(activeTab, setActiveTab, styles, theme)}
            {renderContent(activeTab, loading, earningsSummary, payoutHistory, venueEarnings, timeFilter, setTimeFilter, styles, theme)}
        </View>
    );
}

function renderHeader(styles: any) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Wallet</Text>
        </View>
    );
}

function renderSegmentedControl(activeTab: WalletTab, setActiveTab: (tab: WalletTab) => void, styles: any, theme: AppTheme) {
    return (
        <View style={styles.segmentContainer}>
            <View style={[styles.segmentBackground, { backgroundColor: theme.border }]}>
                {renderSegmentButton('earnings', 'Earnings', activeTab, setActiveTab, styles, theme)}
                {renderSegmentButton('payouts', 'Payouts', activeTab, setActiveTab, styles, theme)}
            </View>
        </View>
    );
}

function renderSegmentButton(tabValue: WalletTab, label: string, activeTab: WalletTab, setActiveTab: (tab: WalletTab) => void, styles: any, theme: AppTheme) {
    const isActive = activeTab === tabValue;
    return (
        <TouchableOpacity 
            style={[styles.segmentButton, isActive && { backgroundColor: theme.card }]} 
            onPress={() => setActiveTab(tabValue)}
        >
            <Text style={[styles.segmentText, { color: isActive ? theme.text : theme.textSecondary, fontWeight: isActive ? '700' : '500' }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function renderContent(activeTab: WalletTab, loading: boolean, earningsSummary: any, payoutHistory: any, venueEarnings: any, timeFilter: any, setTimeFilter: any, styles: any, theme: AppTheme) {
    if (loading) {
        return renderLoadingSpinner(theme);
    }
    return (
        <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'earnings'
                ? <EarningsView earningsSummary={earningsSummary} venueEarnings={venueEarnings} timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
                : <PayoutsView payoutHistory={payoutHistory} />}
        </ScrollView>
    );
}

function renderLoadingSpinner(theme: AppTheme) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.brandNavy} />
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any) => StyleSheet.create({
    rootContainer: { flex: 1, backgroundColor: theme.background },
    header: { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42, paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { ...Typography.h2, color: theme.text, fontSize: isTablet ? 28 : 24, fontWeight: '800' },
    segmentContainer: { paddingHorizontal: 20, marginBottom: 15 },
    segmentBackground: { flexDirection: 'row', padding: 4, borderRadius: 12 },
    segmentButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    segmentText: { fontSize: 15 },
    mainScroll: { paddingBottom: insets.bottom + 100 },
});
