import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app dir sits inside a monorepo-like workspace locally; pin the root
  // so Turbopack doesn't infer the parent directory's lockfile.
  turbopack: { root: __dirname },
};

export default nextConfig;
