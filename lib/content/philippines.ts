// The Philippines section (James, 2 Nov 2026: a flagship, rich Philippines section; every suggested stay and
// suggestion approved). What the country page adds on top of the shared template: approximate positions for
// stays whose brands publish no pin, the dive flags, the island groups, the gateway hotels, the private islands
// and the Palawan route. Facts are the brands' own (stays) and the Department of Tourism's or UNESCO's (places).
// Pure module: no imports at run time.

/** Where a stay sits when its brand publishes no pin: the island or town the brand names, never a guessed
 *  address. The map labels these "approximate" until a pin is filed in the Ledger. */
export const APPROX: Record<string, { lat: number; lng: number; where: string }> = {
  "el-nido-resorts-miniloc-island": { lat: 11.15, lng: 119.318, where: "Miniloc Island, El Nido" },
  "discovery-coron": { lat: 12.0, lng: 120.19, where: "Coron" },
  "two-seasons-coron-island-resort": { lat: 11.81, lng: 120.15, where: "Bulalacao Island, south of Coron" },
  "sangat-island-dive-resort": { lat: 11.87, lng: 120.06, where: "Sangat Island, Coron Bay" },
  amanpulo: { lat: 11.36, lng: 120.723, where: "Pamalican Island, Cuyo" },
  "kalinaw-resort": { lat: 9.79, lng: 126.155, where: "General Luna, Siargao" },
  "amun-ini-beach-resort-and-spa": { lat: 9.745, lng: 124.575, where: "Anda, Bohol" },
  "amorita-resort": { lat: 9.548, lng: 123.776, where: "Alona Beach, Panglao" },
  "bintana-sa-paraiso": { lat: 9.25, lng: 124.72, where: "Mambajao, Camiguin" },
  "the-bayleaf-intramuros": { lat: 14.59, lng: 120.975, where: "Intramuros, Manila" },
};

/** One line per dive flag, from the Department of Tourism (philippines.travel) or UNESCO. Light touch only:
 *  no operators, no packages and no liveaboards on this site. */
export const DIVE_FLAGS: { name: string; where: string; line: string; source: string }[] = [
  { name: "Tubbataha Reefs", where: "Sulu Sea", line: "A UNESCO marine park far out in the Sulu Sea, home to about 360 coral species. Shown on the map only.", source: "UNESCO" },
  { name: "Coron wrecks", where: "Calamian Islands, Palawan", line: "Japanese supply ships sunk in 1944, with the Skeleton Wreck in snorkel reach; best visibility March to May.", source: "Department of Tourism" },
  { name: "Apo Island", where: "off Dauin, Negros Oriental", line: "A community-led marine sanctuary of over 400 coral species and turtles; best November to May.", source: "Department of Tourism" },
  { name: "Moalboal", where: "Cebu", line: "The year-round sardine run off Panagsama Beach and the walls of Pescador Island; best diving March to May.", source: "Department of Tourism" },
  { name: "Anilao", where: "Batangas, Luzon", line: "Known as the nudibranch capital of the world, in the Verde Island Passage; macro diving year round.", source: "Department of Tourism" },
  { name: "Balicasag Island", where: "off Panglao, Bohol", line: "Listed by Bohol's tourism page as one of the island's popular dives.", source: "Department of Tourism" },
];

/** Where to stay, island by island. Slugs that are not yet released simply do not show. */
export const ISLAND_GROUPS: { key: string; name: string; line: string; slugs: string[] }[] = [
  { key: "el-nido", name: "El Nido and Taytay", line: "Bacuit Bay's limestone islands, best December to April. Fly into Lio (ENI); Taytay is an hour or so further by road and boat.", slugs: ["el-nido-resorts-pangulasian-island", "el-nido-resorts-lagen-island", "el-nido-resorts-miniloc-island", "cauayan-boutique-private-island", "flower-island-resort", "el-nido-resorts-apulit-island"] },
  { key: "calamian", name: "Coron and the Calamian Islands", line: "Lagoons, lakes and the 1944 wrecks, best late November to May. Fly into Busuanga (USU).", slugs: ["two-seasons-coron-island-resort", "sangat-island-dive-resort", "discovery-coron", "huma-island-resort-and-spa", "ariara-island", "busuanga-bay-lodge"] },
  { key: "cuyo", name: "Cuyo and the Sulu Sea", line: "Private islands reached by their own flights or by helicopter.", slugs: ["amanpulo", "banwa-private-island"] },
  { key: "siargao", name: "Siargao", line: "Cloud 9 and the surf coast. The Department of Tourism gives March to September for the dry season and September to November for surf.", slugs: ["nay-palad-hideaway", "kalinaw-resort"] },
  { key: "visayas", name: "Bohol and Negros", line: "Panglao's beaches, Anda's quiet east coast and Dauin across from Apo Island.", slugs: ["amorita-resort", "amun-ini-beach-resort-and-spa", "atmosphere-resorts-and-spa"] },
  { key: "camiguin", name: "Camiguin", line: "A small volcanic island in the Bohol Sea, with hot springs and White Island offshore.", slugs: ["bintana-sa-paraiso"] },
];

/** First and last nights. Puerto Princesa is a known gap: no house hotel is filed there yet (James, 2 Nov 2026). */
export const GATEWAYS: { slug: string; city: string; line: string }[] = [
  { slug: "hotel-okura-manila", city: "Manila", line: "Opposite NAIA Terminal 3, for an early domestic flight." },
  { slug: "the-bayleaf-intramuros", city: "Manila", line: "Inside the walled city, for a first or last day in old Manila." },
  { slug: "the-peninsula-manila", city: "Manila", line: "Makati's grand hotel." },
  { slug: "shangri-la-mactan-cebu", city: "Cebu", line: "A beach night on Mactan, by the Cebu hub." },
  { slug: "busuanga-bay-lodge", city: "Busuanga", line: "Between Coron's airport and the islands." },
];

/** Whole islands, or islands with a single resort. */
export const PRIVATE_ISLANDS = ["amanpulo", "banwa-private-island", "ariara-island", "cauayan-boutique-private-island", "flower-island-resort"];

/** The Palawan route (built like the Central America overland routes): El Nido, TAO to Coron, a private island.
 *  Every time and leg is the brand's own; nights are left to the plan. */
export const PALAWAN_ROUTE: { step: number; title: string; where: string; line: string; stays: string[]; voyage?: string }[] = [
  { step: 1, title: "El Nido and Bacuit Bay", where: "El Nido, Palawan", line: "Fly into Lio Airport (ENI). Pangulasian and Lagen are reached from the Lio jetty; Cauayan is 20 to 30 minutes by boat from El Nido Port.", stays: ["el-nido-resorts-pangulasian-island", "el-nido-resorts-lagen-island", "cauayan-boutique-private-island"] },
  { step: 2, title: "By bangka to Coron with TAO", where: "Linapacan and west Busuanga", line: "TAO's Tao Original: four days and four nights by local bangka through Linapacan, south Culion and west Busuanga, with nights in TAO's own island camps, arriving in Coron town at about noon. The Tao Ultimate adds Bacuit Bay for six nights.", stays: [], voyage: "tao-philippines" },
  { step: 3, title: "Coron and the Calamian Islands", where: "Coron, Busuanga", line: "The wrecks and lagoons from Two Seasons or Sangat, or a night at Busuanga Bay Lodge by the airport.", stays: ["two-seasons-coron-island-resort", "sangat-island-dive-resort", "busuanga-bay-lodge"] },
  { step: 4, title: "A private island to finish", where: "Cuyo or the Sulu Sea", line: "Busuanga has flights to Clark, where Amanpulo's own flight leaves for Pamalican, about 90 minutes. Or Banwa, by direct helicopter.", stays: ["amanpulo", "banwa-private-island"] },
];

/** The founder advisor on the Philippines page (James, 2 Nov 2026). He has not dived the Philippines: never say so. */
export const FOUNDER_LINE = "Surfer and diver for 44 years. Palawan is next on his own list.";

/** A Coral Triangle route linking the Philippines, Indonesia and beyond: the slot renders only once it exists. */
export const CORAL_TRIANGLE_ROUTE: { href: string; title: string; line: string } | null = null;
