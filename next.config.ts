import createNextIntlPlugin from "next-intl/plugin";
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.2.21.177"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.2.5.247",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
