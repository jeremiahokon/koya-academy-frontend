export type Slot = {
  id: string;
  provider: string;
  start: string;
  end: string;
  available: boolean;
};

export type NewSlot = Omit<Slot, 'available'>;

export type Booking = {
  id: string;
  slot_id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
};

export type NewBooking = Pick<Booking, 'slot_id' | 'name' | 'email'>;

export type BookingPage = { bookings: Booking[]; next_cursor: string | null };
