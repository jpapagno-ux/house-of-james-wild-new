"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/booking-live/client";
import { fmtMinor, niceDate, niceWhen } from "@/lib/booking-live/money";
import { nextPayment } from "@/lib/booking-live/payments/core";
import type { TravelerState } from "@/lib/booking-live/bookings";

// The desk's working list. Each action calls an /api/v1/ops route and
// refreshes; the server checks the advisor role and every rule again.

type Person = { first_name: string | null; last_name: string | null } | null;
type Q = { id: string; public_reference: string; state: TravelerState; advisor_status: string; expires_at: string; held_until: string | null; hold_note: string | null; arrival_date: string; departure_date: string; adults: number; children: number; grand_total_minor: number | string; deposit_due_minor: number | string; balance_due_date: string | null; currency: string; created_at: string; advisor_note: string | null; traveler: Person; property: { name: string; slug: string } | null; room: { name: string } | null };
type B = { id: string; public_reference: string; status: string; arrival_date: string; departure_date: string; grand_total_minor: number | string; deposit_due_minor: number | string; deposit_paid_minor: number | string; balance_paid_minor: number | string; balance_due_date: string | null; currency: string; partner_confirmation_number: string | null; traveler_note: string | null; traveler: Person; property: { name: string } | null; room: { name: string } | null };

const who = (p: Person) => [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Traveler";
const STATE: Record<string, string> = { waiting: "Waiting", held: "On hold", confirmed: "Confirmed · record the booking" };

export default function DeskQueue({ quotes, bookings }: { quotes: Q[]; bookings: B[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const run = async (key: string, path: string, body: unknown) => {
    setBusy(key); setMsg((m) => ({ ...m, [key]: "" }));
    const r = await api(path, "POST", body);
    setBusy(null);
    if (r.ok) router.refresh(); else setMsg((m) => ({ ...m, [key]: r.message }));
  };
  const ask = (q: string, d = "") => { const v = window.prompt(q, d); return v === null ? null : v.trim(); };
  return (
    <div className="mt-8 grid gap-10">
      <section>
        <div className="flex items-baseline justify-between border-b ledger-rule pb-2"><h2 className="ledger-display text-[1.35rem]">Requests</h2><p className="text-[13px] ledger-muted">{quotes.length}</p></div>
        {!quotes.length && <p className="mt-4 text-[15px] ledger-muted">Nothing waiting.</p>}
        <ul className="mt-4 grid gap-4">
          {quotes.map((q) => (
            <li key={q.id} className="border ledger-border p-5">
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                <div>
                  <p className={`ledger-eyebrow ${q.state === "held" ? "text-rust" : q.state === "confirmed" ? "text-vol-stays" : "ledger-muted"}`}>{STATE[q.state]}{q.state === "held" && q.held_until ? ` · until ${niceWhen(q.held_until)}` : ""}</p>
                  <p className="ledger-display text-[1.35rem] mt-1">{who(q.traveler)} · {q.room?.name ?? "Unit"} at {q.property?.name ?? "stay"}</p>
                  <p className="text-[13.5px] ledger-muted">{niceDate(q.arrival_date)} → {niceDate(q.departure_date)} · {q.adults} adult{q.adults === 1 ? "" : "s"}{q.children ? `, ${q.children} child${q.children === 1 ? "" : "ren"}` : ""} · {q.public_reference} · price held to {niceWhen(q.expires_at)}</p>
                  {q.hold_note && <p className="text-[13.5px] mt-1">Hold note: {q.hold_note}</p>}
                </div>
                <div className="text-right"><p className="ledger-display text-[1.5rem] leading-none">{fmtMinor(q.grand_total_minor, q.currency)}</p><p className="text-[12.5px] ledger-muted">deposit {fmtMinor(q.deposit_due_minor, q.currency)}{q.balance_due_date ? ` · balance ${niceDate(q.balance_due_date)}` : ""}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {q.state !== "confirmed" && <button type="button" disabled={busy === q.id} className="ledger-btn" onClick={() => { const d = ask("Hold the room until (YYYY-MM-DD):"); if (!d) return; const n = ask("Note for the traveler (optional):", ""); run(q.id, `/api/v1/ops/quotes/${q.id}/hold`, { heldUntil: `${d}T23:59:00Z`, note: n || undefined }); }}>Hold</button>}
                {q.state !== "confirmed" && <button type="button" disabled={busy === q.id} className="ledger-btn ledger-btn--solid" onClick={() => { if (!window.confirm("The property has confirmed this room at this price?")) return; run(q.id, `/api/v1/ops/quotes/${q.id}/approve`, { decision: "approved", availability: "confirmed_by_property" }); }}>Confirm</button>}
                {q.state !== "confirmed" && <button type="button" disabled={busy === q.id} className="ledger-btn-ghost" onClick={() => { const n = ask("Why (shown to the house only):", ""); if (n === null) return; run(q.id, `/api/v1/ops/quotes/${q.id}/approve`, { decision: "declined", note: n || undefined }); }}>Decline</button>}
                {q.state === "confirmed" && <button type="button" disabled={busy === q.id} className="ledger-btn ledger-btn--solid" onClick={() => { const c = ask("Partner confirmation number (optional):", ""); if (c === null) return; const n = ask("Note for the traveler (optional):", ""); run(q.id, "/api/v1/ops/bookings", { quoteId: q.id, partnerConfirmationNumber: c || undefined, travelerNote: n || undefined }); }}>Record booking</button>}
              </div>
              {msg[q.id] && <p role="alert" className="mt-2 text-[14px] ledger-crimson">{msg[q.id]}</p>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="flex items-baseline justify-between border-b ledger-rule pb-2"><h2 className="ledger-display text-[1.35rem]">Bookings</h2><p className="text-[13px] ledger-muted">{bookings.length}</p></div>
        {!bookings.length && <p className="mt-4 text-[15px] ledger-muted">No live bookings.</p>}
        <ul className="mt-4 grid gap-4">
          {bookings.map((b) => {
            const due = nextPayment(b);
            const paid = Number(b.deposit_paid_minor) + Number(b.balance_paid_minor);
            return (
              <li key={b.id} className="border ledger-border p-5">
                <div className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                  <div>
                    <p className="ledger-eyebrow text-vol-stays">{b.status.replace("_", " ")}</p>
                    <p className="ledger-display text-[1.35rem] mt-1">{who(b.traveler)} · {b.room?.name ?? "Unit"} at {b.property?.name ?? "stay"}</p>
                    <p className="text-[13.5px] ledger-muted">{niceDate(b.arrival_date)} → {niceDate(b.departure_date)} · {b.public_reference}{b.partner_confirmation_number ? ` · partner ref ${b.partner_confirmation_number}` : ""}</p>
                  </div>
                  <div className="text-right"><p className="ledger-display text-[1.5rem] leading-none">{fmtMinor(b.grand_total_minor, b.currency)}</p><p className="text-[12.5px] ledger-muted">{fmtMinor(paid, b.currency)} paid{due ? ` · ${due.kind} ${fmtMinor(due.amountMinor, b.currency)} due` : " · settled"}{b.balance_due_date ? ` · balance by ${niceDate(b.balance_due_date)}` : ""}</p></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {due && <button type="button" disabled={busy === b.id} className="ledger-btn" onClick={() => { const a = ask(`Amount received in ${b.currency} (whole minor units, e.g. cents) — ${due.kind} due ${due.amountMinor}:`, String(due.amountMinor)); if (!a) return; const ref = ask("Bank / card reference (optional):", ""); run(b.id, `/api/v1/ops/bookings/${b.id}/payments`, { kind: due.kind, amountMinor: Number(a), reference: ref || undefined }); }}>Record payment received</button>}
                </div>
                {msg[b.id] && <p role="alert" className="mt-2 text-[14px] ledger-crimson">{msg[b.id]}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
