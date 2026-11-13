'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import { formatDateTime, formatTime } from '@/lib/format';

import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const justBooked = useSearchParams().has('new');
  const booking = useBooking(id);
  const slots = useSlots();
  const cancel = useCancelBooking();

  if (booking.isPending) return <p>Loading…</p>;
  if (booking.isError)
    return <p className="error">{getErrorMessage(booking.error)}</p>;

  const b = booking.data;
  const slot = slots.data?.find((s) => s.id === b.slot_id);

  return (
    <>
      {justBooked && b.status === 'confirmed' && (
        <p className="success">
          You&apos;re booked. Keep the reference below to find this booking
          again.
        </p>
      )}

      <div className="card">
        <dl className="details">
          <dt>Status</dt>
          <dd className={b.status}>{b.status}</dd>
          <dt>Appointment</dt>
          <dd>
            {slot
              ? `${formatDateTime(slot.start)}–${formatTime(slot.end)}`
              : '—'}
          </dd>
          <dt>Doctor</dt>
          <dd>{slot?.provider ?? '—'}</dd>
          <dt>Name</dt>
          <dd>{b.name}</dd>
          <dt>Email</dt>
          <dd>{b.email}</dd>
          <dt>Reference</dt>
          <dd>{b.id}</dd>
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

      <p>
        <Link href={`/bookings?email=${encodeURIComponent(b.email)}`}>
          All bookings for {b.email}
        </Link>
      </p>
    </>
  );
}
