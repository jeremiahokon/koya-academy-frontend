import { Suspense } from 'react';

import { BookingDetails } from '@/components/booking-details';

export default function BookingPage() {
  return (
    <>
      <h1>Booking</h1>
      <Suspense>
        <BookingDetails />
      </Suspense>
    </>
  );
}
