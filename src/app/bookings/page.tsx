import { Suspense } from 'react';

import type { Metadata } from 'next';

import { BookingsLookup } from '@/components/bookings-lookup';

import { clinic } from '@/data/clinic';

export const metadata: Metadata = {
  title: 'My bookings',
  description: `Find your ${clinic.name} bookings by email or reference.`,
  alternates: { canonical: '/bookings' },
};

export default function BookingsPage() {
  return (
    <section className="narrow">
      <h1>My bookings</h1>
      <Suspense fallback={<p className="loading">Loading…</p>}>
        <BookingsLookup />
      </Suspense>
    </section>
  );
}
