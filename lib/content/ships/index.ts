import { ALIIKAI_RECORD } from "./aliikai";
import { NILE_SHIPS } from "./nile";
import { AMAZON_SHIPS } from "./amazon";
import { GALAPAGOS_SHIPS } from "./galapagos";
import { POLAR_SHIPS } from "./polar";
import { INDONESIA_SHIPS } from "./indonesia";
import { SHIP_REGISTRY, WATERS_HUBS, type RegistryShip, type Waters } from "./registry";
import type { ShipRecord } from "./types";

// Every ship with a page at /voyages/ships/<slug>, all on the one shared record
// (ShipRecord) and the one template (components/ships/RecordShip). To add a ship:
// drop its JSON in lib/content/ships/<waters>/ and add it to that folder's index.

export type { Waters };
/** A ship page: her registry row (lib/content/ships/registry.ts) joined to her filed record. */
export type ShipEntry = { slug: string; kind: "record"; waters: Waters; reg: RegistryShip; data: ShipRecord; credit?: string; offerRefs: string[] };

/** Waters with a hub page of their own (/voyages/<waters>). Hubs join this list as they are built. */
const HUBS_BUILT: Waters[] = ["nile", "amazon", "galapagos", "indonesia", "antarctica"];
export const WATERS: Partial<Record<Waters, { name: string; path: string; country: string }>> = Object.fromEntries(
  HUBS_BUILT.map((w) => [w, { name: WATERS_HUBS[w].name, path: WATERS_HUBS[w].path, country: WATERS_HUBS[w].countries.join(", ") }]),
);

const FILED: { data: ShipRecord; credit?: string; offerRefs: string[] }[] = [
  { data: ALIIKAI_RECORD, offerRefs: ["aliikai"] },
  ...NILE_SHIPS.map(({ data, offerRefs }) => ({ data, credit: "A&K Sanctuary", offerRefs: [data.slug, ...offerRefs] })),
  ...AMAZON_SHIPS,
  ...GALAPAGOS_SHIPS,
  ...POLAR_SHIPS,
  ...INDONESIA_SHIPS,
];
// Every registry ship with a page, in registry order. A page ship without a record fails the build.
export const SHIPS: ShipEntry[] = SHIP_REGISTRY.filter((r) => r.page).map((reg) => {
  const f = FILED.find((x) => x.data.slug === reg.slug);
  if (!f) throw new Error(`Ship ${reg.slug} is marked page: true in the registry but has no record`);
  return { slug: reg.slug, kind: "record", waters: reg.waters[0], reg, data: { ...f.data, pathway: reg.pathway ?? f.data.pathway ?? undefined, rateBasis: reg.rateBasis ?? f.data.rateBasis }, credit: f.credit, offerRefs: f.offerRefs };
});

export const shipBySlug = (slug: string) => SHIPS.find((s) => s.slug === slug);
export const shipPath = (slug: string) => `/voyages/ships/${slug}`;
export const waterFor = (e: ShipEntry) => WATERS[e.waters];
/** Sister ships: the same operator on the same waters, in registry order. */
export const sistersOf = (e: ShipEntry) => SHIPS.filter((x) => x.waters === e.waters && x.slug !== e.slug && x.reg.operator === e.reg.operator);
export const shipsOn = (w: Waters) => SHIPS.filter((x) => x.waters === w).map((x) => x.data);
