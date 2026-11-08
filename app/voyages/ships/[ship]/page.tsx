import { notFound } from "next/navigation";
import RecordShip from "@/components/ships/RecordShip";
import { aliikaiExtra } from "@/components/ships/AliikaiShip";
import { StayBeforeYouSail } from "@/components/stays/IndonesiaPairings";
import CharterJourneys from "@/components/ships/CharterJourneys";
import { JOURNEY_FLEETS, sailsJourneys } from "@/lib/content/ships/journeys";
import { FILMS } from "@/lib/content/films";
import { SHIPS, shipBySlug, shipPath, sistersOf } from "@/lib/content/ships";
import { buildMetadata } from "@/lib/seo";
import { exceptionalFewForVessel } from "@/lib/content/exceptional-few";
import FounderOcean from "@/components/advisor/FounderOcean";
import { founderOceanForVoyage } from "@/lib/content/founder-ocean";
import SeeIn3D from "@/components/maps/terrain/SeeIn3D";
import { routeViewsOn, terrainWaters } from "@/components/maps/terrain/flag";
import { volumeMark } from "@/lib/volumes";
import type { ShipRecord } from "@/lib/content/ships/types";
import { readRoute, shipRouteId } from "@/lib/content/ships/routes";
import { terrainRoute } from "@/components/maps/terrain/routed";

// /voyages/ships/<ship>: every vessel on the one shared ship template
// (components/ships/RecordShip): the ship, her day by day, cabins, deck plan and
// every published departure. Aliikai brings her own sections through `extra`.
// The old Aliikai URL (/stays/aliikai-voyage) 301s here (redirects.json).
export const dynamicParams = false;
export function generateStaticParams() { return SHIPS.map((s) => ({ ship: s.slug })); }
type P = { params: Promise<{ ship: string }> };

export async function generateMetadata({ params }: P) {
  const e = shipBySlug((await params).ship);
  if (!e) return {};
  const s = e.data;
  // Aliikai's share image is her film poster; her copy was approved on the Ledger Proofs sheet, 27 Oct 2026.
  const image = e.slug === "aliikai" ? { url: FILMS.aliikai.poster, alt: FILMS.aliikai.alt } : { url: s.hero.url, alt: s.hero.alt };
  return { ...buildMetadata({ title: s.seo.title.replace(/\s*\|\s*James Wild & Co$/, ""), description: s.seo.description, path: shipPath(s.slug), image }), keywords: s.seo.keywords };
}

export default async function ShipPage({ params }: P) {
  const e = shipBySlug((await params).ship);
  if (!e) notFound();
  // The Exceptional Few™: a published vessel designation brings the entrance (Hermes No. 002, Amandira No. 003).
  // Indonesia cross-sell (B7): "Stay before you sail" after the ship, for the Indonesian yachts.
  // James's card with his surf and dive line on Aliikai and the Galápagos ships (James, 2 Nov 2026).
  const base = e.slug === "aliikai" ? aliikaiExtra() : {};
  const sail = <StayBeforeYouSail vessel={e.slug} name={e.data.name} />;
  // The signature charter journeys (James, 2 Nov 2026) on the Rascal Voyages and Silolona Sojourns yachts.
  const fleet = JOURNEY_FLEETS.find((f) => f.ships.includes(e.slug));
  const journeys = sailsJourneys(e.slug) ? <CharterJourneys ship={e.data.name} ships={[e.slug]} partner={fleet?.partner} /> : null;
  const ocean = founderOceanForVoyage(shipPath(e.slug), e.waters);
  // 3D terrain (components/maps/terrain/flag.ts): Natural Paradise's volcano weeks (the 3 Nov pilot), then every ship in
  // the 3D waters (James, 8 Nov 2026: Galapagos, Antarctica, Fiji), each week on its own routed line round the islands.
  const t3d = (() => {
    const rec = e.data as ShipRecord;
    const pilot = e.slug === "natural-paradise-yacht";
    if (!pilot && !terrainWaters(e.waters)) return null;
    const dayed = (rec.itineraries ?? []).filter((i) => i.days.length);
    const weeks = pilot ? dayed.filter((i) => i.nights === 7).reverse() : dayed.filter((i) => readRoute(shipRouteId(rec, i)));
    if (!weeks.length) return null;
    const routes = weeks.map((w) => terrainRoute(w.name.split(":")[0], readRoute(shipRouteId(rec, w)), w.days.map((d) => ({ day: d.day, name: d.place, lat: d.lat, lng: d.lng, mode: d.mode }))));
    const where = e.waters === "galapagos" ? "in the Galapagos" : e.waters === "fiji" ? "in Fiji" : e.waters === "indonesia" ? "in Indonesia" : "in Antarctica";
    // One frame, two views (James, 8 Nov 2026): where every itinerary of the day log has its 3D route, in the same order,
    // the 3D map opens in the chart's frame behind a "3D Flyover | Itinerary Chart" switch (routeViewsOn, flag.ts).
    // every itinerary of the log with its route, in log order (Natural Paradise's two weeks included)
    const all = dayed.filter((i) => readRoute(shipRouteId(rec, i)));
    if (all.length === dayed.length && routeViewsOn()) {
      const inOrder = all.map((w) => terrainRoute(w.name.split(":")[0], readRoute(shipRouteId(rec, w)), w.days.map((d) => ({ day: d.day, name: d.place, lat: d.lat, lng: d.lng, mode: d.mode }))));
      return { pilot, routes: inOrder, where, inFrame: true };
    }
    return { pilot, routes, where, inFrame: false };
  })();
  const terrainProps = t3d ? { kind: "voyage" as const, ink: volumeMark("voyages"), title: `${e.data.name} ${t3d.where}`, exaggeration: 1.8, routes: t3d.routes, id: "see-in-3d" } : null;
  const terrain = t3d && terrainProps && !t3d.inFrame
    ? <SeeIn3D page={t3d.pilot ? "voyages/ships/natural-paradise-yacht" : "voyages/ships"} {...terrainProps} intro={t3d.pilot
      ? "Both 8-day weeks over the islands themselves: Isabela's and Fernandina's shield volcanoes, Santa Cruz's highlands and the low eastern islands, with the yacht's line drawn day by day."
      : `Every itinerary over the real terrain, the line drawn day by day round the islands as the ship sails it.${t3d.routes.length > 1 ? " Pick an itinerary to fly it." : ""}`} />
    : null;
  const itineraryTerrain = t3d?.inFrame && terrainProps ? terrainProps : undefined;
  return <RecordShip entry={e} sisters={sistersOf(e)} extra={{ ...base, itineraryAfter: terrain, itineraryTerrain, after: <>{base.after}{journeys}{sail}{ocean && <FounderOcean line={ocean} place={e.data.name} />}</> }} ef={exceptionalFewForVessel(e.slug)} />;
}
