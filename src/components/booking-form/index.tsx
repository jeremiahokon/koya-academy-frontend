'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { formatDateTime, formatTime } from '@/lib/format';

import { useCreateBooking } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage, getStatus } from '@/services/api-client';

type Fields = { name: string; email: string };

export function BookingForm() {
  const { slotId } = useParams<{ slotId: string }>();
  const router = useRouter();
  const slots = useSlots();
  const createBooking = useCreateBooking();

  // One Idempotency-Key per booking attempt, made in the browser with
  // crypto.randomUUID(). A double click or a retry after a dropped connection
  // resends the same key, so the API replays its first answer instead of
  // booking twice.
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  );

  // The API stores its 4xx answers under the key (except 429), so after one of
  // those a corrected form needs a new key, or it gets 422 "key reused". With
  // no answer, a 5xx or a 429, keep the key: the retry is the same request.
  const keyIsSpent = (error: unknown) => {
    const status = getStatus(error);

    return status !== undefined && status < 500 && status !== 429;
  };

  const { register, handleSubmit, formState } = useForm<Fields>();

  const slot = slots.data?.find((s) => s.id === decodeURIComponent(slotId));

  if (slots.isPending) return <p>Loading…</p>;
  if (!slot) return <p className="card">This slot does not exist.</p>;

  const onSubmit = (fields: Fields) =>
    createBooking.mutate(
      {
        body: { slot_id: slot.id, ...fields },
        idempotencyKey,
      },
      {
        onSuccess: (booking) => router.push(`/bookings/${booking.id}?new=1`),
        onError: (error) => {
          if (keyIsSpent(error)) setIdempotencyKey(crypto.randomUUID());
        },
      }
    );

  return (
    <form className="card form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p>
        <strong>{slot.provider}</strong>
        <br />
        {formatDateTime(slot.start)}–{formatTime(slot.end)}
      </p>

      <label>
        Name
        <input {...register('name', { required: 'Name is required' })} />
      </label>
      {formState.errors.name && (
        <p className="error">{formState.errors.name.message}</p>
      )}

      <label>
        Email
        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Email is invalid' },
          })}
        />
      </label>
      {formState.errors.email && (
        <p className="error">{formState.errors.email.message}</p>
      )}

      {createBooking.isError && (
        <p className="error">
          {getErrorMessage(createBooking.error)}
          {getStatus(createBooking.error) === 409 && (
            <>
              {' '}
              <Link href="/">Pick another slot</Link>.
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        className="button"
        disabled={createBooking.isPending || createBooking.isSuccess}
      >
        {createBooking.isPending ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  );
}
