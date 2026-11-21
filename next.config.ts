import type { NextConfig } from 'next';

// Built and served by Vercel (no static export): pages are prerendered at build time,
// and proxy.ts keeps English URLs prefix-free.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 90 is for the small project thumbnails (archive rows, archive link), which look soft at 75.
  images: { qualities: [75, 90] },
  experimental: {
    // [lang] is the root layout, so unmatched URLs need app/global-not-found.tsx for a styled 404.
    globalNotFound: true,
  },
};

export default nextConfig;
