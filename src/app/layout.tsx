import { Instrument_Sans } from 'next/font/google';
import Link from 'next/link';

import type { Metadata } from 'next';

import { Providers } from '@/components/providers';

import './globals.css';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Koya Clinic',
  description: 'Book, find and cancel clinic appointments.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <header className="header">
          <div className="header-inner container">
            <Link href="/" className="brand">
              Koya Clinic
            </Link>
            <nav className="nav">
              <Link href="/">Slots</Link>
              <Link href="/bookings">My bookings</Link>
              <Link href="/setup">Setup</Link>
            </nav>
          </div>
        </header>
        <main className="container">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
