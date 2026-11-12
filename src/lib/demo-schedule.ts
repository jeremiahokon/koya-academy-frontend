import { demoSchedule } from '@/data/clinic';
import type { NewSlot } from '@/services/types';

// Slots from tomorrow on, in clinic-local hours. Lagos is UTC+1 all year (no DST).
const WAT_OFFSET_MINUTES = 60;

export function buildDemoSlots(now = new Date()): NewSlot[] {
  const { providers, days, firstHour, lastHour, slotMinutes } = demoSchedule;
  const slots: NewSlot[] = [];

  for (let d = 1; d <= days; d++) {
    const midnightUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + d
    );

    const date = new Date(midnightUtc).toISOString().slice(0, 10);

    providers.forEach((provider, p) => {
      for (let m = firstHour * 60; m < lastHour * 60; m += slotMinutes) {
        const start = new Date(midnightUtc + (m - WAT_OFFSET_MINUTES) * 60_000);
        const hhmm = `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`;

        slots.push({
          id: `${date.replaceAll('-', '')}-${hhmm}-${p + 1}`,
          provider,
          start: start.toISOString(),
          end: new Date(start.getTime() + slotMinutes * 60_000).toISOString(),
        });
      }
    });
  }

  return slots;
}
