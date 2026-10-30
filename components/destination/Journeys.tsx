import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Anchor, Route as RouteIcon } from "lucide-react";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import OverlandStamp from "@/components/ledger/OverlandStamp";
import JsonLd from "@/components/ledger/JsonLd";
import { Stamp } from "@/components/ledger/Marks";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import { graph, touristTrip } from "@/lib/schema";
import type { Journey } from "@/lib/content/preview/journeys";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { CHART_CENTRAL_AMERICA } from "@/lib/charts/central-america";

// Each route draws on its own country's chart; a page-level chart is the fallback.
const CHARTS: Record<string, ChartData> = { "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA, "central-america": CHART_CENTRAL_AMERICA };

// Journeys & voyages on a destination page: one card per Overland route and
// per small-ship voyage filed for the country, linked to its own page. Routes
// draw their own mini route on the country's Ledger chart when one exists.
// Renders nothing when a destination has none yet.

// Link guard: a card links only when its page is built (always in previews).
function Wrap({ linked, href, event, sea, children }: { linked: boolean; href: string; event: string; sea?: boolean; children: React.ReactNode }) {
  const cls = `group h-full bg-paper border ledger-border flex flex-col${sea ? " theme-sea" : ""}`;
  return linked ? <Link href={href} className={`${cls} hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition duration-300`} data-event={event}>{children}</Link> : <article className={cls}>{children}</article>;
}

function MiniRoute({ chart, stops, title }: { chart: ChartData; stops: { lat: number; lng: number }[]; title: string }) {
  const pts = stops.map((s) => projectOn(chart, s.lat, s.lng));
  const legs = pts.slice(1, pts.length - (stops.length > 2 && stops[0].lat === stops[stops.length - 1].lat ? 1 : 0));
  return (
    <div className="relative ledger-chart is-drawn">
      <LedgerChart chart={chart} title={`Route map: ${title}`} />
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#8B2525" strokeWidth="5" strokeDasharray="12 9" strokeLinejoin="round" />
        <rect x={pts[0].x - 10} y={pts[0].y - 10} width="20" height="20" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="3" />
        {legs.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="20" fill="#8B2525" stroke="#F4F1ED" strokeWidth="3" /><text x={p.x} y={p.y + 7} textAnchor="middle" fontSize="20" fill="#F4F1ED" fontFamily="'IBM Plex Mono', monospace">{i + 1}</text></g>)}
      </svg>
    </div>
  );
}

export function JourneyCard({ j, chart: fallback }: { j: Journey; chart?: ChartData }) {
  const isRoute = j.kind === "route";
  const chart = (j.chartKey && CHARTS[j.chartKey]) || fallback;
  const linked = !GUARD_ON || isBuilt(j.href);
  return (
    <Wrap linked={linked} href={j.href} sea={!isRoute} event={isRoute ? "destination_route_open" : "destination_voyage_open"}>
      <div className="relative border-b ledger-rule overflow-hidden">
        {isRoute && j.stops && chart ? (
          <MiniRoute chart={chart} stops={j.stops} title={j.title} />
        ) : (
          <div className="relative aspect-[4/3] bg-paper-card">{j.image && <Image src={j.image} alt={`${j.title}: ${j.line}`} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}</div>
        )}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${isRoute ? "bg-paper/95 text-crimson" : "bg-sea-deep text-paper"}`}>
          {isRoute ? <RouteIcon className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" /> : <Anchor className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />}
          {isRoute ? "Overland route" : "Small-ship voyage"}
        </span>
        {j.status === "founder_traveled" && (
          <span className="absolute top-2 right-2 w-[86px] h-[86px] rounded-full bg-paper/95 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            {isRoute ? <OverlandStamp tested year={j.statusYear ?? undefined} className="w-full h-full" /> : <Stamp kind="Field verified" year={j.statusYear ?? undefined} volume="voyages" size={78} />}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="ledger-eyebrow ledger-crimson">{j.eyebrow}</p>
        <h3 className="ledger-display text-2xl mt-1 leading-snug">{j.title}</h3>
        <p className="mt-2 text-[14.5px] leading-snug">{j.line}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
          {j.nights && <div><dt className="ledger-eyebrow">Nights</dt><dd>{j.nights}</dd></div>}
          {j.bestMonths && <div><dt className="ledger-eyebrow">Best</dt><dd className="leading-snug">{j.bestMonths}</dd></div>}
        </dl>
        {j.price && <p className="mt-3"><span className="ledger-eyebrow">From </span><span className="ledger-display text-xl ledger-crimson">US${j.price.amount.toLocaleString("en-US")}</span> <span className="text-[12px] ledger-muted">{j.price.basis}</span></p>}
        {j.status === "house_approved" && <p className="mt-3 text-[12.5px] ledger-muted">House route · approved by James{j.statusYear ? `, ${j.statusYear}` : ""}</p>}
        {linked ? <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[15px] group-hover:gap-2.5 transition-all">{isRoute ? "Open the route" : "Open the voyage"} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span> : <span className="mt-auto pt-4 ledger-eyebrow">{isRoute ? "Route page coming soon" : "Voyage page coming soon"}</span>}
      </div>
    </Wrap>
  );
}

export default function Journeys({ country, journeys, chart, id = "journeys" }: { country: string; journeys: Journey[]; chart?: ChartData; id?: string }) {
  if (!journeys.length) return null;
  const routes = journeys.filter((j) => j.kind === "route").length;
  const voyages = journeys.length - routes;
  const count = [routes ? `${routes} overland ${routes === 1 ? "route" : "routes"}` : "", voyages ? `${voyages} small-ship ${voyages === 1 ? "voyage" : "voyages"}` : ""].filter(Boolean).join(" · ");
  return (
    <section id={id} className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Journeys &amp; voyages · {count}</p>
          <h2 id={`${id}-heading`} className="ledger-display text-[1.75rem] md:text-4xl mt-2">Ways Through {country}</h2>
        </div>
        <p className="text-[16px] ledger-muted max-w-md">{voyages && !routes ? `Small-ship voyages through ${country}, with their ports in order, the ship, and the fare per person. Join a departure, or charter the whole yacht.` : routes && !voyages ? `Overland routes the house has drawn through ${country}, with the stops in order and every stay already in the Ledger. Take one as it is, or let James reshape it.` : `Overland routes and small-ship voyages through ${country}, each in order, every stay and ship already in the Ledger. Take one as it is, or let James reshape it.`}</p>
      </div>
      <ul className={`mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:gap-6 sm:grid-cols-2 ${journeys.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>
        {journeys.map((j) => <li key={j.ledgerId} className="snap-start shrink-0 w-[84%] sm:w-auto"><JourneyCard j={j} chart={chart} /></li>)}
      </ul>
      <div className="mt-6 flex flex-wrap gap-5 text-[15px]">
        {routes > 0 && <Link href="/overland" className="inline-flex items-center gap-1.5 hover:ledger-crimson">All Overland routes <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>}
        {voyages > 0 && <Link href="/voyages" className="inline-flex items-center gap-1.5 hover:ledger-crimson">All voyages <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>}
      </div>
      <JsonLd data={graph({ "@type": "ItemList", name: `Journeys and voyages in ${country}`, itemListElement: journeys.map((j, i) => ({ "@type": "ListItem", position: i + 1, item: touristTrip({ path: j.href, name: j.title, description: `${j.eyebrow}. ${j.line}.${j.nights ? ` ${j.nights} nights.` : ""}` }) })) })} />
    </section>
  );
}
