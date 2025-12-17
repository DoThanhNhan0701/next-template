const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
} as const;

export class ApiError {
  name = 'API_ERROR';
  stack?: string;

  constructor(
    public message: string,
    public status?: number,
    public data?: unknown,
    public endpoint?: string
  ) {
    this.stack = new Error().stack;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

const buildQueryString = (params?: Record<string, string | number | boolean>) => {
  if (!params) return '';
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return query ? `?${query}` : '';
};

const fetchWithTimeout = async (url: string, options: RequestOptions = {}) => {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseError = async (response: Response) => {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      const message = data?.error || data?.detail || data?.message || response.statusText;
      return { message, data };
    }
    const text = await response.text();
    return { message: text || response.statusText, data: text };
  } catch {
    return { message: response.statusText, data: null };
  }
};

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  if (!API_CONFIG.baseUrl) {
    throw new ApiError('API base URL is not configured', undefined, undefined, endpoint);
  }

  const { params, headers, ...fetchOptions } = options;
  const url = `${API_CONFIG.baseUrl}${endpoint}${buildQueryString(params)}`;

  try {
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      headers: { 'Content-Type': 'application/json', ...headers },
    });

    if (!response.ok) {
      const { message, data } = await parseError(response);
      throw new ApiError(message, response.status, data, endpoint);
    }

    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
      ? await response.json()
      : (await response.text()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error) {
      throw new ApiError(
        error.name === 'AbortError' ? 'Request timeout' : error.message,
        undefined,
        undefined,
        endpoint
      );
    }
    throw new ApiError('Unknown error occurred', undefined, undefined, endpoint);
  }
};