'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { BookingsTable } from '@/components/bookings-table';

import { useBookingsByEmail } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

const PAGE_SIZES = [5, 10, 20, 50]; // the API accepts a limit of 1 to 50

export function BookingsLookup() {
  const router = useRouter();
  const email = useSearchParams().get('email') ?? '';
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const bookings = useBookingsByEmail(email, pageSize);
  const slots = useSlots();
  const { register, handleSubmit } = useForm({ defaultValues: { email } });

  const pages = bookings.data?.pages ?? [];
  const page = pages[pageIndex];

  // The API pages by cursor and sends no total, so we know whether a next page
  // exists but not how many are left.
  const hasNext = pageIndex + 1 < pages.length || bookings.hasNextPage;
  const firstRow = pageIndex * pageSize + 1;

  const goNext = async () => {
    if (pageIndex + 1 >= pages.length) {
      const result = await bookings.fetchNextPage();

      if (result.isError) return;
    }

    setPageIndex(pageIndex + 1);
  };

  return (
    <>
      <form
        className="lookup"
        onSubmit={handleSubmit((values) => {
          setPageIndex(0);
          router.replace(
            `/bookings?email=${encodeURIComponent(values.email.trim())}`
          );
        })}
      >
        <label className="lookup-field">
          <span className="sr-only">Email</span>
          <input
            type="email"
            placeholder="The email you booked with"
            {...register('email', { required: true })}
          />
        </label>
        <button type="submit" className="button">
          Find bookings
        </button>
      </form>

      {!email && (
        <p className="muted">
          Enter the email you used when booking to see every appointment made
          with it.
        </p>
      )}

      {email && bookings.isPending && <p className="muted">Loading…</p>}
      {bookings.isError && (
        <p className="error">{getErrorMessage(bookings.error)}</p>
      )}
      {page && page.bookings.length === 0 && (
        <div className="empty">
          <p>
            No bookings for <strong>{email}</strong>.
          </p>
          <Link href="/" className="button">
            See open slots
          </Link>
        </div>
      )}

      {page && page.bookings.length > 0 && (
        <section className="table-card">
          <header className="table-head">
            <h2>
              Bookings for <span className="email">{email}</span>
            </h2>
          </header>

          <BookingsTable bookings={page.bookings} slots={slots.data} />

          <footer className="pager">
            <span className="muted">
              Showing {firstRow}–{firstRow + page.bookings.length - 1}
              {hasNext ? ', more after this page' : ', end of list'}
            </span>

            <label className="page-size">
              Rows
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageIndex(0);
                  setPageSize(Number(e.target.value));
                }}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <nav className="pager-buttons" aria-label="Pages">
              <button
                type="button"
                className="pager-button"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(pageIndex - 1)}
              >
                <span aria-hidden>← </span>Previous
              </button>
              <span className="page-number" aria-current="page">
                Page {pageIndex + 1}
              </span>
              <button
                type="button"
                className="pager-button"
                disabled={!hasNext || bookings.isFetchingNextPage}
                onClick={goNext}
              >
                {bookings.isFetchingNextPage ? 'Loading…' : 'Next'}
                <span aria-hidden> →</span>
              </button>
            </nav>
          </footer>
        </section>
      )}
    </>
  );
}
