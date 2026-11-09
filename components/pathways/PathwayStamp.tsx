import { padFilter } from "@/components/ledger/VolumeKit";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { VOYAGE_LINES } from "@/lib/content/ships/pathways";

// The pathway stamp (James, 9 Nov 2026: "new pathway stamps like The Exceptional Few now uses"): pressed from the
// same distressed ink pad as The Exceptional Few's approval stamp (EFBadge.tsx EFStamp), double frame, the pathway's
// name large, its number and setting beneath, and the pathway's own line glyph either side. On a night surface or a
// photograph it prints in the record's ivory; on paper in the pathway's own accent. A stamp, never a score.

const SERIF = "'Cormorant Garamond', Georgia, serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

/** One small line glyph per pathway, drawn into the stamp at (x, 118). */
const MARK: Record<PathwayId, (x: number) => string> = {
  "PATH-01": (x) => `<path d="M${x} 130 c0-8 4-12 9-13 -1 6-4 10-9 13z M${x} 130 l5-6" />`,
  "PATH-02": (x) => `<path d="M${x - 6} 124 c2 0 2-2 4-2 s2 2 4 2 2-2 4-2 2 2 4 2 M${x - 6} 129 c2 0 2-2 4-2 s2 2 4 2 2-2 4-2 2 2 4 2" />`,
  "PATH-03": (x) => `<path d="M${x - 7} 130 l5-9 3 4 2-3 5 8z" />`,
  "PATH-04": (x) => `<path d="M${x - 7} 130 c3 0 6-1 8-5 1-2 2-4 5-5 -1 3 -1 7 1 10" />`,
  "PATH-05": (x) => `<circle cx="${x}" cy="125" r="2"/><circle cx="${x}" cy="125" r="5.5"/>`,
  "PATH-06": (x) => `<circle cx="${x}" cy="125" r="6"/><path d="M${x} 119 l2 6 -2 6 -2 -6z" />`,
  "PATH-07": (x) => `<path d="M${x - 6} 131 v-6 l6-5 6 5 v6z M${x - 2} 131 v-3 h4 v3" />`,
  "PATH-08": (x) => `<path d="M${x} 119 v7 M${x} 126 c-2 2-4 3-6 5 M${x} 126 c2 2 4 3 6 5 M${x} 126 v5" />`,
};

export default function PathwayStamp({ id, size = 210, rotate = -4, seed = 31, ink, voyage = false, className = "" }: {
  id: PathwayId; size?: number; rotate?: number; seed?: number;
  /** the ink colour: the record's ivory on a night surface; the pathway's accent by default */
  ink?: string;
  /** print the voyage line ("Island hopping, diving and snorkel voyages") in place of the setting */
  voyage?: boolean; className?: string;
}) {
  const p = PATHWAYS[id];
  const fid = `pws${id.slice(-2)}${seed}`;
  const name = p.name.toUpperCase();
  const sub = (voyage && VOYAGE_LINES[id]) || p.setting;
  const shown = sub.length > 30 ? p.setting : sub;
  const svg = `<svg viewBox="0 0 240 150" width="${size}" height="${Math.round(size * 150 / 240)}" role="img" aria-label="Wild Pathways stamp: ${p.name}, ${sub}" style="color:${ink ?? p.accent};overflow:visible"><defs>${padFilter(fid, seed).replace("-3.4 0 0 0 2.55", "-1.9 0 0 0 2.05")}</defs><g filter="url(#${fid})" fill="none" stroke="currentColor">
<rect x="4" y="4" width="232" height="142" stroke-width="3.4"/><rect x="11" y="11" width="218" height="128" stroke-width="1"/>
<text x="120" y="30" text-anchor="middle" font-family="${MONO}" font-size="9" textLength="188" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">JAMES WILD &amp; CO · WILD PATHWAYS</text>
<path d="M28 38 H212" stroke-width="1"/>
<text x="120" y="62" text-anchor="middle" font-family="${MONO}" font-size="10" letter-spacing="3" fill="currentColor" stroke="none">${id.replace("-", " ")}</text>
<text x="120" y="96" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${name.length > 16 ? 25 : 30}" textLength="${Math.min(196, name.length * 12.5)}" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">${name}</text>
<path d="M28 108 H212" stroke-width="1"/>
<g stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${MARK[id](38)}${MARK[id](202)}</g>
<text x="120" y="130" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-weight="600" font-size="13.5" textLength="${Math.min(140, shown.length * 6)}" lengthAdjust="spacingAndGlyphs" fill="currentColor" stroke="none">${shown}</text>
</g></svg>`;
  return <span className={`jw-press ${/\b(hidden|inline-flex)\b/.test(className) ? "" : "inline-flex "}${className}`} style={{ flex: "none", transform: `rotate(${rotate}deg)`, ["--jw-rot" as string]: `${rotate}deg` }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
