import { Faq } from '@/components/faq';
import { SlotBoard } from '@/components/slot-board';

import { clinic } from '@/data/clinic';

export default function Home() {
  return (
    <>
      <section className="intro">
        <h1>{clinic.tagline}</h1>
        <p className="lede">
          Choose an open slot, leave your name and email, and you are booked. No
          account needed.
        </p>
      </section>

      <section aria-labelledby="slots-heading">
        <h2 id="slots-heading">Open slots</h2>
        <SlotBoard />
      </section>

      <Faq />
    </>
  );
}
