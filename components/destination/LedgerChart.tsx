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
  /** Drawn across the antimeridian (Fiji, Tahiti, Oceania): western longitudes are shifted +360. */
  readonly wrap?: boolean;
  readonly focus: string;
  readonly neighbors: readonly { readonly name: string; readonly d: string }[];
  readonly labels: { readonly country: Pt; readonly neighbors: readonly Pt[]; readonly seas: readonly Pt[]; readonly areas: readonly Pt[] };
  readonly lats: readonly { readonly v: number; readonly y: number }[];
  readonly lngs: readonly { readonly v: number; readonly x: number }[];
  /** Flyover landing charts only: salt flats, reserves, a route, marks and UNESCO sites (outlines indicative). */
  readonly overlays?: ChartOverlays;
};
type Shape = { readonly name: string; readonly d: string; readonly x: number; readonly y: number; readonly box?: readonly [number, number, number, number] };
export type ChartOverlays = {
  readonly salt: readonly Shape[];
  readonly reserves: readonly Shape[];
  readonly route: string | null;
  readonly marks: readonly { readonly text: string; readonly x: number; readonly y: number; readonly kind: string }[];
  readonly countries: readonly Pt[];
  readonly unesco: readonly { readonly id: string; readonly name: string; readonly label?: string; readonly year: number; readonly x: number; readonly y: number }[];
};
type Chart = ChartData;

/** The UNESCO mark used on every chart: a small temple front in a ring, in Ledger ink. */
export function UnescoMark({ x = 0, y = 0, r = 9 }: { x?: number; y?: number; r?: number }) {
  const k = r / 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} aria-hidden="true">
      <circle r="9" fill="#F4F1ED" stroke="#2D2A26" strokeWidth="1.2" />
      <path d="M-5 -1.5 L0 -5 L5 -1.5 Z M-4 -0.5 V3.5 M-1.3 -0.5 V3.5 M1.3 -0.5 V3.5 M4 -0.5 V3.5 M-5.2 4.5 H5.2" fill="none" stroke="#2D2A26" strokeWidth="1.1" strokeLinejoin="round" />
    </g>
  );
}

function Overlays({ o }: { o: ChartOverlays }) {
  return (
    <g>
      {o.reserves.map((r) => <path key={r.name} d={r.d} className="chart-fade" fill="rgba(45,42,38,0.05)" stroke="rgba(45,42,38,0.55)" strokeWidth="1.2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />)}
      {o.salt.map((r) => <path key={r.name} d={r.d} className="chart-fade" fill="url(#salt-crust)" stroke="rgba(45,42,38,0.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {o.route && <path d={o.route} className="chart-fade" fill="none" stroke="#2D2A26" strokeOpacity="0.7" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
      <g className="chart-fade" fontFamily="'Cormorant Garamond', Georgia, serif" textAnchor="middle">
        {o.countries.map((l) => <text key={l.text} x={l.x} y={l.y} fontSize="15" letterSpacing="7" fill="rgba(45,42,38,0.45)">{l.text}</text>)}
        {o.salt.map((r) => <text key={r.name} x={r.x} y={r.y + 5} fontSize="15" fontStyle="italic" fill="rgba(45,42,38,0.8)" stroke="#FBFAF7" strokeWidth="3" paintOrder="stroke">{r.name}</text>)}
        {o.reserves.map((r) => <text key={r.name} x={r.x} y={r.y + 4} fontSize="13" fontStyle="italic" fill="rgba(45,42,38,0.7)" stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{r.name}</text>)}
        {o.marks.map((m) => (
          <g key={m.text}>
            {m.kind === "town" && <circle cx={m.x} cy={m.y} r="3.2" fill="#2D2A26" />}
            {m.kind === "peak" && <path d={`M${m.x - 5} ${m.y + 4} L${m.x} ${m.y - 5} L${m.x + 5} ${m.y + 4} Z`} fill="none" stroke="#2D2A26" strokeWidth="1.1" />}
            {m.kind !== "airport" && m.kind !== "town" && m.kind !== "peak" && <circle cx={m.x} cy={m.y} r="2.4" fill="none" stroke="#2D2A26" strokeWidth="1" />}
            <text x={m.x + (m.kind === "airport" ? 0 : 8)} y={m.y + (m.kind === "airport" ? 16 : m.kind === "peak" ? -7 : 4)} textAnchor={m.kind === "airport" ? "middle" : "start"} fontSize="12.5"
              fontStyle={m.kind === "water" ? "italic" : "normal"} fill={m.kind === "water" ? "rgba(34,101,110,0.9)" : "rgba(45,42,38,0.85)"} stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{m.text}</text>
          </g>
        ))}
      </g>
      <g className="chart-fade">
        {o.unesco.map((u) => (
          <g key={u.id}>
            <title>{`${u.name} · UNESCO World Heritage, ${u.year}`}</title>
            <UnescoMark x={u.x} y={u.y} />
            <text x={u.x + 13} y={u.y + 4} fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="12.5" fill="rgba(45,42,38,0.85)" stroke="#F4F1ED" strokeWidth="3" paintOrder="stroke">{u.label ?? u.name}</text>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Project a coordinate onto any Ledger chart (equirectangular, mid-latitude scaled). */
export function projectOn(chart: ChartData, lat: number, lng: number) {
  const B = chart.bounds;
  const kx = chart.kx ?? chart.width / (B.e - B.w);
  const ky = chart.ky ?? kx / Math.cos(((B.s + B.n) / 2) * Math.PI / 180);
  const L = chart.wrap && lng < 0 ? lng + 360 : lng;
  return { x: (L - B.w) * kx, y: (B.n - lat) * ky };
}

export default function LedgerChart({ chart = CHART_COSTA_RICA, title, bare = false }: { chart?: Chart; title: string; /** Draw as a <g> inside a parent SVG (the flyover animates the parent viewBox). */ bare?: boolean }) {
  const { width: W, height: H } = chart;
  const body = (
    <>
      <defs>
        <pattern id="sea-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(34,101,110,0.10)" strokeWidth="1" />
        </pattern>
        {chart.overlays && (
          <pattern id="salt-crust" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#FBFAF7" />
            <path d="M0 5 L5 0 M5 10 L10 5" stroke="rgba(45,42,38,0.12)" strokeWidth="0.8" />
          </pattern>
        )}
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

      {chart.overlays && <Overlays o={chart.overlays} />}

      <g className="chart-fade" fontFamily="'Cormorant Garamond', Georgia, serif" textAnchor="middle">
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
    </>
  );
  return bare ? <g role="img" aria-label={title}>{body}</g> : (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto" role="img" aria-label={title}>
      {body}
    </svg>
  );
}
