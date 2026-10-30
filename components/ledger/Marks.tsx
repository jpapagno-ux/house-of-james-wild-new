"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { SETTINGS, type SettingKey } from "@/lib/settings";
import type { LedgerStampKind } from "@/lib/ledger/status";

// ─────────────────────────────────────────────────────────────────────────────
// The James Wild & Co ephemera kit (approved Oct 2026), ported from the Wild &
// Co Gatherings build and widened to the whole house. Every piece is drawn live
// from a record's data (name, Ledger ID, setting, status), so a new stay or
// vessel gets its tag and stamp with no new artwork. High-resolution PNG
// copies live in Cloudinary › jwco-brand-kit for social, email and print.
//
// House rules (from the kit README):
// • One piece per screen view, three per page at most, never over text.
// • A Ledger stamp is only ever the status a record has actually earned
//   (see lib/ledger/status.ts). VIP pieces only on VIP residences. The Horizon
//   stamp never on a Ledger record. A taped photo only for James's own photos.
// • Oxblood is for the seal and Ledger stamps only; rust for offers; each
//   natural setting has its own ink for tags, VIP and Horizon stamps.
// ─────────────────────────────────────────────────────────────────────────────

const OX = "#7A1E1E";
const RUST = "#94512F";
const LIGHT = "#F4F1EC";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SCRIPT = "'Mrs Saint Delafield', cursive";
export type Tone = "ink" | "light";
export type Volume = "stays" | "safaris" | "gatherings" | "voyages" | "overland";

const LEDGER_NAME: Record<Volume, string> = {
  stays: "THE LEDGER",
  safaris: "THE SAFARI LEDGER",
  gatherings: "THE GATHERINGS LEDGER",
  voyages: "THE VOYAGE LEDGER",
  overland: "THE OVERLAND LEDGER",
};

// Worn rubber-stamp ink: wobbly edge plus speckled voids. Transparent background.
function Ink({ id, seed = 7, scale = 2.4, cut = 1.7 }: { id: string; seed?: number; scale?: number; cut?: number }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves={2} seed={seed + 20} result="s" />
      <feColorMatrix in="s" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 -${cut}`} result="m" />
      <feComposite in="d" in2="m" operator="in" />
    </filter>
  );
}

// 40×40 line icons — settings, Ledger statuses and practical notes
const ICON: Record<string, React.ReactNode> = {
  binoculars: <><circle cx="11" cy="27" r="7.5" /><circle cx="29" cy="27" r="7.5" /><path d="M5 23 L9 9 h6 l2 9 M35 23 L31 9 h-6 l-2 9 M17 19 h6" /></>,
  star: <path d="M20 3 L24.2 15 L37 15.3 L26.8 23 L30.5 35.5 L20 28.2 L9.5 35.5 L13.2 23 L3 15.3 L15.8 15 Z" fill="currentColor" />,
  compass: <><circle cx="20" cy="20" r="17" /><path d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z" /><path d="M20 4 L23 17 L20 20 L17 17 Z M20 36 L17 23 L20 20 L23 23 Z" fill="currentColor" /></>,
  key: <><circle cx="11" cy="20" r="7" /><circle cx="11" cy="20" r="2.4" fill="currentColor" /><path d="M18 20 H37 M31 20 v6 M36 20 v5" /></>,
  tree: <><path d="M20 37 V17 M20 25 L12 17 M20 22 L28 14" /><circle cx="11" cy="14" r="4.5" /><circle cx="29" cy="11" r="4.5" /><circle cx="20" cy="7" r="4.5" /><path d="M8 37 H32" /></>,
  camera: <><rect x="4" y="13" width="32" height="20" rx="3" /><circle cx="20" cy="23" r="6" /><path d="M14 13 l3 -4.5 h6 l3 4.5" /></>,
  palm: <><path d="M20 38 C 21 28, 19 20, 22 12" /><path d="M22 12 C 14 8, 8 10, 4 16 M22 12 C 30 7, 36 10, 38 16 M22 12 C 17 4, 11 3, 7 5 M22 12 C 27 4, 32 3, 35 6 M22 12 C 22 6, 24 3, 26 1" /><path d="M8 38 H32" /></>,
  mountain: <><path d="M2 34 L14 13 L20 22 L27 9 L38 34 Z" /><path d="M10.5 19 L14 13 L17.5 18.5 M23.5 15 L27 9 L30.5 15.5" /></>,
  jungle: <><path d="M20 38 C 6 30, 4 14, 20 3 C 36 14, 34 30, 20 38 Z" /><path d="M20 38 V6 M20 14 L13 9 M20 20 L10 16 M20 27 L11 25 M20 14 L27 9 M20 20 L30 16 M20 27 L29 25" /></>,
  coast: <><circle cx="27" cy="11" r="5" /><path d="M2 23 q4.5 -4 9 0 t9 0 t9 0 t9 0 M2 30 q4.5 -4 9 0 t9 0 t9 0 t9 0" /></>,
  desert: <path d="M15 33 L18.5 20 H32.5 L36 33 M2 33 H38 M8 33 V13 M8 22 h-4 v-6 M8 25 h4 v-7" />,
  savanna: <><path d="M20 34 V19 M20 24 L14 18 M20 22 L27 17 M2 34 H38" /><path d="M5 17 C 10 10, 30 10, 35 17 Z" fill="currentColor" /></>,
  polar: <><path d="M6 25 L12 12 L18 16 L24 5 L33 25 Z M2 25 H38" /><path d="M10 25 L14 35 H28 L31 25" strokeDasharray="2.5 2.5" /></>,
  ship: <><path d="M4 26 H36 L31 34 H9 Z" /><path d="M20 26 V5 M20 7 L31 22 H20 M20 10 L11 22 H20" /></>,
  season: <><circle cx="20" cy="20" r="7" /><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M8 32l3.5-3.5M28.5 11.5L32 8" /></>,
  plane: <path d="M4 24 L17 21 L29 8 L33 9 L25 22 L36 25 L36 27 L23 27 L15 35 L11 35 L15 26 L4 26 Z" />,
  plug: <path d="M14 4v9M26 4v9M10 13h20v7a10 10 0 0 1-20 0zM20 30v7" />,
  clock: <><circle cx="20" cy="20" r="15" /><path d="M20 11v9l6 4" /></>,
  family: <><circle cx="13" cy="10" r="4" /><circle cx="28" cy="13" r="3.2" /><path d="M6 36v-12a7 7 0 0 1 14 0v12M23 36v-9a5 5 0 0 1 10 0v9" /></>,
  water: <path d="M2 27c5-5 11 5 18 0s13 5 18 0M2 34c5-5 11 5 18 0s13 5 18 0M11 19l9-14 9 14" />,
  moon: <><path d="M26 6 A 15 15 0 1 0 34 30 A 12 12 0 1 1 26 6 Z" /><path d="M31 8 l1.2 2.6 2.8 .4 -2 2 .5 2.8 -2.5 -1.3 -2.5 1.3 .5 -2.8 -2 -2 2.8 -.4 Z" fill="currentColor" /></>,
  table: <><path d="M13 6v10a4 4 0 0 0 8 0V6" /><path d="M17 6v28" /><path d="M28 34V6c-3.5 2-5 6-5 11s1.5 6 5 6" /></>,
  route: <><circle cx="8" cy="32" r="3.5" /><circle cx="32" cy="8" r="3.5" /><path d="M11 30 C 22 28, 12 16, 22 13 S 28 10, 29 10" strokeDasharray="3 3" /></>,
};

export type LineIconName = keyof typeof ICON;

// Line icon for practical notes (best season, getting there, power, family…)
export function Icon({ name, size = 30, color = "currentColor", stroke = 1.6 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ color, flex: "none" }}>
      {ICON[name]}
    </svg>
  );
}
const iconAt = (name: string, cx: number, cy: number, size: number, color: string, sw = 2) => (
  <g transform={`translate(${cx - size / 2},${cy - size / 2}) scale(${size / 40})`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
    {ICON[name]}
  </g>
);

export function SettingDot({ setting }: { setting: SettingKey }) {
  return <i className="inline-block w-2 h-2 rounded-full align-middle" style={{ background: SETTINGS[setting].ink }} aria-hidden="true" />;
}

// ── 1. Ledger stamp (oxblood) — the one status a record has earned ─────────────
type StampText = { top: string; bottom: string; small: string; big: string; sub: string; icon: string };
function stampText(kind: LedgerStampKind, volume: Volume): StampText {
  const ledger = LEDGER_NAME[volume];
  switch (kind) {
    case "Founder favorite":
      return { top: "JAMES WILD & CO.", bottom: "★ STAYED & LOVED ★", small: "THE", big: "FOUNDER FAVORITE", sub: "J. W.", icon: "star" };
    case "Field verified":
      return { top: ledger, bottom: "★ TOURED & STAYED ★", small: "PERSONALLY", big: "FIELD VERIFIED", sub: "J. W.", icon: "binoculars" };
    case "Founder inspected":
      return { top: ledger, bottom: "★ & APPROVED ★", small: "FOUNDER", big: "INSPECTED", sub: "J. W.", icon: "binoculars" };
    case "Host met":
      return { top: ledger, bottom: "★ IN PERSON ★", small: "THE", big: "HOST MET", sub: "J. W.", icon: "key" };
    case "Under observation":
      return { top: ledger, bottom: "★ ON THE LIST ★", small: "UNDER", big: "OBSERVATION", sub: "visit planned", icon: "compass" };
    case "Gathering verified":
      return { top: "THREE GENERATIONS", bottom: "★ TESTED BY A FAMILY ★", small: "GATHERING", big: "VERIFIED", sub: "J. W.", icon: "tree" };
  }
}

export function Stamp({
  kind,
  volume = "stays",
  year,
  size = 170,
  tone = "ink",
  animate = true,
}: {
  kind: LedgerStampKind;
  volume?: Volume;
  year?: string | number;
  size?: number;
  tone?: Tone;
  animate?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [seen, setSeen] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);
  const s = stampText(kind, volume);
  const sub = year ? `${s.sub} · ${year}` : s.sub;
  const c = tone === "light" ? LIGHT : OX;
  return (
    <svg ref={ref} className={`ledger-stamp${seen ? " in" : ""}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`Ledger stamp: ${kind}${year ? `, ${year}` : ""}, signed J.W.`} style={{ flex: "none" }}>
      <defs>
        <path id={`t${id}`} d="M 24,100 A 76,76 0 0 1 176,100" />
        <path id={`b${id}`} d="M 13,100 A 87,87 0 0 0 187,100" />
        <Ink id={`k${id}`} seed={kind.length + 3} />
      </defs>
      <g filter={`url(#k${id})`} fill={c} stroke={c} opacity={0.93}>
        <circle cx="100" cy="100" r="95" fill="none" strokeWidth="3.4" />
        <circle cx="100" cy="100" r="89" fill="none" strokeWidth=".9" />
        <text stroke="none" fontFamily={SERIF} fontWeight={600} fontSize="15.5"><textPath href={`#t${id}`} startOffset="50%" textAnchor="middle" textLength={Math.min(200, 11.4 * s.top.length)} lengthAdjust="spacing">{s.top}</textPath></text>
        <text stroke="none" fontFamily={MONO} fontWeight={500} fontSize="10.5"><textPath href={`#b${id}`} startOffset="50%" textAnchor="middle" textLength={Math.min(205, 8.6 * s.bottom.length)} lengthAdjust="spacing">{s.bottom}</textPath></text>
        {iconAt(s.icon, 100, 70, 34, c)}
        <line x1="44" y1="98" x2="156" y2="98" strokeWidth="1" />
        <line x1="44" y1="140" x2="156" y2="140" strokeWidth="1" />
        <text stroke="none" x="100" y="112" textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="2.4">{s.small}</text>
        <text stroke="none" x="100" y="133" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize="21" textLength={Math.min(110, 11.5 * s.big.length)} lengthAdjust="spacingAndGlyphs">{s.big}</text>
        <text stroke="none" x="100" y="160" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={year ? 15 : 17}>{sub}</text>
      </g>
    </svg>
  );
}

// Small "Host met" mark for a host's portrait — only when the host was met in person.
export function HostMark({ size = 96, volume = "stays" }: { size?: number; volume?: Volume }) {
  return <Stamp kind="Host met" volume={volume} size={size} animate={false} />;
}

// ── 2. Gatherings VIP oval — VIP residences only, inked in the setting ─────────
export function VipStamp({ setting, size = 220, rotate = -8, tone = "ink", note }: { setting?: SettingKey; size?: number; rotate?: number; tone?: Tone; note?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const st = setting ? SETTINGS[setting] : undefined;
  const c = tone === "light" ? LIGHT : st?.ink || OX;
  const line = (note || st?.name || "James Wild & Co.").toUpperCase();
  return (
    <svg width={size} height={Math.round((size * 190) / 280)} viewBox="0 0 280 190" role="img" aria-label={`Gatherings VIP — Vetted in Purpose${st ? ` · ${st.name}` : ""}${note ? ` · ${note}` : ""}`} style={{ transform: `rotate(${rotate}deg)`, flex: "none" }}>
      <defs>
        <path id={`t${id}`} d="M 36,95 A 104,64 0 0 1 244,95" />
        <path id={`b${id}`} d="M 22,95 A 118,78 0 0 0 258,95" />
        <Ink id={`v${id}`} seed={31 + (setting?.length || 0)} />
      </defs>
      <g filter={`url(#v${id})`} fill={c} stroke={c} opacity={0.93}>
        <ellipse cx="140" cy="95" rx="134" ry="89" fill="none" strokeWidth="3.4" />
        <ellipse cx="140" cy="95" rx="127" ry="82" fill="none" strokeWidth=".9" />
        <ellipse cx="140" cy="95" rx="88" ry="52" fill="none" strokeWidth="1.2" />
        <text stroke="none" fontFamily={SERIF} fontWeight={600} fontSize="16"><textPath href={`#t${id}`} startOffset="50%" textAnchor="middle" textLength="170" lengthAdjust="spacing">GATHERINGS VIP</textPath></text>
        <text stroke="none" fontFamily={MONO} fontWeight={500} fontSize="11"><textPath href={`#b${id}`} startOffset="50%" textAnchor="middle" textLength="214" lengthAdjust="spacing">★ VETTED IN PURPOSE ★</textPath></text>
        {iconAt(setting || "compass", 140, 67, 22, c, 2.2)}
        <text stroke="none" x="140" y="112" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize="42" letterSpacing="6">VIP</text>
        <text stroke="none" x="140" y="132" textAnchor="middle" fontFamily={MONO} fontSize="9" letterSpacing="2.4" {...(line.length > 18 ? { textLength: 150, lengthAdjust: "spacingAndGlyphs" as const } : {})}>{line}</text>
      </g>
    </svg>
  );
}

// ── 3. Luggage tag — one per stay or vessel, hanging on the hero photo ─────────
export function LuggageTag({ setting, name, place, entryNo, status, width = 168 }: { setting: SettingKey; name: string; place: string; entryNo: string; status: string; width?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const st = SETTINGS[setting];
  const ink = st.ink;
  const nm = st.name.toUpperCase();
  const hl = Math.min(222, 12.5 * name.length);
  const no = `No. ${entryNo}`;
  return (
    <svg width={width} height={Math.round((width * 620) / 320)} viewBox="0 0 320 620" role="img" aria-label={`James Wild & Co luggage tag — ${st.name}, ${status}, ${name}, ${place}, entry ${entryNo}`} style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id={`kr${id}`} x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stopColor="#E7DABE" /><stop offset="1" stopColor="#D3C09C" /></linearGradient>
        <filter id={`tx${id}`}><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves={4} seed={7} /><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .25  0 0 0 0 .16  0 0 0 .16 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
        <mask id={`h${id}`}><rect width="320" height="620" fill="#fff" /><circle cx="160" cy="132" r="10" fill="#000" /></mask>
        <Ink id={`g${id}`} seed={9} scale={1.8} cut={1.5} />
      </defs>
      <path d="M160 132 C 128 70, 205 56, 178 0" fill="none" stroke="#8C6E4A" strokeWidth="3.2" strokeLinecap="round" />
      <g mask={`url(#h${id})`}>
        <path d="M78 92 H242 L300 150 V604 H20 V150 Z" fill={`url(#kr${id})`} />
        <path d="M78 92 H242 L300 150 V604 H20 V150 Z" fill="#fff" filter={`url(#tx${id})`} />
        <circle cx="160" cy="132" r="24" fill="#B48A5E" /><circle cx="160" cy="132" r="17" fill="#C9A47A" />
      </g>
      <path d="M160 132 C 196 78, 128 60, 146 0" fill="none" stroke="#9E8058" strokeWidth="3.2" strokeLinecap="round" />
      <g filter={`url(#g${id})`} fill={ink} stroke={ink}>
        <rect x="40" y="180" width="240" height="402" fill="none" strokeWidth="1.3" />
        <text stroke="none" x="160" y="210" textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize="11" letterSpacing="3">JAMES WILD &amp; CO.</text>
        <line x1="60" y1="224" x2="260" y2="224" strokeWidth=".8" />
        {iconAt(setting, 160, 258, 40, ink)}
        <text stroke="none" x="160" y="320" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={nm.length <= 9 ? 30 : 25} letterSpacing="2">{nm}</text>
        <text stroke="none" x="160" y="344" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="2.6" {...(status.length > 18 ? { textLength: 200, lengthAdjust: "spacingAndGlyphs" as const } : {})}>{status.toUpperCase()}</text>
        <line x1="60" y1="364" x2="260" y2="364" strokeWidth=".8" />
        <text stroke="none" x="160" y="404" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize="25" textLength={hl} lengthAdjust="spacingAndGlyphs">{name}</text>
        <text stroke="none" x="160" y="430" textAnchor="middle" fontFamily={MONO} fontSize="10.5" letterSpacing="2.4" {...(place.length > 22 ? { textLength: 220, lengthAdjust: "spacingAndGlyphs" as const } : {})}>{place.toUpperCase()}</text>
        <text stroke="none" x="160" y="476" textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize="15" letterSpacing={no.length > 12 ? 1 : 3} {...(no.length > 14 ? { textLength: 214, lengthAdjust: "spacingAndGlyphs" as const } : {})}>{no}</text>
      </g>
      <text x="160" y="548" textAnchor="middle" fontFamily={SCRIPT} fontSize="46" fill="#3E3226" opacity=".85">J. Wild</text>
    </svg>
  );
}

// ── 4. Postmark — Journal datelines, emails, the thank-you page ────────────────
export function Postmark({ place, date, color = OX, width = 300 }: { place: string; date: string; color?: string; width?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = `★ ${place.toUpperCase()} ★`;
  return (
    <svg width={width} height={Math.round((width * 220) / 440)} viewBox="0 0 440 220" role="img" aria-label={`James Wild & Co postmark — ${place}, ${date}`} style={{ flex: "none" }}>
      <defs>
        <path id={`t${id}`} d="M 34,110 A 76,76 0 0 1 186,110" />
        <path id={`b${id}`} d="M 24,110 A 86,86 0 0 0 196,110" />
        <Ink id={`p${id}`} seed={17} scale={2.2} cut={1.65} />
      </defs>
      <g filter={`url(#p${id})`} fill={color} stroke={color} opacity={0.9} transform="rotate(-4 220 110)">
        <circle cx="110" cy="110" r="96" fill="none" strokeWidth="3" />
        <circle cx="110" cy="110" r="64" fill="none" strokeWidth="1" />
        <text stroke="none" fontFamily={SERIF} fontWeight={600} fontSize="15"><textPath href={`#t${id}`} startOffset="50%" textAnchor="middle" textLength="176" lengthAdjust="spacing">JAMES WILD &amp; CO.</textPath></text>
        <text stroke="none" fontFamily={MONO} fontWeight={500} fontSize="11.5"><textPath href={`#b${id}`} startOffset="50%" textAnchor="middle" textLength={Math.min(200, 10.5 * p.length)} lengthAdjust="spacing">{p}</textPath></text>
        {iconAt("palm", 110, 88, 34, color)}
        <text stroke="none" x="110" y="128" textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize="12" letterSpacing="1.5">{date.toUpperCase()}</text>
        <text stroke="none" x="110" y="146" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13">journeys worth remembering</text>
        {[66, 86, 106, 126, 146].map((y) => (
          <path key={y} d={`M205 ${y} q12.5 -7 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0`} fill="none" strokeWidth="1.6" />
        ))}
      </g>
    </svg>
  );
}

// ── 5. Taped photo — James's own photograph only, once per page ────────────────
export function TapedPhoto({ src, alt, caption, rotate = 2.5, tape = "kraft", height = 340, sizes = "420px" }: { src: string; alt: string; caption?: string; rotate?: number; tape?: "cream" | "kraft" | "long"; height?: number; sizes?: string }) {
  const tapeSrc = tape === "long" ? "/kit/tape-cream-long.png" : tape === "cream" ? "/kit/tape-cream.png" : "/kit/tape-kraft.png";
  return (
    <figure className="relative m-0 bg-white p-3 pb-4 shadow-[0_6px_20px_rgba(45,42,38,0.18)]" style={{ transform: `rotate(${rotate}deg)` }}>
      <Image src={tapeSrc} alt="" aria-hidden="true" width={150} height={42} className="absolute -top-5 left-1/2 -translate-x-1/2 w-32 h-auto opacity-90" />
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
      {caption && <figcaption className="ledger-hand text-xl mt-2 text-ink">{caption}</figcaption>}
    </figure>
  );
}

// ── Hare seal — "James Wild & Co · Ledgered & Vetted · Journey design since 1982" ──
export function JwcoSeal({ size = 96, tone = "ink", rotate = 0, className }: { size?: number; tone?: Tone; rotate?: number; className?: string }) {
  const src = `/brand/jwco-hare${tone === "light" ? "-cream" : ""}-${size > 200 ? 600 : 240}.png`;
  return (
    <Image
      className={className}
      src={src}
      width={size}
      height={size}
      alt="James Wild & Co. seal — Ledgered & Vetted, journey design since 1982"
      style={{ display: "block", flex: "none", width: size, height: size, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    />
  );
}

// ── 6. "Time Rewarded" offer stamp (rust) — verified offers only ───────────────
// Wild Earth Stays offers read "buy 3, stay 4": pass stay=4 pay=3.
const ORD = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
export function OfferStamp({ stay = 4, pay = 3, size = 170, rotate = -9, tone = "ink" }: { stay?: number; pay?: number; size?: number; rotate?: number; tone?: Tone }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = tone === "light" ? LIGHT : RUST;
  const free = Math.max(1, stay - pay);
  const big = free === 1 ? `${ORD[stay] || stay + "th"} NIGHT` : `${free} NIGHTS`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`Time Rewarded — a verified offer: stay ${stay} nights, pay for ${pay}`} style={{ transform: `rotate(${rotate}deg)`, flex: "none" }}>
      <defs>
        <path id={`t${id}`} d="M 24,100 A 76,76 0 0 1 176,100" />
        <path id={`b${id}`} d="M 13,100 A 87,87 0 0 0 187,100" />
        <Ink id={`o${id}`} seed={23} />
      </defs>
      <g filter={`url(#o${id})`} fill={c} stroke={c} opacity={0.94}>
        <circle cx="100" cy="100" r="95" fill="none" strokeWidth="3.4" />
        <circle cx="100" cy="100" r="89" fill="none" strokeWidth="1" strokeDasharray="3 3" />
        <text stroke="none" fontFamily={SERIF} fontWeight={600} fontSize="15.5"><textPath href={`#t${id}`} startOffset="50%" textAnchor="middle" textLength="204" lengthAdjust="spacing">TIME REWARDED</textPath></text>
        <text stroke="none" fontFamily={MONO} fontWeight={500} fontSize="10.5"><textPath href={`#b${id}`} startOffset="50%" textAnchor="middle" textLength="176" lengthAdjust="spacing">★ A VERIFIED OFFER ★</textPath></text>
        {iconAt("moon", 100, 68, 30, c)}
        <line x1="44" y1="94" x2="156" y2="94" strokeWidth="1" />
        <line x1="44" y1="142" x2="156" y2="142" strokeWidth="1" />
        <text stroke="none" x="100" y="109" textAnchor="middle" fontFamily={MONO} fontSize="9" letterSpacing="2.2">{`STAY ${stay} · PAY ${pay}`}</text>
        <text stroke="none" x="100" y="134" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize="23" textLength={Math.min(112, 11.5 * big.length)} lengthAdjust="spacingAndGlyphs">{big}</text>
        <text stroke="none" x="100" y="162" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize="17">on the house</text>
      </g>
    </svg>
  );
}

// ── 7. "On the Horizon" — new places on James's list, NOT yet vetted ───────────
// Rectangular (Ledger stamps are round), in the setting's ink. Never on a Ledger record.
export function HorizonStamp({ setting, no, opens, size = 230, rotate = -5, tone = "ink" }: { setting: SettingKey; no: string; opens: string; size?: number; rotate?: number; tone?: Tone }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = tone === "light" ? LIGHT : SETTINGS[setting].ink;
  const o = opens.toUpperCase();
  const foot = `NOT YET VETTED · ${o}`;
  return (
    <svg width={size} height={Math.round((size * 150) / 260)} viewBox="0 0 260 150" role="img" aria-label={`On the Horizon ${no} — not yet vetted · ${opens}`} style={{ transform: `rotate(${rotate}deg)`, flex: "none" }}>
      <defs><Ink id={`h${id}`} seed={41 + no.length} /></defs>
      <g filter={`url(#h${id})`} fill={c} stroke={c} opacity={0.93}>
        <rect x="5" y="5" width="250" height="140" rx="6" fill="none" strokeWidth="3.4" />
        <rect x="12" y="12" width="236" height="126" rx="3" fill="none" strokeWidth=".9" />
        <text stroke="none" x="130" y="38" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize="19" letterSpacing="3" textLength="200" lengthAdjust="spacing">ON THE HORIZON</text>
        <line x1="30" y1="50" x2="230" y2="50" strokeWidth="1" />
        {iconAt(setting, 62, 82, 34, c, 2)}
        <text stroke="none" x="150" y="94" textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize="36" letterSpacing="2">{no}</text>
        <line x1="30" y1="110" x2="230" y2="110" strokeWidth="1" />
        <text stroke="none" x="130" y="128" textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize="10" letterSpacing="1.6" {...(foot.length > 26 ? { textLength: 214, lengthAdjust: "spacingAndGlyphs" as const } : {})}>{foot.length > 44 ? o : foot}</text>
      </g>
    </svg>
  );
}
