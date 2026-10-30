"use client";
import { useMemo, useState } from "react";
import { OFFERS, RATE_ROWS, quote, zar, type OfferId } from "@/lib/content/rates/tswalu-rates";

// Sample cost calculator for Tswalu, on Tswalu's public rate cards (ZAR).
// A planning sample, not a booking: every figure is confirmed when you book.
const field = "mt-1 w-full border ledger-border bg-white px-3 py-2 text-[15px]";
const lab = "block text-[12px] font-mono uppercase tracking-[0.12em] ledger-muted";

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

  return (
    <div className="mt-3 grid gap-7 border ledger-border p-5 md:p-6 bg-card">
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()} aria-label="Tswalu sample cost calculator">
        <label className="sm:col-span-2"><span className={lab}>Camp and room</span>
          <select className={field} value={rowId} onChange={(e) => setRow(e.target.value)}>
            {(["Motse", "Loapi", "Tarkuni"] as const).map((c) => <optgroup key={c} label={c === "Motse" ? "The Motse" : c}>{RATE_ROWS.filter((r) => r.camp === c).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</optgroup>)}
          </select>
          <span className="block mt-1 text-[13px] ledger-muted">Sleeps {row.sleeps}{row.basis === "per-adult" ? " · priced per adult, two sharing" : row.basis === "single" ? " · one adult" : " · priced for the whole room"}</span>
        </label>
        <label><span className={lab}>Arrive</span><input type="date" className={field} value={arrive} min="2026-11-01" max="2027-12-31" onChange={(e) => setArrive(e.target.value)} /></label>
        <label><span className={lab}>Nights</span><input type="number" className={field} value={nights} min={1} max={21} onChange={num(setNights, 1, 21)} /></label>
        {row.camp !== "Tarkuni" && <>
          <label><span className={lab}>Children 0–11</span><input type="number" className={field} value={kidsYoung} min={0} max={4} onChange={num(setKidsYoung, 0, 4)} /></label>
          <label><span className={lab}>Children 12–17</span><input type="number" className={field} value={kidsTeen} min={0} max={4} onChange={num(setKidsTeen, 0, 4)} /></label>
        </>}
        <label><span className={lab}>Malori sleep-outs</span><input type="number" className={field} value={malori} min={0} max={5} onChange={num(setMalori, 0, 5)} /></label>
        <label><span className={lab}>Photographic safari days</span><input type="number" className={field} value={photoDays} min={0} max={14} onChange={num(setPhotoDays, 0, 14)} /></label>
        <label><span className={lab}>Return charter seats (JNB or CPT)</span><input type="number" className={field} value={flights} min={0} max={10} onChange={num(setFlights, 0, 10)} /></label>
        <label><span className={lab}>Offer</span>
          <select className={field} value={offer} onChange={(e) => setOffer(e.target.value as OfferId)}>
            <option value="none">No offer</option>
            {OFFERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
      </form>

      <div aria-live="polite" className="border-t ledger-rule pt-5">
        <p className="ledger-eyebrow ledger-crimson">Sample cost · South African rand</p>
        {!q.ok ? <p className="mt-3 text-[16px]">{q.reason}</p> : <>
          <p className="ledger-display text-[2.4rem] leading-none mt-2">{zar(q.total)}</p>
          <dl className="mt-5 text-[15px] divide-y ledger-rule">
            <div className="flex justify-between py-2"><dt>{row.label} × {nights} nights</dt><dd>{zar(q.accommodation)}</dd></div>
            {q.childrenCost > 0 && <div className="flex justify-between py-2"><dt>Children at the extra-child rate</dt><dd>{zar(q.childrenCost)}</dd></div>}
            {q.discount > 0 && <div className="flex justify-between py-2 ledger-crimson"><dt>{OFFERS.find((o) => o.id === q.offerApplied)?.name}</dt><dd>− {zar(q.discount)}</dd></div>}
            {offer !== "none" && q.discount === 0 && <div className="py-2 text-[13px] ledger-muted">{OFFERS.find((o) => o.id === offer)?.name} doesn&rsquo;t apply to these dates or nights ({OFFERS.find((o) => o.id === offer)?.line}).</div>}
            {q.extras > 0 && <div className="flex justify-between py-2"><dt>Malori and photographic safari</dt><dd>{zar(q.extras)}</dd></div>}
            {q.flights > 0 && <div className="flex justify-between py-2"><dt>Tswalu charter flights, return</dt><dd>{zar(q.flights)}</dd></div>}
          </dl>
          <p className="mt-3 text-[13px] ledger-muted">Season: {Array.from(new Set(q.nights.map((n) => n.season))).join(", ")}. Minimum {q.minNights} nights for these dates.</p>
        </>}
        <p className="mt-5 text-[13px] ledger-muted leading-relaxed">A planning sample on Tswalu&rsquo;s published rates, fully inclusive of the private safari. Offers are never combined and must be requested at booking; Tswalu may limit them. We confirm every figure, and the rate in your currency, when you book.</p>
      </div>
    </div>
  );
}
