"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { ChevronLeft, ChevronRight } from "lucide-react";

// HeroSlider — the full-screen photo hero on every region and country page.
// Slides are the approved Wild Earth Stays images already on the Ledger
// record (featured image, section images, stay heroes). Each crossfades in
// with a slow zoom; a Ledger counter and progress hairline show the place;
// arrows, dots and swipe move it; it pauses on hover and when the tab is
// hidden. The first slide is a priority image (the LCP element).
// Reduced motion → the first photo, still.

export type Slide = { src: string; alt: string; caption?: string };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSlider({ slides, interval = 6500, label, children }: { slides: Slide[]; interval?: number; label: string; children?: ReactNode }) {
  const reduce = useReducedMotionSafe();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (reduce || paused || n < 2) return;
    const t = setTimeout(() => go(1), interval);
    return () => clearTimeout(t);
  }, [i, paused, reduce, n, interval, go]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!n) return null;
  const s = slides[reduce ? 0 : i];

  return (
    <section
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-white"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div key={s.src} className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: EASE }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: interval / 1000 + 1.5, ease: "linear" }}>
            <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/5 to-black/75" />
      <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />

      <div className="relative h-full">{children}</div>

      {n > 1 && !reduce && (
        <div className="absolute right-6 md:right-12 bottom-8 md:bottom-12 flex items-center gap-4">
          <span className="ledger-eyebrow !text-white/85 tabular-nums" aria-live="polite">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <div className="hidden md:flex items-center gap-1.5">
            {slides.map((x, k) => (
              <button key={x.src} type="button" aria-label={`Photo ${k + 1}${x.caption ? `: ${x.caption}` : ""}`} aria-pressed={k === i} onClick={() => setI(k)} className={`h-[2px] transition-all duration-500 ${k === i ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center hover:bg-white hover:text-ink transition-colors">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center hover:bg-white hover:text-ink transition-colors">
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {s.caption && <p className="absolute left-6 md:left-12 bottom-3 md:bottom-6 ledger-eyebrow !text-white/70 !text-[9.5px]">{s.caption}</p>}

      {n > 1 && !reduce && (
        <motion.div
          key={`bar-${i}-${paused}`}
          className="absolute left-0 bottom-0 h-[2px] w-full bg-white/80 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: paused ? 0 : 1 }}
          transition={{ duration: paused ? 0.2 : interval / 1000, ease: "linear" }}
          aria-hidden="true"
        />
      )}
      <div id="hero-end" className="absolute bottom-0" />
    </section>
  );
}
