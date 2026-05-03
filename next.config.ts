import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/api/upload",
        headers: [{ key: "x-middleware-prefetch", value: "" }],
      },
    ];
  },
};

export default nextConfig;
