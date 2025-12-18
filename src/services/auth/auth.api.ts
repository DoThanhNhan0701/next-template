import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface User {
    id: string;
    username: string;
    // Add other user fields as needed based on the API response
}

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );
        return response.data;
    },

    refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>(
            API_ENDPOINTS.AUTH.REFRESH,
            data
        );
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await axiosInstance.get<User>(API_ENDPOINTS.AUTH.ME);
        return response.data;
    },
};
