import { Suspense } from 'react';

import { SlotBoard } from '@/components/slot-board';

export default function HomePage() {
  return (
    <>
      <h1>Book an appointment</h1>
      <p className="muted">
        Pick a day, then an open time with the doctor you want.
      </p>
      {/* The board reads the current time to grey out started slots, so it
          renders per visit rather than in the prerendered shell. */}
      <Suspense fallback={<p className="muted">Loading the rota…</p>}>
        <SlotBoard />
      </Suspense>
    </>
  );
}
