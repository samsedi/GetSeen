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

export default function EditProfileScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const theme = useAppTheme();
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();
    const role = useAuthStore(state => state.role);

    const activeTint = role === 'advertiser' ? theme.tint : theme.brandNavy;

    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [imageUrl, setImageUrl] = useState("https://i.pravatar.cc/300");
    const [form, setForm] = useState(() => {
        const cached = useFormCacheStore.getState().cache['profileEdit'];
        return cached || {
            first_name: '',
            last_name: '',
            business_name: '',
            business_reg_no: '',
            industry: '',
            phone: '',
            country_id: 234,
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
        useFormCacheStore.getState().setFormCache('profileEdit', form);
    }, [form]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchProfile(role || 'advertiser');
                const cached = useFormCacheStore.getState().cache['profileEdit'];
                if (!cached) {
                    setForm({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        business_name: data.business_name || '',
                        business_reg_no: data.business_reg_no || '',
                        industry: data.industry || '',
                        phone: data.phone || '',
                        country_id: data.country_id || 234,
                        fb_url: data.fb_url || '',
                        ig_url: data.ig_url || '',
                        tiktok_url: data.tiktok_url || ''
                    });
                }
                if (data.avatarUrl) {
                    setImageUrl(data.avatarUrl);
                } else {
                    const getInitials = (first?: string, last?: string, biz?: string) => {
                        if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
                        if (first) return first.substring(0, 2).toUpperCase();
                        if (biz) return biz.substring(0, 2).toUpperCase();
                        return 'US';
                    };
                    setImageUrl(`https://ui-avatars.com/api/?name=${getInitials(data.first_name, data.last_name, data.business_name)}&background=random&length=2`);
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
                const data = await uploadAvatar(role || 'advertiser', newAvatarUri, (progress) => {
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
            await updateProfile(role || 'advertiser', {
                first_name: form.first_name,
                last_name: form.last_name,
                business_name: form.business_name,
                business_reg_no: form.business_reg_no,
                industry: form.industry,
                phone: form.phone,
                country_id: form.country_id,
                fb_url: form.fb_url,
                ig_url: form.ig_url,
                tiktok_url: form.tiktok_url
            });
            useFormCacheStore.getState().clearFormCache('profileEdit');
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

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={activeTint} />
                </TouchableOpacity>
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
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
                    <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>Tap camera icon to change photo</Text>
                </View>

                <View style={styles.formContainer}>
                    {role === 'advertiser' && (
                        <View style={styles.row}>
                            <AuthInputField
                                containerStyle={{ flex: 1 }}
                                label="First Name"
                                value={form.first_name}
                                onChangeText={(val) => setForm({ ...form, first_name: val })}
                                inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                                labelColor={theme.text}
                                textColor={theme.text}
                                borderColor={theme.border}
                            />
                            <AuthInputField
                                containerStyle={{ flex: 1 }}
                                label="Last Name"
                                value={form.last_name}
                                onChangeText={(val) => setForm({ ...form, last_name: val })}
                                inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                                labelColor={theme.text}
                                textColor={theme.text}
                                borderColor={theme.border}
                            />
                        </View>
                    )}

                    <AuthInputField
                        label="Business Name (Optional)"
                        value={form.business_name}
                        onChangeText={(val) => setForm({ ...form, business_name: val })}
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

                    <View style={styles.row}>
                        <AuthInputField
                            containerStyle={{ flex: 1 }}
                            label="Business Reg No"
                            value={form.business_reg_no}
                            onChangeText={(val) => setForm({ ...form, business_reg_no: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            containerStyle={{ flex: 1 }}
                            label="Industry"
                            value={form.industry}
                            onChangeText={(val) => setForm({ ...form, industry: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    </View>

                    <View style={styles.row}>
                        <AuthInputField
                            containerStyle={{ flex: 1 }}
                            label="Facebook URL"
                            value={form.fb_url}
                            onChangeText={(val) => setForm({ ...form, fb_url: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            containerStyle={{ flex: 1 }}
                            label="Instagram URL"
                            value={form.ig_url}
                            onChangeText={(val) => setForm({ ...form, ig_url: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    </View>

                    <AuthInputField
                        label="Tiktok URL"
                        value={form.tiktok_url}
                        onChangeText={(val) => setForm({ ...form, tiktok_url: val })}
                        inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                        labelColor={theme.text}
                        textColor={theme.text}
                        borderColor={theme.border}
                    />

                </View>

            </KeyboardAwareScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 5, zIndex: 10 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    avatarHint: { marginTop: 12, fontSize: 13, fontWeight: '500' },
    formContainer: { gap: 15 },
    row: { flexDirection: 'row', gap: 15 },
    changePasswordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15, paddingVertical: 14, borderRadius: 12 },
    changePasswordText: { fontWeight: '600', fontSize: 16, marginLeft: 8 },
    footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
    saveBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
