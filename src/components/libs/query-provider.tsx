"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 5,    // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important! It avoids re-creating the query client
        // if React suspends during the initial render.
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // NOTE: Avoid useState when initializing the query client if you want
    // to use it in more than one place or across renders safely in Next.js
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
