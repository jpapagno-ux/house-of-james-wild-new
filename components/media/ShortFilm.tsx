"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import type { ShortFilm } from "@/lib/content/films";

// A YouTube Short, looped silently: privacy mode, no controls, nothing to click.
// The still shows first; the player loads after (on view for panels, after first
// paint for heroes) and fades in once YouTube's own loading flash has passed.
// Reduced motion keeps the still.
const src = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0`;

function Player({ film, on, className }: { film: ShortFilm; on: boolean; className: string }) {
  const [shown, setShown] = useState(false);
  if (!on) return null;
  return (
    <iframe
      src={src(film.id)}
      title={film.title}
      aria-hidden="true"
      tabIndex={-1}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => setTimeout(() => setShown(true), 1800)}
      className={`absolute pointer-events-none border-0 transition-opacity duration-1000 ${shown ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}

function Credit({ film }: { film: ShortFilm }) {
  return (
    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white pointer-events-none">
      <p className="ledger-display text-[15px] leading-tight">James Wild &amp; Co.</p>
      <p className="ledger-eyebrow !text-[9px] !text-white/75 mt-1">{film.credit}</p>
    </div>
  );
}

/** A framed tall film for a page section. Loads only when scrolled near. */
export function ShortFilmPanel({ film, className = "", sizes = "(max-width: 768px) 100vw, 300px" }: { film: ShortFilm; className?: string; sizes?: string }) {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduce || !ref.current) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setOn(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <figure ref={ref} className={`relative aspect-[9/16] overflow-hidden bg-ink ring-1 ring-black/10 ${className}`}>
      <Image src={film.poster} alt={film.alt} fill sizes={sizes} quality={85} className="object-cover" />
      <Player film={film} on={on} className="inset-0 w-full h-full scale-[1.08]" />
      <Credit film={film} />
      <figcaption className="sr-only">{film.title}. {film.description}</figcaption>
    </figure>
  );
}

/**
 * The film as a hero background. Tall screens: edge to edge. Wide screens: a
 * framed panel at full height on the right over a blurred still (cropping a
 * 9:16 film to 16:9 would lose two-thirds of it and soften the picture).
 * Only the player for the screen's current shape loads.
 */
export function ShortFilmBackdrop({ film, top = 116, bottom = 52 }: { film: ShortFilm; top?: number; bottom?: number }) {
  const reduce = useReducedMotionSafe();
  const [ready, setReady] = useState(false);
  const [tall, setTall] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const f = () => setTall(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    if (reduce) return;
    const go = () => setReady(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 600);
  }, [reduce]);
  return (
    <>
      <div className="absolute inset-0 overflow-hidden landscape:hidden" aria-hidden="true">
        <Image src={film.poster} alt="" fill priority quality={85} sizes="100vw" className="object-cover" />
        <Player film={film} on={ready && tall === true} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.08] w-[max(100vw,56.25svh)] h-[max(100svh,177.78vw)]" />
      </div>
      <div className="absolute inset-0 overflow-hidden portrait:hidden" aria-hidden="true">
        <Image src={film.poster} alt="" fill priority quality={60} sizes="100vw" className="object-cover scale-110 blur-2xl brightness-[0.55] saturate-[1.15]" />
        <div className="absolute right-[5vw] xl:right-[9vw] aspect-[9/16] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/25" style={{ top, bottom }}>
          <Image src={film.poster} alt="" fill priority quality={85} sizes="40vw" className="object-cover" />
          <Player film={film} on={ready && tall === false} className="inset-0 w-full h-full scale-[1.08]" />
          <Credit film={film} />
        </div>
      </div>
      <p className="absolute bottom-5 right-6 landscape:hidden ledger-eyebrow !text-[9px] !text-white/70 z-[1]">{film.credit}</p>
    </>
  );
}
