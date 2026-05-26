import { type DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import axios, { type AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/utils/axiosInstance';

export const useGet = <T = unknown>(
  { url, config }: { url: string; config?: AxiosRequestConfig },
  options?: {
    disabled?: boolean;
    queryKey?: unknown[];
    deps?: DependencyList;
    staleTime?: number;
  },
) => {
  const [response, setResponseState] = useState<T | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [trigger, setTrigger] = useState(0);

  const disabled = options?.disabled;

  // Track query key to refetch on changes, mimicking React Query's key behavior.
  const queryKey = options?.queryKey ?? [url, ...(options?.deps ?? [])];
  const serializedKey = JSON.stringify(queryKey);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    setPending(true);
    setError(null);
    try {
      const res = await axiosInstance.get<T>(url, { ...configRef.current, signal });
      setResponseState(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err);
      }
    } finally {
      setPending(false);
    }
  }, [url]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [serializedKey, disabled, trigger, fetchData]);

  const reFetch = useCallback(() => {
    if (disabled) return;
    setTrigger((prev) => prev + 1);
  }, [disabled]);

  const setResponse = useCallback((updater: ((prev: T | null) => T | null) | T | null) => {
    setResponseState((prev) => {
      if (typeof updater === 'function') {
        return (updater as (prev: T | null) => T | null)(prev);
      }
      return updater;
    });
  }, []);

  return {
    pending,
    error,
    response: response ?? null,
    reFetch,
    setResponse,
  };
};
