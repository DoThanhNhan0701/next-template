export const API_BASE_URL = "https://take-a-photo.aiminds.io.vn/api/v1";

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
    },
} as const;

export const COOKIE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
} as const;
