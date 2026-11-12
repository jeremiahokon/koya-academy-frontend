import { apiClient } from './api-client';
import type { NewSlot, Slot } from './types';

export const slotService = {
  list: async (provider?: string) => {
    const { data } = await apiClient.get<{ slots: Slot[] }>('/slots', {
      params: { provider },
    });

    return data.slots;
  },

  reset: async (slots: NewSlot[]) => {
    const { data } = await apiClient.post<{ slots: NewSlot[] }>('/reset', {
      slots,
    });

    return data.slots;
  },
};
