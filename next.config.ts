import type { NextConfig } from 'next';

// Built and served by Vercel (no static export): pages are prerendered at build time,
// and proxy.ts keeps English URLs prefix-free.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // [lang] is the root layout, so unmatched URLs need app/global-not-found.tsx for a styled 404.
    globalNotFound: true,
  },
};

export default nextConfig;
