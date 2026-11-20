"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import WideFilmLayer from "@/components/media/WideFilm";
import type { WideFilm } from "@/lib/content/stay-films";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import Stamp from "./Stamp";

// JWC-STYLE-01, Stage 1. The hero: one lead (the stay's film when one is filed, else a photograph), a strip beneath
// it (Film first, then six frames from the stay's own set: choose one and it becomes the lead), one primary button,
// the save link, and one line beneath the button: "Vetted by the house · {Ledger ID} · Why".
// The film is the house's own WideFilmLayer, unchanged: muted, looping, the still shown first, and the still kept
// where a film should not play (reduced motion, Save-Data). Choosing any photograph stops the film.
// The photographs turn on their own, one every few seconds, and the strip follows; a Pause button stops them, as
// does choosing a frame, pointing at the strip or tabbing into it. Reduced motion keeps them still. On a stay with a
// film the film stays the lead; choose a photograph and press Play to turn through the photographs instead.
// On a phone the words sit at the foot of the hero on a deeper, even scrim, so they read over any frame.
export type HeroFrame = { url: string; alt: string };
type Props = {
  eyebrow: string;
  name: string;
  place?: string | null;
  tagline?: string | null;
  frames: HeroFrame[];
  /** The stay's filed hero film (lib/content/stay-films.ts); nothing when none is filed. */
  film?: WideFilm | null;
  /** A longer film with sound, further down the page: the link that jumps to it. */
  watch?: { label: string; href: string } | null;
  /** The live offer, worded from the offer record; nothing when no offer is live. */
  offer?: { headline: string; until: string; untilShort: string } | null;
  ledgerId?: string | null;
  /** The stamp's entry number, from the Ledger ID. */
  entry?: string | null;
  credit?: string | null;
  cta: { label: string; href: string };
  /** The existing save control, unchanged (renders nothing while its flag is off). */
  save?: ReactNode;
  whyHref: string;
};

const FILM = -1;
const EVERY_MS = 6000;

export default function JournalHero({ eyebrow, name, place, tagline, frames, film, watch, offer, ledgerId, entry, credit, cta, save, whyHref }: Props) {
  const [at, setAt] = useState(film ? FILM : 0);
  const reduce = useReducedMotionSafe();
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // pointing at the strip, or keyboard focus inside it
  const strip = useRef<HTMLUListElement>(null);
  const turning = !reduce && !paused && !held && at !== FILM && frames.length > 1;
  useEffect(() => {
    if (!turning) return;
    const t = window.setInterval(() => { if (!document.hidden) setAt((i) => (i === FILM ? i : (i + 1) % frames.length)); }, EVERY_MS);
    return () => window.clearInterval(t);
  }, [turning, frames.length]);
  // the strip follows the lead, sideways only (never moves the page)
  useEffect(() => {
    const ul = strip.current, li = ul?.querySelector<HTMLElement>('[data-on="true"]');
    if (!ul || !li) return;
    const left = li.offsetLeft - (ul.clientWidth - li.clientWidth) / 2;
    ul.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [at, reduce]);
  const choose = (i: number) => { setAt(i); setPaused(true); };
  const poster = film?.kind === "mp4" ? film.poster : frames[0]?.url;
  const tiles = (film ? 1 : 0) + frames.length;
  return (
    <section id="journal-hero" aria-label={name} className="jw-onphoto relative isolate overflow-hidden bg-ink-deep text-white">
      {frames.map((f, i) => (
        <Image key={f.url} src={f.url} alt={i === at ? f.alt : ""} aria-hidden={i === at ? undefined : true} fill priority={i === 0 && !film} loading={i === 0 && !film ? undefined : "lazy"} sizes="100vw"
          className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === at ? "opacity-100" : "opacity-0"}`} />
      ))}
      {film && at === FILM && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- the film's own poster frame, a Cloudinary still already sized for the hero */}
          {poster && <img src={poster} alt={film.title} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />}
          <WideFilmLayer film={film} />
        </>
      )}
      <span aria-hidden className="absolute inset-0 hidden md:block bg-[linear-gradient(180deg,rgba(26,24,22,0.55)_0%,rgba(26,24,22,0.12)_32%,rgba(38,20,22,0.25)_58%,rgba(38,20,22,0.9)_100%)]" />
      <span aria-hidden className="absolute inset-0 md:hidden bg-[linear-gradient(180deg,rgba(26,24,22,0.62)_0%,rgba(26,24,22,0.1)_20%,rgba(26,24,22,0.38)_36%,rgba(26,24,22,0.8)_54%,rgba(26,24,22,0.94)_100%)]" />
      <div className="relative z-10 max-w-ledger mx-auto px-5 md:px-10 pt-[calc(var(--jw-header-h)+1.5rem)] md:pt-[calc(var(--jw-header-h)+2.5rem)] pb-6 md:pb-10 min-h-[92svh] md:min-h-[86svh] flex flex-col">
        <div className="mt-auto md:mt-0 flex items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="font-mono text-[10px] md:text-[10.5px] tracking-[0.24em] md:tracking-[0.28em] uppercase text-white/85">{eyebrow}</p>
            <h1 className="font-display font-medium text-[2.75rem] md:text-[5.6rem] leading-[0.98] mt-2 md:mt-3 [text-shadow:0_1px_18px_rgba(26,24,22,0.45)]">{name}</h1>
            {place && <p className="font-display italic text-[1.2rem] md:text-[1.75rem] text-white/90 mt-2 md:mt-3">{place}</p>}
            <span aria-hidden className="hidden md:block h-px w-12 bg-white/60 mt-5" />
            {tagline && <p className="font-body font-semibold text-[10.5px] md:text-[11.5px] tracking-[0.16em] md:tracking-[0.24em] uppercase text-white/90 mt-3 md:mt-5 max-w-xl">{tagline}</p>}
            {offer && (
              <p className="mt-4 md:mt-5 inline-flex max-w-full items-center gap-2.5 bg-[color:var(--jw-crimson)] px-3 md:px-3.5 py-2 font-mono text-[10px] md:text-[10.5px] tracking-[0.12em] md:tracking-[0.2em] uppercase text-white">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                <span className="truncate">Offer · {offer.headline} · to <span className="md:hidden">{offer.untilShort}</span><span className="hidden md:inline">{offer.until}</span></span>
              </p>
            )}
            <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:gap-y-4">
              <a href={cta.href} className="ledger-btn ledger-btn--house">{cta.label}</a>
              {save}
              {watch && <a href={watch.href} className="ledger-btn-ghost">{watch.label}</a>}
            </div>
            <p className="mt-4 md:mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9.5px] md:text-[10.5px] tracking-[0.14em] md:tracking-[0.22em] uppercase text-white/90">
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="8" cy="8" r="7" /><path d="m5 8.2 2 2 4-4.4" /></svg>
              <span>Vetted by the house</span>
              {ledgerId && <><span aria-hidden>·</span><span>{ledgerId}</span></>}
              <span aria-hidden>·</span>
              <a href={whyHref} className="underline underline-offset-4 decoration-white/60 hover:decoration-white">Why</a>
            </p>
          </div>
          {entry && <div className="hidden md:block shrink-0 pt-16"><Stamp tone="paper" size={132} top="James Wild & Co" main="Stay" sub={`No. ${entry}`} bottom={ledgerId ?? "The Ledger"} /></div>}
        </div>
        {tiles > 1 && (
          <div className="md:mt-auto pt-6 md:pt-12 pb-16 md:pb-0">
            <div className="flex items-end justify-between gap-4">
              <p className="flex items-center gap-3 font-mono text-[9.5px] tracking-[0.2em] md:tracking-[0.24em] uppercase text-white/80">
                <span>{film ? "Film · " : ""}{frames.length} photographs · choose a frame</span>
                {!reduce && frames.length > 1 && at !== FILM && (
                  <button type="button" onClick={() => setPaused((x) => !x)} aria-pressed={paused} className="inline-flex items-center gap-1.5 border border-white/40 px-2 py-1 uppercase tracking-[0.18em] text-white hover:border-white">
                    <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">{paused ? <path d="M3 1.5v9l7-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}</svg>
                    {paused ? "Play" : "Pause"}
                  </button>
                )}
              </p>
              {(credit || film) && <p className="hidden sm:block font-mono text-[9.5px] tracking-[0.2em] uppercase text-white/70">{at === FILM && film ? film.credit : credit ? `Photographs courtesy of ${credit}` : ""}</p>}
            </div>
            <ul ref={strip} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)} className="relative mt-2.5 md:mt-3 flex gap-2.5 md:gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
              {film && (
                <li className="shrink-0" data-on={at === FILM}>
                  <span aria-hidden className="mb-1 block font-mono text-[9.5px] tracking-[0.2em] uppercase text-white/75">Film</span>
                  <button type="button" onClick={() => choose(FILM)} aria-pressed={at === FILM} aria-label={`Play the film: ${film.title}`}
                    className={`relative block h-[52px] w-[82px] md:h-[72px] md:w-[122px] overflow-hidden border-2 bg-ink-deep transition-colors ${at === FILM ? "border-white" : "border-white/30 hover:border-white/70"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- the poster frame again, small */}
                    {poster && <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
                    <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-[rgba(26,24,22,0.35)]"><svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg></span>
                  </button>
                </li>
              )}
              {frames.map((f, i) => (
                <li key={f.url} className="shrink-0" data-on={i === at}>
                  <span aria-hidden className="mb-1 block font-mono text-[9.5px] tracking-[0.2em] text-white/75">{String(i + 1).padStart(2, "0")}</span>
                  <button type="button" onClick={() => choose(i)} aria-pressed={i === at} aria-label={`Show photograph ${i + 1} of ${frames.length}: ${f.alt}`}
                    className={`relative block h-[52px] w-[82px] md:h-[72px] md:w-[122px] overflow-hidden border-2 transition-colors ${i === at ? "border-white" : "border-white/30 hover:border-white/70"}`}>
                    <Image src={f.url} alt="" fill sizes="122px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
