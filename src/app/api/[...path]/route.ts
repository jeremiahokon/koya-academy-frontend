import { type NextRequest, NextResponse } from 'next/server';

import { koyaServer } from '@/lib/koya-server';

// Same-origin proxy for the browser's axios client: adds X-API-Key on the server,
// then relays the API's status, JSON body and Retry-After unchanged.
// Only the API's own routes are forwarded.
const ALLOWED = /^(slots|reset|bookings|bookings\/[^/]+)$/;

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Ctx) {
  const { path } = await params;
  const target = path.join('/');

  if (!ALLOWED.test(target)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const idempotencyKey = req.headers.get('idempotency-key');

  const data =
    req.method === 'POST' ? await req.json().catch(() => ({})) : undefined;

  try {
    const res = await koyaServer.request({
      url: `/${path.map(encodeURIComponent).join('/')}`,
      method: req.method,
      params: Object.fromEntries(req.nextUrl.searchParams),
      data,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    });

    const headers = new Headers({ 'Cache-Control': 'no-store' });
    const retryAfter = res.headers['retry-after'];

    if (retryAfter) headers.set('Retry-After', String(retryAfter));

    return NextResponse.json(res.data, { status: res.status, headers });
  } catch {
    return NextResponse.json(
      { error: 'the booking service is unreachable' },
      { status: 502 }
    );
  }
}

export { proxy as DELETE, proxy as GET, proxy as POST };
