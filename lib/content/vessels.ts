// Vessels filed in the Stay library (James, 1 Nov 2026): boats belong in Voyages, not Stays.
// The single source of truth for "this record is a vessel": the slugs below, plus any Base44
// Stay whose category is "cruise". Every Stays surface (index, country and region lists and
// counts, map pins, sister lodges, pathways stay lists, Compass, sitemap, llms.txt) reads
// STAYS from lib/content/stays.ts, which drops vessels with `withoutVessels`.
//
// Until each vessel gets a ship page in its country pass, its /stays/<slug> page stays up,
// labelled "Voyage" and noindex. A vessel with `ship` set already has /voyages/ships/<ship>,
// and its stay URL 301s there (redirects.json). Pure module: no JSON imports, so tests load it.

export type VesselWaters = "galapagos" | "indonesia" | "amazon" | "elsewhere";
export type Vessel = { slug: string; name: string; kind: string; waters: VesselWaters; ship?: string };

export const VESSEL_WATERS: Record<VesselWaters, { name: string; country: string | null }> = {
  indonesia: { name: "Indonesia", country: "Indonesia" },
  galapagos: { name: "The Galápagos", country: "Ecuador" },
  amazon: { name: "The Peruvian Amazon", country: "Peru" },
  elsewhere: { name: "Other waters", country: null },
};

export const VESSELS: Vessel[] = [
  { slug: "aliikai-voyage", name: "Aliikai", kind: "phinisi", waters: "indonesia", ship: "aliikai" },
  { slug: "celestia-yacht", name: "Celestia", kind: "phinisi yacht", waters: "indonesia" },
  { slug: "silolona-sojourns", name: "Silolona", kind: "phinisi yacht", waters: "indonesia" },
  { slug: "mutiara-laut", name: "Mutiara Laut", kind: "wooden schooner", waters: "indonesia" },
  { slug: "ecoventura-evolve-yacht", name: "Ecoventura Evolve", kind: "yacht", waters: "galapagos" },
  { slug: "ecoventura-origin-yacht", name: "Ecoventura Origin", kind: "yacht", waters: "galapagos" },
  { slug: "ecoventura-theory-yacht", name: "Ecoventura Theory", kind: "yacht", waters: "galapagos" },
  { slug: "alya-catamaran-galapagos", name: "Galaxy Alya", kind: "catamaran", waters: "galapagos" },
  { slug: "sirius-yacht-galapagos", name: "Galaxy Sirius", kind: "yacht", waters: "galapagos" },
  // andbeyond.com files her in the Peruvian Amazon (the library record says Brazil; flagged in Stay Studio).
  { slug: "beyond-amazon-explorer", name: "andBeyond Amazon Explorer", kind: "river expedition yacht", waters: "amazon" },
];

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
