import DATA from "./journeys.json";
import type { ShipDay, ShipImage } from "./types";
import { isPast, today } from "../../dates.ts";

// The two signature charter journeys shared by the Indonesian fleets (James, 2 Nov 2026; voyages plan,
// Part 12): Komodo and Flores, and Raja Ampat and Misool. Each is a typical week built from the
// operators' own published itineraries (Rascal Voyages' Komodo and Raja Ampat PDFs, with the places
// Silolona Sojourns names), every day marked indicative because each yacht sets her own order. Best
// seasons from Indonesia's tourism board; the dive flags are a light touch, named only where an operator
// names them. Shown on both fleets' ship and partner pages and on /voyages/indonesia as "Charter the
// whole yacht". Route files: public/maps/routes/<slug>-<nights>n.json (scripts/build-ship-maps.py).
//
// Sape Bay (Komodo day 2; the same stop in Rascal's and Rebel's 4-night itineraries): James confirmed on
// 3 Nov 2026 that the anchorage is Sape, on the east coast of Sumbawa, facing the Sape Strait. Filed at
// 8.57 S, 119.04 E, in the bay about 0.8 km off the shore: positioned from the chart coastline
// (public/maps/data/komodo/base.geojson), approximate. The Indonesian gazetteer (rupabumi.big.go.id,
// sinar.big.go.id) could not be reached to confirm it. It was filed at 8.56 S, 119.33 E, open water west of Komodo.
//
// Founder Favourite voyage (James, 2 Nov 2026): one slot per journey and partner, empty until a partner
// sends an offer; it renders only when an entry exists here and its end date has not passed.

export type DiveFlag = { name: string; day: number; lat: number; lng: number; note: string };
export type FounderFavourite = { journey: string; partner: string; title: string; line: string; validTo: string; href?: string };
export type CharterJourney = {
  slug: string; name: string; short: string; region: "komodo" | "raja-ampat"; nights: number; embark: string; line: string; answer: string; intro: string;
  hero: ShipImage; season: { best: string; by: string; url: string }; operatorSeasons: { operator: string; months: string; url: string }[];
  park: string; parkUrl: string; days: ShipDay[]; longer: string[]; dive: DiveFlag[]; faqs: [string, string][];
};
export type JourneyFleet = { operator: string; partner: string; ships: string[]; line: string };

export const JOURNEYS = DATA.journeys as unknown as CharterJourney[];
export const JOURNEY_FLEETS = DATA.fleets as JourneyFleet[];
const FAVOURITES = DATA.founderFavourite as unknown as FounderFavourite[];

export const journeyPath = (slug: string) => `/voyages/indonesia/${slug}`;
export const journeyBySlug = (slug: string) => JOURNEYS.find((j) => j.slug === slug);
export const journeyRouteId = (j: Pick<CharterJourney, "slug" | "nights">) => `${j.slug}-${j.nights}n`;
/** The ships that can sail a journey: every fleet's yachts, in fleet order. */
export const JOURNEY_SHIPS = JOURNEY_FLEETS.flatMap((f) => f.ships);
export const sailsJourneys = (ship: string) => JOURNEY_SHIPS.includes(ship);
/** A live Founder Favourite voyage for a journey (and partner), or none: the slot stays hidden until one exists. */
export const founderFavourites = (journey: string, partner?: string, on: string = today()) =>
  FAVOURITES.filter((f) => f.journey === journey && (!partner || f.partner === partner) && !isPast(f.validTo, on));
