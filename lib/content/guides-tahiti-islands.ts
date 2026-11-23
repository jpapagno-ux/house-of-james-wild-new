import type { Guide } from "./guides";

// Tahiti and Her Islands, the island pages (James, 15 Nov 2026): Tahiti Iti and Teahupo'o, Moorea, Rangiroa,
// Fakarava and Tikehau, beside the existing Taha'a, Bora Bora, Tuamotu and Marquesas guides (guides-tahiti.ts).
// Facts only from Tahiti Tourisme and Air Tahiti (as filed in lib/content/french-polynesia.ts and read 15 Nov 2026)
// and from each stay's own site; sources kept as data, never printed as links. Founder: in French Polynesia since
// May 1996; has sailed Windstar to Taha'a, Fakarava and Rangiroa with Miriam. Surfed Teahupo'o in May 1996, touring six days with Moana David after the Tahiti travel trade show (James, 16 Nov 2026).

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/oceania/tahiti";
const EYEBROW = "Destinations · Oceania · French Polynesia (Tahiti)";
const TT = (title: string, path: string) => ({ title: `Tahiti Tourisme: ${title}`, url: `https://www.tahititourisme.com/${path}` });
const AT_TUA = { title: "Air Tahiti: the Tuamotu", url: "https://www.airtahiti.com/en/archipel-des-tuamotu" };
const TT_HOP = TT("getting from island to island", "preparing-you-trip/getting-from-island-to-island/");
const TT_WHEN = TT("when to visit the islands of Tahiti", "preparing-you-trip/when-to-visit-the-islands-of-tahiti/");

const ISLANDS = [
  { name: "Tahiti Iti and Teahupo'o", slug: "tahiti-iti", line: "The wild peninsula and the wave at the end of the road" },
  { name: "Moorea", slug: "moorea", line: "Two bays, eight mountains, rays and whales, 30 minutes from Papeete" },
  { name: "Taha'a", slug: "tahaa", line: "The vanilla island and the founder's favourite" },
  { name: "Bora Bora", slug: "bora-bora", line: "Mount Otemanu inside a ring of motu" },
  { name: "Rangiroa", slug: "rangiroa", line: "Tiputa Pass and its dolphins" },
  { name: "Fakarava", slug: "fakarava", line: "A UNESCO biosphere and the wall of grey sharks" },
  { name: "Tikehau", slug: "tikehau", line: "Pink sand motu around a round lagoon" },
  { name: "The Tuamotu", slug: "tuamotu", line: "Seventy six atolls: the chapter on Rangiroa, Fakarava and Tikehau" },
  { name: "The Marquesas", slug: "marquesas", line: "Nuku Hiva and the far north east" },
];
export const ONWARD_ISLANDS = (except: string) => [
  ...ISLANDS.filter((i) => i.slug !== except).map((i) => ({ name: i.name, href: `${BASE}/${i.slug}`, line: i.line })),
  { name: "French Polynesia (Tahiti)", href: BASE, line: "The lagoon atlas, the island hops and every stay" },
];
const ONWARD_EYEBROW = "Tahiti and her islands";

export const TAHITI_ISLAND_GUIDES: Record<string, Guide> = {
  "tahiti-iti": {
    slug: "tahiti-iti", region: "oceania", country: "tahiti", parent: "tahiti", name: "Tahiti Iti and Teahupo'o", path: `${BASE}/tahiti-iti`,
    theme: "sea", stays: ["vanira-lodge"],
    proofEyebrow: "Founder surfed · Teahupo'o, May 1996",
    seo: {
      title: "Teahupo'o and Tahiti Iti: The Wave, the Peninsula and Where to Stay",
      description: "Tahiti Iti, the wild peninsula of Tahiti, ends at Teahupo'o, a powerful left whose biggest swells come May to October. Vanira Lodge in the hills above the wave, getting there from Faa'a, and when to go.",
      keywords: ["Teahupo'o", "Teahupoo surf", "Tahiti Iti", "where to stay Teahupo'o", "Vanira Lodge", "Teahupo'o surf season", "Tahiti surf trip"],
    },
    eyebrow: EYEBROW,
    h1: "Tahiti Iti and Teahupo'o",
    tagline: "The road runs out, the reef begins, and the wave is just offshore",
    slides: [],
    slidesFromStay: { slug: "vanira-lodge", alt: "Vanira Lodge's bungalows in the hills above Teahupo'o", credit: "Photograph courtesy of Vanira Lodge" },
    answer: "Tahiti Iti is the smaller peninsula of Tahiti, and the road along its south coast ends at Teahupo'o. Offshore, Teahupo'o Point is a powerful left whose biggest swells come May to October, which is also the dry season, and it hosts a contest each August (Tahiti Tourisme). Every international flight lands at Faa'a on Tahiti Nui. The house's base is Vanira Lodge: ten Polynesian bungalows in a tropical garden in the hills above Teahupo'o, a small family lodge with a restaurant, pools and boat, dive, surf, hiking and riding trips with local partners. Rent a car, the lodge advises, to explore the peninsula.",
    facts: [
      ["The wave", "Teahupo'o Point: a powerful left off Tahiti Iti"],
      ["Swell season", "May to October; a contest each August"],
      ["Getting there", "Tahiti Faa'a (PPT), then by road to the end of Tahiti Iti; a rental car is recommended"],
      ["The stay", "Vanira Lodge: ten bungalows in a 1.5 hectare garden above Teahupo'o"],
      ["On the water", "Boat trips, surfing and diving with local partners"],
    ],
    proof: "James surfed Teahupo'o in May 1996, when few surfers knew the wave existed, touring the island for six days with Moana David after the Tahiti travel trade show. Tahiti has been his favourite ever since, and Vanira Lodge is in the Ledger as the closest stay to the wave.",
    months: [
      { area: "Teahupo'o swell", note: "Biggest swells May to October; contest in August (Tahiti Tourisme)", months: M("ggggBBBBBBgg") },
      { area: "Dry season", note: "May to October (Tahiti Tourisme)", months: M("wwwgBBBBBBgw") },
    ],
    airports: [["Tahiti Faa'a (PPT)", "Every international flight: nonstop from Los Angeles in about 8 hours, San Francisco about 8½, Honolulu about 6"]],
    transfers: [["Faa'a → Teahupo'o", "By road along the south coast to the end of Tahiti Iti; the lodge recommends a rental car"]],
    highlights: [
      { title: "Teahupo'o Point", line: "The wave", body: "A powerful left breaking over the reef off Tahiti Iti; its biggest swells come May to October." },
      { title: "The end of the road", line: "Tahiti Iti", body: "Past Teahupo'o the road stops; the rest of the peninsula is reached by boat and on foot." },
      { title: "A garden above the lagoon", line: "Vanira Lodge", body: "SPA bungalows with private jacuzzis, nature bungalows on stilts under turtle-shell roofs, and Restaurant Le Vanira, Breton and Tahitian cooking, open every day." },
    ],
    suits: [
      { who: "Surfers and their families", line: "A base in the hills above the wave.", href: "/stays/vanira-lodge", label: "Vanira Lodge" },
      { who: "First and last nights", line: "Close to Faa'a, on Tahiti Nui.", href: "/stays/pearl-resort-le-tahiti", label: "Le Tahiti" },
    ],
    howTo: {
      title: "Tahiti Iti in a Journey",
      intro: "Two or three nights at the end of the road, at the start or end of the islands. The house plans the car, the boat and the surf with local partners.",
      options: [
        { name: "Teahupo'o, then the lagoons", body: "Vanira Lodge, back to Faa'a, then Air Tahiti to Raiatea for Taha'a or to Bora Bora.", href: `${BASE}/tahaa`, label: "Taha'a" },
        { name: "Teahupo'o and Moorea", body: "The peninsula, then the ferry from Papeete to Moorea, 30 to 45 minutes.", href: `${BASE}/moorea`, label: "Moorea" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD_ISLANDS("tahiti-iti"),
    voyageWaters: [],
    faqs: [
      { q: "When is the surf season at Teahupo'o?", a: "Teahupo'o's biggest swells come May to October, Tahiti Tourisme says, and the wave hosts a contest each August. It is a powerful left over a shallow reef, for experienced surfers." },
      { q: "Where should we stay near Teahupo'o?", a: "Vanira Lodge, ten Polynesian bungalows in the hills above Teahupo'o, is the closest stay in the Ledger. It is a small family lodge rather than a resort; for a resort night, Le Tahiti by Pearl Resorts is on Tahiti Nui." },
      { q: "How do you get to Teahupo'o?", a: "Fly into Tahiti Faa'a, then drive along the south coast of Tahiti Iti to the end of the road. Vanira Lodge recommends renting a car." },
    ],
    geo: { lat: -17.87061, lng: -149.20154 },
    sources: [TT("Teahupo'o Point", "natural-heritage/teahupoo-point/"), { title: "Vanira Lodge", url: "https://www.vaniralodge.com/" }, TT_WHEN],
  },

  moorea: {
    slug: "moorea", region: "oceania", country: "tahiti", parent: "tahiti", name: "Moorea", path: `${BASE}/moorea`,
    theme: "sea", stays: [],
    proofEyebrow: "Island by island · the house's Society Islands file",
    seo: {
      title: "Moorea Travel Guide: Ferry from Papeete, Whales, Rays and the Belvedere",
      description: "Moorea, 17 km from Tahiti: the ferry in 30 to 45 minutes or a 15 minute flight, Cook's and Opunohu bays, the Belvedere lookout, sharks and rays at Tiahura, humpback whales July to November, hikes and dives.",
      keywords: ["Moorea travel guide", "ferry Papeete to Moorea", "Moorea whale watching", "Moorea stingrays Tiahura", "Belvedere lookout Moorea", "Moorea diving", "Opunohu Bay"],
    },
    eyebrow: EYEBROW,
    h1: "Moorea",
    tagline: "Two bays, eight mountains, and a lagoon with twelve passes",
    // The house watercolour of the Belvedere view. No hare (James, 23 Nov 2026).
    slides: [{ url: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/jwco/destinations/tahiti/plates/moorea-belvedere-plain", alt: "Watercolour of Moorea from the Belvedere: Cook's Bay and Opunohu Bay either side of Mount Rotui", credit: "Watercolour, James Wild & Co" }],
    answer: "Moorea is a volcanic island about 17 km north west of Tahiti, reached by ferry from Papeete in 30 to 45 minutes or by a flight of about 15 minutes from Faa'a (Tahiti Tourisme). Its two bays, Cook's and Opunohu, either side of Mount Rotui, give the island its trident shape; the Belvedere lookout looks over both. In the lagoon, inside a reef with twelve passes, Tiahura is known for sharks and rays; humpback whales come July to November; the water is 26 to 29°C all year. Hikes climb the passes and Mount Rotui, and Opunohu Valley holds ancient marae.",
    facts: [
      ["Where", "About 17 km north west of Tahiti, Society Islands"],
      ["Getting there", "Ferry from Papeete, 30 to 45 minutes; or about 15 minutes by air from Faa'a"],
      ["The lagoon", "A barrier reef with 12 passes; sharks and rays at Tiahura"],
      ["Whales", "Humpbacks, July to November"],
      ["Water", "26 to 29°C all year; visibility often over 30 m"],
      ["On land", "The Belvedere, Opunohu Valley's marae, Mount Rotui, the pineapple trail"],
    ],
    proof: "Moorea is on the house's Society Islands file as the closest island to Tahiti. No Moorea stay is in the Ledger yet; the house plans it from Tahiti or as part of a voyage.",
    months: [
      { area: "Humpback whales", note: "July to November (Tahiti Tourisme)", months: M("wwwwwwBBBBBw") },
      { area: "Lagoon outings", note: "Dry season May to October; water 26 to 29°C all year (Tahiti Tourisme)", months: M("ggggBBBBBBgg") },
    ],
    airports: [["Moorea Airport", "About 15 minutes from Tahiti Faa'a"], ["Tahiti Faa'a (PPT)", "International arrivals"]],
    transfers: [["Papeete → Moorea", "Ferry or high-speed boat, 30 to 45 minutes, to Vaiare"], ["Faa'a → Moorea", "About 15 minutes by air"]],
    highlights: [
      { title: "The Belvedere", line: "Above the bays", body: "The lookout over Cook's Bay and Opunohu Bay, with Mount Rotui between them." },
      { title: "Tiahura", line: "In the lagoon", body: "Snorkelling with sharks and rays; the Coral Garden and the underwater tiki are nearby." },
      { title: "Humpbacks", line: "July to November", body: "Watch from a boat or swim with them, with certified operators only." },
      { title: "Dive the canyons", line: "Opunohu", body: "The Canyons of Opunohu, Tiki and the coral gardens of Vaiare, in water of 26 to 29°C." },
    ],
    suits: [
      { who: "A first island", line: "Thirty minutes from Papeete by ferry.", href: "/stays/pearl-resort-le-tahiti", label: "Le Tahiti" },
    ],
    howTo: {
      title: "Moorea in a Journey",
      intro: "Moorea is the easiest island to add: a day from Tahiti, or a night or two before flying on to the Leeward Islands.",
      options: [
        { name: "Tahiti, Moorea, then Taha'a", body: "Le Tahiti for the first night, the ferry to Moorea, then Air Tahiti on to Raiatea for Taha'a.", href: `${BASE}/tahaa`, label: "Taha'a" },
        { name: "Moorea and Bora Bora", body: "Air Tahiti flies Moorea to Bora Bora direct.", href: `${BASE}/bora-bora`, label: "Bora Bora" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD_ISLANDS("moorea"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get from Tahiti to Moorea?", a: "By ferry or high-speed boat from Papeete, 30 to 45 minutes, or by a flight of about 15 minutes from Tahiti Faa'a to Moorea Airport." },
      { q: "When can you see whales in Moorea?", a: "Humpback whales come to French Polynesia from July to November. Watch or swim with them only with certified operators." },
      { q: "Where can you snorkel with sharks and rays in Moorea?", a: "Tiahura, on the lagoon, is known for frequent shark and ray sightings; the Coral Garden and the Lagoonarium are nearby." },
      { q: "Is Moorea worth a stay, or a day trip?", a: "Both work. The ferry makes a day easy, but a night or two leaves time for the Belvedere, a hike, a dive and the lagoon." },
    ],
    geo: { lat: -17.5388, lng: -149.8295 },
    sources: [TT("getting to and around Moorea", "islands/moorea/getting-there-and-getting-around/"), TT("Moorea", "islands/moorea/"), TT("things to do in Moorea", "islands/moorea/what-to-do-in-moorea/"), TT_HOP],
  },

  rangiroa: {
    slug: "rangiroa", region: "oceania", country: "tahiti", parent: "tahiti", name: "Rangiroa", path: `${BASE}/rangiroa`,
    theme: "sea", stays: [],
    proofEyebrow: "Sailed with Windstar · the founder and Miriam",
    seo: {
      title: "Rangiroa Diving: Tiputa Pass, Dolphins, Mantas and the Coral Garden",
      description: "Rangiroa, one of the largest atolls in the world: the Tiputa Pass drift dive with dolphins, sharks and mantas, the Coral Garden across the lagoon, flights from Tahiti and Bora Bora, and when to go.",
      keywords: ["Rangiroa diving", "Tiputa Pass", "Rangiroa dolphins", "Rangiroa travel guide", "Tuamotu diving", "how to get to Rangiroa"],
    },
    eyebrow: EYEBROW,
    h1: "Rangiroa",
    tagline: "A lagoon you cannot see across, and a pass full of dolphins",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-le-tikehau", alt: "A Tuamotu lagoon from the motu", credit: "Photograph courtesy of Le Tikehau, Pearl Resorts of Tahiti" },
    answer: "Rangiroa, in the Tuamotu, is one of the largest atolls in the world. Tiputa Pass on its north rim is the famous drift dive, with dolphins, sharks and mantas from 12 to 46 m; across the lagoon on the south west side, the Coral Garden is reached by boat from the Tiputa quay (Tahiti Tourisme). Air Tahiti flies from Tahiti in about an hour, or direct from Bora Bora. Diving is good all year, with the warmest water November to April. James and Miriam have sailed here with Windstar.",
    facts: [
      ["Where", "Tuamotu; one of the largest atolls in the world"],
      ["Getting there", "Air Tahiti from Tahiti, about 1 hour; direct from Bora Bora"],
      ["The dive", "Tiputa Pass: dolphins, sharks and mantas, 12 to 46 m"],
      ["Snorkel", "The Coral Garden, south west side, by boat from the Tiputa quay"],
      ["Best months", "All year; warmest water November to April"],
      ["Pass", "Air Tahiti's TUAMOTU pass covers two or three of Rangiroa, Tikehau and Fakarava"],
    ],
    proof: "James and Miriam have sailed to Rangiroa with Windstar. No Rangiroa stay is in the Ledger yet; the house plans it by voyage or as a hop from Tikehau.",
    months: [{ area: "Diving", note: "All year; warmest water November to April (Tahiti Tourisme)", months: M("BBBBggggggBB") }],
    airports: [["Rangiroa (RGI)", "About 1 hour from Tahiti; direct from Bora Bora"]],
    transfers: [["Tahiti → Rangiroa", "About 1 hour by Air Tahiti"], ["Tiputa quay → the Coral Garden", "By boat across the lagoon"]],
    highlights: [
      { title: "Tiputa Pass", line: "The drift", body: "Ride the tide through the pass with dolphins, grey sharks and mantas, 12 to 46 m." },
      { title: "The Coral Garden", line: "Across the lagoon", body: "Reefs and tropical fish on the south west side, by boat from Tiputa." },
    ],
    suits: [{ who: "Divers", line: "One of the great drift dives of the Pacific.", href: `${BASE}/tikehau`, label: "Stay on Tikehau" }],
    howTo: {
      title: "Rangiroa in a Journey",
      intro: "The Tuamotu are flown in a loop: Air Tahiti's TUAMOTU pass covers two or three of Rangiroa, Tikehau and Fakarava.",
      options: [
        { name: "Tikehau and Rangiroa", body: "Stay at Le Tikehau and dive Rangiroa's pass on the same pass.", href: `${BASE}/tikehau`, label: "Tikehau" },
        { name: "By sea", body: "Windstar's voyages call at Rangiroa; the house books the ship and the dives.", href: "/voyages/ships/star-breeze", label: "Star Breeze" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD_ISLANDS("rangiroa"),
    voyageWaters: [],
    faqs: [
      { q: "What is Tiputa Pass?", a: "The pass on Rangiroa's north rim where the tide pours in and out of the lagoon; divers drift through with dolphins, sharks and mantas, from 12 to 46 m." },
      { q: "When is the best time to dive Rangiroa?", a: "Diving is good all year; the warmest water is November to April." },
      { q: "How do you get to Rangiroa?", a: "Air Tahiti flies from Tahiti in about an hour, and direct from Bora Bora." },
    ],
    geo: { lat: -14.972144, lng: -147.6289 },
    sources: [TT("Tiputa Pass", "natural-heritage/passe-de-tiputa/"), AT_TUA, TT_WHEN],
  },

  fakarava: {
    slug: "fakarava", region: "oceania", country: "tahiti", parent: "tahiti", name: "Fakarava", path: `${BASE}/fakarava`,
    theme: "sea", stays: [],
    proofEyebrow: "Sailed with Windstar · the founder and Miriam",
    seo: {
      title: "Fakarava: The UNESCO Biosphere, the Wall of Grey Sharks and Garuae Pass",
      description: "Fakarava, Tuamotu: a UNESCO biosphere reserve, Garuae, the widest pass in French Polynesia, and the wall of more than 700 grey sharks at Tumakohua Pass in June and July. Flights, seasons and how to plan it.",
      keywords: ["Fakarava", "Fakarava sharks", "wall of sharks Fakarava", "Fakarava biosphere reserve", "Garuae Pass", "Tumakohua Pass", "Fakarava diving"],
    },
    eyebrow: EYEBROW,
    h1: "Fakarava",
    tagline: "A biosphere reserve, the widest pass in Polynesia, and a wall of sharks",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-le-tikehau", alt: "A Tuamotu lagoon from the motu", credit: "Photograph courtesy of Le Tikehau, Pearl Resorts of Tahiti" },
    answer: "Fakarava is a long rectangular atoll in the Tuamotu, inside the Commune of Fakarava UNESCO biosphere reserve. Garuae, its north pass, is the widest in French Polynesia; by Tumakohua, the south pass, more than 700 grey sharks gather in June and July, for divers aged 12 and over at level 1, and groupers spawn in June (Tahiti Tourisme). Air Tahiti flies from Tahiti direct in 1 hour 10 minutes, and from Bora Bora. James and Miriam have sailed here with Windstar.",
    facts: [
      ["Where", "Tuamotu, 375 km from Tahiti"],
      ["Protected", "Commune of Fakarava Biosphere Reserve (UNESCO)"],
      ["Getting there", "Air Tahiti from Tahiti, 1 hour 10 minutes; direct from Bora Bora"],
      ["The wall", "Over 700 grey sharks at Tumakohua Pass, June and July; level 1 divers aged 12 and over"],
      ["Garuae", "The north pass, the widest in French Polynesia"],
      ["Best months", "Diving all year; groupers spawn in June"],
    ],
    proof: "James and Miriam have sailed to Fakarava with Windstar. Raimiti, in south Fakarava, is filed in the library; its page follows once the lodge's own facts are in.",
    months: [{ area: "The wall of sharks and spawning groupers", note: "June and July; diving good all year (Tahiti Tourisme)", months: M("gggggBBggggg") }],
    airports: [["Fakarava (FAV)", "1 hour 10 minutes from Tahiti; direct from Bora Bora"]],
    transfers: [["Tahiti → Fakarava", "1 hour 10 minutes by Air Tahiti, 375 km"]],
    highlights: [
      { title: "Le Mur de Requins Gris", line: "Tumakohua Pass", body: "More than 700 grey sharks in June and July, when the groupers spawn." },
      { title: "Garuae", line: "The north pass", body: "The widest pass in French Polynesia." },
      { title: "A biosphere reserve", line: "UNESCO", body: "The atoll lies within the Commune of Fakarava Biosphere Reserve." },
    ],
    suits: [{ who: "Divers", line: "The wall of sharks, June and July.", href: `${BASE}/tikehau`, label: "Pair with Tikehau" }],
    howTo: {
      title: "Fakarava in a Journey",
      intro: "Fakarava pairs with Tikehau or Rangiroa on Air Tahiti's TUAMOTU pass, or comes by sea.",
      options: [
        { name: "By sea", body: "Windstar's voyages call at Fakarava; the house books the ship and the dives.", href: "/voyages/ships/star-breeze", label: "Star Breeze" },
        { name: "Tikehau and Fakarava", body: "Le Tikehau's motu, then the south pass for the sharks.", href: `${BASE}/tikehau`, label: "Tikehau" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD_ISLANDS("fakarava"),
    voyageWaters: [],
    faqs: [
      { q: "When can you see the wall of sharks at Fakarava?", a: "More than 700 grey sharks gather at Tumakohua, the south pass, in June and July, when the groupers spawn. The dive is for divers aged 12 and over, certified to level 1." },
      { q: "Is Fakarava a UNESCO site?", a: "Fakarava lies within the Commune of Fakarava Biosphere Reserve, part of UNESCO's Man and the Biosphere programme." },
      { q: "How do you get to Fakarava?", a: "Air Tahiti flies from Tahiti in 1 hour 10 minutes direct, and from Bora Bora. Windstar's voyages also call there." },
    ],
    geo: { lat: -16.27, lng: -145.55 },
    sources: [TT("le Mur de Requins Gris", "natural-heritage/le-mur-de-requins-gris/"), AT_TUA, TT_WHEN],
  },

  tikehau: {
    slug: "tikehau", region: "oceania", country: "tahiti", parent: "tahiti", name: "Tikehau", path: `${BASE}/tikehau`,
    theme: "sea", stays: ["pearl-resort-le-tikehau"],
    proofEyebrow: "Founder vetted · Pearl Resorts of Tahiti",
    seo: {
      title: "Tikehau: Pink Sand Motu, Le Tikehau and the Tuamotu by Air",
      description: "Tikehau, a near-round Tuamotu atoll of pink sand motu: Le Tikehau's 29 bungalows on motu Tianoa, under an hour by air from Tahiti or direct from Bora Bora. When to go and how to pair it with Rangiroa and Fakarava.",
      keywords: ["Tikehau", "Le Tikehau", "Tikehau Pearl Resort", "Tikehau pink sand", "Tuamotu resort", "how to get to Tikehau"],
    },
    eyebrow: EYEBROW,
    h1: "Tikehau",
    tagline: "A round lagoon, pink sand, and a motu fifteen minutes from the village",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-le-tikehau", alt: "Le Tikehau's overwater bungalows on Tikehau atoll", credit: "Photograph courtesy of Le Tikehau, Pearl Resorts of Tahiti" },
    answer: "Tikehau is a near-round atoll of pink sand motu in the Tuamotu, under an hour by Air Tahiti from Tahiti or direct from Bora Bora. The house stays at Le Tikehau by Pearl Resorts: 29 bungalows on motu Tianoa, a 15 minute boat ride from the village. It is good all year; the warmest water is November to April, and it is quieter September to November and February to April (Tahiti Tourisme). Air Tahiti's TUAMOTU pass pairs it with Rangiroa or Fakarava.",
    facts: [
      ["The stay", "Le Tikehau by Pearl Resorts: 29 bungalows on motu Tianoa"],
      ["Getting there", "Air Tahiti from Tahiti, under an hour; direct from Bora Bora; then 15 minutes by boat"],
      ["Best months", "Good all year; warmest water November to April"],
      ["Quieter", "September to November and February to April"],
      ["Pairs with", "Rangiroa and Fakarava, on Air Tahiti's TUAMOTU pass"],
    ],
    proof: "Le Tikehau is founder vetted and part of Pearl Resorts of Tahiti, the house's partner in the islands.",
    months: [{ area: "The lagoon", note: "Good all year; warmest November to April; quieter Sep to Nov and Feb to Apr (Tahiti Tourisme)", months: M("BBBBggggggBB") }],
    airports: [["Tikehau (TIH)", "Under an hour from Tahiti; direct from Bora Bora"]],
    transfers: [["Tikehau airport → Le Tikehau", "About 15 minutes by boat"]],
    highlights: [
      { title: "Pink sand motu", line: "Tikehau", body: "A ring of motu around a near-round lagoon." },
      { title: "Overwater, on the motu", line: "Le Tikehau", body: "Overwater bungalows and suites, beach bungalows and the Royal Beach Villa with Pool." },
    ],
    suits: [
      { who: "Honeymooners", line: "Overwater on a quiet atoll.", href: "/stays/pearl-resort-le-tikehau", label: "Le Tikehau" },
      { who: "Divers", line: "A base for Rangiroa and Fakarava.", href: `${BASE}/rangiroa`, label: "Rangiroa" },
    ],
    howTo: {
      title: "Tikehau in a Journey",
      intro: "Pearl's Islands Dream Offer pairs Le Bora Bora with a second Pearl resort, Le Tikehau among them.",
      options: [
        { name: "Bora Bora and Tikehau", body: "Le Bora Bora, then the direct flight to Tikehau for Le Tikehau.", href: "/partners/pearl-resorts", label: "Pearl Resorts" },
        { name: "The Tuamotu loop", body: "Tikehau with Rangiroa or Fakarava on Air Tahiti's TUAMOTU pass.", href: `${BASE}/tuamotu`, label: "The Tuamotu" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD_ISLANDS("tikehau"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Tikehau?", a: "Air Tahiti flies from Tahiti in under an hour, and direct from Bora Bora; Le Tikehau is a 15 minute boat ride from the village." },
      { q: "When is the best time to visit Tikehau?", a: "Tikehau is good all year. The warmest water is November to April, and it is quieter September to November and February to April." },
      { q: "Can we combine Tikehau with Bora Bora?", a: "Yes. There are direct flights, and Pearl's Islands Dream Offer pairs Le Bora Bora with Le Tikehau." },
    ],
    geo: { lat: -15.0, lng: -148.17 },
    sources: [AT_TUA, TT_WHEN, { title: "Le Tikehau by Pearl Resorts", url: "https://www.letikehau.com/" }],
  },
};
