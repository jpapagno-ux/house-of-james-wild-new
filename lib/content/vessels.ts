// Vessels filed in the Stay library (James, 1 Nov 2026): boats belong in Voyages, not Stays.
// The single source of truth for "this record is a vessel": the slugs below, plus any Base44
// Stay whose category is "cruise". Every Stays surface (index, country and region lists and
// counts, map pins, sister lodges, pathways stay lists, Compass, sitemap, llms.txt) reads
// STAYS from lib/content/stays.ts, which drops vessels with `withoutVessels`.
//
// Until each vessel gets a ship page in its country pass, its /stays/<slug> page stays up,
// labelled "Voyage" and noindex. A vessel with `ship` set already has /voyages/ships/<ship>,
// and its stay URL 301s there (redirects.json). Pure module: no JSON imports, so tests load it.

import { SHIP_REGISTRY } from "./ships/registry.ts";

export type VesselWaters = "galapagos" | "indonesia" | "amazon" | "elsewhere";
export type Vessel = { slug: string; name: string; kind: string; waters: VesselWaters; ship?: string };

export const VESSEL_WATERS: Record<VesselWaters, { name: string; country: string | null }> = {
  indonesia: { name: "Indonesia", country: "Indonesia" },
  galapagos: { name: "The Galápagos", country: "Ecuador" },
  amazon: { name: "The Peruvian Amazon", country: "Peru" },
  elsewhere: { name: "Other waters", country: null },
};

// Built from the ships registry (lib/content/ships/registry.ts): every registry ship filed in the
// Stay library is a vessel here, and one with a ship page points its stay URL there.
export const VESSELS: Vessel[] = SHIP_REGISTRY.filter((s) => s.staySlug).map((s) => ({
  slug: s.staySlug!, name: s.name, kind: s.kind, waters: (s.waters[0] === "nile" ? "elsewhere" : s.waters[0]) as VesselWaters, ...(s.page ? { ship: s.slug } : {}),
}));

export const VESSEL_SLUGS = new Set(VESSELS.map((v) => v.slug));
export const vessel = (slug: string) => VESSELS.find((v) => v.slug === slug);

type Row = { slug: string; category?: string | null };
/** True for a vessel: listed above, or filed in the library with category "cruise". */
export const isVessel = (s: Row) => VESSEL_SLUGS.has(s.slug) || s.category === "cruise";
export const withoutVessels = <T extends Row>(rows: T[]) => rows.filter((s) => !isVessel(s));
export const onlyVessels = <T extends Row>(rows: T[]) => rows.filter(isVessel);

/** Where a vessel lives now: its ship page when built, else its voyage-labelled /stays page. */
export const vesselHref = (slug: string) => { const v = vessel(slug); return v?.ship ? `/voyages/ships/${v.ship}` : `/stays/${slug}`; };
/** A vessel's waters; a "cruise" record not yet listed above files under "elsewhere". */
export const watersOf = (slug: string): VesselWaters => vessel(slug)?.waters ?? "elsewhere";
