import axios from 'axios';

import { endpoints } from '@/config/endpoints';
import { getClientCookie, setClientCookie } from './cookiesStore';
import { ACCESS_TOKEN, API_URL, REFRESH_TOKEN } from '@/config/constants';

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

    if (response.status === 401 && config.url !== endpoints.REFRESH) {
      const refreshToken = getClientCookie(REFRESH_TOKEN);

      if (!refreshToken) {
        store?.dispatch({ type: 'auth/actionLogout' });
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
            return Promise.reject(new Error('Token refresh failed'));
          })
      );
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export { axiosInstance };
