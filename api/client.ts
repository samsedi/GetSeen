import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// No silent fallback: every build profile (development/preview/production) must set this
// explicitly in eas.json or .env, so a misconfigured build fails loudly instead of quietly
// hitting the production API/database.
if (!process.env.EXPO_PUBLIC_API_URL) {
    throw new Error(
        'EXPO_PUBLIC_API_URL is not set. Configure it in .env (local dev) or eas.json (builds).'
    );
}
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
// Reads the access token synchronously from Zustand (no async SecureStore call needed)
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

// --- EXTRACTED REFRESH LOGIC ---
const executeRefreshRequest = async (refreshToken: string) => {
    return await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
};

const handleRefreshFailure = async () => {
    console.error("Refresh token expired or invalid. Executing smart logout.");
    // Use the Zustand logout action which clears everything
    await useAuthStore.getState().logout();
};

const handleRefreshSuccess = async (refreshResponse: any, originalRequest: InternalAxiosRequestConfig) => {
    const newAccessToken = refreshResponse.data.data.access_token;
    const newRefreshToken = refreshResponse.data.data.refresh_token;

    // Update Zustand + SecureStore in one shot via the store action
    await useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || undefined);

    processQueue(null, newAccessToken);
    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    
    return apiClient(originalRequest);
};

const attemptTokenRefreshSafely = async (originalRequest: InternalAxiosRequestConfig) => {
    try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        const refreshResponse = await executeRefreshRequest(refreshToken);
        return await handleRefreshSuccess(refreshResponse, originalRequest);
    } catch (refreshError) {
        processQueue(refreshError, null);
        await handleRefreshFailure();
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false;
    }
};

const enqueueFailedRequest = (originalRequest: InternalAxiosRequestConfig) => {
    return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
    }).then(token => {
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return apiClient(originalRequest);
    });
};

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
        const isAuthEndpoint = originalRequest.url?.includes('/auth');
        
        // Skip token refresh logic if this is an authentication request (e.g. login/register)
        if (isAuthError && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return enqueueFailedRequest(originalRequest).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;
            return attemptTokenRefreshSafely(originalRequest);
        }

        const isServerError = error.response && (error.response.status === 503 || error.response.status === 502 || error.response.status === 504);
        if (isServerError) {
            // Use require to avoid circular dependency
            const { useAppStore } = require('@/store/appStore');
            useAppStore.getState().setServerDown(true);
        }

        let errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message;
        
        // Extract specific field validation errors if the backend provides them
        const fields = error.response?.data?.error?.fields;
        if (fields && typeof fields === 'object') {
            const fieldMessages = Object.values(fields).join('\n• ');
            if (fieldMessages) {
                // If the generic message is just "validation error", this makes it much more helpful
                errorMessage = `${errorMessage}\n\n• ${fieldMessages}`;
            }
        }

        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;