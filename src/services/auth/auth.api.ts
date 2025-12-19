import { API_ENDPOINTS } from "@/lib/constants";
import { httpPost } from "@/lib/http.server";
import { LoginRequest } from "@/types/auth/requests";
import { LoginResponse } from "@/types/auth/responses";

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await httpPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        if (!response) throw new Error("Login failed");
        return response;
    },

};
