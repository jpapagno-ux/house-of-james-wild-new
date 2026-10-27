# Booking Live · Phase 1 — Identity & Folios

Travelers sign in by email link, save stays from the Ledger, build journeys
(Folios) and share them. No prices, holds, payments or bookings.
Everything is behind flags that default **off**.

## Supabase

| | |
| --- | --- |
| Project | JWC Booking Live (`ejewisknfobrblmkqvmh`, us-east-1) |
| Migrations | `supabase/migrations/2026102700010…500` (0001–0004 applied 27 Oct 2026; 0005 awaiting approval) |
| Seed | `python3 supabase/seed/properties.py` → 76 Ledger stays, keyed by Ledger ID |
| RLS tests | `supabase/tests/rls_phase1.sql` — 26 checks, always rolls back |

Tables: `profiles`, `organizations`, `organization_memberships`, `properties`,
`favorites`, `folios`, `folio_items`, `folio_members`, `folio_invitations`,
`travel_parties`, `travel_party_members`, `private.audit_logs`.

## Flags (Vercel → Settings → Environment Variables)

| Variable | Value | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ejewisknfobrblmkqvmh.supabase.co` | required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's publishable key | required (safe in the browser; RLS protects data) |
| `NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS` | `on` | `/account`, sign-in, `/api/v1/me/*` |
| `NEXT_PUBLIC_BOOKING_LIVE_SAVE` | `on` | "Save to My Folio" on stay pages |
| `NEXT_PUBLIC_BOOKING_LIVE_SHARE` | `on` | invitations and shared journeys |

Turn them on in **Preview** first. Production stays off until James approves.

In Supabase → Authentication → URL Configuration, set Site URL to the
production domain and add `https://*-james-papagno-projects.vercel.app/auth/callback`
and `http://localhost:3000/auth/callback` to Redirect URLs.

## Routes

Pages: `/account`, `/account/sign-in`, `/account/favorites`, `/account/folios`,
`/account/folios/[id]`, `/account/settings`, `/account/invite/[token]`.
Auth: `/auth/callback`, `/auth/sign-out`.
API: `GET/POST /api/v1/me/favorites`, `DELETE /api/v1/me/favorites/:id`,
`GET/POST /api/v1/me/folios`, `DELETE /api/v1/me/folios/:id`,
`POST /api/v1/me/folios/:id/items`, `DELETE …/items/:itemId`,
`POST /api/v1/me/folios/:id/invitations`, `DELETE …/members/:userId`,
`POST /api/v1/me/invitations/accept`, `GET/PATCH /api/v1/me/profile`.

Every response: `{ data | error: { code, message }, requestId }`, `no-store`, `noindex`.

## SEO guard

`npm run build && python3 scripts/seo-snapshot.py` compares all 126 public
pages (title, canonical, robots, JSON-LD, H1) with `tests/seo-baseline.json`.
Private routes are noindexed (meta + header), disallowed in robots.txt and
never in the sitemap. Middleware runs only on `/account`, `/auth`, `/api/v1/me`.

## Known limits (carried to later phases)

- Invite links are shown to the owner to send; branded invite emails come with the email provider.
- Rate limiting is per server instance; Vercel Firewall rules are added at launch.
- Advisor access to traveler Folios arrives with the Advisor Desk (Phase 2+).
