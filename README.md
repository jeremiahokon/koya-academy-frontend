# Koya Clinic: frontend

A small Next.js 16 app for the Koya Cohort 4 clinic booking API
([backend repo](https://github.com/jeremiahokon/koya-academy-backend)). Patients see open
slots by doctor, book with name and email, look bookings up by email or reference, and
cancel. `/setup` loads a demo schedule through `POST /reset`.

## How it talks to the API

```
browser ── axios (src/services) ──▶ /api/* (Next route handler) ── axios + X-API-Key ──▶ Railway API
```

- `src/services/` — axios client (`api-client.ts`, baseURL `/api`) and one service per
  resource: `slot-service.ts` (`GET /slots`, `POST /reset`) and `booking-service.ts`
  (`POST /bookings` with `Idempotency-Key`, `GET /bookings/:id`, `DELETE /bookings/:id`,
  `GET /bookings?email=&limit=&cursor=`).
- `src/hooks/` — React Query `useQuery` / `useMutation` hooks over those services
  (`use-slots.ts`, `use-bookings.ts`); mutations invalidate the slot and booking queries.
- `src/app/api/[...path]/route.ts` — same-origin proxy. It adds `X-API-Key` on the
  server and relays the API's status, `{ error }` body and `Retry-After` unchanged, so
  **the key never reaches the browser**. Only the API's own routes are forwarded.
- Forms use `react-hook-form` for client-side validation; the API still validates.

## Environment

| Variable       | Example                                                  |
| -------------- | -------------------------------------------------------- |
| `KOYA_API_URL` | `https://koya-academy-backend-production.up.railway.app` |
| `KOYA_API_KEY` | the backend's `API_KEY` (server-only, no `NEXT_PUBLIC_`) |

## Run

```bash
pnpm install
cp .env.example .env.local   # fill in KOYA_API_KEY
pnpm dev                     # http://localhost:3000
pnpm check && pnpm build
```

Share images: edit `scripts/opengraph-image.html`, then `./scripts/render-og.sh`.

## Deploy (Vercel)

Import the repo in Vercel, set `KOYA_API_URL` and `KOYA_API_KEY` for Production (and
Preview), deploy. Because the browser only calls this app's `/api`, the backend's
`CORS_ORIGIN` does not need the Vercel URL.
