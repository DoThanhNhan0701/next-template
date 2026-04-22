import QueryProvider from "@/components/libs/query-provider";
import StoreProvider from "@/components/libs/store-provider";
import { ThemeProvider } from "@/components/libs/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import React from "react";
import "./globals.css";

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
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <QueryProvider>
              <ThemeProvider>
                <Toaster position="top-center" />
                {children}
              </ThemeProvider>
            </QueryProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
