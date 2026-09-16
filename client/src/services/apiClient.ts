import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import type { RefreshResponseData } from '../types/auth';

/**
 * Single shared Axios instance. Every feature service (auth, problems, etc.)
 * imports this instead of creating its own client, so base URL, credentials,
 * and auth-header/refresh-token interceptors live in one place.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api',
  withCredentials: true, // sends the httpOnly refresh-token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attaches the in-memory access token to every request, if we have one.
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * A short-lived access token expiring mid-session is expected, not an error
 * state — the refresh cookie exists for exactly this. On a 401 (and only
 * once per request, guarded by `_retry`), silently try to mint a new access
 * token from the refresh cookie and replay the original request. If that
 * fails too, the session really is over: clear it and let the error surface.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await apiClient.post<{ data: RefreshResponseData }>('/auth/refresh');
      useAuthStore.getState().setAccessToken(data.data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);
