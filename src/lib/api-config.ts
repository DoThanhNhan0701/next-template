const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
};

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export const buildQueryString = (
  params?: Record<string, string | number | boolean>
): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchWithTimeout = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const apiRequest = async <TResponse = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TResponse> => {
  const { params, ...fetchOptions } = options;

  const queryString = buildQueryString(params);
  const url = `${API_CONFIG.baseUrl}${endpoint}${queryString}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      throw new ApiError(
        `API Error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout');
      }
      throw new ApiError(error.message);
    }

    throw new ApiError('Unknown error occurred');
  }
};
