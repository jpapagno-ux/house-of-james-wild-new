"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { DatesData, Sailing } from "@/lib/content/ships/fares";

// Dates and rates on a ship page (James, 2 Nov 2026): fares once per rate window, then the
// sailings as a compact grid by month. Chips are coloured by route (legend above), carry
// availability where the operator publishes it, and open a "Hold a cabin" sheet with that
// date's fare. The next six show first; "See all N dates" opens the months (accordions on wide
// screens, a sideways month scroller on phones). Every date is in the HTML from the start,
// collapsed, never removed. Filters: route and cabin.

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const NEXT = 6;

function Chip({ x, colour, onOpen }: { x: Sailing; colour: string; onOpen: (x: Sailing) => void }) {
  const full = x.status === "Full";
  return (
    <button type="button" onClick={() => onOpen(x)} aria-label={`${x.when}, ${x.routeLabel}${x.status ? `, ${x.status}` : ""}`}
      className={`relative flex flex-col items-start min-w-[4.75rem] min-h-[56px] pl-3 pr-2.5 py-1.5 border ledger-border bg-paper text-left hover:border-crimson transition-colors ${full ? "opacity-60" : ""}`}
      style={{ borderLeft: `4px solid ${colour}` }}>
      <span className={`ledger-display text-[18px] leading-none ${full ? "line-through" : ""}`}>{x.day} <span className="text-[13px]">{x.month.slice(0, 3)}</span></span>
      <span className="text-[11.5px] ledger-muted leading-tight mt-1 whitespace-nowrap">{x.status ?? (x.nights ? `${x.nights} nights` : x.routeLabel)}</span>
    </button>
  );
}

export default function DatesGrid({ ship, data, note }: { ship: string; data: DatesData; note?: string }) {
  const [route, setRoute] = useState<string | null>(null);
  const [cabin, setCabin] = useState<string | null>(null);
  const [open, setOpen] = useState<Sailing | null>(null);
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => { const m = window.matchMedia("(min-width: 768px)"); const f = () => setWide(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);

  const colour = (r: string) => data.routes.find((x) => x.name === r)?.colour ?? "#2F6F73";
  const shown = useMemo(() => data.sailings.filter((x) => !route || x.route === route), [data.sailings, route]);
  const months = useMemo(() => { const m = new Map<string, Sailing[]>(); for (const x of shown) m.set(x.month, [...(m.get(x.month) ?? []), x]); return [...m.entries()]; }, [shown]);
  const price = (ps: [string, number][]) => (cabin ? ps.filter(([k]) => k === cabin || k.startsWith(`${cabin} (`)) : ps);
  const windows = data.windows.filter((w) => price(w.prices).length || w.prices[0]?.[0] === "From");
  const chip = (on: boolean) => `inline-flex items-center min-h-[44px] px-3.5 border text-[14px] whitespace-nowrap ${on ? "border-crimson bg-crimson text-paper" : "ledger-border hover:border-crimson"}`;

  return (
    <div className="mt-8">
      {(data.routes.length > 1 || data.cabins.length > 1) && (
        <div className="flex flex-col gap-3">
          {data.routes.length > 1 && (
            <div role="group" aria-label="Filter by route" className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
              <button type="button" aria-pressed={!route} onClick={() => setRoute(null)} className={chip(!route)}>Every route</button>
              {data.routes.map((r) => <button key={r.name} type="button" aria-pressed={route === r.name} onClick={() => setRoute(route === r.name ? null : r.name)} className={chip(route === r.name)}><span className="w-2.5 h-2.5 rounded-full mr-2" style={{ background: r.colour }} aria-hidden="true" />{r.label}</button>)}
            </div>
          )}
          {data.cabins.length > 1 && (
            <div role="group" aria-label="Filter by cabin" className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
              <button type="button" aria-pressed={!cabin} onClick={() => setCabin(null)} className={chip(!cabin)}>Every cabin</button>
              {data.cabins.map((c) => <button key={c.type} type="button" aria-pressed={cabin === c.type} onClick={() => setCabin(cabin === c.type ? null : c.type)} className={chip(cabin === c.type)}>{c.type}</button>)}
            </div>
          )}
        </div>
      )}

      {/* Fares, once per rate window */}
      <ul className="mt-6 border-t ledger-rule">
        {windows.map((w) => (
          <li key={w.key} className="border-b ledger-rule py-3.5 grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)_auto] gap-x-6 gap-y-1 items-baseline">
            <p className="min-w-0"><span className="ledger-display text-[19px]">{w.label}</span>{w.sub && <span className="block text-[12.5px] ledger-muted">{w.sub}</span>}</p>
            <p className="min-w-0 text-[15px] flex flex-wrap gap-x-1">{price(w.prices).map(([k, v], i) => <span key={k} className="whitespace-nowrap">{i > 0 && <span className="ledger-muted">· </span>}{k === "From" ? "From " : `${k} `}<strong className="font-medium ledger-crimson">{usd(v)}</strong></span>)}</p>
            {data.bands && <a href={w.plan} className="ledger-btn-ghost inline-flex items-center min-h-[44px] justify-self-start md:justify-self-end">Hold a cabin</a>}
          </li>
        ))}
      </ul>

      {data.sailings.length > 0 && (
        <>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <h3 className="ledger-display text-[22px]">The next {Math.min(NEXT, shown.length)} departures</h3>
            {data.routes.length > 1 && <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" aria-label="Route colours">{data.routes.map((r) => <li key={r.name} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: r.colour }} aria-hidden="true" />{r.label}</li>)}</ul>}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">{shown.slice(0, NEXT).map((x) => <li key={x.id}><Chip x={x} colour={colour(x.route)} onOpen={setOpen} /></li>)}</ul>

          {shown.length > NEXT && (
            <details className="mt-5 group/all">
              <summary className="cursor-pointer list-none inline-flex items-center min-h-[44px] ledger-btn [&::-webkit-details-marker]:hidden">See all {shown.length} dates</summary>
              <div className={wide === false ? "mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-3" : "mt-4 space-y-2"}>
                {months.map(([m, xs], i) => (
                  <details key={m} open={wide === false ? true : i === 0 ? true : undefined} className={wide === false ? "snap-start shrink-0 w-[82%] border ledger-border p-3" : "border ledger-border open:bg-paper-card"}>
                    <summary className={`cursor-pointer list-none flex items-center justify-between min-h-[48px] px-3 [&::-webkit-details-marker]:hidden ${wide === false ? "pointer-events-none px-0" : ""}`}>
                      <span className="ledger-display text-[18px]">{m}</span><span className="text-[13px] ledger-muted">{xs.length} {xs.length === 1 ? "date" : "dates"}</span>
                    </summary>
                    <ul className={`flex flex-wrap gap-2 ${wide === false ? "mt-1" : "px-3 pb-3"}`}>{xs.map((x) => <li key={x.id}><Chip x={x} colour={colour(x.route)} onOpen={setOpen} /></li>)}</ul>
                  </details>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      <p className="mt-4 text-[12.5px] ledger-muted max-w-3xl">{data.bands ? "One fare covers any sailing that starts in the season. " : ""}{note} Availability is confirmed live when you ask.</p>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={() => setOpen(null)}>
          <div role="dialog" aria-modal="true" aria-label={`${ship}, ${open.when}`} className="w-full md:max-w-md bg-paper border ledger-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="ledger-eyebrow" style={{ color: colour(open.route) }}>{open.routeLabel}{open.nights ? ` · ${open.nights} nights` : ""}</p><p className="ledger-display text-[24px] mt-1">{open.when}</p></div>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="w-11 h-11 flex items-center justify-center border ledger-border shrink-0"><X className="w-4 h-4" strokeWidth={1.5} /></button>
            </div>
            {open.status && <p className="mt-2 text-[14px]">{open.status}</p>}
            <dl className="mt-4 border-t ledger-rule text-[15px]">{price(open.prices).map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2 border-b ledger-rule"><dt className="ledger-muted">{k}</dt><dd className="whitespace-nowrap">{usd(v)}</dd></div>)}</dl>
            <p className="mt-2 text-[12px] ledger-muted">Per person, two sharing.</p>
            <a href={open.plan} className="mt-4 ledger-btn ledger-btn--solid w-full justify-center min-h-[48px] inline-flex items-center">{open.status === "Full" ? "Join the waitlist" : "Hold a cabin"}</a>
          </div>
        </div>
      )}
    </div>
  );
}
