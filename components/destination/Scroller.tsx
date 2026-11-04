"use client";

import { useRef } from "react";

// A sideways strip of cards: swipe on a phone (each card snaps into place and the next one peeks
// in), arrows on a laptop. The cards themselves are rendered on the server and passed in.
export default function Scroller({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };
  return (
    <div className="relative">
      {count > 2 && (
        <div className="hidden md:flex absolute -top-12 right-0 gap-2" aria-hidden="false">
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
