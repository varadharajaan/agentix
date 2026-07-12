import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The research API route streams NDJSON for a while on long research
  // sessions, so we give it more headroom than the default.
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
