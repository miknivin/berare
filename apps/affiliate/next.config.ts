import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@berare/db", "@berare/shared"],
};

export default nextConfig;
