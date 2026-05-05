import createNextIntlPlugin from "next-intl/plugin";
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.2.21.177"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.30.69",
        port: "8002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "asset-api.aiminds.io.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "asset.aiminds.io.vn",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
