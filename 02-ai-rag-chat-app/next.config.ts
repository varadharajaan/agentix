import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module; pdf-parse reads Node's fs. Neither
  // should be bundled for the edge or the client - they only ever run
  // inside API routes declared `export const runtime = "nodejs"`.
  serverExternalPackages: ["better-sqlite3", "pdf-parse"],
};

export default nextConfig;
