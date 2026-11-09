import type { CSSProperties, ReactNode } from "react";
import type { OpeningPalette } from "./HouseOpening";

// Details D, "the house tones" (preview, James 8 Nov 2026: "clean up the rest of the page... grains and tones and tints
// in a more organized, tightened up preview"). The record's own palette, the one the opening uses, carried through the
// details as a rhythm of full-bleed bands instead of one long white sheet:
//   day (the overview, ships, FAQ) · mist (the day by day) · paper (dates and rates, numbers on white) · night (before
//   you book, the operator or host: the opening's colour once more). Section eyebrows are numbered 01, 02... like the
//   opening's frames, and take the record's ink in place of graphite. Grain only ever on a night band, and only on ask.
// Without tones every page renders exactly as before. Styles: app/globals.css, ".house-tones".

export type Tones = { palette: OpeningPalette; grain?: boolean };
export type Tone = "mist" | "paper" | "night";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** The night ink, as The Exceptional Few tints it (#E9F0EE on Hermes): white carrying a little of the palette's light
 *  tone, so the words on the night surface belong to the photograph rather than sit on it in pure white. */
export const ivoryOf = (hi: string) => { const a = hex("#FFFFFF"), b = hex(hi); return "#" + a.map((v, i) => Math.round(v * 0.82 + b[i] * 0.18).toString(16).padStart(2, "0")).join(""); };
export const toneVars = (palette: OpeningPalette): CSSProperties => {
  const iv = ivoryOf(palette.hi);
  return {
    ["--tone-night" as string]: palette.night, ["--tone-deep" as string]: palette.deep, ["--tone-day" as string]: palette.day, ["--tone-hi" as string]: palette.hi,
    ["--tone-ivory" as string]: iv, ["--tone-muted" as string]: `color-mix(in srgb, ${iv} 74%, transparent)`, ["--tone-line" as string]: `color-mix(in srgb, ${iv} 20%, transparent)`,
  };
};

export const tonesStyle = (t: Tones): CSSProperties => ({
  ...toneVars(t.palette),
  background: t.palette.day,
});

const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** A full-bleed band in the record's palette; with no tones it is a plain wrapper and nothing changes. */
export function Band({ t, tone, children }: { t?: Tones; tone: Tone; children: ReactNode }) {
  if (!t) return <>{children}</>;
  return (
    <div className={`jw-band jw-band--${tone}`}>
      {tone === "night" && t.grain && <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.08]" style={{ backgroundImage: GRAIN }} />}
      <div className="relative">{children}</div>
    </div>
  );
}
