import { apiClient } from './api-client';
import type { NewSlot, Slot } from './types';

export const slotService = {
  // GET /slots?provider=
  list: async (provider?: string) => {
    const { data } = await apiClient.get<{ slots: Slot[] }>('/slots', {
      params: provider ? { provider } : undefined,
    });

    return data.slots;
  },

  // POST /reset: replaces every slot and deletes every booking.
  reset: async (slots: NewSlot[]) => {
    const { data } = await apiClient.post<{ slots: NewSlot[] }>('/reset', {
      slots,
    });

    return data.slots;
  },
};
