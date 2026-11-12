import { apiClient } from './api-client';
import type { Booking, BookingPage, NewBooking } from './types';

export const bookingService = {
  // POST /bookings, with an Idempotency-Key so a double submit returns the same booking.
  create: async (body: NewBooking, idempotencyKey: string) => {
    const { data } = await apiClient.post<Booking>('/bookings', body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });

    return data;
  },

  // GET /bookings/:id
  get: async (id: string) => {
    const { data } = await apiClient.get<Booking>(
      `/bookings/${encodeURIComponent(id)}`
    );

    return data;
  },

  // DELETE /bookings/:id
  cancel: async (id: string) => {
    const { data } = await apiClient.delete<Booking>(
      `/bookings/${encodeURIComponent(id)}`
    );

    return data;
  },

  // GET /bookings?email=&limit=&cursor=
  listByEmail: async (email: string, limit: number, cursor?: string) => {
    const { data } = await apiClient.get<BookingPage>('/bookings', {
      params: { email, limit, ...(cursor ? { cursor } : {}) },
    });

    return data;
  },
};
