import { Suspense } from 'react';
import Link from 'next/link';

import type { Metadata } from 'next';

import { BookingForm } from '@/components/booking-form';

export const metadata: Metadata = {
  title: 'Book a slot',
  robots: { index: false },
};

export default function BookPage() {
  return (
    <section className="narrow">
      <p>
        <Link href="/">← All slots</Link>
      </p>
      <h1>Book this slot</h1>
      <Suspense fallback={<p className="loading">Loading slot…</p>}>
        <BookingForm />
      </Suspense>
    </section>
  );
}
