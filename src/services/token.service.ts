import { deleteCookie, getCookie, setCookie } from "cookies-next";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenService = {
    getAccessToken: () => {
        return getCookie(ACCESS_TOKEN_KEY);
    },

    getRefreshToken: () => {
        return getCookie(REFRESH_TOKEN_KEY);
    },

    setTokens: (accessToken: string, refreshToken?: string) => {
        setCookie(ACCESS_TOKEN_KEY, accessToken, {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
            secure: process.env.NODE_ENV === 'production', // Uncomment for production
            sameSite: 'strict',
        });

        if (refreshToken) {
            setCookie(REFRESH_TOKEN_KEY, refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
        }
    },

    clearTokens: () => {
        deleteCookie(ACCESS_TOKEN_KEY);
        deleteCookie(REFRESH_TOKEN_KEY);
    },
};
