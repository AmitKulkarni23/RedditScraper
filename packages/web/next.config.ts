import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reddit-scraper/shared"],
};

export default nextConfig;
