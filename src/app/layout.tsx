import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/libs/theme-provider";
import { Providers } from "@/components/libs/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Template",
  description: "Next Template by Nhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
