import { clinic } from '@/data/clinic';

const zone = { timeZone: clinic.timeZone } as const;

export const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    ...zone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    ...zone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    ...zone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));

// Calendar date in the clinic zone, used to group slots by day.
export const dayKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', zone).format(new Date(iso));
