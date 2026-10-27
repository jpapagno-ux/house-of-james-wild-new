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
3. James (or finance) fills **Approved By**, **Approved At** and **Approved Revision**
   (= the card's **Revision**) → Status **Published**.
4. The sync copies it to Supabase in **one database transaction per card**
   (`apply_rate_card`). Anything wrong refuses the **whole card** (the site keeps
   its previous version) and is explained in **Sync Log**. Cards deleted from
   Airtable are retired; stored quotes keep their price.

The sync refuses: missing approver on a published card · rates outside the
card's dates · a room from another property · negative money · malformed
cancellation tiers · two published cards for one property with overlapping dates ·
**Sample Data cards anywhere except Preview** · an approval for a different
revision · rates changed after approval without a new Revision · offers above 90%
or a "stay N" outside 2–30 · stays, occupancy or priority outside sane limits ·
an offer naming another property's rate plan.

Each partner also carries **Stay Type** (Lodge · Resort · Family Residence) and
**Rate Source** (Rate Card · Live API), so rates can be filtered and reported by
category and source. Live API partners keep pricing from their card until their
connection is certified (Phase 4).

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

## Independent review (27 Oct 2026): 11 findings, all fixed

| # | Finding | Fix |
| --- | --- | --- |
| R1 | Preview and Production share one database, so a sample card could price Production | Cards carry `is_sample`; Production never loads them |
| R2 | Unbounded percent offers | 1–90% in Airtable, engine and a database check |
| R3 | Sync wrote rows piecewise; no sane limits | One transaction per card; occupancy, stay and priority limits |
| R4 | Approval not tied to the content approved | Approved Revision must equal Revision; content hash refuses silent edits |
| R5 | Offer could name another property's plan | Refused in mapper and database |
| R6 | A promo code could raise the price | A code only unlocks; best price always wins |
| R7 | Overlap checked only within one sync | Checked against published cards in the database; deleted cards retired |
| R8 | Approval didn't check the card was unchanged | Approval refused if the card changed after the quote |
| R9 | Visitors could read approver and contract fields | Column-level grants |
| R10 | Card end date, time zone, search leaking booking mode | Fixed |
| R11 | Quote lock missed some priced columns | Every priced column locked |

**One manual step:** run `supabase/manual/0010b_apply_rate_card.sql` once in
the Supabase SQL editor. Until then the sync refuses every card (safely) and the
grants in R9 are not yet narrowed.

**Recommendation:** give Preview its own Supabase project before real contracted
rates go in. The `is_sample` guard makes the shared database safe for now; a
separate staging database is what the spec's environment separation asks for.

## Known limits (next phases)

- The Advisor Desk screens live in Base44 (Phase 3 dashboards); today advisors
  approve through `POST /api/v1/ops/quotes/:id/approve`.
- Quotes are held 72 hours. Expiry is shown to the traveler; a nightly job to
  mark expired quotes arrives with the reconciliation jobs in Phase 3.
- Currency conversion is not applied: prices show in the card's currency.
- Advisor-recorded bookings (a lodge or trip booked by phone or email) go into
  the Phase 3 bookings table and the Base44 Advisor Desk.
- Voyages and vessels (departure date, year, vessel, cabin category, per-person
  price, rate card or published-website source) are proposed as Phase 2b,
  always on request.
