import type { ShipItinerary as Itin } from "@/lib/content/ships/types";
import { SectionHead } from "@/components/record/Sections";
import MapBoot from "@/components/journey/MapBoot";
import ItineraryScroller from "./ItineraryScroller";

// The day-by-day section of a ship page: the house route chart (jw-chart, the engine behind
// every route page: globe fly-in, the boat gliding along the route, day by day) beside the day
// log. `map.html` is the chart block (lib/content/ships/routes.ts, or a trip's engraved figure);
// its routes are in the same order as the itineraries with days, so R0, R1… match the tabs.
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";

export default function ShipItinerary({ ship, itineraries: given, map, title, intro, eyebrow = "The voyage, day by day", routesNote, combinations }: { ship: string; itineraries: Itin[]; map: { html: string; figCss?: string } | null; title: string; intro?: string; eyebrow?: string; routesNote?: string; combinations?: { name: string; nights: number }[] }) {
  // An itinerary without days: a private charter (route set with the guest), or a route the
  // operator publishes no day by day for ("ask us"), never an invented one.
  const charters = given.filter((i) => !i.days.length && /charter/i.test(`${i.name} ${i.direction}`));
  const undated = given.filter((i) => !i.days.length && !/charter/i.test(`${i.name} ${i.direction}`));
  const itineraries = given.filter((i) => i.days.length > 0);
  // No readable day by day at all (Monserrat): the routes by name and length, and the combinations the
  // operator sells, so the section still answers "where and how long", never an invented day.
  if (!itineraries.length && undated.length) return (
    <section id="itinerary" className={SEC}>
      <SectionHead eyebrow="The routes" title={`Which Routes Does ${ship} Sail?`} icon="wave" intro={routesNote} />
      <ul className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-4">
        {undated.map((c) => <li key={c.name} className="border ledger-border p-4"><p className="ledger-display text-[19px] leading-snug">{c.name.replace(/,\s*\d+ nights$/, "")}</p>{c.nights ? <p className="mt-1 text-[14px] ledger-muted">{c.nights} nights</p> : null}</li>)}
      </ul>
      {combinations && combinations.length > 0 && (
        <div className="mt-6">
          <p className="ledger-eyebrow">Sailed back to back</p>
          <ul className="mt-2 flex flex-wrap gap-2">{combinations.map((c) => <li key={c.name} className="border ledger-border px-3 py-2 text-[14px] whitespace-nowrap"><strong className="font-medium">{c.name}</strong> · {c.nights} nights</li>)}</ul>
        </div>
      )}
    </section>
  );
  if (!itineraries.length) return null;
  const list = itineraries.map((it) => ({
    name: it.name,
    direction: it.direction,
    // A route the operator gives as ordered stops with no length keeps nights null (never a count from the stops).
    nights: it.nights ?? (it.days.some((d) => d.label?.startsWith("Stop")) ? null : it.days.length - 1),
    days: it.days.map((d) => ({ day: d.day, title: d.title, place: d.place, summary: d.summary, label: d.label, indicative: d.indicative })),
  }));
  return (
    <section id="itinerary" className={SEC}>
      <SectionHead eyebrow={eyebrow} title={title} icon="wave" intro={intro} />
      {undated.map((c) => <p key={c.name} className="mt-5 border-l-2 border-crimson pl-4 text-[15px] max-w-3xl"><span className="ledger-eyebrow block mb-1">{c.name}{c.nights ? `, ${c.nights} nights` : ""}</span>The operator publishes no day by day for this route; ask us and James will send it.</p>)}
      {charters.map((c) => <p key={c.name} className="mt-5 border-l-2 border-crimson pl-4 text-[15px] max-w-3xl"><span className="ledger-eyebrow block mb-1">{c.name}</span>The route of a private charter ({c.direction}) is set with you; the chart follows the published {itineraries.length > 1 ? "routes" : "route"} she sails.</p>)}
      {map && <link rel="stylesheet" href="/maps/jw-maps.css" precedence="default" />}
      {map?.figCss && <link rel="stylesheet" href={map.figCss} precedence="default" />}
      <ItineraryScroller ship={ship} itineraries={list} map={map ? <div className="ship-route sticky top-[124px] [html[data-chrome=tucked]_&]:top-[48px] lg:top-[228px] z-10 bg-paper transition-[top] duration-300" dangerouslySetInnerHTML={{ __html: map.html }} /> : null} />
      {map && <MapBoot />}
    </section>
  );
}
