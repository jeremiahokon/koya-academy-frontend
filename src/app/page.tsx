import { SlotList } from '@/components/slot-list';

export default function HomePage() {
  return (
    <>
      <h1>Book an appointment</h1>
      <p className="muted">Pick an open slot. Times are Lagos time (WAT).</p>
      <SlotList />
    </>
  );
}
