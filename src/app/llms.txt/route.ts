import { siteUrl } from '@/app/site';

import { clinic, faqs } from '@/data/clinic';

export function GET() {
  const body = [
    `# ${clinic.name}`,
    '',
    `> ${clinic.description}`,
    '',
    '## Pages',
    '',
    `- [Open slots](${siteUrl}/): appointment slots by doctor, with a Book link on each open one`,
    `- [My bookings](${siteUrl}/bookings): find bookings by email, oldest first, or open one by reference`,
    '',
    '## FAQ',
    '',
    ...faqs.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
