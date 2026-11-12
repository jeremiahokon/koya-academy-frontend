import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clinic } from '@/data/clinic';
import { bookingService } from '@/services/booking-service';
import type { NewBooking } from '@/services/types';

import { queryKeys } from './query-keys';

export const useBooking = (id: string) =>
  useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => bookingService.get(id),
  });

export const useBookingsByEmail = (email: string, cursor?: string) =>
  useQuery({
    queryKey: queryKeys.bookingsByEmail(email, cursor),
    queryFn: () =>
      bookingService.listByEmail(email, clinic.bookingsPageSize, cursor),
    enabled: email.length > 0,
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      idempotencyKey,
    }: {
      body: NewBooking;
      idempotencyKey: string;
    }) => bookingService.create(body, idempotencyKey),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.booking(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.allSlots });
      queryClient.invalidateQueries({ queryKey: queryKeys.allBookings });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.booking(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.allSlots });
      queryClient.invalidateQueries({
        queryKey: ['bookings', 'email'],
      });
    },
  });
};
