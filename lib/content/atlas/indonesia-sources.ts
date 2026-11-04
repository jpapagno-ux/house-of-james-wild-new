// The Indonesia country atlas (James said "go" on 3 Nov 2026, then approved it live): the official layers and where every fact
// comes from. Pure module (no imports), so plain Node tests read it.
//
// SOURCES (every URL this atlas reads; nothing else):
//   Parks & UNESCO, positions and facts from the World Heritage Centre only (whc.unesco.org), checked 3 Nov 2026:
//     https://whc.unesco.org/en/list/609/          Komodo National Park (inscribed 1991, 219,322 ha; also /609/documents, /609/maps)
//     https://whc.unesco.org/en/list/609/maps/     Komodo coordinates: S8 32 35.988 E119 29 21.984
//     https://whc.unesco.org/en/list/1194/         Cultural Landscape of Bali Province: the Subak System (five rice terraces and their water temples, 19,500 ha)
//     https://whc.unesco.org/en/list/1194/maps     its five components and their coordinates
//     https://whc.unesco.org/en/list/592/          Borobudur Temple Compounds
//     https://whc.unesco.org/en/list/592/maps      its three components and their coordinates
//     https://whc.unesco.org/en/list/642/maps      Prambanan Temple Compounds, coordinates
//     https://whc.unesco.org/en/list/955/          Lorentz National Park (Papua)
//     https://whc.unesco.org/en/list/955/maps/     its coordinates
//   Dive sites: the dive flags already filed in lib/content/ships/journeys.json, named by the partner operators on their own
//     sites (Rascal Voyages: https://www.rascalvoyages.com/voyages/komodo, https://www.rascalvoyages.com/voyages/raja-ampat,
//     and the itinerary PDFs listed in lib/content/ships/indonesia/rascal.json). Positions are the house's approximate
//     route positions, not a dive chart. No list of named dive sites with positions could be read from Balai Taman
//     Nasional Komodo or the Raja Ampat Marine Park Authority (https://kkprajaampat.com/en/entry-card/): see GAPS.
//   Volcanoes: MAGMA Indonesia, PVMBG / Badan Geologi only: https://magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas
//     Not reachable from the build sandbox on 3 Nov 2026 (the network proxy refused the host, and the page disallows
//     automated readers), so no positions or levels are filed yet: VOLCANO_SNAPSHOT below is empty and dated. To refresh,
//     a person (or a scheduled job allowed to read MAGMA) copies each volcano's name, level, "since" date and MAGMA's own
//     position into `volcanoes`, sets `asOf` to the date read, and the daily rebuild publishes it. Never from news sites.

/** A position exactly as the World Heritage Centre prints it, e.g. "S8 32 35.988 E119 29 21.984". */
export type Dms = string;

/** Degrees from a WHC coordinate string ("S8 32 35.988 E119 29 21.984" → [-8.54333, 119.48944]). */
export function dmsToLatLng(s: Dms): { lat: number; lng: number } {
  const m = s.trim().match(/^([NS])\s*(\d+)\s+(\d+)\s+([\d.]+)\s*\/?\s*([EW])\s*(\d+)\s+(\d+)\s+([\d.]+)$/);
  if (!m) throw new Error(`Unreadable coordinate: ${s}`);
  const deg = (d: string, mi: string, se: string) => Number(d) + Number(mi) / 60 + Number(se) / 3600;
  const lat = deg(m[2], m[3], m[4]) * (m[1] === "S" ? -1 : 1);
  const lng = deg(m[6], m[7], m[8]) * (m[5] === "W" ? -1 : 1);
  return { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
}

export type ParkPoint = {
  id: string;
  /** The site as UNESCO names it, and the component where a site has several. */
  site: string;
  name: string;
  dms: Dms;
  line: string;
  url: string;
};

export const PARKS: ParkPoint[] = [
  { id: "unesco-609", site: "Komodo National Park", name: "Komodo National Park", dms: "S8 32 35.988 E119 29 21.984", line: "UNESCO World Heritage Site since 1991, 219,322 hectares round Komodo, Rinca and Padar", url: "https://whc.unesco.org/en/list/609/" },
  { id: "unesco-1194-001", site: "Cultural Landscape of Bali Province", name: "Pura Ulun Danu Batur", dms: "S8 15 17.00 E115 20 10.00", line: "Supreme water temple, part of the Subak System World Heritage Site", url: "https://whc.unesco.org/en/list/1194/" },
  { id: "unesco-1194-002", site: "Cultural Landscape of Bali Province", name: "Lake Batur", dms: "S8 15 33.00 E115 24 10.00", line: "Part of the Subak System World Heritage Site", url: "https://whc.unesco.org/en/list/1194/" },
  { id: "unesco-1194-003", site: "Cultural Landscape of Bali Province", name: "Subak Landscape of Pekerisan Watershed", dms: "S8 25 46.00 E115 18 44.00", line: "Rice terraces and water temples, part of the Subak System World Heritage Site", url: "https://whc.unesco.org/en/list/1194/" },
  { id: "unesco-1194-004", site: "Cultural Landscape of Bali Province", name: "Subak Landscape of Catur Angga Batukaru", dms: "S8 20 37.00 E115 7 20.00", line: "Rice terraces and water temples, part of the Subak System World Heritage Site", url: "https://whc.unesco.org/en/list/1194/" },
  { id: "unesco-1194-005", site: "Cultural Landscape of Bali Province", name: "Pura Taman Ayun", dms: "S8 32 31.00 E115 10 21.00", line: "Royal water temple, part of the Subak System World Heritage Site", url: "https://whc.unesco.org/en/list/1194/" },
  { id: "unesco-592-001", site: "Borobudur Temple Compounds", name: "Borobudur Temple", dms: "S7 36 28.001 E110 12 13.9", line: "UNESCO World Heritage Site, with Mendut and Pawon temples nearby", url: "https://whc.unesco.org/en/list/592/" },
  { id: "unesco-592-002", site: "Borobudur Temple Compounds", name: "Mendut Temple", dms: "S7 36 17.5 E110 13 48.4", line: "Part of the Borobudur Temple Compounds World Heritage Site", url: "https://whc.unesco.org/en/list/592/" },
  { id: "unesco-592-003", site: "Borobudur Temple Compounds", name: "Pawon Temple", dms: "S7 36 21.899 E110 13 10.6", line: "Part of the Borobudur Temple Compounds World Heritage Site", url: "https://whc.unesco.org/en/list/592/" },
  { id: "unesco-642", site: "Prambanan Temple Compounds", name: "Prambanan Temple Compounds", dms: "S7 45 7.992 E110 29 30.012", line: "UNESCO World Heritage Site in Central Java", url: "https://whc.unesco.org/en/list/642/maps" },
  { id: "unesco-955", site: "Lorentz National Park", name: "Lorentz National Park", dms: "S4 45 0 E137 49 59.988", line: "UNESCO World Heritage Site in Papua, from glacier-capped peaks to the tropical coast", url: "https://whc.unesco.org/en/list/955/" },
];

/** MAGMA Indonesia's four alert levels, in its own words. */
export const VOLCANO_LEVELS = { 1: "Level I, Normal", 2: "Level II, Waspada", 3: "Level III, Siaga", 4: "Level IV, Awas" } as const;
export type VolcanoEntry = { name: string; level: 1 | 2 | 3 | 4; since: string | null; lat: number; lng: number; url: string };
export const VOLCANO_SNAPSHOT: { source: string; asOf: string | null; checked: string; note: string; volcanoes: VolcanoEntry[] } = {
  source: "https://magma.esdm.go.id/v1/gunung-api/tingkat-aktivitas",
  asOf: null,
  checked: "2026-11-03",
  note: "MAGMA Indonesia could not be read from the build on 3 Nov 2026, so no levels are filed yet.",
  volcanoes: [],
};

/** What the atlas could not source officially, printed in the PR and kept here for the next pass. */
export const GAPS = [
  "Dive sites: no named dive sites with positions from Balai Taman Nasional Komodo or the Raja Ampat Marine Park Authority; the layer shows the partner-named flags already filed (Rascal Voyages).",
  "Raja Ampat: not a World Heritage Site; its marine park authority publishes no boundary or point the build could read, so it has no park mark.",
  "Volcanoes: MAGMA Indonesia not reachable from the build sandbox; snapshot empty until it is read.",
];
