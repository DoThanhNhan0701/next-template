import { API_ENDPOINTS, COOKIE_KEYS } from "@/lib/constants";
import { cookies } from "next/headers";

const baseURL = "https://take-a-photo.aiminds.io.vn/api/v1";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const httpServer = {
    get: async <T>(url: string, options?: FetchOptions): Promise<T | null> => {
        return fetchWithAuth<T>(url, { ...options, method: "GET" });
    },
    post: async <T>(
        url: string,
        body: unknown,
        options?: FetchOptions
    ): Promise<T | null> => {
        return fetchWithAuth<T>(url, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        });
    },
    // Add other methods as needed
};

async function fetchWithAuth<T>(
    url: string,
    options: FetchOptions = {}
): Promise<T | null> {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    } as Record<string, string>;

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
        let response = await fetch(`${baseURL}${url}`, {
            ...options,
            headers,
        });

        if (response.status === 401 && refreshToken) {
            // Attempt refresh
            const refreshResponse = await fetch(
                `${baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                }
            );

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const newAccessToken = data.access_token;
                // Note: We cannot set cookies here in a Server Component for the client
                // But we can use the new token for the retry
                accessToken = newAccessToken;
                headers["Authorization"] = `Bearer ${newAccessToken}`;

                // Retry original request
                response = await fetch(`${baseURL}${url}`, {
                    ...options,
                    headers,
                });
            } else {
                return null; // Refresh failed
            }
        }

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error("Server fetch error:", error);
        return null;
    }
}
