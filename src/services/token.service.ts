
import { cookies } from "next/headers";
import { COOKIE_KEYS } from "@/lib/constants";

export const tokenService = {
    getAccessToken: async () => {
        const cookieStore = await cookies();
        return cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
    },

    getRefreshToken: async () => {
        const cookieStore = await cookies();
        return cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;
    },

    setTokens: async (accessToken: string, refreshToken?: string) => {
        const cookieStore = await cookies();

        cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        if (refreshToken) {
            cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
        }
    },

    clearTokens: async () => {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_KEYS.ACCESS_TOKEN);
        cookieStore.delete(COOKIE_KEYS.REFRESH_TOKEN);
    },
};
