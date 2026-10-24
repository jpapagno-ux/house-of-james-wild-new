import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";

// LedgerChart — the base chart, server-rendered SVG: hatched sea in the coast
// stock, neighbours in faint paper, the country in Ledger paper with an ink
// coastline (pathLength=1 so CSS can draw it on), graticule ticks, sea,
// country and area labels. Pins are laid over it by LedgerChartMap.
type Pt = { readonly x: number; readonly y: number; readonly text: string };
export type ChartData = {
  readonly width: number; readonly height: number;
  readonly bounds: { readonly w: number; readonly e: number; readonly s: number; readonly n: number };
  readonly kx?: number; readonly ky?: number;
  readonly focus: string;
  readonly neighbors: readonly { readonly name: string; readonly d: string }[];
  readonly labels: { readonly country: Pt; readonly neighbors: readonly Pt[]; readonly seas: readonly Pt[]; readonly areas: readonly Pt[] };
  readonly lats: readonly { readonly v: number; readonly y: number }[];
  readonly lngs: readonly { readonly v: number; readonly x: number }[];
};
type Chart = ChartData;

/** Project a coordinate onto any Ledger chart (equirectangular, mid-latitude scaled). */
export function projectOn(chart: ChartData, lat: number, lng: number) {
  const B = chart.bounds;
  const kx = chart.kx ?? chart.width / (B.e - B.w);
  const ky = chart.ky ?? kx / Math.cos(((B.s + B.n) / 2) * Math.PI / 180);
  return { x: (lng - B.w) * kx, y: (B.n - lat) * ky };
}

export default function LedgerChart({ chart = CHART_COSTA_RICA, title }: { chart?: Chart; title: string }) {
  const { width: W, height: H } = chart;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label={title}>
      <defs>
        <pattern id="sea-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(34,101,110,0.10)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#E4EEEC" />
      <rect width={W} height={H} fill="url(#sea-hatch)" />

      {/* Graticule */}
      <g className="chart-fade" stroke="rgba(45,42,38,0.12)" strokeWidth="0.8" strokeDasharray="2 5">
        {chart.lats.map((l) => <line key={`lat${l.v}`} x1="0" x2={W} y1={l.y} y2={l.y} />)}
        {chart.lngs.map((l) => <line key={`lng${l.v}`} y1="0" y2={H} x1={l.x} x2={l.x} />)}
      </g>

      {chart.neighbors.map((n) => (
        <path key={n.name} d={n.d} pathLength={1} className="chart-ink chart-ink--soft" fill="#EFEBE4" stroke="rgba(45,42,38,0.35)" strokeWidth="1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={chart.focus} fillRule="evenodd" pathLength={1} className="chart-ink" fill="#F4F1ED" stroke="#2D2A26" strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      <g className="chart-fade" fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle">
        {chart.labels.seas.map((l) => <text key={l.text} x={l.x} y={l.y} fontSize="17" fontStyle="italic" letterSpacing="3" fill="rgba(34,101,110,0.75)">{l.text}</text>)}
        {chart.labels.neighbors.map((l) => <text key={l.text} x={l.x} y={l.y} fontSize="13" letterSpacing="5" fill="rgba(45,42,38,0.4)">{l.text}</text>)}
        <text x={chart.labels.country.x} y={chart.labels.country.y} fontSize="18" letterSpacing="9" fill="rgba(45,42,38,0.7)">{chart.labels.country.text}</text>
        {chart.labels.areas.map((l) => <text key={l.text} x={l.x} y={l.y} fontSize="13.5" fontStyle="italic" fill="#8B2525" stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{l.text}</text>)}
      </g>
      <g className="chart-fade" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="10" fill="rgba(45,42,38,0.5)">
        {chart.lats.map((l) => <text key={`tl${l.v}`} x="8" y={l.y - 4}>{Math.abs(l.v)}°{l.v < 0 ? "S" : "N"}</text>)}
        {chart.lngs.map((l) => <text key={`tg${l.v}`} x={l.x + 4} y={H - 8}>{Math.abs(l.v)}°{l.v < 0 ? "W" : "E"}</text>)}
      </g>
      {/* Compass */}
      <g className="chart-fade" transform={`translate(${W - 60} 64)`} stroke="#2D2A26" fill="none" strokeWidth="1">
        <circle r="26" strokeOpacity="0.35" />
        <path d="M0 -30 L6 0 L0 30 L-6 0 Z" fill="#2D2A26" fillOpacity="0.8" />
        <text y="-36" textAnchor="middle" fontSize="11" fill="#2D2A26" stroke="none" fontFamily="'IBM Plex Mono', monospace">N</text>
      </g>
    </svg>
  );
}
