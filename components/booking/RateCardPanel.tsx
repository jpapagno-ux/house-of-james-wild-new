"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, CalendarDays, Users } from "lucide-react";
import { BASIS_LABEL, estimate, nightsOf, type CardRow, type Year } from "@/lib/rate-card";
import type { PricedRoom } from "@/lib/content/priced-stays";
import { Checkout } from "./BookingPanel";

// Rate-card booking for partners without a live engine (MORE Collection,
// 1 Nov 2026). "From" prices come from the partner's published card; choosing
// dates and a party gives an estimate, and Select opens the same sample
// checkout as live-rate stays. Payments are not connected yet: checkout sends
// a Folio request and the house confirms price and space with the lodge.

const iso = (d: Date) => d.toISOString().slice(0, 10);
const usd = (n: number) => `US$${Math.round(n).toLocaleString("en-US")}`;
const zar = (n: number) => `R${Math.round(n).toLocaleString("en-US")}`;

type Props = { name: string; partner: string; years: Record<string, Year>; rowKeys: string[]; photo: string; included: string[]; excluded: string[]; policies: string[]; hostHref?: string };

export default function RateCardPanel({ name, partner, years, rowKeys, photo, included, excluded, policies, hostHref }: Props) {
  const [q, setQ] = useState({ checkIn: "", checkOut: "", adults: 2 });
  const [kids, setKids] = useState<number[]>([]);
  const [today, setToday] = useState("");
  const [pick, setPick] = useState<{ room: PricedRoom; plan: string; total: number } | null>(null);
  useEffect(() => {
    const t = new Date(); setToday(iso(t));
    // Default to the first published window at least 30 days out.
    const soon = new Date(t.getTime() + 30 * 86400000);
    const y = Object.values(years).sort((a, b) => a.validFrom.localeCompare(b.validFrom)).find((v) => v.validTo >= iso(soon));
    const a = y && y.validFrom > iso(soon) ? new Date(y.validFrom + "T12:00:00Z") : soon;
    const b = new Date(a.getTime() + 3 * 86400000);
    setQ({ checkIn: iso(a), checkOut: iso(b), adults: 2 });
  }, [years]);

  const nights = q.checkIn && q.checkOut ? nightsOf(q.checkIn, q.checkOut) : 0;
  const year = useMemo(() => {
    if (!q.checkIn || nights < 1) return null;
    const last = iso(new Date(Date.parse(q.checkOut) - 86400000));
    return Object.values(years).find((y) => q.checkIn >= y.validFrom && last <= y.validTo) ?? null;
  }, [q, nights, years]);
  const latest = years[Object.keys(years).sort().slice(-1)[0]];
  const rows = (year ?? latest).rows.filter((r) => rowKeys.includes(r.key));
  const window = Object.values(years).map((y) => `${new Date(y.validFrom + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })} to ${new Date(y.validTo + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`).join(" and ");

  return (
    <section id="rates" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="rates-heading">
      <p className="ledger-eyebrow">Rates · {partner} published rate card</p>
      <h2 id="rates-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Choose Your Stay at {name}</h2>
      <form className="mt-6 flex flex-wrap items-end gap-3 md:gap-4 px-4 md:px-5 py-3 border ledger-border bg-paper/95" onSubmit={(e) => e.preventDefault()}>
        <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Check-in</span><input type="date" value={q.checkIn} min={today || undefined} onChange={(e) => setQ({ ...q, checkIn: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
        <label className="block"><span className="ledger-eyebrow">Check-out</span><input type="date" value={q.checkOut} min={q.checkIn || undefined} onChange={(e) => setQ({ ...q, checkOut: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
        <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Adults</span><select value={q.adults} onChange={(e) => setQ({ ...q, adults: Number(e.target.value) })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label className="block"><span className="ledger-eyebrow">Children</span><select value={kids.length} onChange={(e) => { const n = Number(e.target.value); setKids(Array.from({ length: n }, (_, i) => kids[i] ?? 12)); }} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select></label>
        {kids.map((a, i) => <label key={i} className="block"><span className="ledger-eyebrow">Age {i + 1}</span><select value={a} onChange={(e) => setKids(kids.map((x, j) => (j === i ? Number(e.target.value) : x)))} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{Array.from({ length: 18 }, (_, k) => <option key={k} value={k}>{k}</option>)}</select></label>)}
        <p className="w-full text-[13px]" aria-live="polite">
          {nights < 1 ? <span>Choose a check-out after check-in.</span> : year ? <span className="ledger-crimson">Estimate for {nights} {nights === 1 ? "night" : "nights"} from {partner}&rsquo;s published card</span> : <span>{partner} has published rates for {window}. For other dates, ask James for a quote.</span>}
        </p>
      </form>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r: CardRow) => {
          const e = year && nights > 0 ? estimate(r, nights, { adults: q.adults, children: kids }) : null;
          return (
            <li key={r.key} className="border ledger-border bg-paper flex flex-col p-4">
              <h3 className="ledger-display text-xl">{r.name}</h3>
              <p className="mt-1 text-[13px] ledger-muted flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{r.units}</p>
              <p className="mt-2 text-[13.5px]">{r.note}</p>
              <p className="mt-3"><span className="ledger-eyebrow">From </span><span className="ledger-display text-xl">{usd(r.usd)}</span> <span className="text-[12.5px] ledger-muted">{BASIS_LABEL[r.basis]} · {zar(r.zar)}</span></p>
              <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                {e?.ok ? (
                  <p><span className="ledger-display text-2xl ledger-crimson">{usd(e.usd)}</span><span className="block text-[12.5px] ledger-muted">estimate for {nights} {nights === 1 ? "night" : "nights"}{e.units > 1 ? `, ${e.units} rooms` : ""} · {zar(e.zar)}</span></p>
                ) : <p className="text-[13px] ledger-muted">{e && !e.ok ? e.reason : "Choose dates inside the published card"}</p>}
                {e?.ok
                  ? <button type="button" onClick={() => setPick({ room: { name: r.name, kind: r.basis === "exclusive" ? "house" : "room", photos: [photo] }, plan: "Published rate card (estimate)", total: e.usd })} className="ledger-btn shrink-0">Select</button>
                  : <a href={`/plan?trip=${encodeURIComponent(`${name} · ${r.name}`)}&travellers=${q.adults + kids.length}`} className="ledger-btn-ghost shrink-0">Ask for a quote</a>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] ledger-muted max-w-3xl">Prices are {partner}&rsquo;s published &ldquo;from&rdquo; rates (lowest season) in rand, shown in US dollars at {partner}&rsquo;s own conversion, so the price for your dates may be higher. Every booking is a request: the house confirms the price and space with the lodge before anything is charged. 7% Florida sales tax is added at checkout.</p>
      {pick && <Checkout pick={pick} q={q} nights={nights} name={name} included={included} excluded={excluded} policies={policies} engine="" hostHref={hostHref} onClose={() => setPick(null)} />}
    </section>
  );
}
