import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constants";

export const tokenService = {
    getAccessToken: () => {
        return getCookie(COOKIE_KEYS.ACCESS_TOKEN);
    },

    getRefreshToken: () => {
        return getCookie(COOKIE_KEYS.REFRESH_TOKEN);
    },

    setTokens: (accessToken: string, refreshToken?: string) => {
        setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        if (refreshToken) {
            setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
        }
    },

    clearTokens: () => {
        deleteCookie(COOKIE_KEYS.ACCESS_TOKEN);
        deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
    },
};
