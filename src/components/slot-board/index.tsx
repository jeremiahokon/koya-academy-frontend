'use client';

import { useState } from 'react';
import Link from 'next/link';

import { dayKey, formatDay, formatTime } from '@/lib/format';

import { clinic } from '@/data/clinic';
import { useSlots } from '@/hooks/use-slots';
import { errorMessage } from '@/services/api-client';
import type { Slot } from '@/services/types';

function groupByDay(slots: Slot[]) {
  const days = new Map<string, Slot[]>();

  for (const slot of slots) {
    const key = dayKey(slot.start);

    days.set(key, [...(days.get(key) ?? []), slot]);
  }

  return [...days.values()];
}

export function SlotBoard() {
  const [provider, setProvider] = useState<string>();
  // Unfiltered list feeds the doctor chips; the filtered one comes from GET /slots?provider=.
  const all = useSlots();
  const filtered = useSlots(provider);

  if (all.isPending) return <p className="loading">Loading slots…</p>;

  if (all.isError) {
    return (
      <p role="alert" className="message message-error">
        Could not load slots. {errorMessage(all.error)}
      </p>
    );
  }

  if (all.data.length === 0) {
    return (
      <div className="empty">
        <p className="empty-title">No appointment slots are published yet.</p>
        <p>
          Load the demo schedule from <Link href="/setup">Setup</Link> to see
          three doctors&apos; mornings for the next five days.
        </p>
      </div>
    );
  }

  const providers = [...new Set(all.data.map((s) => s.provider))].sort();
  const shown = filtered.data ?? [];
  const openCount = shown.filter((s) => s.available).length;

  return (
    <div className="board">
      <div role="group" aria-label="Filter by doctor" className="filters">
        {[undefined, ...providers].map((p) => (
          <button
            key={p ?? 'all'}
            type="button"
            className="chip"
            aria-pressed={p === provider}
            onClick={() => setProvider(p)}
          >
            {p ?? 'All doctors'}
          </button>
        ))}
      </div>

      {filtered.isPending ? (
        <p className="loading">Loading slots…</p>
      ) : (
        <>
          <p className="board-summary" aria-live="polite">
            {openCount} open {openCount === 1 ? 'slot' : 'slots'}
            {provider ? ` with ${provider}` : ''}. Times are{' '}
            {clinic.timeZoneLabel}.
          </p>

          {groupByDay(shown).map((day) => (
            <section key={day[0].start} className="day">
              <h3>{formatDay(day[0].start)}</h3>
              <ul className="slots">
                {day.map((slot) => (
                  <li
                    key={slot.id}
                    className={slot.available ? 'slot' : 'slot slot-taken'}
                  >
                    <span className="slot-time">
                      {formatTime(slot.start)}–{formatTime(slot.end)}
                    </span>
                    <span className="slot-provider">{slot.provider}</span>
                    {slot.available ? (
                      <Link
                        href={`/book/${encodeURIComponent(slot.id)}`}
                        className="slot-action"
                        aria-label={`Book ${slot.provider} at ${formatTime(slot.start)}, ${formatDay(slot.start)}`}
                      >
                        Book
                      </Link>
                    ) : (
                      <span className="slot-action slot-action-taken">
                        Booked
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
