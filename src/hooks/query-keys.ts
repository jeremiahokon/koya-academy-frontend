export const queryKeys = {
  slots: (provider?: string) => ['slots', provider ?? 'all'] as const,
  allSlots: ['slots'] as const,
  booking: (id: string) => ['bookings', 'one', id] as const,
  bookingsByEmail: (email: string, cursor?: string) =>
    ['bookings', 'email', email, cursor ?? 'first'] as const,
  allBookings: ['bookings'] as const,
};
