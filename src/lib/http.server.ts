"use server";

import { COOKIE_KEYS, API_BASE_URL } from "@/lib/constants";
import { cookies } from "next/headers";

const baseURL = API_BASE_URL;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchWithAuth<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${baseURL}${url}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.log(response);

      console.error(`Server fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Server fetch error:", error);
    return null;
  }
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
