import type { NextConfig } from 'next';

// Built and served by Vercel (no static export): pages are prerendered at build time,
// and proxy.ts keeps English URLs prefix-free.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
