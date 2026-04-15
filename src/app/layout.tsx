import React from "react";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/libs/theme-provider";
import StoreProvider from "@/components/libs/store-provider";
import QueryProvider from "@/components/libs/query-provider";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Asset Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning>
      <body className="text-[14px]">
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider>
              <NextIntlClientProvider messages={messages}>
                <Toaster position="top-center" />
                {children}
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
