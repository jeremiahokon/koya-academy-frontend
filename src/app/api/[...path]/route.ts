import { type NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

// Forwards browser calls to the API and adds the X-API-Key header here on the
// server, so the key never reaches the browser.
const api = axios.create({
  baseURL: process.env.KOYA_API_URL,
  headers: { 'X-API-Key': process.env.KOYA_API_KEY },
  validateStatus: () => true, // pass the API's status codes straight through
});

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const idempotencyKey = req.headers.get('idempotency-key');

  const res = await api.request({
    url: `/${path.join('/')}`,
    method: req.method,
    params: Object.fromEntries(req.nextUrl.searchParams),
    data: req.method === 'POST' ? await req.json() : undefined,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
  });

  // A 429 says how long to wait in Retry-After; pass it on to the browser.
  const retryAfter = res.headers['retry-after'];

  return NextResponse.json(res.data, {
    status: res.status,
    headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {},
  });
}

export { proxy as DELETE, proxy as GET, proxy as POST };
