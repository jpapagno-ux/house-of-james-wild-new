import Link from "next/link";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import LedgerList, { type LedgerItem } from "./LedgerList";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 9. The map block. The map itself is the house's own LedgerChart with the same pin overlay the
// stay page has always drawn (components/record/Frame.tsx, LocationBlock): unchanged. Only what sits round it is
// new: the section heading and the "getting there" ledger in the column beside it.
type Props = { no: string; name: string; chart: ChartData; pin: { lat: number; lng: number }; others?: { lat: number; lng: number }[]; rows: LedgerItem[]; note?: string | null; routes?: { href: string; title: string }[] };

export default function JournalMap({ no, name, chart, pin, others = [], rows, note, routes = [] }: Props) {
  const p = projectOn(chart, pin.lat, pin.lng);
  const right = p.x > chart.width * 0.62;
  return (
    <section id="location" aria-label="Location and getting there" className="bg-white">
      <SectionHead no={no} label="Location and getting there" title={`Where ${name} Sits`} />
      <div className="mt-9 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10 items-start">
        <div className="relative border ledger-rule overflow-hidden ledger-chart is-drawn">
          <LedgerChart chart={chart} title={`Where ${name} sits`} />
          <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
            {others.map((o, i) => { const q = projectOn(chart, o.lat, o.lng); return <circle key={i} cx={q.x} cy={q.y} r="5.5" style={{ fill: "var(--jw-accent-hex)" }} fillOpacity="0.28" stroke="#F4F1ED" strokeWidth="1.5" />; })}
            <circle cx={p.x} cy={p.y} r="28" fill="none" style={{ stroke: "var(--jw-accent-hex)" }} strokeWidth="2" className="ledger-pin-pulse" />
            <circle cx={p.x} cy={p.y} r="11" style={{ fill: "var(--jw-accent-hex)" }} stroke="#F4F1ED" strokeWidth="3" />
            <text x={right ? p.x - 20 : p.x + 20} y={p.y - 20} textAnchor={right ? "end" : "start"} fontFamily="'Cormorant Garamond', serif" fontSize="22" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="4" paintOrder="stroke">{name}</text>
          </svg>
        </div>
        <div>
          <LedgerList heading="Getting there" items={rows} />
          {note && <p className="mt-4 text-[13px] leading-relaxed text-stone-text">{note}</p>}
          {routes.length > 0 && <p className="mt-4 text-[13.5px] leading-relaxed text-stone-text">On this route: {routes.map((r, i) => <span key={r.href}>{i ? ", " : ""}<Link href={r.href} className="text-graphite underline underline-offset-4">{r.title}</Link></span>)}.</p>}
        </div>
      </div>
    </section>
  );
}
