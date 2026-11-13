'use client';

import { buildDemoSlots, MAX_DEMO_SLOTS } from '@/lib/demo-schedule';

import { useResetSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

export function SetupForm() {
  const reset = useResetSlots();

  return (
    <div className="card">
      <p>
        Replaces all slots and deletes all bookings, then adds the next{' '}
        {MAX_DEMO_SLOTS} half-hour slots from tomorrow morning, shared across 3
        doctors.
      </p>
      {reset.isError && <p className="error">{getErrorMessage(reset.error)}</p>}
      {reset.isSuccess && (
        <p className="success">Loaded {reset.data.length} slots.</p>
      )}
      <button
        type="button"
        className="button danger"
        disabled={reset.isPending}
        onClick={() => reset.mutate(buildDemoSlots())}
      >
        {reset.isPending ? 'Loading…' : 'Load demo schedule'}
      </button>
    </div>
  );
}
