import type { ReactNode } from "react";
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
import HouseOpening from "@/components/opening/HouseOpening";
import { shipOpening } from "@/lib/content/opening/build";
import VoyageSignals from "@/components/ships/VoyageSignals";
import EitherSide from "@/components/ships/EitherSide";
import { PassportStamp } from "@/components/ledger/VolumeKit";
import { offersFor, offerEnd } from "@/lib/content/offers/offers";
import SignatureEdition from "@/components/ships/SignatureEdition";
import { timelessVoyageFor, type TimelessVoyage } from "@/lib/content/timeless-voyages";

// The ship page body, shared by /voyages/ships/<ship> and the opening previews (app/preview/voyages/*).
export default async function ShipPageBody({ slug, opening: given, surface: givenSurface, tones: givenTones, timeless }: { slug: string; opening?: ReactNode; surface?: string; tones?: import("@/components/opening/Tones").Tones; /** A draft Timeless Voyages row, for the noindex previews only. */ timeless?: TimelessVoyage }) {
  const e = shipBySlug(slug);
  if (!e) notFound();
  let opening = given, surface = givenSurface, tones = givenTones;
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
    const where = e.waters === "galapagos" ? "in the Galapagos" : e.waters === "fiji" ? "in Fiji" : e.waters === "tahiti" ? "in French Polynesia" : e.waters === "indonesia" ? "in Indonesia" : "in Antarctica";
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
  // The house opening and tones on every ship page (James, 9 Nov 2026: "deploying all cruises with the new approved blend
  // design"), built from the record (lib/content/opening/build.ts). The Exceptional Few keep their own entrance.
  const auto = !opening && !exceptionalFewForVessel(e.slug) ? shipOpening(e) : null;
  if (auto) {
    const { next, ...o } = auto;
    // The cruise stamps (James, 11 Nov 2026: "the updated badges ... stamps and savings"), pressed straight onto the night
    // panel in the page's sand ink as the stays' Ledger stamp is: "Founder sailed" where James has been aboard, and an
    // On the Horizon savings stamp while a partner offer is live, with the date it ends.
    const rec0 = e.data as ShipRecord;
    const ink = o.palette.sand ?? o.palette.hi;
    const sailed = /^founder sailed/i.test(rec0.proofLine ?? "");
    const year = (rec0.proofLine ?? "").match(/\b(19|20)\d{2}\b/)?.[0] ?? rec0.founder?.proof?.match(/\b(19|20)\d{2}\b/)?.[0];
    const live = e.offerRefs.flatMap((r) => offersFor(r));
    const ends = live.map((x) => offerEnd(x)).sort()[0];
    const endWords = ends ? new Date(`${ends}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";
    const book = live.some((x) => x.bookingWindow);
    const badge = sailed || live.length ? (
      <span className="inline-flex flex-wrap items-center gap-4">
        {sailed && <PassportStamp volume="voyages" top="Founder sailed" date={year ?? (rec0.proofLine ?? "").match(/\b(\d{1,2}) (days|nights)\b/)?.[0] ?? "Aboard"} place={rec0.name} size={120} rotate={-4} ink={ink} />}
        {live.length > 0 && <a href="#offers" aria-label={`${live.length} live ${live.length === 1 ? "offer" : "offers"} on ${rec0.name}`}><PassportStamp volume="voyages" top="On the Horizon" date="Savings" place={endWords ? `${book ? "Book by" : "Until"} ${endWords}` : rec0.operator} size={120} rotate={3} ink={ink} /></a>}
      </span>
    ) : undefined;
    opening = <HouseOpening {...o} next={next} badge={badge} voyage />; surface = o.palette.day; tones = tones ?? { palette: o.palette };
  }
  // At a glance with the icon legend, and "Either side of the voyage" (James, 9 Nov 2026: "a comprehensive icon legend",
  // pre and post cruise stays, "yes to the house stays vs the cruise ship one"). The Exceptional Few keep their own signals.
  const ef = exceptionalFewForVessel(e.slug);
  const rec = e.data as ShipRecord;
  const traits = (e.reg as { traits?: { activities?: import("@/lib/content/ships/registry").Activity[] } }).traits;
  const glance = !ef ? <VoyageSignals ship={rec} activities={traits?.activities ?? []} charter={!!e.reg.charter?.whole} waters={e.waters} /> : null;
  const firstVoyage = rec.itineraries.find((i) => i.days.length)?.name.replace(/,\s*\d+ nights$/, "") ?? rec.name;
  const either = <EitherSide slug={e.slug} waters={e.waters} ship={rec.name} voyage={firstVoyage} />;
  // Timeless Voyages · Signature Edition (James, 13 Nov 2026): switched on by her published Timeless Voyages row. Never on
  // an Exceptional Few ship, whose own entrance always wins.
  const tv = timeless ?? timelessVoyageFor(e.slug);
  const sigPalette = tv?.signatureEdition && !ef ? (shipOpening(e)?.palette ?? null) : null;
  const signature = tv && sigPalette ? <SignatureEdition ship={rec} tv={tv} night={sigPalette.night} ink={sigPalette.sand ?? sigPalette.hi} /> : null;
  return <RecordShip entry={e} sisters={sistersOf(e)} extra={{ ...base, opening, surface, tones, itineraryAfter: terrain, itineraryTerrain, top: <>{base.top}{signature}{glance}</>, after: <>{either}{base.after}{journeys}{sail}{ocean && <FounderOcean line={ocean} place={e.data.name} />}</> }} ef={ef} />;
}
