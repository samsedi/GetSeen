import { AddScreenForm, AddScreenExtra, LocalMediaFile } from './types';

export const parsePercentage = (val: string): number | undefined => {
    const n = parseInt(val.replace('%', '').trim(), 10);
    return Number.isNaN(n) ? undefined : n;
};

export const parseScreenCount = (val: string): number | undefined => {
    const n = parseInt(val.replace('+', '').trim(), 10);
    return Number.isNaN(n) ? undefined : n;
};

// Appends every snake_case metadata field the backend's create/update
// screen endpoints share (everything except `action` and images).
export const appendScreenMetadata = (
    formData: FormData,
    form: AddScreenForm,
    extra: AddScreenExtra,
    customVenueType: string
) => {
    const append = (key: string, value: string | number | undefined) => {
        if (value === undefined || value === '') return;
        formData.append(key, String(value));
    };

    append('title', form.name.trim());
    append('description', extra.description.trim());
    append('vendor_note', extra.vendorNote.trim());

    if (form.venueType === 'Other') {
        formData.append('category_id', 'custom');
        append('custom_category_name', customVenueType.trim());
    } else if (form.categoryId != null) {
        formData.append('category_id', String(form.categoryId));
    }

    if (form.countryId != null) formData.append('country_id', String(form.countryId));
    if (form.stateId != null) formData.append('state_id', String(form.stateId));
    append('address', form.address.trim());

    append('monthly_visitors', parseScreenCount(form.monthlyVisitors));
    append('weekdays_hours', extra.weekdaysHours.trim());
    append('weekends_hours', extra.weekendsHours.trim());
    append('age_range', extra.ageRange.trim());
    append('dwell_time', extra.dwellTime.trim());
    append('target_audience', form.targetAudience.trim());

    append('no_of_screens', parseScreenCount(extra.screenCount));
    append('dimensions', form.dimensions.trim());
    append('orientation', extra.orientation);

    append('male_percentage', parsePercentage(extra.malePercentage));
    append('female_percentage', parsePercentage(extra.femalePercentage));

    append('price', extra.priceDaily.trim());
    append('price_per_week', extra.priceWeekly.trim());
    append('price_per_month', extra.priceMonthly.trim());

    if (extra.emails.trim()) formData.append('screen_email', extra.emails.trim());
};

// Appends any locally-picked (not-yet-remote) media as image_1..image_5, in
// picker order. Existing remote images are never resubmitted here — those
// are managed one slot at a time via the dedicated image endpoints.
export const appendLocalMedia = (formData: FormData, mediaFiles: LocalMediaFile[]) => {
    mediaFiles
        .filter((f) => !f.isRemote)
        .slice(0, 5)
        .forEach((file, i) => {
            const ext = file.name.split('.').pop() || (file.type === 'video' ? 'mp4' : 'jpeg');
            const mime = file.type === 'video' ? `video/${ext}` : `image/${ext}`;
            formData.append(`image_${i + 1}`, {
                uri: file.uri,
                name: file.name.endsWith(ext) ? file.name : `${file.name}.${ext}`,
                type: mime,
            } as any);
        });
};
