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

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  });
