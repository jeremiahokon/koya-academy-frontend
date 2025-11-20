import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Cache Components for Next.js 16
  cacheComponents: true,

  // Turbopack is now the default bundler in Next.js 16
  // File system caching for faster development (beta)
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // Image optimization defaults updated for Next.js 16
  images: {
    // Increased from 60s to 4 hours (14400s) in Next.js 16
    minimumCacheTTL: 14400,
    // Default quality set to 75 in Next.js 16
    formats: ['image/webp'],
    // Security: Block local IP optimization by default
    dangerouslyAllowLocalIP: false,
    // Maximum redirects set to 3 in Next.js 16
    maximumRedirects: 3,
  },
};

export default nextConfig;
