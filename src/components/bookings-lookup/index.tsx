'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { formatDateTime } from '@/lib/format';

import { useBookingsByEmail } from '@/hooks/use-bookings';
import { getErrorMessage } from '@/services/api-client';

export function BookingsLookup() {
  const [email, setEmail] = useState('');
  const [cursor, setCursor] = useState<string>();
  const bookings = useBookingsByEmail(email, cursor);
  const { register, handleSubmit } = useForm<{ email: string }>();

  return (
    <>
      <form
        className="card form"
        onSubmit={handleSubmit((values) => {
          setEmail(values.email.trim());
          setCursor(undefined);
        })}
      >
        <label>
          Email
          <input type="email" {...register('email', { required: true })} />
        </label>
        <button type="submit" className="button">
          Show bookings
        </button>
      </form>

      {bookings.isFetching && <p>Loading…</p>}
      {bookings.isError && (
        <p className="error">{getErrorMessage(bookings.error)}</p>
      )}
      {bookings.data?.bookings.length === 0 && <p>No bookings found.</p>}

      <ul className="list">
        {bookings.data?.bookings.map((b) => (
          <li key={b.id} className="row">
            <div>
              <Link href={`/bookings/${b.id}`}>{b.id}</Link>
              <div className="muted">{formatDateTime(b.created_at)}</div>
            </div>
            <span className={b.status}>{b.status}</span>
          </li>
        ))}
      </ul>

      <div className="filters">
        {cursor && (
          <button
            type="button"
            className="chip"
            onClick={() => setCursor(undefined)}
          >
            First page
          </button>
        )}
        {bookings.data?.next_cursor && (
          <button
            type="button"
            className="chip"
            onClick={() => setCursor(bookings.data.next_cursor ?? undefined)}
          >
            Next page
          </button>
        )}
      </div>
    </>
  );
}
