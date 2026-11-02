"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// A waters hub with a big fleet (the Galápagos, James, 2 Nov 2026): the ships grouped by partner, then
// by tier as each operator labels it, with filter chips for guests, length, price and type, so 17 ships
// never become one endless scroll. Mobile first: each chip row scrolls sideways on a phone, targets are
// 44px. Every card stays in the HTML (filters only hide), so the page reads whole without script.
// A ?pathway= view filters to that pathway and is never indexed (as HubFilter).

export type FleetItem = { slug: string; operator: string; tier: string; guests: number | null; nights: number[]; low: number | null; kind: string; pathways: string[]; node: ReactNode };
export type FleetSection = { operator: string; href?: string; line: string; tiers: string[] };
type Opt = { key: string; label: string; test: (x: FleetItem) => boolean };

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export default function FleetBrowser({ items, sections, pathwayNames, credits }: { items: FleetItem[]; sections: FleetSection[]; pathwayNames: Record<string, string>; credits: string }) {
  const guestsOpts: Opt[] = useMemo(() => {
    const gs = [...new Set(items.map((x) => x.guests).filter((g): g is number => g != null))].sort((a, b) => a - b);
    return gs.map((g) => ({ key: `g${g}`, label: `${g} guests`, test: (x: FleetItem) => x.guests === g }));
  }, [items]);
  const lengthOpts: Opt[] = [
    { key: "short", label: "Up to 4 nights", test: (x) => x.nights.some((n) => n <= 4) },
    { key: "week", label: "5 to 7 nights", test: (x) => x.nights.some((n) => n >= 5 && n <= 7) },
    { key: "long", label: "8 nights or more", test: (x) => x.nights.some((n) => n >= 8) },
  ];
  const priceOpts: Opt[] = [
    { key: "p4", label: `From under ${usd(4000)}`, test: (x) => x.low != null && x.low < 4000 },
    { key: "p7", label: `From ${usd(4000)} to ${usd(7000)}`, test: (x) => x.low != null && x.low >= 4000 && x.low <= 7000 },
    { key: "p8", label: `From over ${usd(7000)}`, test: (x) => x.low != null && x.low > 7000 },
  ];
  const typeOpts: Opt[] = useMemo(() => {
    const NAMES: Record<string, string> = { yacht: "Yacht", "motor-yacht": "Motor yacht", catamaran: "Catamaran", trimaran: "Trimaran" };
    return [...new Set(items.map((x) => x.kind))].map((k) => ({ key: k, label: NAMES[k] ?? k, test: (x: FleetItem) => x.kind === k }));
  }, [items]);
  const rows: { name: string; opts: Opt[] }[] = [
    { name: "Guests", opts: guestsOpts }, { name: "Length", opts: lengthOpts }, { name: "Price", opts: priceOpts }, { name: "Type", opts: typeOpts },
  ];

  const [on, setOn] = useState<Record<string, string | null>>({});
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("pathway");
    if (!k || !pathwayNames[k]) return;
    setPath(k);
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, [pathwayNames]);

  const passes = (x: FleetItem) => rows.every((r) => { const k = on[r.name]; return !k || r.opts.find((o) => o.key === k)?.test(x); }) && (!path || x.pathways.includes(path));
  const shown = items.filter(passes);
  const any = Object.values(on).some(Boolean) || !!path;
  const chip = (active: boolean) => `shrink-0 inline-flex items-center min-h-[44px] px-3.5 border text-[14px] whitespace-nowrap transition-colors ${active ? "border-crimson bg-crimson text-paper" : "ledger-border bg-paper hover:border-crimson"}`;

  return (
    <div>
      <div className="flex flex-col gap-2.5" aria-label="Filter the ships">
        {rows.filter((r) => r.opts.length > 1).map((r) => (
          <div key={r.name} role="group" aria-label={`Filter by ${r.name.toLowerCase()}`} className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
            <span className="ledger-eyebrow shrink-0 w-16">{r.name}</span>
            {r.opts.map((o) => {
              const active = on[r.name] === o.key;
              const n = items.filter((x) => o.test(x)).length;
              return <button key={o.key} type="button" aria-pressed={active} onClick={() => setOn({ ...on, [r.name]: active ? null : o.key })} className={chip(active)}>{o.label}<span className="ml-1.5 text-[12px] opacity-70">{n}</span></button>;
            })}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px]" aria-live="polite">
        {any ? <>Showing {shown.length} of {items.length} ships{path ? <> on <strong>{pathwayNames[path]}</strong></> : null}. <button type="button" onClick={() => { setOn({}); if (path) window.location.href = window.location.pathname; }} className="underline underline-offset-4 min-h-[44px]">Show every ship</button></> : <>All {items.length} ships, by partner and tier.</>}
      </p>

      {sections.map((sec) => {
        const mine = items.filter((x) => x.operator === sec.operator);
        const vis = mine.filter(passes);
        return (
          <section key={sec.operator} className={`mt-8 md:mt-10 ${vis.length ? "" : "hidden"}`} aria-label={sec.operator}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b ledger-rule pb-2">
              <h3 className="ledger-display text-[24px] md:text-[28px] leading-tight">{sec.operator} <span className="text-[15px] ledger-muted font-normal">{mine.length} {mine.length === 1 ? "ship" : "ships"}</span></h3>
              {sec.href && <Link href={sec.href} className="inline-flex items-center gap-1.5 min-h-[44px] text-[14px] underline-offset-4 hover:underline">Who are {sec.operator}?<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>}
            </div>
            <p className="mt-2 text-[14.5px] ledger-muted max-w-3xl">{sec.line}</p>
            {sec.tiers.map((t) => {
              const inTier = mine.filter((x) => x.tier === t);
              if (!inTier.length) return null;
              return (
                <div key={t} className={`mt-5 ${inTier.some(passes) ? "" : "hidden"}`}>
                  <p className="ledger-eyebrow ledger-crimson">{t}</p>
                  <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {inTier.map((x) => <li key={x.slug} className={passes(x) ? "" : "hidden"}>{x.node}</li>)}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
      {!shown.length && <p className="mt-8 border-l-2 border-crimson pl-4 text-[15px]">No ship matches every filter. Clear one, or ask James: he knows which yachts have space.</p>}
      <p className="mt-6 text-[12px] ledger-muted">Photographs: {credits}. &ldquo;From&rdquo; is the lowest fare per person each operator publishes for the cruise, on its own occupancy basis.</p>
    </div>
  );
}
