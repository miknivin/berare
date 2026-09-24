import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@berare/db", "@berare/shared"],
  // See apps/storefront/next.config.ts for why — same fix for the same
  // "navigating back refetches and re-shows loading.tsx" behavior, purely
  // client-side/per-browser so it carries none of the per-user-data risk a
  // shared server cache would for this app's private affiliate data.
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
