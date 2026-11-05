"use client";

import Link from "next/link";
import { useState } from "react";
import { LINKED_VOLUMES, PLAN_CTA, type MegaMenu } from "@/lib/site";
import { romanForHref } from "@/lib/volumes";
import { live } from "@/lib/routes";

// Board 11, the Ledger shelf (James approved, 3 Nov 2026). The volumes as bound spines on a shelf: Ink leather with the
// volume's 5px band at the head (House Standard: the volume colour is a tab, never a ground). Choose a spine and its
// cover opens beside the shelf: the volume, its line and where to start. Phones scroll the shelf sideways.
const VOLS = live(LINKED_VOLUMES) as MegaMenu[];

export default function LedgerShelf() {
  const [pick, setPick] = useState(0);
  const v = VOLS[pick];
  if (!v) return null;
  return (
    <section className="mt-12 md:mt-16" aria-labelledby="shelf-heading">
      <p className="ledger-eyebrow ledger-crimson">The volumes · choose one from the shelf</p>
      <h2 id="shelf-heading" className="ledger-display text-[1.9rem] md:text-[2.4rem] leading-tight mt-2">One Ledger, Bound in Volumes</h2>
      <div className="mt-6 grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-end">
        <div className="flex gap-2 overflow-x-auto pt-4 pb-2 [scrollbar-width:none]" role="tablist" aria-label="The volumes">
          {VOLS.map((x, k) => (
            <button key={x.href} type="button" role="tab" aria-selected={k === pick} aria-controls="shelf-cover" onClick={() => setPick(k)}
              className={`relative shrink-0 w-[58px] md:w-[72px] h-[260px] md:h-[400px] bg-ink text-paper flex flex-col items-center justify-between pt-6 pb-5 transition-transform duration-300 motion-reduce:transition-none ${k === pick ? "-translate-y-3" : "hover:-translate-y-1"}`}
              style={{ boxShadow: "inset 2px 0 0 rgba(255,255,255,0.08), inset -3px 0 0 rgba(0,0,0,0.35)" }}>
              <span className="absolute inset-x-0 top-0 h-[5px]" style={{ background: x.tone }} aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-[0.16em] text-paper/70">{romanForHref(x.href)}</span>
              <span className="ledger-display text-[1.25rem] md:text-[1.5rem] whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{x.label}</span>
              <span className={`w-6 h-px ${k === pick ? "bg-[#8B2525]" : "bg-paper/30"}`} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div id="shelf-cover" role="tabpanel" className="relative border ledger-border bg-paper p-6 md:p-10 min-h-[260px] lg:min-h-[400px] flex flex-col">
          <span className="absolute left-0 top-8 w-[5px] h-20" style={{ background: v.tone }} aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] ledger-muted">Volume {romanForHref(v.href)} · Ledger</p>
          <p className="ledger-display text-[2.2rem] md:text-[3rem] leading-none mt-3">{v.label}</p>
          <p className="mt-4 text-[16px] leading-relaxed max-w-xl ledger-muted">{v.intro}</p>
          {v.browse.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {live(v.browse).slice(0, 5).map((l) => <li key={l.href}><Link href={l.href} className="house-chip min-h-[44px]">{l.label}</Link></li>)}
            </ul>
          )}
          <div className="mt-auto pt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={v.href} className="ledger-btn">Open {v.label}</Link>
            <Link href={PLAN_CTA.href} className="ledger-btn ledger-btn--house">{PLAN_CTA.label}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
