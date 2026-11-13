'use client';

import { useState } from 'react';
import Link from 'next/link';

import { dayKey, dayParts, formatLongDate, formatTime } from '@/lib/format';

import { useSlots } from '@/hooks/use-slots';
import { getErrorMessage } from '@/services/api-client';
import type { Slot } from '@/services/types';

// A slot that has started can't be booked (the API answers 400).
const isOpen = (slot: Slot, now: number) =>
  slot.available && new Date(slot.start).getTime() > now;

// The day's rota: times down the side, doctors across the top, like the
// appointment ledger at a clinic's front desk.
export function SlotBoard() {
  const [now] = useState(() => Date.now());
  const [provider, setProvider] = useState<string>();
  const [pickedDay, setPickedDay] = useState<string>();

  const allSlots = useSlots();
  // Filtering by doctor uses the API's ?provider= query.
  const doctorSlots = useSlots(provider);

  if (allSlots.isPending) return <p className="muted">Loading the rota…</p>;
  if (allSlots.isError)
    return <p className="error">{getErrorMessage(allSlots.error)}</p>;

  if (allSlots.data.length === 0) {
    return (
      <div className="empty">
        <p>No appointments are scheduled yet.</p>
        <Link href="/setup" className="button">
          Load the demo schedule
        </Link>
      </div>
    );
  }

  const slots = (provider ? doctorSlots.data : allSlots.data) ?? [];
  const doctors = [...new Set(allSlots.data.map((s) => s.provider))].sort();
  const columns = provider ? [provider] : doctors;

  // Days in order, each with how many slots are still open.
  const days = new Map<string, { first: string; open: number }>();

  for (const slot of allSlots.data) {
    const key = dayKey(slot.start);
    const day = days.get(key) ?? { first: slot.start, open: 0 };

    if (isOpen(slot, now) && (!provider || slot.provider === provider)) {
      day.open++;
    }

    days.set(key, day);
  }

  const dayKeys = [...days.keys()].sort();

  const day =
    pickedDay && days.has(pickedDay)
      ? pickedDay
      : (dayKeys.find((k) => days.get(k)!.open > 0) ?? dayKeys[0]);

  const daySlots = slots.filter((s) => dayKey(s.start) === day);
  const times = [...new Set(daySlots.map((s) => formatTime(s.start)))].sort();

  const at = (time: string, doctor: string) =>
    daySlots.find((s) => s.provider === doctor && formatTime(s.start) === time);

  const openToday = daySlots.filter((s) => isOpen(s, now)).length;

  return (
    <div className="rota">
      <div className="day-strip" role="tablist" aria-label="Days">
        {dayKeys.map((key) => {
          const { weekday, day: date, month } = dayParts(days.get(key)!.first);
          const open = days.get(key)!.open;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === day}
              className={key === day ? 'day active' : 'day'}
              onClick={() => setPickedDay(key)}
            >
              <span className="day-weekday">{weekday}</span>
              <span className="day-date">{date}</span>
              <span className="day-month">{month}</span>
              <span className="day-open">
                {open === 0 ? 'Full' : `${open} open`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rota-head">
        <div>
          <h2>{formatLongDate(days.get(day)!.first)}</h2>
          <p className="muted">
            {openToday === 0
              ? 'Nothing left to book on this day.'
              : `${openToday} of ${daySlots.length} slots open · Lagos time`}
          </p>
        </div>

        <div className="doctor-filter" role="group" aria-label="Doctor">
          {[undefined, ...doctors].map((doctor) => (
            <button
              key={doctor ?? 'all'}
              type="button"
              aria-pressed={doctor === provider}
              className={doctor === provider ? 'chip active' : 'chip'}
              onClick={() => setProvider(doctor)}
            >
              {doctor ?? 'All doctors'}
            </button>
          ))}
        </div>
      </div>

      <div
        className="board"
        style={{ '--doctors': columns.length } as React.CSSProperties}
        aria-busy={doctorSlots.isFetching}
      >
        <div className="board-corner" />
        {columns.map((doctor) => (
          <div key={doctor} className="board-doctor">
            {doctor}
          </div>
        ))}

        {times.map((time) => (
          <div
            key={time}
            className={time.endsWith(':00') ? 'board-row hour' : 'board-row'}
          >
            <div className="board-time">
              {time.endsWith(':00') ? time : <span>{time.slice(2)}</span>}
            </div>

            {columns.map((doctor) => {
              const slot = at(time, doctor);

              if (!slot) return <div key={doctor} className="tile none" />;

              const label = `${doctor}, ${formatTime(slot.start)}–${formatTime(slot.end)}`;

              if (isOpen(slot, now)) {
                return (
                  <Link
                    key={doctor}
                    href={`/book/${slot.id}`}
                    className="tile open"
                    aria-label={`Book ${label}`}
                  >
                    <span className="tile-action">Book</span>
                  </Link>
                );
              }

              const state = slot.available ? 'passed' : 'booked';

              return (
                <div
                  key={doctor}
                  className={`tile ${state}`}
                  aria-label={`${label}, ${state}`}
                >
                  <span className="tile-action">
                    {state === 'booked' ? 'Booked' : 'Passed'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <ul className="legend" aria-label="Key">
        <li>
          <span className="swatch open" /> Open
        </li>
        <li>
          <span className="swatch booked" /> Booked
        </li>
        <li>
          <span className="swatch passed" /> Already started
        </li>
      </ul>
    </div>
  );
}
