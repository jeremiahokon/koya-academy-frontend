import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pages are a prerendered shell; live API reads stream in under <Suspense>.
  cacheComponents: true,
};

export default nextConfig;
