import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@vercel/analytics"],
  },
  turbopack: {
    root: "/Users/aibekzhumabekov/Developer/nvixio-products/typefast",
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  // Enable compression
  compress: true,
};

export default nextConfig;
