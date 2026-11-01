import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (`cacheComponents`) is intentionally OFF: this template renders authenticated,
  // per-tenant pages dynamically. Enabling it requires wrapping every request-time read in <Suspense>.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
