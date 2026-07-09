import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Use environment variable for production, fallback to local IP for development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
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
    return await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
};

const handleRefreshFailure = async () => {
    console.error("Refresh token expired or invalid. Executing smart logout.");
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('activeRole');
    router.replace('/');
};

const handleRefreshSuccess = async (refreshResponse: any, originalRequest: InternalAxiosRequestConfig) => {
    const newAccessToken = refreshResponse.data.accessToken;
    const newRefreshToken = refreshResponse.data.refreshToken;

    await SecureStore.setItemAsync('userToken', newAccessToken);
    await SecureStore.setItemAsync('refreshToken', newRefreshToken);

    processQueue(null, newAccessToken);
    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    
    return apiClient(originalRequest);
};

const attemptTokenRefreshSafely = async (originalRequest: InternalAxiosRequestConfig) => {
    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
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

        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;