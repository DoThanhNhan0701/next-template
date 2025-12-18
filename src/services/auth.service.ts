import axiosInstance from "@/lib/axios";

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

export interface User {
    id: string;
    username: string;
    // Add other user fields as needed based on the API response
}

export interface LoginRequest {
    username: string;
    password: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post("/auth/login", data);
        return response.data;
    },

    refreshToken: async (refreshToken: string) => {
        const response = await axiosInstance.post("/auth/refresh", {
            refresh_token: refreshToken,
        });
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await axiosInstance.get("/auth/me");
        return response.data;
    },
};
