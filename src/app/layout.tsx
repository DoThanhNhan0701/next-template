import StoreProvider from "@/components/libs/store-provider";
import { ThemeProvider } from "@/components/libs/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://asset.aiminds.io.vn"),
  title: {
    default: "Asset Management | Premium Dashboard Template",
    template: "%s | Asset Management",
  },
  description: "A professional, enterprise-ready Asset Management System built with Next.js, Tailwind CSS, and Shadcn UI. Features real-time tracking, advanced reporting, and a sleek, modern interface.",
  keywords: ["asset management", "inventory tracking", "dashboard template", "next.js", "react", "enterprise saas", "admin dashboard"],
  authors: [{ name: "Asset Management Team", url: "https://asset.aiminds.io.vn" }],
  creator: "Asset Management Team",
  publisher: "Asset Management Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Asset Management | Professional Dashboard Template",
    description: "Launch your next enterprise project with our premium Asset Management System. Built for scale and performance.",
    url: "https://asset.aiminds.io.vn",
    siteName: "Asset Management System",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asset Management | Professional Dashboard Template",
    description: "Launch your next enterprise project with our premium Asset Management System.",
    creator: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
            <ThemeProvider>
              <Toaster position="top-center" />
              {children}
            </ThemeProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
