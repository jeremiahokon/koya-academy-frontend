'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { formatDateTime } from '@/lib/format';

import { useBookingsByEmail } from '@/hooks/use-bookings';
import { getErrorMessage } from '@/services/api-client';

export function BookingsLookup() {
  const [email, setEmail] = useState('');
  const bookings = useBookingsByEmail(email);
  const items = bookings.data?.pages.flatMap((page) => page.bookings) ?? [];
  const { register, handleSubmit } = useForm<{ email: string }>();

  return (
    <>
      <form
        className="card form"
        onSubmit={handleSubmit((values) => {
          setEmail(values.email.trim());
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

      {bookings.isPending && email && <p>Loading…</p>}
      {bookings.isError && (
        <p className="error">{getErrorMessage(bookings.error)}</p>
      )}
      {bookings.isSuccess && items.length === 0 && <p>No bookings found.</p>}

      <ul className="list">
        {items.map((b) => (
          <li key={b.id} className="row">
            <div>
              <Link href={`/bookings/${b.id}`}>{b.id}</Link>
              <div className="muted">{formatDateTime(b.created_at)}</div>
            </div>
            <span className={b.status}>{b.status}</span>
          </li>
        ))}
      </ul>

      {bookings.hasNextPage && (
        <button
          type="button"
          className="button"
          disabled={bookings.isFetchingNextPage}
          onClick={() => bookings.fetchNextPage()}
        >
          {bookings.isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
    </>
  );
}
