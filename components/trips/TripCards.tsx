import Link from "next/link";
import { bookingWords, quoteState, STATE_WORDS, timeline, type BookingRow, type QuoteRow, type TravelerState } from "@/lib/booking-live/bookings";
import { fmtMinor, niceDate, niceWhen } from "@/lib/booking-live/money";
import { nextPayment } from "@/lib/booking-live/payments/core";
import PayButton from "./PayButton";

export type PaymentRow = { id: string; public_reference: string; kind: string; amount_minor: number | string; refunded_minor?: number | string; currency: string; status: string; provider: string; succeeded_at: string | null; created_at: string };

// The traveler's trips, as cards: a request (quote) with its state and
// timeline, or a booking with its money position. Quiet, editorial, no
// dashboard chrome: one line per fact, a timeline of six dots.

const TONE: Record<TravelerState, string> = { waiting: "ledger-muted", held: "text-rust", confirmed: "text-vol-stays", booked: "text-vol-stays", declined: "ledger-muted", expired: "ledger-muted" };

export function Timeline({ state }: { state: TravelerState }) {
  const steps = timeline(state);
  if (state === "declined" || state === "expired") return null;
  return (
    <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-label="Progress">
      {steps.map((s) => (
        <li key={s.step} className={`flex items-center gap-1.5 text-[12.5px] ${s.done || s.current ? "" : "ledger-muted"}`}>
          <span className={`w-2 h-2 rounded-full ${s.done ? "bg-vol-stays" : s.current ? "bg-rust" : "border ledger-border"}`} aria-hidden="true" />
          {s.step}
        </li>
      ))}
    </ol>
  );
}

export function RequestCard({ q, propertyName, roomName }: { q: QuoteRow; propertyName: string; roomName: string | null }) {
  const state = quoteState(q);
  const w = STATE_WORDS[state];
  return (
    <li className="border ledger-border p-5 md:p-6">
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
        <div>
          <p className={`ledger-eyebrow ${TONE[state]}`}>{w.label}{state === "held" && q.held_until ? ` · until ${niceWhen(q.held_until)}` : ""}</p>
          <h3 className="ledger-display text-[1.5rem] leading-tight mt-1"><Link href={`/booking/quote/${q.id}`} className="hover:text-crimson">{roomName ? `${roomName} at ${propertyName}` : propertyName}</Link></h3>
          <p className="mt-1 text-[14px] ledger-muted">{niceDate(q.arrival_date)} → {niceDate(q.departure_date)} · request {q.public_reference}</p>
        </div>
        <div className="text-right">
          <p className="ledger-display text-[1.6rem] leading-none">{fmtMinor(q.grand_total_minor, q.currency)}</p>
          <p className="text-[12.5px] ledger-muted">deposit {fmtMinor(q.deposit_due_minor, q.currency)}{q.balance_due_date ? ` · balance ${niceDate(q.balance_due_date)}` : ""}</p>
        </div>
      </div>
      <p className="mt-3 text-[15px] max-w-2xl">{w.line}</p>
      <Timeline state={state} />
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/booking/quote/${q.id}`} className="ledger-btn-ghost">See the request</Link>
        {state === "expired" && <Link href={`/booking/property/${q.property_slug}`} className="ledger-btn-ghost">Price these dates again</Link>}
      </div>
    </li>
  );
}

export function BookingCard({ b, propertyName, roomName, payments = [] }: { b: BookingRow; propertyName: string; roomName: string | null; payments?: PaymentRow[] }) {
  const w = bookingWords(b);
  const due = nextPayment(b);
  const receipts = payments.filter((p) => p.status === "succeeded" || p.status === "refunded");
  const state: TravelerState = b.status === "cancelled" ? "declined" : "booked";
  const paid = Number(b.deposit_paid_minor) + Number(b.balance_paid_minor);
  return (
    <li className="border ledger-border p-5 md:p-6">
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
        <div>
          <p className={`ledger-eyebrow ${b.status === "cancelled" ? "ledger-muted" : "text-vol-stays"}`}>{w.label}</p>
          <h3 className="ledger-display text-[1.5rem] leading-tight mt-1">{roomName ? `${roomName} at ${propertyName}` : propertyName}</h3>
          <p className="mt-1 text-[14px] ledger-muted">{niceDate(b.arrival_date)} → {niceDate(b.departure_date)} · booking {b.public_reference}{b.partner_confirmation_number ? ` · ${propertyName} ref ${b.partner_confirmation_number}` : ""}</p>
        </div>
        <div className="text-right">
          <p className="ledger-display text-[1.6rem] leading-none">{fmtMinor(b.grand_total_minor, b.currency)}</p>
          <p className="text-[12.5px] ledger-muted">{paid > 0 ? `${fmtMinor(paid, b.currency)} paid · ` : ""}{w.outstandingMinor > 0 ? `${fmtMinor(w.outstandingMinor, b.currency)} to pay` : "nothing to pay"}</p>
        </div>
      </div>
      <p className="mt-3 text-[15px] max-w-2xl">{w.line}</p>
      {b.status !== "cancelled" && (
        <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-label="Progress">
          {["Requested", "Confirmed by the house", "Booked", "Deposit paid", "Balance paid", "Stayed"].map((step, i) => {
            const reached = b.status === "stayed" ? 5 : b.status === "paid" ? 4 : b.status === "deposit_paid" ? 3 : 2;
            return <li key={step} className={`flex items-center gap-1.5 text-[12.5px] ${i <= reached ? "" : "ledger-muted"}`}><span className={`w-2 h-2 rounded-full ${i < reached ? "bg-vol-stays" : i === reached ? "bg-rust" : "border ledger-border"}`} aria-hidden="true" />{step}</li>;
          })}
        </ol>
      )}
      {due && due.kind === "balance" && b.balance_due_date && <p className="mt-3 text-[14px] text-rust">{(() => { const d = Math.round((Date.parse(`${b.balance_due_date}T00:00:00Z`) - Date.now()) / 86_400_000); return d < 0 ? `Balance was due ${niceDate(b.balance_due_date)}.` : d === 0 ? "Balance is due today." : `Balance due in ${d} day${d === 1 ? "" : "s"}, ${niceDate(b.balance_due_date)}.`; })()}</p>}
      {b.traveler_note && <p className="mt-4 text-[14.5px] border-l-2 border-rust/50 pl-3">{b.traveler_note}</p>}
      {receipts.length > 0 && (
        <ul className="mt-4 text-[13.5px] ledger-muted grid gap-1" aria-label="Payments received">
          {receipts.map((p) => <li key={p.id}>{p.kind === "deposit" ? "Deposit" : p.kind === "balance" ? "Balance" : "Payment"} received · {fmtMinor(p.amount_minor, p.currency)} · {p.succeeded_at ? niceWhen(p.succeeded_at) : ""} · receipt {p.public_reference}{Number(p.refunded_minor ?? 0) > 0 ? ` · ${fmtMinor(p.refunded_minor!, p.currency)} refunded` : ""}</li>)}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {due && b.status !== "cancelled" && <PayButton bookingId={b.id} label={`Pay ${due.kind === "deposit" ? "deposit" : "balance"} · ${fmtMinor(due.amountMinor, b.currency)}`} />}
        <Link href={`/plan?trip=${encodeURIComponent(propertyName)}`} className="ledger-btn-ghost">Talk to the house about this trip</Link>
      </div>
    </li>
  );
}
