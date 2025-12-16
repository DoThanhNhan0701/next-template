import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/libs/theme-provider";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
