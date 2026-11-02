"use client";

import { useMemo, useState, type ReactNode } from "react";

// The polar itinerary finder (James, 2 Nov 2026; Antarctica21 categories proposal): trip style
// first, because fly or sail is the first choice people make, then region, length, month and ship.
// One choice per row, rows combine. Chips scroll sideways on phones and wrap on wide screens; the
// cards below stay in the HTML (hidden, never removed) so every itinerary is crawlable.

export type FinderRow = { key: string; label: string; options: { key: string; label: string }[] };
export type FinderItem = { slug: string; keys: Record<string, string[]>; node: ReactNode };

export default function PolarFinder({ rows, items }: { rows: FinderRow[]; items: FinderItem[] }) {
  const [picked, setPicked] = useState<Record<string, string | null>>({});
  const match = (x: FinderItem, except?: string) => rows.every((r) => r.key === except || !picked[r.key] || (x.keys[r.key] ?? []).includes(picked[r.key]!));
  const shown = useMemo(() => new Set(items.filter((x) => match(x)).map((x) => x.slug)), [items, picked]); // eslint-disable-line react-hooks/exhaustive-deps
  const any = Object.values(picked).some(Boolean);
  const chip = (on: boolean, empty: boolean) =>
    `shrink-0 inline-flex items-center min-h-[44px] px-3.5 border text-[14px] whitespace-nowrap transition-colors ${on ? "border-crimson bg-crimson text-paper" : empty ? "ledger-border opacity-45" : "ledger-border hover:border-crimson"}`;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.key} className="md:grid md:grid-cols-[8.5rem_minmax(0,1fr)] md:items-start md:gap-4">
            <p className="ledger-eyebrow mb-1.5 md:mb-0 md:pt-3.5">{r.label}</p>
            <div role="group" aria-label={`Filter by ${r.label.toLowerCase()}`} className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 pb-1 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:flex-wrap">
              <button type="button" aria-pressed={!picked[r.key]} onClick={() => setPicked((p) => ({ ...p, [r.key]: null }))} className={chip(!picked[r.key], false)}>All</button>
              {r.options.map((o) => {
                const on = picked[r.key] === o.key;
                const n = items.filter((x) => match(x, r.key) && (x.keys[r.key] ?? []).includes(o.key)).length;
                return (
                  <button key={o.key} type="button" aria-pressed={on} onClick={() => setPicked((p) => ({ ...p, [r.key]: on ? null : o.key }))} className={chip(on, n === 0)}>
                    {o.label}<span className="ml-1.5 text-[12px] opacity-75">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[14px] ledger-muted" aria-live="polite">
        {any ? `Showing ${shown.size} of ${items.length} itineraries. ` : `All ${items.length} itineraries. `}
        {any && <button type="button" onClick={() => setPicked({})} className="underline underline-offset-4 min-h-[44px]">Clear filters</button>}
      </p>
      <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => <li key={x.slug} hidden={!shown.has(x.slug)}>{x.node}</li>)}
      </ul>
      {shown.size === 0 && <p className="mt-4 border-l-2 border-crimson pl-4 text-[15px]">No itinerary matches all of those. Clear a filter, or ask James to shape one.</p>}
    </div>
  );
}
