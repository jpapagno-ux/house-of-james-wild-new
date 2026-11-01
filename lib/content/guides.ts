import type { TripImg } from "./trips";

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
  name: string; path: string;
  /** Page chrome: "sea" is the voyage navy the Indonesia guides use; "stays" is Volume I's green. Defaults to "sea". */
  theme?: "sea" | "stays";
  /** A Ledger chart inset (lib/charts/regions.json via IslandZoom) drawn under the facts: island groups too small for the country chart. */
  zoom?: "galapagos" | "rapa-nui";
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
    theme: "stays", zoom: "rapa-nui", stays: ["nayara-hangaroa"],
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
      { name: "Atacama", href: "/destinations/south-america/chile", line: "The desert and the clearest skies in the south" },
      { name: "Patagonia", href: "/destinations/south-america/chile", line: "Torres del Paine and the fjords, October to April" },
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
};

export const guideFor = (slug: string) => GUIDES[slug];
export const placeGuides = (country: string) => Object.values(GUIDES).filter((g) => g.parent === country);
/** The place guide a stay has been selected for (Nayara Hangaroa → Rapa Nui), if any. */
export const placeGuideForStay = (slug: string) => Object.values(GUIDES).find((g) => g.parent && g.stays?.includes(slug));
