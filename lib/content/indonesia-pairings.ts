// Indonesia cross-sell (Indonesia review, build spec B7; James approved Indonesia on 2 Nov 2026).
// Yachts paired with the stays before and after them, from facts already in the library and the
// review. Seasons are Indonesia's official tourism board (indonesia.travel): Komodo best April to
// June and September to December; Raja Ampat October to April; Sumba's surf May to October.
// A stay renders only when it is released (in lib/content/stays.json); a vessel only when its
// Voyages page exists (a ship page, or its voyage-labelled stay page). No rates, no commission.

export type Season = "komodo" | "raja-ampat";
export const SEASONS: Record<Season, { label: string; months: string; short: string }> = {
  komodo: { label: "Komodo", months: "April to June and September to December", short: "Apr to Jun, Sep to Dec" },
  "raja-ampat": { label: "Raja Ampat", months: "October to April", short: "Oct to Apr" },
};

export type Pairing = {
  /** The ship page slug (lib/content/ships) or the vessel's stay slug, whichever page she has. */
  vessel: string;
  embark: string | null;
  seasons: Season[];
  /** Where she sails, in the review's words (brand sites). */
  region: string;
  before: string[];
  after: string[];
  note: string;
};

const BALI_BEFORE = ["capella-ubud", "amandari", "viceroy-bali", "soori-bali", "ungasan-clifftops"];
const SUMBA_AFTER = ["nihi", "cap-karoso"];

export const PAIRINGS: Pairing[] = [
  { vessel: "aliikai", embark: "Sorong or Labuan Bajo", seasons: ["raja-ampat", "komodo"], region: "Raja Ampat from Sorong, and Komodo from Labuan Bajo",
    before: ["como-shambhala-estate", "tanah-gajah", "capella-ubud"], after: SUMBA_AFTER,
    note: "Most journeys to Sorong and Labuan Bajo connect through Bali, so a few nights in Ubud first makes the long flights worth it. After a Komodo voyage, Sumba is a short hop away." },
  { vessel: "mutiara-laut", embark: "Labuan Bajo", seasons: ["komodo"], region: "Komodo, Alor, the Spice Islands and Papua",
    before: BALI_BEFORE, after: SUMBA_AFTER,
    note: "Labuan Bajo is about 1.5 hours from Bali by air. Sumba links to Labuan Bajo on the Wings Air flight NIHI publishes, so it is an easy next leg." },
  { vessel: "silolona-sojourns", embark: "Labuan Bajo", seasons: ["komodo", "raja-ampat"], region: "Eastern Indonesia, Raja Ampat, Banda and Papua",
    before: BALI_BEFORE, after: SUMBA_AFTER,
    note: "A private charter: start with a Bali night, then fly on to meet her. On Komodo routes, Sumba is the natural place to finish." },
  { vessel: "celestia-yacht", embark: null, seasons: ["komodo", "raja-ampat"], region: "Raja Ampat, Komodo and the Spice Islands",
    before: BALI_BEFORE, after: SUMBA_AFTER,
    note: "A private charter: start with a Bali night, then fly on to meet her. On Komodo routes, Sumba is the natural place to finish." },
  { vessel: "amandira", embark: null, seasons: [], region: "Aman's phinisi in Indonesian waters",
    before: ["amandari"], after: ["amanwana"],
    note: "Pair her with Aman on land: Amandari in Ubud before you sail." },
];

/** Stays on Bali, by library slug: "Continue by sea" shows every Indonesian vessel with her season. */
export const BALI_STAYS = new Set([
  "como-shambhala-estate", "como-uma-canggu", "como-uma-ubud", "ungasan-clifftops", "tanah-gajah", "viceroy-bali", "soori-bali",
  "kayumanis-ubud", "kayumanis-sanur", "kayumanis-nusa-dua", "kayumanis-jimbaran-private-estates", "capella-ubud", "bambu-indah", "amandari", "anantara-ubud-bali",
]);
/** Sumba and Rote: "Continue by sea" shows the vessels that sail Komodo. */
export const SUMBA_STAYS = new Set(["nihi", "cap-karoso", "nihi-rote"]);
/** NIHI Rote also points to "the other NIHI": Wings Air flies Kupang to Tambolaka on Tuesdays, Thursdays and Saturdays (nihi.com). */
export const SISTER: Record<string, { slug: string; line: string }> = {
  "nihi-rote": { slug: "nihi", line: "The other NIHI: Wings Air flies Kupang to Tambolaka on Tuesdays, Thursdays and Saturdays, per NIHI." },
};

/** The about 14-night Indonesia route (B7, block 3). Night counts for the boat and Sumba legs are James's to set. */
export const ROUTE: { leg: string; nights: number | null; options: string[] }[] = [
  { leg: "Ubud", nights: 3, options: ["capella-ubud", "amandari", "tanah-gajah"] },
  { leg: "The coast", nights: 2, options: ["soori-bali", "ungasan-clifftops"] },
  { leg: "Komodo by phinisi, from Labuan Bajo", nights: null, options: ["mutiara-laut", "celestia-yacht", "silolona-sojourns"] },
  { leg: "Sumba", nights: null, options: ["nihi", "cap-karoso"] },
];

export const pairingFor = (vessel: string) => PAIRINGS.find((p) => p.vessel === vessel);
export const vesselsFor = (stay: string) =>
  BALI_STAYS.has(stay) ? PAIRINGS : SUMBA_STAYS.has(stay) ? PAIRINGS.filter((p) => p.seasons.includes("komodo")) : [];
