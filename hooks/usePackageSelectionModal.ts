import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { useAlertStore } from '@/store/useAlertStore';
import { ScreenResponseDto } from '@/api/screenService';
import { useCartStore } from '@/store/useCartStore';
import cartService from '@/api/cartService';

const formatDateForDisplay = (date: Date): string => {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
};

const formatDateForBackend = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export interface GeneratedPackage {
    id: string;
    name: string;
    emoji: string;
    basePrice: number;
    days: number;
    features: string[];
}

export function usePackageSelectionModal(item: ScreenResponseDto | null, onClose: () => void) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { items, setCartData } = useCartStore();

    const isAlreadyInCart = useMemo(() => {
        if (!item) return false;
        return items.some(cartItem => cartItem.screenId === item.id);
    }, [items, item]);

    // DYNAMICALLY GENERATE PACKAGES BASED ON BACKEND PRICES
    const derivedPackages = useMemo<GeneratedPackage[]>(() => {
        if (!item) return [];
        const pkgs: GeneratedPackage[] = [];

        if (item.priceDaily) {
            pkgs.push({ id: 'daily', name: 'Daily Plan', emoji: '☀️', basePrice: item.priceDaily, days: 1, features: ['24-hour display loop', 'Standard priority'] });
        }
        if (item.priceWeekly) {
            pkgs.push({ id: 'weekly', name: 'Weekly Plan', emoji: '📅', basePrice: item.priceWeekly, days: 7, features: ['7-day continuous loop', 'Increased visibility'] });
        }
        if (item.priceMonthly) {
            pkgs.push({ id: 'monthly', name: 'Monthly Plan', emoji: '🏆', basePrice: item.priceMonthly, days: 30, features: ['Full month display', 'Highest priority looping', 'Analytics report'] });
        }

        return pkgs;
    }, [item]);

    const itemId = item?.id;

    useEffect(() => {
        if (derivedPackages.length) {
            setSelectedId(derivedPackages[0].id);
            setStartDate(new Date());
            setQuantity(1);
        }
    }, [itemId, derivedPackages]);

    // When the user switches between daily/weekly/monthly, reset quantity
    const handleSelectPackage = useCallback((id: string) => {
        setSelectedId(id);
        setQuantity(1);
    }, []);

    const selectedPkg = useMemo(
        () => derivedPackages.find((p) => p.id === selectedId) ?? null,
        [derivedPackages, selectedId],
    );

    const endDate = useMemo(() => {
        return selectedPkg
            ? addDays(startDate, selectedPkg.days * quantity)
            : startDate;
    }, [startDate, selectedPkg, quantity]);

    const handleDateChange = useCallback((_: any, date?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (date) setStartDate(date);
    }, []);

    const incrementQuantity = useCallback(() => {
        setQuantity((prev) => Math.min(prev + 1, 30)); // Cap at 30 for safety
    }, []);

    const decrementQuantity = useCallback(() => {
        setQuantity((prev) => Math.max(prev - 1, 1));
    }, []);

    const handleAddToCart = useCallback(async () => {
        if (!item || !selectedPkg || isAlreadyInCart) return;
        try {
            const data = {
                screenId: item.id,
                startDate: formatDateForBackend(startDate),
                endDate: formatDateForBackend(endDate),
            };
            const formData = cartService.buildAddToCartFormData(data);
            await cartService.addToCart(formData);
            const cart = await cartService.getCart();
            setCartData(cart.items, cart.totalAmount);
            useAlertStore.getState().showAlert(
                'Added to Cart',
                `${selectedPkg.emoji} ${selectedPkg.name} for ${item.name} has been added to your campaign.`
            );
        } catch (e) {
            useAlertStore.getState().showAlert('Error', 'Could not add to cart. Please try again.');
        }
        onClose();
    }, [item, selectedPkg, onClose, startDate, endDate, isAlreadyInCart, setCartData]);

    const sendCartRequest = async () => {
        const formData = buildFormData();
        await cartService.addToCart(formData);
    };

    const buildFormData = (): FormData => {
        const data = {
            screenId: item!.id,
            startDate: formatDateForBackend(startDate),
            endDate: formatDateForBackend(endDate),
        };
        return cartService.buildAddToCartFormData(data);
    };

    const refreshCartFromBackend = async () => {
        const cart = await cartService.getCart();
        setCartData(cart.items, cart.totalAmount);
    };

    const showAddedToCartAlert = () => {
        useAlertStore.getState().showAlert(
            'Added to Cart',
            `${selectedPkg!.emoji} ${selectedPkg!.name} for ${item!.name} has been added to your campaign.`
        );
    };

    const handleAddToCartError = (e: unknown) => {
        useAlertStore.getState().showAlert('Error', 'Could not add to cart. Please try again.');
    };

    return {
        selectedId,
        setSelectedId: handleSelectPackage,
        startDate,
        showPicker,
        setShowPicker,
        derivedPackages,
        selectedPkg,
        endDate,
        quantity,
        incrementQuantity,
        decrementQuantity,
        handleDateChange,
        handleAddToCart,
        formatDate: formatDateForDisplay,
        isAlreadyInCart,
    };
}

