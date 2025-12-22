"use server";

import { API_URL } from "@/config/constants";
import { tokenService } from "@/services/token.service";
import { ApiError } from "@/utils/api-error";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}



function buildQuery(params?: Record<string, string | number | boolean>) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}


async function fetchWithAuth<T, E = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const accessToken = await tokenService.getAccessToken();

  const { params, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const queryString = buildQuery(params);

  const response = await fetch(`${API_URL}${url}${queryString}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorBody: E | undefined;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorBody = (await response.json()) as E;
    }

    const errorData = errorBody as Record<string, unknown> | undefined;
    const message =
      (errorData?.detail as string) ||
      (errorData?.message as string) ||
      response.statusText;

    throw new ApiError<E>(response.status, message, errorBody);
  }

  return response.json() as Promise<T>;
}


export async function httpGet<T>(url: string, options?: FetchOptions) {
  return fetchWithAuth<T>(url, { ...options, method: "GET" });
}

export async function httpPost<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
) {
  return fetchWithAuth<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function httpPut<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
) {
  return fetchWithAuth<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function httpPatch<T>(
  url: string,
  body: unknown,
  options?: FetchOptions
) {
  return fetchWithAuth<T>(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function httpDelete<T>(url: string, options?: FetchOptions) {
  return fetchWithAuth<T>(url, { ...options, method: "DELETE" });
}
