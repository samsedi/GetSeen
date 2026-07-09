import apiClient from './client';

// --- TYPES MAPPED FROM YOUR JAVA DTOs ---

export interface AdvertiserRegisterRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    country: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
}

export interface ScreenOwnerRegisterRequest {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ✨ Added Verify Request Type
export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    message: string;
    displayName: string;
    email: string;
    roles: string[];
    isEmailVerified: boolean;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

const authApi = {
    /**
     * Registers a new Advertiser account.
     * Matches POST /api/v1/auth/register/advertiser
     */
    registerAdvertiser: async (data: AdvertiserRegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register/advertiser', data);
        return response.data;
    },

    /**
     * Registers a new Screen Owner account.
     * Matches POST /api/v1/auth/register/screen-owner
     */
    registerScreenOwner: async (data: ScreenOwnerRegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register/screen-owner', data);
        return response.data;
    },

    /**
     * Authenticates a user (Advertiser or Screen Owner).
     * Matches POST /api/v1/auth/login
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    /**
     * Refreshes the JWT access token using a valid refresh token.
     * Matches POST /api/v1/auth/refresh-token
     */
    refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/refresh-token', data);
        return response.data;
    },

    /**
     * ✨ Verifies the 6-digit OTP sent to the user's email.
     * Matches POST /api/v1/auth/verify-email
     */
    verifyEmail: async (data: VerifyEmailRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/verify-email', data);
        return response.data;
    },

    /**
     * ✨ Requests a new OTP to be sent to the user's email.
     * Matches POST /api/v1/auth/resend-otp
     */
    resendOtp: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/resend-otp', { email });
        return response.data;
    },

    /**
     * Sends a password reset link to the provided email.
     * Matches POST /api/v1/auth/forgot-password
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    }
};

export default authApi;