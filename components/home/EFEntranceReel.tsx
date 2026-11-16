"use client";

import { useEffect, useRef, useState } from "react";
import SafeLink from "@/components/ledger/SafeLink";
import { EFStamp } from "@/components/exceptional-few/EFBadge";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

export type EFSlide = {
  id: string; no: number; label: string; name: string; href: string; place: string; line: string;
  image: { wide: string; tall: string; alt: string; credit: string };
  film: { src: string; srcMobile: string; credit: string } | null;
};

const HOLD = 7000; // a photograph holds for seven seconds; a film plays to its end (or 16 s, whichever first)

// The reel: one designation at a time, full bleed, crossfading. The photograph drifts slowly (Ken Burns), a brand
// film plays muted where one is filed, the stamp presses in, and the index of numbers runs along the foot. Pauses on
// hover and when off screen; with reduced motion it holds the first frame and the index still works by click.
export default function EFEntranceReel({ slides, total, allHref }: { slides: EFSlide[]; total: number; allHref: string }) {
  const reduced = useReducedMotionSafe();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState(false);
  const box = useRef<HTMLElement>(null);
  const s = slides[i];

  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => setSeen(en.isIntersecting), { threshold: 0.35 });
    io.observe(el); return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !seen || slides.length < 2) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), s.film ? 16000 : HOLD);
    return () => clearTimeout(t);
  }, [i, reduced, paused, seen, slides.length, s.film]);

  return (
    <section ref={box} id="exceptional-few-entrance" aria-roledescription="carousel" aria-label="The Exceptional Few"
      className="jw-onphoto relative isolate overflow-hidden bg-ink text-white h-[88svh] min-h-[560px] max-h-[980px]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((x, n) => {
        const on = n === i;
        return (
          <div key={x.id} aria-hidden={!on} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${on ? "opacity-100" : "opacity-0"}`}>
            <picture>
              <source media="(max-width: 767px)" srcSet={x.image.tall} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.image.wide} alt={on ? x.image.alt : ""} loading={n < 2 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover ${!reduced && on ? "ef-drift" : ""}`} />
            </picture>
            {x.film && on && !reduced && seen && (
              <video key={x.id} className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline loop preload="none" aria-hidden="true">
                <source media="(max-width: 767px)" src={x.film.srcMobile} type="video/mp4" />
                <source src={x.film.src} type="video/mp4" />
              </video>
            )}
          </div>
        );
      })}
      {/* the house gradient, Ink to Garnet, from the foot and the left so the words always read */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(26,24,22,0.35) 0%, rgba(26,24,22,0) 28%, rgba(46,43,40,0.15) 55%, rgba(58,28,31,0.82) 88%, rgba(26,24,22,0.95) 100%)" }} />
      <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ background: "linear-gradient(90deg, rgba(26,24,22,0.7) 0%, rgba(26,24,22,0.25) 42%, rgba(26,24,22,0) 65%)" }} />

      <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-24 md:pb-28">
        <p className="ledger-eyebrow !text-white/80">The Exceptional Few&trade; · {total} places with no second version</p>
        <div key={s.id} className={reduced ? "" : "ef-rise"}>
          <p className="mt-5 font-mono text-[12px] tracking-[0.28em] uppercase text-white/75">{s.label} · {s.place}</p>
          <h2 className="ledger-display text-[2.6rem] leading-[1.02] md:text-[5rem] mt-3 max-w-4xl">{s.name}</h2>
          {s.line && <p className="mt-4 max-w-2xl text-[18px] md:text-[21px] leading-relaxed text-white/90 font-serif italic">{s.line}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <SafeLink href={s.href} className="ledger-btn ledger-btn--light">Enter {s.label}</SafeLink>
            <SafeLink href={allHref} className="ledger-btn-ghost ledger-btn--light">See all {total}</SafeLink>
          </div>
        </div>
      </div>

      <div className="absolute right-5 md:right-10 top-24 md:top-28 hidden sm:block" aria-hidden="true">
        <div key={s.id} className={reduced ? "" : "ef-press"}><EFStamp no={s.no} size={170} rotate={-7} onPhoto /></div>
      </div>

      {/* the index: every number, the current one lit */}
      <nav aria-label="Choose a designation" className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/25 backdrop-blur-[2px]">
        <ol className="max-w-ledger mx-auto px-5 md:px-10 flex gap-1 overflow-x-auto py-3 scrollbar-none">
          {slides.map((x, n) => (
            <li key={x.id} className="shrink-0">
              <button type="button" onClick={() => setI(n)} aria-current={n === i} aria-label={`${x.label}, ${x.name}`}
                className={`font-mono text-[11px] tracking-[0.18em] px-2.5 py-1.5 border transition-colors ${n === i ? "border-white text-white" : "border-transparent text-white/55 hover:text-white"}`}>
                {String(x.no).padStart(3, "0")}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <p className="absolute right-5 md:right-10 bottom-16 text-[10px] tracking-wide text-white/55 max-w-[50%] text-right">{s.film ? s.film.credit : s.image.credit}</p>
    </section>
  );
}
