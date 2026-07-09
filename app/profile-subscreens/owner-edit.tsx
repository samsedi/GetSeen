import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    ActivityIndicator,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAppTheme } from '@/constants/theme';
import { AuthInputField } from '@/components/AuthComponents/AuthInputField';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/api/profileService';

export default function OwnerEditProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const role = useAuthStore(state => state.role);
    
    const activeTint = theme.brandNavy;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageUrl, setImageUrl] = useState("https://i.pravatar.cc/300");
    const [form, setForm] = useState({
        companyName: '',
        phoneNumber: '',
        businessRegNo: '',
        industry: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        facebook: '',
        instagram: '',
        tiktok: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchProfile(role || 'owner');
                setForm({
                    companyName: data.companyName || '',
                    phoneNumber: data.phoneNumber || '',
                    businessRegNo: data.businessRegNo || data.taxId || '',
                    industry: data.industry || data.category || '',
                    bankName: data.bankName || '',
                    accountNumber: data.accountNumber || '',
                    accountName: data.accountName || '',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    tiktok: data.tiktok || ''
                });
                if (data.avatarUrl) {
                    setImageUrl(data.avatarUrl);
                } else {
                    setImageUrl("https://ui-avatars.com/api/?name=" + (data.companyName || 'Owner') + "&background=random");
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setFetching(false);
            }
        };
        loadProfile();
    }, [role]);

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                setLoading(true);
                const newAvatarUri = result.assets[0].uri;
                const data = await uploadAvatar(role || 'owner', newAvatarUri);
                setImageUrl(data.avatarUrl || newAvatarUri);
                useAlertStore.getState().showAlert("Success", "Profile picture updated successfully.");
            } catch (error) {
                console.error("Upload error:", error);
                useAlertStore.getState().showAlert("Error", "Failed to upload picture.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(role || 'owner', {
                companyName: form.companyName,
                phoneNumber: form.phoneNumber,
                businessRegNo: form.businessRegNo,
                industry: form.industry,
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                accountName: form.accountName,
                facebook: form.facebook,
                instagram: form.instagram,
                tiktok: form.tiktok,
            });
            useAlertStore.getState().showAlert("Success", "Profile updated successfully.");
            router.back();
        } catch (error) {
            console.error("Failed to update profile:", error);
            useAlertStore.getState().showAlert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={activeTint} />
            </SafeAreaView>
        );
    }

    const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: activeTint }]}>{title}</Text>
            {subtitle && <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={26} color={theme.text} />
                </TouchableOpacity>
                <View style={{position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1}}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Update Profile</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: imageUrl }} style={styles.avatar} />
                        <TouchableOpacity 
                            style={[styles.editBadge, { backgroundColor: activeTint, borderColor: theme.background }]} 
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* BASIC INFORMATION */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Basic Information" />
                    <View style={styles.formGroup}>
                        <AuthInputField
                            label="Company Name"
                            value={form.companyName}
                            onChangeText={(val) => setForm({ ...form, companyName: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Phone Number"
                            value={form.phoneNumber}
                            keyboardType="phone-pad"
                            onChangeText={(val) => setForm({ ...form, phoneNumber: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    </View>
                </View>

                {/* BUSINESS DETAILS */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Business Details" />
                    <View style={styles.formGroup}>
                        <AuthInputField
                            label="Business Reg No"
                            value={form.businessRegNo}
                            onChangeText={(val) => setForm({ ...form, businessRegNo: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Industry"
                            value={form.industry}
                            onChangeText={(val) => setForm({ ...form, industry: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            placeholder="e.g. Retail, Fitness, Real Estate"
                        />
                    </View>
                </View>

                {/* BANK DETAILS */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Bank Details" />
                    <View style={styles.formGroup}>
                        <AuthInputField
                            label="Bank Name"
                            value={form.bankName}
                            onChangeText={(val) => setForm({ ...form, bankName: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Account Number"
                            value={form.accountNumber}
                            keyboardType="numeric"
                            onChangeText={(val) => setForm({ ...form, accountNumber: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Account Name"
                            value={form.accountName}
                            onChangeText={(val) => setForm({ ...form, accountName: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    </View>
                </View>

                {/* SOCIAL MEDIA LINKS */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Social Media Links" subtitle="Update your social media URLs (optional)" />
                    <View style={styles.formGroup}>
                        <AuthInputField
                            label="Facebook"
                            value={form.facebook}
                            onChangeText={(val) => setForm({ ...form, facebook: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-facebook" size={18} color={theme.textSecondary} />}
                            placeholder="https://facebook.com/..."
                        />
                        <AuthInputField
                            label="Instagram"
                            value={form.instagram}
                            onChangeText={(val) => setForm({ ...form, instagram: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-instagram" size={18} color={theme.textSecondary} />}
                            placeholder="https://instagram.com/..."
                        />
                        <AuthInputField
                            label="TikTok"
                            value={form.tiktok}
                            onChangeText={(val) => setForm({ ...form, tiktok: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-tiktok" size={18} color={theme.textSecondary} />}
                            placeholder="https://tiktok.com/@..."
                        />
                    </View>
                </View>

            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: activeTint }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    backButton: { padding: 5, zIndex: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
    
    avatarContainer: { alignItems: 'center', marginBottom: 25 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    
    sectionCard: { marginBottom: 30 },
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    sectionSubtitle: { fontSize: 13 },
    
    formGroup: { gap: 15 },
    
    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, gap: 12 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontWeight: '600', fontSize: 15 },
    saveBtn: { flex: 2, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
