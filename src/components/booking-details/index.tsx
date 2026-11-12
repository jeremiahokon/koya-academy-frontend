'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import { formatDateTime } from '@/lib/format';

import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { errorMessage } from '@/services/api-client';

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const justBooked = useSearchParams().get('booked') === '1';
  const booking = useBooking(decodeURIComponent(id));
  const slots = useSlots();
  const cancel = useCancelBooking();

  if (booking.isPending) return <p className="loading">Loading booking…</p>;

  if (booking.isError) {
    return (
      <div className="empty">
        <p className="empty-title">
          {booking.error.status === 404
            ? 'No booking has that reference.'
            : `Could not load this booking. ${errorMessage(booking.error)}`}
        </p>
        <p>
          <Link href="/bookings">Look up your bookings by email</Link>
        </p>
      </div>
    );
  }

  const b = booking.data;
  const slot = slots.data?.find((s) => s.id === b.slot_id);

  return (
    <>
      {justBooked && b.status === 'confirmed' ? (
        <p role="status" className="message message-ok">
          You are booked. Keep your reference to find this booking later.
        </p>
      ) : null}
      {cancel.isSuccess ? (
        <p role="status" className="message message-ok">
          Booking cancelled. The slot is open again.
        </p>
      ) : null}

      <div className="ticket">
        <p className="ticket-label">
          <span className={`status status-${b.status}`}>{b.status}</span>
        </p>
        <p className="ticket-provider">{slot?.provider ?? 'Appointment'}</p>
        {slot ? <p>{formatDateTime(slot.start)}</p> : null}
        <dl className="details">
          <dt>Reference</dt>
          <dd className="mono">{b.id}</dd>
          <dt>Name</dt>
          <dd>{b.name}</dd>
          <dt>Email</dt>
          <dd>{b.email}</dd>
          <dt>Booked</dt>
          <dd>{formatDateTime(b.created_at)}</dd>
        </dl>
      </div>

      {cancel.isError ? (
        <p role="alert" className="message message-error">
          {errorMessage(cancel.error)}
        </p>
      ) : null}

      {b.status === 'confirmed' ? (
        <button
          type="button"
          className="btn btn-danger"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate(b.id)}
        >
          {cancel.isPending ? 'Cancelling…' : 'Cancel booking'}
        </button>
      ) : null}

      <p>
        <Link href={`/bookings?email=${encodeURIComponent(b.email)}`}>
          All bookings for {b.email}
        </Link>
      </p>
    </>
  );
}
