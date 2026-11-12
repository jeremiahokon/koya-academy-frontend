import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { slotService } from '@/services/slot-service';
import type { NewSlot } from '@/services/types';

export const useSlots = (provider?: string) =>
  useQuery({
    queryKey: ['slots', provider],
    queryFn: () => slotService.list(provider),
  });

export const useResetSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slots: NewSlot[]) => slotService.reset(slots),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
