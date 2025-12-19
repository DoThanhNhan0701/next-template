import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/config/constants";
import { cookies } from "next/headers";

export const tokenService = {
    getAccessToken: async () => {
        const cookieStore = await cookies();
        return cookieStore.get(ACCESS_TOKEN)?.value;
    },

    getRefreshToken: async () => {
        const cookieStore = await cookies();
        return cookieStore.get(REFRESH_TOKEN)?.value;
    },

    setTokens: async (accessToken: string, refreshToken: string) => {
        const cookieStore = await cookies();

        cookieStore.set(ACCESS_TOKEN, accessToken, {
            maxAge: 60 * 60 * 24 * 1, // 1 days
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        if (refreshToken) {
            cookieStore.set(REFRESH_TOKEN, refreshToken, {
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
        }
    },

    clearTokens: async () => {
        const cookieStore = await cookies();
        cookieStore.delete(ACCESS_TOKEN);
        cookieStore.delete(REFRESH_TOKEN);
    },
};
