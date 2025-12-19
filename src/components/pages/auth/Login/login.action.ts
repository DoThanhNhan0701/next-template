"use server";

import { API_ENDPOINTS } from "@/lib/constants";
import { httpPost } from "@/lib/http.server";
import { tokenService } from "@/services/token.service";
import { LoginRequest } from "@/types/auth/requests";
import { LoginResponse } from "@/types/auth/responses";

export async function loginAction(data: LoginRequest) {
    const response = await httpPost<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    console.log("Login API Response:", response);

    if (!response) {
        throw new Error("Login failed: No response from API");
    }

    if (!response.access_token) {
        console.error("Login failed: Missing access_token in response", response);
        throw new Error("Login failed: Invalid response format");
    }

    try {
        await tokenService.setTokens(response.access_token, response.refresh_token);
    } catch (error) {
        console.error("Failed to set tokens:", error);
        throw new Error("Login failed: Could not set session");
    }

    return response;
}
