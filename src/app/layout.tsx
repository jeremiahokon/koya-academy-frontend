import { Instrument_Sans } from 'next/font/google';

import type { Metadata, Viewport } from 'next';

import { JsonLd } from '@/components/json-ld';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';

import { siteUrl } from '@/app/site';

import { clinic } from '@/data/clinic';

import './globals.css';

// One variable file covers every weight used (400 body, 600 headings and buttons).
// next/font downloads it at build time and serves it from this origin.
const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${clinic.name}: book a clinic appointment online`,
    template: `%s | ${clinic.name}`,
  },
  description: clinic.description,
  alternates: { canonical: '/' },
  applicationName: clinic.name,
  openGraph: {
    type: 'website',
    siteName: clinic.name,
    title: `${clinic.name}: book a clinic appointment online`,
    description: clinic.description,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f1ea' },
    { media: '(prefers-color-scheme: dark)', color: '#121816' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={sans.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="wrap">
          <Providers>{children}</Providers>
        </main>
        <footer className="wrap site-footer">
          <p>
            {clinic.name} · Koya Academy Cohort 4 assessment ·{' '}
            {clinic.timeZoneLabel}
          </p>
        </footer>
        <JsonLd />
      </body>
    </html>
  );
}
