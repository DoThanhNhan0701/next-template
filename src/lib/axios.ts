import axios from "axios";
import { tokenService } from "@/services/token.service";

const baseURL = "https://take-a-photo.aiminds.io.vn/api/v1";

const axiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login")
        ) {
            originalRequest._retry = true;
            const refreshToken = tokenService.getRefreshToken();

            if (refreshToken) {
                try {
                    const response = await axios.post(`${baseURL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token } = response.data;

                    tokenService.setTokens(access_token, refresh_token);

                    axiosInstance.defaults.headers.common[
                        "Authorization"
                    ] = `Bearer ${access_token}`;
                    originalRequest.headers["Authorization"] = `Bearer ${access_token}`;

                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    tokenService.clearTokens();
                    window.location.href = "/auth/login";
                    return Promise.reject(refreshError);
                }
            } else {
                tokenService.clearTokens();
                window.location.href = "/auth/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
