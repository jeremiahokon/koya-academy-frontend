'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatDateTime, formatTime } from '@/lib/format';

import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';

export function SlotList() {
  const [provider, setProvider] = useState<string>();
  const allSlots = useSlots();
  const slots = useSlots(provider);

  if (allSlots.isPending) return <p>Loading slots…</p>;
  if (allSlots.isError)
    return <p className="error">{getErrorMessage(allSlots.error)}</p>;

  if (allSlots.data.length === 0) {
    return (
      <p className="card">
        No slots yet. <Link href="/setup">Load the demo schedule</Link>.
      </p>
    );
  }

  const doctors = [...new Set(allSlots.data.map((s) => s.provider))].sort();

  return (
    <>
      <div className="filters">
        {[undefined, ...doctors].map((doctor) => (
          <button
            key={doctor ?? 'all'}
            type="button"
            className={doctor === provider ? 'chip active' : 'chip'}
            onClick={() => setProvider(doctor)}
          >
            {doctor ?? 'All doctors'}
          </button>
        ))}
      </div>

      <ul className="list">
        {slots.data?.map((slot) => (
          <li key={slot.id} className="row">
            <div>
              <strong>
                {formatDateTime(slot.start)}–{formatTime(slot.end)}
              </strong>
              <div className="muted">{slot.provider}</div>
            </div>
            {slot.available ? (
              <Link href={`/book/${slot.id}`} className="button">
                Book
              </Link>
            ) : (
              <span className="muted">Booked</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
