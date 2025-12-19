import { API_ENDPOINTS } from "@/lib/constants";
import { tokenService } from "@/services/token.service";

const baseURL = "https://take-a-photo.aiminds.io.vn/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}


interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

interface ErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

async function fetchWithAuth<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = tokenService.getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fullUrl = `${baseURL}${url}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    fullUrl += `?${searchParams.toString()}`;
  }

  try {
    let response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401 && !url.includes(API_ENDPOINTS.AUTH.LOGIN)) {
      const refreshToken = tokenService.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            }
          );

          if (refreshResponse.ok) {
            const data: RefreshTokenResponse = await refreshResponse.json();
            tokenService.setTokens(data.access_token, data.refresh_token);
            headers["Authorization"] = `Bearer ${data.access_token}`;
            // Retry original request
            response = await fetch(fullUrl, {
              ...options,
              headers,
            });
          } else {
            tokenService.clearTokens();
            window.location.href = "/auth/login";
            throw new Error("Session expired");
          }
        } catch (error) {
          tokenService.clearTokens();
          window.location.href = "/auth/login";
          throw error;
        }
      } else {
        tokenService.clearTokens();
        window.location.href = "/auth/login";
        throw new Error("No refresh token");
      }
    }

    if (!response.ok) {
      let errorMessage = response.statusText;

      try {
        const errorBody: ErrorResponse = await response.json();
        errorMessage = errorBody?.detail ?? response.statusText;
      } catch { }

      throw new ApiError(response.status, errorMessage);
    }


    return response.json();
  } catch (error) {
    throw error;
  }
}

export const httpClient = {
  get: <T>(url: string, options?: FetchOptions) =>
    fetchWithAuth<T>(url, { ...options, method: "GET" }),
  delete: <T>(url: string, options?: FetchOptions) =>
    fetchWithAuth<T>(url, { ...options, method: "DELETE" }),

  post: <T>(url: string, body: unknown, options?: FetchOptions) =>
    fetchWithAuth<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body: unknown, options?: FetchOptions) =>
    fetchWithAuth<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body: unknown, options?: FetchOptions) =>
    fetchWithAuth<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

};