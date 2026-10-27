"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "./client";

// Check Availability on a contracted card: dates + occupancy first (spec §11:
// no bookable prices without them), then every room and rate with its
// night-by-night breakdown, taxes, Florida sales tax, deposit and cancellation.
// Always labelled "Request to Reserve": a card is not live availability.

type Night = { date: string; season: string; baseMinor: number; extraAdultsMinor: number; childrenMinor: number; totalMinor: number };
type Charge = { id: string; name: string; kind: string; included: boolean; amountMinor: number };
type Q = {
  currency: string; nights: Night[]; roomSubtotalMinor: number; discounts: { code: string; label: string; amountMinor: number }[]; discountsMinor: number;
  charges: Charge[]; floridaTaxMinor: number; grandTotalMinor: number; depositDueMinor: number; balanceMinor: number; balanceDueDate: string | null;
  cancellation: { summary: string; deadlines: { from: string; penaltyBp: number; penaltyMinor: number }[] }; revision: string;
};
type Option = {
  room: { code: string; name: string; description: string | null; maxOccupancy: number };
  plan: { code: string; name: string; boardBasis: string; refundability: string; inclusions: string | null };
  quote: Q | null; unavailable: { code: string; message: string; date: string | null } | null;
};
type SearchResult = { property: { name: string }; hasCard: boolean; options: Option[] };

const fmt = (minor: number, currency: string) => {
  const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const s = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(minor / 10 ** digits);
  return currency === "USD" ? s.replace(/^\$/, "US$") : `${s} ${currency}`;
};
const nice = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const BOARD: Record<string, string> = { room_only: "Room only", bed_breakfast: "Breakfast included", half_board: "Half board", full_board: "Full board", fully_inclusive: "Fully inclusive" };
const input = "mt-1 w-full bg-paper border ledger-border px-3 py-2 text-[16px]";

export default function QuoteBuilder({ slug, name, signedIn }: { slug: string; name: string; signedIn: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ arrival: "", departure: "", adults: 2, kids: "" as string, promo: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<SearchResult | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);

  const childAges = () => f.kids.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
  const body = (extra: object = {}) => ({ property: slug, arrival: f.arrival, departure: f.departure, adults: f.adults, childAges: childAges(), promoCode: f.promo || undefined, ...extra });

  async function search(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null);
    const r = await api<SearchResult>("/api/v1/availability/search", "POST", body());
    setBusy(false);
    if (r.ok) setRes(r.data); else setErr(r.message);
  }

  async function reserve(o: Option) {
    if (!signedIn) { router.push(`/account/sign-in?next=${encodeURIComponent(`/booking/property/${slug}`)}`); return; }
    setReserving(`${o.room.code}:${o.plan.code}`); setErr("");
    const r = await api<{ id: string }>("/api/v1/quotes", "POST", body({ room: o.room.code, plan: o.plan.code }));
    setReserving(null);
    if (r.ok) router.push(`/booking/quote/${r.data.id}`); else setErr(r.message);
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={search} className="grid gap-3 md:grid-cols-5 border ledger-rule p-5 items-end" aria-label={`Check dates at ${name}`}>
        <label className="block"><span className="text-[13px] ledger-muted">Arrive</span><input type="date" required value={f.arrival} onChange={(e) => setF({ ...f, arrival: e.target.value })} className={input} /></label>
        <label className="block"><span className="text-[13px] ledger-muted">Depart</span><input type="date" required min={f.arrival || undefined} value={f.departure} onChange={(e) => setF({ ...f, departure: e.target.value })} className={input} /></label>
        <label className="block"><span className="text-[13px] ledger-muted">Adults</span><input type="number" min={1} max={12} required value={f.adults} onChange={(e) => setF({ ...f, adults: Number(e.target.value) })} className={input} /></label>
        <label className="block"><span className="text-[13px] ledger-muted">Children&rsquo;s ages</span><input inputMode="numeric" placeholder="e.g. 4, 9" value={f.kids} onChange={(e) => setF({ ...f, kids: e.target.value })} className={input} aria-describedby="kids-help" /></label>
        <button type="submit" disabled={busy} className="ledger-btn justify-center disabled:opacity-50">{busy ? "Checking…" : "Check Availability"}</button>
        <p id="kids-help" className="md:col-span-5 text-[12.5px] ledger-muted">Separate ages with commas. Offer code (optional): <input aria-label="Offer code" value={f.promo} onChange={(e) => setF({ ...f, promo: e.target.value.toUpperCase() })} className="bg-paper border ledger-border px-2 py-0.5 text-[13px] w-48 ml-1" /></p>
      </form>

      {err && <p role="alert" className="text-[15px] ledger-crimson">{err}</p>}

      {res && !res.hasCard && (
        <div className="border ledger-rule p-6">
          <p className="ledger-display text-xl">The house prices these dates by hand</p>
          <p className="mt-2 text-[15.5px]">There&rsquo;s no published rate card covering these dates yet. Tell James what you have in mind and the house will come back with a confirmed price.</p>
          <Link href={`/plan?trip=${encodeURIComponent(name)}`} className="ledger-btn mt-4">Design With James</Link>
        </div>
      )}

      {res && res.hasCard && (
        <section aria-live="polite" className="grid gap-6">
          <div className="border-l-2 ledger-crimson-border pl-4 text-[14.5px]">
            <p><strong>Request to Reserve.</strong> These are the house&rsquo;s contracted rates, not live availability. Nothing is held or charged: the house confirms the room with {name} and replies within 24 hours.</p>
          </div>
          {res.options.map((o) => {
            const key = `${o.room.code}:${o.plan.code}`;
            if (!o.quote) return (
              <article key={key} className="border ledger-rule p-5 opacity-80">
                <h3 className="ledger-display text-xl">{o.room.name}</h3>
                <p className="text-[14px] ledger-muted">{o.plan.name}</p>
                <p className="mt-2 text-[15px]">{o.unavailable?.message}{o.unavailable?.date ? ` (${nice(o.unavailable.date)})` : ""}</p>
              </article>
            );
            const q = o.quote, cur = q.currency;
            const added = q.charges.filter((c) => !c.included && c.kind !== "house_tax");
            const included = q.charges.filter((c) => c.included);
            return (
              <article key={key} className="border ledger-rule p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="ledger-display text-2xl">{o.room.name}</h3>
                    <p className="text-[14px] ledger-muted">{o.plan.name} · {BOARD[o.plan.boardBasis] ?? o.plan.boardBasis}{o.plan.inclusions ? ` · ${o.plan.inclusions}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="ledger-display text-[1.9rem] ledger-crimson leading-none">{fmt(q.grandTotalMinor, cur)}</p>
                    <p className="text-[12.5px] ledger-muted">for {q.nights.length} {q.nights.length === 1 ? "night" : "nights"}, all taxes shown below</p>
                  </div>
                </div>
                <details className="mt-4 border-t ledger-rule">
                  <summary className="py-3 cursor-pointer ledger-eyebrow">Night by night</summary>
                  <table className="w-full text-[14px]">
                    <thead><tr className="text-left ledger-muted"><th className="py-1 font-normal">Night</th><th className="font-normal">Season</th><th className="font-normal text-right">Room</th><th className="font-normal text-right">Extra guests</th><th className="font-normal text-right">Night total</th></tr></thead>
                    <tbody>{q.nights.map((n) => (
                      <tr key={n.date} className="border-t ledger-border"><td className="py-1.5">{nice(n.date)}</td><td>{n.season}</td><td className="text-right">{fmt(n.baseMinor, cur)}</td><td className="text-right">{fmt(n.extraAdultsMinor + n.childrenMinor, cur)}</td><td className="text-right">{fmt(n.totalMinor, cur)}</td></tr>
                    ))}</tbody>
                  </table>
                </details>
                <dl className="mt-2 border-t ledger-rule text-[15px]">
                  <Row k="Room nights" v={fmt(q.roomSubtotalMinor, cur)} />
                  {q.discounts.map((d) => <Row key={d.code} k={d.label} v={`− ${fmt(d.amountMinor, cur)}`} />)}
                  {added.map((c) => <Row key={c.id} k={c.name} v={fmt(c.amountMinor, cur)} />)}
                  <Row k="Florida sales tax (7%)" v={fmt(q.floridaTaxMinor, cur)} />
                  <div className="flex justify-between gap-4 py-3 border-b ledger-rule"><dt className="ledger-display text-xl">Total</dt><dd className="ledger-display text-xl ledger-crimson">{fmt(q.grandTotalMinor, cur)}</dd></div>
                  {included.length > 0 && <p className="py-2 text-[13px] ledger-muted">Already in the rate: {included.map((c) => `${c.name} (${fmt(c.amountMinor, cur)})`).join(", ")}.</p>}
                  <Row k="Deposit to confirm" v={fmt(q.depositDueMinor, cur)} />
                  {q.balanceDueDate && <Row k={`Balance due ${nice(q.balanceDueDate)}`} v={fmt(q.balanceMinor, cur)} />}
                </dl>
                <details className="border-b ledger-rule">
                  <summary className="py-3 cursor-pointer ledger-eyebrow">Cancellation</summary>
                  <p className="text-[14.5px]">{q.cancellation.summary}</p>
                  <ul className="py-2 text-[14px]">{q.cancellation.deadlines.map((d) => <li key={d.from}>From {nice(d.from)}: {d.penaltyBp / 100}% ({fmt(d.penaltyMinor, cur)})</li>)}</ul>
                </details>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => reserve(o)} disabled={reserving === key} className="ledger-btn ledger-btn--solid disabled:opacity-50">{reserving === key ? "Sending…" : signedIn ? "Request to Reserve" : "Sign in to Request to Reserve"}</button>
                  <Link href={`/plan?trip=${encodeURIComponent(name)}`} className="ledger-btn">Design With James</Link>
                </div>
                <p className="mt-3 text-[11.5px] ledger-muted">Price reference {q.revision.split("#")[1]}</p>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 py-2.5 border-b ledger-rule"><dt className="ledger-muted">{k}</dt><dd className="text-right">{v}</dd></div>;
}
