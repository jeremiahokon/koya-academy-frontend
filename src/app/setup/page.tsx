import type { Metadata } from 'next';

import { SetupForm } from '@/components/setup-form';

import { demoSchedule } from '@/data/clinic';

export const metadata: Metadata = {
  title: 'Setup',
  robots: { index: false },
};

export default function SetupPage() {
  const { providers, days, firstHour, lastHour, slotMinutes } = demoSchedule;

  return (
    <section className="narrow">
      <h1>Load the demo schedule</h1>
      <p>
        Publishes {slotMinutes}-minute slots from {firstHour}:00 to {lastHour}
        :00 for {providers.join(', ')} over the next {days} days.
      </p>
      <p className="message message-warn">
        This calls <code>POST /reset</code>, which replaces every slot and
        deletes every booking.
      </p>
      <SetupForm />
    </section>
  );
}
