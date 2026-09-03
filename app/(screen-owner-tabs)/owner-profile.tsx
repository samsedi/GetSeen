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
import { useRouter, useFocusEffect } from 'expo-router';

import ProfileHeader from '@/components/ProfileScreenComponents/ProfileHeader';
import ProfileHero from '@/components/ProfileScreenComponents/ProfileHero';
import ProfileInfoTile from '@/components/ProfileScreenComponents/ProfileInfoTile';
import SupportButton from '@/components/ProfileScreenComponents/SupportButton';

import { fetchProfile, ProfileData } from '@/api/profileService';
import { clearCache } from '@/api/cacheService';
import { useDashboard } from '@/hooks/useDashboard';

export default function OwnerProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const router = useRouter();
    const { logout, role } = useAuthStore();
    const ownerTint = theme.brandNavy;

    const styles = useMemo(() => createStyles(isTablet, theme), [isTablet, theme]);
    
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { stats, loading: dashboardLoading } = useDashboard();

    // Instantly dump local state if user logs out (role becomes null)
    React.useEffect(() => {
        if (!role) setProfile(null);
    }, [role]);

    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                try {
                    const data = await fetchProfile(role || 'owner');
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
        clearCache(`profile_${role || 'owner'}`);
        try {
            const data = await fetchProfile(role || 'owner');
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

    const companyName = profile?.company_name || 'Loading...';

    const getInitials = (company?: string) => {
        if (!company) return 'OW';
        const parts = company.trim().split(/\s+/);
        if (parts.length > 1) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        return company.substring(0, 2).toUpperCase();
    };
    const avatarUrl = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${getInitials(profile?.company_name)}&background=random&length=2`;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ProfileHeader title="Profile" tintColor={ownerTint} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ownerTint} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color={ownerTint} style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <ProfileHero
                            name={companyName}
                            company="Screen Network Owner"
                            imageUrl={avatarUrl}
                            badgeLabel="SCREEN OWNER"
                            tintColor={ownerTint}
                            onEditPress={() => router.push('/profile-subscreens/owner-edit')}
                        />

                        <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24 }]}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Info</Text>
                                <TouchableOpacity activeOpacity={0.6} onPress={() => router.push('/profile-subscreens/owner-edit')}>
                                    <Text style={[styles.editText, { color: ownerTint }]}>EDIT</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[
                                styles.infoCard,
                                { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F9FAFB' }
                            ]}>
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Industry" value={profile?.industry || 'Not set'} />
                                    <ProfileInfoTile label="Reg No" value={profile?.business_reg_no || 'Not set'} />
                                </View>
                                <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile
                                        label="Verification"
                                        value="Verified Partner"
                                        icon={<Ionicons name="shield-checkmark" size={18} color="#1E7E34" />}
                                    />
                                    <ProfileInfoTile label="Phone" value={profile?.phone || 'Not set'} />
                                </View>
                            </View>

                            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24, marginBottom: 16 }]}>Bank Details</Text>
                            <View style={[
                                styles.infoCard,
                                { backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#F9FAFB' }
                            ]}>
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Bank Name" value={profile?.bank_name || 'Not set'} />
                                    <ProfileInfoTile label="Account No" value={profile?.account_number || 'Not set'} />
                                </View>
                                <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                                <View style={styles.infoRow}>
                                    <ProfileInfoTile label="Account Name" value={profile?.account_name || 'Not set'} />
                                    <ProfileInfoTile label="Total Screens" value={dashboardLoading ? "Loading..." : `${stats.activeScreens} Active`} />
                                </View>
                            </View>

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
                    </>
                )}



                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24, marginBottom: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
                        Support & Feedback
                    </Text>

                    <SupportButton
                        label="Contact Support"
                        icon={<Ionicons name="logo-whatsapp" size={isTablet ? 24 : 20} color={ownerTint} />}
                        bgColor={colorScheme === 'dark' ? '#1E2430' : '#EAEFF8'}
                        tintColor={ownerTint}
                        onPress={handleWhatsApp}
                    />

                    <SupportButton
                        label="Report a Bug"
                        icon={<Ionicons name="mail-outline" size={isTablet ? 24 : 20} color={ownerTint} />}
                        bgColor={colorScheme === 'dark' ? '#1C1C1E' : '#F3F4F6'}
                        tintColor={ownerTint}
                        onPress={handleEmail}
                    />
                </View>


                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: ownerTint + '30' }]}
                    onPress={() => {
                        logout();
                        router.push("/(auth)/roles");
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={ownerTint} />
                    <Text style={[styles.logoutText, { color: ownerTint }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any) => StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    section: { marginTop: 35 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: isTablet ? 24 : 20, fontWeight: '900', letterSpacing: -0.5 },
    editText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    infoCard: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    divider: { height: 1, width: '100%', marginVertical: 4 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingVertical: 16, marginHorizontal: isTablet ? 40 : 24, borderRadius: 40, borderWidth: 1.5, borderStyle: 'dashed' },
    logoutText: { marginLeft: 10, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }
});
