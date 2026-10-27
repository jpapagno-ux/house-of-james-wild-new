import { CHART_RAJA_AMPAT, projectRaja } from "@/lib/charts/raja-ampat";

// VoyageMap — the route on a Ledger chart: hatched sea, paper islands, ink
// coastline, the route as a dashed crimson line through numbered day stops.
// Server-rendered SVG. The route line already carries pathLength=1 so the
// later animation (drawing day by day as the log scrolls) is a CSS change.
export type Stop = { day: number | string; name: string; lat: number; lng: number };

export default function VoyageMap({ stops, title }: { stops: Stop[]; title: string }) {
  const C = CHART_RAJA_AMPAT;
  const pts = stops.map((s) => ({ ...s, ...projectRaja(s.lat, s.lng) }));
  const route = "M" + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
  // Repeated places (Sorong at both ends) share one marker with both days.
  const markers = Object.values(
    pts.reduce<Record<string, (typeof pts)[number] & { days: (number | string)[] }>>((acc, p) => {
      const k = p.name;
      acc[k] = acc[k] ? { ...acc[k], days: [...acc[k].days, p.day] } : { ...p, days: [p.day] };
      return acc;
    }, {}),
  );
  return (
    <figure className="ledger-chart is-drawn border ledger-rule bg-coast-mist">
      <svg viewBox={`0 0 ${C.width} ${C.height}`} className="block w-full h-auto" role="img" aria-label={title}>
        <defs>
          <pattern id="sea-hatch-ra" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(34,101,110,0.10)" strokeWidth="1" /></pattern>
        </defs>
        <rect width={C.width} height={C.height} fill="url(#sea-hatch-ra)" />
        <g stroke="rgba(45,42,38,0.12)" strokeDasharray="2 5">
          {C.lats.map((l) => <line key={l.v} x1="0" x2={C.width} y1={l.y} y2={l.y} />)}
          {C.lngs.map((l) => <line key={l.v} y1="0" y2={C.height} x1={l.x} x2={l.x} />)}
        </g>
        <path d={C.land} pathLength={1} className="chart-ink" fill="#F4F1ED" stroke="#2D2A26" strokeWidth="1.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <g fontFamily="'Playfair Display', Georgia, serif" textAnchor="middle">
          {C.labels.map((l) => <text key={l.text} x={l.x} y={l.y} fontSize={l.text === l.text.toUpperCase() ? 14 : 16} letterSpacing={l.text === l.text.toUpperCase() ? 6 : 2} fontStyle={l.text === l.text.toUpperCase() ? "normal" : "italic"} fill={l.text === l.text.toUpperCase() ? "rgba(45,42,38,0.45)" : "rgba(34,101,110,0.75)"}>{l.text}</text>)}
        </g>
        <path d={route} pathLength={1} fill="none" style={{stroke:"var(--jw-accent-hex)"}} strokeWidth="2.5" strokeDasharray="0.012 0.008" strokeLinecap="round" />
        {markers.map((m) => (
          <g key={m.name} transform={`translate(${m.x} ${m.y})`}>
            <circle r="15" style={{fill:"var(--jw-accent-hex)"}} stroke="#F4F1ED" strokeWidth="3" />
            <text y="5" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={m.days.length > 1 ? 10 : 13} fill="#F4F1ED">{m.days.join("·")}</text>
            <text x="22" y="5" fontFamily="'Playfair Display', serif" fontSize="17" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="4" paintOrder="stroke">{m.name}</text>
          </g>
        ))}
        <g fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="rgba(45,42,38,0.5)">
          {C.lats.map((l) => <text key={`t${l.v}`} x="8" y={l.y - 4}>{l.v === 0 ? "0°" : `${Math.abs(l.v)}°S`}</text>)}
          {C.lngs.map((l) => <text key={`g${l.v}`} x={l.x + 4} y={C.height - 8}>{l.v}°E</text>)}
        </g>
      </svg>
      <figcaption className="px-4 py-2.5 border-t ledger-rule bg-paper text-[12.5px] ledger-muted">Day stops in the order sailed. Positions are approximate until each day&rsquo;s coordinates are filed in the Ledger.</figcaption>
    </figure>
  );
}
