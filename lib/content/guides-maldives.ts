import type { Guide } from "./guides";

// The Maldives, three ways in (James, 15 Nov 2026: "an atoll map with three ways in: honeymoon, reef and manta, and
// surf and ocean sports… a big push towards honeymoon and water sports, including day journeys by yacht from the
// resorts and weekly charters for surf, dive and reef"). Facts only from the resorts' own sites (as filed in the
// library records and read 15 Nov 2026: soneva.com, sixsenses.com, niyama.com, kudadoo.com, velaaprivateisland.com).
// Each stay has one home guide (placeGuideForStay); the others name it in their cards. No outbound links on the
// page; sources stay in the data. Heroes borrow each guide's lead stay, credited.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/asia/maldives";
const SONEVA_AQUA = { title: "Soneva in Aqua, the private yacht", url: "https://soneva.com/soneva-in-aqua/" };
const SS_LAAMU_WHEN = { title: "Six Senses Laamu: when to visit", url: "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/maldives/laamu/destination/when-to-visit/" };
const SS_LAAMU_WATER = { title: "Six Senses Laamu: watersports", url: "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/maldives/laamu/experiences/into-watersports/" };
const NIYAMA_SURF = { title: "Niyama Private Islands: surfing", url: "https://www.niyama.com/en/surfing" };
const KUDADOO_BELLA = { title: "Kudadoo: the yacht Bella", url: "https://www.kudadoo.com/latest-news/bella-luxury-yacht/" };
const VELAA_AMEERA = { title: "Velaa: Ameera joins the fleet", url: "https://www.velaaprivateisland.com/events-news/ameera-joins-the-fleet-at-velaa" };

// Every stay in the library, with its own position (from the brand's pin in the library record), for the atoll map.
const ATOLL_POINTS = [
  { name: "Soneva Jani, Noonu", lat: 5.567, lng: 73.001 },
  { name: "Velaa Private Island, Noonu", lat: 5.83348, lng: 73.2065 },
  { name: "Soneva Fushi, Baa", lat: 5.318, lng: 73.015 },
  { name: "Nautilus, Baa", lat: 5.23862, lng: 73.22098 },
  { name: "Kudadoo Private Island, Lhaviyani", lat: 5.493, lng: 73.44 },
  { name: "Six Senses Kanuhura, Lhaviyani", lat: 5.3546, lng: 73.3639 },
  { name: "JA Manafaru, Haa Alifu", lat: 6.8365, lng: 73.157 },
  { name: "Soneva Secret, Haa Dhaalu", lat: 6.7, lng: 72.9 },
  { name: "Niyama Private Islands, Dhaalu", lat: 2.626, lng: 72.887 },
  { name: "Six Senses Laamu, Laamu", lat: 1.7963, lng: 73.4472 },
];

const ONWARD = (except: string) => [
  { name: "The Maldives for Honeymoons", href: `${BASE}/honeymoon`, line: "Overwater villas, slides into the lagoon, a yacht at sunset" },
  { name: "Reef and Manta", href: `${BASE}/reef-and-manta`, line: "Mantas, whale sharks and the reefs, by day yacht or charter" },
  { name: "Surf and Ocean Sports", href: `${BASE}/surf-and-ocean-sports`, line: "Vodi, Kasabu and Yin Yang, kites, foils and catamarans" },
  { name: "The Maldives", href: BASE, line: "Every stay in the Ledger, atoll by atoll" },
].filter((o) => !o.href.endsWith(except));

const YACHT_DAYS = {
  title: "Day Journeys by Yacht, From the Resorts",
  intro: "Most of these islands keep their own boats. These are the yachts and day journeys the resorts publish, booked through us with the stay.",
  options: [
    { name: "Soneva in Aqua", body: "A 23-metre private yacht with two guest cabins, sailing from Soneva Fushi, Soneva Jani or Soneva Secret through Baa and Noonu, out to Goidhoo, Raa and Lhaviyani. Day charters, a night under open skies, or several days; a dive master or surf instructor can sail with you.", href: "/stays/soneva-fushi-maldives", label: "Soneva Fushi" },
    { name: "Bella, at Kudadoo", body: "Kudadoo's yacht runs to Hanifaru Bay for the mantas, a whale shark and manta search with a marine biologist, island hopping on Lhaviyani's remote reefs with a beach picnic, and a champagne sunset cruise that can run on to a night under the stars. Charged on top of the stay.", href: "/stays/kudadoo-private-island", label: "Kudadoo" },
    { name: "Ameera, at Velaa", body: "Velaa's Princess yacht, with an 18 sqm flybridge, for private sunset fishing, dolphin cruises, snorkelling and day charters, from one of the largest boat fleets in the Maldives.", href: "/stays/velaa-private-island", label: "Velaa" },
    { name: "Sunset sail at Laamu", body: "Six Senses Laamu sails catamarans at sunset for two, runs skippered snorkelling trips and rents fast boats by the hour.", href: "/stays/six-senses-laamu", label: "Six Senses Laamu" },
  ],
};

const CHARTERS = {
  title: "A Week at Sea: Surf, Dive and Reef Charters",
  intro: "For a week on the water rather than an island, the house charters a yacht for your party: one route, your crew, the breaks or the dive sites in the best order for the season. Soneva in Aqua sails multi-day voyages; we are adding liveaboard and surf-charter partners, vetted the way the stays are, and plan each week to order.",
};

export const MALDIVES_GUIDES: Record<string, Guide> = {
  honeymoon: {
    slug: "honeymoon", region: "asia", country: "maldives", parent: "maldives", name: "The Maldives for Honeymoons", path: `${BASE}/honeymoon`,
    theme: "sea", stays: ["soneva-jani-maldives", "velaa-private-island", "soneva-secret-maldives", "ja-manufaru-maldives", "six-senses-kanuhura"],
    proofEyebrow: "Chosen for two · the house's honeymoon file",
    seo: {
      title: "Maldives Honeymoon: The Best Overwater Villas, Private Islands and Yacht Days",
      description: "Where to honeymoon in the Maldives: Soneva Jani's water villas with slides, Velaa's Romantic Residences, Kudadoo's 15 overwater residences, a private yacht at sunset. Seaplane times, best months, how we plan it.",
      keywords: ["Maldives honeymoon", "best Maldives honeymoon resort", "Maldives overwater villa honeymoon", "Soneva Jani honeymoon", "Velaa honeymoon", "Maldives private island honeymoon", "Maldives yacht day trip"],
    },
    eyebrow: "Destinations · Asia · The Maldives",
    h1: "The Maldives for Honeymoons",
    tagline: "A villa over the lagoon, a slide into it, and a yacht for the two of you at sunset",
    slides: [],
    slidesFromStay: { slug: "soneva-jani-maldives", alt: "Soneva Jani's water villas over the Noonu lagoon", credit: "Photograph courtesy of Soneva Jani" },
    answer: "For a honeymoon in the Maldives, the house starts with three islands: Soneva Jani in Noonu, whose Water Reserves have a slide into the lagoon and a roof that opens to the stars; Velaa Private Island, 45 minutes by seaplane from Malé, with Romantic Pool Residences built for two; and Kudadoo in Lhaviyani, 15 overwater residences where everything is included. Add a day on a private yacht, Soneva in Aqua, Kudadoo's Bella or Velaa's Ameera, for mantas, a sandbank and the sunset. November to April is the dry season the resorts call best for calm seas.",
    facts: [
      ["The shortlist", "Soneva Jani · Velaa · Kudadoo"],
      ["Getting there", "Fly to Malé (MLE), then seaplane: Velaa 45 min, Soneva Fushi 30 min, Soneva Secret 75 min"],
      ["Best months", "November to April for calm seas and clear skies"],
      ["Villas", "Overwater, most with a pool; Soneva Jani's with a slide into the lagoon"],
      ["Yacht days", "Soneva in Aqua, Bella at Kudadoo, Ameera at Velaa"],
      ["Farthest away", "Soneva Secret, Haa Dhaalu: 14 villas, an overwater observatory reached by zip-line"],
    ],
    proof: "The Maldives honeymoon file is the house's: every island on it is in the Ledger with its own ID, picked for privacy, the water and the boat that comes with it, and planned end to end by one advisor.",
    months: [{ area: "Calm seas, clear skies", note: "Dry season November to April (the resorts)", months: M("BBBBgwwwwggB") }],
    airports: [["Velana International, Malé (MLE)", "Every international arrival; seaplanes leave from the terminal next door"], ["Maafaru (NMF), Noonu", "The airport in Soneva Jani's atoll"]],
    transfers: [["Malé → Velaa", "45 minutes by seaplane, or about 4 hours by yacht"], ["Malé → Soneva Fushi", "30 minutes by seaplane"], ["Malé → Kudadoo", "30 to 60 minutes by seaplane or private transfer"], ["Malé → Soneva Secret", "75 minutes by seaplane, or 55 by private charter"]],
    highlights: [
      { title: "Slide into the lagoon", line: "Soneva Jani", body: "Water Reserves from 555 sqm, each with a slide from the deck into the water and a retractable roof over the bed." },
      { title: "Built for two", line: "Velaa", body: "Romantic Pool Residences, apart from the rest of the island, with their own pool over the lagoon." },
      { title: "Fifteen residences, nothing to sign", line: "Kudadoo", body: "Fifteen overwater residences on Lhaviyani, where everything on the island is included: Anything, Anytime, Anywhere." },
      { title: "A night under the stars", line: "By yacht", body: "Kudadoo's champagne sunset cruise on Bella can run on to a night at anchor; Soneva in Aqua sails overnight too." },
    ],
    suits: [
      { who: "Barefoot romantics", line: "A water villa with a slide and a roof that opens.", href: "/stays/soneva-jani-maldives", label: "Soneva Jani" },
      { who: "Total privacy", line: "Romantic Residences on an island of its own design.", href: "/stays/velaa-private-island", label: "Velaa" },
      { who: "No bills, no decisions", line: "Fifteen residences, everything included.", href: "/stays/kudadoo-private-island", label: "Kudadoo" },
      { who: "Off the map", line: "Fourteen villas in the far north, a zip-line to the observatory.", href: "/stays/soneva-secret-maldives", label: "Soneva Secret" },
    ],
    howTo: YACHT_DAYS,
    places: undefined,
    onwardEyebrow: "Three ways into the Maldives",
    onward: ONWARD("honeymoon"),
    voyageWaters: [],
    see3d: { page: "destinations/asia/maldives/honeymoon", title: "The Atolls, Island by Island", intro: "Every Maldives stay in the Ledger on the atolls, from Haa Alifu in the north to Laamu in the south. Positions from each resort.", points: ATOLL_POINTS },
    faqs: [
      { q: "What is the best Maldives resort for a honeymoon?", a: "The house's shortlist is Soneva Jani for its water villas with slides, Velaa Private Island for its Romantic Pool Residences and privacy, and Kudadoo for 15 overwater residences with everything included. The right one depends on how far you want to fly and how much you want to plan." },
      { q: "When is the best time to honeymoon in the Maldives?", a: "November to April is the dry season the resorts recommend for calm seas and clear skies. Soneva calls the Maldives an all-season destination and says May to October is best for manta rays." },
      { q: "How do you get to a Maldives island resort?", a: "Fly to Velana International Airport in Malé, then by seaplane: 30 minutes to Soneva Fushi, 45 to Velaa, 75 to Soneva Secret. Some resorts use domestic flights and a speedboat instead; we book the transfer with the stay." },
      { q: "Can we take a private yacht for the day?", a: "Yes. Soneva in Aqua sails from the Soneva islands for a day, a night or longer; Kudadoo's Bella goes to Hanifaru Bay and out for sunset; Velaa's Ameera runs day charters, fishing and dolphin cruises." },
      { q: "Is everything included anywhere?", a: "At Kudadoo, yes: its Anything, Anytime, Anywhere concept includes everything on the island. Yacht excursions on Bella are charged on top." },
    ],
    geo: { lat: 5.5, lng: 73.1 },
    sources: [SONEVA_AQUA, KUDADOO_BELLA, VELAA_AMEERA, { title: "Soneva Jani", url: "https://soneva.com/resorts/soneva-jani/" }, { title: "Velaa: the Romantic Residence", url: "https://www.velaaprivateisland.com/villas/the-romantic-residence" }],
  },

  "reef-and-manta": {
    slug: "reef-and-manta", region: "asia", country: "maldives", parent: "maldives", name: "Reef and Manta", path: `${BASE}/reef-and-manta`,
    theme: "sea", stays: ["kudadoo-private-island", "soneva-fushi-maldives", "nautilus-maldives"],
    proofEyebrow: "The water first · the house's reef file",
    seo: {
      title: "Maldives Manta Rays and Reefs: Hanifaru Bay, Whale Sharks and Where to Stay",
      description: "Swim with manta rays in the Maldives: Hanifaru Bay in the Baa Atoll biosphere, whale shark searches with a marine biologist, Laamu's year-round mantas, and the yachts and charters that take you there.",
      keywords: ["Maldives manta rays", "Hanifaru Bay", "Baa Atoll mantas", "swim with whale sharks Maldives", "Maldives snorkelling resort", "Maldives dive liveaboard", "Laamu manta"],
    },
    eyebrow: "Destinations · Asia · The Maldives",
    h1: "Reef and Manta",
    tagline: "Hanifaru Bay, a whale shark search, and reefs you reach by your own boat",
    slides: [],
    slidesFromStay: { slug: "soneva-fushi-maldives", alt: "Soneva Fushi's island and reef in the Baa Atoll", credit: "Photograph courtesy of Soneva Fushi" },
    answer: "For manta rays in the Maldives, stay in or near the Baa Atoll: Soneva Fushi and Nautilus are in it, and Kudadoo's yacht runs from Lhaviyani to Hanifaru Bay, which Kudadoo calls the world's largest feeding ground for manta rays, and on a whale shark and manta search with a marine biologist. Soneva says May to October, the monsoon months, is best for mantas. In the south, Six Senses Laamu says divers and snorkellers meet mantas all year. For a week on the reefs, Soneva in Aqua sails multi-day from the Soneva islands.",
    facts: [
      ["Manta country", "Baa Atoll: Soneva Fushi, Nautilus; Hanifaru Bay by yacht"],
      ["Manta months", "May to October, per Soneva; all year at Laamu, per Six Senses"],
      ["Whale sharks", "Kudadoo's whale shark and manta search, with a marine biologist"],
      ["Getting there", "Seaplane from Malé: Soneva Fushi 30 min, Nautilus about 30 min"],
      ["Multi-day", "Soneva in Aqua: day, overnight or several days, dive master on request"],
      ["Turtles", "Laamu: nesting May to September, hatching July to October (Six Senses)"],
    ],
    proof: "The reef file follows the resorts' own marine teams: where the mantas feed, when, and which boat gets you there first. Every stay on it is in the Ledger.",
    months: [
      { area: "Mantas, Baa Atoll", note: "Monsoon months May to October (Soneva)", months: M("wwwwBBBBBBww") },
      { area: "Mantas, Laamu", note: "All year (Six Senses Laamu)", months: M("BBBBBBBBBBBB") },
      { area: "Calm seas, visibility", note: "Dry season November to April (the resorts)", months: M("BBBBgwwwwggB") },
    ],
    airports: [["Velana International, Malé (MLE)", "International arrivals; seaplanes to Baa"], ["Kadhdhoo (KDO), Laamu", "50 minutes from Malé, then 15 by speedboat to Six Senses Laamu"]],
    transfers: [["Malé → Soneva Fushi", "30 minutes by seaplane"], ["Malé → Nautilus", "About 30 minutes by seaplane"], ["Malé → Six Senses Laamu", "50-minute flight to Kadhdhoo, 15 minutes by speedboat"]],
    highlights: [
      { title: "Hanifaru Bay", line: "Baa Atoll", body: "The manta feeding site Kudadoo's Bella sails to, which Kudadoo calls the world's largest feeding ground for manta rays." },
      { title: "Whale shark and manta search", line: "Kudadoo", body: "Out with a marine biologist to snorkel with whale sharks and mantas, on the yacht Bella." },
      { title: "Mantas all year", line: "Laamu", body: "Six Senses Laamu says divers and snorkellers meet manta rays throughout the year in the southern atoll." },
      { title: "Snorkel a biosphere", line: "Nautilus", body: "Nautilus lists snorkelling in a UNESCO Biosphere among its experiences, with a private yacht breakfast and a sandbank barbecue." },
    ],
    suits: [
      { who: "Manta seekers", line: "Baa Atoll in the monsoon months.", href: "/stays/soneva-fushi-maldives", label: "Soneva Fushi" },
      { who: "Whale sharks", line: "A marine biologist and your own yacht.", href: "/stays/kudadoo-private-island", label: "Kudadoo" },
      { who: "Year-round divers", line: "Mantas all year in the far south.", href: "/stays/six-senses-laamu", label: "Six Senses Laamu" },
    ],
    howTo: YACHT_DAYS,
    onwardEyebrow: "Three ways into the Maldives",
    onward: ONWARD("reef-and-manta"),
    voyageWaters: [],
    see3d: { page: "destinations/asia/maldives/reef-and-manta", title: "Manta Country, Atoll by Atoll", intro: "Every Maldives stay in the Ledger; the mantas gather in Baa in the monsoon months and off Laamu all year. Positions from each resort.", points: ATOLL_POINTS },
    faqs: [
      { q: "When is manta season in the Maldives?", a: "Soneva says the monsoon months, May to October, are best for manta rays in the Baa Atoll. Six Senses Laamu says divers and snorkellers meet mantas there throughout the year." },
      { q: "How do you get to Hanifaru Bay?", a: "By boat from a nearby resort. Kudadoo's yacht Bella sails there from Lhaviyani; Soneva Fushi and Nautilus are in the Baa Atoll itself. We book the trip with the stay." },
      { q: "Can you swim with whale sharks in the Maldives?", a: "Kudadoo runs a whale shark and manta search on its yacht Bella, led by a marine biologist. Sightings are never guaranteed." },
      { q: "Is there a dive liveaboard or multi-day yacht?", a: "Soneva in Aqua sails multi-day voyages from the Soneva islands, with a dive master on request. For a full week of diving, the house charters a yacht for your party and plans the route for the season." },
    ],
    geo: { lat: 5.3, lng: 73.1 },
    sources: [SONEVA_AQUA, KUDADOO_BELLA, SS_LAAMU_WHEN, { title: "Soneva: snorkel with manta rays", url: "https://soneva.com/experience/snorkel-with-manta-rays" }],
  },

  "surf-and-ocean-sports": {
    slug: "surf-and-ocean-sports", region: "asia", country: "maldives", parent: "maldives", name: "Surf and Ocean Sports", path: `${BASE}/surf-and-ocean-sports`,
    theme: "sea", stays: ["niyama-private-islands-maldives", "six-senses-laamu"],
    proofEyebrow: "Surfed and sailed · the house's water-sports file",
    seo: {
      title: "Maldives Surf and Water Sports: Vodi, Kasabu, Yin Yang and the Best Resorts",
      description: "Surf the Maldives from a resort: Niyama's Vodi and Kasabu breaks, Six Senses Laamu's Yin Yang from April to October, kitesurfing, wing foiling, catamarans, and week-long surf charters by yacht.",
      keywords: ["Maldives surf resort", "Niyama surf", "Vodi break", "Six Senses Laamu surf", "Yin Yang Laamu", "Maldives kitesurfing", "Maldives surf charter"],
    },
    eyebrow: "Destinations · Asia · The Maldives",
    h1: "Surf and Ocean Sports",
    tagline: "A left off the beach, a right by speedboat, and a kite in the trade wind",
    slides: [],
    slidesFromStay: { slug: "niyama-private-islands-maldives", alt: "Niyama Private Islands in the Dhaalu Atoll", credit: "Photograph courtesy of Niyama Private Islands Maldives" },
    answer: "To surf the Maldives from a resort, the house starts with Niyama Private Islands in Dhaalu, where Vodi, a powerful and sometimes hollow left, breaks off Play Island and you walk to the point, and Kasabu, a hollow right, is a few minutes away by speedboat; and Six Senses Laamu, whose Yin Yang break runs with surf lessons and trips from April to October. Laamu also teaches windsurfing, wing foiling, kitesurfing and catamaran sailing. For a week chasing swell, Soneva in Aqua carries a surf instructor through Baa, Noonu and Goidhoo, and the house charters surf yachts to order.",
    facts: [
      ["Surf from the beach", "Niyama: Vodi, a left off Play Island"],
      ["Surf by speedboat", "Niyama: Kasabu, a hollow right, minutes away"],
      ["Surf season", "April to October at Six Senses Laamu (Yin Yang)"],
      ["Wind and sail", "Laamu: windsurf, wing foil, kitesurf, catamaran courses"],
      ["Surf by yacht", "Soneva in Aqua's surf packages: Baa, Noonu, Goidhoo"],
      ["Getting there", "Niyama by seaplane (boards: give sizes when booking); Laamu by 50-min flight and 15-min boat"],
    ],
    proof: "James has surfed and dived for 44 years and knows these routes; the water-sports file is built the way he would plan his own week: the break, the wind, the boat, then the bed.",
    months: [
      { area: "Surf, Laamu", note: "April to October (Six Senses Laamu)", months: M("wwwBBBBBBBww") },
      { area: "Calm seas for everything else", note: "November to April (the resorts)", months: M("BBBBgwwwwggB") },
    ],
    airports: [["Velana International, Malé (MLE)", "International arrivals"], ["Kadhdhoo (KDO), Laamu", "For Six Senses Laamu"]],
    transfers: [["Malé → Niyama", "About 40 minutes by seaplane (space for boards is limited; send sizes ahead)"], ["Malé → Six Senses Laamu", "50-minute flight to Kadhdhoo, 15 minutes by speedboat"], ["Niyama → Kasabu", "A few minutes by speedboat, on the resort's surf transfer"]],
    highlights: [
      { title: "Vodi", line: "Niyama", body: "A powerful and sometimes hollow left off Play Island; beginners when small, intermediate to advanced when it grows. Walk to the point and paddle out." },
      { title: "Kasabu", line: "Niyama", body: "A rippable, hollow right for intermediates and better, best in west to northwest winds, reached by the resort's speedboat." },
      { title: "Yin Yang", line: "Six Senses Laamu", body: "Surf lessons and surf trips from the resort's Surf Shop, April to October." },
      { title: "Wind, foil and sail", line: "Six Senses Laamu", body: "Windsurfing, wing foiling and kitesurfing, catamaran courses, and a catamaran at sunset for two." },
    ],
    suits: [
      { who: "Surfers", line: "Two breaks, one off the beach.", href: "/stays/niyama-private-islands-maldives", label: "Niyama" },
      { who: "Surf and a family", line: "Lessons in the lagoon, a kids' club, the left for you.", href: "/stays/niyama-private-islands-maldives", label: "Niyama" },
      { who: "Wind and water", line: "Kites, foils, catamarans and Yin Yang.", href: "/stays/six-senses-laamu", label: "Six Senses Laamu" },
    ],
    howTo: YACHT_DAYS,
    onwardEyebrow: "Three ways into the Maldives",
    onward: ONWARD("surf-and-ocean-sports"),
    voyageWaters: [],
    see3d: { page: "destinations/asia/maldives/surf-and-ocean-sports", title: "Where the Swell Reaches the Atolls", intro: "Every Maldives stay in the Ledger: Niyama in Dhaalu and Six Senses Laamu in the south carry the surf. Positions from each resort.", points: ATOLL_POINTS },
    faqs: [
      { q: "Where is the best resort surf in the Maldives?", a: "Niyama Private Islands in Dhaalu has Vodi, a left you reach by walking to the point, and Kasabu, a hollow right a few minutes by speedboat. Six Senses Laamu runs lessons and trips to the Yin Yang break from April to October." },
      { q: "When is surf season in the Maldives?", a: "Six Senses Laamu gives April to October for its surf. Niyama surfs year round in the right winds: Vodi in north to easterlies, Kasabu in west to northwesterlies." },
      { q: "Can beginners surf in the Maldives?", a: "Yes. Niyama teaches beginners in the lagoon and on its channel wave, and Vodi suits longboards when small; Six Senses Laamu runs surf lessons from its Surf Shop." },
      { q: "Can we take a surf charter by yacht?", a: "Soneva in Aqua sails with a surf instructor through Baa, Noonu and Goidhoo. For a full week chasing swell, the house charters a surf yacht for your party and plans the route for the season." },
      { q: "Can I bring my own board?", a: "Yes. Niyama asks for the number and size of board bags when you book, because seaplane space is limited; boards can also go by domestic flight to meet the seaplane." },
    ],
    geo: { lat: 2.6, lng: 73.0 },
    sources: [NIYAMA_SURF, SS_LAAMU_WHEN, SS_LAAMU_WATER, SONEVA_AQUA],
  },
};

export const MALDIVES_CHARTERS = CHARTERS;
