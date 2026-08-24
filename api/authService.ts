import apiClient from './client';

// --- TYPES MAPPED FROM API DOCUMENTATION ---

export interface AdvertiserRegisterRequest {
    account_type: 'advertiser';
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    email_otp: string;
    password: string;
    password_confirmation: string;
    country_id?: number;
    device_name: string;
}

export interface ScreenOwnerRegisterRequest {
    account_type: 'screen_owner';
    phone: string;
    email: string;
    email_otp: string;
    password: string;
    password_confirmation: string;
    device_name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    account_type: 'advertiser' | 'screen_owner';
    device_name: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface ForgotPasswordRequest {
    account_type: 'advertiser' | 'screen_owner';
    email: string;
}

export interface ResetPasswordRequest {
    account_type: 'advertiser' | 'screen_owner';
    token: string;
    password: string;
    password_confirmation: string;
}

export interface ChangePasswordRequest {
    current_password?: string;
    password: string;
    password_confirmation: string;
}


export interface UserDTO {
    id: number;
    email: string;
    phone: string;
    role: string;
    name: string;
}

export interface AuthResponseData {
    access_token: string;
    refresh_token: string;
    user: UserDTO;
}

export interface StandardApiResponse<T> {
    success: boolean;
    data: T;
}

const authApi = {
    /**
     * Sends OTP to screen owner before registration.
     * Matches POST /api/v1/auth/screen-owner/send-signup-otp
     */
    sendSignupOtp: async (data: SendOtpRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/screen-owner/send-signup-otp', data);
        return response?.data?.data;
    },

    /**
     * Sends OTP to advertiser before registration.
     * Matches POST /api/v1/auth/advertiser/send-signup-otp
     */
    sendAdvertiserSignupOtp: async (data: SendOtpRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/advertiser/send-signup-otp', data);
        return response?.data?.data;
    },

    /**
     * Registers a new Advertiser account.
     * Matches POST /api/v1/auth/register
     */
    registerAdvertiser: async (data: AdvertiserRegisterRequest): Promise<AuthResponseData> => {
        const response = await apiClient.post<StandardApiResponse<AuthResponseData>>('/auth/register', data);
        return response?.data?.data;
    },

    /**
     * Registers a new Screen Owner account.
     * Matches POST /api/v1/auth/register
     */
    registerScreenOwner: async (data: ScreenOwnerRegisterRequest): Promise<AuthResponseData> => {
        const response = await apiClient.post<StandardApiResponse<AuthResponseData>>('/auth/register', data);
        return response?.data?.data;
    },

    /**
     * Authenticates a user (Advertiser or Screen Owner).
     * Matches POST /api/v1/auth/login
     */
    login: async (data: LoginRequest): Promise<AuthResponseData> => {
        const response = await apiClient.post<StandardApiResponse<AuthResponseData>>('/auth/login', data);
        return response?.data?.data;
    },

    /**
     * Retrieves the currently logged in user.
     * Matches GET /api/v1/auth/me
     */
    getCurrentUser: async (): Promise<{ user: UserDTO }> => {
        const response = await apiClient.get<StandardApiResponse<{ user: UserDTO }>>('/auth/me');
        return response?.data?.data;
    },

    /**
     * Logs the user out on the backend.
     * Matches POST /api/v1/auth/logout
     */
    logout: async (): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/logout');
        return response?.data?.data;
    },

    /**
     * Sends a forgot password email.
     * Matches POST /api/v1/auth/forgot-password
     */
    forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/forgot-password', data);
        return response?.data?.data;
    },

    /**
     * Resets password using token.
     * Matches POST /api/v1/auth/reset-password
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/reset-password', data);
        return response?.data?.data;
    },

    /**
     * Changes the authenticated user's password.
     * Matches POST /api/v1/account/change-password
     */
    changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/account/change-password', data);
        return response?.data?.data;
    },

    /**
     * Verifies an email with an OTP (Legacy/Alternative Flow)
     * Matches POST /api/v1/auth/verify-email
     */
    verifyEmail: async (data: { email: string; otp: string }): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/verify-email', data);
        return response?.data?.data;
    },

    /**
     * Resends an OTP to a given email (Legacy/Alternative Flow)
     * Matches POST /api/v1/auth/resend-otp
     */
    resendOtp: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<StandardApiResponse<{ message: string }>>('/auth/resend-otp', { email });
        return response?.data?.data;
    }
};

export default authApi;