import type { Guide } from "./guides";

// Bali, a place inside Indonesia (James, 21 Nov 2026: "I think we have Indonesia but no Bali page", then "Yes
// proceed"). The Indonesia guide is told by sea and its Bali stays were listed only there; this is their home page,
// the third place beside Raja Ampat and Komodo. Travel facts only from Indonesia's official tourism board
// (indonesia.travel) and UNESCO, kept as data and never printed as links (James, 13 Nov 2026); property facts only
// from each stay's own library record (stays.json). Founder marks follow the Indonesia guide: James was in Bali in
// November 2024. IMAGE FOLLOW-UP: the licensed Getty photographs for Bali wait in HERO_QUEUE (countries-house.ts)
// until their full-size files are filed, so the hero borrows the lead stay's frames, credited. Copy is unreviewed.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/asia/indonesia";
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/";

export const BALI_GUIDES: Record<string, Guide> = {
  bali: {
    slug: "bali", region: "asia", country: "indonesia", parent: "indonesia", name: "Bali", path: `${BASE}/bali`,
    theme: "stays",
    // Founder favourites first, then founder inspected (the Indonesia guide's own order).
    stays: ["como-shambhala-estate", "tanah-gajah", "viceroy-bali", "kayumanis-ubud", "como-uma-canggu", "soori-bali", "ungasan-clifftops", "kayumanis-jimbaran-private-estates", "kayumanis-nusa-dua", "kayumanis-sanur", "capella-ubud", "bambu-indah"],
    seo: {
      title: "Bali Guide: Ubud, Uluwatu, Nusa Penida, Best Time & Where to Stay",
      description: "Bali with James Wild & Co: Ubud's rice terraces and the UNESCO subak landscape, the Uluwatu cliffs, Nusa Penida by boat, the dry season from April to October, and twelve stays the founder knows.",
      keywords: ["Bali travel guide", "best time to visit Bali", "where to stay in Ubud", "Bali luxury villas", "Uluwatu cliff resort", "Nusa Penida day trip", "Tegallalang rice terraces", "Bali subak UNESCO"],
    },
    eyebrow: "Destinations · Asia · Indonesia",
    h1: "Bali",
    tagline: "Rice terraces, water temples and a coast for every mood, eight degrees south of the equator",
    slides: [],
    slidesFromStay: { slug: "como-shambhala-estate", alt: "COMO Shambhala Estate in the hills near Ubud, Bali", credit: "Photograph courtesy of COMO Shambhala Estate" },
    answer: "Bali is a volcanic island eight degrees south of the equator, Indonesia's top destination and the usual first and last stop on an Indonesian journey. The dry season, April to October, is the time to go. Ubud, in the centre, is the base for rice terraces, temples and the Ayung River; the southern peninsula has the cliffs of Uluwatu and the beaches of Jimbaran, Nusa Dua and Sanur; Nusa Penida is about 45 minutes away by boat. UNESCO lists five of Bali's rice terrace landscapes and their water temples, 19,500 hectares in all, as a World Heritage Site. You fly into Ngurah Rai International Airport (DPS), and the house has twelve stays here that James knows in person.",
    facts: [
      ["Where", "An island east of Java, eight degrees south of the equator"],
      ["Best time", "April to October, the dry season; the rains run from about November to March"],
      ["Fly into", "Ngurah Rai International Airport (DPS), near Denpasar"],
      ["UNESCO", "The Cultural Landscape of Bali Province, inscribed 2012: five rice terrace sites and their water temples, 19,500 hectares"],
      ["Know before you go", "On Nyepi, the Day of Silence, the island stops for a full day and the airport closes for 24 hours"],
      ["In the Ledger", "Twelve stays · James was in Bali in November 2024"],
    ],
    proof: "James was in Bali in November 2024. COMO Shambhala Estate, COMO Canggu, Tanah Gajah, the four Kayumanis villas, Viceroy Bali, The Ungasan and Soori Bali are his founder favourites; Capella Ubud and Bambu Indah he has inspected. Every stay on this page carries its own Ledger record.",
    months: [
      { area: "Bali", note: "Dry season April to October · cooler and wetter in the central mountains", months: M("wwwBBBBBBBww") },
    ],
    airports: [["Bali (DPS)", "Ngurah Rai International Airport, the island's one air gateway; closed for 24 hours on Nyepi"], ["Labuan Bajo (LBJ)", "About an hour's flight, for Komodo before or after"]],
    transfers: [["DPS → Jimbaran and Nusa Dua", "10 to 20 minutes by road"], ["DPS → Uluwatu", "25 to 30 minutes by road in normal traffic"], ["DPS → Ubud", "About 90 minutes by road, longer at peak times"], ["Sanur → Nusa Penida", "About 45 minutes by boat"]],
    highlights: [
      { title: "Ubud", line: "The centre of the island", body: "The name comes from ubad, the Balinese word for medicine, after the healing plants that grow here. Rice fields, temple processions, the Sacred Monkey Forest Sanctuary and rafting on the Ayung River are all close by." },
      { title: "The subak landscape", line: "UNESCO, 2012", body: "Subak is the cooperative system of canals and weirs that waters Bali's rice terraces, run from its water temples. UNESCO inscribed five sites, 19,500 hectares, as an expression of Tri Hita Karana: the harmony of spirit, people and nature." },
      { title: "Tegallalang", line: "Go early", body: "The rice terraces north of Ubud. Indonesia's tourism board says to walk them while the sun is still young, before the heat and the crowds." },
      { title: "Uluwatu", line: "The southern cliffs", body: "The Kecak dance, performed on the clifftop above the Indian Ocean at sunset." },
      { title: "Nusa Penida", line: "45 minutes by boat", body: "Kelingking, Atuh and Broken beaches below high cliffs, and manta and reef diving offshore. Boats leave from Sanur and Nusa Dua." },
      { title: "Kintamani and Mount Batur", line: "The volcano and its lake", body: "Mount Batur looks over Lake Batur in the central highlands, where peaks rise above 3,000 metres and the air is cooler and wetter than the coast." },
      { title: "Menjangan and the west", line: "Quiet water", body: "Diving at Menjangan Island, with a reef flat, a wreck and caves, and the West Bali National Park, home of the Bali starling." },
    ],
    firstTime: {
      title: "Your First Bali",
      intro: "Bali is easy to reach and easy to get wrong. Where you sleep decides which island you meet.",
      points: [
        ["Go April to October", "The dry season, by Indonesia's own tourism board. The central hills stay cooler and take more rain than the coast."],
        ["Split the stay", "A few nights in the hills around Ubud and a few on the coast show two different islands. The drive between them is about 90 minutes."],
        ["Start early", "Rice terraces, temples and viewpoints are quietest in the first hours of the day. Traffic builds at peak times and ceremonies can close a road."],
        ["Check the date of Nyepi", "On the Day of Silence the whole island stops and the airport closes for 24 hours. Arrive before it or after it."],
        ["Add Komodo", "Labuan Bajo is about an hour away by air. Four nights at sea there turns Bali into a complete Indonesian journey."],
      ],
    },
    suits: [
      { who: "Wellness travellers", line: "In the hills near Ubud, about 90 minutes from the airport.", href: "/stays/como-shambhala-estate", label: "COMO Shambhala Estate" },
      { who: "Couples", line: "Private pool villas in the forest above the Ayung River.", href: "/stays/kayumanis-ubud", label: "Kayumanis Ubud" },
      { who: "Families and surfers", line: "A beachfront base on Echo Beach, with surf lessons.", href: "/stays/como-uma-canggu", label: "COMO Canggu" },
      { who: "Cliff and ocean people", line: "Above the Indian Ocean on the cliffs of Uluwatu, half an hour from the airport.", href: "/stays/ungasan-clifftops", label: "The Ungasan" },
      { who: "Voyagers", line: "Bali before or after a phinisi voyage in Komodo or Raja Ampat.", href: BASE, label: "Indonesia, by sea" },
    ],
    howTo: {
      title: "How to See Bali",
      intro: "Choose two bases, hire a car and driver, and leave room in each day. The island rewards the slow version.",
      options: [
        { name: "The hills, then the coast", body: "Three or four nights around Ubud for the terraces, temples and river, then three or four by the sea at Jimbaran, Nusa Dua, Sanur, Canggu or Uluwatu.", href: "#stays", label: "The Bali stays" },
        { name: "Bali and Komodo", body: "Fly an hour to Labuan Bajo and join a small phinisi for four nights among the dragons, Padar and the mantas.", href: `${BASE}/komodo`, label: "Komodo National Park" },
        { name: "Plan it with James", body: "Tell the house your dates and it will set the bases, the nights and the order, around Nyepi and the ceremonies.", href: "/plan?place=Bali", label: "Plan it with James" },
      ],
    },
    onwardEyebrow: "Continue through Indonesia",
    onward: [
      { name: "Komodo National Park", href: `${BASE}/komodo`, line: "Dragons, mantas and a pink beach, an hour's flight from Bali" },
      { name: "Raja Ampat", href: `${BASE}/raja-ampat`, line: "The reefs at the end of the map" },
      { name: "Indonesia", href: BASE, line: "Every Indonesian stay and voyage in the Ledger" },
    ],
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit Bali?", a: "April to October, the dry season, according to Indonesia's official tourism board. The rainy season runs from about November to March. The central mountains are cooler and wetter than the coast all year." },
      { q: "Where should I stay in Bali for a first visit?", a: "Split the trip: a few nights in the hills around Ubud for rice terraces, temples and the Ayung River, then a few on the coast at Jimbaran, Nusa Dua, Sanur, Canggu or Uluwatu. The drive between the two is about 90 minutes." },
      { q: "Which airport do you fly into for Bali?", a: "Ngurah Rai International Airport (DPS), near Denpasar. It is the island's one air gateway and closes for 24 hours once a year, on Nyepi." },
      { q: "What is Nyepi?", a: "Nyepi is the Balinese Day of Silence. The island pauses nearly all activity for one whole day and the airport closes for 24 hours, so plan arrivals and departures around it." },
      { q: "Is Bali a UNESCO World Heritage Site?", a: "Part of it is. The Cultural Landscape of Bali Province: the Subak System as a Manifestation of the Tri Hita Karana Philosophy was inscribed in 2012. It covers five sites of rice terraces and their water temples, 19,500 hectares, including Lake Batur, the Batukaru landscape and the royal water temple of Pura Taman Ayun." },
      { q: "How do you get to Nusa Penida from Bali?", a: "By boat, in about 45 minutes from Sanur or Nusa Dua. Kelingking, Atuh and Broken beaches are the best known sights, and the dry season from April to October brings the better weather." },
      { q: "How far is Ubud from the airport?", a: "About 90 minutes by road from Ngurah Rai International Airport, longer at peak times. The stays arrange private transfers." },
      { q: "Can you combine Bali with Komodo?", a: "Yes. Labuan Bajo, the gateway to Komodo National Park, is about an hour's flight from Bali. Most travellers add four or five nights at sea there." },
      { q: "Has James been to Bali?", a: "Yes. James was in Bali in November 2024. Ten of the stays on this page are founder favourites and two more, Capella Ubud and Bambu Indah, he has inspected in person." },
    ],
    geo: { lat: -8.41, lng: 115.19 },
    sources: [
      { title: "Wonderful Indonesia: Bali", url: "https://www.indonesia.travel/id/en/destination/bali-nusa-tenggara/bali/bali" },
      { title: "Wonderful Indonesia: Ubud", url: "https://www.indonesia.travel/sa/en/destination/bali-nusa-tenggara/bali/ubud" },
      { title: "Wonderful Indonesia: Nusa Penida", url: "https://www.indonesia.travel/jp/en/travel-ideas/adventure/nusa-penida" },
      { title: "Wonderful Indonesia: things to do in Bali", url: "https://www.indonesia.travel/uae/en/travel-ideas/culture/10-irresistible-things-about-bali" },
      { title: "UNESCO World Heritage Committee: Decision 36 COM 8B.26, Cultural Landscape of Bali Province", url: "https://whc.unesco.org/en/decisions/4797" },
    ],
  },
};

/** The Bali card on the Indonesia guide's place list: the lead stay's own frame until the house's Bali hero is filed. */
export const BALI_PLACE_CARD = { name: "Bali", href: `${BASE}/bali`, line: "Rice terraces, water temples and a coast for every mood", image: { url: `${CLD}jwco/stays/como-shambhala-estate/hero`, alt: "COMO Shambhala Estate in the hills near Ubud, Bali", credit: "Photograph courtesy of COMO Shambhala Estate" }, best: "Apr to Oct" };
