import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/avinashdm/gs-images/main/**",
      },
    ],
  },
};

export default nextConfig;