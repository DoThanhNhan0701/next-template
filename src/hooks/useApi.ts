import { httpClient } from "@/lib/http.client";
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from "@tanstack/react-query";

// Generic GET Hook
export const useGet = <T>(
    key: string[],
    url: string,
    options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
) => {
    return useQuery<T, Error>({
        queryKey: key,
        queryFn: () => httpClient.get<T>(url),
        ...options,
    });
};

// Generic POST Hook
export const usePost = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: (data) => httpClient.post<T>(url, data),
        ...options,
    });
};

// Generic PUT Hook
export const usePut = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: (data) => httpClient.put<T>(url, data),
        ...options,
    });
};

// Generic PATCH Hook
export const usePatch = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: (data) => httpClient.patch<T>(url, data),
        ...options,
    });
};

// Generic DELETE Hook
export const useDelete = <T>(
    url: string,
    options?: UseMutationOptions<T, Error, void>
) => {
    return useMutation<T, Error, void>({
        mutationFn: () => httpClient.delete<T>(url),
        ...options,
    });
};
