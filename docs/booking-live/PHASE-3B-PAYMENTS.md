# Booking Live · Phase 3b — Payments and the Advisor Desk

Branch `feature/payments-v1` (on top of `feature/traveler-dashboard-v1`).

## The rule

Checkout charges **exactly the stored booking**: the amount is decided on the
server from the booking's money position (`nextPayment`: the outstanding
deposit first, then the balance), written as a pending `payments` row, and only
then handed to the gateway. The gateway's webhook settles the row by id; the
amount in the event is never trusted. `settle_payment` moves
`deposit_paid_minor` / `balance_paid_minor` forward and the booking's status with
them (confirmed → deposit_paid → paid), in one transaction, refusing anything
above what is owed and ignoring repeated events.

## The gateway seam

`lib/booking-live/payments/gateway.ts` — one interface (`createCheckout`), one
implementation (Stripe Checkout, plain HTTPS, no SDK) chosen by env. Nothing in
the booking flow knows which gateway is behind it; adding another is one file.
Keys live only in Vercel env (type Sensitive) and are never logged or returned.

| Env (server) | Where | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS` | Preview first | `on` shows Pay buttons (needs QUOTES) |
| `PAYMENTS_PROVIDER` | Preview first | `stripe` or unset (off) |
| `STRIPE_SECRET_KEY` | Sensitive | `sk_test_…` on Preview, `sk_live_…` on Production later |
| `STRIPE_WEBHOOK_SECRET` | Sensitive | the endpoint secret for `POST /api/v1/payments/stripe` |

Stripe dashboard: add the webhook endpoint `https://<deployment>/api/v1/payments/stripe`
for `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, `checkout.session.expired`. Test with
Stripe's test cards on the Preview before any live key exists. **The house adds
these keys itself; the agent never handles them.**

## Routes

| Call | Who | Effect |
| --- | --- | --- |
| `POST /api/v1/me/bookings/:id/pay` | traveler | pending payment for the next amount due → gateway checkout URL |
| `POST /api/v1/payments/stripe` | Stripe | settles / fails the payment the event names |
| `POST /api/v1/ops/bookings/:id/payments` `{ kind, amountMinor, reference?, note? }` | advisor | records a bank transfer / phone card and settles it |

## Screens

- **Trips** (`/account/trips`): *Pay deposit · US$…* / *Pay balance · US$…* on a
  booking (flag on), receipts under the card, thank-you / no-charge lines after
  returning from checkout.
- **Advisor Desk** (`/desk`, advisor or admin role): the queue — Hold, Confirm
  (after the property confirms), Decline, Record booking (converts the approved
  quote) — and live bookings with Record payment received. Every action calls the
  ops routes; the server checks the role and the rules again.

## Data

`supabase/migrations/20261101000200_payments.sql` — `payments` (reference `P-…`,
booking, kind deposit/balance/other, amount, provider stripe/manual, provider
reference and settling event, status pending/succeeded/failed/refunded), RLS
(travelers read their own, house reads all, server writes), `settle_payment()`,
and a `profiles_select_house` policy so the desk can show travelers' names.
Applied to JWC Booking Live 1 Nov 2026; `settle_payment` dry-run verified
(deposit → deposit_paid, repeat ignored, balance → paid).

## Still open

- Refunds (status `refunded` exists; no route yet) and the balance-due reminder.
- Receipt emails; the Advisor Desk in Base44 calling the same routes.
- `supabase/manual/0011b_hold_status.sql` must be run for Hold to work.

## 3b(ii) — refunds, cancellation, the balance reminder (1 Nov 2026)

- **Refunds** `POST /api/v1/ops/payments/:id/refund { amountMinor?, note? }` —
  part or all of a settled payment. Gateway payments are refunded at Stripe
  first (against the payment intent the webhook stored in `provider_charge`),
  then recorded; manual ones are recorded. `refund_payment()` moves the
  booking's paid columns back and its status with them; a fully refunded
  payment reads `refunded`. Dry-run verified.
- **Cancel / stayed** `POST /api/v1/ops/bookings/:id/cancel { note? }` or
  `{ stayed: true }` — a status change only; money moves only through refunds.
- **Balance reminder** `GET /api/v1/internal/reminders/balance-due` — Vercel
  Cron daily at 13:00 UTC (`vercel.json`), `CRON_SECRET` or the sync secret.
  One email per booking whose balance is due within 14 days and still owing
  (overdue included), through Resend when `RESEND_API_KEY` is set, otherwise
  a dry run that lists what it would send. `balance_reminder_sent_at` makes it
  once-only. Trips shows *Balance due in N days* on the card.
- Desk: Refund beside each settled payment, Mark stayed, Cancel booking.

Migration `supabase/migrations/20261101000300_refunds_reminders.sql` (applied).
