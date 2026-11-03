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
import { volumeMark } from "@/lib/volumes";
import type { ShipRecord } from "@/lib/content/ships/types";

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
  // 3D terrain (allow-listed page, components/maps/terrain/flag.ts): the volcanoes of the western islands under the 8-day weeks.
  const terrain = e.slug === "natural-paradise-yacht" ? (() => {
    const weeks = (e.data as ShipRecord).itineraries.filter((i) => i.days.length && i.nights === 7).reverse(); // Week B first: the western volcanoes
    return weeks.length ? <SeeIn3D page="voyages/ships/natural-paradise-yacht" kind="voyage" ink={volumeMark("voyages")} title={`${e.data.name} in the Galapagos`} exaggeration={1.8}
      routes={weeks.map((w) => ({ name: w.name.split(":")[0], stops: w.days.map((d) => ({ day: d.day, name: d.place, lat: d.lat, lng: d.lng, mode: d.mode })) }))}
      intro="Both 8-day weeks over the islands themselves: Isabela's and Fernandina's shield volcanoes, Santa Cruz's highlands and the low eastern islands, with the yacht's line drawn day by day." /> : null;
  })() : null;
  return <RecordShip entry={e} sisters={sistersOf(e)} extra={{ ...base, itineraryAfter: terrain, after: <>{base.after}{journeys}{sail}{ocean && <FounderOcean line={ocean} place={e.data.name} />}</> }} ef={exceptionalFewForVessel(e.slug)} />;
}
