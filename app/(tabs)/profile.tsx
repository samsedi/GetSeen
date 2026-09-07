import React, { useMemo, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    useColorScheme,
    ActivityIndicator,
    RefreshControl,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useFocusEffect, useRouter } from "expo-router";

import ProfileHeader from '@/components/ProfileScreenComponents/ProfileHeader';
import ProfileHero from '@/components/ProfileScreenComponents/ProfileHero';
import StatsCard from '@/components/ProfileScreenComponents/StatsCard';
import ProfileInfoTile from '@/components/ProfileScreenComponents/ProfileInfoTile';
import SupportButton from '@/components/ProfileScreenComponents/SupportButton';

import { fetchProfile, ProfileData } from '@/api/profileService';
import { clearCache } from '@/api/cacheService';

export default function ProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const router = useRouter();

    const { logout, role } = useAuthStore();
    const activeTint = theme.tint;

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);
    
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Instantly dump local state if user logs out (role becomes null)
    React.useEffect(() => {
        if (!role) setProfile(null);
    }, [role]);

    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                try {
                    const data = await fetchProfile(role || 'advertiser');
                    setProfile(data);
                } catch (error) {
                    console.error("Failed to load profile", error);
                } finally {
                    setLoading(false);
                }
            };
            loadProfile();
        }, [role])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        clearCache(`profile_${role || 'advertiser'}`);
        try {
            const data = await fetchProfile(role || 'advertiser');
            setProfile(data);
        } catch (error) {
            console.error("Failed to refresh profile", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/2347076267899').catch(err => console.error('An error occurred', err));
    };

    const handleEmail = () => {
        Linking.openURL('mailto:info@trygetseen.com');
    };

    const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Loading...';
    const companyName = profile?.business_name || 'Not Set';
    
    const getInitials = (first?: string, last?: string, biz?: string) => {
        if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
        if (first) return first.substring(0, 2).toUpperCase();
        if (biz) return biz.substring(0, 2).toUpperCase();
        return 'US';
    };
    const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${getInitials(profile?.first_name, profile?.last_name, profile?.business_name)}&background=random&length=2`;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ProfileHeader title="Profile" tintColor={activeTint} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTint} />
                }
            >
                {/* Hero Section */}
                <ProfileHero
                    name={displayName}
                            company={companyName}
                            imageUrl={avatarUrl}
                            badgeLabel="ADVERTISER"
                            tintColor={activeTint}
                            onEditPress={() => router.push('/profile-subscreens/edit')}
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
                                <TouchableOpacity activeOpacity={0.6} onPress={() => router.push('/profile-subscreens/edit')}>
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
                                    <ProfileInfoTile label="Reg No." value={profile?.business_reg_no || 'Not set'} />
                                </View>
                                <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Industry" value={profile?.industry || 'Not set'} />
                                    <ProfileInfoTile label="Country ID" value={profile?.country_id ? `${profile.country_id}` : 'Not set'} />
                                </View>
                            </View>

                            {/* CONTACT INFORMATION */}
                            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Contact Information</Text>
                            <View style={[
                                styles.infoCard,
                                { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F9FAFB' }
                            ]}>
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Email" value={profile?.email || 'Not set'} />
                                    <ProfileInfoTile label="Phone" value={profile?.phone || 'Not set'} />
                                </View>
                            </View>

                            {/* SOCIAL MEDIA */}
                            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Social Media</Text>
                            <View style={[
                                styles.infoCard,
                                { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F9FAFB' }
                            ]}>
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Instagram" value={profile?.ig_url ? 'Linked' : 'Not set'} icon={<Ionicons name="logo-instagram" size={18} color={theme.tint} />} />
                                    <ProfileInfoTile label="Facebook" value={profile?.fb_url ? 'Linked' : 'Not set'} icon={<Ionicons name="logo-facebook" size={18} color={theme.tint} />} />
                                </View>
                                <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="TikTok" value={profile?.tiktok_url ? 'Linked' : 'Not set'} icon={<Ionicons name="logo-tiktok" size={18} color={theme.tint} />} />
                                    <ProfileInfoTile label="" value="" />
                                </View>
                            </View>
                        </View>



                {/* SUPPORT & FEEDBACK SECTION */}
                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24, marginBottom: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
                        Support & Feedback
                    </Text>

                    <SupportButton
                        label="Help & Support"
                        icon={<Ionicons name="headset-outline" size={isTablet ? 24 : 20} color={activeTint} />}
                        bgColor={colorScheme === 'dark' ? '#2A181C' : '#FEE2E9'}
                        tintColor={activeTint}
                        onPress={() => router.push('/profile-subscreens/support')}
                    />
                </View>


                {/* LOGOUT BUTTON */}
                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: activeTint + '30' }]}
                    onPress={() => {
                        logout();
                        router.push("/(auth)/roles");
                    }}
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