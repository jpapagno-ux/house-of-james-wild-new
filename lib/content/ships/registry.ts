// The ships registry (voyages plan, Part 2 "One data source", 1 Nov 2026): one row per
// vessel the house files, with or without a ship page yet. Everything in Voyages reads
// it: the landing tiles and atlas, the type hubs (/voyages/rivers, /sailing, /expedition,
// /charter), the waters hubs (/voyages/nile, /amazon, /galapagos, /indonesia), the
// pathway pages' "On the water" rows, and the Stays rule that keeps boats out of Stays
// (lib/content/vessels.ts reads `staySlug`).
//
//   types:   a ship can sit in several (Zein Nile Chateau is By River and The Whole Ship)
//   waters:  the hubs she lists on; country: the countries she sails
//   pathway: James's assignments (Part 3); null until a vessel is classified for Voyages
//            (filed vessels keep their library classification on the pathway pages)
//   charter: whole-ship charter; `from` only when the operator publishes a rate
//   page:    true once /voyages/ships/<slug> is built; otherwise the vessel's filed
//            Ledger record (/stays/<staySlug>, labelled Voyage) is where she lives for now
//
// Pure module, no imports at run time, so the tests load it with plain Node.
// Facts only from the operators' own material or the plan; "to confirm" stays null.

import type { PathwayId } from "@/lib/pathways";

export type VoyageType = "river" | "sailing" | "expedition" | "charter";
export type Waters = "nile" | "amazon" | "galapagos" | "indonesia";
export type ShipKind = "riverboat" | "dahabiya" | "phinisi" | "catamaran" | "motor-yacht" | "expedition-ship" | "yacht" | "schooner" | "river-yacht";

export type RegistryShip = {
  slug: string;
  name: string;
  operator: string | null;
  kind: ShipKind;
  types: VoyageType[];
  waters: Waters[];
  country: string[];
  pathway: { primary: PathwayId; secondary: PathwayId[] } | null;
  charter: { whole: boolean; from?: number; basis?: "night" | "voyage" } | null;
  rateBasis: "per-cruise" | "per-night" | null;
  status: "sailing" | "launching" | "filed";
  launch?: string;
  page: boolean;
  /** The vessel's record in the Stay library, when filed there. */
  staySlug?: string;
};

export const SHIP_REGISTRY: RegistryShip[] = [
  // Ships with pages ---------------------------------------------------------
  { slug: "aliikai", name: "Aliikai", operator: "Aliikai Voyage", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-06", "PATH-07"] }, charter: { whole: true, from: 10900, basis: "night" }, rateBasis: "per-night", status: "sailing", page: true, staySlug: "aliikai-voyage" },
  { slug: "nile-adventurer", name: "Nile Adventurer", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true },
  { slug: "nile-seray", name: "Nile Seray", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2026-11", page: true },
  // A&K sells Sun Boat III as a private charter or inside its Ultimate Egypt journey (abercrombiekent.com).
  { slug: "sun-boat-iii", name: "Sun Boat III", operator: "A&K Sanctuary", kind: "riverboat", types: ["river", "charter"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true },
  { slug: "sun-boat-iv", name: "Sun Boat IV", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true },
  { slug: "zein-nile-chateau", name: "Zein Nile Chateau", operator: "A&K Sanctuary", kind: "dahabiya", types: ["river", "charter"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: ["PATH-07"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true },

  // andbeyond.com sails her in the Peruvian Amazon from Nauta, via Iquitos (the library record says Brazil; flagged).
  { slug: "beyond-amazon-explorer", name: "andBeyond Amazon Explorer", operator: "andBeyond", kind: "river-yacht", types: ["river"], waters: ["amazon"], country: ["Peru"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2026-12", page: true, staySlug: "beyond-amazon-explorer" },

  // Filed in the Ledger, ship pages to follow (their country passes) ----------
  { slug: "celestia", name: "Celestia", operator: "Celestia Yacht", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "celestia-yacht" },
  { slug: "silolona", name: "Silolona", operator: "Silolona", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "silolona-sojourns" },
  { slug: "mutiara-laut", name: "Mutiara Laut", operator: "Mutiara Laut", kind: "schooner", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "mutiara-laut" },
  { slug: "ecoventura-evolve", name: "Ecoventura Evolve", operator: "Ecoventura", kind: "yacht", types: ["expedition"], waters: ["galapagos"], country: ["Ecuador"], pathway: null, charter: null, rateBasis: null, status: "filed", page: false, staySlug: "ecoventura-evolve-yacht" },
  { slug: "ecoventura-origin", name: "Ecoventura Origin", operator: "Ecoventura", kind: "yacht", types: ["expedition"], waters: ["galapagos"], country: ["Ecuador"], pathway: null, charter: null, rateBasis: null, status: "filed", page: false, staySlug: "ecoventura-origin-yacht" },
  { slug: "ecoventura-theory", name: "Ecoventura Theory", operator: "Ecoventura", kind: "yacht", types: ["expedition"], waters: ["galapagos"], country: ["Ecuador"], pathway: null, charter: null, rateBasis: null, status: "filed", page: false, staySlug: "ecoventura-theory-yacht" },
  { slug: "galaxy-alya", name: "Galaxy Alya", operator: null, kind: "catamaran", types: ["sailing", "charter"], waters: ["galapagos"], country: ["Ecuador"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "alya-catamaran-galapagos" },
  { slug: "galaxy-sirius", name: "Galaxy Sirius", operator: null, kind: "yacht", types: ["sailing", "charter"], waters: ["galapagos"], country: ["Ecuador"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "sirius-yacht-galapagos" },
];

/** The four voyage types, in the house's words (James, 1 Nov 2026). */
export const VOYAGE_TYPES: Record<VoyageType, { name: string; path: string; question: string; line: string }> = {
  river: { name: "By River", path: "/voyages/rivers", question: "Which small-ship river cruise is right for you?", line: "Riverboats and dahabiyas on the Nile, with the Amazon to follow." },
  sailing: { name: "Under Sail", path: "/voyages/sailing", question: "Which small sailing ship should you choose?", line: "Hand-built phinisis in Indonesia and catamarans in the Galápagos." },
  expedition: { name: "To the Edges", path: "/voyages/expedition", question: "Which small expedition ship should you choose?", line: "Expedition yachts in the Galápagos; the polar ships sail with Polar Crossings." },
  charter: { name: "The Whole Ship", path: "/voyages/charter", question: "What does a whole-yacht charter include?", line: "A phinisi, a dahabiya or a riverboat taken private for your party." },
};

/** The waters hubs. `countries` is what the hub covers; ships fill it as they are filed. */
export const WATERS_HUBS: Record<Waters, { name: string; path: string; countries: string[]; question: string }> = {
  nile: { name: "The Nile", path: "/voyages/nile", countries: ["Egypt"], question: "Which Nile cruise should I choose?" },
  amazon: { name: "The Amazon", path: "/voyages/amazon", countries: ["Peru", "Ecuador", "Brazil"], question: "What is the best small-ship Amazon cruise?" },
  galapagos: { name: "The Galápagos", path: "/voyages/galapagos", countries: ["Ecuador"], question: "Yacht or catamaran in the Galápagos?" },
  indonesia: { name: "Indonesia", path: "/voyages/indonesia", countries: ["Indonesia"], question: "What does a Raja Ampat phinisi cost?" },
};

export const registryShip = (slug: string) => SHIP_REGISTRY.find((s) => s.slug === slug);
export const shipsOfType = (t: VoyageType) => SHIP_REGISTRY.filter((s) => s.types.includes(t));
export const shipsInWaters = (w: Waters) => SHIP_REGISTRY.filter((s) => s.waters.includes(w));
export const shipsOnPathway = (p: PathwayId) => SHIP_REGISTRY.filter((s) => s.pathway && [s.pathway.primary, ...s.pathway.secondary].includes(p));
/** Where a ship lives today: her ship page, else her filed Ledger record. */
export const registryHref = (s: RegistryShip) => (s.page ? `/voyages/ships/${s.slug}` : `/stays/${s.staySlug}`);
