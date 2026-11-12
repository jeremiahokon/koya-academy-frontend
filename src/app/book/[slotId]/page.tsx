import { Suspense } from 'react';

import { BookingForm } from '@/components/booking-form';

export default function BookPage() {
  return (
    <>
      <h1>Book slot</h1>
      <Suspense>
        <BookingForm />
      </Suspense>
    </>
  );
}
