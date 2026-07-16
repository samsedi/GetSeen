import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useAppTheme } from '@/constants/theme';
import { AuthInputField } from '@/components/AuthComponents/AuthInputField';
import { useAlertStore } from '@/store/useAlertStore';
import { useAuthStore } from '@/store/authStore';
import { fetchProfile, updateProfile, uploadAvatar } from '@/api/profileService';
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
            firstName: '',
            lastName: '',
            companyName: '',
            phone: '',
            city: '',
            country: '',
            category: '',
            taxId: '',
            bankDetails: ''
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
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        companyName: data.companyName || '',
                        phone: data.phoneNumber || '',
                        city: data.city || '',
                        country: data.country || '',
                        category: data.category || '',
                        taxId: data.taxId || '',
                        bankDetails: data.bankDetails || ''
                    });
                }
                if (data.avatarUrl) {
                    setImageUrl(data.avatarUrl);
                } else {
                    setImageUrl("https://ui-avatars.com/api/?name=" + (data.firstName || data.companyName || 'User') + "&background=random");
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
                firstName: form.firstName,
                lastName: form.lastName,
                companyName: form.companyName,
                phoneNumber: form.phone,
                city: form.city,
                country: form.country,
                category: form.category,
                taxId: form.taxId,
                bankDetails: form.bankDetails
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
                <View style={{position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: -1}}>
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
                                value={form.firstName}
                                onChangeText={(val) => setForm({ ...form, firstName: val })}
                                inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                                labelColor={theme.text}
                                textColor={theme.text}
                                borderColor={theme.border}
                            />
                            <AuthInputField
                                containerStyle={{ flex: 1 }}
                                label="Last Name"
                                value={form.lastName}
                                onChangeText={(val) => setForm({ ...form, lastName: val })}
                                inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                                labelColor={theme.text}
                                textColor={theme.text}
                                borderColor={theme.border}
                            />
                        </View>
                    )}

                    <AuthInputField
                        label={role === 'owner' ? "Company / Venue Name" : "Business Name (Optional)"}
                        value={form.companyName}
                        onChangeText={(val) => setForm({ ...form, companyName: val })}
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
                            label="City"
                            value={form.city}
                            onChangeText={(val) => setForm({ ...form, city: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                        <AuthInputField
                            containerStyle={{ flex: 1 }}
                            label="Country"
                            value={form.country}
                            onChangeText={(val) => setForm({ ...form, country: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    </View>

                    <AuthInputField
                        label="Tax ID"
                        value={form.taxId}
                        onChangeText={(val) => setForm({ ...form, taxId: val })}
                        inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                        labelColor={theme.text}
                        textColor={theme.text}
                        borderColor={theme.border}
                    />

                    <AuthInputField
                        label="Business Category"
                        value={form.category}
                        onChangeText={(val) => setForm({ ...form, category: val })}
                        inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                        labelColor={theme.text}
                        textColor={theme.text}
                        borderColor={theme.border}
                    />

                    {role === 'owner' && (
                        <AuthInputField
                            label="Bank Details"
                            value={form.bankDetails}
                            onChangeText={(val) => setForm({ ...form, bankDetails: val })}
                            inputBgColor={colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF'}
                            labelColor={theme.text}
                            textColor={theme.text}
                            borderColor={theme.border}
                        />
                    )}
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
    footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
    saveBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
