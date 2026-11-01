"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BedDouble, Layers, Maximize2 } from "lucide-react";
import { cabinColour } from "@/lib/content/ships/types";

// Cabins and the deck plan, one piece: cards side by side (a swipeable row on
// phones); tapping a card picks that cabin type, turns the deck plan to its
// deck and lights its swatch in the legend. Swatch colours are cabin keys,
// never volume colours (those live only in lib/volumes.ts).

export type CabinCard = { type: string; count: number | null; size: string | null; beds: string | null; deck: string | null; features: string[]; image?: { url: string; alt: string } | null; from: number | null };
export type DeckPlan = { deck: string; image: { url: string; alt: string }; cabins: string[] };

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export default function CabinsDeck({ cabins, decks, credit, basis, cabinTitle, deckTitle, cabinIntro, heads }: {
  cabins: CabinCard[]; decks: DeckPlan[]; credit?: string; basis: string; cabinTitle: string; deckTitle: string; cabinIntro?: string;
  heads: { cabins: React.ReactNode; decks: React.ReactNode };
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [deck, setDeck] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const colour = (t: string) => cabinColour(cabins.map((c) => c.type), t);

  const pick = (t: string) => {
    setPicked((p) => (p === t ? null : t));
    const d = decks.findIndex((x) => x.cabins.includes(t));
    if (d >= 0) setDeck(d);
    const el = deckRef.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.8) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  const plan = decks[deck];

  return (
    <>
      <section id="cabins" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]" aria-label={cabinTitle}>
        {heads.cabins}
        {cabinIntro && <p className="sr-only">{cabinIntro}</p>}
        <ul className="mt-8 flex lg:grid lg:grid-cols-3 gap-4 lg:gap-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory -mx-5 px-5 lg:mx-0 lg:px-0 pb-3 [scrollbar-width:thin]">
          {cabins.map((c) => {
            const on = picked === c.type;
            return (
              <li key={c.type} className="snap-start shrink-0 w-[84%] sm:w-[48%] lg:w-auto">
                <button type="button" onClick={() => pick(c.type)} aria-pressed={on}
                  className={`group text-left w-full h-full border flex flex-col bg-paper transition-colors ${on ? "border-crimson ring-1 ring-crimson" : "ledger-border hover:border-crimson/60"}`}>
                  <div className="relative aspect-[3/2] w-full bg-paper-card border-b ledger-rule">
                    {c.image && <Image src={c.image.url} alt={c.image.alt} fill sizes="(min-width: 1024px) 33vw, 84vw" className="object-cover" />}
                    {c.count != null && <span className="absolute top-3 left-3 bg-paper/95 font-mono text-[11px] px-2 py-0.5">{c.count} {c.count === 1 ? "cabin" : "cabins"}</span>}
                  </div>
                  <div className="p-4 flex-1 flex flex-col w-full">
                    <p className="flex items-center gap-2 ledger-eyebrow"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: colour(c.type) }} aria-hidden="true" />{c.deck ?? "Deck to confirm"}</p>
                    <h3 className="ledger-display text-[21px] mt-1 leading-snug">{c.type}</h3>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] ledger-muted">
                      {c.size && <li className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{c.size}</li>}
                      {c.beds && <li className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{c.beds}</li>}
                    </ul>
                    {c.features.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5">{c.features.slice(0, 6).map((f) => <li key={f} className="text-[11.5px] border ledger-border px-2 py-0.5">{f}</li>)}</ul>}
                    <div className="mt-auto pt-4 border-t ledger-border flex items-end justify-between gap-3 w-full">
                      {c.from ? <p><span className="ledger-eyebrow block">From</span><span className="ledger-display ledger-crimson text-[20px]">{usd(c.from)}</span><span className="block text-[11.5px] ledger-muted">{basis}</span></p> : <p className="text-[13px] ledger-muted">Quoted for your dates</p>}
                      {decks.length > 0 && <span className="text-[11px] uppercase tracking-[0.14em] ledger-muted group-hover:ledger-crimson flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{on ? "On the plan" : "Deck plan"}</span>}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {credit && <p className="mt-2 text-[12px] ledger-muted">Photographs: {credit}</p>}
      </section>

      {plan && (
        <section id="deck-plan" ref={deckRef} className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]" aria-label={deckTitle}>
          {heads.decks}
          {decks.length > 1 && (
            <div role="tablist" aria-label="Decks" className="mt-6 flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0">
              {decks.map((d, i) => (
                <button key={d.deck} type="button" role="tab" aria-selected={i === deck} onClick={() => setDeck(i)}
                  className={`shrink-0 border px-4 min-h-[44px] text-[13px] uppercase tracking-[0.14em] ${i === deck ? "border-crimson bg-crimson text-paper" : "ledger-border hover:border-crimson"}`}>{d.deck}</button>
              ))}
            </div>
          )}
          <div className="mt-5 grid lg:grid-cols-[1fr_260px] gap-6 items-start">
            <figure className="border ledger-border bg-white p-2 md:p-4">
              <Image key={plan.image.url} src={plan.image.url} alt={plan.image.alt} width={1600} height={1000} sizes="(min-width: 1024px) 900px, 100vw" className="w-full h-auto" />
            </figure>
            <div>
              <p className="ledger-eyebrow">On {plan.deck === "All decks" ? "the plan" : plan.deck}</p>
              <ul className="mt-3 space-y-2">
                {(plan.cabins.length ? plan.cabins : cabins.map((c) => c.type)).map((t) => {
                  const on = picked === t;
                  return (
                    <li key={t}>
                      <button type="button" onClick={() => setPicked(on ? null : t)} aria-pressed={on}
                        className={`w-full min-h-[44px] flex items-center gap-3 border px-3 py-2 text-left text-[14.5px] transition-colors ${on ? "border-crimson bg-paper-card" : "ledger-border"} ${picked && !on ? "opacity-50" : ""}`}>
                        <span className={`w-4 h-4 rounded-full shrink-0 ${on ? "ring-2 ring-offset-2 ring-offset-paper" : ""}`} style={{ background: colour(t), ["--tw-ring-color" as string]: colour(t) }} aria-hidden="true" />
                        {t}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[12.5px] ledger-muted">Tap a cabin card or a swatch to pick a cabin type. Deck plan as published by the operator{credit ? `; image: ${credit}` : ""}.</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
