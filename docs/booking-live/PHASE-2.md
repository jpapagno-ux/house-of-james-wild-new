# Booking Live · Phase 2 — Commercial Rate Cards

Contracted seasonal rates are edited in Airtable, approved there, synced to
Supabase, and priced night by night on the site. Every price is labelled
**Request to Reserve**: a contracted card is never proof of a free room.

## Where things live

| What | Where |
| --- | --- |
| Editing desk | Airtable base **James Wild & Co — Commercial Rates (Booking Live)** (`appvlwIuBrNrlqaRr`) |
| Tables | Properties · Room Types · Rate Plans · Rate Cards · Seasonal Rates · Taxes & Fees · Promotions · Restrictions · Contract Terms (private) · Sync Log |
| Database | Supabase migrations 0007–0009: `room_types`, `rate_plans`, `rate_card_versions`, `seasonal_rate_rules`, `inventory_restrictions`, `promotions`, `tax_fee_rules`, `quotes`; private `contract_terms`, `rate_sync_runs` |
| Engine | `lib/booking-live/pricing/engine.ts` (pure, integer cents, basis points) |
| Sync | `lib/booking-live/rates/airtable-map.ts` (validation) + `sync.ts`; `POST /api/v1/internal/rates/sync` |
| Screens | `/booking/property/[slug]` (Check Availability) · `/booking/quote/[id]` (saved request) |
| API | `POST /api/v1/availability/search` · `POST /api/v1/quotes` · `POST /api/v1/ops/quotes/:id/approve` |
| Tests | `tests/pricing-engine.test.ts`, `tests/airtable-map.test.ts`, `tests/phase2-gate.test.ts`, `supabase/tests/rls_phase2.sql` (12/12) |

## Pricing order (James, 27 Oct 2026)

room nights by season − offers + local taxes/fees the rate excludes + **7% Florida
sales tax** on that sum = total → deposit now (or everything, inside the balance
window) → balance by the due date. Taxes already in the rate are shown, not added.

## How a card reaches the site

1. Enter or update the card in Airtable (Status **Draft**).
2. Check the seasons, taxes and terms → Status **Submitted**.
3. James (or finance) fills **Approved By** → Status **Published**.
4. The sync copies it to Supabase. Anything wrong refuses the **whole card**
   (the site keeps its previous version) and is explained in **Sync Log**.

The sync refuses: missing approver on a published card · rates outside the
card's dates · a room from another property · negative money · malformed
cancellation tiers · two published cards for one property with overlapping dates ·
**Sample Data cards anywhere except Preview**.

To change a published price: duplicate the card as a new version (e.g. 2027-V2),
or edit and bump **Revision** — every stored quote keeps the price it was given.

## Environment (Vercel)

| Variable | Where | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_BOOKING_LIVE_QUOTES` | Preview | `on` |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview (Production later) · type **Sensitive** | Supabase → Project Settings → API Keys → `service_role` / secret key |
| `AIRTABLE_TOKEN` | Preview · **Sensitive** | Airtable personal access token: scopes `data.records:read`, `data.records:write` (Sync Log only), base = Commercial Rates |
| `AIRTABLE_RATES_BASE_ID` | Preview | `appvlwIuBrNrlqaRr` |
| `BOOKING_LIVE_SYNC_SECRET` | Preview · **Sensitive** | any 32+ random characters |
| `BOOKING_LIVE_ALLOW_SAMPLE_RATES` | **Preview only** | `on` |

Never add `BOOKING_LIVE_ALLOW_SAMPLE_RATES` to Production. Even if it were added
there, the sync ignores it whenever `VERCEL_ENV=production`.

## Sample data

`SAMPLE-2027-V1` on Leeu Estates (Manor House Suite, B&B, USD) is **illustrative**.
It was loaded into Supabase on 27 Oct 2026 with the same mapper the sync uses
(`tests/tools/plan-to-sql.ts`) so the preview can be tested before the server
keys exist. Replace it with the contracted card when it arrives, and untick
**Sample Data**.

## Known limits (next phases)

- The Advisor Desk screens live in Base44 (Phase 3 dashboards); today advisors
  approve through `POST /api/v1/ops/quotes/:id/approve`.
- Quotes are held 72 hours. Expiry is shown to the traveler; a nightly job to
  mark expired quotes arrives with the reconciliation jobs in Phase 3.
- Currency conversion is not applied: prices show in the card's currency.
