import { axiosInstance } from '@/utils/axiosInstance';
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { useEffect, useState, type DependencyList } from 'react';

export const useGet = <T = unknown>(
  { url, config }: { url: string; config?: AxiosRequestConfig },
  options?: {
    disabled?: boolean;
    deps?: DependencyList;
  },
) => {
  const [data, setData] = useState<{
    pending: boolean;
    error: AxiosError | null;
  }>({
    pending: true,
    error: null,
  });
  const [response, setResponse] = useState<T | null>(null);

  const getData = async (signal?: AbortSignal) => {
    try {
      setData((prev) => ({
        ...prev,
        pending: true,
      }));
      const response = await axiosInstance.get(url, { ...config, signal });

      setData({
        error: null,
        pending: false,
      });
      setResponse(response.data);
    } catch (error) {
      if (axios.isCancel(error)) return;
      setData({
        error: error as AxiosError,
        pending: false,
      });
      setResponse(null);
    }
  };

  useEffect(() => {
    if (options?.disabled) return;
    
    const abortController = new AbortController();
    getData(abortController.signal);

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options?.disabled, ...(options?.deps || [])]);

  const reFetch = () => {
    if (data.pending || options?.disabled) return;
    getData();
  };

  return { ...data, response, reFetch, setResponse };
};
