import type { MetadataRoute } from 'next';

import { siteUrl } from '@/app/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/bookings`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
