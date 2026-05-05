import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
  turbopack: {
    // Explicitly pin the filesystem root so Turbopack's PostCSS worker pool
    // resolves modules from this project, not the parent c:\dev directory.
    root: __dirname,
  },
  webpack: (config) => {
    // Fallback fix for --webpack mode: ensure project node_modules is searched first.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;
