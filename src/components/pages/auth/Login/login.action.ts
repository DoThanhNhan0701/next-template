'use server';

import { API_ENDPOINTS } from "@/lib/constants";
import { httpPost } from "@/lib/http.server";
import { tokenService } from "@/services/token.service";
import { LoginRequest } from "@/types/auth/requests";
import { LoginResponse } from "@/types/auth/responses";
import { ApiError } from "@/utils/api-error";

export async function loginAction(data: LoginRequest) {
    try {
        const response = await httpPost<LoginResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );

        await tokenService.setTokens(
            response.access_token,
            response.refresh_token
        );

        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(error.body?.detail || error.message);
        }
        throw error;
    }
}
