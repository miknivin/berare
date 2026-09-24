import type { NextConfig } from "next";

function getS3HostConfig(): { protocol: "http" | "https"; hostname: string } | undefined {
  if (process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE) {
    const url = new URL(process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE);
    return { protocol: url.protocol === "http:" ? "http" : "https", hostname: url.hostname };
  }
  if (process.env.NEXT_PUBLIC_S3_BUCKET_NAME && process.env.NEXT_PUBLIC_S3_REGION) {
    return {
      protocol: "https",
      hostname: `${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`,
    };
  }
  return undefined;
}

const s3Host = getS3HostConfig();

const nextConfig: NextConfig = {
  transpilePackages: ["@berare/db", "@berare/shared"],
  // See apps/storefront/next.config.ts for why — same fix for the same
  // "navigating back refetches and re-shows loading.tsx" behavior, purely
  // client-side/per-browser so it carries none of the per-user-data risk a
  // shared server cache would for this app's mostly-private data.
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    remotePatterns: s3Host
      ? [
          { protocol: s3Host.protocol, hostname: s3Host.hostname, pathname: "/products/**" },
          { protocol: s3Host.protocol, hostname: s3Host.hostname, pathname: "/banners/**" },
          { protocol: s3Host.protocol, hostname: s3Host.hostname, pathname: "/categories/**" },
        ]
      : [],
  },
};

export default nextConfig;
