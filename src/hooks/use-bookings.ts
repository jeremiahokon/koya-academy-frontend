import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { bookingService } from '@/services/booking-service';
import type { NewBooking } from '@/services/types';

export const useBooking = (id: string) =>
  useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
  });

// Cursor pagination: each page's next_cursor fetches the next one; null means the last page.
export const useBookingsByEmail = (email: string) =>
  useInfiniteQuery({
    queryKey: ['bookings', email],
    queryFn: ({ pageParam }) => bookingService.listByEmail(email, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
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
