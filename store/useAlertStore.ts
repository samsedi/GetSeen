import { create } from 'zustand';


interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    // Function to trigger the alert from anywhere
    showAlert: (title: string, message: string) => void;
    // Function to close the alert
    hideAlert: () => void;
}


export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    title: '',
    message: '',

    showAlert: (title, message) =>
        set({
            visible: true,
            title: title,
            message: message
        }),

    hideAlert: () =>
        set({
            visible: false,
            title: '',
            message: ''
        }),
}));