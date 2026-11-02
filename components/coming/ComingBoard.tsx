"use client";

import { useState } from "react";
import ComingCard from "@/components/coming/ComingCard";
import type { ComingGroup } from "@/lib/content/whats-coming";

// What's coming, grouped by region (James, 2 Nov 2026). Mobile first: the region chips sit in one row
// that scrolls sideways on a phone and wraps on a wide screen; "All" shows every region in turn, each
// with its own heading, cards in opening-date order.
export default function ComingBoard({ groups }: { groups: ComingGroup[] }) {
  const [on, setOn] = useState<string>("all");
  const shown = on === "all" ? groups : groups.filter((g) => g.slug === on);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const chip = (key: string, label: string, n: number) => {
    const active = on === key;
    return (
      <button key={key} type="button" aria-pressed={active} onClick={() => setOn(key)}
        className={`shrink-0 snap-start px-3.5 py-2 border text-[14px] leading-none whitespace-nowrap transition-colors ${active ? "border-ink bg-ink text-paper" : "ledger-border bg-paper hover:border-crimson/60"}`}>
        {label} <span className={active ? "opacity-70" : "ledger-muted"}>({n})</span>
      </button>
    );
  };
  return (
    <div>
      <div className="-mx-5 px-5 md:mx-0 md:px-0 flex gap-2 overflow-x-auto snap-x md:flex-wrap md:overflow-visible pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by region">
        {chip("all", "All regions", total)}
        {groups.map((g) => chip(g.slug, g.name, g.items.length))}
      </div>
      {shown.map((g) => (
        <section key={g.slug} className="mt-10" aria-labelledby={`coming-region-${g.slug}`}>
          <h2 id={`coming-region-${g.slug}`} className="ledger-display text-[1.5rem] md:text-[1.8rem] border-b ledger-rule pb-2">{g.name} <span className="text-[1rem] ledger-muted">· {g.items.length} {g.items.length === 1 ? "opening" : "openings"}</span></h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((c) => <li key={c.slug}><ComingCard c={c} /></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
