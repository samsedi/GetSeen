import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SavedQRCard = ({ qr, theme, onDownload, onView, onReport, onDelete }: any) => (
    <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.historyTop}>
            <View style={styles.miniQrIcon}>
                <Ionicons name="qr-code" size={20} color="#2B4373" />
            </View>
            <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>{qr.name}</Text>
                <Text style={styles.historyDate}>{qr.createdAt}</Text>
            </View>
        </View>

        <View style={[styles.actionBar, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.actionBtn} onPress={onDownload}>
                <Ionicons name="download-outline" size={18} color={theme.text} />
                <Text style={[styles.actionText, { color: theme.text }]}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onView}>
                <Ionicons name="eye-outline" size={18} color={theme.text} />
                <Text style={[styles.actionText, { color: theme.text }]}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onReport}>
                <Ionicons name="bar-chart-outline" size={18} color={theme.text} />
                <Text style={[styles.actionText, { color: theme.text }]}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color="#FF2D55" />
                <Text style={[styles.actionText, { color: '#FF2D55' }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    historyCard: { borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 16 },
    historyTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    miniQrIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(43, 67, 115, 0.1)',
        justifyContent: 'center', alignItems: 'center'
    },
    historyInfo: { flex: 1, marginLeft: 15 },
    historyTitle: { fontSize: 15, fontWeight: '700' },
    historyDate: { fontSize: 11, color: '#667085', marginTop: 2 },
    actionBar: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
    actionBtn: { alignItems: 'center', flex: 1 },
    actionText: { fontSize: 10, fontWeight: '700', marginTop: 4 },
});