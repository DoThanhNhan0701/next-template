import { httpGet, httpPost, httpPut, httpPatch, httpDelete } from "@/lib/http.server";
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
        queryFn: async () => {
            const res = await httpGet<T>(url);
            if (res === null) throw new Error("Request failed");
            return res;
        },
        ...options,
    });
};

// Generic POST Hook
export const usePost = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: async (data) => {
            const res = await httpPost<T>(url, data);
            if (res === null) throw new Error("Request failed");
            return res;
        },
        ...options,
    });
};

// Generic PUT Hook
export const usePut = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: async (data) => {
            const res = await httpPut<T>(url, data);
            if (res === null) throw new Error("Request failed");
            return res;
        },
        ...options,
    });
};

// Generic PATCH Hook
export const usePatch = <T, D = unknown>(
    url: string,
    options?: UseMutationOptions<T, Error, D>
) => {
    return useMutation<T, Error, D>({
        mutationFn: async (data) => {
            const res = await httpPatch<T>(url, data);
            if (res === null) throw new Error("Request failed");
            return res;
        },
        ...options,
    });
};

// Generic DELETE Hook
export const useDelete = <T>(
    url: string,
    options?: UseMutationOptions<T, Error, void>
) => {
    return useMutation<T, Error, void>({
        mutationFn: async () => {
            const res = await httpDelete<T>(url);
            if (res === null) throw new Error("Request failed");
            return res;
        },
        ...options,
    });
};
