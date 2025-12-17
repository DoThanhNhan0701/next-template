const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
};

export class ApiError extends Error {
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

const buildQueryString = (
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
      let errorMessage = response.statusText;

      try {
        errorData = await response.json();
        // Try to extract message from common API error formats
        if (errorData && typeof errorData === 'object') {
          const data = errorData as Record<string, unknown>;
          errorMessage =
            (data.error as string) ||
            (data.detail as string) ||
            (data.message as string) ||
            response.statusText;
        }
      } catch {
        errorData = await response.text();
        if (typeof errorData === 'string' && errorData) {
          errorMessage = errorData;
        }
      }

      throw new ApiError(
        errorMessage,
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
