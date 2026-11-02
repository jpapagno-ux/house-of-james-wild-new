"use client";
import Image from "next/image";
import Link from "next/link";
import { sharpen } from "@/lib/content/sharpen";
import { useEffect, useRef, useState } from "react";
import { Moon, Plane, RotateCcw, Sun, ZoomIn, ZoomOut } from "lucide-react";
import LedgerChart, { projectOn, UnescoMark, type ChartData } from "./LedgerChart";

// ChartFlyover — the Ledger chart flies in (James, 1 Nov 2026: "a zoom in map from South America view
// then zoom in ... for a cool wow effect"). It opens on the continent, draws a frame around the corner
// it is going to, flies the continent into that frame and lands on the close chart, where the salt
// flats, reserves, route, stays and UNESCO sites are drawn. Plays once when scrolled into view; Replay
// and "Back to {from}" buttons; reduced motion lands straight on the close chart. Every name on the
// chart is also listed beside it as text, so nothing lives only in the picture.
export type FlyPin = { name: string; href: string; lat: number; lng: number };
export type FlyUnesco = { id: string; name: string; year: number; url: string };
export type FlyFrame = { src: string; alt: string; href: string; name: string; night: boolean };

type Stage = "far" | "aim" | "fly" | "land" | "ring";
type Box = { x: number; y: number; w: number; h: number };
const FLY_MS = 2600, FOCUS_MS = 1600;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// A fixed sky (seeded, so server and browser draw the same stars): [x, y, radius, twinkle delay].
const STARS: [number, number, number, number][] = (() => {
  let seed = 1982; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 170 }, () => [+r().toFixed(4), +r().toFixed(4), +(0.5 + r() * r() * 2.2).toFixed(2), +(r() * 4).toFixed(2)]);
})();
const btn = "inline-flex items-center gap-1.5 bg-paper/90 border ledger-border px-2 py-1 sm:px-3 sm:py-1.5 font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.12em] uppercase";

export default function ChartFlyover({ from, to, fromName, title, line, pins, unpinned = [], unesco, notes, focus, nightLine, frames = [] }: {
  from: ChartData; to: ChartData; fromName: string; title: string; line: string;
  pins: FlyPin[]; unpinned?: { name: string; href: string }[]; unesco: FlyUnesco[]; notes: string[]; frames?: FlyFrame[];
  /** After landing, ring one feature of the close chart (a salt flat) and offer a closer zoom onto it. */
  focus?: { name: string; line: string; zoomLabel: string; night?: string };
  /** The night sky without a ringed feature (Rapa Nui): the line shown over it. */
  nightLine?: string;
}) {
  const nightText = focus?.night ?? nightLine;
  const Wd = to.width, Hd = to.height, Wf = from.width, Hf = from.height, aspect = Wd / Hd;
  // The whole continent, and the close chart's frame on it, both widened to the box's aspect so the
  // landing lines up with the close chart.
  const fit = (x: number, y: number, w: number, h: number): Box => (w / h > aspect ? { x, y: y + h / 2 - w / aspect / 2, w, h: w / aspect } : { x: x + w / 2 - (h * aspect) / 2, y, w: h * aspect, h });
  const a = projectOn(from, to.bounds.n, to.bounds.w), b = projectOn(from, to.bounds.s, to.bounds.e);
  const far = fit(0, 0, Wf, Hf), near = fit(a.x, a.y, b.x - a.x, b.y - a.y);
  const whole: Box = { x: 0, y: 0, w: Wd, h: Hd };
  // The ringed feature: its box on the close chart, the ring around it and the closer view onto it.
  const shape = focus ? to.overlays?.salt.find((s) => s.name === focus.name) : undefined;
  const fb = shape?.box;
  const ring = fb ? { cx: (fb[0] + fb[2]) / 2, cy: (fb[1] + fb[3]) / 2, rx: ((fb[2] - fb[0]) / 2) * 1.32, ry: ((fb[3] - fb[1]) / 2) * 1.45 } : null;
  const close = ring ? fit(ring.cx - ring.rx * 2.1, ring.cy - ring.ry * 2.1, ring.rx * 4.2, ring.ry * 4.2) : null;

  const [stage, setStage] = useState<Stage>("far");
  const [vb, setVb] = useState(far);
  const [vb2, setVb2] = useState(whole);
  const [zoomed, setZoomed] = useState(false);
  const [night, setNight] = useState(false);
  const [safe, setSafe] = useState(false); // a browser that sizes the layered charts wrongly gets the still chart
  const layer = useRef<SVGSVGElement>(null);
  const [take, setTake] = useState(0); // remounts the ring so it locks on again on every replay
  const box = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);

  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; cancelAnimationFrame(raf.current); };
  // One camera move: zoom geometrically (a constant feel of speed), keeping the target steady while closing in.
  const move = (A: Box, B: Box, ms: number, set: (v: Box) => void, done?: () => void) => {
    const t0 = performance.now();
    const step = (now: number) => {
      const k = ease(Math.min(1, (now - t0) / ms));
      const w = A.w * Math.pow(B.w / A.w, k), p = A.w === B.w ? k : (A.w - w) / (A.w - B.w);
      const cx = A.x + A.w / 2 + (B.x + B.w / 2 - A.x - A.w / 2) * p;
      const cy = A.y + A.h / 2 + (B.y + B.h / 2 - A.y - A.h / 2) * p;
      set({ x: cx - w / 2, y: cy - w / aspect / 2, w, h: w / aspect });
      if (k < 1) raf.current = requestAnimationFrame(step); else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };
  const landed = () => {
    setStage("land");
    if (!ring) return;
    timers.current.push(window.setTimeout(() => { setTake((t) => t + 1); setStage("ring"); }, 1300));
    // Then the camera glides in on the ringed feature by itself, once per play.
    if (close) timers.current.push(window.setTimeout(() => { move(whole, close, FOCUS_MS + 600, setVb2); setZoomed(true); }, 3400));
  };
  const play = () => {
    clear(); setVb(far); setVb2(whole); setZoomed(false); setNight(false); setStage("far");
    timers.current.push(window.setTimeout(() => setStage("aim"), 350));
    timers.current.push(window.setTimeout(() => { setStage("fly"); move(far, near, FLY_MS, setVb, landed); }, 1450));
  };
  const back = () => { clear(); setVb(far); setVb2(whole); setZoomed(false); setNight(false); setStage("far"); };
  const toggleZoom = () => {
    if (!close) return;
    clear(); setStage("ring");
    if (zoomed) { move(close, whole, FOCUS_MS, setVb2); setZoomed(false); } else { move(whole, close, FOCUS_MS, setVb2); setZoomed(true); }
  };
  const down = stage === "land" || stage === "ring";

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Safety net (Safari on iPhone, 1 Nov 2026, drew a layer about ten times too large): if a chart layer
    // does not measure the size of its box, show the still close chart instead of the flight.
    const lb = layer.current?.getBoundingClientRect(), bb = el.getBoundingClientRect();
    if (!lb || !bb.width || !bb.height || lb.width > bb.width * 1.15 || lb.height > bb.height * 1.15 || lb.width < bb.width * 0.85) { setSafe(true); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVb(near); setStage(ring ? "ring" : "land"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-12" aria-labelledby="flyover-title">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 lg:gap-10 items-start">
        <figure className="min-w-0 border-[3px] border-double border-[#2A3D5C] bg-paper shadow-[0_10px_30px_rgba(30,41,57,0.18)]">
          <div ref={box} className="relative overflow-hidden bg-[#E4EEEC]">
            {safe ? (
              /* The still close chart: the same in-flow chart every country page draws (overlays included). */
              <div className="ledger-chart is-drawn"><LedgerChart chart={to} title={title} /></div>
            ) : (
            <>
            {/* Sizes the box: an in-flow chart-shaped SVG, the pattern every Ledger chart uses. */}
            <svg viewBox={`0 0 ${Wd} ${Hd}`} width="100%" className="block invisible w-full h-auto" aria-hidden="true" />
            {/* The continent, flying in: the parent viewBox moves, so every line stays sharp. */}
            <div className={`absolute inset-0 ledger-chart is-drawn ${stage === "far" || stage === "aim" ? "" : "fly-quiet"} transition-opacity duration-700 ${down ? "opacity-0" : "opacity-100"}`}>
            <svg ref={layer} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width="100%" height="100%" style={{ display: "block" }}
              preserveAspectRatio="xMidYMid slice">
              <LedgerChart chart={from} title={`Ledger chart of ${fromName}`} bare />
              <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} fill="none" stroke="#8B2525" strokeWidth="2" vectorEffect="non-scaling-stroke"
                className="transition-opacity duration-500" opacity={stage === "aim" || stage === "fly" ? 1 : 0} />
            </svg>
            </div>
            {/* The close chart, landing; it can move again, closer onto the ringed feature. */}
            <div className={`absolute inset-0 ledger-chart fly-land ${down ? "is-drawn opacity-100" : "opacity-0"} transition-opacity duration-700`}>
            <svg viewBox={`${vb2.x} ${vb2.y} ${vb2.w} ${vb2.h}`} width="100%" height="100%" style={{ display: "block" }} preserveAspectRatio="xMidYMid slice">
              <LedgerChart chart={to} title={title} bare />
              {shape && (
                <g aria-hidden="true">
                  <defs>
                    <clipPath id="fly-focus-clip"><path d={shape.d} /></clipPath>
                    <linearGradient id="fly-shine" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0" stopColor="#8FB7CC" stopOpacity="0" /><stop offset="0.5" stopColor="#8FB7CC" stopOpacity="0.7" /><stop offset="1" stopColor="#8FB7CC" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* The mirror: a band of light crossing the salt. */}
                  <g clipPath="url(#fly-focus-clip)">
                    {/* skewX shifts x by -tan(18°)·y, so start the band just left of the salt at its own height. */}
                    <rect x={fb![0] - 100 + Math.tan(Math.PI / 10) * ((fb![1] + fb![3]) / 2)} y={fb![1] - 20} width="90" height={fb![3] - fb![1] + 40} fill="url(#fly-shine)" transform="skewX(-18)" className={stage === "ring" ? "fly-shine" : "opacity-0"} style={{ ["--shine-run" as string]: `${fb![2] - fb![0] + 200}px` }} />
                  </g>
                </g>
              )}
              {/* Night: the same chart under the Altiplano sky. */}
              <g className={`transition-opacity duration-1000 ${night ? "opacity-100" : "opacity-0 pointer-events-none"}`} aria-hidden="true">
                <defs>
                  <radialGradient id="fly-milky" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#E8EEF8" stopOpacity="0.32" /><stop offset="0.6" stopColor="#C9D6EA" stopOpacity="0.1" /><stop offset="1" stopColor="#C9D6EA" stopOpacity="0" /></radialGradient>
                </defs>
                <rect width={Wd} height={Hd} fill="#0B1220" opacity="0.86" />
                <ellipse cx={Wd * 0.55} cy={Hd * 0.42} rx={Wd * 0.85} ry={Hd * 0.13} fill="url(#fly-milky)" transform={`rotate(-38 ${Wd * 0.55} ${Hd * 0.42})`} />
                {STARS.map(([sx, sy, r, d], i) => <circle key={i} cx={sx * Wd} cy={sy * Hd} r={r} fill="#F4F1ED" className="fly-star" style={{ animationDelay: `${d}s` }} />)}
                {/* The coast in moonlight. */}
                <path d={to.focus} fillRule="evenodd" fill="rgba(244,241,237,0.06)" stroke="rgba(244,241,237,0.65)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                {to.overlays?.salt.map((sh) => <path key={sh.name} d={sh.d} fill="rgba(244,241,237,0.10)" stroke="rgba(244,241,237,0.75)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />)}
                {to.overlays?.route && <path d={to.overlays.route} fill="none" stroke="rgba(244,241,237,0.6)" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
              </g>
              {pins.map((p) => { const q = projectOn(to, p.lat, p.lng); return <circle key={p.href} cx={q.x} cy={q.y} r="6" fill="#F4F1ED" stroke="#2D2A26" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />; })}
              {ring && focus && (
                <g key={take} className={stage === "ring" ? "fly-ring-in" : "opacity-0"} aria-hidden="true">
                  <ellipse cx={ring.cx} cy={ring.cy} rx={ring.rx} ry={ring.ry} fill="none" stroke={night ? "#F4F1ED" : "#8B2525"} strokeWidth="2.2" strokeDasharray="7 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="fly-ring" />
                  <line x1={ring.cx} y1={ring.cy + ring.ry + 4} x2={ring.cx} y2={ring.cy + ring.ry + 18} stroke={night ? "#F4F1ED" : "#8B2525"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <text x={ring.cx} y={ring.cy + ring.ry + 40} textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="22" fontStyle="italic" fill={night ? "#F4F1ED" : "#8B2525"} stroke={night ? "#0B1220" : "#F4F1ED"} strokeWidth="4" paintOrder="stroke">{focus.name}</text>
                  <text x={ring.cx} y={ring.cy + ring.ry + 56} textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="10" letterSpacing="1.4" fill={night ? "rgba(244,241,237,0.85)" : "rgba(45,42,38,0.8)"} stroke={night ? "#0B1220" : "#F4F1ED"} strokeWidth="3" paintOrder="stroke">{focus.line.toUpperCase()}</text>
                </g>
              )}
            </svg>
            </div>
            {nightText && (
              <p className={`absolute top-4 inset-x-4 text-center ledger-display italic text-[1.05rem] md:text-[1.35rem] text-[#F4F1ED] transition-opacity duration-1000 pointer-events-none ${night && down ? "opacity-100" : "opacity-0"}`} aria-live="polite">{night && down ? nightText : ""}</p>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
              <button type="button" onClick={play} className={btn}>
                <RotateCcw className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" /> Replay
              </button>
              {down && close && focus && (
                <button type="button" onClick={toggleZoom} className={btn} aria-pressed={zoomed}>
                  {zoomed ? <ZoomOut className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" /> : <ZoomIn className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" />}
                  <span className="hidden sm:inline">{zoomed ? "The whole corner" : focus.zoomLabel}</span><span className="sm:hidden">{zoomed ? "Zoom out" : "Zoom in"}</span>
                </button>
              )}
              {down && nightText && (
                <button type="button" onClick={() => setNight((n) => !n)} className={btn} aria-pressed={night}>
                  {night ? <Sun className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" /> : <Moon className="w-3 h-3" strokeWidth={1.6} aria-hidden="true" />}
                  <span className="hidden sm:inline">{night ? "Back to day" : "See the night sky"}</span><span className="sm:hidden">{night ? "Day" : "Night sky"}</span>
                </button>
              )}
              {down && (
                <button type="button" onClick={back} className={btn}><span className="hidden sm:inline">Back to {fromName}</span><span className="sm:hidden">{fromName}</span></button>
              )}
            </div>
            </>
            )}
          </div>
          {frames.length > 0 && <Filmstrip frames={night && frames.filter((f) => f.night).length >= 2 ? frames.filter((f) => f.night) : frames} night={night} />}
          <figcaption className="px-3 py-2 border-t ledger-border font-mono text-[10px] tracking-[0.12em] uppercase ledger-muted flex justify-between gap-4">
            <span>Flyover · 1:50m to 1:10m</span><span>Positions approximate · outlines indicative</span>
          </figcaption>
        </figure>

        <div>
          <p className="ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />The chart, flying in</p>
          <h3 id="flyover-title" className="ledger-display text-[1.6rem] md:text-[2rem] mt-2 leading-tight">{title}</h3>
          <p className="mt-3 text-[16px] leading-relaxed ledger-muted">{line}</p>
          {pins.length + unpinned.length > 0 && (
            <>
              <p className="ledger-eyebrow mt-6">Stays on this chart</p>
              <ul className="mt-2 space-y-1.5 text-[15px]">
                {unpinned.map((p) => <li key={p.href} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-ink bg-paper" aria-hidden="true" /><Link href={p.href} className="underline underline-offset-4">{p.name}</Link><span className="text-[12px] ledger-muted">· pin to come</span></li>)}
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

// The filmstrip: the pinned stays' own photographs drifting under the chart. It pauses under a finger or a
// pointer, stays still for reduced motion (and scrolls by hand instead), and turns to the after-dark frames
// when the chart shows the night sky. The second copy of the row only makes the loop seamless.
function Filmstrip({ frames, night }: { frames: FlyFrame[]; night: boolean }) {
  const row = (copy: boolean) => frames.map((f, i) => (
    <li key={`${copy ? "b" : "a"}${f.src}${i}`} aria-hidden={copy || undefined} className="shrink-0 pr-2">
      <Link href={f.href} tabIndex={copy ? -1 : undefined} className="group relative block w-[132px] sm:w-[168px] aspect-[3/2] overflow-hidden bg-paper-card">
        <Image src={sharpen(f.src)} alt={copy ? "" : f.alt} fill sizes="168px" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        <span className="absolute inset-x-0 bottom-0 px-2 pt-5 pb-1.5 bg-gradient-to-t from-black/65 to-transparent font-mono text-[9px] tracking-[0.12em] uppercase text-white truncate">{f.name}</span>
      </Link>
    </li>
  ));
  return (
    <div className={`fly-strip relative w-full max-w-full min-w-0 overflow-hidden border-t ledger-border py-2.5 transition-colors duration-1000 ${night ? "bg-[#0B1220]" : "bg-paper"}`} aria-label="The stays on this chart, in photographs">
      <ul key={night ? "night" : "day"} className="fly-strip-track flex w-max">{row(false)}{row(true)}</ul>
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r ${night ? "from-[#0B1220]" : "from-paper"} to-transparent`} />
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l ${night ? "from-[#0B1220]" : "from-paper"} to-transparent`} />
    </div>
  );
}
