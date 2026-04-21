import createNextIntlPlugin from "next-intl/plugin";
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.2.21.177"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.30.69",
        port: "8002",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
