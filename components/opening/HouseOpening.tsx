"use client";

import Pic from "./Pic";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { toneVars } from "./Tones";

// Preview C, "the house opening" (James, 8 Nov 2026: go with the blend). The Exceptional Few manner one step down,
// for any volume record:
//   1. The Arrival: three full-bleed frames that take over on scroll (place, the way in, the vessel or lodge), two
//      screens long, a hairline frame, the record's latitude as a quiet marker, a skip link, and the next open sailing.
//      Between frames a faint wash of the pathway colour passes through, like light through ice.
//   2. The night panel: the record's own night colour (pathway accent mixed with the hero photograph's darkest tone and
//      Ink; AA checked), one big line, the glance, three "why" frames.
//   3. The night close: a dusk photograph fading into the night colour, one line.
//   4. Then the page's details on the record's day colour (a faint cast of the same palette instead of flat white).
// Optional paper grain on the night surfaces. House crimson stays the one action colour; the pathway never fills a button.

export type OpeningImage = { src: string; alt: string; caption?: string; credit: string; /** where the subject sits, for the phone cut (Cloudinary gravity: east, south...); default: found automatically */ gravity?: string };
export type OpeningPalette = { night: string; deep: string; day: string; hi: string };
export type NextSailing = { date: string; ship?: string; from?: string; href: string } | null;

const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function Grain({ on }: { on: boolean }) {
  if (!on) return null;
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] mix-blend-overlay opacity-[0.09]" style={{ backgroundImage: GRAIN }} />;
}

function Arrival({ frames, palette, accent, marker, designation, title, place, next, planHref, grain, tab }: {
  frames: OpeningImage[]; palette: OpeningPalette; accent: string; marker: string; designation: string; title: string; place: string; next: NextSailing; planHref: string; grain: boolean; tab?: string;
}) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  // on touch screens the photos hold still (no scroll-linked zoom) so nothing shifts under a finger
  const [touch, setTouch] = useState(false);
  useEffect(() => { setTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches); }, []);
  useEffect(() => {
    if (reduced) return;
    const el = ref.current, stage = stageRef.current; if (!el || !stage) return;
    let raf = 0;
    // measured against the sticky stage (100svh, fixed) rather than window.innerHeight, which grows and shrinks as a
    // phone's address bar slides away: that was making the frames jump mid-scroll
    const tick = () => { const r = el.getBoundingClientRect(); setP(Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight - stage.offsetHeight)))); raf = 0; };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);
  const n = frames.length;
  const stage = reduced ? n - 1 : Math.min(n - 1, Math.floor(p * n));
  const fade = (i: number) => {
    if (reduced) return i === n - 1 ? 1 : 0;
    const seg = 1 / n, start = i * seg;
    if (i === 0) return p < seg ? 1 : Math.max(0, 1 - (p - seg) / (seg * 0.4));
    return Math.min(1, Math.max(0, (p - start + seg * 0.15) / (seg * 0.45)));
  };
  // the pathway light: strongest between frames, sweeping across as the reader scrolls
  const between = reduced ? 0 : Math.sin(Math.PI * ((p * n) % 1));
  const named = reduced || p > (n - 1) / n;
  const current = frames[stage];
  return (
    <div ref={ref} className={`relative ${reduced ? "" : "h-[200svh]"}`}>
      <section ref={stageRef} className={`${reduced ? "relative" : "sticky top-0"} h-[100svh] overflow-hidden text-white`} style={{ background: palette.night }} aria-label={`${title}: the arrival`}>
        {frames.map((f, i) => (
          <div key={f.src} className="absolute inset-0" style={{ opacity: fade(i), zIndex: i }} aria-hidden={i !== stage}>
            <Pic src={f.src} alt={f.alt} priority={i === 0} sizes="100vw" portrait="9:16" gravity={f.gravity} className="object-cover" style={{ transform: reduced || touch ? undefined : `scale(${1.02 + 0.05 * (1 - fade(i))})` }} />
          </div>
        ))}
        <div aria-hidden="true" className="absolute inset-0 z-10 mix-blend-soft-light" style={{ opacity: 0.55 * between, background: `radial-gradient(120% 90% at ${15 + 70 * p}% 30%, ${accent} 0%, transparent 60%)` }} />
        <div aria-hidden="true" className="absolute inset-0 z-10" style={{ background: `linear-gradient(180deg, rgba(26,24,22,.38) 0%, transparent 32%, transparent 52%, ${palette.night} 100%)` }} />
        <Grain on={grain} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 md:inset-5 z-10 border border-white/25" />
        {/* the volume tab (House Standard: a 5px tab in the volume colour), on the frame's top edge */}
        {tab && <div aria-hidden="true" className="pointer-events-none absolute z-10 top-3 md:top-5 left-3 md:left-5 h-[5px] w-16 md:w-24" style={{ background: tab }} />}
        <p className="absolute z-20 top-[92px] left-5 md:left-auto md:right-10 md:top-[104px] lg:top-[192px] text-[10px] md:text-[10.5px] tracking-[0.28em] uppercase text-white/75">{marker}</p>
        <div className="relative z-20 h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-[118px] lg:pb-16">
          <p className="ledger-eyebrow !text-white/85" style={{ opacity: reduced || p > 0.04 ? 1 : 0.0001, transition: "opacity 500ms" }}>{designation}</p>
          <h1 className="ledger-h1 mt-3" style={{ opacity: named ? 1 : 0, transform: named ? "none" : "translateY(14px)", transition: "all 700ms" }}>{title}</h1>
          <p className="ledger-display italic text-lg md:text-2xl mt-3" style={{ color: palette.hi, opacity: named ? 1 : 0, transition: "opacity 700ms" }}>{place}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ opacity: named ? 1 : 0, transition: "opacity 700ms 150ms" }}>
            <Link href={planHref} className="ledger-btn ledger-btn--house ledger-btn--light max-lg:!hidden">Plan with James</Link>
            {next && (
              <Link href={next.href} className="group text-[13px] leading-snug text-white/90">
                <span className="block text-[10.5px] tracking-[0.22em] uppercase text-white/60">Next open sailing</span>
                <span className="ledger-display text-[18px] group-hover:underline underline-offset-4">{next.date}{next.ship ? ` · ${next.ship}` : ""}{next.from ? ` · from ${next.from}` : ""}</span>
              </Link>
            )}
          </div>
        </div>
        <a href="#voyage" className="absolute z-20 bottom-[78px] lg:bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.24em] uppercase text-white/70 hover:text-white">Skip to the details ↓</a>
        <p className="absolute z-20 bottom-[96px] lg:bottom-2 left-5 right-5 md:left-auto md:right-8 text-right text-[10px] md:text-[10.5px] tracking-[0.08em] text-white/70">{current?.caption ? `${current.caption} · ` : ""}{current?.credit}</p>
      </section>
      {/* the site header stays transparent over the photographs for the whole arrival, as on The Exceptional Few, and
          takes the night colour only once the arrival has passed (SiteHeader reads #hero-end) */}
      <div id="hero-end" className="absolute bottom-0 h-px w-full" aria-hidden="true" />
    </div>
  );
}

export type HouseOpeningProps = {
  palette: OpeningPalette;
  pathway: PathwayId;
  marker: string;
  designation: string;
  title: string;
  place: string;
  line: string;
  frames: OpeningImage[];
  glance: [string, string][];
  why: { title: string; line: string; photo?: OpeningImage }[];
  /** the night panel's label over the glance ("Why this voyage", "Who she suits", "Days aboard") */
  whyLabel?: string;
  close: { photo: OpeningImage; line: string };
  next: NextSailing;
  planHref: string;
  note?: ReactNode;
  grain?: boolean;
  /** the volume colour for the frame's tab (Stays, Europe), from lib/volumes.ts */
  tab?: string;
};

export default function HouseOpening({ palette, pathway, marker, designation, title, place, line, frames, glance, why, whyLabel = "Why this voyage", close, next, planHref, note, grain = false, tab }: HouseOpeningProps) {
  const pw = PATHWAYS[pathway];
  const night: CSSProperties = { background: `linear-gradient(180deg, ${palette.night} 0%, ${palette.deep} 100%)` };
  return (
    <div className="jw-opening mx-[calc(50%-50vw)] overflow-x-clip" style={toneVars(palette)}>
      <Arrival frames={frames} palette={palette} accent={pw.accent} marker={marker} designation={designation} title={title} place={place} next={next} planHref={planHref} grain={grain} tab={tab} />

      <section className="relative text-white" style={night}>
        <Grain on={grain} />
        <div className="relative z-[2] max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <span className="house-chip !border-transparent" style={{ background: "var(--tone-ivory)", color: palette.night }}><span aria-hidden="true" className="inline-block w-[6px] h-[6px] rounded-full" style={{ background: pw.accent }} />{pw.name}</span>
            <span className="ledger-eyebrow" style={{ color: palette.hi }}>{whyLabel}</span>
          </div>
          <p className="mt-8 ledger-display text-[27px] md:text-[40px] leading-[1.16] max-w-4xl">{line}</p>
          <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 border-t border-white/20 pt-6">
            {glance.map(([k, v]) => (
              <div key={k}><dt className="text-[10.5px] tracking-[0.22em] uppercase" style={{ color: palette.hi }}>{k}</dt><dd className="mt-1.5 ledger-display text-[21px] md:text-[23px] leading-snug">{v}</dd></div>
            ))}
          </dl>
          <ol className="mt-14 grid gap-7 md:grid-cols-3">
            {why.map((w, i) => (
              <li key={w.title}>
                {w.photo && <figure>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Pic src={w.photo.src} alt={w.photo.alt} sizes="(min-width: 768px) 32vw, 92vw" ratio="4:5" className="object-cover transition-transform duration-[1800ms] [@media(hover:hover)]:hover:scale-[1.04]" />
                    <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 60%, ${palette.night}66 100%)` }} />
                  </div>
                  <figcaption className="mt-1.5 text-[11px] tracking-[0.04em] text-white/55">{w.photo.credit}</figcaption>
                </figure>}
                <p className="mt-4 text-[10.5px] tracking-[0.22em] uppercase" style={{ color: palette.hi }}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 ledger-display text-[25px] leading-tight">{w.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-white/82">{w.line}</p>
              </li>
            ))}
          </ol>
          {note && <div className="mt-12 max-w-3xl text-white/85">{note}</div>}
        </div>
      </section>

      <section className="relative h-[70svh] overflow-hidden text-white" style={{ background: palette.deep }} aria-label={close.photo.alt}>
        <div className="absolute inset-0 ef-drift-pan"><Pic src={close.photo.src} alt={close.photo.alt} sizes="100vw" portrait="3:4" gravity={close.photo.gravity} className="object-cover" /></div>
        <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${palette.deep} 0%, transparent 30%, transparent 55%, ${palette.deep}E6 100%)` }} />
        <Grain on={grain} />
        <div className="relative z-[2] h-full max-w-ledger mx-auto px-5 md:px-10 flex items-end pb-12 md:pb-16">
          <p className="ledger-display italic text-[24px] md:text-[34px] leading-snug max-w-3xl">{close.line}</p>
        </div>
        <p className="absolute z-[2] bottom-2 right-5 md:right-8 text-[10.5px] tracking-[0.08em] text-white/65">{close.photo.caption ? `${close.photo.caption} · ` : ""}{close.photo.credit}</p>
      </section>
      <div id="voyage" aria-hidden="true" />
    </div>
  );
}
