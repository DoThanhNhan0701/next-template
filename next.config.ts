process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = "true";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "10.2.5.108",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
