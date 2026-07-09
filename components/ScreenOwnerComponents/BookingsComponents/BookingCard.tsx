import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';

export interface Booking {
    id: string;
    venue: string;
    orderNo: string;
    startDate: string;
    endDate: string;
    status: 'Pending' | 'Completed' | 'Active' | 'Cancelled';
}

interface BookingCardProps {
    booking: Booking;
    onView?: () => void;
    onAccept?: () => void;
    onDecline?: () => void;
}

export function BookingCard({ booking, onView, onAccept, onDecline }: BookingCardProps) {
    const theme = useAppTheme();
    const ownerTint = theme.brandNavy;
    
    // Status styling
    const getStatusColor = (status: Booking['status']) => {
        const colors: Record<Booking['status'], string> = {
            'Completed': theme.success,
            'Pending': theme.statusWarning,
            'Active': theme.statusBlue,
            'Cancelled': theme.error,
        };
        return colors[status] || theme.textSecondary;
    };
    
    return (
        <View style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.requestTop}>
                <View style={[styles.requestAvatar, { backgroundColor: ownerTint + '15' }]}>
                    <Ionicons name="calendar-outline" size={20} color={ownerTint} />
                </View>
                <View style={styles.requestInfo}>
                    <Text style={[styles.requestBrand, { color: theme.text }]} numberOfLines={2}>
                        {booking.venue}
                    </Text>
                    <Text style={[styles.requestScreen, { color: theme.textSecondary }]}>
                        {booking.orderNo}
                    </Text>
                    <Text style={[styles.requestDate, { color: theme.textSecondary }]}>
                        {booking.startDate} - {booking.endDate}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{booking.status}</Text>
                </View>
            </View>
            
            <View style={styles.requestActions}>
                <TouchableOpacity style={[styles.requestBtn, styles.viewBtn, { borderColor: theme.border }]} onPress={onView}>
                    <Ionicons name="eye-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.viewBtnText, { color: theme.textSecondary }]}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    requestCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 12 },
    requestTop: { flexDirection: 'row', alignItems: 'flex-start' },
    requestAvatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    requestInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
    requestBrand: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    requestScreen: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    requestDate: { fontSize: 12, fontWeight: '400' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    requestActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
    requestBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    declineBtn: { borderWidth: 1 },
    declineBtnText: { fontSize: 13, fontWeight: '700' },
    acceptBtn: {},
    acceptBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
    viewBtn: { borderWidth: 1 },
    viewBtnText: { fontSize: 13, fontWeight: '600' }
});
