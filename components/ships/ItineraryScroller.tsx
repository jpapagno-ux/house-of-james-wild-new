"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import RouteViews from "@/components/maps/terrain/RouteViews";
import type { TerrainFlyoverProps } from "@/components/maps/terrain/TerrainFlyover";

// The day log beside the house route chart. As each day reaches the middle of the screen
// (IntersectionObserver) the chart sails to it (window.chartDay, jw-chart's own API), and the
// day lights up in the log; tapping a day does the same. Tabs switch itineraries (chartRoute).
// The chart itself honours prefers-reduced-motion; here, with reduced motion, the log only
// follows taps, never the scroll. Without script the chart's fallback lists every stop.

declare global { interface Window { chartDay?: (k: string, d: number, src?: string) => void; chartRoute?: (k: string, scroll?: boolean) => void; onChartDay?: (k: string, d: number, auto: boolean) => void } }

/** `label`: a block of days published as one ("Days 3 to 6"); `indicative`: the day order is a guide only. */
export type ScrollerDay = { day: number; title: string; place: string; summary: string; label?: string; indicative?: boolean };
/** nights null: the operator lists the stops in order but publishes no length (the days are labelled "Stop n"). */
export type ScrollerItinerary = { name: string; direction: string; nights: number | null; days: ScrollerDay[] };

// `map` is the chart block, rendered on the server and passed through untouched, so React never
// rewrites the element the chart engine draws into.
// Day titles as the log shows them: the first letter capitalised (some operators publish "arrive San Cristobal").
const cap = (x: string) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);

export default function ItineraryScroller({ ship, itineraries, map, terrain }: { ship: string; itineraries: ScrollerItinerary[]; map: ReactNode; terrain?: Omit<TerrainFlyoverProps, "head" | "note"> }) {
  const [tab, setTab] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [closed, setClosed] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLOListElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const last = useRef<string>("");
  const it = itineraries[tab];

  // The chart follows the log, never the other way round (audit, 1 Nov 2026: the list read Day 3
  // while the chart still showed the globe). If the engine is not ready yet, the day waits and is
  // sent the moment window.chartDay appears, so the chart opens on the day in view.
  const pending = useRef<{ t: number; i: number } | null>(null);
  // src "scroll": the log moved under the reader; the chart ignores it while they are exploring or have just zoomed by hand.
  const sail = (t: number, i: number, src?: string) => {
    const d = itineraries[t]?.days[i];
    if (!d) return;
    const k = `${t}:${d.day}`;
    if (last.current === k) return;
    if (typeof window.chartDay !== "function") { pending.current = { t, i }; return; }
    last.current = k;
    pending.current = null;
    window.chartDay(`R${t}`, d.day, src);
  };
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!pending.current || typeof window.chartDay !== "function") return;
      const p = pending.current;
      pending.current = null;
      last.current = "";
      sail(p.t, p.i);
    }, 250);
    const stop = window.setTimeout(() => window.clearInterval(id), 20000);
    return () => { window.clearInterval(id); window.clearTimeout(stop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // With reduced motion the log follows taps only, so the list and the chart never disagree.
    if (reduce) return;
    const seen = new Set<number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = Number((e.target as HTMLElement).dataset.dayIndex);
        if (e.isIntersecting) seen.add(i); else seen.delete(i);
      }
      if (!seen.size) return;
      const i = Math.max(...seen);
      setActive(i);
      sail(tab, i, "scroll");
    }, { rootMargin: "-42% 0px -52% 0px" });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
              className={`house-chip jw-tab shrink-0 !flex-col !items-start !gap-0.5 !normal-case !tracking-normal !px-4 !py-2 text-left ${i === tab ? "is-active" : ""}`}>
              <span className="block ledger-eyebrow !text-current !text-[10px]">{x.nights != null ? `${x.nights} nights` : "Stops in order"}</span>
              <span className="block text-[14.5px] whitespace-nowrap">{x.direction}</span>
            </button>
          ))}
        </div>
      )}
      {/* The route's header sits above the chart, never on it (map audit, 2 Nov 2026): eyebrow, title, nights and ports. */}
      <div className="mt-6 max-w-3xl">
        <p className="ledger-eyebrow">{it.nights != null ? `${it.nights} nights` : "Stops in order"} · {new Set(it.days.map((d) => d.place)).size} ports of call</p>
        <h3 className="ledger-display text-[1.5rem] md:text-[1.9rem] leading-tight mt-1">{cap(it.name)}</h3>
        {it.days.length > 1 && <p className="mt-1 text-[14px] ledger-muted">{it.days[0].place} to {it.days[it.days.length - 1].place}{it.direction && it.direction !== it.name ? ` · ${it.direction}` : ""}</p>}
      </div>
      {/* From 1280px: the chart sticky on the left at 60% (min 640px), the log on the right. Below, the chart above the log. */}
      <div className={`mt-5 grid gap-6 xl:gap-10 items-start ${map || terrain ? "xl:grid-cols-[minmax(640px,3fr)_minmax(0,2fr)]" : ""}`}>
        {(map || terrain) && <div ref={mapRef} className="contents">{terrain ? <RouteViews chart={map} terrain={terrain} routeIndex={tab} className="xl:sticky xl:top-[228px] z-10 bg-paper" /> : map}</div>}
        <div>
          <p className="ledger-eyebrow mb-2" aria-live="polite">{it.name}{active != null ? ` · ${it.days[active]?.label?.startsWith("Stop") ? "Stop" : "Day"} ${it.days[active]?.day} of ${it.days.length}` : ""}</p>
          <ol ref={listRef} className="border-t ledger-rule" key={tab}>
            {it.days.map((d, i) => {
              const open = !closed.has(i);
              const on = active === i;
              return (
                <li key={`${d.day}-${d.place}`} data-day-index={i} className={`border-b ledger-rule transition-colors ${on ? "bg-paper-card" : ""}`}>
                  <button type="button" onClick={() => toggle(i)} aria-expanded={open} className="w-full flex items-center gap-4 py-4 px-1 text-left">
                    <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono text-[13px] border transition-colors ${on || (active != null && i < active) ? "bg-crimson text-paper border-crimson" : "ledger-border"}`}>{String(d.day).padStart(2, "0")}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block ledger-display text-[19px] md:text-[21px] leading-snug">{cap(d.title)}</span>
                      <span className="block ledger-eyebrow mt-0.5">{d.label ? `${d.label} · ` : ""}{d.place}{d.indicative ? " · Indicative" : ""}</span>
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
