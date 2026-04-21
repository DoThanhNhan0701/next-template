import { axiosInstance } from '@/utils/axiosInstance';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import type { DependencyList } from 'react';

export const useGet = <T = unknown>(
  { url, config }: { url: string; config?: AxiosRequestConfig },
  options?: {
    disabled?: boolean;
    queryKey?: QueryKey;
    deps?: DependencyList;
    staleTime?: number;
  },
) => {
  const queryClient = useQueryClient();
  const key: QueryKey = options?.queryKey ?? [url, ...(options?.deps ?? [])];

  const { data: response, isPending, error, refetch } = useQuery<T>({
    queryKey: key,
    queryFn: async ({ signal }) => {
      const res = await axiosInstance.get<T>(url, { ...config, signal });
      return res.data;
    },
    enabled: !options?.disabled,
    staleTime: options?.staleTime,
  });

  const pending = isPending;

  const reFetch = () => {
    if (options?.disabled) return;
    refetch();
  };

  const setResponse = (updater: ((prev: T | null) => T | null) | T | null) => {
    queryClient.setQueryData<T>(key, (prev) => {
      if (typeof updater === 'function') {
        return (updater as (prev: T | null) => T | null)(prev ?? null) ?? undefined;
      }
      return updater ?? undefined;
    });
  };

  return {
    pending,
    error,
    response: response ?? null,
    reFetch,
    setResponse,
  };
};
