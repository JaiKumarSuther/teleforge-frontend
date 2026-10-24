import type { NextConfig } from "next";

// TeleForge's web app keeps auth in the browser (JWT in localStorage) and fetches
// everything client-side from the Express API, so Cache Components / partial
// prefetching bring no benefit here and are left off.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Only bundle the icons actually imported from Phosphor's barrel file.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
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
