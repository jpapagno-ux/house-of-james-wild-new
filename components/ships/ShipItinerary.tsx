import type { ShipItinerary as Itin } from "@/lib/content/ships/types";
import { SectionHead } from "@/components/record/Sections";
import MapBoot from "@/components/journey/MapBoot";
import ItineraryScroller from "./ItineraryScroller";

// The day-by-day section of a ship page: the house route chart (jw-chart, the engine behind
// every route page: globe fly-in, the boat gliding along the route, day by day) beside the day
// log. `map.html` is the chart block (lib/content/ships/routes.ts, or a trip's engraved figure);
// its routes are in the same order as the itineraries with days, so R0, R1… match the tabs.
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]";

export default function ShipItinerary({ ship, itineraries: given, map, title, intro, eyebrow = "The voyage, day by day" }: { ship: string; itineraries: Itin[]; map: { html: string; figCss?: string } | null; title: string; intro?: string; eyebrow?: string }) {
  // A private charter has no fixed days: its route is set with the guest.
  const charters = given.filter((i) => !i.days.length);
  const itineraries = given.filter((i) => i.days.length > 0);
  if (!itineraries.length) return null;
  const list = itineraries.map((it) => ({
    name: it.name,
    direction: it.direction,
    nights: it.nights ?? it.days.length - 1,
    days: it.days.map((d) => ({ day: d.day, title: d.title, place: d.place, summary: d.summary })),
  }));
  return (
    <section id="itinerary" className={SEC}>
      <SectionHead eyebrow={eyebrow} title={title} icon="wave" intro={intro} />
      {charters.map((c) => <p key={c.name} className="mt-5 border-l-2 border-crimson pl-4 text-[15px] max-w-3xl"><span className="ledger-eyebrow block mb-1">{c.name}</span>The route of a private charter ({c.direction}) is set with you; the chart follows the published {itineraries.length > 1 ? "routes" : "route"} she sails.</p>)}
      {map && <link rel="stylesheet" href="/maps/jw-maps.css" precedence="default" />}
      {map?.figCss && <link rel="stylesheet" href={map.figCss} precedence="default" />}
      <ItineraryScroller ship={ship} itineraries={list} map={map ? <div className="ship-route sticky top-[124px] lg:top-[228px] z-10 bg-paper" dangerouslySetInnerHTML={{ __html: map.html }} /> : null} />
      {map && <MapBoot />}
    </section>
  );
}
