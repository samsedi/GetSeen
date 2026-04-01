import React, { useMemo } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

import ProfileHeader from '@/components/ProfileScreenComponents/ProfileHeader';
import ProfileHero from '@/components/ProfileScreenComponents/ProfileHero';
import StatsCard from '@/components/ProfileScreenComponents/StatsCard';
import ProfileInfoTile from '@/components/ProfileScreenComponents/ProfileInfoTile';
import AdHistoryItem from '@/components/ProfileScreenComponents/AdHistoryItem';
import SupportButton from '@/components/ProfileScreenComponents/SupportButton';
import {useRouter} from "expo-router"; // Added Import

export default function ProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const router = useRouter()

    const { logout } = useAuthStore();
    const activeTint = theme.tint;

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ProfileHeader title="Profile" tintColor={activeTint} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Section */}
                <ProfileHero
                    name="Marcus Sterling"
                    company="Sterling & Co. Digital"
                    imageUrl="https://i.pravatar.cc/300"
                    tintColor={activeTint}
                />

                {/* STATS SECTION */}
                <View style={[styles.statsRow, { paddingHorizontal: isTablet ? 40 : 24 }]}>
                    <StatsCard
                        label="NEXT SCHEDULED AD"
                        value="Aug 24"
                        subValue="Summer Campaign"
                        iconName="calendar-clock"
                        bgColor={activeTint}
                    />
                    <StatsCard
                        label="RECENT ACTIVITY"
                        value="+12.4%"
                        subValue="Engagement reach"
                        iconName="chart-line-variant"
                        bgColor="#2B4373"
                    />
                </View>

                {/* BUSINESS PROFILE SECTION */}
                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Profile</Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Text style={[styles.editText, { color: activeTint }]}>EDIT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.infoCard,
                        { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F9FAFB' }
                    ]}>
                        <View style={styles.infoRow}>
                            <ProfileInfoTile
                                label="Verification"
                                value="Fully Verified"
                                icon={<Ionicons name="checkmark-circle" size={18} color="#1E7E34" />}
                            />
                            <ProfileInfoTile label="Tax ID" value="GB-882910394" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                        <View style={styles.infoRow}>
                            <ProfileInfoTile label="Category" value="Retail & Commerce" />
                            <ProfileInfoTile label="Location" value="London, UK" />
                        </View>
                    </View>
                </View>

                {/* AD HISTORY SECTION */}
                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ad History</Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Ionicons name="options-outline" size={isTablet ? 24 : 20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <AdHistoryItem
                        title="Flash Sale Weekend"
                        date="Aug 12, 2023"
                        amount="₦150,000.00"
                        status="ACTIVE"
                        tintColor={activeTint}
                    />
                </View>

                {/* SUPPORT & FEEDBACK SECTION - NEW */}
                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24, marginBottom: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
                        Support & Feedback
                    </Text>

                    <SupportButton
                        label="Report an Issue"
                        iconName="ladybug"
                        isBug={true}
                        bgColor={colorScheme === 'dark' ? '#2A181C' : '#FEE2E9'}
                        tintColor={activeTint}
                        onPress={() => console.log("Report Issue")}
                    />

                    <SupportButton
                        label="Give Feedback"
                        iconName="chatbubble-outline"
                        bgColor={colorScheme === 'dark' ? '#1C1C1E' : '#F3F4F6'}
                        tintColor={activeTint}
                        onPress={() => console.log("Give Feedback")}
                    />
                </View>

                {/* LOGOUT BUTTON */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: activeTint + '30' }]}
                    onPress={()=>router.push("/(auth)/roles")}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={activeTint} />
                    <Text style={[styles.logoutText, { color: activeTint }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    statsRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
    section: { marginTop: 35 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: '900',
        letterSpacing: -0.5
    },
    editText: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1
    },
    infoCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)'
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    divider: { height: 1, width: '100%', marginVertical: 4 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        paddingVertical: 16,
        marginHorizontal: isTablet ? 40 : 24,
        borderRadius: 40,
        borderWidth: 1.5,
        borderStyle: 'dashed',
    },
    logoutText: {
        marginLeft: 10,
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 0.5
    }
});