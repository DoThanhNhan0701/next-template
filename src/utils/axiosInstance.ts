import axios from 'axios';

import { endpoints } from '@/config/endpoints';
import { getClientCookie, setClientCookie } from './cookiesStore';
import { ACCESS_TOKEN, API_URL, REFRESH_TOKEN } from '@/config/constants';

/**
 * Authentication Flow:
 * 
 * 1. Request Interceptor: Adds access token to all requests
 * 
 * 2. Response Interceptor handles errors:
 *    - 401 Unauthorized:
 *      a. If no refresh token exists -> logout and redirect to login
 *      b. If refresh token exists -> try to refresh access token
 *         - Success: retry original request with new token
 *         - Failure: logout and redirect to login
 *    
 *    - 403 Forbidden on refresh endpoint:
 *      -> Invalid refresh token -> logout and redirect to login
 * 
 * This ensures users are automatically redirected to login when:
 * - Access token expires and refresh token is missing
 * - Refresh token expires or is invalid
 * - Any authentication error occurs
 */

let store: { dispatch: (action: { type: string }) => void } | undefined;
export const injectStore = (_store: { dispatch: (action: { type: string }) => void }) => {
  store = _store;
};


const axiosInstance = axios.create({
  baseURL: `${API_URL}`,
  timeout: 60000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getClientCookie(ACCESS_TOKEN);
    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => error,
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // Handle 401 Unauthorized errors
    if (response?.status === 401 && config?.url !== endpoints.REFRESH) {
      const refreshToken = getClientCookie(REFRESH_TOKEN);

      if (!refreshToken) {
        store?.dispatch({ type: 'auth/actionLogout' });
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }

      return (
        axiosInstance
          .post(endpoints.REFRESH, {
            refresh: refreshToken,
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((res: Record<string, any>) => {
            axiosInstance.defaults.headers.common['Authorization'] =
              `Bearer ${res?.data?.data?.access}`;
            config.headers['Authorization'] = `Bearer ${res?.data?.data?.access}`;
            setClientCookie(ACCESS_TOKEN, res?.data?.data?.access);
            setClientCookie(REFRESH_TOKEN, res?.data?.data?.refresh);
            return axiosInstance(config);
          })
          .catch(() => {
            store?.dispatch({ type: 'auth/actionLogout' });
            // Redirect to login page when refresh token fails
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(new Error('Token refresh failed'));
          })
      );
    }

    // Handle 403 Forbidden errors (invalid/expired token that can't be refreshed)
    if (response?.status === 403) {
      const refreshToken = getClientCookie(REFRESH_TOKEN);
      // If we have a refresh token but still get 403, it might be invalid
      if (refreshToken && config?.url === endpoints.REFRESH) {
        store?.dispatch({ type: 'auth/actionLogout' });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export { axiosInstance };
