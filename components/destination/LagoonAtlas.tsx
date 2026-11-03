"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { Lagoon, MapPoint } from "@/lib/content/french-polynesia";

// The lagoon atlas (James, 2 Nov 2026): zoom into Taha'a first, then Bora Bora, Tikehau, Fakarava, Rangiroa and
// Tahiti Iti. Land is Natural Earth 1:10m (coarse at atoll scale), the reef ring is an indicative outline, and every
// point carries its source (Tahiti Tourisme map links, the brand's own pin, UNESCO). Dive sites wear the dive flag
// (red with a white diagonal, voyages plan Part 7); snorkel spots a mask ring; surf a wave.
//
// Zoom on a phone: pinch with two fingers, drag with one, double tap to zoom in. The page keeps scrolling normally
// until the map is tapped once ("Tap to explore"), so the map never hijacks the scroll; the wheel zooms only after
// a click too. Buttons do the same for keyboards and mice.

export type LagoonChart = { width: number; height: number; bounds: { w: number; s: number; e: number; n: number }; kx: number; ky: number; land: string };
export type LagoonStayPin = { slug: string; name: string; href: string | null; lat: number; lng: number };
type Props = { lagoons: Lagoon[]; charts: Record<string, LagoonChart>; stays: LagoonStayPin[]; stayInk: string };

const project = (c: LagoonChart, lat: number, lng: number) => ({ x: (lng - c.bounds.w) * c.kx, y: (c.bounds.n - lat) * c.ky });
// The zoom cap by how far a route or place set spans (map audit, James 3 Nov 2026: "perhaps zoom in more if shorter
// trips"): the bounding-box diagonal in km. Mirrors spanCap() in public/maps/jw-chart.js.
export const spanCap = (km: number) => (km > 800 ? 1.2 : km > 200 ? 1.6 : km > 50 ? 2.5 : 4);
const km = (a: [number, number], b: [number, number]) => { const R = 6371, D = Math.PI / 180, dLat = (b[0] - a[0]) * D, dLng = (b[1] - a[1]) * D; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * D) * Math.cos(b[0] * D) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const inFrame = (c: LagoonChart, lat: number, lng: number) => lng >= c.bounds.w && lng <= c.bounds.e && lat >= c.bounds.s && lat <= c.bounds.n;

function Marker({ kind, x, y, s }: { kind: MapPoint["kind"] | "stay"; x: number; y: number; s: number }) {
  // s: 1 / zoom, so markers keep their size as the map scales.
  const t = `translate(${x} ${y}) scale(${s})`;
  if (kind === "dive") return <g transform={t}><rect x="-9" y="-7" width="18" height="14" fill="#C8102E" stroke="#fff" strokeWidth="1.5" /><path d="M-9 -7 L9 7" stroke="#fff" strokeWidth="3.4" /></g>;
  if (kind === "snorkel") return <g transform={t}><circle r="8" fill="#fff" stroke="#0C5D61" strokeWidth="2.4" /><circle r="3" fill="#0C5D61" /></g>;
  if (kind === "surf") return <g transform={t}><circle r="9" fill="#1A4A80" stroke="#fff" strokeWidth="1.5" /><path d="M-6 2 C-3 -5 3 -5 5 0 C3 -1 1 0 1 3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></g>;
  if (kind === "unesco") return <g transform={t}><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" fill="#fff" stroke="#1A4A80" strokeWidth="2" /></g>;
  return <g transform={t}><path d="M0 0 C-7 -8 -7 -16 0 -18 C7 -16 7 -8 0 0 Z" fill="var(--stay-ink)" stroke="#fff" strokeWidth="1.5" /><circle cy="-11.5" r="2.8" fill="#fff" /></g>;
}

export default function LagoonAtlas({ lagoons, charts, stays, stayInk }: Props) {
  const [key, setKey] = useState(lagoons[0].key);
  const lagoon = lagoons.find((l) => l.key === key)!;
  const c = charts[key];
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [armed, setArmed] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ d: number; cx: number; cy: number; x: number; y: number } | null>(null);
  const tapAt = useRef(0);


  const pins = useMemo(() => stays.filter((s) => lagoon.stays.includes(s.slug) && inFrame(c, s.lat, s.lng)), [stays, lagoon, c]);
  const points = useMemo(() => lagoon.points.filter((p) => inFrame(c, p.lat, p.lng)), [lagoon, c]);
  // Opening view: the lagoon's own places (dives, snorkel spots, stays and the reef) fitted with padding, closer for a small
  // lagoon, never deeper than spanCap of their span, so a short trip is not lost in open sea.
  const fit = useMemo(() => {
    // The places only (the reef outline spans the whole chart); never tighter than a box about 10 km across.
    const ll: [number, number][] = [...points.map((p) => [p.lat, p.lng] as [number, number]), ...pins.map((p) => [p.lat, p.lng] as [number, number])].filter(([lat, lng]) => inFrame(c, lat, lng));
    if (!ll.length) return { k: 1, x: 0, y: 0 };
    const la = ll.map((p) => p[0]), lo = ll.map((p) => p[1]), mid = [(Math.min(...la) + Math.max(...la)) / 2, (Math.min(...lo) + Math.max(...lo)) / 2], h = 0.045;
    const sw: [number, number] = [Math.min(...la, mid[0] - h), Math.min(...lo, mid[1] - h)], ne: [number, number] = [Math.max(...la, mid[0] + h), Math.max(...lo, mid[1] + h)];
    const span = km(sw, ne), pad = span < 50 ? 0.12 : 0.2;
    const a = project(c, ne[0], sw[1]), b = project(c, sw[0], ne[1]);
    const bw = Math.max(1, b.x - a.x) * (1 + 2 * pad), bh = Math.max(1, b.y - a.y) * (1 + 2 * pad);
    const k = Math.min(spanCap(span), 8, Math.max(1, Math.min(c.width / bw, c.height / bh)));
    const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const x = Math.min(0, Math.max(c.width * (1 - k), c.width / 2 - cx * k)), y = Math.min(0, Math.max(c.height * (1 - k), c.height / 2 - cy * k));
    return { k, x, y };
  }, [points, pins, lagoon, c]);
  useEffect(() => { setView(fit); setSel(null); }, [key, fit]);
  const reef = lagoon.reef ? "M" + lagoon.reef.map(([lng, lat]) => { const q = project(c, lat, lng); return `${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join("L") + "Z" : null;

  const clamp = useCallback((v: { k: number; x: number; y: number }) => {
    const k = Math.min(8, Math.max(1, v.k));
    // Keep the chart covering the frame: no panning off into empty space.
    const x = Math.min(0, Math.max(c.width * (1 - k), v.x)), y = Math.min(0, Math.max(c.height * (1 - k), v.y));
    return { k, x, y };
  }, [c]);
  // Zoom about a point given in chart units.
  const zoomAt = useCallback((f: number, px: number, py: number) => setView((v) => clamp({ k: v.k * f, x: px - (px - v.x) * f, y: py - (py - v.y) * f })), [clamp]);
  const toChart = (clientX: number, clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * c.width, y: ((clientY - r.top) / r.height) * c.height };
  };

  // Wheel zoom only once the map is armed (a click or tap), so the page scroll is never captured by accident.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!armed) return;
      e.preventDefault();
      const p = toChart(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, p.x, p.y);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onDown = (e: React.PointerEvent) => {
    if (!armed) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    last.current = null;
    if (e.pointerType !== "mouse" && pts.current.size === 1) {
      const now = Date.now();
      if (now - tapAt.current < 300) { const p = toChart(e.clientX, e.clientY); zoomAt(1.8, p.x, p.y); }
      tapAt.current = now;
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!armed || !pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const list = [...pts.current.values()];
    const r = box.current!.getBoundingClientRect();
    const s = c.width / r.width;
    if (list.length === 2) {
      const [a, b] = list;
      const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      if (last.current) {
        const p = toChart(cx, cy);
        const f = d / last.current.d;
        setView((v) => clamp({ k: v.k * f, x: p.x - (p.x - v.x) * f + (cx - last.current!.cx) * s, y: p.y - (p.y - v.y) * f + (cy - last.current!.cy) * s }));
      }
      last.current = { d, cx, cy, x: 0, y: 0 };
    } else if (list.length === 1) {
      const p = list[0];
      if (last.current) setView((v) => clamp({ ...v, x: v.x + (p.x - last.current!.cx) * s, y: v.y + (p.y - last.current!.cy) * s }));
      last.current = { d: 0, cx: p.x, cy: p.y, x: 0, y: 0 };
    }
  };
  const onUp = (e: React.PointerEvent) => { pts.current.delete(e.pointerId); last.current = null; };

  const inv = 1 / view.k;
  const selected = [...points.map((p) => ({ id: `p:${p.name}`, name: p.name, line: p.line, source: p.source, href: null as string | null })), ...pins.map((s) => ({ id: `s:${s.slug}`, name: s.name, line: "In the Ledger: open its page for rooms, offers and how to get there.", source: "The brand's published position", href: s.href }))].find((x) => x.id === sel);

  return (
    <section id="lagoons" className="mt-16 md:mt-24" aria-labelledby="lagoons-heading" style={{ ["--stay-ink" as string]: stayInk }}>
      <p className="ledger-eyebrow ledger-crimson">The lagoons, closer</p>
      <h2 id="lagoons-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Lagoon by Lagoon: Dive Passes, Motu and Where You Sleep</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">Pick an island to fly in. Every dive site, snorkel spot and surf break here is placed from Tahiti Tourisme&rsquo;s own map links; every resort pin is the brand&rsquo;s own. Pinch or use the buttons to zoom.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose a lagoon">
        {lagoons.map((l) => (
          <button key={l.key} type="button" role="tab" aria-selected={l.key === key} onClick={() => setKey(l.key)}
            className={`px-3.5 py-1.5 text-[13px] tracking-[0.06em] border transition-colors ${l.key === key ? "bg-[var(--jw-action)] text-white border-[var(--jw-action)]" : "ledger-border hover:border-[var(--jw-action-deep)] hover:text-[var(--jw-action-deep)]"}`}>
            {l.label}<span className="ml-1.5 text-[11px] opacity-70">{l.archipelago}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.45fr_1fr] gap-6 lg:gap-10 items-start">
        <figure className="ledger-paper p-2 md:p-3">
          <div ref={box} className="relative overflow-hidden select-none" style={{ aspectRatio: `${c.width} / ${c.height}`, maxHeight: "78svh", touchAction: armed ? "none" : "pan-y" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <svg viewBox={`0 0 ${c.width} ${c.height}`} className="absolute inset-0 w-full h-full" role="img" aria-label={`Chart of ${lagoon.label}, ${lagoon.archipelago}, with its dive sites, snorkel spots and stays`}>
              <rect width={c.width} height={c.height} fill="#F4F2EF" />
              <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                {reef && <path d={reef} fill="rgba(207,200,191,0.38)" stroke="#8C8277" strokeWidth={2 * inv} strokeDasharray={`${6 * inv} ${4 * inv}`} />}
                <path d={c.land} fill="#FFFFFF" stroke="rgba(45,42,38,0.55)" strokeWidth={1.2 * inv} strokeLinejoin="round" />
                {lagoon.labels.map((l) => { const q = project(c, l.lat, l.lng); return (
                  <text key={l.text} x={q.x} y={q.y} textAnchor="middle" fontSize={(l.kind === "land" ? 30 : 22) * inv} fontStyle={l.kind === "water" ? "italic" : "normal"} fontFamily="'Cormorant Garamond', Georgia, serif"
                    fill={l.kind === "water" ? "rgba(107,99,90,0.9)" : "rgba(45,42,38,0.85)"} stroke="#FFFFFF" strokeWidth={3 * inv} paintOrder="stroke">{l.text}</text>
                ); })}
                {(() => {
                  // Labels never sit on one another (map audit, 2 Nov 2026): each name tries right-above, right-below,
                  // left-above, left-below of its marker; if every spot is taken the marker stays and the name is in the panel.
                  const fs = 21 * inv, taken: number[][] = [];
                  const hit = (b: number[]) => taken.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
                  const spot = (x: number, y: number, text: string) => {
                    const w = text.length * fs * 0.46;
                    taken.push([x - 12 * inv, y - 12 * inv, x + 12 * inv, y + 12 * inv]);
                    for (const [dx, dy, end] of [[16, -14, 0], [16, 30, 0], [-16, -14, 1], [-16, 30, 1]] as const) {
                      const lx = x + dx * inv, ly = y + dy * inv, b = end ? [lx - w, ly - fs, lx, ly + 4 * inv] : [lx, ly - fs, lx + w, ly + 4 * inv];
                      if (!hit(b)) { taken.push(b); return { x: lx, y: ly, anchor: (end ? "end" : "start") as "end" | "start" }; }
                    }
                    return null;
                  };
                  const pinAt = pins.map((s) => { const q = project(c, s.lat, s.lng); return { s, q, l: spot(q.x, q.y, s.name) }; });
                  const ptAt = points.map((p) => { const q = project(c, p.lat, p.lng); return { p, q, l: spot(q.x, q.y, p.name) }; });
                  const label = (l: { x: number; y: number; anchor: "end" | "start" } | null, text: string) => l && <text x={l.x} y={l.y} textAnchor={l.anchor} fontSize={fs} fontFamily="'Cormorant Garamond', Georgia, serif" fill="#2D2A26" stroke="#FFFFFF" strokeWidth={3 * inv} paintOrder="stroke">{text}</text>;
                  return (
                    <>
                      {ptAt.map(({ p, q, l }) => (
                        <g key={p.name} className="cursor-pointer" onClick={() => setSel(`p:${p.name}`)} role="button" aria-label={p.name}>
                          <Marker kind={p.kind} x={q.x} y={q.y} s={inv * 1.7} />
                          {label(l, p.name)}
                        </g>
                      ))}
                      {pinAt.map(({ s, q, l }) => (
                        <g key={s.slug} className="cursor-pointer" onClick={() => setSel(`s:${s.slug}`)} role="button" aria-label={s.name}>
                          <Marker kind="stay" x={q.x} y={q.y} s={inv * 1.7} />
                          {label(l, s.name)}
                        </g>
                      ))}
                    </>
                  );
                })()}
              </g>
            </svg>
            {!armed && (
              <button type="button" onClick={() => setArmed(true)} className="absolute inset-0 flex items-end justify-center pb-4 bg-transparent" aria-label={`Explore the ${lagoon.label} chart: pinch or scroll to zoom`}>
                <span className="inline-flex items-center min-h-[40px] px-4 bg-[#2E2B28] text-white text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_-3px_0_#8B2525]">Tap to explore</span>
              </button>
            )}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.5, c.width / 2, c.height / 2)} className="w-9 h-9 grid place-items-center bg-white/95 border ledger-border hover:text-[var(--jw-action-deep)]"><Plus className="w-4 h-4" /></button>
              <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.5, c.width / 2, c.height / 2)} className="w-9 h-9 grid place-items-center bg-white/95 border ledger-border hover:text-[var(--jw-action-deep)]"><Minus className="w-4 h-4" /></button>
              <button type="button" aria-label="Reset the view" onClick={() => setView(fit)} className="w-9 h-9 grid place-items-center bg-white/95 border ledger-border hover:text-[var(--jw-action-deep)]"><RotateCcw className="w-4 h-4" /></button>
            </div>
            {armed && <button type="button" onClick={() => setArmed(false)} className="absolute top-2 left-2 z-[3] inline-flex items-center min-h-[40px] px-4 bg-[#2E2B28] text-white text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_-3px_0_#8B2525]">Done</button>}
          </div>
          <figcaption className="mt-2 text-[12px] ledger-muted flex flex-wrap gap-x-4 gap-y-1 items-center">
            <span className="inline-flex items-center gap-1.5"><svg width="16" height="12" aria-hidden="true"><rect width="16" height="12" fill="#C8102E" /><path d="M0 0 L16 12" stroke="#fff" strokeWidth="3" /></svg>Dive site</span>
            <span className="inline-flex items-center gap-1.5"><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5.5" fill="#fff" stroke="#0C5D61" strokeWidth="2" /></svg>Snorkel</span>
            <span className="inline-flex items-center gap-1.5"><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="#1A4A80" /></svg>Surf</span>
            <span className="inline-flex items-center gap-1.5"><svg width="12" height="14" aria-hidden="true"><path d="M6 14 C1 8 1 2 6 1 C11 2 11 8 6 14 Z" fill={stayInk} /></svg>Stay</span>
            <span>Reef ring: indicative outline. Land: Natural Earth 1:10m. Not for navigation.</span>
          </figcaption>
        </figure>

        <div>
          <p className="ledger-eyebrow">{lagoon.archipelago}</p>
          <h3 className="ledger-display text-2xl md:text-3xl mt-1">{lagoon.label}</h3>
          <p className="mt-3 text-[16px] leading-relaxed">{lagoon.sub}</p>
          {selected && (
            <div className="mt-4 border-l-2 pl-4" style={{ borderColor: "var(--jw-action)" }} aria-live="polite">
              <p className="ledger-display text-[1.15rem]">{selected.name}</p>
              <p className="text-[15px] mt-1">{selected.line}</p>
              <p className="text-[12px] ledger-muted mt-1">Source: {selected.source}</p>
              {selected.href && <Link href={selected.href} className="mt-2 inline-block ledger-btn">Open the stay</Link>}
            </div>
          )}
          <dl className="mt-5 grid gap-3 text-[15px]">
            <div><dt className="ledger-eyebrow">When to go</dt><dd className="mt-1">{lagoon.when}</dd></div>
            <div><dt className="ledger-eyebrow">Getting there</dt><dd className="mt-1">{lagoon.getThere}</dd></div>
          </dl>
          {(points.length > 0 || pins.length > 0) && (
            <ul className="mt-5 grid gap-2 text-[15px]">
              {points.map((p) => <li key={p.name}><button type="button" onClick={() => setSel(`p:${p.name}`)} className="text-left hover:text-[var(--jw-action-deep)]"><span className="ledger-eyebrow mr-2">{p.kind === "dive" ? "Dive" : p.kind === "snorkel" ? "Snorkel" : p.kind === "surf" ? "Surf" : "UNESCO"}</span>{p.name}</button></li>)}
              {pins.map((s) => <li key={s.slug}><span className="ledger-eyebrow mr-2">Stay</span>{s.href ? <Link href={s.href} className="hover:text-[var(--jw-action-deep)]">{s.name}</Link> : s.name}</li>)}
            </ul>
          )}
          {lagoon.awaitingPins.length > 0 && (
            <div className="mt-5 text-[14px]">
              <p className="ledger-eyebrow">Also here, pin awaiting the brand</p>
              <ul className="mt-1.5 grid gap-1">{lagoon.awaitingPins.map((a) => <li key={a.name}>{a.href ? <Link href={a.href} className="underline decoration-1 underline-offset-2 hover:text-[var(--jw-action-deep)]">{a.name}</Link> : a.name}<span className="ledger-muted">: {a.where}</span></li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
