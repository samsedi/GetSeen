import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/constants/theme';

export default function CampaignCard({ item }: { item: any }) {
    const theme = useAppTheme();
    const isActive = item.status === 'Active';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#E8F5E9' : '#FFF3E0' }]}>
                        <Text style={[styles.statusText, { color: isActive ? '#2E7D32' : '#EF6C00' }]}>
                            {item.status}
                        </Text>
                    </View>
                    <Text style={styles.price}>₦{item.price}</Text>
                </View>

                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                </Text>

                <View style={styles.packageRow}>
                    <Ionicons name="cube-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.packageName, { color: theme.textSecondary }]}>
                        {item.package}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.moreBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 30,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    content: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    price: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FF2D55',
    },
    name: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 4,
    },
    packageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    packageName: {
        fontSize: 7,
        fontWeight: '500',
    },
    moreBtn: {
        padding: 5,
    }
});