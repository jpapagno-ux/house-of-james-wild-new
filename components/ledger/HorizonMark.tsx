import { HORIZON, type HorizonTokens } from "@/lib/volumes";
import { padFilter } from "@/components/ledger/VolumeKit";

// The On the Horizon stamp (James, 2 Nov 2026): the mark for the house's offers, nautical and
// original, drawn in the same engraved line as the volume stamps (components/ledger/VolumeKit):
// a 4-weight outer ring, 1-weight hairlines, 1.6-weight inner rings and motif, the mono ring
// lettering and serif figures. A compass bezel rings a sun rising over a ruled horizon and the
// swell, with a four-point compass star above. Colours come only from HORIZON in lib/volumes.ts,
// derived from the Voyages tokens (scripts/check-palette.mjs holds this file to that).
//
//   tone "ink"   pressed from the stamp pad: texture and multiply, for white pages (hub, cards)
//   tone "clean" no texture: crisp at badge sizes and in print
//   tone "dark"  the onDark set, for navy grounds and photographs
// Below 64px it draws the badge cut: bezel, sun, horizon and swell, no lettering.

const MONO = "IBM Plex Mono, ui-monospace, monospace";
const f1 = (n: number) => n.toFixed(1);
const at = (r: number, deg: number) => { const a = (deg * Math.PI) / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };

function bezel(t: HorizonTokens) {
  // 64 compass ticks; every eighth (the cardinal and half-cardinal points) runs longer and heavier.
  return Array.from({ length: 64 }, (_, i) => {
    const major = i % 8 === 0, deg = i * 5.625 - 90;
    const [x1, y1] = at(major ? 78.5 : 82, deg), [x2, y2] = at(87, deg);
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${t.ink}" stroke-width="${major ? 1.6 : 1}"/>`;
  }).join("");
}

function ringText(id: string, t: HorizonTokens) {
  const r = 65;
  return `<defs><path id="${id}t" d="M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100"/><path id="${id}b" d="M ${100 - r - 9} 100 A ${r + 9} ${r + 9} 0 0 0 ${100 + r + 9} 100"/></defs>
<text font-family="${MONO}" font-size="9.5" letter-spacing="2.4" fill="${t.ink}"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">ON THE HORIZON</textPath></text>
<text font-family="${MONO}" font-size="8.5" letter-spacing="2" fill="${t.ink}"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">JAMES WILD &amp; CO</textPath></text>`;
}

function motif(id: string, t: HorizonTokens, badge: boolean) {
  const R = badge ? 74 : 57; // the inner field
  const hy = badge ? 108 : 110;
  const sr = badge ? 22 : 16;
  const rays = Array.from({ length: 9 }, (_, i) => {
    const deg = 180 + i * 22.5, long = i % 2 === 0;
    const [x1, y1] = [100 + (sr + 5) * Math.cos((deg * Math.PI) / 180), hy + (sr + 5) * Math.sin((deg * Math.PI) / 180)];
    const [x2, y2] = [100 + (sr + (long ? 14 : 9)) * Math.cos((deg * Math.PI) / 180), hy + (sr + (long ? 14 : 9)) * Math.sin((deg * Math.PI) / 180)];
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${t.sun}" stroke-width="${badge ? 3.2 : 1.6}" stroke-linecap="round"/>`;
  }).join("");
  const wave = (y: number, half: number, amp: number) => {
    let d = `M ${100 - half} ${y}`;
    const n = Math.max(2, Math.round(half / 9));
    const w = (2 * half) / n;
    for (let i = 0; i < n; i++) d += ` q ${f1(w / 2)} ${i % 2 ? amp : -amp} ${f1(w)} 0`;
    return `<path d="${d}" fill="none" stroke="${t.sea}" stroke-width="${badge ? 3 : 1}" stroke-linecap="round"/>`;
  };
  const star = (cx: number, cy: number, r: number) => `<path d="M${cx} ${cy - r} L${f1(cx + r * 0.22)} ${f1(cy - r * 0.22)} L${cx + r} ${cy} L${f1(cx + r * 0.22)} ${f1(cy + r * 0.22)} L${cx} ${cy + r} L${f1(cx - r * 0.22)} ${f1(cy + r * 0.22)} L${cx - r} ${cy} L${f1(cx - r * 0.22)} ${f1(cy - r * 0.22)} Z" fill="${t.ink}"/>`;
  return `<clipPath id="${id}c"><circle cx="100" cy="100" r="${R}"/></clipPath><g clip-path="url(#${id}c)">
<path d="M ${100 - sr} ${hy} A ${sr} ${sr} 0 0 1 ${100 + sr} ${hy}" fill="none" stroke="${t.sun}" stroke-width="${badge ? 3.4 : 1.6}"/>
<path d="M ${100 - sr + 5} ${hy} A ${sr - 5} ${sr - 5} 0 0 1 ${100 + sr - 5} ${hy} Z" fill="${t.sun}" opacity="0.28"/>${rays}
<line x1="${100 - R}" y1="${hy}" x2="${100 + R}" y2="${hy}" stroke="${t.ink}" stroke-width="${badge ? 3.4 : 1.6}"/>
${badge ? wave(hy + 14, 46, 4) + wave(hy + 27, 30, 4) : wave(hy + 10, 44, 2.6) + wave(hy + 18, 34, 2.6) + wave(hy + 26, 22, 2.6)}</g>
${badge ? "" : star(100, 65, 8)}
${badge ? "" : `<text x="100" y="152" text-anchor="middle" font-family="${MONO}" font-size="7.5" letter-spacing="2.2" fill="${t.ink}">OFFERS</text>`}`;
}

export function horizonSvg({ size = 180, tone = "ink", id = "hz" }: { size?: number; tone?: "ink" | "clean" | "dark"; id?: string }) {
  const t = tone === "dark" ? HORIZON.onDark : HORIZON.onLight;
  const badge = size < 64;
  const k = `${id}${size}${tone}`;
  const body = badge
    ? `<circle cx="100" cy="100" r="90" fill="none" stroke="${t.ink}" stroke-width="10"/><circle cx="100" cy="100" r="78" fill="none" stroke="${t.ink}" stroke-width="3"/>${motif(k, t, true)}`
    : `<circle cx="100" cy="100" r="93" fill="none" stroke="${t.ink}" stroke-width="4"/><circle cx="100" cy="100" r="88" fill="none" stroke="${t.ink}" stroke-width="1"/>${bezel(t)}${ringText(k, t)}<circle cx="100" cy="100" r="58" fill="none" stroke="${t.ink}" stroke-width="1.6"/>${motif(k, t, false)}`;
  const textured = tone === "ink" && !badge;
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="On the Horizon, the James Wild &amp; Co offers stamp" style="overflow:visible">${textured ? `<defs>${padFilter(`${k}f`, 63)}</defs><g filter="url(#${k}f)">${body}</g>` : body}</svg>`;
}

/** The On the Horizon stamp. `rotate` tilts it like a hand-pressed stamp. */
export default function HorizonMark({ size = 180, tone = "ink", rotate = 0, className, id }: { size?: number; tone?: "ink" | "clean" | "dark"; rotate?: number; className?: string; id?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", flex: "none", transform: rotate ? `rotate(${rotate}deg)` : undefined, mixBlendMode: tone === "ink" ? "multiply" : undefined }}
      dangerouslySetInnerHTML={{ __html: horizonSvg({ size, tone, id }) }} />
  );
}

/** The On the Horizon badge: the small stamp and the type, for offer cards and labels. */
export function HorizonBadge({ type, tone = "clean" }: { type?: string; tone?: "clean" | "dark" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <HorizonMark size={28} tone={tone} />
      <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase">On the Horizon{type && type !== "On the Horizon" ? ` · ${type}` : ""}</span>
    </span>
  );
}
