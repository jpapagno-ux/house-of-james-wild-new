"use client";

import { useEffect } from "react";

// Board 2, "the route draws as you read" (James approved, 3 Nov 2026), on the voyage and overland route pages. On wide
// screens the chart stays in place beside the stops; as each stop card reaches the middle of the screen the chart sails
// or drives to that day (window.chartDay, the engine's own API, the same one the ship pages use) and the card is marked.
// Phones keep the chart above the list and follow taps only; with reduced motion the chart only follows taps.
export default function RouteScrollSync({ list }: { list: string }) {
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.getElementById(list);
    if (!root || !("IntersectionObserver" in window)) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-jw-day]"));
    let last = -1;
    const io = new IntersectionObserver((entries) => {
      if (!wide.matches || still.matches) return;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const i = cards.indexOf(e.target as HTMLElement);
        if (i === last) continue;
        last = i;
        cards.forEach((c, k) => c.toggleAttribute("data-on", k === i));
        const day = Number((e.target as HTMLElement).dataset.jwDay);
        const w = window as Window & { chartDay?: (k: string, d: number, src?: string) => void };
        if (typeof w.chartDay === "function" && day) w.chartDay("R0", day, "scroll");
      }
    }, { rootMargin: "-45% 0px -45% 0px" });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [list]);
  return null;
}
