import { Suspense } from 'react';

import type { Metadata } from 'next';

import { BookingDetails } from '@/components/booking-details';

export const metadata: Metadata = {
  title: 'Your booking',
  robots: { index: false },
};

export default function BookingPage() {
  return (
    <section className="narrow">
      <h1>Your booking</h1>
      <Suspense fallback={<p className="loading">Loading booking…</p>}>
        <BookingDetails />
      </Suspense>
    </section>
  );
}
