"use client";

import { useEffect, useRef, useState } from "react";

// A sideways strip of cards: swipe on a phone (each card snaps into place and the next one peeks
// in), arrows on a laptop. The cards themselves are rendered on the server and passed in.
// `auto` (James, 18 Nov 2026: "carousel that scrolls slowly on auto"): moves one card every few seconds,
// back to the start after the last; pauses while the reader hovers, focuses or touches it, when the tab is
// hidden, and never runs for readers who ask for reduced motion.
export default function Scroller({ label, count, children, auto = false, every = 5500 }: { label: string; count: number; children: React.ReactNode; auto?: boolean; every?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const step = () => {
    const card = ref.current?.querySelector<HTMLElement>("[data-card]");
    return (card?.offsetWidth ?? 300) + 16;
  };
  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  useEffect(() => {
    if (!auto || paused || count < 2) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el || document.hidden) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step(), behavior: "smooth" });
    }, every);
    return () => window.clearInterval(id);
  }, [auto, paused, count, every]);

  const hold = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false), onTouchStart: () => setPaused(true) };
  return (
    <div className="relative" {...(auto ? hold : {})}>
      {count > 2 && (
        <div className="hidden md:flex absolute -top-12 right-0 gap-2" aria-hidden="false">
          {auto && <button type="button" onClick={() => setPaused((p) => !p)} className="house-chip" aria-pressed={paused} aria-label={paused ? `Play ${label}` : `Pause ${label}`}>{paused ? "Play" : "Pause"}</button>}
          <button type="button" onClick={() => go(-1)} className="house-chip" aria-label={`Previous in ${label}`}>←</button>
          <button type="button" onClick={() => go(1)} className="house-chip" aria-label={`Next in ${label}`}>→</button>
        </div>
      )}
      <div ref={ref} role="list" aria-label={label}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:thin]">
        {children}
      </div>
    </div>
  );
}
