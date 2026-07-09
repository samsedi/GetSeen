import { create } from 'zustand';


export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons?: AlertButton[];
    // Function to trigger the alert from anywhere
    showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
    // Function to close the alert
    hideAlert: () => void;
}


export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    title: '',
    message: '',
    buttons: undefined,

    showAlert: (title, message = '', buttons) =>
        set({
            visible: true,
            title: title,
            message: message,
            buttons: buttons
        }),

    hideAlert: () =>
        set({
            visible: false,
            title: '',
            message: '',
            buttons: undefined
        }),
}));