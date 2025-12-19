import { httpPost, httpGet } from "@/lib/http.server";
import { API_ENDPOINTS } from "@/lib/constants";
import { LoginRequest, RefreshTokenRequest } from "@/types/auth/requests";
import { LoginResponse } from "@/types/auth/responses";
import { User } from "@/types/user";

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await httpPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        if (!response) throw new Error("Login failed");
        return response;
    },

    refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
        const response = await httpPost<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, data);
        if (!response) throw new Error("Refresh failed");
        return response;
    },

    getMe: async (): Promise<User> => {
        const response = await httpGet<User>(API_ENDPOINTS.AUTH.ME);
        if (!response) throw new Error("Failed to fetch user");
        return response;
    },
};
