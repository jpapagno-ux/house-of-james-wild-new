import { ALIIKAI_SHIP } from "./aliikai";
import { NILE_SHIPS } from "./nile";
import type { ShipRecord } from "./types";

// Every ship with a page at /voyages/ships/<slug>. Aliikai keeps her own module
// (approved 27 Oct 2026); ships filed as data (ShipRecord JSON) list here by
// waters. To add a ship: drop its JSON in lib/content/ships/<waters>/ and add
// it to that folder's index.

export type Waters = "indonesia" | "nile";
export type ShipEntry =
  | { slug: string; kind: "aliikai"; waters: Waters; data: typeof ALIIKAI_SHIP; credit?: string; offerRefs: string[] }
  | { slug: string; kind: "record"; waters: Waters; data: ShipRecord; credit: string; offerRefs: string[] };

/** Waters with a hub page of their own (/voyages/<waters>). */
export const WATERS: Partial<Record<Waters, { name: string; path: string; country: string }>> = {
  nile: { name: "The Nile", path: "/voyages/nile", country: "Egypt" },
};

export const SHIPS: ShipEntry[] = [
  { slug: "aliikai", kind: "aliikai", waters: "indonesia", data: ALIIKAI_SHIP, offerRefs: ["aliikai"] },
  ...NILE_SHIPS.map(({ data, offerRefs }): ShipEntry => ({ slug: data.slug, kind: "record", waters: "nile", data, credit: "A&K Sanctuary", offerRefs: [data.slug, ...offerRefs] })),
];

export const shipBySlug = (slug: string) => SHIPS.find((s) => s.slug === slug);
export const shipPath = (slug: string) => `/voyages/ships/${slug}`;
export const waterFor = (e: ShipEntry) => WATERS[e.waters];
/** The other ships on the same waters (sister ships), in filing order. */
export const sistersOf = (e: ShipEntry) => SHIPS.filter((x) => x.waters === e.waters && x.slug !== e.slug && x.kind === "record");
export const shipsOn = (w: Waters) => SHIPS.filter((x) => x.waters === w && x.kind === "record").map((x) => x.data as ShipRecord);
