"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BedDouble, Star } from "lucide-react";
import Carousel from "@/components/booking/Carousel";

// The camps ledger on a reserve page: every lodge, camp and residence on the
// reserve as its own card, with a photo strip, what it holds, the registry
// "from" rate and a way in. Filter chips split lodges from private
// residences when a reserve has both.

export type CampCard = { slug: string; name: string; kind: "camp" | "residence" | "suite"; kindLabel: string; href: string | null; photos: string[]; units: string; line: string; from: string | null; fromBasis: string; mark: string | null };
const FILTERS: [string, string, (c: CampCard) => boolean][] = [["all", "All", () => true], ["camp", "Lodges & camps", (c) => c.kind === "camp"], ["private", "Residences & private suites", (c) => c.kind !== "camp"]];

export default function CampLedger({ reserve, camps }: { reserve: string; camps: CampCard[] }) {
  const [f, setF] = useState("all");
  const both = camps.some((c) => c.kind === "camp") && camps.some((c) => c.kind !== "camp");
  const shown = camps.filter(FILTERS.find((x) => x[0] === f)![2]);
  return (
    <div className="mt-8">
      {both && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={`Filter the camps on ${reserve}`}>
          {FILTERS.map(([k, l, t]) => <button key={k} type="button" role="tab" aria-selected={f === k} onClick={() => setF(k)} className={`px-3.5 py-1.5 border text-[13px] tracking-wide ${f === k ? "border-crimson bg-crimson text-paper" : "ledger-border hover:border-ink/40"}`}>{l} <span className="opacity-70">({camps.filter(t).length})</span></button>)}
        </div>
      )}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <li key={c.slug} className="border ledger-border bg-paper flex flex-col">
            <div className="relative">
              <Carousel photos={c.photos} name={c.name} ratio="aspect-[4/3]" />
              {c.mark && <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-crimson text-paper px-2.5 py-1 text-[11px] tracking-[0.14em] uppercase"><Star className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />{c.mark}</span>}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="ledger-eyebrow">{c.kindLabel}</p>
              <h3 className="ledger-display text-[1.45rem] mt-1 leading-tight">{c.name}</h3>
              {c.units && <p className="mt-1.5 text-[13px] ledger-muted flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{c.units}</p>}
              {c.line && <p className="mt-3 text-[15px] leading-relaxed">{c.line}</p>}
              <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                {c.from ? <p><span className="ledger-eyebrow">From </span><span className="ledger-display text-xl ledger-crimson">{c.from}</span><span className="block text-[12px] ledger-muted">{c.fromBasis}</span></p> : <p className="text-[13px] ledger-muted">Rate with your quote</p>}
                {c.href
                  ? <Link href={c.href} className="ledger-btn shrink-0 inline-flex items-center gap-1.5">Enter <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
                  : <a href={`/plan?trip=${encodeURIComponent(`${reserve} · ${c.name}`)}`} className="ledger-btn-ghost shrink-0">Ask James</a>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
