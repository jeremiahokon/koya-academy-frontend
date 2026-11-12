import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookingService } from '@/services/booking-service';
import type { NewBooking } from '@/services/types';

export const useBooking = (id: string) =>
  useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
  });

export const useBookingsByEmail = (email: string, cursor?: string) =>
  useQuery({
    queryKey: ['bookings', email, cursor],
    queryFn: () => bookingService.listByEmail(email, cursor),
    enabled: Boolean(email),
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { body: NewBooking; idempotencyKey: string }) =>
      bookingService.create(input.body, input.idempotencyKey),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
