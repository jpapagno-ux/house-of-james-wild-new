"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EXCLUDED, EXTRA_CHILD, FEES, FX_DATE, INCLUDED, MIN_STAY, MOTSE_FAMILY_4A_2027, PAYMENT, RATE_ROWS, TSWALU_RATES_CHECKED, ZAR_PER_USD, usd, zar, type RateRow } from "@/lib/content/rates/tswalu-rates";
import TswaluCalculator from "./TswaluCalculator";

// Rates and the sample calculator as one planner: camps in accordions (one
// open at a time), a 2026 / 2027 switch, and the calculator pinned beside them
// on wide screens so "Price this room" fills it in place.

type Year = "2026" | "2027";
const CAMPS: { key: RateRow["camp"]; name: string; line: string }[] = [
  { key: "Motse", name: "The Motse", line: "Legae suites, and family legae for up to four" },
  { key: "Loapi", name: "Loapi", line: "Private homes with one or two bedrooms" },
  { key: "Tarkuni", name: "Tarkuni", line: "The whole homestead: five en-suite bedrooms, up to ten guests" },
];
const fromPrice = (camp: RateRow["camp"], y: Year) => {
  const rows = RATE_ROWS.filter((r) => r.camp === camp);
  const v = (r: RateRow) => (y === "2026" ? r.r2026 : r.r2027.high);
  if (camp === "Tarkuni") return { amount: Math.min(...rows.map(v)), basis: "for the homestead, per night" };
  const pp = rows.filter((r) => r.basis === "per-adult");
  return { amount: Math.min(...pp.map(v)), basis: "per adult sharing, per night" };
};

function Acc({ title, sub, open, onToggle, children }: { title: React.ReactNode; sub?: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b ledger-rule">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-4 py-4 text-left">
        <span className="min-w-0"><span className="block ledger-display text-[1.35rem] leading-tight">{title}</span>{sub && <span className="block mt-0.5 text-[14px] ledger-muted">{sub}</span>}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

export default function TswaluRatesPlanner() {
  const [year, setYear] = useState<Year>("2027");
  const [open, setOpen] = useState<string>("Motse");
  const [rowId, setRowId] = useState("motse-legae");
  const toggle = (k: string) => setOpen((o) => (o === k ? "" : k));
  const one = (z: number, tag?: string) => <span className="inline-block text-right"><span className="block">{usd(z)}{tag && <span className="ledger-muted text-[12px]"> {tag}</span>}</span><span className="block text-[12px] ledger-muted">{zar(z)}</span></span>;
  const price = (r: { r2026: number; r2027: { high: number; peak: number } }) =>
    year === "2026" ? one(r.r2026) : <span className="inline-flex gap-4">{one(r.r2027.high, "high")}{one(r.r2027.peak, "peak")}</span>;
  const pick = (id: string) => { setRowId(id); document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="mt-8 grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-start">
      <div>
        <div role="tablist" aria-label="Rate year" className="inline-flex border ledger-border">
          {(["2026", "2027"] as Year[]).map((y) => (
            <button key={y} role="tab" aria-selected={year === y} onClick={() => setYear(y)} className={`px-4 py-2 text-[14px] font-mono tracking-[0.1em] ${year === y ? "bg-ink text-paper" : "hover:bg-card"}`}>{y === "2026" ? <>2026<span className="hidden sm:inline"> · one rate</span></> : <>2027<span className="hidden sm:inline"> · high &amp; peak</span></>}</button>
          ))}
        </div>
        {year === "2027" && <p className="mt-3 text-[13px] ledger-muted">High: 4 Jan–31 May and 1 Sep–17 Dec. Peak: 1–3 Jan, 1 Jun–31 Aug, 18–31 Dec.</p>}

        <div className="mt-5 border-t ledger-rule">
          {CAMPS.map((c) => {
            const f = fromPrice(c.key, year);
            return (
              <Acc key={c.key} open={open === c.key} onToggle={() => toggle(c.key)} title={c.name} sub={<>{c.line} · from <strong className="font-medium text-ink">{usd(f.amount)}</strong> {f.basis}</>}>
                <ul className="space-y-2">
                  {RATE_ROWS.filter((r) => r.camp === c.key).map((r) => (
                    <li key={r.id} className={`border ledger-border p-3.5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 ${rowId === r.id ? "border-crimson/60 bg-card" : ""}`}>
                      <span className="min-w-0"><span className="block text-[15px]">{r.label.replace(/^Whole homestead, /, "")}{r.basis === "per-adult" ? " · per adult" : ""}</span><span className="block text-[13px] ledger-muted">Sleeps {r.sleeps}</span></span>
                      <span className="text-[15px] tabular-nums">{price(r)}</span>
                      <button type="button" onClick={() => pick(r.id)} className="w-full sm:w-auto text-left sm:text-right text-[13px] underline underline-offset-4 hover:ledger-crimson">Price this room</button>
                    </li>
                  ))}
                  {c.key === "Motse" && year === "2027" && <li className="border ledger-border p-3.5 flex flex-wrap justify-between gap-2 text-[15px]"><span>Family legae, 4 adults</span><span className="tabular-nums">{price({ r2026: 0, r2027: MOTSE_FAMILY_4A_2027 })}</span></li>}
                </ul>
                {c.key !== "Tarkuni" && <p className="mt-3 text-[13px] ledger-muted">Children 0–11 sharing a legae or one-bedroom home with two adults stay free (two at most); children 12–17 and extra children in family rooms at {year === "2026" ? usd(EXTRA_CHILD.r2026) : `${usd(EXTRA_CHILD.r2027.high)} (high) / ${usd(EXTRA_CHILD.r2027.peak)} (peak)`} a night.</p>}
              </Acc>
            );
          })}
          <Acc open={open === "fees"} onToggle={() => toggle("fees")} title="Fees, extras and flights" sub="Everything Tswalu charges on top, and what it doesn't">
            <dl className="text-[15px] divide-y ledger-rule">
              {FEES.map((f) => (
                <div key={f.name} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
                  <dt className="min-w-0"><span className="block">{f.name}</span><span className="block text-[13px] ledger-muted">{f.basis}{f.note ? `. ${f.note}` : ""}</span></dt>
                  {f.r2026 != null && f.r2027 ? <dd className="tabular-nums">{f.r2027.high === f.r2027.peak ? (year === "2026" ? one(f.r2026) : one(f.r2027.high)) : price({ r2026: f.r2026, r2027: f.r2027 })}</dd> : null}
                </div>
              ))}
            </dl>
          </Acc>
          <Acc open={open === "included"} onToggle={() => toggle("included")} title="What every rate includes" sub="Fully inclusive, with your own vehicle, guide and tracker">
            <div className="grid sm:grid-cols-2 gap-5 text-[15px]">
              <ul className="space-y-1.5 list-disc pl-5">{INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
              <div><p className="ledger-eyebrow">Not included</p><ul className="mt-2 space-y-1.5 list-disc pl-5 ledger-muted">{EXCLUDED.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
          </Acc>
          <Acc open={open === "terms"} onToggle={() => toggle("terms")} title="Minimum stays, deposit and cancellation">
            <ul className="space-y-1.5 list-disc pl-5 text-[15px]">{[...MIN_STAY, ...PAYMENT].map((x) => <li key={x}>{x}</li>)}</ul>
          </Acc>
        </div>
        <p className="mt-4 text-[13px] ledger-muted">Tswalu&rsquo;s published rates, per night, fully inclusive and including 15% VAT. US dollars at R{ZAR_PER_USD} to US$1 ({FX_DATE}); Tswalu invoices in rand. Rates checked {TSWALU_RATES_CHECKED}.</p>
      </div>

      <div id="calculator" className="lg:sticky lg:top-28 scroll-mt-28">
        <p className="ledger-eyebrow ledger-crimson">Price a stay</p>
        <TswaluCalculator rowId={rowId} onRowChange={setRowId} />
      </div>
    </div>
  );
}
