import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, AppTheme, Typography } from '@/constants/theme';

const TRANSACTIONS = [
    { id: '1', title: 'Ad Revenue - Coca-Cola', date: 'Oct 24, 2023', amount: '+ ₦120,000', type: 'credit' },
    { id: '2', title: 'Withdrawal to GTBank', date: 'Oct 22, 2023', amount: '- ₦50,000', type: 'debit' },
    { id: '3', title: 'Ad Revenue - MTN', date: 'Oct 15, 2023', amount: '+ ₦85,000', type: 'credit' },
];

export default function EarningsScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    
    const ownerTint = theme.brandNavy;
    const styles = useMemo(() => createStyles(isTablet, theme, insets, ownerTint), [isTablet, theme, insets, ownerTint]);

    return (
        <View style={styles.rootContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Earnings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.balanceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Available Balance</Text>
                    <Text style={[styles.balanceAmount, { color: theme.text }]}>₦345,000</Text>
                    
                    <TouchableOpacity style={[styles.withdrawBtn, { backgroundColor: ownerTint }]}>
                        <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
                    
                    {TRANSACTIONS.map(tx => (
                        <View key={tx.id} style={[styles.txItem, { borderBottomColor: theme.border }]}>
                            <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? theme.success + '15' : theme.error + '15' }]}>
                                <Ionicons 
                                    name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
                                    size={18} 
                                    color={tx.type === 'credit' ? theme.success : theme.error} 
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={[styles.txTitle, { color: theme.text }]}>{tx.title}</Text>
                                <Text style={[styles.txDate, { color: theme.textSecondary }]}>{tx.date}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.type === 'credit' ? theme.success : theme.text }]}>
                                {tx.amount}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: AppTheme, insets: any, ownerTint: string) => StyleSheet.create({
    rootContainer: { flex: 1, backgroundColor: theme.background },
    header: { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42, paddingHorizontal: 20, paddingBottom: 16 },
    headerTitle: { ...Typography.h2, color: theme.text, fontSize: isTablet ? 28 : 24, fontWeight: '800' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: insets.bottom + 100 },
    balanceCard: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 10 },
    balanceLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    balanceAmount: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    withdrawBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' },
    withdrawBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
    section: { marginTop: 30 },
    sectionTitle: { ...Typography.h3, fontWeight: '800', marginBottom: 16 },
    txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txInfo: { flex: 1 },
    txTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    txDate: { fontSize: 13, fontWeight: '500' },
    txAmount: { fontSize: 16, fontWeight: '700' }
});
