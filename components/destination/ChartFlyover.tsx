"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plane, RotateCcw } from "lucide-react";
import LedgerChart, { projectOn, UnescoMark, type ChartData } from "./LedgerChart";

// ChartFlyover — the Ledger chart flies in (James, 1 Nov 2026: "a zoom in map from South America view
// then zoom in ... for a cool wow effect"). It opens on the continent, draws a frame around the corner
// it is going to, flies the continent into that frame and lands on the close chart, where the salt
// flats, reserves, route, stays and UNESCO sites are drawn. Plays once when scrolled into view; Replay
// and "Back to {from}" buttons; reduced motion lands straight on the close chart. Every name on the
// chart is also listed beside it as text, so nothing lives only in the picture.
export type FlyPin = { name: string; href: string; lat: number; lng: number };
export type FlyUnesco = { id: string; name: string; year: number; url: string };

type Stage = "far" | "aim" | "fly" | "land";
const FLY_MS = 2600;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function ChartFlyover({ from, to, fromName, title, line, pins, unesco, notes }: {
  from: ChartData; to: ChartData; fromName: string; title: string; line: string;
  pins: FlyPin[]; unesco: FlyUnesco[]; notes: string[];
}) {
  const Wd = to.width, Hd = to.height, Wf = from.width, Hf = from.height, aspect = Wd / Hd;
  // The whole continent, and the close chart's frame on it, both widened to the box's aspect so the
  // landing lines up with the close chart.
  const fit = (x: number, y: number, w: number, h: number) => (w / h > aspect ? { x, y: y + h / 2 - w / aspect / 2, w, h: w / aspect } : { x: x + w / 2 - (h * aspect) / 2, y, w: h * aspect, h });
  const a = projectOn(from, to.bounds.n, to.bounds.w), b = projectOn(from, to.bounds.s, to.bounds.e);
  const far = fit(0, 0, Wf, Hf), near = fit(a.x, a.y, b.x - a.x, b.y - a.y);

  const [stage, setStage] = useState<Stage>("far");
  const [vb, setVb] = useState(far);
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);

  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; cancelAnimationFrame(raf.current); };
  const fly = () => {
    const t0 = performance.now();
    const step = (now: number) => {
      const k = ease(Math.min(1, (now - t0) / FLY_MS));
      // Zoom geometrically (constant feel of speed) and keep the target steady while closing in.
      const w = far.w * Math.pow(near.w / far.w, k), p = (far.w - w) / (far.w - near.w);
      const cx = far.x + far.w / 2 + (near.x + near.w / 2 - far.x - far.w / 2) * p;
      const cy = far.y + far.h / 2 + (near.y + near.h / 2 - far.y - far.h / 2) * p;
      setVb({ x: cx - w / 2, y: cy - w / aspect / 2, w, h: w / aspect });
      if (k < 1) raf.current = requestAnimationFrame(step); else setStage("land");
    };
    raf.current = requestAnimationFrame(step);
  };
  const play = () => {
    clear(); setVb(far); setStage("far");
    timers.current.push(window.setTimeout(() => setStage("aim"), 350));
    timers.current.push(window.setTimeout(() => { setStage("fly"); fly(); }, 1450));
  };
  const back = () => { clear(); setVb(far); setStage("far"); };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVb(near); setStage("land"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-12" aria-labelledby="flyover-title">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 lg:gap-10 items-start">
        <figure className="border-[3px] border-double border-[#2A3D5C] bg-paper shadow-[0_10px_30px_rgba(30,41,57,0.18)]">
          <div ref={box} className="relative overflow-hidden bg-[#E4EEEC]" style={{ aspectRatio: `${Wd} / ${Hd}` }}>
            {/* The continent, flying in: the parent viewBox moves, so every line stays sharp. */}
            <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className={`absolute inset-0 w-full h-full ledger-chart is-drawn ${stage === "far" || stage === "aim" ? "" : "fly-quiet"} transition-opacity duration-700 ${stage === "land" ? "opacity-0" : "opacity-100"}`}
              preserveAspectRatio="xMidYMid slice">
              <LedgerChart chart={from} title={`Ledger chart of ${fromName}`} bare />
              <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} fill="none" stroke="#8B2525" strokeWidth="2" vectorEffect="non-scaling-stroke"
                className="transition-opacity duration-500" opacity={stage === "aim" || stage === "fly" ? 1 : 0} />
            </svg>
            {/* The close chart, landing */}
            <div className={`absolute inset-0 ledger-chart ${stage === "land" ? "is-drawn opacity-100" : "opacity-0"} transition-opacity duration-700`}>
              <LedgerChart chart={to} title={title} />
              <svg viewBox={`0 0 ${Wd} ${Hd}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                {pins.map((p) => { const q = projectOn(to, p.lat, p.lng); return <circle key={p.href} cx={q.x} cy={q.y} r="6" fill="#F4F1ED" stroke="#2D2A26" strokeWidth="2.4" />; })}
              </svg>
            </div>
            <div className="absolute bottom-3 left-3 flex gap-2">
              <button type="button" onClick={play} className="inline-flex items-center gap-1.5 bg-paper/90 border ledger-border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase">
                <RotateCcw className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" /> Replay
              </button>
              {stage === "land" && (
                <button type="button" onClick={back} className="inline-flex items-center gap-1.5 bg-paper/90 border ledger-border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase">
                  Back to {fromName}
                </button>
              )}
            </div>
          </div>
          <figcaption className="px-3 py-2 border-t ledger-border font-mono text-[10px] tracking-[0.12em] uppercase ledger-muted flex justify-between gap-4">
            <span>Flyover · 1:50m to 1:10m</span><span>Positions approximate · outlines indicative</span>
          </figcaption>
        </figure>

        <div>
          <p className="ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />The chart, flying in</p>
          <h3 id="flyover-title" className="ledger-display text-[1.6rem] md:text-[2rem] mt-2 leading-tight">{title}</h3>
          <p className="mt-3 text-[16px] leading-relaxed ledger-muted">{line}</p>
          {pins.length > 0 && (
            <>
              <p className="ledger-eyebrow mt-6">Stays on this chart</p>
              <ul className="mt-2 space-y-1.5 text-[15px]">
                {pins.map((p) => <li key={p.href} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full border-2 border-ink bg-paper" aria-hidden="true" /><Link href={p.href} className="underline underline-offset-4">{p.name}</Link></li>)}
              </ul>
            </>
          )}
          {unesco.length > 0 && (
            <>
              <p className="ledger-eyebrow mt-6">UNESCO World Heritage on this chart</p>
              <ul className="mt-2 space-y-2 text-[15px]">
                {unesco.map((u) => (
                  <li key={u.id} className="flex items-start gap-2">
                    <svg viewBox="-10 -10 20 20" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true"><UnescoMark /></svg>
                    <span><a href={u.url} className="underline underline-offset-4" rel="noopener" target="_blank">{u.name}</a> <span className="ledger-muted text-[13px]">· inscribed {u.year}</span></span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {notes.length > 0 && <ul className="mt-6 space-y-1 text-[13px] ledger-muted">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
        </div>
      </div>
    </section>
  );
}
