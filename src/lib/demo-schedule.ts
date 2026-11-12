import type { NewSlot } from '@/services/types';

const doctors = ['Dr Ade', 'Dr Bello', 'Dr Chukwu'];

// 30-minute slots, 9:00 to 13:00 Lagos time (UTC+1), for the next 5 days.
export function buildDemoSlots(): NewSlot[] {
  const slots: NewSlot[] = [];
  const today = new Date();

  for (let day = 1; day <= 5; day++) {
    for (const [i, provider] of doctors.entries()) {
      for (let hour = 9; hour < 13; hour += 0.5) {
        const start = new Date(today);

        start.setUTCDate(today.getUTCDate() + day);
        start.setUTCHours(Math.floor(hour) - 1, (hour % 1) * 60, 0, 0);

        const end = new Date(start.getTime() + 30 * 60_000);

        slots.push({
          id: `${start.toISOString().slice(0, 16)}-${i + 1}`,
          provider,
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }
    }
  }

  return slots;
}
