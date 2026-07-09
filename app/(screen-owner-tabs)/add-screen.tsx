import { AppTheme, Typography, useAppTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAddScreenForm } from '@/hooks/useAddScreenForm';

const VENUE_OPTIONS = [
    "Cinemas", "Co-Working Spaces", "Gyms & Fitness Centers", "Laundromat",
    "Lounges & Bars", "Music Studio", "Restaurants", "Supermarket & Shopping Malls",
    "Transit"
];

export default function AddScreenScreen() {
    // ─── Logic (all state + API calls live in the hook) ───────────────────
    const {
        form, extra, customVenueType, setCustomVenueType,
        mediaFiles, loading, fetchingDraft, params,
        pickerVisible, setPickerVisible, pickerData, openDropdown,
        handleFormChange, handleExtraChange,
        pickMedia, removeMedia,
        handleSaveDraft, submitScreen,
    } = useAddScreenForm();

    // ─── UI-only concerns ──────────────────────────────────────────────────
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isTablet = width >= 600;
    const [inputContentHeight, setInputContentHeight] = useState(100);

    const ownerTint = theme.brandNavy;
    const router = useRouter();
    const styles = useMemo(
        () => createStyles(theme, isTablet, insets, ownerTint),
        [theme, isTablet, insets, ownerTint]
    );

    // ─── Loading state while draft data is being fetched ──────────────────
    if (fetchingDraft) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={ownerTint} />
                <Text style={{ marginTop: 10, color: theme.textSecondary, fontWeight: '600' }}>
                    Loading your draft...
                </Text>
            </View>
        );
    }

    // ─── Reusable input renderers (UI helpers — not business logic) ────────
    const renderInput = (
        placeholder: string,
        value: string,
        onChangeText: (val: string) => void,
        multiline = false,
        keyboardType: any = 'default',
        customOverrideStyle: any = null,
        onContentSizeChange: any = null
    ) => (
        <TextInput
            style={[
                styles.input,
                multiline && styles.textArea,
                customOverrideStyle,
                { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            multiline={multiline}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            textAlignVertical={multiline ? 'top' : 'center'}
            onContentSizeChange={onContentSizeChange}
        />
    );

    const renderSelectButton = (label: string, value: string, onPress: () => void) => (
        <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{label} *</Text>
            <TouchableOpacity
                style={[styles.input, styles.selectInput, { backgroundColor: theme.background, borderColor: theme.border }]}
                activeOpacity={0.7}
                onPress={onPress}
            >
                <Text style={{ color: value ? theme.text : theme.textSecondary }}>
                    {value || '– Select Options –'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 42 }]}>
                <TouchableOpacity
                    onPress={() => router.replace('/(screen-owner-tabs)/dashboard')}
                    style={styles.closeBtn}
                >
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {params.draftId && params.draftId !== 'NEW' ? 'Continue Setup' : 'Add New Screen'}
                </Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={[styles.container, { backgroundColor: theme.cardSoft }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Venue Title */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Venue Title *</Text>
                    {renderInput('e.g. BODY LOVE GYM, OGBA, LAGOS', form.name, (val) => handleFormChange('name', val))}
                </View>

                {/* Screen Emails */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Screen Emails *</Text>
                    {renderInput('Enter multiple emails separated by commas', extra.emails, (val) => handleExtraChange('emails', val))}
                    <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                        {'e.g. screen1@mail.com, screen2@mail.com'}
                    </Text>
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Basic Description *</Text>
                    {renderInput(
                        'Short description of the venue...',
                        extra.description,
                        (val) => handleExtraChange('description', val),
                        true,
                        'default',
                        { height: Math.max(100, inputContentHeight) },
                        (e: any) => setInputContentHeight(e.nativeEvent.contentSize.height)
                    )}
                </View>

                {/* Venue Category */}
                {renderSelectButton('Venue Category', form.venueType, () =>
                    openDropdown('Venue Category', [...VENUE_OPTIONS, 'Other'], (val) => handleFormChange('venueType', val))
                )}

                {form.venueType === 'Other' && (
                    <View style={[styles.formGroup, { marginTop: -4, marginBottom: 16 }]}>
                        <Text style={[styles.label, { color: theme.text }]}>Custom Venue Category *</Text>
                        {renderInput('e.g. Football Pitch, Beach, Event Hall', customVenueType, setCustomVenueType)}
                    </View>
                )}

                {/* Country & State */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        {renderSelectButton('Country', extra.country, () =>
                            openDropdown('Country', ['Nigeria', 'Ghana', 'Kenya', 'United Kingdom'], (val) => handleExtraChange('country', val))
                        )}
                    </View>
                    <View style={styles.col}>
                        {renderSelectButton('State', form.state, () =>
                            openDropdown('State', ['Lagos', 'Abuja (FCT)', 'Oyo', 'Rivers', 'Kano', 'Delta'], (val) => handleFormChange('state', val))
                        )}
                    </View>
                </View>

                {/* City & Address */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>City *</Text>
                        {renderInput('e.g. Ikeja', form.city, (val) => handleFormChange('city', val))}
                    </View>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Full Address *</Text>
                        {renderInput('123 Example St', form.address, (val) => handleFormChange('address', val))}
                    </View>
                </View>

                {/* ── Location Insights ── */}
                <View style={styles.sectionDivider} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Location Insights</Text>
                <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
                    {"Please complete all details based on your venue's activity metrics."}
                </Text>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Average Monthly Visitors *</Text>
                        {renderInput('e.g. 5000', form.dailyTraffic, (val) => handleFormChange('dailyTraffic', val), false, 'numeric')}
                    </View>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Target Audience *</Text>
                        {renderInput('e.g. Young professionals', form.targetAudience, (val) => handleFormChange('targetAudience', val))}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Weekdays Hours *</Text>
                        {renderInput('e.g. 9:00 AM - 6:00 PM', extra.weekdaysHours, (val) => handleExtraChange('weekdaysHours', val))}
                    </View>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Weekends Hours *</Text>
                        {renderInput('e.g. 10:00 AM - 4:00 PM', extra.weekendsHours, (val) => handleExtraChange('weekendsHours', val))}
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Age Range *</Text>
                        {renderInput('e.g. 25 - 60', extra.ageRange, (val) => handleExtraChange('ageRange', val))}
                    </View>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: theme.text }]}>Average Dwell Time *</Text>
                        {renderInput('e.g. 2 Hours', extra.dwellTime, (val) => handleExtraChange('dwellTime', val))}
                    </View>
                </View>

                {/* ── Screen & Media Info ── */}
                <View style={styles.sectionDivider} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Screen & Media Info</Text>

                <View style={styles.row3}>
                    <View style={styles.col3}>
                        {renderSelectButton('No. of Screens', extra.screenCount, () =>
                            openDropdown('No. of Screens', ['1', '2', '3', '4', '5', '6+'], (val) => handleExtraChange('screenCount', val))
                        )}
                    </View>
                    <View style={styles.col3}>
                        <Text style={[styles.label, { color: theme.text }]}>Dimensions *</Text>
                        {renderInput('e.g. 1920x1080', form.resolution, (val) => handleFormChange('resolution', val))}
                    </View>
                    <View style={styles.col3}>
                        {renderSelectButton('Orientation', extra.orientation, () =>
                            openDropdown('Orientation', ['Landscape', 'Portrait'], (val) => handleExtraChange('orientation', val))
                        )}
                    </View>
                </View>

                {/* ── Gender Demographic ── */}
                <View style={styles.sectionDivider} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Gender Demographic</Text>
                <View style={styles.row}>
                    <View style={styles.col}>
                        {renderSelectButton('Male Percentage', extra.malePercentage, () =>
                            openDropdown('Male Percentage', ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%'], (val) => handleExtraChange('malePercentage', val))
                        )}
                    </View>
                    <View style={styles.col}>
                        {renderSelectButton('Female Percentage', extra.femalePercentage, () =>
                            openDropdown('Female Percentage', ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%'], (val) => handleExtraChange('femalePercentage', val))
                        )}
                    </View>
                </View>

                {/* ── Pricing ── */}
                <View style={styles.sectionDivider} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Pricing Structures (₦)</Text>
                <View style={styles.row3}>
                    {(['priceDaily', 'priceWeekly', 'priceMonthly'] as const).map((key, i) => (
                        <View key={key} style={styles.col3}>
                            <Text style={[styles.label, { color: theme.text }]}>
                                {['Daily Price *', 'Weekly Price *', 'Monthly Price *'][i]}
                            </Text>
                            {renderInput(
                                ['e.g. 15000', 'e.g. 75000', 'e.g. 250000'][i],
                                extra[key],
                                (val) => handleExtraChange(key, val),
                                false,
                                'numeric'
                            )}
                        </View>
                    ))}
                </View>

                {/* ── Media Upload ── */}
                <View style={styles.sectionDivider} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Upload Venue Media *</Text>
                <View style={styles.uploadRow}>
                    {mediaFiles.map((file, index) => (
                        <View key={index} style={[styles.uploadBox, { borderColor: theme.border }]}>
                            {file.type === 'image' ? (
                                <Image source={{ uri: file.uri }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.videoPreviewPlaceholder}>
                                    <Ionicons name="videocam" size={26} color={ownerTint} />
                                    <Text style={styles.videoText} numberOfLines={1}>Video</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.removeBadge} onPress={() => removeMedia(index)}>
                                <Ionicons name="close-circle" size={18} color={theme.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {mediaFiles.length < 5 && (
                        <TouchableOpacity
                            style={[styles.uploadBox, { borderColor: theme.border, borderStyle: 'dashed' }]}
                            activeOpacity={0.6}
                            onPress={pickMedia}
                        >
                            <Ionicons name="cloud-upload-outline" size={24} color={theme.textSecondary} />
                            <Text style={[styles.uploadText, { color: theme.textSecondary }]}>Add File</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Action Buttons ── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.draftBtn, { backgroundColor: theme.tint }]}
                        activeOpacity={0.8}
                        onPress={handleSaveDraft}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.draftBtnText}>Save as Draft</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: ownerTint }]}
                        activeOpacity={0.8}
                        onPress={submitScreen}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.submitBtnText}>Submit Screen</Text>
                        }
                    </TouchableOpacity>
                </View>

                <View style={{ height: insets.bottom + 60 }} />
            </ScrollView>

            {/* ── Dropdown Picker Modal ── */}
            <Modal
                visible={pickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.pickerSheet, { backgroundColor: theme.card }]}>
                        <View style={styles.pickerHeader}>
                            <Text style={[styles.pickerTitle, { color: theme.text }]}>{pickerData.title}</Text>
                            <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                <Ionicons name="close" size={22} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={pickerData.options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, { borderBottomColor: theme.border }]}
                                    onPress={() => {
                                        pickerData.onSelect(item);
                                        setPickerVisible(false);
                                    }}
                                >
                                    <Text style={[styles.optionText, { color: theme.text }]}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: AppTheme, isTablet: boolean, insets: any, ownerTint: string) =>
    StyleSheet.create({
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
        closeBtn: { padding: 4 },
        headerTitle: { ...Typography.h3, fontWeight: '700' },
        container: { flex: 1 },
        contentContainer: { padding: 20 },
        formGroup: { marginBottom: 16 },
        label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
        helperText: { fontSize: 11, marginTop: 6 },
        input: { height: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, justifyContent: 'center' },
        textArea: { padding: 14, minHeight: 100 },
        selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        sectionDivider: { height: 1, backgroundColor: theme.border, marginVertical: 32 },
        sectionTitle: { ...Typography.h3, fontWeight: '700', marginBottom: 8 },
        sectionDesc: { fontSize: 12, marginBottom: 16, lineHeight: 18 },
        row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
        col: { flex: 1 },
        row3: { flexDirection: 'row', gap: 10, marginBottom: 12 },
        col3: { flex: 1 },
        uploadRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        uploadBox: { width: isTablet ? 120 : 100, height: isTablet ? 100 : 90, borderWidth: 1.5, borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
        previewImage: { width: '100%', height: '100%', borderRadius: 10 },
        videoPreviewPlaceholder: { alignItems: 'center', justifyContent: 'center' },
        videoText: { fontSize: 10, marginTop: 4, width: 80, textAlign: 'center' },
        removeBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 10, zIndex: 10 },
        uploadText: { fontSize: 11, marginTop: 6 },
        footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 48, paddingTop: 24, borderTopWidth: 1, borderTopColor: theme.border, gap: 12 },
        draftBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, minWidth: 140, alignItems: 'center' },
        draftBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
        submitBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, minWidth: 140, alignItems: 'center' },
        submitBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        pickerSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '50%' },
        pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
        pickerTitle: { fontSize: 16, fontWeight: '700' },
        optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
        optionText: { fontSize: 15, fontWeight: '500' },
    });