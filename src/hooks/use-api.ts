import {
    useMutation,
    useQuery,
    UseQueryOptions,
    UseMutationOptions,
    QueryKey,
} from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-config';

// ============================================
// Types
// ============================================

export interface UseGetOptions<TData = unknown, TError = Error>
    extends Omit<
        UseQueryOptions<TData, TError, TData, QueryKey>,
        'queryKey' | 'queryFn'
    > {
    params?: Record<string, string | number | boolean>;
    headers?: HeadersInit;
}

export interface UseMutateOptions<TData = unknown, TVariables = unknown, TError = Error>
    extends Omit<
        UseMutationOptions<TData, TError, TVariables>,
        'mutationFn'
    > {
    headers?: HeadersInit;
}

// ============================================
// GET Hook
// ============================================

/**
 * Custom hook for GET requests using TanStack Query
 * @param endpoint - API endpoint (e.g., '/users', '/posts/1')
 * @param options - Query options including params, headers, and react-query options
 * @returns React Query result
 * 
 * @example
 * ```tsx
 * // Simple GET
 * const { data, isLoading } = useGet<User[]>('/users');
 * 
 * // GET with params
 * const { data } = useGet<Post[]>('/posts', {
 *   params: { page: 1, limit: 10 },
 *   enabled: true,
 * });
 * 
 * // GET with custom query key
 * const { data } = useGet<User>(`/users/${userId}`, {
 *   enabled: !!userId,
 * });
 * ```
 */
export const useGet = <TData = unknown, TError = Error>(
    endpoint: string,
    options?: UseGetOptions<TData, TError>
) => {
    const { params, headers, ...queryOptions } = options || {};

    return useQuery<TData, TError>({
        queryKey: [endpoint, params],
        queryFn: async () => {
            return apiRequest<TData>(endpoint, {
                method: 'GET',
                params,
                headers,
            });
        },
        ...queryOptions,
    });
};

// ============================================
// POST Hook
// ============================================

/**
 * Custom hook for POST requests using TanStack Query
 * @param endpoint - API endpoint
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * interface CreateUserData {
 *   name: string;
 *   email: string;
 * }
 * 
 * const { mutate, isPending } = usePost<User, CreateUserData>('/users', {
 *   onSuccess: (data) => {
 *     console.log('User created:', data);
 *   },
 * });
 * 
 * // Usage
 * mutate({ name: 'John', email: 'john@example.com' });
 * ```
 */
export const usePost = <TData = unknown, TVariables = unknown, TError = Error>(
    endpoint: string,
    options?: UseMutateOptions<TData, TVariables, TError>
) => {
    const { headers, ...mutationOptions } = options || {};

    return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            return apiRequest<TData>(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(variables),
            });
        },
        ...mutationOptions,
    });
};

// ============================================
// PUT Hook
// ============================================

/**
 * Custom hook for PUT requests using TanStack Query
 * @param endpoint - API endpoint or function to generate endpoint
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * interface UpdateUserData {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 * 
 * // Static endpoint
 * const { mutate } = usePut<User, UpdateUserData>('/users/1');
 * 
 * // Dynamic endpoint
 * const { mutate } = usePut<User, UpdateUserData>((data) => `/users/${data.id}`);
 * 
 * // Usage
 * mutate({ id: 1, name: 'John Updated', email: 'john@example.com' });
 * ```
 */
export const usePut = <TData = unknown, TVariables = unknown, TError = Error>(
    endpoint: string | ((variables: TVariables) => string),
    options?: UseMutateOptions<TData, TVariables, TError>
) => {
    const { headers, ...mutationOptions } = options || {};

    return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
            return apiRequest<TData>(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(variables),
            });
        },
        ...mutationOptions,
    });
};

// ============================================
// PATCH Hook
// ============================================

/**
 * Custom hook for PATCH requests using TanStack Query
 * @param endpoint - API endpoint or function to generate endpoint
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * interface PatchUserData {
 *   id: number;
 *   name?: string;
 *   email?: string;
 * }
 * 
 * const { mutate } = usePatch<User, PatchUserData>((data) => `/users/${data.id}`);
 * 
 * // Usage - partial update
 * mutate({ id: 1, name: 'John' });
 * ```
 */
export const usePatch = <TData = unknown, TVariables = unknown, TError = Error>(
    endpoint: string | ((variables: TVariables) => string),
    options?: UseMutateOptions<TData, TVariables, TError>
) => {
    const { headers, ...mutationOptions } = options || {};

    return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
            return apiRequest<TData>(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(variables),
            });
        },
        ...mutationOptions,
    });
};

// ============================================
// DELETE Hook
// ============================================

/**
 * Custom hook for DELETE requests using TanStack Query
 * @param endpoint - API endpoint or function to generate endpoint
 * @param options - Mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * // Static endpoint
 * const { mutate } = useDelete<void, void>('/users/1');
 * 
 * // Dynamic endpoint with ID
 * const { mutate } = useDelete<void, number>((id) => `/users/${id}`);
 * 
 * // With params
 * interface DeleteParams {
 *   id: number;
 *   force?: boolean;
 * }
 * const { mutate } = useDelete<void, DeleteParams>((params) => `/users/${params.id}`);
 * 
 * // Usage
 * mutate(1); // or mutate({ id: 1, force: true });
 * ```
 */
export const useDelete = <TData = unknown, TVariables = unknown, TError = Error>(
    endpoint: string | ((variables: TVariables) => string),
    options?: UseMutateOptions<TData, TVariables, TError>
) => {
    const { headers, ...mutationOptions } = options || {};

    return useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
            return apiRequest<TData>(url, {
                method: 'DELETE',
                headers,
                body: variables ? JSON.stringify(variables) : undefined,
            });
        },
        ...mutationOptions,
    });
};
