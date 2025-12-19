"use server";

import { COOKIE_KEYS, API_BASE_URL } from "@/lib/constants";
import { ApiError } from "@/utils/api-error";
import { cookies } from "next/headers";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchWithAuth<T, E = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorBody: E | undefined;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorBody = (await response.json()) as E;
    }

    throw new ApiError<E>(response.status, response.statusText, errorBody);
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
