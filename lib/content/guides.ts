import type { TripImg } from "./trips";
import PLACES from "./places-library.json" with { type: "json" };

// Destination guides: search-led pages for places people look up by name
// ("Raja Ampat travel guide", "best time to visit Komodo"). Facts are sourced
// (see `sources`); anything that changes often, like park fees, is stated as
// "confirmed when you book", never as a number we can't keep current.
// Guide copy (first-visit points, who-it-suits lines, the house's pick) signed
// off by James, 27 Oct 2026. His own lines come from his route files only.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/";
const FIX = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg/";
const KOM = `${FIX}wildco/voyages/vessels/aliikai/komodo/`;
const ALI = `${FIX}wildco/voyages/vessels/aliikai/`;
const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export type Guide = {
  slug: string; region: string; country: string;
  /** The guide this one sits inside (Raja Ampat → indonesia), or a library country slug (Rapa Nui → chile). */
  parent?: string;
  /** Permanent Ledger ID (DST-…), issued by the library once the place has its own Destination record. */
  ledgerId?: string | null;
  name: string; path: string;
  /** Page chrome: "sea" is the voyage navy the Indonesia guides use; "stays" is Volume I's green. Defaults to "sea". */
  theme?: "sea" | "stays";
  /** A Ledger chart inset (lib/charts/regions.json via IslandZoom) drawn under the facts: island groups too small for the country chart. */
  zoom?: "galapagos" | "rapa-nui";
  /** A flyover from the continent into a close chart (lib/content/flyovers.ts), drawn under the facts. */
  flyover?: "atacama-uyuni" | "rapa-nui";
  /** Stays the house has selected for this place (slugs from the library export). The place exists with or without them. */
  stays?: string[];
  /** IMAGE FOLLOW-UP: no landscape photography of its own yet, so the hero borrows this stay's own frames (lib/content/guide-slides.ts). */
  slidesFromStay?: { slug: string; alt: string; credit: string };
  /** "Continue through …": the next places in the same country, as plain links. */
  onward?: { name: string; href: string; line: string }[];
  /** Eyebrow over that section (default: "Continue through {parent}"). */
  onwardEyebrow?: string;
  /** The eyebrow over the founder's testimony, when he has not been (default: "Vetted in person · the founder's testimony"). */
  proofEyebrow?: string;
  seo: { title: string; description: string; keywords: string[] };
  eyebrow: string; h1: string; tagline: string;
  slides: TripImg[];
  answer: string;
  facts: [string, string][];
  proof: string;
  months: { area: string; note: string; months: Month[] }[];
  airports: [string, string][]; transfers: [string, string][];
  highlights: { title: string; line: string; body: string; image?: TripImg; voyage?: string }[];
  firstTime?: { title: string; intro: string; points: [string, string][] };
  suits: { who: string; line: string; href?: string; label?: string }[];
  howTo: { title: string; intro: string; options: { name: string; body: string; href?: string; label?: string }[] };
  places?: { name: string; href: string; line: string; image: TripImg; best: string }[];
  voyageWaters: string[]; // which journeysFor("indonesia") cards to show (match on eyebrow)
  faqs: { q: string; a: string }[];
  geo: { lat: number; lng: number };
  sources: { title: string; url: string }[];
};

const COMPARE: { label: string; raja: string; komodo: string }[] = [
  { label: "Best months", raja: "October to April", komodo: "May to September (dry season)" },
  { label: "Getting there", raja: "Fly to Sorong, usually via Jakarta or Makassar", komodo: "Fly to Labuan Bajo, a short hop from Bali" },
  { label: "What it's famous for", raja: "Karst lagoons, the richest reefs on Earth, birds of paradise", komodo: "Komodo dragons, Padar's ridges, Pink Beach, mantas" },
  { label: "In the water", raja: "Gentler currents, warm water, snorkelling every day", komodo: "Stronger currents at the big dive sites, cooler and clearer water" },
  { label: "Feel", raja: "Remote; days without another boat", komodo: "Busier by day; quieter at anchor once the day boats go home" },
  { label: "Aboard Aliikai", raja: "7 to 11 nights, from Sorong", komodo: "3 to 7 nights, from Labuan Bajo" },
];
export const RAJA_VS_KOMODO = COMPARE;

const SOURCES_RAJA = [
  { title: "WWF: Raja Ampat, the Coral Triangle", url: "https://wwf.panda.org/knowledge_hub/where_we_work/coraltriangle/coraltrianglefacts/places/rajaampatindonesia" },
  { title: "Gecko Routes: how to get to Raja Ampat", url: "https://www.geckoroutes.com/indonesia/raja-ampat-how-to-get-there/" },
  { title: "Aliikai: 2027 rates and departures with James Wild & Co", url: "/voyages/ships/aliikai" },
];
const SOURCES_KOMODO = [
  { title: "Komodo National Park (UNESCO 1991; area and islands)", url: "https://en.wikipedia.org/wiki/Komodo_National_Park" },
  { title: "Komodo vs Raja Ampat: seasons and conditions", url: "https://www.komodoisland.net/komodo-vs-raja-ampat/" },
  { title: "Aliikai: 2027 rates and departures with James Wild & Co", url: "/voyages/ships/aliikai" },
];

export const GUIDES: Record<string, Guide> = {
  indonesia: {
    slug: "indonesia", region: "asia", country: "indonesia", name: "Indonesia", path: "/destinations/asia/indonesia",
    seo: {
      title: "Indonesia by Sea: Raja Ampat, Komodo & Spice Islands Guide",
      description: "Where to go in Indonesia by private phinisi: Raja Ampat, Komodo and the Spice Islands, the best months for each, how to get there and the voyages James has vetted.",
      keywords: ["Indonesia luxury travel", "Indonesia liveaboard", "Raja Ampat or Komodo", "best time to visit Indonesia", "Indonesia phinisi cruise", "Spice Islands cruise"],
    },
    eyebrow: "Destinations · Asia · Indonesia",
    h1: "Indonesia, by Sea",
    tagline: "Seventeen thousand islands, and the best of them reached by boat",
    slides: [
      { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Jungle-covered karst islands rising from turquoise lagoons in Raja Ampat, West Papua" },
      { url: `${KOM}padar-island-aerial`, alt: "Padar Island's ridges and crescent bays from the air, Komodo National Park" },
      { url: `${CLD}wildco/voyages/vessels/aliikai/DJI_0472-1`, alt: "The phinisi Aliikai under full sail from the air" },
      { url: `${CLD}wildco/voyages/home-hero/03-over-under-reef`, alt: "Half above, half below the waterline: a snorkeller over a coral reef beneath a forested island" },
    ],
    answer: "Indonesia's two great sea journeys are Raja Ampat, in West Papua, and Komodo National Park, east of Bali, with the Spice Islands of the Banda Sea between them. Raja Ampat holds the richest reefs on Earth and is best from October to April; Komodo has the dragons, Padar's ridges and the mantas, and is best from May to September. Both are best seen from a small boat. Aboard the phinisi Aliikai you can follow the seasons: Komodo in the dry months, the Spice Islands in October, Raja Ampat through the northern winter.",
    facts: [["Where", "Eastern Indonesia: West Papua, the Banda Sea and the Lesser Sundas"], ["Best for the sea", "Raja Ampat Oct–Apr · Komodo May–Sep · Banda Sea Oct"], ["Fly into", "Bali (DPS) or Jakarta (CGK), then on to Sorong or Labuan Bajo"], ["How to see it", "By small phinisi, on a shared voyage or a private charter"], ["Vetted by", "James Wild · sailed Raja Ampat aboard Aliikai, November 2024"]],
    proof: "James sailed Raja Ampat aboard the phinisi Aliikai with his son in November 2024. It's the voyage he would book again, and the reason Indonesia's sea routes are in the Ledger.",
    months: [
      { area: "Raja Ampat", note: "West Papua · calmest seas", months: M("BBBBwwwwwBBB") },
      { area: "Komodo", note: "Flores · dry season", months: M("wwgBBBBBBggw") },
      { area: "Spice Islands", note: "Banda Sea · between monsoons", months: M("wwwgwwwwwBgw") },
    ],
    airports: [["Bali (DPS)", "The usual international gateway; 1 hour on to Labuan Bajo"], ["Jakarta (CGK)", "Direct flights on to Sorong, about 4 hours"], ["Makassar (UPG)", "The common connection for Sorong, about 2 hours"]],
    transfers: [["Bali → Labuan Bajo (LBJ)", "About 1 hour by air, for Komodo"], ["Jakarta → Sorong (SOQ)", "About 4 hours, direct, for Raja Ampat"], ["Makassar → Sorong", "About 2 hours, direct"], ["Ambon (AMQ)", "The gateway for the Banda Sea and the Spice Islands"]],
    highlights: [
      { title: "Raja Ampat", line: "West Papua · Oct–Apr", body: "Karst lagoons, mantas at Arborek and the richest coral reefs on Earth, in the far east of the archipelago.", image: { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Karst islands in Raja Ampat's lagoons" } },
      { title: "Komodo National Park", line: "Flores · May–Sep", body: "Dragons on Rinca, the climb up Padar, Pink Beach and the mantas of Karang Makassar, an hour from Bali.", image: { url: `${KOM}padar-island-aerial`, alt: "Padar Island from the air" } },
      { title: "The Spice Islands", line: "Banda Sea · October", body: "Nutmeg islands, old Dutch forts and walls of coral, sailed in the short calm between the monsoons." },
    ],
    suits: [
      { who: "First-time Raja Ampat travellers", line: "The classic northern loop in the calm season, every transfer handled from Sorong.", href: "/destinations/asia/indonesia/raja-ampat", label: "Raja Ampat guide" },
      { who: "First-timers to Indonesia", line: "Komodo's best-known sights in four nights, an hour's flight from Bali.", href: "/destinations/asia/indonesia/komodo", label: "Komodo guide" },
      { who: "Divers and snorkellers", line: "The Coral Triangle's reefs, with guided diving and Nitrox aboard.", href: "/voyages/ships/aliikai", label: "Aliikai" },
      { who: "Families and private groups", line: "A whole phinisi for up to 15, on your own route.", href: "/voyages/ships/aliikai#charter", label: "Private charter" },
    ],
    howTo: {
      title: "How to See It",
      intro: "Eastern Indonesia's best places are islands without roads. The way in is a boat, and the right boat decides the trip.",
      options: [
        { name: "A shared voyage on a small phinisi", body: "Book a cabin on a fixed departure: seven cabins, fourteen guests, all meals, guided diving and snorkelling. The simplest way to see Raja Ampat or Komodo well.", href: "/voyages/ships/aliikai#departures", label: "Aliikai's 2027 dates" },
        { name: "A private charter", body: "Take the whole yacht for your family or group, and draw the route yourself. From three nights in Komodo, seven in Raja Ampat.", href: "/voyages/ships/aliikai#charter", label: "Charter Aliikai" },
        { name: "Bali before or after", body: "Most voyages connect through Bali. A few nights in Ubud or on the coast either side makes the long flights worth it.", href: "/plan", label: "Plan it with James" },
      ],
    },
    places: [
      { name: "Raja Ampat", href: "/destinations/asia/indonesia/raja-ampat", line: "The reefs at the end of the map", image: { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Raja Ampat's karst lagoons" }, best: "Oct–Apr" },
      { name: "Komodo National Park", href: "/destinations/asia/indonesia/komodo", line: "Dragons, mantas and a pink beach", image: { url: `${KOM}padar-island-aerial`, alt: "Padar Island, Komodo National Park" }, best: "May–Sep" },
    ],
    voyageWaters: ["Raja Ampat", "Komodo"],
    faqs: [
      { q: "Raja Ampat or Komodo: which is better?", a: "It depends on when you go and what you want. Raja Ampat has the richest reefs on Earth, calmer water and real remoteness, and is best from October to April. Komodo has the dragons, Padar and the mantas, is easier to reach from Bali, and is best from May to September. For a first visit to Indonesia, Komodo is the easier start; for divers and snorkellers, Raja Ampat is the one to build a trip around." },
      { q: "What is the best time to visit eastern Indonesia by boat?", a: "Raja Ampat from October to April, Komodo from May to September, and the Banda Sea in October, between the monsoons. Small ships like Aliikai move with those seasons." },
      { q: "How do you get to Raja Ampat and Komodo?", a: "For Komodo, fly to Labuan Bajo, about an hour from Bali. For Raja Ampat, fly to Sorong in West Papua, direct from Jakarta or Makassar. Boats meet you at both airports." },
      { q: "Can you combine Raja Ampat and Komodo in one trip?", a: "Yes, with a flight between Sorong and Labuan Bajo via Makassar or Bali, but the best seasons barely overlap. Most travellers choose one per trip, or sail Aliikai's Sorong–Ambon crossing in April or October to link Raja Ampat with the Banda Sea." },
      { q: "Has James been to Raja Ampat?", a: "Yes. James sailed Raja Ampat aboard the phinisi Aliikai in November 2024, and he has been designing journeys since 1983." },
    ],
    geo: { lat: -3.5, lng: 125.5 },
    sources: [...SOURCES_RAJA, ...SOURCES_KOMODO.slice(0, 2)],
  },

  "raja-ampat": {
    slug: "raja-ampat", region: "asia", country: "indonesia", parent: "indonesia", name: "Raja Ampat", path: "/destinations/asia/indonesia/raja-ampat",
    seo: {
      title: "Raja Ampat Travel Guide: Best Time, Getting There & Liveaboards",
      description: "A Raja Ampat travel guide from a founder who sailed it in 2024: the best time to visit (Oct–Apr), how to get to Sorong, Wayag and the mantas, and the voyage built for a first Raja Ampat.",
      keywords: ["Raja Ampat travel guide", "best time to visit Raja Ampat", "how to get to Raja Ampat", "Raja Ampat liveaboard", "first time Raja Ampat", "Raja Ampat itinerary", "Wayag"],
    },
    eyebrow: "Destinations · Indonesia · West Papua",
    h1: "Raja Ampat",
    tagline: "The reefs at the end of the map, and how to see them on a first visit",
    slides: [
      { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Jungle-covered karst islands rising from turquoise lagoons in Raja Ampat" },
      { url: `${CLD}wildco/voyages/home-hero/03-over-under-reef`, alt: "A snorkeller over a Raja Ampat reef, half above and half below the water" },
      { url: `${CLD}wildco/guides/raja-ampat-indonesia/destination/diver-fusiliers-reef`, alt: "A diver among a shoal of fusiliers on a Raja Ampat reef" },
      { url: `${CLD}wildco/voyages/vessels/aliikai/DJI_0472-1`, alt: "The phinisi Aliikai under full sail in Raja Ampat" },
    ],
    answer: "Raja Ampat is an archipelago of more than 1,500 islands off the western tip of New Guinea, in Indonesia's West Papua, and sits at the heart of the Coral Triangle: the wider Bird's Head Seascape holds around 75% of the world's known hard coral species. The best time to visit is October to April, when the seas are calmest. You fly to Sorong, usually via Jakarta or Makassar, and see the islands by boat: Wayag's karst lagoons, the Passage, Penemu's lookout and the mantas at Arborek. For a first visit, a small-ship voyage from Sorong is the simplest way to do it well.",
    facts: [["Where", "West Papua, Indonesia · off the Bird's Head of New Guinea"], ["Islands", "More than 1,500, in 40,000 km² of land and sea"], ["Best time", "October to April, when the seas are calmest"], ["Fly into", "Sorong (SOQ), via Jakarta or Makassar"], ["Highlights", "Wayag, the Passage, Penemu, Arborek's mantas, Misool"], ["Park fee", "A marine park fee is payable on arrival; we confirm the current amount when you book"], ["Vetted by", "James Wild · sailed it aboard Aliikai, November 2024"]],
    proof: "James sailed Raja Ampat aboard Aliikai with his son in November 2024: ten days from Sorong to the Wayag karsts and back. It's the voyage he would book again.",
    months: [
      { area: "North & central", note: "Wayag, Dampier Strait, Kri", months: M("BBBBwwwwwBBB") },
      { area: "South · Misool", note: "Calmest November to March", months: M("BBBgwwwwwgBB") },
    ],
    airports: [["Sorong (SOQ)", "The gateway; boats meet you here, the harbour is about 20 minutes away"], ["Jakarta (CGK)", "Direct to Sorong in about 4 hours"], ["Makassar (UPG)", "Direct to Sorong in about 2 hours"]],
    transfers: [["Sorong airport → harbour", "About 20 minutes; your boat's crew meets you"], ["Bali → Sorong", "About 6 hours, usually via Makassar"], ["Sorong → Waisai by ferry", "About 2 hours, if staying on land"]],
    highlights: [
      { title: "Wayag", line: "The karst maze", body: "The lookout over Raja Ampat's green karst islands, the view on every postcard. A short, steep climb; go early or at golden hour.", image: { url: `${CLD}wildco/voyages/home-hero/02-raja-ampat-lagoons`, alt: "Wayag's karst lagoons from the lookout" }, voyage: "Day 5 of the 10 Day Raja Ampat North" },
      { title: "Mantas at Arborek", line: "Dampier Strait", body: "The tides bring the plankton and the mantas come to the cleaning stations. Divers wait on the sand; snorkellers watch from the surface.", image: { url: `${CLD}wildco/voyages/home-hero/03-over-under-reef`, alt: "Snorkelling over a Raja Ampat reef" }, voyage: "Day 7" },
      { title: "The Passage", line: "Red Bird of Paradise", body: "A narrow channel between Gam and Waigeo, and the island forest above it, where the Red Bird of Paradise displays at dawn.", voyage: "Day 3" },
      { title: "Penemu", line: "The lookout", body: "Steps up through the forest to a view over limestone domes and blue lagoons, the second postcard of Raja Ampat.", voyage: "Day 4" },
      { title: "Kri and the Dampier reefs", line: "Coral and fish", body: "Some of the most fish-filled reefs in the archipelago, a short tender ride from the anchorage.", image: { url: `${CLD}wildco/guides/raja-ampat-indonesia/destination/diver-fusiliers-reef`, alt: "Fusiliers streaming past a diver" }, voyage: "Day 2" },
      { title: "Misool", line: "The south", body: "Lagoons, caves and soft-coral reefs in Raja Ampat's quieter south, sailed on the South & Central voyages." },
    ],
    firstTime: {
      title: "Your First Raja Ampat",
      intro: "Raja Ampat is a long way to go to guess. These are the choices that make a first visit work.",
      points: [
        ["Go October to April", "The northern winter brings the calmest seas and clearest water. Avoid June to September, when the southeast trade winds roughen the crossings."],
        ["See it by boat", "The famous places, Wayag, the Passage, Penemu and Arborek, are spread across hundreds of kilometres of sea. A liveaboard reaches them; a land stay reaches one corner."],
        ["Start with the north", "A Sorong round trip through the north and centre takes in the classic sights on a single loop. Save Misool for a second trip."],
        ["You don't need to dive", "Snorkelling here is as good as diving elsewhere. Kayaks and paddleboards fill the rest of the day."],
        ["Give it ten days", "Allow for the flights to Sorong. Ten days aboard leaves time to slow down once you're there."],
        ["Ask someone who's been", "James sailed this route in November 2024 and has been designing journeys since 1983. He'll tell you what he'd change."],
      ],
    },
    suits: [
      { who: "First-time Raja Ampat travellers", line: "The classic northern loop in the calm season, every transfer handled from Sorong.", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", label: "10 Day Raja Ampat North" },
      { who: "Divers and snorkellers", line: "The richest reefs on Earth, with gentle currents at most sites and warm water all season.", href: "/voyages/ships/aliikai", label: "Aliikai's dive centre" },
      { who: "Couples", line: "No signal, no traffic, one sunset an evening. Plan accordingly.", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", label: "The 10-day voyage" },
      { who: "Families and private groups", line: "Charter the whole phinisi for up to 15; minimum 7 nights in Raja Ampat.", href: "/voyages/ships/aliikai#charter", label: "Private charter" },
      { who: "Photographers", line: "Wayag at golden hour, birds of paradise at dawn, mantas over the sand." },
    ],
    howTo: {
      title: "How to See Raja Ampat",
      intro: "Three ways in, from easiest to most yours.",
      options: [
        { name: "The 10 Day Raja Ampat North, aboard Aliikai", body: "The voyage James sailed: Sorong round trip through Kri, the Passage, Penemu, Wayag, Wofoh, Arborek, Mansuar and Batanta. 2027 sailings in February, November and December, from US$7,650 per person.", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", label: "See the voyage" },
        { name: "A shorter or southern voyage", body: "Seven-night sailings through the north and centre, or south to Misool, from January to April and in December.", href: "/voyages/ships/aliikai#departures", label: "All 2027 dates" },
        { name: "The whole yacht", body: "Charter Aliikai for your family or group, minimum seven nights in Raja Ampat, and choose your own anchorages.", href: "/voyages/ships/aliikai#charter", label: "Charter Aliikai" },
      ],
    },
    voyageWaters: ["Raja Ampat"],
    faqs: [
      { q: "When is the best time to visit Raja Ampat?", a: "October to April, when the seas are calmest and the water clearest. June to September brings the southeast trade winds and rougher crossings, and most small ships, Aliikai included, sail elsewhere then." },
      { q: "How do you get to Raja Ampat?", a: "Fly to Sorong (SOQ) in West Papua, direct from Jakarta in about four hours or from Makassar in about two; from Bali it's usually about six hours with a connection. Liveaboards meet you at Sorong airport, about 20 minutes from the harbour." },
      { q: "Is Raja Ampat good for a first-time visitor?", a: "Yes, if you go in season and see it by boat. A ten-day voyage from Sorong through the north takes in Wayag, the Passage, Penemu and the mantas at Arborek on one loop, with the crew handling every transfer." },
      { q: "Do I need to dive to enjoy Raja Ampat?", a: "No. The snorkelling is world class, and kayaks and paddleboards fill the rest of the day. Diving is guided, with Nitrox, for certified divers who want it." },
      { q: "How many days do you need in Raja Ampat?", a: "Seven nights at the least; ten days is better, because the flights to Sorong take a day each way. Aliikai sails seven, eight, nine and eleven-night voyages here." },
      { q: "Is there a fee to visit Raja Ampat?", a: "Yes. Visitors pay a marine park fee, which funds the protected areas. The amount has changed in recent years, so we confirm the current fee when you book." },
      { q: "How much does a Raja Ampat liveaboard cost?", a: "Aboard Aliikai in 2027, from US$5,950 per person for seven nights and US$7,650 for the ten-day Raja Ampat North, in an ocean-view cabin, double occupancy, plus 11% tax. Meals, guided diving and snorkelling and Sorong transfers are included." },
    ],
    geo: { lat: -0.5, lng: 130.5 },
    sources: SOURCES_RAJA,
  },

  komodo: {
    slug: "komodo", region: "asia", country: "indonesia", parent: "indonesia", name: "Komodo National Park", path: "/destinations/asia/indonesia/komodo",
    seo: {
      title: "Komodo National Park Guide: Best Time, Labuan Bajo & Boat Trips",
      description: "Komodo National Park, an hour from Bali: the best time to visit (May–Sep), getting to Labuan Bajo, Padar, Pink Beach, the mantas and the dragons of Rinca, seen by small phinisi.",
      keywords: ["Komodo National Park", "best time to visit Komodo", "Komodo boat trip from Labuan Bajo", "Komodo liveaboard", "Padar Island", "Pink Beach Komodo", "Komodo dragons Rinca"],
    },
    eyebrow: "Destinations · Indonesia · Flores",
    h1: "Komodo National Park",
    tagline: "Dragons, mantas and a pink beach, an hour's flight from Bali",
    slides: [
      { url: `${KOM}padar-island-aerial`, alt: "Padar Island's ridges and crescent bays from the air" },
      { url: `${KOM}pink-beach`, alt: "A small boat in the shallows off the pink sand of a Komodo beach" },
      { url: `${KOM}tatawa-diving`, alt: "A diver over a coral reef full of fish at Tatawa, Komodo" },
      { url: `${KOM}labuan-bajo-harbour`, alt: "Labuan Bajo harbour, Flores, the gateway to Komodo" },
    ],
    answer: "Komodo National Park lies between Sumbawa and Flores in eastern Indonesia, about an hour's flight from Bali to Labuan Bajo. Founded in 1980 and a UNESCO World Heritage Site since 1991, it covers 1,733 km² around three main islands, Komodo, Rinca and Padar, home to the Komodo dragon. The best time to visit is the dry season, May to September. The park is seen by boat from Labuan Bajo: the climb up Padar, Pink Beach, the mantas at Manta Point and Karang Makassar, and a ranger-led walk to see the dragons on Rinca.",
    facts: [["Where", "Between Sumbawa and Flores, Indonesia"], ["Protected", "National park since 1980 · UNESCO World Heritage Site since 1991"], ["Size", "1,733 km², with Komodo, Rinca and Padar the main islands"], ["Best time", "May to September, the dry season"], ["Fly into", "Labuan Bajo (LBJ), about 1 hour from Bali"], ["Park fee", "Park and ranger fees apply; we confirm current amounts when you book"], ["Vetted by", "James Wild · sailed Aliikai in Raja Ampat, 2024; this route is hers"]],
    proof: "James sailed Aliikai through Raja Ampat in November 2024. Her Komodo routes are hers, checked against her 2027 schedule; he hasn't sailed them aboard her yet, and the page says so.",
    months: [
      { area: "Komodo National Park", note: "Dry season · calm, clear days", months: M("wwgBBBBBBggw") },
    ],
    airports: [["Labuan Bajo (LBJ)", "Komodo Airport, on Flores; the harbour is a few minutes away"], ["Bali (DPS)", "The usual connection, about 1 hour to Labuan Bajo"], ["Jakarta (CGK)", "Direct flights to Labuan Bajo"]],
    transfers: [["Bali → Labuan Bajo", "About 1 hour by air"], ["Labuan Bajo airport → harbour", "Minutes; your boat's crew meets you"], ["Labuan Bajo → Rinca or Padar", "A few hours by boat"]],
    highlights: [
      { title: "Padar Island", line: "The ridge at sunset", body: "Steps and a path to the top of Padar for the view over its three bays. Go in the afternoon light, with steady shoes.", image: { url: `${KOM}padar-island-aerial`, alt: "Padar Island from the air" }, voyage: "Day 3 of the 5 Day Komodo Island" },
      { title: "Komodo dragons on Rinca", line: "Ranger-led", body: "A ranger briefs you and walks you out to see the dragons where they live. Wild animals: likely, never promised.", voyage: "Day 4" },
      { title: "Pink Beach", line: "Komodo Island", body: "Sand tinted pink by crushed red coral, with a reef close enough to swim to.", image: { url: `${KOM}pink-beach`, alt: "Pink Beach, Komodo" }, voyage: "Day 4" },
      { title: "Manta Point & Karang Makassar", line: "Mantas and a sandbar", body: "Snorkel or dive with the mantas, then a sandbar in turquoise water.", image: { url: `${KOM}tatawa-diving`, alt: "Diving a Komodo reef" }, voyage: "Day 3" },
      { title: "Gili Lawa", line: "The lookout hike", body: "A climb above the bay, then beach, kayak and the reefs around the islands.", voyage: "Day 2" },
      { title: "Kalong at dusk", line: "Flying foxes", body: "Anchor off the mangroves of Kalong at sunset and watch thousands of flying foxes leave for the night.", voyage: "Day 4" },
    ],
    firstTime: {
      title: "Your First Komodo",
      intro: "Komodo is easy to reach and easy to do badly. These choices make the difference.",
      points: [
        ["Go May to September", "The dry season brings the calmest, clearest days. December to March is the wet season."],
        ["Sleep aboard", "Day boats from Labuan Bajo crowd the famous stops by mid-morning. A boat you sleep on reaches them early and anchors where the day boats don't."],
        ["Four or five nights is enough", "Padar, Pink Beach, the mantas, Rinca and Kalong fit comfortably into four nights."],
        ["Pair it with Bali", "Labuan Bajo is an hour from Bali. A few nights there either side turns it into a complete trip."],
        ["Watch the currents", "Komodo's best dive sites have strong currents. Snorkellers and newer divers stay on the gentler reefs; the guides choose."],
      ],
    },
    suits: [
      { who: "First-timers to Indonesia", line: "Padar, Pink Beach, the mantas and the dragons in four nights, with no hotel changes.", href: "/voyages/komodo/aliikai-5-day-komodo-island", label: "5 Day Komodo Island" },
      { who: "Bali add-on travellers", line: "An hour's flight from Bali, four nights at sea, back for the beach.", href: "/voyages/komodo/aliikai-5-day-komodo-island", label: "The 4-night voyage" },
      { who: "Experienced divers", line: "Currents, big fish and clear water at the park's famous sites." },
      { who: "Families and private groups", line: "Charter the whole phinisi for up to 15; minimum 3 nights in Komodo.", href: "/voyages/ships/aliikai#charter", label: "Private charter" },
    ],
    howTo: {
      title: "How to See Komodo",
      intro: "By boat from Labuan Bajo. The question is how long, and whose boat.",
      options: [
        { name: "The 5 Day Komodo Island, aboard Aliikai", body: "Four nights: Sebayur, Gili Lawa, Manta Point, Padar, Pink Beach, Rinca and Kalong. 2027 sailings on 15 and 22 September, from US$3,400 per person.", href: "/voyages/komodo/aliikai-5-day-komodo-island", label: "See the voyage" },
        { name: "Three, five or six nights", body: "Aliikai sails Komodo from late May to September on voyages of three to six nights, plus two whale shark voyages in July.", href: "/voyages/ships/aliikai#departures", label: "All 2027 dates" },
        { name: "The whole yacht", body: "Charter Aliikai for your family or group, minimum three nights in Komodo.", href: "/voyages/ships/aliikai#charter", label: "Charter Aliikai" },
      ],
    },
    voyageWaters: ["Komodo"],
    faqs: [
      { q: "When is the best time to visit Komodo National Park?", a: "May to September, the dry season, for calm seas and clear days. October and November are still good; December to March is the wet season." },
      { q: "How do you get to Komodo National Park?", a: "Fly to Labuan Bajo (LBJ) on Flores, about an hour from Bali, or direct from Jakarta. Boats leave from the harbour a few minutes from the airport." },
      { q: "Can you see Komodo dragons on a boat trip?", a: "Yes. Boat trips stop at Rinca or Komodo Island for a ranger-led walk to see the dragons in their habitat. They are wild, so sightings are likely but never guaranteed." },
      { q: "How many days do you need in Komodo?", a: "Three to five nights covers the highlights: Padar, Pink Beach, the mantas, Rinca and Kalong. Aliikai sails three-, four-, five- and six-night voyages here in 2027." },
      { q: "Is Komodo good for snorkelling?", a: "Yes, at the gentler reefs and at Manta Point, where you can snorkel with mantas. The famous dive sites have strong currents and suit experienced divers." },
      { q: "Are there park fees in Komodo?", a: "Yes. Park entry and ranger fees apply and have changed in recent years, so we confirm the current amounts when you book." },
      { q: "How much is a Komodo liveaboard?", a: "Aboard Aliikai in 2027, from US$2,250 per person for three nights, US$3,400 for four and US$4,250 for five, in an ocean-view cabin, double occupancy, plus 11% tax. Meals, guided snorkelling and diving and transfers are included." },
    ],
    geo: { lat: -8.55, lng: 119.49 },
    sources: SOURCES_KOMODO,
  },

  // Rapa Nui: the first destination-first place under a library country (Chile → Rapa Nui →
  // Nayara Hangaroa). Facts from UNESCO and Chile's own tourism board; the stay's photographs are
  // the property's (library export). IMAGE FOLLOW-UP: no Rapa Nui landscape photography in the
  // Cloudinary library yet; until it lands the hero is the property's own frame, credited.
  "rapa-nui": {
    slug: "rapa-nui", region: "south-america", country: "chile", parent: "chile", name: "Rapa Nui", path: "/destinations/south-america/chile/rapa-nui",
    theme: "stays", flyover: "rapa-nui", stays: ["nayara-hangaroa"],
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Rapa Nui (Easter Island) Guide: When to Go, Getting There & Where to Stay",
      description: "Rapa Nui, Easter Island, Chile: 3,700 km out in the Pacific, best from October to March, five and a half hours from Santiago. Living Rapanui culture, the moai quarries, volcanic walks, the ocean and the stars, with the stay the house has selected.",
      keywords: ["Rapa Nui travel guide", "Easter Island guide", "best time to visit Easter Island", "Easter Island from Santiago", "Easter Island luxury hotel", "Rapa Nui National Park", "Easter Island, Chile"],
    },
    eyebrow: "Destinations · South America · Chile",
    h1: "Rapa Nui",
    tagline: "Easter Island, Chile: a Polynesian island 3,700 km out in the Pacific, and a culture that is very much alive",
    slides: [],
    slidesFromStay: { slug: "nayara-hangaroa", alt: "Nayara Hangaroa on the shore at Hanga Roa, Rapa Nui", credit: "Photograph courtesy of Nayara Hangaroa" },
    answer: "Rapa Nui, Easter Island, is a Chilean island about 3,700 km west of the mainland, reached by one direct flight of around five and a half hours from Santiago to Mataveri (IPC). Its national park, a UNESCO World Heritage Site since 1995, holds some 900 moai and more than 300 ceremonial ahu, the quarry at Rano Raraku and the ceremonial village of Orongo on the rim of Rano Kau. The island is warm all year; October to March is the best time, with January to March the driest. Four or five nights is right. The main sites are visited with a local guide, and the island's living Rapanui culture, its volcanic walks, its ocean and its night sky are as much the reason to come as the statues.",
    facts: [["Where", "The South Pacific, about 3,700 km west of mainland Chile"], ["Protected", "Rapa Nui National Park · UNESCO World Heritage Site since 1995"], ["Best time", "October to March; January to March is the dry season"], ["Fly into", "Mataveri (IPC), about 5½ hours direct from Santiago"], ["How long", "Four or five nights"], ["Guides", "The park's main sites are visited with a Rapanui guide"], ["Park ticket", "A national park ticket is required; we confirm the current amount when you book"], ["In the Ledger", "Filed from the house's Chile research · not yet founder-visited"]],
    proof: "James hasn't stood on Rapa Nui yet. It is in the Ledger because the house's Chile research put it there, and it sits on his own list; the page says so plainly.",
    months: [
      { area: "Rapa Nui", note: "Warm all year · driest January to March", months: M("BBBggwwwgBBB") },
    ],
    airports: [["Mataveri International (IPC)", "The island's only airport, ten minutes from Hanga Roa; direct flights from Santiago (SCL), about 5½ hours"], ["Santiago (SCL)", "Chile's international gateway and the connection for Atacama and Patagonia"]],
    transfers: [["Santiago → Mataveri", "About 5½ hours by air, the only way in"], ["Mataveri → Hanga Roa", "About 10 minutes by road; the stays collect you"]],
    highlights: [
      { title: "A living culture", line: "People first", body: "Rapanui is spoken, danced and sung here. February's Tapati festival is the island's largest cultural event; the rest of the year it is the guides, the families and the language." },
      { title: "Rano Raraku", line: "The quarry", body: "The volcanic slope where most of the island's moai were carved, with hundreds still standing or half-cut in the tuff. Walk it slowly, with a guide." },
      { title: "Ahu Tongariki", line: "Fifteen moai", body: "The largest ceremonial platform on the island, its fifteen statues facing inland with the Pacific behind them. Best at first light." },
      { title: "Orongo and Rano Kau", line: "The birdman's village", body: "Fifty-four stone houses on the crater rim, carved with petroglyphs of the birdman cult that replaced the ancestor cult. The crater lake lies below, the sea cliffs beyond." },
      { title: "Volcanic ground", line: "Walking", body: "Terevaka, the island's highest point, is a half-day walk with the whole island and the ocean around it. Lava caves, grassland and three volcanoes shape every route." },
      { title: "The Pacific", line: "Ocean", body: "Anakena's white sand and warm water, clear enough for diving, and the swell on the west coast. Sunsets at Tahai are an island habit." },
      { title: "Night sky", line: "Stargazing", body: "With no city within thousands of kilometres, the southern sky is the darkest most people will ever see. Ask your stay to turn the lights down." },
      { title: "Isolation", line: "The point of it", body: "One of the most remote inhabited islands on Earth. Days here run on the island's clock, not the mainland's." },
    ],
    suits: [
      { who: "Couples who want distance", line: "A remote island with one small town, good food and the Pacific on three sides.", href: "/stays/nayara-hangaroa", label: "Nayara Hangaroa" },
      { who: "Culture-first travellers", line: "The archaeology is the surface; the Rapanui guides, language and festival are the depth." },
      { who: "Walkers", line: "Terevaka, the crater rims and the north coast, on foot with a guide." },
      { who: "Chile in two chapters", line: "Pair it with Atacama or Patagonia; Santiago is the hinge between them.", href: "/destinations/south-america/chile", label: "Chile" },
    ],
    howTo: {
      title: "How to See Rapa Nui",
      intro: "One flight in, one small town, one island to walk. The question is how many nights and which guide.",
      options: [
        { name: "Four or five nights with a Rapanui guide", body: "Enough for the quarry, Tongariki at dawn, Orongo, a walk up Terevaka, an afternoon at Anakena and an evening under the stars, without rushing any of it.", href: "/stays/nayara-hangaroa", label: "The stay the house selected" },
        { name: "Add it to Atacama or Patagonia", body: "Fly back through Santiago and continue north to the desert or south to the fjords. Two climates, one country.", href: "/destinations/south-america/chile", label: "Continue through Chile" },
        { name: "Plan it with James", body: "Tell the house what you want from the island and it will set the days, the guide and the stay.", href: "/plan?place=Rapa%20Nui", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Chile",
    onward: [
      { name: "Atacama", href: "/destinations/south-america/chile/atacama", line: "The desert and the clearest skies in the south" },
      { name: "Patagonia", href: "/destinations/south-america/chile/patagonia", line: "Torres del Paine and the fjords, October to April" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit Rapa Nui (Easter Island)?", a: "October to March, when the island is warmest and the sea calmest; January to March is the dry season and February brings the Tapati festival. The island is subtropical and warm all year, so the southern winter, June to August, is quieter and still worth it." },
      { q: "How do you get to Easter Island?", a: "By air from Santiago, Chile, to Mataveri International Airport (IPC): one direct flight of about five and a half hours, the only way in. The stays collect you at the airport, ten minutes from Hanga Roa." },
      { q: "How many days do you need on Easter Island?", a: "Four or five nights. That covers the quarry at Rano Raraku, Ahu Tongariki at dawn, Orongo and Rano Kau, a walk up Terevaka, an afternoon at Anakena and an evening of stargazing, without rushing." },
      { q: "Do you need a guide on Rapa Nui?", a: "Yes, for the main sites of the national park, which are visited with a local guide. That is also the best thing about the island: the guides are Rapanui, and the culture is theirs." },
      { q: "Is Easter Island only about the moai?", a: "No. The moai are the reason most people come, but the island is also a living Polynesian culture, three volcanoes to walk, a warm Pacific coast, and one of the darkest night skies on Earth." },
      { q: "Can you combine Easter Island with Atacama or Patagonia?", a: "Yes. Every route runs through Santiago, so Rapa Nui pairs naturally with the Atacama desert in the north or Patagonia in the south. Allow two weeks for two of the three." },
    ],
    geo: { lat: -27.12, lng: -109.37 },
    sources: [
      { title: "UNESCO World Heritage Centre: Rapa Nui National Park", url: "https://whc.unesco.org/en/list/715" },
      { title: "Chile Travel (Sernatur): Rapa Nui", url: "https://chile.travel/en/?p=78031" },
      { title: "Nayara Hangaroa in the Ledger", url: "/stays/nayara-hangaroa" },
    ],
  },
  // Atacama and Patagonia: Chile's other two places (Stage 3, 1 Nov 2026). Facts come from the
  // selected stays' own brand records in the library; photographs are Tierra's own (Beckon), held in
  // Cloudinary with partner-approved rights. The founder has not been to either; the pages say so.
  atacama: {
    slug: "atacama", region: "south-america", country: "chile", parent: "chile", name: "Atacama", path: "/destinations/south-america/chile/atacama",
    theme: "stays", stays: ["beckon-tierra-atacama", "nayara-alto-atacama"], flyover: "atacama-uyuni",
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Atacama Desert Guide: Best Time, San Pedro de Atacama & Where to Stay",
      description: "The Atacama, northern Chile: San Pedro de Atacama, the salt flats, the geysers and the clearest night skies on Earth. Best March to May and September to November, reached through Calama, with the stays the house has selected.",
      keywords: ["Atacama Desert travel guide", "best time to visit the Atacama", "San Pedro de Atacama hotels", "Atacama stargazing", "Atacama luxury lodge", "Calama to San Pedro de Atacama"],
    },
    eyebrow: "Destinations · South America · Chile",
    h1: "Atacama",
    tagline: "San Pedro de Atacama, Chile: salt, volcanoes and the clearest night sky most people will ever see",
    slides: [],
    slidesFromStay: { slug: "beckon-tierra-atacama", alt: "Tierra Atacama in the desert outside San Pedro de Atacama, Chile", credit: "Photograph courtesy of Beckon" },
    answer: "The Atacama is the high desert of northern Chile, and San Pedro de Atacama, a small adobe town at its centre, is where every stay is. You fly from Santiago to Calama (CJC), about two hours, then drive roughly 100 km to San Pedro. The best months are March to May and September to November: mild days, cold clear nights and the best stargazing. Days go to the salt flats and their lagoons, the geyser fields at dawn, the valleys and the volcanoes on the Bolivian border; nights go to the sky. Three or four nights is right, and most travellers pair it with Patagonia or Rapa Nui through Santiago.",
    facts: [["Where", "Northern Chile, around San Pedro de Atacama"], ["Best time", "March to May and September to November; dry all year"], ["Fly into", "Calama (CJC), about 2 hours from Santiago, then roughly 100 km by road"], ["How long", "Three or four nights"], ["Altitude", "San Pedro sits high; the geysers and lagoons higher still, so the first day is gentle"], ["In the Ledger", "Filed from the house's Chile research · not yet founder-visited"]],
    proof: "James hasn't been to the Atacama yet. It is in the Ledger because the house's Chile research and the lodges' own records put it there; the page says so plainly.",
    months: [
      { area: "Atacama", note: "Dry all year · mildest in autumn and spring", months: M("ggBBBgggBBBg") },
    ],
    airports: [["Calama (CJC)", "El Loa Airport, the gateway for San Pedro de Atacama; about 2 hours from Santiago"], ["Santiago (SCL)", "Chile's international gateway and the connection for Patagonia and Rapa Nui"]],
    transfers: [["Santiago → Calama", "About 2 hours by air"], ["Calama → San Pedro de Atacama", "Roughly 100 km by road; the lodges collect you"]],
    highlights: [
      { title: "The night sky", line: "Stargazing", body: "Some of the clearest, driest skies on Earth. The lodges run their own astronomy sessions; Nayara Alto Atacama has an observatory." },
      { title: "The salt flats", line: "Salar de Atacama", body: "White crust to the horizon, and lagoons where flamingos feed, with the Andes behind. Chaxa at sunset is the classic visit." },
      { title: "Geysers at dawn", line: "El Tatio", body: "A high geyser field reached before sunrise, when the steam is tallest against the cold. Dress for the altitude and the hour." },
      { title: "Valleys and volcanoes", line: "Walking and riding", body: "Rainbow Valley, the salt mountains, Licancabur on the skyline: hiking, horseback riding and cycling out from San Pedro." },
      { title: "Silence", line: "The point of it", body: "Few places are this quiet. The lodges are built for doing less between excursions." },
    ],
    suits: [
      { who: "Couples after remote luxury", line: "Desert lodges with spas, pools and the sky as the evening's entertainment.", href: "/stays/beckon-tierra-atacama", label: "Tierra Atacama" },
      { who: "Stargazers and photographers", line: "The clearest skies in the south, with observatory sessions at the lodges.", href: "/stays/nayara-alto-atacama", label: "Nayara Alto Atacama" },
      { who: "Walkers and riders", line: "Valleys, volcanoes and salt flats on foot, by bike or on horseback." },
      { who: "Chile in two chapters", line: "Pair it with Patagonia or Rapa Nui; Santiago is the hinge.", href: "/destinations/south-america/chile", label: "Chile" },
    ],
    howTo: {
      title: "How to See the Atacama",
      intro: "Everything starts from San Pedro. The lodges plan the excursions; the choice is which lodge and how many nights.",
      options: [
        { name: "Three or four nights at a desert lodge", body: "Enough for the salt flats, the geysers at dawn, a valley walk or ride, and two clear nights of stars, with the altitude taken gently.", href: "#stays", label: "The stays the house selected" },
        { name: "Pair it with Patagonia or Rapa Nui", body: "Fly back through Santiago and continue south to Torres del Paine or west to Rapa Nui. Two climates, one country.", href: "/destinations/south-america/chile", label: "Continue through Chile" },
        { name: "Plan it with James", body: "Tell the house what you want from the desert and it will set the lodge, the nights and the order.", href: "/plan?place=Atacama", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Chile, and across the border",
    onward: [
      { name: "Patagonia", href: "/destinations/south-america/chile/patagonia", line: "Torres del Paine and the fjords, October to April" },
      { name: "Rapa Nui", href: "/destinations/south-america/chile/rapa-nui", line: "Easter Island, 3,700 km out in the Pacific" },
      { name: "Salar de Uyuni", href: "/destinations/south-america/bolivia/salar-de-uyuni", line: "Across the border in Bolivia: the salt flat at the end of the crossing" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit the Atacama Desert?", a: "March to May and September to November, for mild days, cold clear nights and the best stargazing. The desert is dry all year; December to February is warmest and busiest." },
      { q: "How do you get to San Pedro de Atacama?", a: "Fly from Santiago to Calama (CJC), about two hours, then drive roughly 100 km to San Pedro de Atacama. The lodges arrange the transfer." },
      { q: "How many nights do you need in the Atacama?", a: "Three or four. That covers the salt flats, the geysers at dawn, a valley walk or ride and two clear nights of stargazing, with time to settle into the altitude." },
      { q: "Is altitude a problem in the Atacama?", a: "San Pedro sits high and the geysers and lagoons are higher still, so the first day should be gentle. The lodges order the excursions so the highest come later." },
      { q: "Can you combine the Atacama with Patagonia or Easter Island?", a: "Yes. Every route runs through Santiago, so the Atacama pairs with Patagonia in the south or Rapa Nui in the Pacific. Allow around two weeks for two of the three." },
    ],
    geo: { lat: -22.91, lng: -68.2 },
    sources: [
      { title: "Tierra Atacama in the Ledger", url: "/stays/beckon-tierra-atacama" },
      { title: "Nayara Alto Atacama in the Ledger", url: "/stays/nayara-alto-atacama" },
    ],
  },

  patagonia: {
    slug: "patagonia", region: "south-america", country: "chile", parent: "chile", name: "Patagonia", path: "/destinations/south-america/chile/patagonia",
    theme: "stays", stays: ["tierra-patagonia", "awasi-patagonia", "ecocamp-patagonia", "explora-torres-del-paine", "torres-del-paine-c-reserve"],
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Chilean Patagonia Guide: Torres del Paine, When to Go & Where to Stay",
      description: "Torres del Paine and Chilean Patagonia: best from October to April, reached through Punta Arenas or Puerto Natales. The towers, Grey Glacier, pumas and condors, and the lodges the house has selected.",
      keywords: ["Torres del Paine travel guide", "Chilean Patagonia guide", "best time to visit Torres del Paine", "Torres del Paine lodges", "Patagonia puma tracking", "Puerto Natales to Torres del Paine"],
    },
    eyebrow: "Destinations · South America · Chile",
    h1: "Patagonia",
    tagline: "Torres del Paine, Chile: granite towers, blue ice and the wind that comes with them",
    slides: [],
    slidesFromStay: { slug: "tierra-patagonia", alt: "Tierra Patagonia above the lake, Torres del Paine, Chile", credit: "Photograph courtesy of Beckon" },
    answer: "Chilean Patagonia, for most travellers, means Torres del Paine: the granite towers of the Paine massif, Grey Glacier, and steppe where guanacos graze and pumas hunt. You fly from Santiago to Punta Arenas (PUQ) or Puerto Natales (PNT), then drive to a lodge at the edge of the park. The season is October to April, with the longest days in December and January; May to September is winter and many lodges close. Days go to the trails, Base Torres, the French Valley, the glacier by boat, riding with gauchos and tracking pumas with a guide. Four or five nights is right, and the wind is part of it.",
    facts: [["Where", "Southern Chile, around Torres del Paine"], ["Best time", "October to April; longest days in December and January"], ["Fly into", "Punta Arenas (PUQ) or Puerto Natales (PNT), from Santiago"], ["How long", "Four or five nights"], ["Weather", "Fast-changing and windy in every season; layers, always"], ["In the Ledger", "Filed from the house's Chile research · not yet founder-visited"]],
    proof: "James hasn't been to Patagonia yet. It is in the Ledger because the house's Chile research and the lodges' own records put it there; the page says so plainly.",
    months: [
      { area: "Torres del Paine", note: "Austral spring and summer · winter closures", months: M("BBBBwwwwwBBB") },
    ],
    airports: [["Punta Arenas (PUQ)", "Presidente Carlos Ibáñez del Campo, the main gateway, from Santiago"], ["Puerto Natales (PNT)", "Teniente Julio Gallardo, closest to the park, with seasonal flights from Santiago"]],
    transfers: [["Santiago → Punta Arenas or Puerto Natales", "By air; Puerto Natales is the closer airport"], ["Airport → lodge", "By road to the edge of the park; the lodges collect you"]],
    highlights: [
      { title: "The towers", line: "Base Torres", body: "The classic day: a long, steep walk to the lake beneath the three granite towers. Start early, carry layers." },
      { title: "Grey Glacier", line: "Ice", body: "Blue ice calving into Lago Grey, reached by trail and by boat, wind and weather permitting." },
      { title: "Pumas", line: "Tracking", body: "Guided puma tracking on the steppe around the park. Wild animals: likely in season, never promised." },
      { title: "The French Valley", line: "Walking", body: "Hanging glaciers and a ring of peaks on one of the park's great day hikes." },
      { title: "Gaucho country", line: "Riding", body: "Horseback rides across the estancias with the massif on the skyline; fossil country in the Sierra Baguales beyond." },
    ],
    suits: [
      { who: "Walkers", line: "Base Torres, the French Valley and the glacier trails, guided from the lodge.", href: "/stays/explora-torres-del-paine", label: "Explora Torres del Paine" },
      { who: "Wildlife and photography", line: "Pumas, condors and guanacos on the steppe, with guides who track them.", href: "/stays/awasi-patagonia", label: "Awasi Patagonia" },
      { who: "Couples after comfort at the edge", line: "A lodge above the lake, a spa and the towers from the window.", href: "/stays/tierra-patagonia", label: "Tierra Patagonia" },
      { who: "Lighter on the land", line: "Geodesic domes, yoga and the trails from the door.", href: "/stays/ecocamp-patagonia", label: "EcoCamp Patagonia" },
    ],
    howTo: {
      title: "How to See Patagonia",
      intro: "The park is big and the weather decides the day. A lodge with its own guides makes the most of both.",
      options: [
        { name: "Four or five nights at a park lodge", body: "Enough for Base Torres, a glacier day, the French Valley or a ride, and a puma morning, with a spare day for the weather.", href: "#stays", label: "The stays the house selected" },
        { name: "Pair it with the Atacama or Rapa Nui", body: "Fly back through Santiago and continue north to the desert or west to the island. Two climates, one country.", href: "/destinations/south-america/chile", label: "Continue through Chile" },
        { name: "Plan it with James", body: "Tell the house how you like to walk and it will set the lodge, the guide and the nights.", href: "/plan?place=Patagonia", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Chile",
    onward: [
      { name: "Atacama", href: "/destinations/south-america/chile/atacama", line: "The desert and the clearest skies in the south" },
      { name: "Rapa Nui", href: "/destinations/south-america/chile/rapa-nui", line: "Easter Island, 3,700 km out in the Pacific" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit Torres del Paine?", a: "October to April, the austral spring and summer, with the longest days in December and January. May to September is winter; many lodges close and some trails shut." },
      { q: "How do you get to Torres del Paine?", a: "Fly from Santiago to Punta Arenas (PUQ) or, closer, Puerto Natales (PNT), then drive to a lodge at the edge of the park. The lodges arrange the transfer." },
      { q: "How many nights do you need in Patagonia?", a: "Four or five. That covers Base Torres, a glacier day, the French Valley or a ride and a puma morning, with a spare day for the weather." },
      { q: "Can you see pumas in Torres del Paine?", a: "Often, with a specialist guide on the steppe around the park. They are wild, so sightings are likely in season but never guaranteed." },
      { q: "Can you combine Patagonia with the Atacama or Easter Island?", a: "Yes. Every route runs through Santiago, so Patagonia pairs with the Atacama in the north or Rapa Nui in the Pacific. Allow around two weeks for two of the three." },
    ],
    geo: { lat: -51.0, lng: -72.95 },
    sources: [
      { title: "Tierra Patagonia in the Ledger", url: "/stays/tierra-patagonia" },
      { title: "Awasi Patagonia in the Ledger", url: "/stays/awasi-patagonia" },
      { title: "Explora Torres del Paine in the Ledger", url: "/stays/explora-torres-del-paine" },
      { title: "EcoCamp Patagonia in the Ledger", url: "/stays/ecocamp-patagonia" },
    ],
  },
  // Destination-first Stage 5 (1 Nov 2026): three places inside Slovenia, each with the stay the house
  // selected. Travel facts from the Slovenian and Ljubljana tourist boards; property facts from the
  // properties' own sites. James has not been yet, and the pages say so.
  ljubljana: {
    slug: "ljubljana", region: "europe", country: "slovenia", parent: "slovenia", name: "Ljubljana", path: "/destinations/europe/slovenia/ljubljana",
    theme: "stays", stays: ["zlata-ladjica"],
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Ljubljana Guide: Where to Stay in the Old Town & How Long to Spend",
      description: "Ljubljana, Slovenia's small, car-free capital on the Ljubljanica: the old town, the castle, the market and the riverbanks, 26 km from the airport. How many nights, where to stay, and how it fits with the Alps and Brda.",
      keywords: ["where to stay in Ljubljana", "Ljubljana old town hotel", "boutique hotel Ljubljana", "how many days in Ljubljana", "Ljubljana airport to city", "Slovenia itinerary"],
    },
    eyebrow: "Destinations · Europe · Slovenia",
    h1: "Ljubljana",
    tagline: "Slovenia's capital: a river, a castle on the hill and an old town you cross on foot",
    slides: [],
    slidesFromStay: { slug: "zlata-ladjica", alt: "Zlata Ladjica on the Ljubljanica in the old town of Ljubljana, Slovenia", credit: "Photograph courtesy of Zlata Ladjica" },
    answer: "Ljubljana is Slovenia's capital and the natural first or last night of any trip here. It is small and walkable: the old town lines both banks of the Ljubljanica, with the castle on the hill above and the main square, the bridges and the market a few minutes apart, mostly free of cars. The airport is 26 km away, about 20 minutes by road. One or two nights is right; from here the Alps, the lakes and the Brda wine hills are each a short drive.",
    facts: [["Where", "Central Slovenia, on the Ljubljanica river"], ["Best time", "Spring to autumn for café terraces and walking; December for the lights; a city for any month"], ["Fly into", "Ljubljana Jože Pučnik (LJU), 26 km away, about 20 minutes by road"], ["How long", "One or two nights, at the start or end of the trip"], ["Getting around", "On foot: the old town is largely car-free"], ["In the Ledger", "Filed from the house's Slovenia research · not yet founder-visited"]],
    proof: "James hasn't been to Ljubljana yet. It is in the Ledger because a Slovenia trip starts here, and the page says so plainly.",
    months: [
      { area: "Ljubljana", note: "A city for any month · warmest May to September", months: M("gggBBBBBBBgg") },
    ],
    airports: [["Ljubljana (LJU)", "Jože Pučnik Airport, 26 km from the city, about 20 minutes by road"], ["Trieste (TRS)", "Across the Italian border, 130 km; useful for Brda"], ["Venice (VCE)", "230 km; more international flights, a longer transfer"]],
    transfers: [["Airport → Ljubljana", "About 20 minutes by road"], ["Ljubljana → Lake Bled", "About 45 minutes by road"], ["Ljubljana → the coast at Piran", "About an hour"]],
    highlights: [
      { title: "The old town on foot", line: "The Ljubljanica", body: "Both banks of the river, the bridges, the main square and the café terraces, almost all of it closed to cars." },
      { title: "Plečnik's city", line: "Architecture", body: "Much of what makes the centre feel the way it does, the riverbanks, the bridges and the market colonnades, was shaped by the architect Jože Plečnik." },
      { title: "The castle hill", line: "The view", body: "Walk or take the funicular up to the castle for the city's roofs and, on a clear day, the Alps." },
      { title: "The market", line: "Food", body: "The central market by the river, for what is in season, and a long lunch somewhere close by." },
    ],
    suits: [
      { who: "The first night in Slovenia", line: "Land, walk the old town, sleep by the river, head for the mountains in the morning.", href: "/stays/zlata-ladjica", label: "Zlata Ladjica" },
      { who: "Food lovers", line: "The market, the riverside restaurants and a hotel with its own kitchen downstairs." },
      { who: "Slovenia in three chapters", line: "City, Alps and wine hills: Ljubljana, the Logar Valley and Brda.", href: "/destinations/europe/slovenia", label: "Slovenia" },
    ],
    howTo: {
      title: "How to See Ljubljana",
      intro: "Stay in the old town and walk. The city is small enough that a good address does most of the work.",
      options: [
        { name: "One or two nights in the old town", body: "Arrive, walk the river and the castle, eat well, and leave for the Alps or Brda the next day. Bled is about 45 minutes away.", href: "#stays", label: "The stay the house selected" },
        { name: "Pair it with the Alps and the wine hills", body: "North to the Logar Valley for walking and silence, west to Brda for wine. Ljubljana sits between them.", href: "/destinations/europe/slovenia", label: "Continue through Slovenia" },
        { name: "Plan it with James", body: "Tell the house how long you have and it will set the nights and the order.", href: "/plan?place=Ljubljana", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Slovenia",
    onward: [
      { name: "Logar Valley", href: "/destinations/europe/slovenia/logar-valley", line: "An alpine valley under the Kamnik-Savinja Alps" },
      { name: "Brda", href: "/destinations/europe/slovenia/brda", line: "Slovenia's wine hills on the Italian border" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "Where should I stay in Ljubljana?", a: "In the old town, on or near the Ljubljanica. Everything worth seeing, the bridges, the market, the main square and the castle path, is a short walk, and most of it is closed to cars." },
      { q: "How many days do you need in Ljubljana?", a: "One or two nights. Ljubljana is small; most travellers use it as the first or last stop and spend the rest of the trip in the Alps, at the lakes or in the Brda wine hills." },
      { q: "How do you get from Ljubljana airport to the city?", a: "Ljubljana Jože Pučnik Airport (LJU) is 26 km from the city, about 20 minutes by road. Trieste and Venice airports in Italy are alternatives, 130 km and 230 km away." },
      { q: "Can you do day trips from Ljubljana?", a: "Yes. Lake Bled is about 45 minutes away and the coast at Piran about an hour. For the Logar Valley or Brda, stay a night or two there instead." },
    ],
    geo: { lat: 46.0511, lng: 14.5051 },
    sources: [
      { title: "Visit Ljubljana: getting to Ljubljana by air", url: "https://www.visitljubljana.com/en/visitors/travel-information/getting-around/getting-to-ljubljana-by-air/" },
      { title: "Zlata Ladjica in the Ledger", url: "/stays/zlata-ladjica" },
    ],
  },
  "logar-valley": {
    slug: "logar-valley", region: "europe", country: "slovenia", parent: "slovenia", name: "Logar Valley", path: "/destinations/europe/slovenia/logar-valley",
    theme: "stays", stays: ["hotel-plesnik"],
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Logar Valley Guide: Walking, Rinka Waterfall & Where to Stay in Logarska Dolina",
      description: "The Logar Valley (Logarska dolina), a landscape park under the Kamnik-Savinja Alps in northern Slovenia: the valley trail, Rinka waterfall, walking, winter and the alpine hotel the house has selected.",
      keywords: ["Logar Valley", "Logarska dolina", "Logar Valley hotel", "Rinka waterfall", "Slovenian Alps hotel", "Kamnik-Savinja Alps walking"],
    },
    eyebrow: "Destinations · Europe · Slovenia",
    h1: "Logar Valley",
    tagline: "Logarska dolina, Slovenia: an alpine valley closed by mountains, with a waterfall at its head",
    slides: [],
    slidesFromStay: { slug: "hotel-plesnik", alt: "The Logar Valley under the Kamnik-Savinja Alps, Slovenia", credit: "Photograph courtesy of Hotel Plesnik" },
    answer: "The Logar Valley is an alpine valley in northern Slovenia, protected as the Logar Valley Landscape Park and closed at its head by the Kamnik-Savinja Alps. It is a place for walking: a valley trail of about two hours one way leads to Rinka, one of Slovenia's highest waterfalls, with shepherds' trails and mountain paths above. In winter the same valley turns to cross-country skiing, ski touring and ice climbing. It is a drive of under two hours from Ljubljana; two or three nights lets the quiet work.",
    facts: [["Where", "Northern Slovenia, the Solčava region, under the Kamnik-Savinja Alps"], ["Best time", "Late spring to autumn for walking; winter for cross-country skiing and ski touring"], ["Fly into", "Ljubljana (LJU), then under two hours by road"], ["How long", "Two or three nights"], ["Protected", "Logar Valley Landscape Park"], ["In the Ledger", "Filed from the house's Slovenia research · not yet founder-visited"]],
    proof: "James hasn't walked the Logar Valley yet. It is in the Ledger because the house's Slovenia research and the hotel's own record put it there; the page says so plainly.",
    months: [
      { area: "Logar Valley", note: "Walking late spring to autumn · winter sports in the snow months", months: M("gggwBBBBBBwg") },
    ],
    airports: [["Ljubljana (LJU)", "Jože Pučnik Airport, the nearest; under two hours by road"], ["Klagenfurt (KLU)", "Across the Austrian border; check the mountain roads in winter"]],
    transfers: [["Ljubljana → Logar Valley", "Under two hours by road"]],
    highlights: [
      { title: "Rinka waterfall", line: "The valley trail", body: "About two hours on foot, one way, from the valley floor to Rinka, one of Slovenia's highest waterfalls, at the head of the valley." },
      { title: "The shepherds' paths", line: "Walking", body: "Paths up to the high pastures, and at Hotel Plesnik a guided walk with the shepherds themselves." },
      { title: "Winter", line: "Snow", body: "Cross-country skiing, ski touring and ice climbing in the same valley when the snow comes." },
      { title: "Silence", line: "The point of it", body: "One road in, mountains on three sides. The valley is built for doing less." },
    ],
    suits: [
      { who: "Walkers", line: "A valley trail, a waterfall and shepherds' paths from the door.", href: "/stays/hotel-plesnik", label: "Hotel Plesnik" },
      { who: "Wellness seekers", line: "Ayurveda and herbal rituals at the end of a day on foot." },
      { who: "Slovenia in three chapters", line: "City, Alps and wine hills: Ljubljana, the Logar Valley and Brda.", href: "/destinations/europe/slovenia", label: "Slovenia" },
    ],
    howTo: {
      title: "How to See the Logar Valley",
      intro: "Stay in the valley, not on a day trip. The early mornings and the evenings are what you come for.",
      options: [
        { name: "Two or three nights in the valley", body: "Enough for the trail to Rinka, a morning with the shepherds, and an afternoon of doing nothing in front of the mountains.", href: "#stays", label: "The stay the house selected" },
        { name: "Pair it with Ljubljana and Brda", body: "A night in the capital first, the Alps second, the wine hills last.", href: "/destinations/europe/slovenia", label: "Continue through Slovenia" },
        { name: "Plan it with James", body: "Tell the house what you want from the mountains and it will set the nights and the order.", href: "/plan?place=Logar%20Valley", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Slovenia",
    onward: [
      { name: "Ljubljana", href: "/destinations/europe/slovenia/ljubljana", line: "The capital, the arrival night" },
      { name: "Brda", href: "/destinations/europe/slovenia/brda", line: "Slovenia's wine hills on the Italian border" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "Where is the Logar Valley?", a: "In northern Slovenia, in the Solčava region near the Austrian border, closed at its head by the Kamnik-Savinja Alps. It is protected as the Logar Valley Landscape Park." },
      { q: "How do you get to the Logar Valley from Ljubljana?", a: "By road, in under two hours. Fly into Ljubljana (LJU) and drive, or let the hotel arrange the transfer." },
      { q: "How long is the walk to Rinka waterfall?", a: "The Logar Valley trail takes about two hours one way from the valley to Rinka, one of Slovenia's highest waterfalls." },
      { q: "When is the best time to visit the Logar Valley?", a: "Late spring to autumn for walking. In winter the valley is for cross-country skiing, ski touring and ice climbing." },
    ],
    geo: { lat: 46.3985, lng: 14.6308 },
    sources: [
      { title: "Logar Valley Landscape Park: the Logar Valley trail", url: "https://logarska-dolina.si/en/attractions/nature/the-logar-valley-trail" },
      { title: "Hotel Plesnik in the Ledger", url: "/stays/hotel-plesnik" },
    ],
  },
  brda: {
    slug: "brda", region: "europe", country: "slovenia", parent: "slovenia", name: "Brda", path: "/destinations/europe/slovenia/brda",
    theme: "stays", stays: ["alma-vista"],
    proofEyebrow: "On the founder's list · not yet visited",
    seo: {
      title: "Brda Guide: Slovenia's Wine Country, Rebula & Where to Stay in Goriška Brda",
      description: "Goriška Brda, Slovenia's wine hills on the Italian border: terraced vineyards, rebula, hilltop villages and the Adriatic on the horizon. When to go, how to get there and the private villa the house has selected.",
      keywords: ["Brda Slovenia", "Goriška Brda", "Slovenia wine country", "Brda villa with pool", "rebula wine", "where to stay in Brda"],
    },
    eyebrow: "Destinations · Europe · Slovenia",
    h1: "Brda",
    tagline: "Goriška Brda, Slovenia: terraced vineyards on the Italian border, with the Adriatic beyond",
    slides: [],
    slidesFromStay: { slug: "alma-vista", alt: "Alma Vista above the vineyards of Brda, Slovenia", credit: "Photograph courtesy of Alma Vista" },
    answer: "Brda is Slovenia's wine country: a fold of terraced hills in the far west, running straight on into Italy's Collio across the border. It is a landscape of small villages on hilltops, family wineries and vineyards to the horizon, with the Adriatic visible on a clear day. Rebula is the grape it is known for. Trieste airport is the closest, about an hour away, and Ljubljana about an hour and a half. Two or three nights, in a house rather than a hotel, suits it best.",
    facts: [["Where", "Western Slovenia, on the Italian border; it continues as the Collio in Italy"], ["Best time", "Spring to autumn; September and October for the harvest"], ["Fly into", "Trieste (TRS), about an hour; or Ljubljana (LJU), about an hour and a half"], ["How long", "Two or three nights"], ["Known for", "Rebula and the family wineries"], ["In the Ledger", "Filed from the house's Slovenia research · not yet founder-visited"]],
    proof: "James hasn't been to Brda yet. It is in the Ledger because the house's Slovenia research and the villa's own record put it there; the page says so plainly.",
    months: [
      { area: "Brda", note: "Best spring to autumn · harvest in September and October", months: M("gggBBBBBBBgg") },
    ],
    airports: [["Trieste (TRS)", "Across the Italian border, the closest airport; about an hour by road"], ["Ljubljana (LJU)", "About an hour and a half by road"], ["Venice (VCE)", "More international flights, around two hours"]],
    transfers: [["Trieste airport → Brda", "About an hour by road"], ["Ljubljana → Brda", "About an hour and a half by road"]],
    highlights: [
      { title: "The wineries", line: "Rebula and more", body: "Family estates on every hill, most of them happy to pour for visitors who book ahead." },
      { title: "Hilltop villages", line: "Walking", body: "Small stone villages on the ridges, with views across the vineyards to the Alps one way and the sea the other." },
      { title: "The harvest", line: "September and October", body: "The hills at their busiest and best, when the grapes come in." },
      { title: "A house of your own", line: "Privacy", body: "Brda is made for a villa with a pool and nowhere to be." },
    ],
    suits: [
      { who: "Couples and wine lovers", line: "A private villa with its own pool and a winemaking family's cellar.", href: "/stays/alma-vista", label: "Alma Vista" },
      { who: "Two couples together", line: "A whole house, two bedrooms, one cellar." },
      { who: "Slovenia in three chapters", line: "City, Alps and wine hills: Ljubljana, the Logar Valley and Brda.", href: "/destinations/europe/slovenia", label: "Slovenia" },
    ],
    howTo: {
      title: "How to See Brda",
      intro: "Take a house, book two or three wineries, and let the rest of the days go.",
      options: [
        { name: "Two or three nights in a villa", body: "Enough for a tasting a day, a walk between villages, and a long afternoon by your own pool.", href: "#stays", label: "The stay the house selected" },
        { name: "Pair it with Ljubljana and the Alps", body: "Brda is the last chapter of the Slovenia route: the capital, the mountains, then the wine.", href: "/destinations/europe/slovenia", label: "Continue through Slovenia" },
        { name: "Plan it with James", body: "Tell the house what you like to drink and it will set the house, the wineries and the nights.", href: "/plan?place=Brda", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Slovenia",
    onward: [
      { name: "Ljubljana", href: "/destinations/europe/slovenia/ljubljana", line: "The capital, the arrival night" },
      { name: "Logar Valley", href: "/destinations/europe/slovenia/logar-valley", line: "An alpine valley under the Kamnik-Savinja Alps" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "Where is Brda?", a: "In the far west of Slovenia, on the Italian border. The same hills continue into Italy as the Collio." },
      { q: "How do you get to Brda?", a: "Fly into Trieste (TRS), about an hour away by road, or Ljubljana (LJU), about an hour and a half. Venice is around two hours." },
      { q: "What wine is Brda known for?", a: "Rebula, the white grape grown on both sides of the border, alongside the family wineries' other whites and reds." },
      { q: "When is the best time to visit Brda?", a: "Spring to autumn. September and October bring the harvest, when the hills are at their liveliest." },
    ],
    geo: { lat: 45.9763, lng: 13.5372 },
    sources: [
      { title: "Visit Ljubljana: distances to nearby airports", url: "https://www.visitljubljana.com/en/visitors/travel-information/getting-around/getting-to-ljubljana-by-air/" },
      { title: "Alma Vista in the Ledger", url: "/stays/alma-vista" },
    ],
  },
  // Bolivia, destination-first (James, 1 Nov 2026: "approved ... put Bolivia live"). The first place in
  // Bolivia, tied across the border to the Atacama by the classic crossing, with the flyover chart.
  "salar-de-uyuni": {
    slug: "salar-de-uyuni", region: "south-america", country: "bolivia", parent: "bolivia", name: "Salar de Uyuni", path: "/destinations/south-america/bolivia/salar-de-uyuni",
    theme: "stays", stays: ["explora-at-uyuni-flats"], flyover: "atacama-uyuni",
    proofEyebrow: "A house partner since 2004 · Explora",
    seo: {
      title: "Salar de Uyuni Guide: Best Time, the Mirror, Stargazing & the Crossing from the Atacama",
      description: "The Salar de Uyuni, Bolivia: the largest salt flat on Earth, the mirror after rain, some of the darkest night skies anywhere and the private crossing from San Pedro de Atacama. When to go, how to get there and where to stay.",
      keywords: ["Salar de Uyuni", "Uyuni salt flat", "best time to visit Uyuni", "Uyuni mirror effect", "Uyuni stargazing", "Atacama to Uyuni", "Uyuni luxury lodge"],
    },
    eyebrow: "Destinations · South America · Bolivia",
    h1: "Salar de Uyuni",
    tagline: "Uyuni and the Altiplano, Bolivia: the largest salt flat on Earth, and one of its great night skies",
    slides: [],
    slidesFromStay: { slug: "explora-at-uyuni-flats", alt: "Walking on the Uyuni salt flat, Bolivia", credit: "Photograph courtesy of Explora" },
    answer: "The Salar de Uyuni is the largest salt flat on Earth, around 10,500 square kilometres of white crust at roughly 3,650 metres on Bolivia's Altiplano. May to November brings clear, dry days and the best night skies; December to April is the wet season, when a skin of water turns the salt into a mirror. You reach it by flying La Paz to Uyuni, about an hour, or by crossing overland from San Pedro de Atacama in Chile past the coloured lagoons of the Eduardo Avaroa reserve. Give it several nights, take the altitude a day at a time, and keep at least one night for the stars.",
    facts: [["Where", "Bolivia's southern Altiplano, around Uyuni"], ["Altitude", "Roughly 3,650 metres; the lagoons to the south higher still"], ["Best time", "May to November for clear skies and stargazing; December to April for the mirror"], ["Fly into", "Uyuni (UYU), about an hour from La Paz; or Calama (CJC) in Chile for the crossing"], ["How long", "Several nights; the private crossing from the Atacama runs seven or more"], ["In the Ledger", "Filed from the house's Bolivia research and Explora's own record"]],
    proof: "James has worked with Explora since 2004, and the Atacama-to-Uyuni crossing is the journey he would put people on for the desert and the salt as one trip. He has not yet stayed at the Uyuni lodge itself; the page says so plainly.",
    months: [
      { area: "Salar de Uyuni", note: "Dry and clear May to November · wet (the mirror) December to April", months: M("wwwwBBBBBBBw") },
    ],
    airports: [["Uyuni (UYU)", "Joya Andina Airport, about an hour by air from La Paz"], ["La Paz (LPB)", "El Alto International, Bolivia's main gateway, itself around 4,000 metres"], ["Calama (CJC)", "In Chile, the gateway for San Pedro de Atacama and the overland crossing"]],
    transfers: [["La Paz → Uyuni", "About an hour by air"], ["San Pedro de Atacama → Uyuni", "Several days overland across the Altiplano, with lodges on the way"]],
    highlights: [
      { title: "The salt flat", line: "Light and distance", body: "White crust in hexagons to the horizon, with Isla Incahuasi and its giant cacti rising out of it." },
      { title: "The mirror", line: "December to April", body: "After rain, a thin layer of water sits on the salt and the sky appears twice." },
      { title: "The night sky", line: "Stargazing", body: "High, dry and almost without light for a hundred kilometres: one of the great dark skies. Best in the dry months, away from the full moon." },
      { title: "The lagoons", line: "Eduardo Avaroa reserve", body: "Laguna Colorada and its flamingos, geysers at dawn and volcanoes on the Chilean border, on the way north from the Atacama." },
    ],
    suits: [
      { who: "Stargazers and photographers", line: "The salt by day, the Milky Way by night.", href: "/stays/explora-at-uyuni-flats", label: "Explora Uyuni" },
      { who: "The Atacama and Uyuni as one journey", line: "Fly into Calama, cross the Altiplano, fly home from Uyuni.", href: "/destinations/south-america/chile/atacama", label: "The Atacama" },
      { who: "Travellers comfortable with altitude", line: "Start low in San Pedro de Atacama and climb a day at a time." },
    ],
    howTo: {
      title: "How to See the Salar de Uyuni",
      intro: "Come from the Atacama if you can. The crossing climbs gradually, which is kinder at altitude, and the lagoons on the way are half the reason to go.",
      options: [
        { name: "The private crossing from the Atacama", body: "Seven nights or more with Explora: San Pedro de Atacama, mountain lodges on the Altiplano, then Uyuni. Two travellers, a guide and a local driver.", href: "#stays", label: "The stay the house selected" },
        { name: "Fly in from La Paz", body: "About an hour to Uyuni. Quicker, but La Paz sits around 4,000 metres, so arrive rested and go gently.", href: "/destinations/south-america/bolivia", label: "Bolivia" },
        { name: "Plan it with James", body: "Tell the house when you can travel and whether you want the mirror or the stars, and it will set the route.", href: "/plan?place=Salar%20de%20Uyuni", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Across the border",
    onward: [
      { name: "The Atacama", href: "/destinations/south-america/chile/atacama", line: "San Pedro de Atacama, Chile: the other end of the crossing" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "How big is the Salar de Uyuni?", a: "Around 10,500 square kilometres, the largest salt flat in the world, at roughly 3,650 metres on Bolivia's Altiplano." },
      { q: "When can you see the Uyuni mirror effect?", a: "In the wet season, roughly December to April, when a thin layer of rainwater sits on the salt and reflects the sky. Clear, dry stargazing nights are May to November." },
      { q: "How do you get to the Salar de Uyuni?", a: "Fly from La Paz to Uyuni (UYU), about an hour, or cross overland from San Pedro de Atacama in Chile over the Altiplano, a journey of several days with lodges along the way." },
      { q: "Is Uyuni good for stargazing?", a: "Yes. High altitude, very dry air and almost no light pollution make the salt flat one of the best places on Earth to see the night sky; the dry months, away from the full moon, are best." },
      { q: "Is altitude a problem at Uyuni?", a: "It can be. The salt flat sits around 3,650 metres and the lagoons higher, so plan gentle first days and drink water; starting low in San Pedro de Atacama (about 2,400 metres) and climbing helps." },
    ],
    geo: { lat: -20.2, lng: -67.55 },
    sources: [
      { title: "Explora: Travesía Atacama–Uyuni", url: "https://www.explora.com/travesia-atacama-uyuni/" },
      { title: "Explora Uyuni in the Ledger", url: "/stays/explora-at-uyuni-flats" },
    ],
  },
};

// Destination-first (Stage 2): the library's own place records (scripts/export-places.py) carry the
// Ledger ID, the parent and the stays selected through Stay Studio. They are merged onto the editorial
// guide here, library first, so a place's identity and relationships come from the library and its
// copy from this file. A library place with no guide yet is listed in LIBRARY_PLACES for the tests
// and llms.txt, but has no page until its guide is written.
export type LibraryPlace = { slug: string; name: string; ledgerId: string | null; parentSlug: string; regionSlug: string | null; subtitle: string | null; stays: string[] };
export const LIBRARY_PLACES: LibraryPlace[] = (PLACES as { places: LibraryPlace[] }).places;
for (const p of LIBRARY_PLACES) {
  const g = GUIDES[p.slug];
  if (!g || g.parent !== p.parentSlug) continue;
  g.ledgerId = p.ledgerId ?? g.ledgerId ?? null;
  g.stays = [...new Set([...(p.stays ?? []), ...(g.stays ?? [])])];
}

export const guideFor = (slug: string) => GUIDES[slug];
export const placeGuides = (country: string) => Object.values(GUIDES).filter((g) => g.parent === country);
/** The place guide a stay has been selected for (Nayara Hangaroa → Rapa Nui), if any. */
export const placeGuideForStay = (slug: string) => Object.values(GUIDES).find((g) => g.parent && g.stays?.includes(slug));
