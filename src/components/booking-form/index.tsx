'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { formatDay, formatTime } from '@/lib/format';

import { clinic } from '@/data/clinic';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useSlots } from '@/hooks/use-slots';
import { errorMessage } from '@/services/api-client';

type Fields = { name: string; email: string };

export function BookingForm() {
  const { slotId } = useParams<{ slotId: string }>();
  const id = decodeURIComponent(slotId);
  const router = useRouter();
  const slots = useSlots();
  const createBooking = useCreateBooking();
  // One Idempotency-Key per attempt. The API replays a key only with the same body,
  // so after an error the corrected form gets a fresh key or it would answer 422.
  const idempotencyKey = useRef('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>();

  if (slots.isPending) return <p className="loading">Loading slot…</p>;

  if (slots.isError) {
    return (
      <p role="alert" className="message message-error">
        {errorMessage(slots.error)}
      </p>
    );
  }

  const slot = slots.data.find((s) => s.id === id);

  if (!slot) {
    return (
      <div className="empty">
        <p className="empty-title">This slot no longer exists.</p>
        <p>
          <Link href="/">Back to open slots</Link>
        </p>
      </div>
    );
  }

  const onSubmit = (fields: Fields) => {
    idempotencyKey.current ||= crypto.randomUUID();
    createBooking.mutate(
      {
        body: { slot_id: slot.id, ...fields },
        idempotencyKey: idempotencyKey.current,
      },
      {
        onSuccess: (booking) =>
          router.push(`/bookings/${encodeURIComponent(booking.id)}?booked=1`),
        onError: () => {
          idempotencyKey.current = '';
        },
      }
    );
  };

  return (
    <>
      <div className="ticket">
        <p className="ticket-label">Appointment</p>
        <p className="ticket-provider">{slot.provider}</p>
        <p>
          {formatDay(slot.start)}, {formatTime(slot.start)}–
          {formatTime(slot.end)} ({clinic.timeZoneLabel})
        </p>
      </div>

      {slot.available || createBooking.isPending || createBooking.isSuccess ? (
        <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="field">
            <span>Full name</span>
            <input
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              {...register('name', {
                validate: (v) => v.trim().length > 0 || 'Enter your name.',
              })}
            />
            {errors.name ? (
              <span className="field-error">{errors.name.message}</span>
            ) : null}
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={errors.email ? true : undefined}
              {...register('email', {
                required: 'Enter your email.',
                pattern: {
                  value: /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/,
                  message: 'Enter a valid email, like ada@example.com.',
                },
              })}
            />
            {errors.email ? (
              <span className="field-error">{errors.email.message}</span>
            ) : null}
          </label>

          {createBooking.isError ? (
            <p role="alert" className="message message-error">
              {errorMessage(createBooking.error)}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn"
            disabled={createBooking.isPending || createBooking.isSuccess}
          >
            {createBooking.isPending || createBooking.isSuccess
              ? 'Booking…'
              : 'Confirm booking'}
          </button>
        </form>
      ) : (
        <div className="empty">
          <p className="empty-title">Someone has just booked this slot.</p>
          <p>
            <Link href="/">Choose another slot</Link>
          </p>
        </div>
      )}
    </>
  );
}
