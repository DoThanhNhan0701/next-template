import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/libs/theme-provider";
import StoreProvider from "@/components/libs/store-provider";
import QueryProvider from "@/components/libs/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Asset Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-[14px]">
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider>
              <Toaster position="top-center" />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
