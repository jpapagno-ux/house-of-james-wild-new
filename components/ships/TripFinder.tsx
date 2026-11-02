"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { ShipCardData } from "@/lib/content/ships/cards";

// The voyage finder: two questions (how, and which waters), then the ships in the registry
// that fit, with their fare from. Every answer is a filed ship; nothing is made up. With no
// match it says so and hands over to James or the Compass.
type Opt = { key: string; name: string };

export default function TripFinder({ cards, types, waters }: { cards: ShipCardData[]; types: Opt[]; waters: Opt[] }) {
  const [t, setT] = useState<string | null>(null);
  const [w, setW] = useState<string | null>(null);
  const hits = useMemo(() => cards.filter((c) => (!t || c.types.includes(t as never)) && (!w || c.waters.includes(w as never))), [cards, t, w]);
  const chip = (on: boolean) => `inline-flex items-center min-h-[44px] px-4 border text-[14px] transition-colors ${on ? "border-crimson bg-crimson text-paper" : "ledger-border hover:border-crimson"}`;
  const row = (label: string, opts: Opt[], val: string | null, set: (v: string | null) => void) => (
    <fieldset className="mt-5">
      <legend className="ledger-eyebrow">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" aria-pressed={val === null} onClick={() => set(null)} className={chip(val === null)}>Any</button>
        {opts.map((o) => <button key={o.key} type="button" aria-pressed={val === o.key} onClick={() => set(val === o.key ? null : o.key)} className={chip(val === o.key)}>{o.name}</button>)}
      </div>
    </fieldset>
  );
  return (
    <div className="ledger-paper border ledger-border p-5 md:p-7">
      {row("1 · How do you want to sail?", types, t, setT)}
      {row("2 · Which waters?", waters, w, setW)}
      <div className="mt-7 border-t ledger-rule pt-5" aria-live="polite">
        <p className="ledger-eyebrow">{hits.length ? `${hits.length} ${hits.length === 1 ? "ship fits" : "ships fit"}` : "No filed ship fits both yet"}</p>
        {hits.length > 0 ? (
          <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">
            {hits.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} className="flex items-center gap-4 min-h-[56px] py-2 hover:bg-paper-card px-1">
                  <span className="flex-1 min-w-0"><span className="block ledger-display text-[18px] leading-snug">{c.name}</span><span className="block text-[12.5px] ledger-muted">{c.eyebrow}{c.page ? "" : " · ship page to follow"}</span></span>
                  {c.price && <span className="text-right shrink-0"><span className="ledger-eyebrow block">{c.price.label}</span><span className="ledger-display ledger-crimson text-[16px] whitespace-nowrap">{c.price.amount}</span></span>}
                  <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] ledger-muted max-w-xl">Tell James what you have in mind and he will say plainly whether a ship he trusts sails it.</p>
        )}
        <p className="mt-5 flex flex-wrap gap-3">
          <Link href={`/plan?trip=${encodeURIComponent(["Voyage", types.find((x) => x.key === t)?.name, waters.find((x) => x.key === w)?.name].filter(Boolean).join(", "))}`} className="ledger-btn ledger-btn--solid">Plan with James</Link>
          <Link href="/compass" className="ledger-btn">Not sure? Take the Compass</Link>
        </p>
      </div>
    </div>
  );
}
