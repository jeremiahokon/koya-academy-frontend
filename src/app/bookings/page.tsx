import { Suspense } from 'react';

import { BookingsLookup } from '@/components/bookings-lookup';

export default function BookingsPage() {
  return (
    <>
      <h1>My bookings</h1>
      <Suspense>
        <BookingsLookup />
      </Suspense>
    </>
  );
}
