// Every fact the site states lives here. The clinic is the Koya Cohort 4 assessment's
// demo clinic: there is no real address, phone or opening hours, so none are stated.

export const clinic = {
  name: 'Koya Clinic',
  tagline: 'Book a clinic appointment in under a minute',
  description:
    'Koya Clinic appointment booking: see open slots by doctor, book with your name and email, look up or cancel a booking any time.',
  // Slot times are stored in UTC by the API; they are shown in this zone.
  // [ASM] The assessment does not name the clinic's zone; Lagos matches the API's sample data (Dr Ade, Ada Obi).
  timeZone: 'Africa/Lagos',
  // Lagos has no daylight saving, so the label is fixed.
  timeZoneLabel: 'Lagos time (WAT)',
  bookingsPageSize: 10,
};

export const navLinks = [
  { href: '/', label: 'Open slots' },
  { href: '/bookings', label: 'My bookings' },
  { href: '/setup', label: 'Setup' },
];

// Demo schedule loaded from /setup (POST /reset). Times are clinic-local hours.
export const demoSchedule = {
  providers: ['Dr Ade', 'Dr Bello', 'Dr Chukwu'],
  days: 5,
  firstHour: 9,
  lastHour: 13,
  slotMinutes: 30,
};

// One array feeds the visible FAQ, the FAQPage JSON-LD and /llms.txt.
// Every answer describes how the booking API actually behaves.
export const faqs = [
  {
    question: 'How do I book an appointment?',
    answer:
      'Pick an open slot on the Open slots page, enter your name and email, and confirm. The booking is confirmed straight away and you get a booking reference.',
  },
  {
    question: 'Can two people book the same slot?',
    answer:
      'No. A slot holds one confirmed booking. If someone books it a moment before you, you will see that the slot is already booked and can choose another.',
  },
  {
    question: 'How do I find my bookings?',
    answer:
      'Open My bookings and enter the email you booked with. Your bookings are listed oldest first, ten to a page. You can also open a single booking by its reference.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'Open the booking and choose Cancel booking. The slot is released immediately so someone else can take it. A cancelled booking cannot be cancelled again.',
  },
  {
    question: 'What if I press Book twice?',
    answer:
      'Each booking form carries a one-time key, so a repeated submit returns the same booking instead of creating a second one.',
  },
  {
    question: 'Why was I asked to wait before booking again?',
    answer:
      'Each email address can make five booking attempts per minute. After that the form tells you how many seconds to wait.',
  },
  {
    question: 'Can I book a slot that has already started?',
    answer: 'No. Only slots that have not started yet can be booked.',
  },
];
