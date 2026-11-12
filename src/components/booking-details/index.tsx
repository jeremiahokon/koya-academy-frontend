'use client';

import { useParams } from 'next/navigation';

import { formatDateTime } from '@/lib/format';

import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import { getErrorMessage } from '@/services/api-client';

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const booking = useBooking(id);
  const cancel = useCancelBooking();

  if (booking.isPending) return <p>Loading…</p>;
  if (booking.isError)
    return <p className="error">{getErrorMessage(booking.error)}</p>;

  const b = booking.data;

  return (
    <div className="card">
      <dl className="details">
        <dt>Status</dt>
        <dd className={b.status}>{b.status}</dd>
        <dt>Reference</dt>
        <dd>{b.id}</dd>
        <dt>Slot</dt>
        <dd>{b.slot_id}</dd>
        <dt>Name</dt>
        <dd>{b.name}</dd>
        <dt>Email</dt>
        <dd>{b.email}</dd>
        <dt>Booked</dt>
        <dd>{formatDateTime(b.created_at)}</dd>
      </dl>

      {cancel.isError && (
        <p className="error">{getErrorMessage(cancel.error)}</p>
      )}

      {b.status === 'confirmed' && (
        <button
          type="button"
          className="button danger"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate(b.id)}
        >
          {cancel.isPending ? 'Cancelling…' : 'Cancel booking'}
        </button>
      )}
    </div>
  );
}
