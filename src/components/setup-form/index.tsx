'use client';

import { buildDemoSlots } from '@/lib/demo-schedule';

import { useResetSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

export function SetupForm() {
  const reset = useResetSlots();

  return (
    <div className="card">
      <p>
        Replaces all slots and deletes all bookings, then adds 30-minute slots
        for 3 doctors over the next 5 days.
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
