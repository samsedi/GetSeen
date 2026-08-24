import { useCallback, useEffect, useState } from 'react';
import ownerScreenApi, { ScreenOptionsData } from '@/api/ownerScreenService';

const NIGERIA_COUNTRY_ID = 1;

export function useScreenOptions() {
    const [options, setOptions] = useState<ScreenOptionsData>({ categories: [], countries: [], states: [] });
    const [loading, setLoading] = useState(true);

    const loadStatesForCountry = useCallback(async (countryId: number) => {
        try {
            const data = await ownerScreenApi.getScreenOptions(countryId);
            setOptions(data);
        } catch {
            // Keep whatever options were already loaded; the picker just won't refresh.
        }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await ownerScreenApi.getScreenOptions(NIGERIA_COUNTRY_ID);
                setOptions(data);
            } catch {
                setOptions({ categories: [], countries: [], states: [] });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const categoryNames = options.categories.map((c) => c.name);
    const countryNames = options.countries.map((c) => c.name);
    const stateNames = options.states.map((s) => s.name);

    const findCategoryByName = (name: string) =>
        options.categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
    const findCountryByName = (name: string) =>
        options.countries.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
    const findStateByName = (name: string) =>
        options.states.find((s) => s.name.toLowerCase() === name.toLowerCase()) || null;

    return {
        options,
        loading,
        loadStatesForCountry,
        categoryNames,
        countryNames,
        stateNames,
        findCategoryByName,
        findCountryByName,
        findStateByName,
    };
}
