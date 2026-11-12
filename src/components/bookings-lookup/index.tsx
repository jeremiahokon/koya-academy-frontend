'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { formatDateTime } from '@/lib/format';

import { useBookingsByEmail } from '@/hooks/use-bookings';
import { errorMessage } from '@/services/api-client';

const EMAIL = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;

function BookingList({ email }: { email: string }) {
  // Cursors of the pages visited so far; the last one is the current page.
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursors.at(-1);
  const page = useBookingsByEmail(email, cursor);

  if (page.isPending) return <p className="loading">Loading bookings…</p>;

  if (page.isError) {
    return (
      <p role="alert" className="message message-error">
        {errorMessage(page.error)}
      </p>
    );
  }

  const { bookings, next_cursor } = page.data;

  if (bookings.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No bookings for {email}.</p>
        <p>
          <Link href="/">Book a slot</Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="booking-list">
        {bookings.map((b) => (
          <li key={b.id}>
            <Link href={`/bookings/${encodeURIComponent(b.id)}`}>
              <span className={`status status-${b.status}`}>{b.status}</span>
              <span className="mono">{b.id}</span>
              <span className="muted">
                booked {formatDateTime(b.created_at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <nav aria-label="Pages" className="pager">
        {cursors.length > 1 ? (
          <button
            type="button"
            className="link-btn"
            onClick={() => setCursors((c) => c.slice(0, -1))}
          >
            ← Previous page
          </button>
        ) : null}
        {next_cursor ? (
          <button
            type="button"
            className="link-btn"
            onClick={() => setCursors((c) => [...c, next_cursor])}
          >
            Next page →
          </button>
        ) : null}
      </nav>
    </>
  );
}

export function BookingsLookup() {
  const router = useRouter();
  const initialEmail = useSearchParams().get('email') ?? '';
  const [email, setEmail] = useState(initialEmail.trim().toLowerCase());

  const emailForm = useForm<{ email: string }>({
    defaultValues: { email: initialEmail },
  });

  const refForm = useForm<{ id: string }>();

  return (
    <>
      <form
        className="form form-inline"
        noValidate
        onSubmit={emailForm.handleSubmit(({ email: value }) => {
          const next = value.trim().toLowerCase();

          setEmail(next);
          router.replace(`/bookings?email=${encodeURIComponent(next)}`, {
            scroll: false,
          });
        })}
      >
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={emailForm.formState.errors.email ? true : undefined}
            {...emailForm.register('email', {
              required: 'Enter the email you booked with.',
              pattern: { value: EMAIL, message: 'Enter a valid email.' },
            })}
          />
        </label>
        <button type="submit" className="btn">
          Show bookings
        </button>
        {emailForm.formState.errors.email ? (
          <span className="field-error">
            {emailForm.formState.errors.email.message}
          </span>
        ) : null}
      </form>

      {email ? (
        <BookingList key={email} email={email} />
      ) : (
        <p className="hint">
          Enter the email you booked with to see every booking made with it.
        </p>
      )}

      <h2>Have a reference?</h2>
      <form
        className="form form-inline"
        noValidate
        onSubmit={refForm.handleSubmit(({ id }) =>
          router.push(`/bookings/${encodeURIComponent(id.trim())}`)
        )}
      >
        <label className="field">
          <span>Booking reference</span>
          <input
            autoComplete="off"
            spellCheck={false}
            {...refForm.register('id', {
              validate: (v) =>
                v.trim().length > 0 || 'Enter a booking reference.',
            })}
          />
        </label>
        <button type="submit" className="btn">
          Open booking
        </button>
        {refForm.formState.errors.id ? (
          <span className="field-error">
            {refForm.formState.errors.id.message}
          </span>
        ) : null}
      </form>
    </>
  );
}
