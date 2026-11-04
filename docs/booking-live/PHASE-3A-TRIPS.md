# Booking Live · Phase 3a — Trips: requests, holds, bookings

Branch `feature/traveler-dashboard-v1` (on top of `feature/leeu-stay-page-v1`).
The traveler's dashboard grows from "a shelf of ideas" to "where my trips are":
every request the house is working on, rooms on hold, and the bookings
themselves — with the money position in plain words. Payments are Phase 3b.

## What the traveler sees

- `/account` — a **Trips** card (booked · with the house) beside Saved stays and Journeys.
- `/account/trips` — four shelves: **Booked**, **With the house** (waiting · room on
  hold · confirmed), **Earlier requests** (declined · expired), **Stayed & cancelled**.
  Each card: state, dates, total, deposit and balance date, a six-step timeline
  (Requested → Confirmed by the house → Booked → Deposit paid → Balance paid → Stayed),
  the house's note on a booking, and the partner's confirmation number.
- `/booking/quote/<id>` — the same state words and timeline; a held quote says
  *until <date>*; a converted quote links to its booking.

States (`lib/booking-live/bookings.ts`): `waiting`, `held`, `confirmed`, `booked`,
`declined`, `expired`. Holds extend the 72-hour price window to the hold's end.

## What the house does (ops routes, advisor or admin role)

| Call | Effect |
| --- | --- |
| `POST /api/v1/ops/quotes/:id/hold` `{ heldUntil, note? }` | pending/held → **held** until `heldUntil` (≤ 30 days); price window extended |
| `POST /api/v1/ops/quotes/:id/approve` `{ decision, availability: "confirmed_by_property", note? }` | pending/held → **approved** (or declined); card must be unchanged since the quote |
| `POST /api/v1/ops/bookings` `{ quoteId, partnerConfirmationNumber?, travelerNote? }` | approved quote → **booking** (every figure copied from the immutable quote); quote → `converted` |
| `POST /api/v1/ops/bookings` `{ travelerUserId, propertySlug, roomCode?, arrival, departure, adults, children?, currency, grandTotalMinor, depositDueMinor?, balanceDueDate?, partnerConfirmationNumber?, travelerNote? }` | advisor-recorded booking (phone/email with the partner, COMMERCIAL-RULES §4) |

The Advisor Desk screens (Base44) call these through the server. Until then the
house uses them directly (curl/Postman with an advisor session).

## Data

`supabase/migrations/20261101000100_holds_bookings.sql`:
- `quotes.held_until`, `quotes.hold_note`; `advisor_status` gains `held`.
- `bookings`: reference `B-XXXXXXXX`, traveler, quote (unique), property, unit,
  source (`traveler_quote` | `advisor`), partner confirmation number, dates, party,
  currency, `grand_total_minor`, `deposit_due_minor`, `deposit_paid_minor`,
  `balance_paid_minor`, `balance_due_date`, status (`confirmed` · `deposit_paid` ·
  `paid` · `cancelled` · `stayed`), traveler note, advisor. RLS: travelers read
  their own; advisors/admins read all; writes server-only; audited.

**Applied 1 Nov 2026:** columns, table, indexes, RLS. **Still to run by hand**
(the MCP's confirmation for `drop constraint` is auto-cancelled in agent
sessions): `supabase/manual/0011b_hold_status.sql` — until it runs, the hold
route answers *Holds aren't enabled yet* and everything else works.

## Next (3b)

Payments: a `payments` ledger, deposit and balance checkout charging exactly the
stored quote, `deposit_paid_minor` / `balance_paid_minor` moving only through
those routes, the balance-due reminder, and the traveler's receipts on the
booking card. Gateway choice open (Stripe is the obvious first).
