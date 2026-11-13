// Slot times are UTC from the API; show them in Lagos time.
const timeZone = 'Africa/Lagos';

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

export const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });

// The Lagos calendar day a time falls on, as YYYY-MM-DD, for grouping slots.
export const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone });

// Day parts for the day strip: "Fri", "13", "Nov".
export const dayParts = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).formatToParts(new Date(iso));

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  return { weekday: get('weekday'), day: get('day'), month: get('month') };
};
