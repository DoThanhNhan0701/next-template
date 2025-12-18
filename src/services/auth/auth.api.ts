import axiosInstance from "@/lib/axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { LoginRequest, RefreshTokenRequest } from "@/types/auth/requests";
import { LoginResponse } from "@/types/auth/responses";
import { User } from "@/types/user";

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
