import localFont from 'next/font/local';

import type { Metadata } from 'next';

import Providers from '@/components/providers';

import './globals.css';
import '../../public/custom-icons.css';

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter/Inter_18pt-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/inter/Inter_18pt-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/satoshi/Satoshi-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

const k2d = localFont({
  src: [
    {
      path: '../../public/fonts/K2D/K2D-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/K2D/K2D-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-k2d',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dokita',
    template: '%s | Dokita',
  },
  description: 'Dokita Admin Panel',
  authors: [{ name: 'Dokita' }],
  creator: 'Dokita',
  publisher: 'Dokita',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${satoshi.variable} ${k2d.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
