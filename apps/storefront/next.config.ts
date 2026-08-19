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
