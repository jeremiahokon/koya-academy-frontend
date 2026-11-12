'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { buildDemoSlots } from '@/lib/demo-schedule';

import { demoSchedule } from '@/data/clinic';
import { useResetSlots } from '@/hooks/use-slots';
import { errorMessage } from '@/services/api-client';

export function SetupForm() {
  const reset = useResetSlots();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ confirm: boolean }>();

  return (
    <form
      className="form"
      noValidate
      onSubmit={handleSubmit(() => reset.mutate(buildDemoSlots()))}
    >
      <label className="check">
        <input
          type="checkbox"
          {...register('confirm', {
            required:
              'Tick the box to confirm that all bookings will be deleted.',
          })}
        />
        <span>I understand all bookings will be deleted</span>
      </label>
      {errors.confirm ? (
        <span className="field-error">{errors.confirm.message}</span>
      ) : null}

      {reset.isError ? (
        <p role="alert" className="message message-error">
          {errorMessage(reset.error)}
        </p>
      ) : null}
      {reset.isSuccess ? (
        <p role="status" className="message message-ok">
          Loaded {reset.data.length} slots across{' '}
          {demoSchedule.providers.length} doctors.{' '}
          <Link href="/">See open slots</Link>
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-danger"
        disabled={reset.isPending}
      >
        {reset.isPending
          ? 'Loading…'
          : 'Replace all data with the demo schedule'}
      </button>
    </form>
  );
}
