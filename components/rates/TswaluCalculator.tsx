"use client";
import { useMemo, useState } from "react";
import { FX_DATE, OFFERS, RATE_ROWS, ZAR_PER_USD, quote, usd, zar, type OfferId } from "@/lib/content/rates/tswalu-rates";

// Sample cost calculator for Tswalu, on Tswalu's published rate cards.
// US dollars first (at a dated rate), rand beside. A planning sample, not a
// booking: every figure is confirmed when you book.
const field = "mt-1 w-full border ledger-border bg-white px-3 py-2 text-[15px]";
const lab = "block text-[12px] font-mono uppercase tracking-[0.12em] ledger-muted";

function Line({ label, z, minus, strong }: { label: string; z: number; minus?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2 ${minus ? "ledger-crimson" : ""} ${strong ? "font-medium" : ""}`}>
      <dt>{label}</dt>
      <dd className="text-right tabular-nums">{minus ? "− " : ""}{usd(z)}<span className="block text-[12px] ledger-muted font-normal">{zar(z)}</span></dd>
    </div>
  );
}

export default function TswaluCalculator({ rowId: controlled, onRowChange }: { rowId?: string; onRowChange?: (id: string) => void } = {}) {
  const [own, setOwn] = useState("motse-legae");
  const rowId = controlled ?? own;
  const setRow = (id: string) => { setOwn(id); onRowChange?.(id); };
  const [arrive, setArrive] = useState("2027-03-08");
  const [nights, setNights] = useState(4);
  const [kidsYoung, setKidsYoung] = useState(0);
  const [kidsTeen, setKidsTeen] = useState(0);
  const [malori, setMalori] = useState(0);
  const [photoDays, setPhotoDays] = useState(0);
  const [flights, setFlights] = useState(0);
  const [offer, setOffer] = useState<OfferId>("year-round");
  const row = RATE_ROWS.find((r) => r.id === rowId)!;
  const q = useMemo(() => quote({ rowId, arrive, nights, adults: row.adults ?? 2, children0to11: kidsYoung, children12to17: kidsTeen, malori, photoDays, flightsReturn: flights, offer }), [rowId, arrive, nights, row.adults, kidsYoung, kidsTeen, malori, photoDays, flights, offer]);
  const num = (set: (n: number) => void, min = 0, max = 30) => (e: React.ChangeEvent<HTMLInputElement>) => set(Math.max(min, Math.min(max, Number(e.target.value) || 0)));
  const offerName = OFFERS.find((o) => o.id === q.offerApplied)?.name;

  return (
    <div className="mt-3 grid gap-6 border ledger-border p-5 md:p-6 bg-card">
      <form className="grid grid-cols-2 gap-x-4 gap-y-3.5" onSubmit={(e) => e.preventDefault()} aria-label="Tswalu sample cost calculator">
        <label className="col-span-2"><span className={lab}>Camp and room</span>
          <select className={field} value={rowId} onChange={(e) => setRow(e.target.value)}>
            {(["Motse", "Loapi", "Tarkuni"] as const).map((c) => <optgroup key={c} label={c === "Motse" ? "The Motse" : c}>{RATE_ROWS.filter((r) => r.camp === c).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</optgroup>)}
          </select>
          <span className="block mt-1 text-[13px] ledger-muted">Sleeps {row.sleeps}{row.basis === "per-adult" ? " · priced per adult, two sharing" : row.basis === "single" ? " · one adult" : " · priced for the whole room"}</span>
        </label>
        <label><span className={lab}>Arrive</span><input type="date" className={field} value={arrive} min="2026-11-01" max="2027-12-31" onChange={(e) => setArrive(e.target.value)} /></label>
        <label><span className={lab}>Nights</span><input type="number" inputMode="numeric" className={field} value={nights} min={1} max={21} onChange={num(setNights, 1, 21)} /></label>
        {row.camp !== "Tarkuni" && <>
          <label><span className={lab}>Children 0–11</span><input type="number" inputMode="numeric" className={field} value={kidsYoung} min={0} max={4} onChange={num(setKidsYoung, 0, 4)} /></label>
          <label><span className={lab}>Children 12–17</span><input type="number" inputMode="numeric" className={field} value={kidsTeen} min={0} max={4} onChange={num(setKidsTeen, 0, 4)} /></label>
        </>}
        <details className="col-span-2 border-t ledger-rule pt-3 group">
          <summary className="cursor-pointer list-none flex justify-between text-[14px]"><span className="font-medium">Extras and flights</span><span className="ledger-muted group-open:hidden">add</span><span className="ledger-muted hidden group-open:inline">hide</span></summary>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 mt-3">
            <label><span className={lab}>Malori nights</span><input type="number" inputMode="numeric" className={field} value={malori} min={0} max={5} onChange={num(setMalori, 0, 5)} /></label>
            <label><span className={lab}>Photo safari days</span><input type="number" inputMode="numeric" className={field} value={photoDays} min={0} max={14} onChange={num(setPhotoDays, 0, 14)} /></label>
            <label className="col-span-2"><span className={lab}>Return charter seats, Johannesburg or Cape Town</span><input type="number" inputMode="numeric" className={field} value={flights} min={0} max={10} onChange={num(setFlights, 0, 10)} /><span className="block mt-1 text-[12px] ledger-muted">Under-2s fly free on a lap.</span></label>
          </div>
        </details>
        <label className="col-span-2"><span className={lab}>Offer (one at a time)</span>
          <select className={field} value={offer} onChange={(e) => setOffer(e.target.value as OfferId)}>
            <option value="none">No offer</option>
            {OFFERS.map((o) => <option key={o.id} value={o.id}>{o.name}: {o.line}</option>)}
          </select>
        </label>
      </form>

      <div aria-live="polite" className="border-t ledger-rule pt-5">
        <p className="ledger-eyebrow ledger-crimson">Sample cost · US dollars</p>
        {!q.ok ? <p className="mt-3 text-[16px]">{q.reason}</p> : <>
          <p className="ledger-display text-[2.6rem] leading-none mt-2">{usd(q.total)}</p>
          <p className="mt-1 text-[14px] ledger-muted">{zar(q.total)} · {nights} nights{offerName ? ` · with ${offerName}` : ""}</p>
          <dl className="mt-4 text-[15px] divide-y ledger-rule">
            <Line label={`${row.label}, ${nights} nights`} z={q.accommodation} />
            {q.childrenCost > 0 && <Line label="Children at the extra-child rate" z={q.childrenCost} />}
            {q.discount > 0 && <Line label={offerName ?? "Offer"} z={q.discount} minus />}
            {q.extras > 0 && <Line label="Malori and photographic safari" z={q.extras} />}
            {q.flights > 0 && <Line label={`Charter flights, ${flights} return ${flights === 1 ? "seat" : "seats"}`} z={q.flights} />}
            <div className="flex justify-between gap-4 py-2 text-[14px] ledger-muted"><dt>VAT at 15%</dt><dd>included</dd></div>
            <Line label="20% deposit to confirm" z={q.total * 0.2} strong />
          </dl>
          {offer !== "none" && q.discount === 0 && <p className="mt-3 text-[13px] ledger-muted">{OFFERS.find((o) => o.id === offer)?.name} doesn&rsquo;t apply to these dates or nights.</p>}
          <p className="mt-3 text-[13px] ledger-muted">Season: {Array.from(new Set(q.nights.map((n) => n.season))).join(", ")}. Minimum {q.minNights} nights for these dates.</p>
        </>}
        <p className="mt-4 text-[12.5px] ledger-muted leading-relaxed">A planning sample on Tswalu&rsquo;s published rates, fully inclusive of the private safari. Dollars at R{ZAR_PER_USD} to US$1 ({FX_DATE}); Tswalu invoices in rand, and we confirm the dollar figure when you book. Offers are never combined and must be requested at booking. Gratuities and spa treatments are extra.</p>
      </div>
    </div>
  );
}
