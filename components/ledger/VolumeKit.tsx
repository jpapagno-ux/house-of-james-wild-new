// The volume kit (approved by James, 29 Oct 2026): the marks each of the six
// volumes uses on white pages. Drawn from data, so a new record gets its marks
// with no new artwork.
//
//   InkStamp       volume stamp, pressed from an ink pad: one per page, by James's note
//   EmbossSeal     blind-embossed founder mark, pressed into the white title card
//   PassportStamp  dated proof: "Founder stayed · MAY 2026 · place"
//   Roundel        clean coordinate mark for map pins, favicons and social
//   TimeMark       animated offer marks: hourglass, candle clock, ship's clock, sundial
//   FinalCallBoard split-flap board for late-departure savings (Voyages, Overland)
//
// House rules: one ink stamp per page; founder marks only from the Ledger;
// offers always sit beside their real terms; no countdowns; every animation
// stops for prefers-reduced-motion (see globals.css).

import { type VolumeKey, type VolumeStyle, type VolumeIcon, VOLUME_STYLES } from "@/lib/volumes";

const MONO = "IBM Plex Mono, ui-monospace, monospace";
const SERIF = "Cormorant Garamond, Georgia, serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24) || "x";
const f1 = (n: number) => n.toFixed(1);

// Three-stroke line icons, 40×40, shared by stamps, labels and cards.
export const VOLUME_ICON: Record<VolumeIcon, string> = {
  key: '<circle cx="12" cy="20" r="7"/><path d="M19 20 H36 M31 20 v5"/>',
  acacia: '<path d="M20 35 V19"/><path d="M5 18 C 11 10, 29 10, 35 18 Z" fill="currentColor"/>',
  house: '<path d="M6 35 V19 L20 7 L34 19 V35 Z"/><path d="M16.5 35 V27 a3.5 3.5 0 0 1 7 0 V35"/>',
  sail: '<path d="M20 5 V27 M20 7 L31 25 H20"/><path d="M5 29 H35 L30 35 H10 Z"/>',
  dome: '<path d="M8 35 H32 M11 35 V23 M29 35 V23 M9 23 H31"/><path d="M11 23 C 11 12, 29 12, 29 23 M20 13 V7"/>',
  summit: '<path d="M4 33 L16 13 L23 23 L28 16 L36 33 Z"/><path d="M16 13 V4 L22 6.5 L16 9"/>',
};

function iconAt(name: VolumeIcon, size: number, cx: number, cy: number, sw = 2.4) {
  const s = size / 40;
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${s.toFixed(3)})" fill="none" stroke="currentColor" stroke-width="${(sw / s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${VOLUME_ICON[name]}</g>`;
}

export function VolumeIconSvg({ volume, size = 20, stroke = 2.4, className }: { volume: VolumeKey; size?: number; stroke?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: VOLUME_ICON[VOLUME_STYLES[volume].icon] }} />
  );
}

// Stamp-pad ink: soft bleed, fine grain, patchy pressure and a little wobble.
function padFilter(id: string, seed: number) {
  return `<filter id="${id}" x="-8%" y="-8%" width="116%" height="116%">
<feMorphology in="SourceGraphic" operator="dilate" radius="0.35" result="bl"/><feGaussianBlur in="bl" stdDeviation="0.35" result="soft"/>
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}" result="fine"/>
<feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.8 0 0 0 2.25" result="fm"/>
<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="${seed + 5}" result="coarse"/>
<feColorMatrix in="coarse" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.4 0 0 0 2.55" result="cm"/>
<feComposite in="soft" in2="fm" operator="in" result="a"/><feComposite in="a" in2="cm" operator="in" result="b"/>
<feDisplacementMap in="b" in2="coarse" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}

function ring(id: string, r: number, top: string, bottom: string, size = 9.5, ls = 2.2) {
  return `<defs><path id="${id}t" d="M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100"/><path id="${id}b" d="M ${100 - r - 9} 100 A ${r + 9} ${r + 9} 0 0 0 ${100 + r + 9} 100"/></defs>
<text font-family="${MONO}" font-size="${size}" letter-spacing="${ls}" fill="currentColor"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${esc(top)}</textPath></text>
<text font-family="${MONO}" font-size="${size}" letter-spacing="${ls}" fill="currentColor"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${esc(bottom)}</textPath></text>`;
}

function star(x: number, y: number, r = 4) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (Math.PI * i) / 5;
    return `${f1(x + rr * Math.cos(a))},${f1(y + rr * Math.sin(a))}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="currentColor"/>`;
}

function words(w: [string, string], y: number, size = 23) {
  return `<text x="100" y="${y}" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="${size}" fill="currentColor">${esc(w[0])} ${esc(w[1])}</text>`;
}

function stampBody(v: VolumeStyle, no: string, id: string) {
  const entry = `<text x="100" y="__Y__" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="1.2" fill="currentColor">No. ${esc(no)}</text>`;
  switch (v.stamp) {
    case "circle":
      return `<circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="100" cy="100" r="87" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="1.6"/>
${ring(id, 73, v.ring[0], v.ring[1])}${star(20, 100, 4.5)}${star(180, 100, 4.5)}${iconAt(v.icon, 40, 100, 62)}${words(v.words, 104, 22)}<path d="M70 113 H130" stroke="currentColor" stroke-width="1"/>${entry.replace("__Y__", "130")}`;
    case "postage": {
      return `<rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-dasharray="0.1 11"/><rect x="22" y="22" width="156" height="156" fill="none" stroke="currentColor" stroke-width="3"/><rect x="29" y="29" width="142" height="142" fill="none" stroke="currentColor" stroke-width="1"/>
<text x="100" y="47" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2" fill="currentColor">${esc(v.ring[0])}</text>${iconAt(v.icon, 46, 100, 76)}
<text x="100" y="118" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="23" fill="currentColor">${esc(v.words[0])}</text><text x="100" y="139" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="23" fill="currentColor">${esc(v.words[1])}</text>
<path d="M66 147 H134" stroke="currentColor" stroke-width="1.2"/>${entry.replace("__Y__", "160")}<text x="36" y="170" font-family="${MONO}" font-size="8" fill="currentColor">JW</text><text x="164" y="170" text-anchor="end" font-family="${MONO}" font-size="8" fill="currentColor">${esc(v.ring[1])}</text>`;
    }
    case "scallop": {
      const n = 18;
      let d = "";
      for (let i = 0; i < n; i++) {
        const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n;
        if (i === 0) d += `M${f1(100 + 88 * Math.cos(a0))} ${f1(100 + 88 * Math.sin(a0))} `;
        d += `A 16 16 0 0 1 ${f1(100 + 88 * Math.cos(a1))} ${f1(100 + 88 * Math.sin(a1))} `;
      }
      return `<path d="${d}Z" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" stroke-width="1.6"/>
${ring(id, 66, v.ring[0], v.ring[1], 9, 2)}${iconAt(v.icon, 38, 100, 64)}${words(v.words, 104, 22)}<path d="M72 113 H128" stroke="currentColor" stroke-width="1"/>${entry.replace("__Y__", "128")}`;
    }
    case "porthole": {
      const riv = Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI / 8 + (2 * Math.PI * i) / 8;
        return `<circle cx="${f1(100 + 88 * Math.cos(a))}" cy="${f1(100 + 88 * Math.sin(a))}" r="3.2" fill="#FFFFFF"/>`;
      }).join("");
      return `<circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="11"/>${riv}<circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" stroke-width="1.6"/>
${ring(id, 63, v.ring[0], v.ring[1], 9, 2)}${iconAt(v.icon, 38, 100, 64)}${words(v.words, 104, 22)}<path d="M72 113 H128" stroke="currentColor" stroke-width="1"/>${entry.replace("__Y__", "128")}`;
    }
    case "arch":
      return `<path d="M24 190 V96 A76 76 0 0 1 176 96 V190 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M33 181 V96 A67 67 0 0 1 167 96 V181 Z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M33 150 H167" stroke="currentColor" stroke-width="1"/>${star(100, 38, 4.5)}
<text x="100" y="56" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="1.8" fill="currentColor">${esc(v.ring[0])}</text>${iconAt(v.icon, 40, 100, 84)}${words(v.words, 128, 24)}${entry.replace("__Y__", "167")}`;
    case "octagon": {
      const p = (r: number) => Array.from({ length: 8 }, (_, i) => `${f1(100 + r * Math.cos(Math.PI / 8 + (Math.PI * i) / 4))},${f1(100 + r * Math.sin(Math.PI / 8 + (Math.PI * i) / 4))}`).join(" ");
      return `<polygon points="${p(96)}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><polygon points="${p(87)}" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
<text x="100" y="34" text-anchor="middle" font-family="${MONO}" font-size="11" fill="currentColor">N</text><text x="100" y="50" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="1.8" fill="currentColor">${esc(v.ring[0])}</text>
${iconAt(v.icon, 42, 100, 76)}${words(v.words, 120, 23)}<path d="M66 129 H134" stroke="currentColor" stroke-width="1"/>${entry.replace("__Y__", "143")}<text x="100" y="172" text-anchor="middle" font-family="${MONO}" font-size="8" letter-spacing="1.5" fill="currentColor">${esc(v.ring[1])}</text>`;
    }
  }
}

/** The volume stamp, pressed from an ink pad. One per page, beside James's note. */
export function InkStamp({ volume, no, size = 190, rotate = -6, seed = 41 }: { volume: VolumeKey; no: string; size?: number; rotate?: number; seed?: number }) {
  const v = VOLUME_STYLES[volume];
  const id = `ink${volume}${slug(no)}`;
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${esc(`${v.label} stamp: ${v.words.join(" ")}, entry ${no}`)}" style="color:${v.pad};overflow:visible"><defs>${padFilter(id + "f", seed)}</defs><g filter="url(#${id}f)">${stampBody(v, no, id)}</g></svg>`;
  return <span className="jw-press" style={{ display: "inline-flex", flex: "none", transform: `rotate(${rotate}deg)`, mixBlendMode: "multiply" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Founder mark pressed into white paper: no ink, only light and shadow. */
export function EmbossSeal({ label, size = 112, className }: { label: string; size?: number; className?: string }) {
  const id = `emb${slug(label)}`;
  const art = `<circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width="1"/>
<defs><path id="${id}T" d="M 36 100 A 64 64 0 0 1 164 100"/><path id="${id}B" d="M 28 100 A 72 72 0 0 0 172 100"/></defs>
<text font-family="${MONO}" font-size="10" letter-spacing="3" fill="currentColor"><textPath href="#${id}T" startOffset="50%" text-anchor="middle">JAMES WILD &amp; CO</textPath></text>
<text font-family="${MONO}" font-size="10" letter-spacing="2.6" fill="currentColor"><textPath href="#${id}B" startOffset="50%" text-anchor="middle">${esc(label.toUpperCase())}</textPath></text>
<text x="100" y="114" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="44" fill="currentColor">JW</text>`;
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${esc(`Embossed seal: ${label}`)}"><defs><filter id="${id}S"><feGaussianBlur stdDeviation="0.6"/></filter></defs>
<g filter="url(#${id}S)" style="color:rgba(60,40,30,0.34)" transform="translate(1.4 1.6)">${art}</g><g filter="url(#${id}S)" style="color:#FFFFFF" transform="translate(-1.2 -1.2)">${art}</g><g style="color:#F4F2EE">${art}</g></svg>`;
  return <span className={className} style={{ display: "inline-flex", flex: "none" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Dated proof from the Ledger: "FOUNDER STAYED · MAY 2026 · FRANSCHHOEK · ZA". */
export function PassportStamp({ volume, top, date, place, ledgerId, size = 190, rotate = -4, seed = 54 }: { volume: VolumeKey; top: string; date: string; place?: string; ledgerId?: string; size?: number; rotate?: number; seed?: number }) {
  const v = VOLUME_STYLES[volume];
  const id = `pp${volume}${slug(top + date)}`;
  const body = `<rect x="10" y="40" width="180" height="120" rx="14" fill="none" stroke="currentColor" stroke-width="4"/><rect x="18" y="48" width="164" height="104" rx="9" fill="none" stroke="currentColor" stroke-width="1"/>
<text x="100" y="72" text-anchor="middle" font-family="${MONO}" font-weight="500" font-size="11.5" letter-spacing="2.6" fill="currentColor">${esc(top.toUpperCase())}</text><path d="M30 80 H170" stroke="currentColor" stroke-width="1"/>
<text x="100" y="110" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="30" fill="currentColor">${esc(date)}</text>
${place ? `<text x="100" y="129" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="2" fill="currentColor">${esc(place.toUpperCase())}</text>` : ""}
${ledgerId ? `<text x="100" y="145" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="1.6" fill="currentColor">JW · ${esc(ledgerId)}</text>` : ""}`;
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${esc(`${top}, ${date}${place ? `, ${place}` : ""}`)}" style="color:${v.pad};overflow:visible"><defs>${padFilter(id + "f", seed)}</defs><g filter="url(#${id}f)">${body}</g></svg>`;
  return <span className="jw-press" style={{ display: "inline-flex", flex: "none", transform: `rotate(${rotate}deg)`, mixBlendMode: "multiply", margin: `-${size * 0.16}px 0` }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Clean coordinate mark: map pins, favicons, social avatars. No texture. */
export function Roundel({ volume, text, entry, size = 120 }: { volume: VolumeKey; text: string; entry?: string; size?: number }) {
  const v = VOLUME_STYLES[volume];
  const id = `rd${volume}${slug(text)}`;
  const svg = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${esc(text)}" style="color:${v.leather}"><circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="1.2"/>
<defs><path id="${id}" d="M 100 25 A 75 75 0 1 1 99.9 25"/></defs><text font-family="${MONO}" font-size="10" letter-spacing="2.2" fill="currentColor"><textPath href="#${id}">${esc(text.toUpperCase())} · </textPath></text>
${iconAt(v.icon, 46, 100, 92, 2)}${entry ? `<text x="100" y="138" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2.5" fill="currentColor">${esc(entry)}</text>` : ""}</svg>`;
  return <span style={{ display: "inline-flex", flex: "none" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/* ── Offer time marks ──────────────────────────────────────────────────────
   SMIL animations: slow, calm, looping like objects in a room. `still` draws
   the resting frame (cards, pins, reduced motion). */

function hourglass(c: string, sand: string, size: number, still: boolean, id: string) {
  const glass = "M30 14 C30 52, 56 64, 57 80 C56 96, 30 108, 30 146 H90 C90 108, 64 96, 63 80 C64 64, 90 52, 90 14 Z";
  const a = (attr: string, vals: string) => (still ? "" : `<animate attributeName="${attr}" values="${vals}" keyTimes="0;0.82;1" dur="6s" repeatCount="indefinite"/>`);
  const rot = still ? "" : '<animateTransform attributeName="transform" type="rotate" values="0 60 80;0 60 80;180 60 80" keyTimes="0;0.82;1" dur="6s" repeatCount="indefinite"/>';
  const stream = still ? "" : `<line x1="60" y1="80" x2="60" y2="144" stroke="${sand}" stroke-width="2" stroke-dasharray="2 4"><animate attributeName="stroke-dashoffset" values="0;-60" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.78;0.8;1" dur="6s" repeatCount="indefinite"/></line>`;
  return `<svg viewBox="0 0 120 160" width="${Math.round(size * 0.75)}" height="${size}" aria-hidden="true"><defs><clipPath id="${id}g"><path d="${glass}"/></clipPath></defs><g>${rot}
<g clip-path="url(#${id}g)"><rect x="0" y="${still ? 50 : 34}" width="120" height="${still ? 30 : 46}" fill="${sand}">${a("y", "34;78;78")}${a("height", "46;2;2")}</rect><rect x="0" y="${still ? 124 : 146}" width="120" height="${still ? 22 : 0}" fill="${sand}">${a("y", "146;112;112")}${a("height", "0;34;34")}</rect>${stream}</g>
<path d="${glass}" fill="none" stroke="${c}" stroke-width="2.2"/><rect x="10" y="6" width="100" height="9" rx="2" fill="${c}"/><rect x="10" y="145" width="100" height="9" rx="2" fill="${c}"/><path d="M18 15 V145 M102 15 V145" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></g></svg>`;
}

function candle(c: string, size: number, still: boolean, id: string) {
  const m = (attr: string, vals: string) => (still ? "" : `<animate attributeName="${attr}" values="${vals}" dur="14s" repeatCount="indefinite"/>`);
  const [y0, h0] = still ? [62, 88] : [46, 104];
  const body = (fill: string, extra = "") => `<rect x="40" y="${y0}" width="40" height="${h0}" rx="3" fill="${fill}" ${extra}>${m("y", "46;118;46")}${m("height", "104;32;104")}</rect>`;
  const flick = still ? "" : '<animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;0.92 1.08;1.05 0.95;0.96 1.06;1 1" dur="1.6s" repeatCount="indefinite"/>';
  const marks = ([[66, "XII"], [86, "IX"], [106, "VI"], [126, "III"]] as const).map(([y, n]) => `<path d="M40 ${y} H47 M73 ${y} H80" stroke="${c}" stroke-width="1.3"/><text x="60" y="${y + 3.5}" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="10.5" fill="${c}">${n}</text>`).join("");
  const move = still ? "" : '<animateTransform attributeName="transform" type="translate" values="0 0;0 72;0 0" dur="14s" repeatCount="indefinite"/>';
  const glow = still ? "" : '<animate attributeName="r" values="16;20;16" dur="1.6s" repeatCount="indefinite"/>';
  return `<svg viewBox="0 0 120 170" width="${Math.round(size * 0.7)}" height="${size}" aria-hidden="true"><defs><clipPath id="${id}cl">${body("#000")}</clipPath></defs>${body("#FFFFFF")}<g clip-path="url(#${id}cl)">${marks}</g>${body("none", `stroke="${c}" stroke-width="2.2"`)}
<g transform="translate(0 ${still ? 16 : 0})"><g>${move}<path d="M60 46 V38" stroke="${c}" stroke-width="1.6"/><g transform="translate(60 36)"><g>${flick}<path d="M0 0 C-7 -6, -5 -16, 0 -26 C5 -16, 7 -6, 0 0 Z" fill="#C9822C"/><path d="M0 -2 C-3 -6, -2 -11, 0 -15 C2 -11, 3 -6, 0 -2 Z" fill="#F3D9A0"/></g></g><circle cx="60" cy="24" r="18" fill="#C9822C" opacity="0.10">${glow}</circle></g></g>
<path d="M22 150 H98 L90 158 H30 Z" fill="${c}"/><path d="M18 158 H102 V164 H18 Z" fill="${c}"/><path d="M98 150 C112 150, 112 136, 100 136" fill="none" stroke="${c}" stroke-width="2.2"/></svg>`;
}

function shipclock(c: string, size: number, still: boolean) {
  const screws = Array.from({ length: 8 }, (_, i) => `<circle cx="${f1(80 + 66 * Math.cos(Math.PI / 8 + (i * Math.PI) / 4))}" cy="${f1(80 + 66 * Math.sin(Math.PI / 8 + (i * Math.PI) / 4))}" r="3" fill="#FFFFFF" stroke="${c}" stroke-width="1"/>`).join("");
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * Math.PI) / 30, r2 = i % 5 === 0 ? 44 : 47;
    return `<line x1="${f1(80 + 50 * Math.cos(a))}" y1="${f1(80 + 50 * Math.sin(a))}" x2="${f1(80 + r2 * Math.cos(a))}" y2="${f1(80 + r2 * Math.sin(a))}" stroke="${c}" stroke-width="${i % 5 === 0 ? 1.8 : 0.7}"/>`;
  }).join("");
  const nums = ([[80, 44, "12"], [119, 84.5, "3"], [80, 125, "6"], [41, 84.5, "9"]] as const).map(([x, y, n]) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="13" fill="${c}">${n}</text>`).join("");
  const rm = (dur: string, start: number) => (still ? "" : `<animateTransform attributeName="transform" type="rotate" from="${start} 80 80" to="${start + 360} 80 80" dur="${dur}" repeatCount="indefinite"/>`);
  const hand = (start: number, inner: string, dur: string) => `<g transform="rotate(${start} 80 80)"><g>${rm(dur, 0)}${inner}</g></g>`;
  return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" aria-hidden="true"><circle cx="80" cy="80" r="74" fill="none" stroke="${c}" stroke-width="12"/>${screws}<circle cx="80" cy="80" r="58" fill="#FFFFFF" stroke="${c}" stroke-width="1.2"/>${ticks}${nums}
<g transform="translate(80 103) scale(0.42)" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"><path d="M0 -14 V14 M-9 -8 H9 M-14 6 C-12 16, 12 16, 14 6"/><circle cx="0" cy="-18" r="4"/></g>
${hand(300, `<path d="M80 80 L80 52" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, "120s")}${hand(40, `<path d="M80 86 L80 36" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`, "10s")}${still ? "" : hand(0, '<path d="M80 90 L80 32" stroke="#9AA6B6" stroke-width="1"/>', "2.5s")}<circle cx="80" cy="80" r="3.6" fill="${c}"/></svg>`;
}

function sundial(c: string, size: number, still: boolean) {
  const nums = ["VI", "VII", "VIII", "IX", "X", "XI", "XII", "I", "II", "III", "IV", "V", "VI"];
  const lab = nums.map((n, i) => (i % 2 ? "" : `<text x="${f1(80 + 60 * Math.cos(Math.PI + (i * Math.PI) / 12))}" y="${f1(100 + 60 * Math.sin(Math.PI + (i * Math.PI) / 12) + 3)}" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="9.5" fill="${c}">${n}</text>`)).join("");
  const lines = Array.from({ length: 13 }, (_, i) => `<line x1="80" y1="100" x2="${f1(80 + 50 * Math.cos(Math.PI + (i * Math.PI) / 12))}" y2="${f1(100 + 50 * Math.sin(Math.PI + (i * Math.PI) / 12))}" stroke="${c}" stroke-width="0.6" opacity="0.5"/>`).join("");
  const sh = still ? "" : '<animateTransform attributeName="transform" type="rotate" values="-75 80 100;75 80 100;-75 80 100" dur="12s" repeatCount="indefinite"/>';
  const sun = still ? `<circle cx="122" cy="40" r="5" fill="${c}"/>` : `<circle r="5" fill="${c}" opacity="0.85"><animateMotion dur="12s" repeatCount="indefinite" path="M10 96 A 70 70 0 0 1 150 96 A 70 70 0 0 0 10 96" keyPoints="0;0.5;0" keyTimes="0;0.5;1" calcMode="linear"/></circle>`;
  return `<svg viewBox="0 0 160 150" width="${size}" height="${Math.round(size * 0.94)}" aria-hidden="true"><path d="M10 100 A70 70 0 0 1 150 100 Z" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M22 100 A58 58 0 0 1 138 100" fill="none" stroke="${c}" stroke-width="0.8"/>${lines}${lab}
<g transform="rotate(${still ? 30 : 0} 80 100)"><g>${sh}<path d="M80 100 L80 46" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity="0.28"/></g></g><path d="M80 100 L80 62 L96 100 Z" fill="${c}"/><path d="M4 100 H156 M14 108 H146 M30 116 H130" stroke="${c}" stroke-width="2" stroke-linecap="round"/>${sun}</svg>`;
}

/** The volume's animated time mark, for Worth Another Night and Time Rewarded offers. */
export function TimeMark({ volume, size = 160, still = false }: { volume: VolumeKey; size?: number; still?: boolean }) {
  const v = VOLUME_STYLES[volume];
  const id = `tm${volume}${size}${still ? "s" : "a"}`;
  const svg =
    v.timeMark === "hourglass" ? hourglass(v.leather, "#B08657", size, still, id)
    : v.timeMark === "candle" ? candle(v.leather, size, still, id)
    : v.timeMark === "shipclock" ? shipclock(v.leather, size, still)
    : sundial(v.leather, size, still);
  return (
    <span className="jw-timemark" style={{ display: "inline-flex", flex: "none" }}>
      <span className="jw-timemark-live" style={{ display: "inline-flex" }} dangerouslySetInnerHTML={{ __html: svg }} />
      {!still && <span className="jw-timemark-still" style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: TimeMarkStill(volume, size) }} />}
    </span>
  );
}
function TimeMarkStill(volume: VolumeKey, size: number) {
  const v = VOLUME_STYLES[volume];
  const id = `tm${volume}${size}r`;
  return v.timeMark === "hourglass" ? hourglass(v.leather, "#B08657", size, true, id) : v.timeMark === "candle" ? candle(v.leather, size, true, id) : v.timeMark === "shipclock" ? shipclock(v.leather, size, true) : sundial(v.leather, size, true);
}

/** Split-flap departures board for late savings: FINAL CALL / LAST BERTHS / SAVE 15%. */
const POOL = "ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
function flapRow(text: string, ink: string, cell: number, font: number, delay0: number, seed: number) {
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280), POOL[Math.floor((r / 233280) * POOL.length)]);
  return Array.from(text).map((ch, i) => {
    if (ch === " ") return `<span style="display:inline-block;width:${cell * 0.5}px"></span>`;
    const seq = [...Array.from({ length: 7 }, rnd), ch];
    const h = cell * 1.3;
    const col = seq.map((c) => `<span style="display:block;height:${h}px;line-height:${h}px">${esc(c)}</span>`).join("");
    return `<span class="jw-flap" style="width:${cell}px;height:${h}px;background:${ink};font-size:${font}px;--h:${h}px"><span class="jw-flap-col" style="animation-delay:${(delay0 + i * 0.07).toFixed(2)}s">${col}</span></span>`;
  }).join("");
}
export function FinalCallBoard({ volume, saving, cell = 30 }: { volume: Extract<VolumeKey, "voyages" | "overland">; saving: string; cell?: number }) {
  const v = VOLUME_STYLES[volume];
  const lines = ["FINAL CALL", (v.finalCall ?? "Last berths").toUpperCase(), saving.toUpperCase()];
  const html = lines.map((l, k) => `<div style="white-space:nowrap">${flapRow(l, v.leather, cell, Math.round(cell * 0.7), k * 0.4, 7 + k * 13)}</div>`).join("");
  return <div role="img" aria-label={`Final Call: ${v.finalCall}, ${saving}`} className="jw-flapboard" style={{ display: "flex", flexDirection: "column", gap: 8 }} dangerouslySetInnerHTML={{ __html: html }} />;
}
