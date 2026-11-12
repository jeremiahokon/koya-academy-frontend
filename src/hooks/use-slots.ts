import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { slotService } from '@/services/slot-service';
import type { NewSlot } from '@/services/types';

import { queryKeys } from './query-keys';

export const useSlots = (provider?: string) =>
  useQuery({
    queryKey: queryKeys.slots(provider),
    queryFn: () => slotService.list(provider),
  });

export const useResetSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slots: NewSlot[]) => slotService.reset(slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allSlots });
      queryClient.invalidateQueries({ queryKey: queryKeys.allBookings });
    },
  });
};
