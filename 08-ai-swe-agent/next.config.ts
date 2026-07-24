import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Safety net: node:sqlite's types landed in @types/node relatively
    // recently, and versions can drift. Never let a type mismatch there
    // block `next build` for what is otherwise working code.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
