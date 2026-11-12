'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';

import { formatDateTime, formatTime } from '@/lib/format';

import { useCreateBooking } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

type Fields = { name: string; email: string };

export function BookingForm() {
  const { slotId } = useParams<{ slotId: string }>();
  const router = useRouter();
  const slots = useSlots();
  const createBooking = useCreateBooking();

  // Same key on a double submit = same booking. New key after an error.
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  );

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
        onSuccess: (booking) => router.push(`/bookings/${booking.id}`),
        onError: () => setIdempotencyKey(crypto.randomUUID()),
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
        <p className="error">{getErrorMessage(createBooking.error)}</p>
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
