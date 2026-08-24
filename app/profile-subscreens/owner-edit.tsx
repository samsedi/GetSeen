import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchProfile, updateProfile, uploadAvatar } from '@/api/profileService';
import { AuthInputField } from '@/components/AuthComponents/AuthInputField';
import { useAppTheme } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/useAlertStore';
import { useFormCacheStore } from '@/store/useFormCacheStore';

export default function OwnerEditProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const role = useAuthStore(state => state.role);

    const activeTint = theme.brandNavy;

    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [imageUrl, setImageUrl] = useState("https://i.pravatar.cc/300");
    const [form, setForm] = useState(() => {
        const cached = useFormCacheStore.getState().cache['ownerProfileEdit'];
        return cached || {
            company_name: '',
            phone: '',
            business_reg_no: '',
            industry: '',
            bank_name: '',
            account_number: '',
            account_name: '',
            fb_url: '',
            ig_url: '',
            tiktok_url: ''
        };
    });

    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        useFormCacheStore.getState().setFormCache('ownerProfileEdit', form);
    }, [form]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchProfile(role || 'owner');
                const cached = useFormCacheStore.getState().cache['ownerProfileEdit'];
                if (!cached) {
                    setForm({
                        company_name: data.company_name || '',
                        phone: data.phone || '',
                        business_reg_no: data.business_reg_no || '',
                        industry: data.industry || '',
                        bank_name: data.bank_name || '',
                        account_number: data.account_number || '',
                        account_name: data.account_name || '',
                        fb_url: data.fb_url || '',
                        ig_url: data.ig_url || '',
                        tiktok_url: data.tiktok_url || ''
                    });
                }
                if (data.avatarUrl) {
                    setImageUrl(data.avatarUrl);
                } else {
                    const getInitials = (company?: string) => {
                        if (!company) return 'OW';
                        const parts = company.trim().split(/\s+/);
                        if (parts.length > 1) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
                        return company.substring(0, 2).toUpperCase();
                    };
                    setImageUrl(`https://ui-avatars.com/api/?name=${getInitials(data.company_name)}&background=random&length=2`);
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
            allowsEditing: false,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                setIsUploading(true);
                setUploadProgress(0);
                const newAvatarUri = result.assets[0].uri;
                const data = await uploadAvatar(role || 'owner', newAvatarUri, (progress) => {
                    setUploadProgress(progress);
                });
                setImageUrl(data.avatarUrl || newAvatarUri);
                useAlertStore.getState().showAlert("Success", "Profile picture updated successfully.");
            } catch (error) {
                console.error("Upload error:", error);
                useAlertStore.getState().showAlert("Error", "Failed to upload picture.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(role || 'owner', {
                company_name: form.company_name,
                phone: form.phone,
                business_reg_no: form.business_reg_no,
                industry: form.industry,
                bank_name: form.bank_name,
                account_number: form.account_number,
                account_name: form.account_name,
                fb_url: form.fb_url,
                ig_url: form.ig_url,
                tiktok_url: form.tiktok_url,
            });
            useFormCacheStore.getState().clearFormCache('ownerProfileEdit');
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
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Update Profile</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: imageUrl }} style={styles.avatar} />
                        {isUploading && (
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: 60 }]}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{uploadProgress}%</Text>
                            </View>
                        )}
                        {!isUploading && (
                            <TouchableOpacity
                                style={[styles.editBadge, { backgroundColor: activeTint, borderColor: theme.background }]}
                                onPress={handlePickImage}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="camera" size={16} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* BASIC INFORMATION */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Basic Information" />
                    <View style={styles.formGroup}>
                        <AuthInputField
                            label="Company Name"
                            value={form.company_name}
                            onChangeText={(val) => setForm({ ...form, company_name: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Phone Number"
                            value={form.phone}
                            keyboardType="phone-pad"
                            maxLength={form.phone?.startsWith('+234') ? 14 : form.phone?.startsWith('0') ? 11 : 15}
                            onChangeText={(val) => setForm({ ...form, phone: val })}
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
                            value={form.business_reg_no}
                            onChangeText={(val) => setForm({ ...form, business_reg_no: val })}
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
                            value={form.bank_name}
                            onChangeText={(val) => setForm({ ...form, bank_name: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Account Number"
                            value={form.account_number}
                            keyboardType="numeric"
                            onChangeText={(val) => setForm({ ...form, account_number: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            label="Account Name"
                            value={form.account_name}
                            onChangeText={(val) => setForm({ ...form, account_name: val })}
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
                            value={form.fb_url}
                            onChangeText={(val) => setForm({ ...form, fb_url: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-facebook" size={18} color={theme.textSecondary} />}
                            placeholder="https://facebook.com/..."
                        />
                        <AuthInputField
                            label="Instagram"
                            value={form.ig_url}
                            onChangeText={(val) => setForm({ ...form, ig_url: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-instagram" size={18} color={theme.textSecondary} />}
                            placeholder="https://instagram.com/..."
                        />
                        <AuthInputField
                            label="TikTok"
                            value={form.tiktok_url}
                            onChangeText={(val) => setForm({ ...form, tiktok_url: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                            icon={<Ionicons name="logo-tiktok" size={18} color={theme.textSecondary} />}
                            placeholder="https://tiktok.com/@..."
                        />
                    </View>
                </View>

                {/* SECURITY */}
                <View style={styles.sectionCard}>
                    <SectionHeader title="Security" />
                    <TouchableOpacity 
                        style={[styles.changePasswordBtn, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5' }]} 
                        onPress={() => router.push('/profile-subscreens/change-password')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="lock-closed-outline" size={20} color={activeTint} />
                        <Text style={[styles.changePasswordText, { color: activeTint }]}>Change Password</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAwareScrollView>

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
    changePasswordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
    changePasswordText: { fontWeight: '600', fontSize: 16, marginLeft: 8 },

    footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, gap: 12 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontWeight: '600', fontSize: 15 },
    saveBtn: { flex: 2, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
