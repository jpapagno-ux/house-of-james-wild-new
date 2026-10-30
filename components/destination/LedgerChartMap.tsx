"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_ORDER, type MapCategory } from "@/lib/ledger/categories";

// LedgerChartMap — "The Ledger in {country}". The chart itself (paper land,
// hatched sea, ink coastline, labels, graticule) is server-rendered SVG passed
// in as `chart`; this component lays the pins over it in the same coordinate
// space, draws the coastline when the map scrolls into view, then drops the
// pins one by one. The legend is also the filter. The list beside the map
// links every record to its page, so nothing lives only inside the map.

export type MapItem = {
  id: string;
  category: MapCategory;
  name: string;
  kind: string;
  href: string;
  x: number | null;
  y: number | null;
  area: string | null;
  bestMonths?: string;
  isNew?: boolean;
  offer?: boolean;
};

function Mark({ category, size = 18 }: { category: MapCategory; size?: number }) {
  const c = CATEGORIES[category].color;
  const shape = CATEGORIES[category].shape;
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden="true" className="shrink-0">
      {shape === "circle" && (<><circle cx="14" cy="14" r="9" fill={c} stroke="#F4F1ED" strokeWidth="2.5" /><circle cx="14" cy="14" r="3" fill="#F4F1ED" /></>)}
      {shape === "anchor" && (<><circle cx="14" cy="14" r="11" fill={c} stroke="#F4F1ED" strokeWidth="2" /><path d="M14 8v12M10 11h8M8.5 16c1 3 3 4 5.5 4s4.5-1 5.5-4" fill="none" stroke="#F4F1ED" strokeWidth="1.6" strokeLinecap="round" /></>)}
      {shape === "house" && (<><rect x="4" y="4" width="20" height="20" rx="2" fill={c} stroke="#F4F1ED" strokeWidth="2" /><path d="M9 19v-5l5-4 5 4v5z" fill="none" stroke="#F4F1ED" strokeWidth="1.5" strokeLinejoin="round" /></>)}
      {shape === "diamond" && (<><path d="M14 2l11 12-11 12L3 14z" fill={c} stroke="#F4F1ED" strokeWidth="2" /><circle cx="14" cy="14" r="2.6" fill="#F4F1ED" /></>)}
    </svg>
  );
}

// Pins that share a spot (five stays around La Fortuna) fan out in a ring.
const FAN = [[0, 0], [17, -6], [-17, -6], [10, 14], [-10, 14], [0, -18], [21, 11], [-21, 11]];

export default function LedgerChartMap({ country, chart, width, height, items, counts, legend = "bottom-left" }: { legend?: "bottom-left" | "top-left" | "bottom-right"; country: string; chart: ReactNode; width: number; height: number; items: MapItem[]; counts: Record<MapCategory, number> }) {
  const [on, setOn] = useState<Set<string>>(() => new Set([...CATEGORY_ORDER, "new"]));
  const [hover, setHover] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Draw when a quarter of the chart is on screen; a low threshold so tall
    // charts on short windows still fire. Whatever happens, the chart is drawn
    // within two seconds so the coastline is never left blank (audit, 30 Oct 2026).
    if (el.getBoundingClientRect().top < window.innerHeight) { setDrawn(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    const t = window.setTimeout(() => { setDrawn(true); io.disconnect(); }, 2000);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, []);

  const pinned = useMemo(() => items.filter((i) => i.x != null && on.has(i.category) && (on.has("new") || !i.isNew)), [items, on]);
  const fan = useMemo(() => {
    const seen: Record<string, number> = {};
    const out: Record<string, number> = {};
    for (const i of items) {
      if (i.x == null || i.y == null) continue;
      const key = `${Math.round(i.x / 22)}:${Math.round(i.y / 22)}`;
      out[i.id] = seen[key] || 0;
      seen[key] = (seen[key] || 0) + 1;
    }
    return out;
  }, [items]);
  const newCount = items.filter((i) => i.isNew).length;
  const toggle = (k: string) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(k) && next.size > 1) next.delete(k);
      else next.add(k);
      return next;
    });

  const byArea = useMemo(() => {
    const g: Record<string, MapItem[]> = {};
    for (const i of items) {
      if (!on.has(i.category) || (!on.has("new") && i.isNew)) continue;
      const k = i.area || `Elsewhere in ${country}`;
      (g[k] = g[k] || []).push(i);
    }
    return Object.entries(g);
  }, [items, on, country]);

  const hovered = items.find((i) => i.id === hover && i.x != null);

  return (
    <div className="grid lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
      <div className="relative">
        <div ref={box} className={`ledger-chart relative border ledger-rule overflow-hidden bg-coast-mist ${drawn ? "is-drawn" : ""}`}>
          {chart}
          <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full" role="group" aria-label={`Stays pinned on the ${country} map`}>
            {drawn &&
              pinned.map((i, n) => {
                const [dx, dy] = FAN[(fan[i.id] || 0) % FAN.length];
                const active = hover === i.id;
                return (
                  <g
                    key={i.id}
                    transform={`translate(${(i.x as number) + dx} ${(i.y as number) + dy})`}
                    onMouseEnter={() => setHover(i.id)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  >
                    <g className="ledger-pin-drop" style={{ animationDelay: `${2.1 + n * 0.09}s` }}>
                      {i.isNew && <circle r="20" fill="none" stroke="#8B2525" strokeWidth="2" className="ledger-pin-pulse" />}
                      <g transform={`scale(${active ? 1.45 : 1.15}) translate(-14 -14)`} style={{ transition: "transform .2s" }}>
                        <Mark category={i.category} size={28} />
                      </g>
                    </g>
                  </g>
                );
              })}
          </svg>
          {hovered && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full bg-paper border ledger-border shadow px-3 py-2 text-ink"
              style={{ left: `${((hovered.x as number) / width) * 100}%`, top: `calc(${((hovered.y as number) / height) * 100}% - 22px)` }}
            >
              <span className="block ledger-display text-[15px] whitespace-nowrap">{hovered.name}</span>
              <span className="block text-[11px] ledger-muted whitespace-nowrap">{hovered.kind}{hovered.area ? ` · ${hovered.area}` : ""}</span>
            </div>
          )}
        </div>

        {/* The legend, which is also the filter */}
        <div className={`mt-3 lg:mt-0 lg:absolute ${legend === "top-left" ? "lg:left-3 lg:top-3" : legend === "bottom-right" ? "lg:right-3 lg:bottom-3" : "lg:left-3 lg:bottom-3"} bg-paper/95 border ledger-border shadow-[0_6px_20px_rgba(45,42,38,0.15)] p-3 md:p-4 lg:max-w-[62%]`}>
          <p className="ledger-eyebrow ledger-crimson">Legend</p>
          <ul className="mt-2 space-y-1.5">
            {CATEGORY_ORDER.map((k) => {
              const cat = CATEGORIES[k];
              const n = counts[k] || 0;
              const active = on.has(k);
              return (
                <li key={k}>
                  <button type="button" onClick={() => n && toggle(k)} aria-pressed={active} disabled={!n} className={`flex items-center gap-2.5 text-left w-full ${active && n ? "" : "opacity-45"}`}>
                    <Mark category={k} />
                    <span className="text-[14px] leading-tight">
                      {cat.label} <span className="ledger-muted">({n})</span>
                      <span className="block text-[11px] ledger-muted">{n ? cat.sub : "None filed here yet"}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {newCount > 0 && (
              <li>
                <button type="button" onClick={() => toggle("new")} aria-pressed={on.has("new")} className={`flex items-center gap-2.5 text-left w-full ${on.has("new") ? "" : "opacity-45"}`}>
                  <span className="relative inline-flex w-[18px] h-[18px] items-center justify-center" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-crimson/30 animate-ping" />
                    <span className="w-2.5 h-2.5 rounded-full bg-crimson" />
                  </span>
                  <span className="text-[14px] leading-tight">New to the Ledger <span className="ledger-muted">({newCount})</span><span className="block text-[11px] ledger-muted">Filed in the last 60 days</span></span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Every record, grouped by area, linked to its page */}
      <div className="border ledger-border bg-paper max-h-[620px] overflow-y-auto">
        {byArea.map(([area, list]) => (
          <div key={area} className="border-b ledger-border last:border-0">
            <p className="ledger-eyebrow px-5 pt-4">{area} · {list.length}</p>
            <ul className="px-2 pb-2">
              {list.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} onMouseEnter={() => setHover(i.id)} onMouseLeave={() => setHover(null)} className={`flex items-start gap-3 px-3 py-2.5 transition-colors ${hover === i.id ? "bg-paper-card" : ""}`}>
                    <span className="mt-0.5"><Mark category={i.category} size={16} /></span>
                    <span className="min-w-0">
                      <span className="ledger-display text-[16px] leading-snug block">{i.name}</span>
                      <span className="text-[12px] ledger-muted block">
                        {i.kind}
                        {i.bestMonths ? ` · best ${i.bestMonths}` : ""}
                        {i.x == null ? " · not yet pinned" : ""}
                        {i.isNew ? " · new" : ""}
                      </span>
                      {i.offer && <span className="mt-1 inline-block border border-rust text-rust px-1.5 text-[10px] uppercase tracking-[0.14em]">Time Rewarded</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
