import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "emakiinvvsjnmuydrwxo.supabase.co",
        pathname: "/**",
      },
    ],
    // domains: ["images.pexels.com"],
  },
};

module.exports = nextConfig;
