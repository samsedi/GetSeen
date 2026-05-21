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
import { useAppTheme } from '@/constants/theme';
import { useRouter } from "expo-router";

import ProfileHeader from '@/components/ProfileScreenComponents/ProfileHeader';
import ProfileHero from '@/components/ProfileScreenComponents/ProfileHero';
import ProfileInfoTile from '@/components/ProfileScreenComponents/ProfileInfoTile';
import SupportButton from '@/components/ProfileScreenComponents/SupportButton';

export default function OwnerProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const router = useRouter();

    const { logout } = useAuthStore();
    const ownerTint = theme.brandNavy;

    const styles = useMemo(() => createStyles(isTablet, theme, ownerTint), [isTablet, theme, ownerTint]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ProfileHeader title="Profile" tintColor={ownerTint} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ProfileHero
                    name="Silverbird Venues"
                    company="Screen Network Owner"
                    imageUrl="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=1632&auto=format&fit=crop"
                    tintColor={ownerTint}
                />

                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Venue Details</Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Text style={[styles.editText, { color: ownerTint }]}>EDIT</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.cardSoft }]}>
                        <View style={styles.infoRow}>
                            <ProfileInfoTile
                                label="Verification"
                                value="Verified Venue"
                                icon={<Ionicons name="checkmark-circle" size={18} color={theme.success} />}
                            />
                            <ProfileInfoTile label="Bank Details" value="GTBank •••• 4590" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.textSecondary + '15' }]} />
                        <View style={styles.infoRow}>
                            <ProfileInfoTile label="Total Screens" value="12 Active" />
                            <ProfileInfoTile label="Location" value="Lagos, Nigeria" />
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { paddingHorizontal: isTablet ? 40 : 24, marginBottom: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 16 }]}>
                        Support & Feedback
                    </Text>

                    <SupportButton
                        label="Report an Issue"
                        iconName="ladybug"
                        isBug={true}
                        bgColor={theme.errorSoft}
                        tintColor={ownerTint}
                        onPress={() => console.log("Report Issue")}
                    />

                    <SupportButton
                        label="Help Center"
                        iconName="help-circle-outline"
                        bgColor={theme.secondaryBg}
                        tintColor={ownerTint}
                        onPress={() => console.log("Help Center")}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.logoutBtn, { borderColor: ownerTint + '30' }]}
                    onPress={() => router.push("/(auth)/roles")}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={ownerTint} />
                    <Text style={[styles.logoutText, { color: ownerTint }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const createStyles = (isTablet: boolean, theme: any, ownerTint: string) => StyleSheet.create({
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
