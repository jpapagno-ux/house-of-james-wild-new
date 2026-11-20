"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import Stamp from "./Stamp";

// JWC-STYLE-01, Stage 1. The hero: one lead photograph, a six-frame strip from the stay's own hero set (choose a
// frame and it becomes the lead), one primary button, the save link, and one line beneath the button:
// "Vetted by the house · {Ledger ID} · Why". Every word and photograph is passed in from the record.
export type HeroFrame = { url: string; alt: string };
type Props = {
  eyebrow: string;
  name: string;
  place?: string | null;
  tagline?: string | null;
  frames: HeroFrame[];
  /** The live offer tag, already worded from the offer record; nothing when no offer is live. */
  offerTag?: string | null;
  ledgerId?: string | null;
  /** The stamp's entry number, from the Ledger ID. */
  entry?: string | null;
  credit?: string | null;
  cta: { label: string; href: string };
  /** The existing save control, unchanged (renders nothing while its flag is off). */
  save?: ReactNode;
  whyHref: string;
};

export default function JournalHero({ eyebrow, name, place, tagline, frames, offerTag, ledgerId, entry, credit, cta, save, whyHref }: Props) {
  const [at, setAt] = useState(0);
  return (
    <section id="journal-hero" aria-label={name} className="jw-onphoto relative isolate overflow-hidden bg-ink-deep text-white">
      {frames.map((f, i) => (
        <Image key={f.url} src={f.url} alt={i === at ? f.alt : ""} aria-hidden={i === at ? undefined : true} fill priority={i === 0} loading={i === 0 ? undefined : "lazy"} sizes="100vw"
          className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === at ? "opacity-100" : "opacity-0"}`} />
      ))}
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,24,22,0.55)_0%,rgba(26,24,22,0.12)_32%,rgba(38,20,22,0.25)_58%,rgba(38,20,22,0.9)_100%)]" />
      <div className="relative z-10 max-w-ledger mx-auto px-5 md:px-10 pt-[calc(var(--jw-header-h)+2.5rem)] pb-8 md:pb-10 min-h-[86svh] flex flex-col">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] tracking-[0.28em] uppercase text-white/85">{eyebrow}</p>
            <h1 className="font-display font-medium text-[3.2rem] md:text-[5.6rem] leading-[0.98] mt-3">{name}</h1>
            {place && <p className="font-display italic text-[1.35rem] md:text-[1.75rem] text-white/90 mt-3">{place}</p>}
            <span aria-hidden className="block h-px w-12 bg-white/60 mt-5" />
            {tagline && <p className="font-body font-semibold text-[11.5px] tracking-[0.24em] uppercase text-white/90 mt-5 max-w-xl">{tagline}</p>}
            {offerTag && <p className="mt-5 inline-flex items-center gap-2.5 bg-[color:var(--jw-crimson)] px-3.5 py-2 font-mono text-[10.5px] tracking-[0.2em] uppercase text-white"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />{offerTag}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href={cta.href} className="ledger-btn ledger-btn--house">{cta.label}</a>
              {save}
            </div>
            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] tracking-[0.22em] uppercase text-white/85">
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="8" cy="8" r="7" /><path d="m5 8.2 2 2 4-4.4" /></svg>
              <span>Vetted by the house</span>
              {ledgerId && <><span aria-hidden>·</span><span>{ledgerId}</span></>}
              <span aria-hidden>·</span>
              <a href={whyHref} className="underline underline-offset-4 decoration-white/60 hover:decoration-white">Why</a>
            </p>
          </div>
          {entry && <div className="hidden md:block shrink-0 pt-16"><Stamp tone="paper" size={132} top="James Wild & Co" main="Stay" sub={`No. ${entry}`} bottom={ledgerId ?? "The Ledger"} /></div>}
        </div>
        {frames.length > 1 && (
          <div className="mt-auto pt-12">
            <div className="flex items-end justify-between gap-4">
              <p className="font-mono text-[9.5px] tracking-[0.24em] uppercase text-white/80">{frames.length} photographs · choose a frame</p>
              {credit && <p className="hidden sm:block font-mono text-[9.5px] tracking-[0.2em] uppercase text-white/70">Photographs courtesy of {credit}</p>}
            </div>
            <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
              {frames.map((f, i) => (
                <li key={f.url} className="shrink-0">
                  <button type="button" onClick={() => setAt(i)} aria-pressed={i === at} aria-label={`Show photograph ${i + 1} of ${frames.length}: ${f.alt}`}
                    className={`relative block h-[58px] w-[92px] md:h-[72px] md:w-[122px] overflow-hidden border-2 transition-colors ${i === at ? "border-white" : "border-white/30 hover:border-white/70"}`}>
                    <Image src={f.url} alt="" fill sizes="122px" className="object-cover" />
                  </button>
                  <span aria-hidden className="mt-1.5 block font-mono text-[9.5px] tracking-[0.2em] text-white/75">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
