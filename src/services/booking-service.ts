import { apiClient } from './api-client';
import type { Booking, BookingPage, NewBooking } from './types';

export const bookingService = {
  create: async (body: NewBooking, idempotencyKey: string) => {
    const { data } = await apiClient.post<Booking>('/bookings', body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });

    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<Booking>(`/bookings/${id}`);

    return data;
  },

  cancel: async (id: string) => {
    const { data } = await apiClient.delete<Booking>(`/bookings/${id}`);

    return data;
  },

  listByEmail: async (email: string, cursor?: string) => {
    const { data } = await apiClient.get<BookingPage>('/bookings', {
      params: { email, limit: 10, cursor },
    });

    return data;
  },
};
