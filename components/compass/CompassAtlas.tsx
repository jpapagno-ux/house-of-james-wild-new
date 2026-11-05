"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Globe } from "lucide-react";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";

// CompassAtlas — the Compass's fits on the Atlas (James, 3 Nov 2026: "Compass chooses, Atlas shows").
// The world chart opens whole; a dotted line joins the reading's fits in order and the camera flies
// to each one in turn, then pulls back to frame them all. Click a number (or a card) to fly there.
// Plays once when scrolled into view; Replay and "All of them". Reduced motion: the framed chart,
// still. Every fit is also text beside the chart, so nothing lives only in the picture.

export type AtlasFit = { slug: string; name: string; href: string; country: string | null; lat: number; lng: number; ledgerId: string | null };
type Box = { x: number; y: number; w: number; h: number };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const HOLD_MS = 1500, FLY_MS = 1700, CLOSE_W = 190; // chart units: about 65° of longitude at the equator, a country and its neighbours

export default function CompassAtlas({ chart, fits, explain, title = "Where the reading points.", id = "compass-atlas-h", caption = "The Compass chose these from the Ledger; the Atlas shows where they are. Click a number to fly there." }: { chart: ChartData; fits: AtlasFit[]; explain?: string; title?: string; id?: string; caption?: string }) {
  const W = chart.width, H = chart.height, aspect = W / H;
  const whole: Box = { x: 0, y: 0, w: W, h: H };
  const pts = fits.map((f) => { const { x, y } = projectOn(chart, f.lat, f.lng); return { ...f, x, y }; });
  const around = (p: { x: number; y: number }, w = CLOSE_W): Box => ({ x: p.x - w / 2, y: p.y - w / aspect / 2, w, h: w / aspect });
  const all = (): Box => {
    if (!pts.length) return whole;
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const pad = 60; const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    let w = Math.max(x1 - x0, (y1 - y0) * aspect, CLOSE_W); w = Math.min(w, W);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return { x: cx - w / 2, y: cy - w / aspect / 2, w, h: w / aspect };
  };
  const [vb, setVb] = useState<Box>(whole);
  const [at, setAt] = useState<number | null>(null); // the fit the camera is on
  const [drawn, setDrawn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0); const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; cancelAnimationFrame(raf.current); };
  const move = (A: Box, B: Box, ms: number, done?: () => void) => {
    const t0 = performance.now();
    const step = (now: number) => {
      const k = ease(Math.min(1, (now - t0) / ms));
      const w = A.w * Math.pow(B.w / A.w, k), p = A.w === B.w ? k : (A.w - w) / (A.w - B.w);
      const cx = A.x + A.w / 2 + (B.x + B.w / 2 - A.x - A.w / 2) * p, cy = A.y + A.h / 2 + (B.y + B.h / 2 - A.y - A.h / 2) * p;
      setVb({ x: cx - w / 2, y: cy - w / aspect / 2, w, h: w / aspect });
      if (k < 1) raf.current = requestAnimationFrame(step); else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };
  const cur = useRef<Box>(whole); useEffect(() => { cur.current = vb; }, [vb]);
  const flyTo = (i: number | null) => { clear(); setAt(i); move(cur.current, i == null ? all() : around(pts[i]), FLY_MS); };
  const play = () => {
    clear(); setVb(whole); cur.current = whole; setAt(null); setDrawn(true);
    let t = 600;
    pts.forEach((p, i) => { timers.current.push(window.setTimeout(() => { setAt(i); move(cur.current, around(p), FLY_MS); }, t)); t += FLY_MS + HOLD_MS; });
    timers.current.push(window.setTimeout(() => { setAt(null); move(cur.current, all(), FLY_MS + 400); }, t));
  };
  useEffect(() => {
    const el = box.current; if (!el || !pts.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVb(all()); setDrawn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fits.map((f) => f.slug).join("|")]);
  if (!pts.length) return null;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join("");
  const scale = vb.w / W; // keeps pins and type the same size on screen as the camera closes in
  return (
    <section className="mt-8" aria-labelledby={id}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ledger-eyebrow text-house">The Atlas</p>
          <h3 id={id} className="ledger-display text-[1.4rem] md:text-[1.8rem] mt-1">{title}</h3>
          {explain && <p className="mt-1 text-[14px] ledger-muted">{explain}</p>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => flyTo(null)} className="house-chip inline-flex items-center gap-1.5 text-[12px]"><Globe className="w-3.5 h-3.5" strokeWidth={1.5} />All of them</button>
          <button type="button" onClick={play} className="house-chip inline-flex items-center gap-1.5 text-[12px]"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />Replay</button>
        </div>
      </div>
      <div className="mt-4 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] gap-5 lg:gap-8 items-start">
        <figure className="min-w-0 border-[3px] border-double border-graphite bg-paper shadow-[0_10px_30px_rgba(30,41,57,0.18)]" data-map="chart">
          <div ref={box} className={`relative overflow-hidden bg-mist ledger-chart ${drawn ? "is-drawn" : ""}`}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block invisible w-full h-auto" aria-hidden="true" />
            <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block" }} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`The Atlas: ${pts.map((p, i) => `${i + 1} ${p.name}`).join(", ")}`}>
              <LedgerChart chart={chart} title="" bare />
              <path d={line} fill="none" stroke="var(--jw-crimson)" strokeWidth={1.6 * scale} strokeDasharray={`${5 * scale} ${6 * scale}`} opacity={0.9} />
              {pts.map((p, i) => (
                <g key={p.slug} transform={`translate(${p.x} ${p.y}) scale(${scale})`} className="cursor-pointer" onClick={() => flyTo(i)}>
                  <circle r={at === i ? 15 : 11} fill={at === i ? "var(--jw-crimson)" : "var(--jw-paper, #fff)"} stroke="var(--jw-crimson)" strokeWidth={1.5} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="IBM Plex Mono, ui-monospace, monospace" fill={at === i ? "#fff" : "var(--jw-crimson)"}>{String(i + 1).padStart(2, "0")}</text>
                  {at === i && <text x={20} y={-10} fontSize={13} fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fill="var(--jw-ink, #1A1816)" stroke="#fff" strokeWidth={3} paintOrder="stroke">{p.name}</text>}
                </g>
              ))}
            </svg>
          </div>
        </figure>
        <ol className="divide-y ledger-rule border-t border-b ledger-rule">
          {pts.map((p, i) => (
            <li key={p.slug}>
              <button type="button" onClick={() => flyTo(i)} className={`w-full text-left py-2.5 flex items-baseline gap-3 ${at === i ? "text-house" : ""}`} aria-current={at === i ? "true" : undefined}>
                <span className="ledger-id text-[11px] w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0"><span className="ledger-display text-[16px] block leading-tight">{p.name}</span><span className="text-[12.5px] ledger-muted">{p.country ?? ""}{p.ledgerId ? ` · ${p.ledgerId}` : ""}</span></span>
                <Link href={p.href} onClick={(e) => e.stopPropagation()} className="ml-auto text-[12px] underline underline-offset-4 hover:text-house shrink-0">Open</Link>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-[12.5px] ledger-muted">{caption}</p>
    </section>
  );
}
