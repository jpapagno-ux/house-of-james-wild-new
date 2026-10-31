"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
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

export default function HeroSlider({ slides, interval = 4500, label, children, height = "h-[100svh] min-h-[620px]", controls = "bottom" }: { slides: Slide[]; interval?: number; label: string; children?: ReactNode; height?: string; controls?: "bottom" | "top" }) {
  const reduce = useReducedMotionSafe();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  // The photo on screen: the chosen one once it has arrived, else the last one shown.
  const [shown, setShown] = useState(0);
  useEffect(() => { if (loaded.has(i)) setShown(i); }, [i, loaded]);
  // Current and next slide are always mounted, so the next photo is fetched ahead.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));
  useEffect(() => {
    setMounted((m) => {
      const want = [i, (i + 1) % Math.max(n, 1)];
      return want.every((k) => m.has(k)) ? m : new Set([...m, ...want]);
    });
  }, [i, n]);

  useEffect(() => {
    if (reduce || paused || n < 2) return;
    // Hold on this photo until the next has arrived.
    if (!loaded.has((i + 1) % n)) return;
    const t = setTimeout(() => go(1), interval);
    return () => clearTimeout(t);
  }, [i, paused, reduce, n, interval, go, loaded]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!n) return null;
  const s = slides[reduce ? 0 : i];

  return (
    <section
      className={`relative ${height} overflow-hidden bg-ink text-white`}
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
      {/* Every slide stays mounted once it has been fetched, stacked; only the
          current one is opaque. The next photo loads while this one shows, and
          the slider waits for it, so a slide never fades in to black. */}
      {slides.map((x, k) => {
        if (reduce ? k !== 0 : !mounted.has(k)) return null;
        const on = k === (reduce ? 0 : shown);
        return (
          <div key={x.src} className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{ opacity: on ? 1 : 0, zIndex: on ? 1 : 0 }} aria-hidden={!on}>
            <motion.div className="absolute inset-0" initial={false} animate={{ scale: on && !reduce ? 1 : 1.08 }} transition={{ duration: on ? interval / 1000 + 1.5 : 0, ease: "linear" }}>
              <Image src={x.src} alt={on ? x.alt : ""} fill priority={k === 0} loading={k === 0 ? undefined : "eager"} sizes="(max-width: 768px) 140vw, 110vw" quality={85} className="object-cover" onLoad={() => setLoaded((m) => (m.has(k) ? m : new Set(m).add(k)))} />
            </motion.div>
          </div>
        );
      })}

      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-black/5 to-black/75" />
      <div className="pointer-events-none absolute inset-3 md:inset-5 z-[2] border border-white/25" aria-hidden="true" />

      {/* Above the slides (the showing slide sits at z-index 1) so the title and stamp are never covered. */}
      <div className="relative z-[3] h-full">{children}</div>

      {n > 1 && !reduce && (
        <div className={`absolute right-6 md:right-12 flex items-center gap-4 z-[4] ${controls === "top" ? "top-[92px] lg:top-[188px]" : "bottom-8 md:bottom-12"}`}>
          <span className="ledger-eyebrow !text-white/85 tabular-nums" aria-live="polite">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <div className="hidden md:flex items-center gap-1.5">
            {slides.map((x, k) => (
              <button key={x.src} type="button" aria-label={`Photo ${k + 1}${x.caption ? `: ${x.caption}` : ""}`} aria-pressed={k === i} onClick={() => setI(k)} className="group flex h-6 min-w-6 items-center justify-center" /* 24px target (WCAG 2.5.8); the bar stays 2px */>
                <span aria-hidden="true" className={`block h-[2px] transition-all duration-500 ${k === i ? "w-8 bg-white" : "w-3 bg-white/40 group-hover:bg-white/70"}`} />
              </button>
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

      {s.caption && <p className="absolute z-[3] left-6 md:left-12 bottom-3 md:bottom-6 ledger-eyebrow !text-white/70 !text-[9.5px]">{s.caption}</p>}

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
