// The 3D terrain ("See it in 3D") gate: an explicit allow-list of pages (James approved the Komodo pilot live,
// 3 Nov 2026). Each call site names its page; anything not listed renders nothing, so the MapLibre chunks never load
// there. NEXT_PUBLIC_TERRAIN_PILOT=false at build is a kill switch that turns every page off.
export const TERRAIN_PAGES = [
  "voyages/indonesia/komodo-and-flores-charter",
  "voyages/ships/natural-paradise-yacht",
  "stays/ulum-moab",
  "destinations/oceania/tahiti#tahaa",
  // Fiji place guides (James, 7 Nov 2026: "try maps on these next two"): Beqa Lagoon and the Yasawas.
  "destinations/oceania/fiji/beqa-lagoon-and-pacific-harbour",
  "destinations/oceania/fiji/yasawa-islands",
  // Site-wide voyage sweep (James, 8 Nov 2026: Galapagos and Antarctica in MapTiler 3D, every line round the islands):
  // every ship page whose waters are in TERRAIN_WATERS, and every polar voyage page.
  "voyages/ships",
  "voyages/polar",
] as const;
export type TerrainPage = (typeof TERRAIN_PAGES)[number];

/** Waters whose ship pages carry "See It in 3D" (their route files are routed round the OSM coastline). */
// Tahiti (James, 9 Nov 2026: the Windstar voyages), routed round the OSM coast like Fiji.
export const TERRAIN_WATERS = ["galapagos", "antarctica", "fiji", "indonesia", "tahiti"] as const;
export const terrainWaters = (w: string | undefined) => !!w && (TERRAIN_WATERS as readonly string[]).includes(w);

/** One frame, two views ("3D Flyover | Itinerary Chart") on every cruise page with both maps: ship pages, polar voyages,
 *  Indonesia journeys. James approved the Galaxy Sirius example and the rollout on 8 Nov 2026 ("it's a go"). The terrain
 *  kill switch (NEXT_PUBLIC_TERRAIN_PILOT=false) still turns the 3D half off everywhere, leaving the chart. */
export const routeViewsOn = (_page?: string) => process.env.NEXT_PUBLIC_TERRAIN_PILOT !== "false";

export const terrainOn = (page: string): page is TerrainPage =>
  process.env.NEXT_PUBLIC_TERRAIN_PILOT !== "false" && (TERRAIN_PAGES as readonly string[]).includes(page);

// The country atlas (Indonesia first). James said "go" to a preview on 3 Nov 2026 and then approved it going live
// ("approved all move forward"), so it shows wherever this code is deployed, production included once the PR merges.
// The terrain kill switch (NEXT_PUBLIC_TERRAIN_PILOT=false) turns it off everywhere.
export const ATLAS_COUNTRIES = ["indonesia", "botswana", "tahiti", "thailand", "fiji"] as const;
export const atlasOn = (country: string) =>
  process.env.NEXT_PUBLIC_TERRAIN_PILOT !== "false" && (ATLAS_COUNTRIES as readonly string[]).includes(country);
