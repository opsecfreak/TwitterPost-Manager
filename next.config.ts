import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'], // Twitter image domains
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
