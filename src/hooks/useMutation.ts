import { useState } from 'react';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/utils/axiosInstance';

type Method = 'post' | 'put' | 'patch' | 'delete';

interface Options<T> {
    onError?: (e: unknown) => void;
    onSuccess?: (result: T) => void;
}

export const useMutation = <T = unknown>(props?: {
    url?: string;
    method?: Method;
    config?: AxiosRequestConfig;
}) => {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<unknown>(null);

    return {
        pending,
        error,
        mutate: async (
            {
                url,
                config,
                body,
                method,
            }: {
                url?: string;
                method?: Method;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body?: any;
                config?: AxiosRequestConfig;
            },
            options?: Options<T>,
        ): Promise<{
            response: T | null;
            error: AxiosError | null;
        }> => {
            if (!url && !props?.url) throw new Error('Invalid url');
            if (!method && !props?.method) throw new Error('Invalid method');

            try {
                setPending(true);
                setError(null);
                const response = await axiosInstance({
                    url: url ?? props?.url,
                    method: method ?? props?.method,
                    ...props?.config,
                    ...config,
                    data: body,
                });

                options?.onSuccess?.(response.data);
                return {
                    response: response.data,
                    error: null,
                };
            } catch (error) {
                setError(error);
                options?.onError?.(error);
                return {
                    response: null,
                    error: error as AxiosError,
                };
            } finally {
                setPending(false);
            }
        },
    };
};
