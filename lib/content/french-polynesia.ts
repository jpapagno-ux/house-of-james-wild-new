// French Polynesia (Tahiti): the lagoon views, the inter-island network and the island-hopping routes
// (James, 2 Nov 2026). Pure data, no imports, so tests read it with plain Node.
//
// Sources, and only these (CLAUDE.md, "Sources"):
//   • map points: Tahiti Tourisme's own map links (tahititourisme.com natural heritage and points of interest),
//     each brand's published coordinates for its pin, and UNESCO's property maps;
//   • flight times and routes: Air Tahiti (airtahiti.com archipelago pages and passes);
//   • boat times: Tahiti Tourisme (getting from island to island; Taha'a getting there) and the Apetahi
//     Express listing on tahititourisme.com;
//   • offers: the brand's own pages. The Islands Dream Offer is published "all year round" with no end date.
// Airport positions are the published airfield locations, shown only as the network's nodes.
// Reef and lagoon rings are INDICATIVE outlines drawn by hand from each island's shape (the 1:10m land stock is too
// coarse for atolls); the page labels them so. Nothing here is a navigation chart.

export type LatLng = { lat: number; lng: number };
export type PointKind = "dive" | "snorkel" | "surf" | "unesco";
export type MapPoint = LatLng & { name: string; kind: PointKind; line: string; source: string };
export type Lagoon = {
  key: "tahaa" | "bora-bora" | "tikehau" | "fakarava" | "rangiroa" | "tahiti-iti";
  label: string; archipelago: string; sub: string;
  /** Indicative reef ring, [lng, lat] pairs, closed. */
  reef?: [number, number][];
  /** Labels for land and water inside the frame (names only, no claims). */
  labels: { text: string; lng: number; lat: number; kind: "land" | "water" | "town" }[];
  points: MapPoint[];
  /** Stays in the Ledger here: slugs from the library export (pins come from each record's coordinates). */
  stays: string[];
  /** Stays here whose brand has not published a position yet: listed under the map, never pinned. */
  awaitingPins: { name: string; where: string; href?: string }[];
  when: string; getThere: string;
};

const TT = "Tahiti Tourisme map link";

export const TEAHUPOO: MapPoint = { name: "Teahupo'o Point", kind: "surf", lat: -17.87061, lng: -149.20154, line: "A powerful left off Tahiti Iti; its biggest swells come May to October, and it hosts a contest each August.", source: `${TT}: tahititourisme.com/natural-heritage/teahupoo-point/` };

export const LAGOONS: Lagoon[] = [
  {
    key: "tahaa", label: "Taha'a", archipelago: "Society Islands",
    sub: "Taha'a shares one lagoon with Raiatea. The Coral Garden lies between two motu on the west side, beside Le Taha'a; Vahine sits on its own motu to the north west. Taha'a has no airport: fly to Raiatea, then about 30 minutes by boat.",
    reef: [[-151.62, -16.6], [-151.6, -16.55], [-151.48, -16.52], [-151.4, -16.56], [-151.36, -16.66], [-151.33, -16.78], [-151.35, -16.92], [-151.42, -16.97], [-151.5, -16.93], [-151.55, -16.82], [-151.58, -16.7], [-151.62, -16.6]],
    labels: [{ text: "Taha'a", lng: -151.49, lat: -16.63, kind: "land" }, { text: "Raiatea", lng: -151.44, lat: -16.83, kind: "land" }, { text: "Uturoa", lng: -151.42, lat: -16.735, kind: "town" }, { text: "The shared lagoon", lng: -151.55, lat: -16.75, kind: "water" }],
    points: [
      { name: "The Coral Garden (Jardin de Corail)", kind: "snorkel", lat: -16.604588, lng: -151.56505, line: "Shallow, clear water between two motu on Taha'a's west coast; drift with the current over the coral.", source: `${TT}: tahititourisme.com/natural-heritage/jardin-de-corail/` },
    ],
    stays: ["pearl-resort-vahine-private-island"],
    awaitingPins: [{ name: "Le Taha'a by Pearl Resorts", where: "On Motu Tautau, with the Coral Garden reached straight from the resort", href: "/stays/le-tahaa" }],
    when: "Lagoon outings are best May to October, the dry season; snorkelling is good all year (Tahiti Tourisme).",
    getThere: "Air Tahiti to Raiatea, 40 to 45 minutes from Tahiti, or direct from Bora Bora; then about 30 minutes by boat, usually arranged by your hotel.",
  },
  {
    key: "bora-bora", label: "Bora Bora", archipelago: "Society Islands",
    sub: "Mount Otemanu inside a ring of motu. The airport is on Motu Mute in the north; the resorts sit on the motu and look back at the mountain.",
    reef: [[-151.815, -16.5], [-151.8, -16.43], [-151.73, -16.415], [-151.68, -16.44], [-151.675, -16.5], [-151.7, -16.55], [-151.74, -16.567], [-151.79, -16.55], [-151.815, -16.5]],
    labels: [{ text: "Bora Bora", lng: -151.745, lat: -16.5, kind: "land" }, { text: "Vaitape", lng: -151.755, lat: -16.512, kind: "town" }, { text: "Lagoon", lng: -151.71, lat: -16.47, kind: "water" }],
    points: [],
    stays: ["the-st-regis-bora-bora-resort"],
    awaitingPins: [
      { name: "Le Bora Bora by Pearl Resorts", where: "Motu Tevairoa, facing Mount Otemanu", href: "/stays/pearl-resort-le-bora-bora" },
      { name: "Conrad Bora Bora Nui", where: "Its own motu with a hill", href: "/stays/conrad-bora-bora-nui" },
    ],
    when: "Dry season May to October is best for lagoon outings; whales pass July to November (Tahiti Tourisme).",
    getThere: "Air Tahiti from Tahiti in 50 minutes, more than 10 flights a day; direct flights also link Bora Bora with Raiatea, Huahine, Maupiti, Moorea, Rangiroa, Tikehau and Fakarava.",
  },
  {
    key: "tikehau", label: "Tikehau", archipelago: "Tuamotu",
    sub: "A near-round atoll of pink sand motu. Le Tikehau sits on motu Tianoa, a 15 minute boat ride from the village.",
    reef: Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * 2 * Math.PI; return [+(-148.17 + 0.13 * Math.cos(a)).toFixed(4), +(-15.005 + 0.112 * Math.sin(a)).toFixed(4)] as [number, number]; }),
    labels: [{ text: "Tikehau lagoon", lng: -148.17, lat: -15.0, kind: "water" }],
    points: [],
    stays: ["pearl-resort-le-tikehau"],
    awaitingPins: [],
    when: "Good all year; the warmest water is November to April, and it is quieter September to November and February to April (Tahiti Tourisme).",
    getThere: "Air Tahiti from Tahiti, under an hour per Le Tikehau, or direct from Bora Bora; Air Tahiti's TUAMOTU pass covers two or three of Rangiroa, Tikehau and Fakarava.",
  },
  {
    key: "fakarava", label: "Fakarava", archipelago: "Tuamotu",
    sub: "A long rectangular atoll inside a UNESCO biosphere reserve. Garuae, the north pass, is the widest in French Polynesia; the wall of grey sharks is by Tumakohua, the south pass.",
    reef: [[-145.7, -16.03], [-145.58, -16.02], [-145.42, -16.15], [-145.34, -16.35], [-145.36, -16.47], [-145.45, -16.545], [-145.52, -16.5], [-145.6, -16.35], [-145.7, -16.15], [-145.7, -16.03]],
    labels: [{ text: "Fakarava lagoon", lng: -145.55, lat: -16.27, kind: "water" }, { text: "Commune of Fakarava Biosphere Reserve (UNESCO)", lng: -145.62, lat: -16.56, kind: "water" }],
    points: [
      { name: "Le Mur de Requins Gris, Tumakohua Pass", kind: "dive", lat: -16.52336, lng: -145.45749, line: "Over 700 grey sharks in June and July; for divers aged 12 and over at level 1.", source: `${TT}: tahititourisme.com/natural-heritage/le-mur-de-requins-gris/` },
    ],
    stays: [],
    awaitingPins: [{ name: "Raimiti", where: "South Fakarava; filed in the library, page coming once the brand's own facts are in" }],
    when: "Diving all year; grouper spawning at Fakarava in June (Tahiti Tourisme).",
    getThere: "Air Tahiti from Tahiti, 1 hour 10 minutes direct, 375 km; direct from Bora Bora too.",
  },
  {
    key: "rangiroa", label: "Rangiroa", archipelago: "Tuamotu",
    sub: "One of the largest atolls in the world. Tiputa Pass on the north rim is the famous drift dive; the Coral Garden is across the lagoon on the south west side.",
    reef: [[-147.95, -15.1], [-147.92, -15.05], [-147.8, -14.96], [-147.6, -14.95], [-147.4, -14.98], [-147.25, -15.05], [-147.2, -15.13], [-147.3, -15.2], [-147.5, -15.26], [-147.66, -15.26], [-147.85, -15.18], [-147.95, -15.1]],
    labels: [{ text: "Rangiroa lagoon", lng: -147.6, lat: -15.1, kind: "water" }, { text: "Avatoru", lng: -147.72, lat: -14.94, kind: "town" }, { text: "Tiputa", lng: -147.61, lat: -14.985, kind: "town" }],
    points: [
      { name: "Tiputa Pass", kind: "dive", lat: -14.972144, lng: -147.6289, line: "Dolphins, sharks and mantas in the pass, 12 to 46 m.", source: `${TT}: tahititourisme.com/natural-heritage/passe-de-tiputa/` },
      { name: "The Coral Garden, Rangiroa", kind: "snorkel", lat: -15.230357, lng: -147.66078, line: "Reefs and tropical fish on the south west side, reached by boat across the lagoon from the Tiputa quay.", source: `${TT}: tahititourisme.pf, le Jardin de Corail Rangiroa` },
    ],
    stays: [],
    awaitingPins: [],
    when: "Diving all year; the warmest water is November to April (Tahiti Tourisme).",
    getThere: "Air Tahiti from Tahiti in about 1 hour, or direct from Bora Bora.",
  },
  {
    key: "tahiti-iti", label: "Tahiti & Tahiti Iti", archipelago: "Society Islands",
    sub: "Every international flight lands at Faa'a. Tahiti Iti, the smaller peninsula, ends at Teahupo'o, the wave that brought James here in 1995.",
    labels: [{ text: "Tahiti Nui", lng: -149.43, lat: -17.66, kind: "land" }, { text: "Tahiti Iti", lng: -149.25, lat: -17.79, kind: "land" }, { text: "Papeete", lng: -149.57, lat: -17.535, kind: "town" }],
    points: [TEAHUPOO],
    stays: ["intercontinental-tahiti-resort-spa", "pearl-resort-le-tahiti"],
    awaitingPins: [{ name: "Vanira Lodge", where: "In the hills above Teahupo'o; filed in the library, page coming once the brand's own facts are in" }],
    when: "Dry May to October; Teahupo'o's southern swells come May to October (Tahiti Tourisme).",
    getThere: "Tahiti Faa'a (PPT): nonstop from Los Angeles in about 8 hours, San Francisco about 8h30, Honolulu about 6.",
  },
];

/* The inter-island network ------------------------------------------------------- */
export type Node = LatLng & { code: string; name: string; group: "Society" | "Tuamotu" | "Marquesas"; airport: boolean };
export const NODES: Node[] = [
  { code: "PPT", name: "Tahiti (Faa'a)", group: "Society", lat: -17.5537, lng: -149.6067, airport: true },
  { code: "MOZ", name: "Moorea", group: "Society", lat: -17.49, lng: -149.762, airport: true },
  { code: "HUH", name: "Huahine", group: "Society", lat: -16.6872, lng: -151.0217, airport: true },
  { code: "RFP", name: "Raiatea", group: "Society", lat: -16.7229, lng: -151.4658, airport: true },
  { code: "TAA", name: "Taha'a", group: "Society", lat: -16.62, lng: -151.5, airport: false },
  { code: "BOB", name: "Bora Bora", group: "Society", lat: -16.4444, lng: -151.7513, airport: true },
  { code: "MAU", name: "Maupiti", group: "Society", lat: -16.4265, lng: -152.2437, airport: true },
  { code: "RGI", name: "Rangiroa", group: "Tuamotu", lat: -14.9543, lng: -147.6608, airport: true },
  { code: "TIH", name: "Tikehau", group: "Tuamotu", lat: -15.1196, lng: -148.231, airport: true },
  { code: "FAV", name: "Fakarava", group: "Tuamotu", lat: -16.0541, lng: -145.6569, airport: true },
  { code: "NHV", name: "Nuku Hiva", group: "Marquesas", lat: -8.7956, lng: -140.2289, airport: true },
  { code: "AUQ", name: "Hiva Oa", group: "Marquesas", lat: -9.7688, lng: -139.011, airport: true },
];
export type Leg = { from: string; to: string; mode: "air" | "boat"; time: string | null; note?: string; source: string };
const AT = "Air Tahiti, airtahiti.com";
const AT_BOB = "Air Tahiti: Bora Bora's direct links (Society Islands page)";
export const LEGS: Leg[] = [
  { from: "PPT", to: "MOZ", mode: "air", time: "15 min", source: AT },
  { from: "PPT", to: "HUH", mode: "air", time: "40 to 45 min", source: AT },
  { from: "PPT", to: "RFP", mode: "air", time: "40 to 45 min", source: AT },
  { from: "PPT", to: "BOB", mode: "air", time: "50 min", note: "More than 10 flights a day", source: AT },
  { from: "PPT", to: "MAU", mode: "air", time: "55 min", source: AT },
  { from: "PPT", to: "RGI", mode: "air", time: "1 hour", source: AT },
  { from: "PPT", to: "FAV", mode: "air", time: "1h10", note: "375 km, direct", source: AT },
  { from: "PPT", to: "TIH", mode: "air", time: null, note: "308 km; under an hour, per Le Tikehau", source: AT },
  { from: "PPT", to: "NHV", mode: "air", time: null, note: "Several times a week, direct or with stops; about 1,406 km", source: AT },
  { from: "PPT", to: "AUQ", mode: "air", time: null, note: "Several times a week, direct or with stops; about 1,184 km", source: AT },
  ...(["RFP", "HUH", "MAU", "MOZ", "RGI", "TIH", "FAV"] as const).map((to): Leg => ({ from: "BOB", to, mode: "air", time: null, note: "Direct, no change in Tahiti", source: AT_BOB })),
  { from: "PPT", to: "MOZ", mode: "boat", time: "About 30 min", note: "Several ferries a day from Papeete", source: "Tahiti Tourisme, getting from island to island" },
  { from: "RFP", to: "TAA", mode: "boat", time: "About 30 min", note: "Usually arranged by your hotel", source: "Tahiti Tourisme, getting to Taha'a" },
  { from: "PPT", to: "HUH", mode: "boat", time: "3h30", note: "Apetahi Express, 2 or 3 sailings a week", source: "Apetahi Express, via tahititourisme.com" },
  { from: "HUH", to: "RFP", mode: "boat", time: "1 hour", note: "Apetahi Express", source: "Apetahi Express, via tahititourisme.com" },
  { from: "TAA", to: "BOB", mode: "boat", time: "1 hour", note: "Apetahi Express", source: "Apetahi Express, via tahititourisme.com" },
];

/* Island-hopping routes (the review's seven, Tahiti > Taha'a > Bora Bora first) --- */
export type Hop = { from: string; to: string; mode: "air" | "boat"; time: string | null; stays?: string[] };
export type Route = { key: string; name: string; line: string; nights: string; hops: Hop[]; stays: { slug: string; name: string }[]; note?: string; offer?: string; ships?: string[] };
const S = (slug: string, name: string) => ({ slug, name });
export const ROUTES: Route[] = [
  {
    key: "tahiti-tahaa-bora-bora", name: "Tahiti, Taha'a, Bora Bora", nights: "8 to 10 nights",
    line: "The house's first route: a night on Tahiti, the Taha'a lagoon (James's favourite island) and then Bora Bora. Raiatea and Bora Bora are linked direct by Air Tahiti, so there is no need to go back through Tahiti.",
    hops: [{ from: "PPT", to: "RFP", mode: "air", time: "40 to 45 min" }, { from: "RFP", to: "TAA", mode: "boat", time: "About 30 min" }, { from: "RFP", to: "BOB", mode: "air", time: null }, { from: "BOB", to: "PPT", mode: "air", time: "50 min" }],
    stays: [S("intercontinental-tahiti-resort-spa", "InterContinental Tahiti"), S("le-tahaa", "Le Taha'a"), S("pearl-resort-vahine-private-island", "Vahine Private Island"), S("pearl-resort-le-bora-bora", "Le Bora Bora"), S("the-st-regis-bora-bora-resort", "The St. Regis Bora Bora")],
    offer: "Pair Le Taha'a with Le Bora Bora and Pearl's Islands Dream Offer takes 25% off accommodation.",
  },
  {
    key: "pearl-two-resorts", name: "Two Pearl resorts, one offer", nights: "6 to 8 nights",
    line: "Pearl's Islands Dream Offer: book at least one night at Le Bora Bora and one at Le Taha'a, Le Tikehau, Le Tahiti or Le Nuku Hiva, and accommodation is 25% off (10% on Le Nuku Hiva's package).",
    hops: [{ from: "PPT", to: "BOB", mode: "air", time: "50 min" }, { from: "BOB", to: "RFP", mode: "air", time: null }, { from: "RFP", to: "TAA", mode: "boat", time: "About 30 min" }, { from: "RFP", to: "PPT", mode: "air", time: "40 to 45 min" }],
    stays: [S("pearl-resort-le-bora-bora", "Le Bora Bora"), S("le-tahaa", "Le Taha'a"), S("pearl-resort-le-tikehau", "Le Tikehau")],
    offer: "Islands Dream Offer: Pearl publishes it as available all year round, with no end date; not retroactive, booked through Pearl's reservations team, not combinable with other offers.",
  },
  {
    key: "lagoon-to-atoll", name: "Lagoon to atoll", nights: "7 to 9 nights",
    line: "Bora Bora's lagoon, then a Tuamotu atoll without going back through Tahiti: Air Tahiti flies Bora Bora to Tikehau direct.",
    hops: [{ from: "PPT", to: "BOB", mode: "air", time: "50 min" }, { from: "BOB", to: "TIH", mode: "air", time: null }, { from: "TIH", to: "PPT", mode: "air", time: null }],
    stays: [S("pearl-resort-le-bora-bora", "Le Bora Bora"), S("conrad-bora-bora-nui", "Conrad Bora Bora Nui"), S("pearl-resort-le-tikehau", "Le Tikehau")],
    offer: "Le Bora Bora and Le Tikehau together qualify for Pearl's Islands Dream Offer.",
  },
  {
    key: "tuamotu-dive", name: "The Tuamotu passes", nights: "8 to 12 nights",
    line: "Rangiroa's Tiputa Pass, the grey sharks at Fakarava's Tumakohua Pass and Tikehau's lagoon. Air Tahiti's TUAMOTU pass covers two or three of the three atolls.",
    hops: [{ from: "PPT", to: "RGI", mode: "air", time: "1 hour" }, { from: "RGI", to: "FAV", mode: "air", time: null }, { from: "FAV", to: "PPT", mode: "air", time: "1h10" }],
    stays: [S("pearl-resort-le-tikehau", "Le Tikehau")],
    note: "Air Tahiti publishes its passes as closed circuits from Tahiti, each island once, 28 days at most. James plans the order of the atolls for your dates.",
  },
  {
    key: "stay-before-you-sail", name: "Stay before you sail", nights: "9 to 11 nights",
    line: "A night on Tahiti, a week with Windstar from Papeete, then Taha'a: from March 2027 Wind Star's Dreams of Tahiti calls at Raiatea every week, across the lagoon from Taha'a.",
    hops: [{ from: "PPT", to: "RFP", mode: "air", time: "40 to 45 min" }, { from: "RFP", to: "TAA", mode: "boat", time: "About 30 min" }],
    stays: [S("intercontinental-tahiti-resort-spa", "InterContinental Tahiti"), S("pearl-resort-le-tahiti", "Le Tahiti"), S("le-tahaa", "Le Taha'a")],
    ships: ["star-breeze", "wind-star"],
  },
  {
    key: "slow-ferry", name: "The slow way, by sea", nights: "10 nights or more",
    line: "The Apetahi Express links Tahiti, Huahine, Raiatea, Taha'a and Bora Bora by sea, two or three times a week: Tahiti to Huahine 3h30, then an hour between each island.",
    hops: [{ from: "PPT", to: "HUH", mode: "boat", time: "3h30" }, { from: "HUH", to: "RFP", mode: "boat", time: "1 hour" }, { from: "RFP", to: "TAA", mode: "boat", time: "About 30 min" }, { from: "TAA", to: "BOB", mode: "boat", time: "1 hour" }, { from: "BOB", to: "PPT", mode: "air", time: "50 min" }],
    stays: [S("le-tahaa", "Le Taha'a"), S("pearl-resort-le-bora-bora", "Le Bora Bora")],
    note: "Apetahi Express publishes its frequency inconsistently (two or three round trips a week); James confirms the sailing days.",
  },
  {
    key: "marquesas", name: "The Marquesas", nights: "5 nights or more",
    line: "Te Henua Enata, the Marquesas Islands, a UNESCO World Heritage property since 2024. Air Tahiti flies from Tahiti several times a week, and its MARQUESAS pass covers Nuku Hiva and Hiva Oa.",
    hops: [{ from: "PPT", to: "NHV", mode: "air", time: null }, { from: "NHV", to: "AUQ", mode: "air", time: null }, { from: "AUQ", to: "PPT", mode: "air", time: null }],
    stays: [S("pearl-resort-le-nuku-hiva", "Le Nuku Hiva")],
    note: "The Marquesas are half an hour behind Tahiti. Hanakee on Hiva Oa is a Pearl property; its page follows once Pearl sends its facts and media.",
  },
];

/* UNESCO -------------------------------------------------------------------------- */
// Te Henua Enata, The Marquesas Islands (whc.unesco.org/en/list/1707/maps/): component coordinates as UNESCO lists them.
export const MARQUESAS_UNESCO: MapPoint[] = [
  ["Nuku Hiva", -8.86532, -140.12982], ["Ua Pou", -9.40458, -140.06816], ["Hiva Oa and Tahuata", -9.83294, -139.01573], ["Fatu Iva", -10.48476, -138.65558],
  ["Ua Huka (marine)", -8.91157, -139.55259], ["Eiao and Hatu Tu", -7.96989, -140.64605], ["Fatu Uku", -9.43717, -138.9276],
].map(([name, lat, lng]) => ({ name: `Te Henua Enata: ${name}`, kind: "unesco" as const, lat: lat as number, lng: lng as number, line: "A component of Te Henua Enata, The Marquesas Islands, inscribed on the World Heritage List in 2024.", source: "UNESCO World Heritage Centre, property 1707 maps" }));

export const ISLANDS_DREAM = {
  name: "Islands Dream Offer",
  headline: "25% off accommodation pairing Le Bora Bora with a second Pearl resort",
  terms: "At least one night at Le Bora Bora and one at Le Nuku Hiva, Le Taha'a, Le Tahiti or Le Tikehau; 10% off Le Nuku Hiva's package. Available all year round, as Pearl publishes it (no end date stated). Not retroactive; booked through Pearl's reservations team; not combinable with other offers.",
  source: "leborabora.com, Islands Dream Offer page (read 2 Nov 2026)",
  checked: "2026-11-02",
};
