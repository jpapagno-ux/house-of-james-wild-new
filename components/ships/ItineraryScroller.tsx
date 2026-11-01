"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// The day log beside the house route chart. As each day reaches the middle of the screen
// (IntersectionObserver) the chart sails to it (window.chartDay, jw-chart's own API), and the
// day lights up in the log; tapping a day does the same. Tabs switch itineraries (chartRoute).
// The chart itself honours prefers-reduced-motion; here, with reduced motion, the log only
// follows taps, never the scroll. Without script the chart's fallback lists every stop.

declare global { interface Window { chartDay?: (k: string, d: number) => void; chartRoute?: (k: string, scroll?: boolean) => void; onChartDay?: (k: string, d: number, auto: boolean) => void } }

export type ScrollerDay = { day: number; title: string; place: string; summary: string };
export type ScrollerItinerary = { name: string; direction: string; nights: number; days: ScrollerDay[] };

// `map` is the chart block, rendered on the server and passed through untouched, so React never
// rewrites the element the chart engine draws into.
export default function ItineraryScroller({ ship, itineraries, map }: { ship: string; itineraries: ScrollerItinerary[]; map: ReactNode }) {
  const [tab, setTab] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [closed, setClosed] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLOListElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const last = useRef<string>("");
  const it = itineraries[tab];

  const sail = (t: number, i: number) => {
    const d = itineraries[t]?.days[i];
    if (!d || typeof window.chartDay !== "function") return;
    const k = `${t}:${d.day}`;
    if (last.current === k) return;
    last.current = k;
    window.chartDay(`R${t}`, d.day);
  };

  // when the chart plays on its own, the log follows it
  useEffect(() => {
    const prev = window.onChartDay;
    window.onChartDay = (k, d, auto) => {
      prev?.(k, d, auto);
      if (k !== `R${tab}`) return;
      const i = itineraries[tab]?.days.findIndex((x) => x.day === d) ?? -1;
      if (i >= 0) { last.current = `${tab}:${d}`; setActive(i); }
    };
    return () => { window.onChartDay = prev; };
  }, [tab, itineraries]);

  // the chart's own route buttons switch our tabs too
  useEffect(() => {
    const root = mapRef.current;
    if (!root) return;
    const on = (e: Event) => {
      const b = (e.target as HTMLElement).closest?.("[data-route]") as HTMLElement | null;
      const m = b?.dataset.route?.match(/^R(\d+)$/);
      if (m) { setTab(Number(m[1])); setClosed(new Set()); last.current = ""; }
    };
    root.addEventListener("click", on);
    return () => root.removeEventListener("click", on);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-day-index]"));
    const seen = new Set<number>();
    let touched = false;
    const start = () => { touched = true; };
    window.addEventListener("wheel", start, { passive: true, once: true });
    window.addEventListener("touchmove", start, { passive: true, once: true });
    window.addEventListener("keydown", start, { once: true });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = Number((e.target as HTMLElement).dataset.dayIndex);
        if (e.isIntersecting) seen.add(i); else seen.delete(i);
      }
      if (!seen.size) return;
      const i = Math.max(...seen);
      setActive(i);
      if (!reduce && touched) sail(tab, i);
    }, { rootMargin: "-42% 0px -52% 0px" });
    items.forEach((el) => io.observe(el));
    return () => { io.disconnect(); window.removeEventListener("wheel", start); window.removeEventListener("touchmove", start); window.removeEventListener("keydown", start); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const pickTab = (i: number) => { setTab(i); setClosed(new Set()); setActive(null); last.current = ""; window.chartRoute?.(`R${i}`); };
  const toggle = (i: number) => {
    setClosed((c) => { const n = new Set(c); if (n.has(i)) n.delete(i); else n.add(i); return n; });
    setActive(i);
    sail(tab, i);
  };

  return (
    <div className="mt-8">
      {itineraries.length > 1 && (
        <div role="tablist" aria-label={`${ship} itineraries`} className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-5 px-5 md:mx-0 md:px-0 pb-1">
          {itineraries.map((x, i) => (
            <button key={x.name} role="tab" type="button" aria-selected={i === tab} onClick={() => pickTab(i)}
              className={`shrink-0 border px-4 py-2 text-left transition-colors ${i === tab ? "border-crimson bg-crimson text-paper" : "ledger-border hover:border-crimson"}`}>
              <span className="block ledger-eyebrow !text-current">{x.nights} nights</span>
              <span className="block text-[14.5px] whitespace-nowrap">{x.direction}</span>
            </button>
          ))}
        </div>
      )}
      <div className={`mt-5 grid gap-6 lg:gap-10 items-start ${map ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""}`}>
        {map && <div ref={mapRef} className="contents">{map}</div>}
        <div>
          <p className="ledger-eyebrow mb-2" aria-live="polite">{it.name}{active != null ? ` · Day ${it.days[active]?.day} of ${it.days.length}` : ""}</p>
          <ol ref={listRef} className="border-t ledger-rule" key={tab}>
            {it.days.map((d, i) => {
              const open = !closed.has(i);
              const on = active === i;
              return (
                <li key={`${d.day}-${d.place}`} data-day-index={i} className={`border-b ledger-rule transition-colors ${on ? "bg-paper-card" : ""}`}>
                  <button type="button" onClick={() => toggle(i)} aria-expanded={open} className="w-full flex items-center gap-4 py-4 px-1 text-left">
                    <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono text-[13px] border transition-colors ${on || (active != null && i < active) ? "bg-crimson text-paper border-crimson" : "ledger-border"}`}>{String(d.day).padStart(2, "0")}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block ledger-display text-[19px] md:text-[21px] leading-snug">{d.title}</span>
                      <span className="block ledger-eyebrow mt-0.5">{d.place}</span>
                    </span>
                    <ChevronDown className={`w-5 h-5 shrink-0 ledger-crimson transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <div hidden={!open} className="pl-[3.75rem] pr-2 pb-5 lg:pb-8">
                    <p className="text-[15.5px] leading-relaxed ledger-muted">{d.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
