import type { MetadataRoute } from 'next';

import { clinic } from '@/data/clinic';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: clinic.name,
    short_name: clinic.name,
    description: clinic.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f1ea',
    theme_color: '#0e4f45',
    icons: [
      { src: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
