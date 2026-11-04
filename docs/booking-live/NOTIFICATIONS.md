# Booking Live · notifications (Phase 3c, 1 Nov 2026)

What the traveler and the house receive by email at each step of a request,
booking and payment. Words live in `lib/booking-live/notify/emails.ts` (pure,
tested in `tests/notify.test.ts`); sending in `lib/booking-live/notify/send.ts`;
the per-event dispatch in `lib/booking-live/notify/index.ts`.

## Rules

- **From `myfolio@jameswildco.com`, reference in every subject** (James, 25 Oct
  2026): `Your request Q-ABCD1234 · Lion Sands`, `Booked · B-1A2B3C4D · …`,
  `Deposit received · US$3,742.22 · B-… · …`. Reply-to is the trips inbox
  (`hello@jameswildco.com`), so a traveler's reply lands with the house.
- **Never on the critical path.** Every send runs after the HTTP response
  (`next/server` `after`) inside a try/catch: a slow or failed email never slows
  or fails a request, hold, booking or payment. Failures are logged as
  `{"notify": "<event>", "error": …}` / `{"mail": "failed", …}`.
- **Dry run without a key.** With no `RESEND_API_KEY` the sender logs
  `{"mail":"dry-run","to":…,"subject":…}` and returns `dry` — Preview shows what
  would go out without sending.
- **Only real data.** Partner reference, balance date, hold note and traveler
  note appear only when set; a declined request quotes no money; names and
  notes are HTML-escaped.
- Money renders from minor units in the booking's currency (`money()`).

## Events

| Event | Route | Traveler | House (`hello@`) |
| --- | --- | --- | --- |
| Request to Reserve stored | `POST /api/v1/quotes` | *Your request Q-… · stay*: dates, party, total, deposit, held-until, "nothing has been charged" | *Request Q-…: name · room at stay* with a desk link |
| Room held | `POST /ops/quotes/:id/hold` | *Room on hold until <date> · Q-…* (+ hold note) | — |
| Approved | `POST /ops/quotes/:id/approve` | *Confirmed by the house · Q-…*: price, deposit, what happens next | — |
| Declined | same, `decision: declined` | *Those dates aren't available · Q-…* | — |
| Booking recorded | `POST /ops/bookings` (either shape) | *Booked · B-…*: partner ref, total, deposit, balance date; "Pay the deposit" when payments are on, else "the house will send the deposit details" | — |
| Payment settled | Stripe webhook; `POST /ops/bookings/:id/payments` | *Deposit/Balance received · amount · B-…*: receipt P-…, paid so far, what remains and when, or "paid in full" | *deposit received amount · B-… · name · stay* |
| Balance reminder | cron (Phase 3b(ii)) | already in `lib/booking-live/reminders.ts` | — |

Refunds and cancellations have no automatic email yet: the house writes those
by hand (an advisor conversation, not a template). Easy to add later as
`onRefund` in the same shape.

## Env

- `RESEND_API_KEY` — set by the house; absent = dry run.
- `FOLIO_FROM` — override the from line (default `James Wild & Co · My Folio <myfolio@jameswildco.com>`; the domain must be verified in Resend).
- `BOOKING_LIVE_HOUSE_TO` — override the house copy inbox (default `hello@jameswildco.com`).

## Checks before merge

`npm test` (127 incl. `tests/notify.test.ts`), `tsc --noEmit`, `npm run build`.
On Preview without a key: make a request on `/booking/property/lion-sands` and
read the function log for the two `dry-run` lines.

## End-to-end chain, verified 1 Nov 2026 (database layer)

Run against the shared Booking Live database inside one transaction that was
rolled back (nothing left behind), on River Lodge Luxury Room, 3 nights
10–13 Jun 2027, the worked example from `LION-SANDS-CHECKOUT.md`:

| Step | Result |
| --- | --- |
| 1 Request to Reserve | `Q-…` quoted · pending · total 12,474.06 · deposit 3,742.22 |
| 2 Hold | **refused** — `advisor_status` check still `pending|approved|declined` until the house runs `supabase/manual/0011b_hold_status.sql` |
| 3 Approve | approved · availability confirmed_by_property |
| 4 Booking from the quote | `B-…` confirmed, figures copied from the quote; quote → converted |
| 5 Deposit via gateway (`settle_payment`, repeated event) | deposit_paid · 3,742.22 paid; the repeat ignored |
| 6 Overpayment | refused: *payment exceeds what is owed* |
| 7 Balance (manual) | paid · 12,474.06 paid · 0 outstanding |
| 8 Partial refund 1,000.00 on the balance | payment refunded 1,000.00 · booking back to deposit_paid |
| 8b Refund beyond the payment | refused: *refund exceeds what remains of this payment* |
| 9 Cancel | cancelled · cancelled_at set |

The HTTP routes and the emails above sit on top of exactly these calls; the
browser click-through on the Vercel Preview is still owed once the Preview's
authentication is lifted (the agent's Vercel connection cannot open it).
