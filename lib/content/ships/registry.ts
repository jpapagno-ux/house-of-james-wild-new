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

export type VoyageType = "river" | "sailing" | "expedition" | "yacht" | "charter";
/** antarctica and patagonia: the polar waters, both listed in Polar Voyages (/voyages/polar). */
export type Waters = "nile" | "amazon" | "galapagos" | "indonesia" | "antarctica" | "patagonia" | "philippines" | "tahiti" | "fiji" | "mekong" | "seychelles" | "arctic" | "caribbean" | "mediterranean" | "bahamas";
export const POLAR_WATERS: Waters[] = ["antarctica", "patagonia"];
export type ShipKind = "riverboat" | "dahabiya" | "phinisi" | "catamaran" | "motor-yacht" | "expedition-ship" | "yacht" | "schooner" | "river-yacht" | "trimaran" | "bangka";
/** The operator's own class label (Galápagos, James, 2 Nov 2026): the hub groups ships by partner and tier.
 *  "Naturalist" is Galaxy Cruises' own label where it publishes no class grade (Galaxy Bonita, Galaxy Orion). */
export type ShipTier = "Luxury" | "First Class" | "Naturalist";
export const TIER_ORDER: ShipTier[] = ["Luxury", "First Class", "Naturalist"];

/** What a guest can do on her voyages, as her operator's own material describes it. */
export type Activity = "wildlife" | "diving" | "snorkelling" | "kayaking" | "hiking" | "culture" | "slow" | "sailing";
export const ACTIVITIES: Record<Activity, string> = {
  wildlife: "Wildlife", diving: "Diving", snorkelling: "Snorkelling", kayaking: "Kayaking", hiking: "Hiking", culture: "Culture", slow: "Slow or wellness", sailing: "Sailing",
};
/** The single supplement as the operator publishes it: a percentage over the two-sharing fare (`pct` the lowest,
 *  `max` the highest where it varies by season or cabin), none (a solo
 *  cabin that carries none), or "applies" when the operator says one is charged but gives no figure. */
export type SingleSupplement = { kind: "percent"; pct: number; max?: number; note?: string } | { kind: "none"; note?: string } | { kind: "applies"; note?: string };
/**
 * Facts for search and the category pages (James, 2 Nov 2026), read only from her filed record (which
 * came from the operator's site). A field is left out where the operator does not publish it: never a
 * guess, and never `false` for "not mentioned".
 *   minChildAge: youngest age on shared departures (0 = all ages); childNote: the operator's wording
 *   single:      the single supplement; connecting: connecting cabins published; kidsProgramme: a named
 *                children's programme on board; activities: what the voyages offer; dives: guided diving aboard
 */
export type ShipTraits = {
  minChildAge?: number;
  childNote?: string;
  single?: SingleSupplement;
  connecting?: boolean;
  kidsProgramme?: boolean;
  activities?: Activity[];
  dives?: boolean;
};

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
  /** Search and category facts (see ShipTraits); absent until her record is filed. */
  traits?: ShipTraits;
  /** The operator's class label, where it gives one (ShipTier). */
  tier?: ShipTier;
};

export const SHIP_REGISTRY: RegistryShip[] = [
  // Ships with pages ---------------------------------------------------------
  { slug: "aliikai", name: "Aliikai", operator: "Aliikai Voyage", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-06", "PATH-07"] }, charter: { whole: true, from: 10900, basis: "night" }, rateBasis: "per-night", status: "sailing", page: true, staySlug: "aliikai-voyage",
    // aliikai-voyage.com via her voyage files: single supplement 50% of the nightly rate; a full dive centre with Nitrox;
    // kayaks and paddleboards; the bird of paradise hike, Komodo dragon walks and village visits; yoga and massages
    // (owner's record VSL-2026-000004); a phinisi under sail. No child age or connecting cabins published.
    traits: { single: { kind: "percent", pct: 50, note: "50% of the nightly rate" }, activities: ["wildlife", "diving", "snorkelling", "kayaking", "hiking", "culture", "slow", "sailing"], dives: true } },
  { slug: "nile-adventurer", name: "Nile Adventurer", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // abercrombiekent.com: 10 and over; single rates about 1.5 times the sharing rate; Egyptologist-led temples; massage room.
    traits: { minChildAge: 10, childNote: "10 and over; 15 and under share with an adult", single: { kind: "percent", pct: 50, note: "Single rates about 1.5 times the sharing rate" }, activities: ["culture", "slow"] } },
  { slug: "nile-seray", name: "Nile Seray", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2026-11", page: true,
    // abercrombiekent.com: 6 and over; single rates about 1.5 times the sharing rate; spa and gym.
    traits: { minChildAge: 6, childNote: "6 and over; 15 and under share with an adult", single: { kind: "percent", pct: 50, note: "Single rates about 1.5 times the sharing rate" }, activities: ["culture", "slow"] } },
  // A&K sells Sun Boat III as a private charter or inside its Ultimate Egypt journey (abercrombiekent.com).
  { slug: "sun-boat-iii", name: "Sun Boat III", operator: "A&K Sanctuary", kind: "riverboat", types: ["river", "charter"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true,
    // abercrombiekent.com: 10 and over; "a single supplement applies" (no figure published).
    traits: { minChildAge: 10, childNote: "10 and over; under 15 share with an adult", single: { kind: "applies", note: "A&K says a single supplement applies; the figure is on request" }, activities: ["culture"] } },
  { slug: "sun-boat-iv", name: "Sun Boat IV", operator: "A&K Sanctuary", kind: "riverboat", types: ["river"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // abercrombiekent.com: 10 and over; single rates published alongside (1.35 times the sharing rate May to September 2027,
    // 1.5 times in the other rate periods); massage room and gym.
    traits: { minChildAge: 10, childNote: "10 and over; under 15 share with an adult", single: { kind: "percent", pct: 35, max: 50, note: "35% from May to September 2027, 50% in the other rate periods" }, activities: ["culture", "slow"] } },
  { slug: "zein-nile-chateau", name: "Zein Nile Chateau", operator: "A&K Sanctuary", kind: "dahabiya", types: ["river", "charter"], waters: ["nile"], country: ["Egypt"],
    pathway: { primary: "PATH-08", secondary: ["PATH-07"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true,
    // abercrombiekent.com: children of all ages; a dahabiya under sail (slow sailing, Part 3). Single cabins only inside A&K journeys.
    traits: { minChildAge: 0, childNote: "All ages", activities: ["culture", "sailing", "slow"] } },

  // andbeyond.com sails her in the Peruvian Amazon from Nauta, via Iquitos (the library record says Brazil; flagged).
  { slug: "beyond-amazon-explorer", name: "andBeyond Amazon Explorer", operator: "andBeyond", kind: "river-yacht", types: ["river"], waters: ["amazon"], country: ["Peru"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2026-12", page: true, staySlug: "beyond-amazon-explorer",
    // andbeyond.com: 8 and over on scheduled cruises; single supplement 25%; eight Luxury Suites connect in pairs; WILDchild
    // programme; skiffs, kayaks, forest walks, river communities; wellness centre.
    traits: { minChildAge: 8, childNote: "8 and over on scheduled cruises; any age on a private charter", single: { kind: "percent", pct: 25 }, connecting: true, kidsProgramme: true, activities: ["wildlife", "kayaking", "hiking", "culture", "slow"] } },

  // More Amazon ships (filed 2 Nov 2026 from each operator's site). MV Premium is Brazil's one ship for now.
  { slug: "aria-amazon", name: "Aria Amazon", operator: "Aqua Expeditions", kind: "riverboat", types: ["river"], waters: ["amazon"], country: ["Peru"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // Aqua Expeditions' site: two pairs of connecting suites; jungle walks, a village visit, the Manatee Rescue Center. No child age published.
    traits: { connecting: true, activities: ["wildlife", "hiking", "culture"] } },
  { slug: "delfin-iii", name: "Delfin III", operator: "Delfín Amazon Cruises", kind: "riverboat", types: ["river"], waters: ["amazon"], country: ["Peru"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // Delfín's site: 7 and over; single supplement 50% (75% on the top suites, waived for two solo guests a sailing); kayaking, pink dolphins, spa.
    traits: { minChildAge: 7, childNote: "7 and over", single: { kind: "percent", pct: 50, max: 75, note: "50% on Suites and Upper Suites, 75% on Owner's and Corner Suites; waived for up to two solo guests per departure outside the holidays" }, activities: ["wildlife", "kayaking", "hiking", "culture", "slow"] } },
  { slug: "anakonda-amazon-cruise", name: "Anakonda", operator: "Anakonda Amazon Cruises", kind: "riverboat", types: ["river"], waters: ["amazon"], country: ["Ecuador"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // Anakonda's site: four interconnected Standard Suites; birding, river dolphins, communities, a night forest walk; spa.
    traits: { connecting: true, activities: ["wildlife", "hiking", "culture", "slow"] } },
  { slug: "amazon-clipper-premium", name: "MV Premium", operator: "Amazon Clipper Cruises", kind: "riverboat", types: ["river"], waters: ["amazon"], country: ["Brazil"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // Amazon Clipper's site: canoe outings for caimans and birds, a jungle walk, a community visit.
    traits: { activities: ["wildlife", "hiking", "culture"] } },

  // The Galapagos (filed 1 Nov 2026). Ecoventura: Off the Map because Ecoventura calls route B "remote and
  // pristine"; whole-yacht charter published. Galaxy Cruises: charters published; no Off the Map.
  { slug: "ecoventura-origin-yacht", name: "Origin", operator: "Ecoventura", kind: "yacht", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02", "PATH-06"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "ecoventura-origin-yacht", tier: "Luxury",
    // ecoventura.com: a published single fare (US$19,950 against US$10,950 two sharing in 2026, US$21,000 against
    // US$11,500 in 2027; double in festive weeks); two pairs of staterooms connect into Premium Suites; snorkelling, kayaks and paddleboards, hikes.
    // Minimum child age differs between Ecoventura's own pages, so it is left out.
    traits: { single: { kind: "percent", pct: 82, max: 100, note: "A single fare is published per sailing: about 82% over two sharing, 100% in festive weeks" }, connecting: true, activities: ["wildlife", "snorkelling", "kayaking", "hiking"] } },
  { slug: "ecoventura-theory-yacht", name: "Theory", operator: "Ecoventura", kind: "yacht", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02", "PATH-06"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "ecoventura-theory-yacht", tier: "Luxury",
    // ecoventura.com: a published single fare (US$19,950 against US$10,950 two sharing in 2026, US$21,000 against
    // US$11,500 in 2027; double in festive weeks); two pairs of staterooms connect into Premium Suites; snorkelling, kayaks and paddleboards, hikes.
    // Minimum child age differs between Ecoventura's own pages, so it is left out.
    traits: { single: { kind: "percent", pct: 82, max: 100, note: "A single fare is published per sailing: about 82% over two sharing, 100% in festive weeks" }, connecting: true, activities: ["wildlife", "snorkelling", "kayaking", "hiking"] } },
  { slug: "ecoventura-evolve-yacht", name: "Evolve", operator: "Ecoventura", kind: "yacht", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02", "PATH-06"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "ecoventura-evolve-yacht", tier: "Luxury",
    // ecoventura.com: a published single fare (US$19,950 against US$10,950 two sharing in 2026, US$21,000 against
    // US$11,500 in 2027; double in festive weeks); two pairs of staterooms connect into Premium Suites; snorkelling, kayaks and paddleboards, hikes.
    // Minimum child age differs between Ecoventura's own pages, so it is left out.
    traits: { single: { kind: "percent", pct: 82, max: 100, note: "A single fare is published per sailing: about 82% over two sharing, 100% in festive weeks" }, connecting: true, activities: ["wildlife", "snorkelling", "kayaking", "hiking"] } },
  { slug: "alya-catamaran-galapagos", name: "Alya", operator: "Galaxy Cruises", kind: "catamaran", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "alya-catamaran-galapagos", tier: "Luxury",
    // Galaxy Cruises: over 6 on shared departures; single occupancy 1.5 times the sharing rate; snorkelling gear, kayaks and paddleboards; a naturalist guide; lava-field walks.
    traits: { minChildAge: 7, childNote: "Over 6 on shared departures; any age on a charter", single: { kind: "percent", pct: 50, note: "Single occupancy 1.5 times the sharing rate" }, activities: ["wildlife", "snorkelling", "kayaking", "hiking"] } },
  { slug: "sirius-yacht-galapagos", name: "Galaxy Sirius", operator: "Galaxy Cruises", kind: "catamaran", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "sirius-yacht-galapagos", tier: "Luxury",
    // Galaxy Cruises: over 6 on shared departures; single occupancy 1.5 times the sharing rate; snorkelling gear, kayaks and paddleboards; two naturalist guides.
    traits: { minChildAge: 7, childNote: "Over 6 on shared departures; any age on a charter", single: { kind: "percent", pct: 50, note: "Single occupancy 1.5 times the sharing rate" }, activities: ["wildlife", "snorkelling", "kayaking"] } },

  // The Galápagos portfolio (James, 2 Nov 2026), filed from each operator's own site; photographs partner
  // approved, credited to the operator. Tiers as the operators label them. Royal Galapagos publishes a 50%
  // single supplement, a 20% child discount with no minimum age, and whole-yacht charters for every yacht;
  // Galaxy Cruises' terms take children over 6 on shared departures and any age on a full charter; Vianatura
  // takes all ages and charges a single supplement it does not publish. Calipso's diving weeks are held for
  // James's diving site, so she is filed as a naturalist yacht only.
  ...([
    ["galapagos-horizon-trimaran", "Galapagos Horizon", "trimaran", "Luxury", ["PATH-02"], { hiking: true }],
    ["infinity-yacht-galapagos", "Infinity", "yacht", "Luxury", ["PATH-02", "PATH-06"], { connecting: true, hiking: true }],
    ["new-galapagos-sea-star", "New Galapagos Sea Star", "yacht", "Luxury", ["PATH-02", "PATH-06"], { connecting: true, hiking: false }],
    ["natural-paradise-yacht", "Natural Paradise", "yacht", "Luxury", ["PATH-02"], { hiking: true }],
    ["grand-majestic-yacht", "Galapagos Grand Majestic", "yacht", "Luxury", ["PATH-02", "PATH-07"], { hiking: true }],
    ["galapagos-angel-yacht", "Galapagos Angel", "motor-yacht", "First Class", ["PATH-02"], { hiking: true }],
    ["calipso-yacht-galapagos", "Calipso", "yacht", "First Class", ["PATH-02"], { hiking: true }],
  ] as const).map(([slug, name, kind, tier, secondary, x]): RegistryShip => ({
    slug, name, operator: "Royal Galapagos", kind, types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: [...secondary] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, tier,
    traits: { single: { kind: "percent", pct: 50, note: "Royal Galapagos publishes a 50% single supplement" }, ...("connecting" in x ? { connecting: true } : {}), activities: ["wildlife", "snorkelling", "kayaking", ...(x.hiking ? (["hiking"] as const) : [])] },
  })),
  // vianatura.com: all ages; a single supplement is charged but not published (its two single cabins carry none, per
  // Vianatura's blog); snorkel gear, kayaks and paddleboards.
  { slug: "monserrat-yacht-galapagos", name: "Monserrat", operator: "Vianatura", kind: "motor-yacht", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, tier: "First Class",
    traits: { minChildAge: 0, childNote: "All ages; 15% off under 12 travelling with two adults", single: { kind: "applies", note: "Vianatura charges a single supplement it does not publish; its two single cabins carry none, per its blog" }, activities: ["wildlife", "snorkelling", "kayaking"] } },
  // galaxycruises.com: over 6 on shared departures, any age on a full charter (EcoGalaxy's own page says from 6);
  // snorkel gear and kayaks. No single rate is published on these yachts' pages.
  ...([
    ["galaxy-stella-yacht", "Galaxy Stella", "motor-yacht", "Luxury", 7, "Over 6 on shared departures; any age on a charter"],
    ["ecogalaxy-catamaran", "EcoGalaxy", "catamaran", "First Class", 6, "From 6, per Galaxy's EcoGalaxy page (its terms say over 6 on shared departures); any age on a charter"],
    ["galaxy-bonita-yacht", "Galaxy Bonita", "motor-yacht", "Naturalist", 7, "Over 6 on shared departures; any age on a charter"],
    ["galaxy-orion-yacht", "Galaxy Orion", "yacht", "Naturalist", 7, "Over 6 on shared departures; any age on a charter"],
  ] as const).map(([slug, name, kind, tier, age, childNote]): RegistryShip => ({
    slug, name, operator: "Galaxy Cruises", kind, types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, tier,
    traits: { minChildAge: age, childNote, activities: ["wildlife", "snorkelling", "kayaking"] },
  })),
  // Via Natura's Hermes (filed 2 Nov 2026 from vianatura.com): the Galapagos rule, Where the Wild Lives first and
  // Between Tides second, plus A Place of Our Own for the published whole-vessel charter (up to 20; from US$134,805
  // for 3 nights in 2026). No Off the Map: Via Natura calls no Hermes route remote. The Exceptional Few No. 002.
  { slug: "hermes-galapagos", name: "Hermes", operator: "Vianatura", kind: "catamaran", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02", "PATH-07"] }, charter: { whole: true, from: 134805, basis: "voyage" }, rateBasis: "per-cruise", status: "sailing", page: true, tier: "Luxury",
    // Operator written "Vianatura" here, as on its partner page and photo credits (it styles itself Via Natura too), so
    // Hermes and Monserrat sit together on the hub, the atlas and as sisters. Tier: Luxury, as vianatura.com labels her.
    // vianatura.com: no minimum age (15% off a child under 12 sharing with two adults); single supplement 75% on a King/Twin
    // Suite in 2026, none in the two Single Suites; snorkel gear, kayaks and paddleboards; island walks; a spa with a hammam.
    traits: { childNote: "No minimum age published; 15% off a child under 12 sharing with two adults", single: { kind: "percent", pct: 75, note: "75% on a King/Twin Suite in 2026 (2027 not published); the two Single Suites sell at the standard fare" }, activities: ["wildlife", "snorkelling", "kayaking", "hiking", "slow"] } },

  // Polar Voyages (James, 2 Nov 2026): Antarctica21's ships, filed from antarctica21.com. Where the Wild Lives
  // first; Off the Map for the Polar Circle and South Georgia routes. The research also suggested Above It All
  // for the flown Drake, which is not used for voyages yet (Part 3), so it is left off.
  // HX Expeditions (James, 9 Nov 2026): MS Roald Amundsen, the ship James sailed to the Antarctic Circle in February to
  // March 2020 (his photographs, Ukraine's Vernadsky station). Filed from travelhx.com: 490 guests, hybrid powered, built
  // 2019; kayaking and camping bookable on board. Where the Wild Lives first, Off the Map for the Antarctic Circle attempt.
  { slug: "ms-roald-amundsen", name: "MS Roald Amundsen", operator: "HX Expeditions", kind: "expedition-ship", types: ["expedition"], waters: ["antarctica"], country: ["Antarctica", "Argentina"],
    pathway: { primary: "PATH-04", secondary: ["PATH-06"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { childNote: "No minimum age on HX's ship page; ask us", activities: ["wildlife", "kayaking", "hiking"] } },
  { slug: "magellan-explorer", name: "Magellan Explorer", operator: "Antarctica21", kind: "expedition-ship", types: ["expedition"], waters: ["antarctica", "patagonia"], country: ["Antarctica", "Chile", "Argentina"],
    pathway: { primary: "PATH-04", secondary: ["PATH-06"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // antarctica21.com: 8 and over on air-cruises, 12 on sea voyages; Single Veranda Cabins with no supplement (85% or 100% in
    // shared cabins); optional sea kayaking and hiking at extra cost.
    traits: { minChildAge: 8, childNote: "8 and over on air-cruises (1.20 m and 30 kg); 12 and over on sea voyages", single: { kind: "none", note: "None in the Single Veranda Cabins; 85% or 100% in shared cabin categories" }, activities: ["wildlife", "kayaking", "hiking"] } },
  { slug: "magellan-discoverer", name: "Magellan Discoverer", operator: "Antarctica21", kind: "expedition-ship", types: ["expedition"], waters: ["antarctica", "patagonia"], country: ["Antarctica", "Chile", "Argentina"],
    pathway: { primary: "PATH-04", secondary: ["PATH-06"] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2026-12", page: true,
    // antarctica21.com: 8 and over on air-cruises, 12 on sea voyages; Single Veranda Cabins with no supplement (85% or 100% in
    // shared cabins); two cabin types with a connecting door; optional sea kayaking and hiking at extra cost.
    traits: { minChildAge: 8, childNote: "8 and over on air-cruises (1.20 m and 30 kg); 12 and over on sea voyages", single: { kind: "none", note: "None in the Single Veranda Cabins; 85% or 100% in shared cabin categories" }, connecting: true, activities: ["wildlife", "kayaking", "hiking"] } },

  // Aman's Amandira (filed 2 Nov 2026 from aman.com): Between Tides, A Place of Our Own (a private yacht for one
  // party, charter only) and Off the Map, because Aman calls the Alor Islands remote. No rates published. The Exceptional Few No. 003.
  { slug: "amandira", name: "Amandira", operator: "Aman", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-07", "PATH-06"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true,
    // aman.com: Komodo dragons and whale sharks; a dive master, dive gear and a dive boat; kayaks and paddleboards; the Pindito
    // and Gunung Api climbs; Ikat weaving and Penama villages on Alor; in-cabin massage and beach yoga; under sail and motor.
    // No child age or single supplement published (a private charter).
    traits: { childNote: "No age policy published by Aman", activities: ["wildlife", "diving", "snorkelling", "kayaking", "hiking", "culture", "slow", "sailing"], dives: true } },

  // TAO Philippines (James, 2 Nov 2026, the Philippines build): island expeditions by local bangka between El Nido
  // and Coron with nights in TAO's own basecamps, from taophilippines.com. Off the Map first (Linapacan's islands no
  // resort reaches), Rooted in Place (an islander crew and the Tao Women's Association). Private trips for one party.
  // taophilippines.com: 13 and over on shared expeditions unless agreed, all ages on holiday departures; snorkelling.
  { slug: "tao-philippines", name: "TAO Philippines", operator: "TAO Philippines", kind: "bangka", types: ["expedition"], waters: ["philippines"], country: ["Philippines"],
    pathway: { primary: "PATH-06", secondary: ["PATH-08", "PATH-02"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { minChildAge: 13, childNote: "13 and over on shared expeditions unless agreed; all ages on Christmas, Chinese New Year and Easter departures, or on a private trip", activities: ["snorkelling", "culture", "slow"] } },
  // The Indonesian yacht fleets (James, 2 Nov 2026; voyages plan Parts 12 and 16), filed from each operator's own
  // site. Rascal Voyages' three yachts retire the library Stay record "rascal-voyages" (its URL 301s to the partner
  // page); Silolona and Celestia move from their voyage-labelled stay pages (301s to the ship pages). Rascal and
  // Silolona are partners, founder vetted and founder favourites (James has not been aboard); Celestia is partner
  // sourced, with no founder mark. Rates only as the operators publish them; commercial terms stay in the library.
  // rascalvoyages.com: whole yacht only from Rascal Voyages' published nightly rate; cabin voyages on Rascal and Rebel;
  // "We welcome little Rascals" (no minimum age); a PADI dive instructor and full scuba kit; kayaks and paddleboards;
  // Komodo dragon walks, village visits, treks; yoga and massage on request.
  ...([
    ["rascal", "Rascal", 12000, { connecting: false }],
    ["rebel", "Rebel", 13500, { connecting: false }],
    ["el-aleph", "El Aleph", 12000, { connecting: true }],
  ] as const).map(([slug, name, from, x]): RegistryShip => ({
    slug, name, operator: "Rascal Voyages", kind: "yacht", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-07", "PATH-04"] }, charter: { whole: true, from, basis: "night" }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "rascal-voyages",
    traits: { childNote: "Children welcome (\"We welcome little Rascals\"); no minimum age published", ...(x.connecting ? { connecting: true } : {}), activities: ["wildlife", "diving", "snorkelling", "kayaking", "hiking", "culture", "slow"], dives: true },
  })),
  // silolona.com: chartered whole only, no rates published; child extra beds in every cabin, no minimum age; diving with a
  // PADI dive instructor, kayaking, paddleboarding and sport fishing; Banda, Asmat and Toraja culture; massage aboard;
  // traditional sailing phinisis. Pathways as James assigned Silolona (Part 2): A Place of Our Own first, then Between
  // Tides and Rooted in Place (Banda's spice history, Asmat and Toraja); The Art of Stillness dropped for the two-secondary rule.
  ...([["silolona", "Silolona", "silolona-sojourns"], ["si-datu-bua", "Si Datu Bua", undefined]] as const).map(([slug, name, stay]): RegistryShip => ({
    slug, name, operator: "Silolona Sojourns", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-07", secondary: ["PATH-02", "PATH-08"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true, ...(stay ? { staySlug: stay } : {}),
    traits: { childNote: "Children welcome; child extra beds in every cabin, no minimum age published", activities: ["wildlife", "diving", "snorkelling", "kayaking", "culture", "slow", "sailing"], dives: true },
  })),
  // celestiayacht.com: whole yacht only, US$13,500 a night plus VAT in 2026; no age limit published; dive master and Nitrox;
  // kayaks and paddleboards; the Padar and Gili Lawa treks; massages; a phinisi. Partner sourced, no founder mark.
  { slug: "celestia", name: "Celestia", operator: "Celestia Yacht", kind: "phinisi", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-07", "PATH-06"] }, charter: { whole: true, from: 13500, basis: "night" }, rateBasis: "per-cruise", status: "sailing", page: true, staySlug: "celestia-yacht",
    traits: { childNote: "No age limit published; families with young children have sailed her", activities: ["wildlife", "diving", "snorkelling", "kayaking", "hiking", "slow"], dives: true } },
  // Windstar in French Polynesia (James, 2 Nov 2026), filed from windstarcruises.com. Star Breeze is an all-suite
  // motor yacht (never "sailing"); Wind Star is the four-masted sailing yacht, in Tahiti from March 2027. Between
  // Tides first. Star Breeze's old Stay record (windstar-cruise-sv-star-breeze) is retired; its URL redirects here.
  // James sailed Star Breeze (James, 9 Nov 2026: 11 days, Fakarava and Rarotonga, with his wife): her record carries
  // the "Founder sailed" proof line. Dated sailings and from fares filed from windstarcruises.com on 9 Nov 2026.
  { slug: "star-breeze", name: "Star Breeze", operator: "Windstar", kind: "motor-yacht", types: ["expedition"], waters: ["tahiti"], country: ["French Polynesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-06"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { activities: ["snorkelling", "culture", "slow"] } },
  { slug: "wind-star", name: "Wind Star", operator: "Windstar", kind: "yacht", types: ["sailing"], waters: ["tahiti"], country: ["French Polynesia"],
    pathway: { primary: "PATH-02", secondary: [] }, charter: null, rateBasis: "per-cruise", status: "launching", launch: "2027-03", page: true,
    traits: { activities: ["sailing", "snorkelling", "culture", "slow"] } },

  // Fiji (James, 5 to 7 Nov 2026): Blue Lagoon Cruises' MV Yasawa Princess II, filed from bluelagooncruises.com.
  // Between Tides first (the water is the activity: snorkelling, manta rays, the Blue Lagoon); Rooted in Place for
  // the Yasawa villages, kava and lovo. Adults only (16 and over) from mid-January 2027.
  { slug: "yasawa-princess-ii", name: "Yasawa Princess II", operator: "Blue Lagoon Cruises", kind: "motor-yacht", types: ["expedition"], waters: ["fiji"], country: ["Fiji"],
    pathway: { primary: "PATH-02", secondary: ["PATH-08"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { minChildAge: 16, childNote: "Adults only, 16 and over, on every departure from mid-January 2027", activities: ["snorkelling", "kayaking", "culture", "wildlife"] } },

  // Timeless Voyages (James, 13 Nov 2026): Four Seasons Yachts' Four Seasons I, filed from fourseasonsyachts.com and
  // press.fourseasons.com. In service since 20 March 2026, so "sailing", not a Maiden Voyage. A motor yacht: filed under
  // "expedition" as Star Breeze is, since the four voyage types carry no ocean-yacht type yet. Fares are per suite.
  // Between Tides first (the transverse marina and its watersports); Slow sailing and wellness second (spa, exercise classes).
  // Activities are left to what the brand's pages name outright: shore experiences and the spa. Marina watersports are not itemised.
  { slug: "four-seasons-i", name: "Four Seasons I", operator: "Four Seasons Yachts", kind: "motor-yacht", types: ["yacht"], waters: ["caribbean", "mediterranean", "bahamas"],
    country: ["Sint Maarten", "Antigua and Barbuda", "Saint Lucia", "Bahamas", "Greece", "Italy", "France", "Monaco", "Croatia", "Spain", "Malta", "Turkey"],
    pathway: { primary: "PATH-02", secondary: ["PATH-05"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    // fourseasonsyachts.com: over 100 connecting suite combinations; children under 5 have meals included (no minimum age readable).
    traits: { minChildAge: 0, childNote: "Six months and over; one year and over on voyages with three or more consecutive days at sea", connecting: true, activities: ["culture", "slow"] } },

  // Filed in the Ledger, ship pages to follow (their country passes) ----------
  { slug: "mutiara-laut", name: "Mutiara Laut", operator: "Mutiara Laut", kind: "schooner", types: ["sailing", "charter"], waters: ["indonesia"], country: ["Indonesia"], pathway: null, charter: { whole: true }, rateBasis: null, status: "filed", page: false, staySlug: "mutiara-laut" },

  // Aqua Expeditions (James, 13 Nov 2026): the whole fleet, from aquaexpeditions.com and Aqua's own booking data
  // (scripts/partners/aqua-build.mjs). Aria Amazon is filed above. Connecting suites as Aqua publishes them.
  { slug: "aqua-nera", name: "Aqua Nera", operator: "Aqua Expeditions", kind: "riverboat", types: ["river"], waters: ["amazon"], country: ["Peru"],
    pathway: { primary: "PATH-01", secondary: ["PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { connecting: true, activities: ["wildlife", "kayaking", "hiking", "culture"] } },
  { slug: "aqua-mekong", name: "Aqua Mekong", operator: "Aqua Expeditions", kind: "riverboat", types: ["river"], waters: ["mekong"], country: ["Cambodia", "Vietnam"],
    pathway: { primary: "PATH-08", secondary: ["PATH-05"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { connecting: true, activities: ["culture", "kayaking", "slow"] } },
  { slug: "aqua-mare", name: "Aqua Mare", operator: "Aqua Expeditions", kind: "yacht", types: ["expedition", "charter"], waters: ["galapagos"], country: ["Ecuador"],
    pathway: { primary: "PATH-04", secondary: ["PATH-02", "PATH-07"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { activities: ["wildlife", "snorkelling", "kayaking", "hiking"] } },
  { slug: "aqua-blu", name: "Aqua Blu", operator: "Aqua Expeditions", kind: "motor-yacht", types: ["expedition"], waters: ["indonesia"], country: ["Indonesia"],
    pathway: { primary: "PATH-02", secondary: ["PATH-06", "PATH-04"] }, charter: null, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { connecting: true, dives: true, activities: ["diving", "snorkelling", "kayaking", "wildlife", "hiking", "culture"] } },
  { slug: "aqua-lares", name: "Aqua Lares", operator: "Aqua Expeditions", kind: "yacht", types: ["expedition", "charter"], waters: ["seychelles", "arctic"], country: ["Seychelles", "Tanzania", "Norway"],
    pathway: { primary: "PATH-06", secondary: ["PATH-04", "PATH-07"] }, charter: { whole: true }, rateBasis: "per-cruise", status: "sailing", page: true,
    traits: { dives: true, activities: ["wildlife", "diving", "snorkelling", "kayaking", "hiking", "culture"] } },
];

/** The voyage types, in the house's words (James, 1 Nov 2026; "By Yacht" added 13 Nov 2026 for the ocean yachts of Timeless Voyages). */
export const VOYAGE_TYPES: Record<VoyageType, { name: string; path: string; question: string; line: string }> = {
  river: { name: "By River", path: "/voyages/rivers", question: "Which small-ship river cruise is right for you?", line: "Riverboats and a dahabiya on the Nile, and river ships in the Amazon of Peru, Ecuador and Brazil." },
  sailing: { name: "Under Sail", path: "/voyages/sailing", question: "Which small sailing ship should you choose?", line: "Hand-built phinisis and yachts in Indonesia, from Raja Ampat to Komodo and the Banda Sea, and Windstar's four-masted Wind Star in Tahiti from March 2027." },
  expedition: { name: "To the Edges", path: "/voyages/expedition", question: "Which small expedition ship should you choose?", line: "Expedition yachts and catamarans in the Galápagos, Polar Voyages: Antarctica21's polar air-cruises and voyages, and TAO's island expeditions in Palawan." },
  yacht: { name: "By Yacht", path: "/voyages/yachts", question: "What is a luxury yacht voyage like?", line: "Ocean yachts with suites, a marina at the stern and a hotel's service: Four Seasons I in the Caribbean, the Bahamas and the Mediterranean." },
  charter: { name: "The Whole Ship", path: "/voyages/charter", question: "What does a whole-yacht charter include?", line: "A phinisi, a yacht, a dahabiya or a riverboat taken private for your party." },
};

/** The waters hubs. `countries` is what the hub covers; ships fill it as they are filed. */
export const WATERS_HUBS: Record<Waters, { name: string; path: string; countries: string[]; question: string }> = {
  nile: { name: "The Nile", path: "/voyages/nile", countries: ["Egypt"], question: "Which Nile cruise should I choose?" },
  amazon: { name: "The Amazon", path: "/voyages/amazon", countries: ["Peru", "Ecuador", "Brazil"], question: "What is the best small-ship Amazon cruise?" },
  galapagos: { name: "The Galápagos", path: "/voyages/galapagos", countries: ["Ecuador"], question: "Yacht or catamaran in the Galápagos?" },
  indonesia: { name: "Indonesia", path: "/voyages/indonesia", countries: ["Indonesia"], question: "What does a Raja Ampat phinisi cost?" },
  antarctica: { name: "Polar Voyages", path: "/voyages/polar", countries: ["Antarctica"], question: "Fly or sail the Drake?" },
  patagonia: { name: "Patagonia", path: "/voyages/polar", countries: ["Chile", "Argentina"], question: "Which voyage sails the Chilean fjords?" },
  // No hub page yet: TAO lives on its ship page and the Philippines country page.
  philippines: { name: "The Philippines", path: "/destinations/asia/philippines", countries: ["Philippines"], question: "How do you travel from El Nido to Coron?" },
  // No /voyages hub of its own yet: the tile and search land on the country page's "Sail it" section.
  tahiti: { name: "French Polynesia (Tahiti)", path: "/destinations/oceania/tahiti#sail", countries: ["French Polynesia"], question: "Which Windstar ship sails Tahiti?" },
  // No /voyages hub yet: Fiji's one ship lives on her page and the Fiji country page.
  fiji: { name: "Fiji", path: "/voyages/ships/yasawa-princess-ii", countries: ["Fiji"], question: "Which small ship sails Fiji's Yasawa Islands?" },
  // Aqua Expeditions' waters (13 Nov 2026). No /voyages hubs yet: each lands on the one ship that sails it.
  mekong: { name: "The Mekong", path: "/voyages/ships/aqua-mekong", countries: ["Cambodia", "Vietnam"], question: "What is the best luxury Mekong river cruise?" },
  seychelles: { name: "The Seychelles and Zanzibar", path: "/voyages/ships/aqua-lares", countries: ["Seychelles", "Tanzania"], question: "Can you cruise to Aldabra in the Seychelles?" },
  arctic: { name: "Svalbard and the Arctic", path: "/voyages/ships/aqua-lares", countries: ["Norway"], question: "Which small ship sails Svalbard?" },
  // Timeless Voyages waters (13 Nov 2026). No hub pages yet: each points at Four Seasons I until the collection page is approved.
  caribbean: { name: "The Caribbean", path: "/voyages/ships/four-seasons-i", countries: ["Sint Maarten", "Antigua and Barbuda", "Saint Lucia"], question: "Which yacht sails the Lesser Antilles in winter?" },
  mediterranean: { name: "The Mediterranean", path: "/voyages/ships/four-seasons-i", countries: ["Greece", "Italy", "France", "Monaco", "Croatia", "Spain", "Malta", "Turkey"], question: "Which yacht sails the Mediterranean in summer?" },
  bahamas: { name: "The Bahamas", path: "/voyages/ships/four-seasons-i", countries: ["Bahamas"], question: "Which yacht sails the Exumas from Miami?" },
};

export const registryShip = (slug: string) => SHIP_REGISTRY.find((s) => s.slug === slug);
export const shipsOfType = (t: VoyageType) => SHIP_REGISTRY.filter((s) => s.types.includes(t));
export const shipsInWaters = (w: Waters) => SHIP_REGISTRY.filter((s) => s.waters.includes(w));
export const shipsOnPathway = (p: PathwayId) => SHIP_REGISTRY.filter((s) => s.pathway && [s.pathway.primary, ...s.pathway.secondary].includes(p));
/** Where a ship lives today: her ship page, else her filed Ledger record. */
export const registryHref = (s: RegistryShip) => (s.page ? `/voyages/ships/${s.slug}` : `/stays/${s.staySlug}`);
