"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

// The Exceptional Few arrival: three full-bleed frames that take over from each
// other as the reader scrolls (place → architecture in landscape → the name),
// the brief's photographic order made literal. The container is 300vh; a sticky
// viewport inside it crossfades the frames by scroll progress. With reduced
// motion, or before hydration, the last frame prints as a plain hero.
export type HeroFrame = { src: string; alt: string; caption?: string; credit?: string };

export default function ScrollHero({ frames, designation, title, place, line, actions, credit }: {
  frames: HeroFrame[]; designation: string; title: string; place: string; line?: string | null; actions?: React.ReactNode; credit?: string;
}) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current; if (!el) return;
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);

  const n = frames.length;
  const stage = reduced ? n - 1 : Math.min(n - 1, Math.floor(p * n));
  const fade = (i: number) => {
    if (reduced) return i === n - 1 ? 1 : 0;
    const seg = 1 / n, start = i * seg, mid = start + seg * 0.25;
    if (i === 0) return p < seg ? 1 : Math.max(0, 1 - (p - seg) / (seg * 0.35));
    return Math.min(1, Math.max(0, (p - start + seg * 0.1) / (mid - start + seg * 0.1)));
  };
  const named = reduced || p > (n - 1) / n + 0.05;
  const current = frames[stage];

  return (
    <div ref={ref} className={reduced ? "" : "h-[300svh]"}>
      <section className={`${reduced ? "relative" : "sticky top-0"} h-[100svh] overflow-hidden bg-ink text-white`} aria-label={`${title}: the arrival`}>
        {frames.map((f, i) => (
          <div key={f.src} className="absolute inset-0 transition-opacity duration-300 ease-linear" style={{ opacity: fade(i), zIndex: i }} aria-hidden={i !== stage}>
            <Image src={f.src} alt={f.alt} fill priority={i === 0} sizes="100vw" quality={85} className="object-cover" style={{ transform: reduced ? undefined : `scale(${1 + 0.06 * (1 - fade(i))})` }} />
          </div>
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
        <div className="pointer-events-none absolute inset-3 md:inset-5 z-10 border border-white/25" aria-hidden="true" />
        <div className="relative z-20 h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-10 md:pb-14">
          <p className="ledger-eyebrow !text-white/85 transition-opacity duration-500" style={{ opacity: reduced || p > 0.08 ? 1 : 0 }}>{designation}</p>
          <h1 className="ledger-h1 mt-3 transition-all duration-700" style={{ opacity: named ? 1 : 0, transform: named ? "none" : "translateY(14px)" }}>{title}</h1>
          <p className="ledger-display italic text-lg md:text-2xl text-white/90 mt-3 transition-opacity duration-700" style={{ opacity: named ? 1 : 0 }}>{place}</p>
          {line && <p className="mt-5 max-w-2xl text-[16px] md:text-[18px] leading-relaxed text-white/90 transition-opacity duration-700 delay-150" style={{ opacity: named ? 1 : 0 }}>{line}</p>}
          {actions && <div className="mt-7 flex flex-wrap items-center gap-4 transition-opacity duration-700 delay-300" style={{ opacity: named ? 1 : 0 }}>{actions}</div>}
        </div>
        <p className="absolute z-20 bottom-2 right-6 md:bottom-1.5 md:right-8 text-[10.5px] tracking-[0.08em] text-white/70">{current?.caption ? `${current.caption} · ` : ""}{current?.credit ?? credit}</p>
        {!reduced && <p className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.24em] uppercase text-white/60 transition-opacity" style={{ opacity: p < 0.05 ? 1 : 0 }}>Scroll</p>}
      </section>
    </div>
  );
}
