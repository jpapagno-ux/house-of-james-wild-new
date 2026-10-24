import type { RecordKind } from "@/lib/ledger/urls";
// Home page content, ported from the approved Base44 sample
// (/sample-house-home, Ledger direction). Copy is James's voice and is
// pending his final sign-off. Rules applied in the port:
//  · Links point only at Site map v1 URLs; a record that isn't live in the
//    Ledger (e.g. Breac.House, coming_soon) is named but not linked.
//  · Founder marks come only from the record's house_status in the library.
//    Where the library holds no status yet, no mark is printed.
//  · Every image is a WES asset, a licensed Getty image (Cloudinary) or a
//    Ledger image hosted on Base44; no AI imagery depicts a real property.
import type { HouseStatus } from "@/lib/ledger/status";

const HOME_CDN = "https://cdn.prod.website-files.com/679d0f261523f5053f06eae5";
const B44 = "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474";
// Licensed Getty Images (web and marketing, no credit line) in Cloudinary.
const GETTY = (id: string, w = 1200, h = 900) =>
  `https://res.cloudinary.com/jhlnq5h5/image/upload/c_fill,g_auto,w_${w},h_${h},f_auto,q_auto/GettyImages-${id}.jpg`;

export type Img = { url: string; alt: string };

export const HOME = {
  seo: {
    title: "James Wild & Co | Vetted Safaris, Stays & Small-Ship Voyages",
    description:
      "A founder-led travel house exploring since 1982. Safaris, stays, family residences and small-ship voyages, each vetted in person and filed in the Ledger.",
    answer:
      "James Wild & Co is a founder-led travel house based in Miami, shaped by 44 years of exploring since 1982. Its five volumes (Stays, Safaris, Gatherings, Voyages and Overland) hold only places and routes vetted in person, each filed in the Ledger under a permanent ID. The house plans slower journeys and works alongside your own advisor.",
  },

  hero: {
    eyebrow: "The House of James Wild & Co · Since 1982",
    h1: "Vetted Safaris, Stays & Voyages",
    sub: "Designed from 44 years on the road. Every place vetted in person.",
    loop: {
      mp4: `${HOME_CDN}/691cb223d3a2dde99dc01c54_Wes-Webloop-Regrade-Felixstudios-02_LQ_mp4.mp4`,
      webm: `${HOME_CDN}/691cb223d3a2dde99dc01c54_Wes-Webloop-Regrade-Felixstudios-02_LQ_webm.webm`,
      poster: `${HOME_CDN}/691cb223d3a2dde99dc01c54_Wes-Webloop-Regrade-Felixstudios-02_LQ_poster.0000000.jpg`,
      label: "Wild Earth Stays film: wild places by land and by water",
    },
    quotes: [
      { text: "I don't send anyone somewhere I wouldn't go back to. The Ledger is that list.", by: "James, Founder & Chief Expedition Officer" },
      { text: "The magic of a place reveals itself when you slow down and stay longer.", by: "James, on staying longer" },
      { text: "It started in 1982. And it never ended.", by: "The founder's story" },
      { text: "This is more than a journey. It's a chance to move with the pulse of the Earth itself.", by: "Our vision & philosophy" },
    ],
  },

  story: {
    eyebrow: "The House of James Wild & Co · Exploring Since 1982",
    title: "Forty-Four Years on the Road, Kept in One Ledger",
    subtitle: "James knows a place.",
    meta: [
      ["House", "James Wild & Co · Miami, Florida"],
      ["Exploring since", "1982, forty-four years in the field"],
      ["Safari advisor since", "2011"],
      ["Five volumes", "Stays · Safaris · Gatherings · Voyages · Overland"],
      ["The standard", "Vetted in person · Ledger ID · live rates"],
    ] as [string, string][],
    quote: "I don't send anyone somewhere I wouldn't go back to. The Ledger is that list.",
    quoteBy: "James, Founder & Chief Expedition Officer",
    image: {
      url: `${HOME_CDN}/67a53f21e2188b1e0278cf29_redcharlie-nf7W_hn6DKQ-unsplash.avif`,
      alt: "Open-top safari vehicle paused as a herd of elephants crosses the road in an East African reserve",
    },
  },

  volumes: [
    { key: "stays", name: "Stays", brand: "Home of Wild Earth Stays", path: "/stays", line: "Lodges, island hideaways and private houses, each vetted in person and bookable at live rates.", proof: "Hundreds of stays in the Ledger", image: { url: GETTY("1205839281", 900, 1200), alt: "A traveller standing at the edge of an infinity pool, the water meeting green hills at sunset" } },
    { key: "safaris", name: "Safaris", brand: "Wild & Co Safaris", path: "/safaris", line: "Africa only: camps and reserves across the safari countries, with the islands of the Indian Ocean as add-ons.", proof: "Safari advisor since 2011", image: { url: GETTY("578876890", 900, 1200), alt: "A hot-air balloon drifting over acacia savanna dotted with grazing herds at sunrise" } },
    { key: "gatherings", name: "Gatherings", brand: "Wild & Co Gatherings", path: "/gatherings", line: "Generational travel: whole houses and resort residences for the family, with adventures planned for every age.", proof: "One roof, every generation", image: { url: GETTY("1363882925", 900, 1200), alt: "Family and friends sharing breakfast on a shaded terrace above the sea" } },
    { key: "voyages", name: "Voyages", brand: "Wild & Co Voyages", path: "/voyages", line: "Small ships and expedition voyages, from Raja Ampat phinisis to the polar collection.", proof: "Sailing since 1989", image: { url: GETTY("1326090846", 900, 1200), alt: "A classic two-masted sailing schooner under full sail on open water" } },
    { key: "overland", name: "Overland", brand: "Overland Expeditions by James", path: "/overland", line: "Land routes James designed, many travelled himself, with what to expect, what to avoid, and every stay on the way already in the Ledger.", proof: "Designing journeys since 1983", stamp: true, image: { url: GETTY("906210770", 900, 1200), alt: "Two giraffes standing in golden grassland under a glowing sky" } },
  ],

  standard: {
    eyebrow: "The house standard",
    title: "Four Rules Behind Every Entry",
    rules: [
      ["Vetted in person", "A place earns a founder mark only where James has stayed or inspected it, with the year shown."],
      ["Filed in the Ledger", "Every stay, camp and vessel carries a permanent Ledger ID and a last fact-checked date."],
      ["Three nights or more", "The house plans fewer bases and longer stays, because time is the luxury you can't add later."],
      ["Your advisor is welcome", "Already work with a travel advisor? The house works alongside them, not around them."],
    ] as [string, string][],
  },

  shelf: {
    eyebrow: "From the Ledger",
    title: "A Short Shelf of Signature Stays",
    intro: "Seven entries from the Ledger, each under its permanent ID. Where James has been himself, the founder mark and the year sit beside the name.",
    // status/statusDate mirror the Stay record in the library (24 Oct 2026).
    // None of these seven carries a house_status yet, so no mark prints.
    entries: [
      { name: "Lion Sands Reserve", id: "STY-2026-290658", slug: "lion-sands", kind: "reserve", status: null, statusDate: null, line: "Ivory Lodge on the Sabie River, where the Sabi Sand meets the Kruger.", image: { url: `${B44}/ce289d7f4_7a7e962d3_67b4da19a458b2047e2bd54c_lion-sands.avif`, alt: "Lion Sands Reserve: riverside safari lodge in the Sabi Sand, South Africa" } },
      { name: "Monwana Thornybush", id: "STY-2026-000171", slug: "monwana-thornybush", status: null, statusDate: null, line: "Big Five luxury in the wild Thornybush.", image: { url: `${B44}/ceda73052_67149f1a3_6930486e36272055f8bc2739_monwana-thornybush-exterior.jpg`, alt: "Monwana lodge exterior in the Thornybush Game Reserve, South Africa" } },
      { name: "Kirkman's Kamp", id: "STY-2026-000293", slug: "tengile-mala-mala-kirkmans-kamp", status: null, statusDate: null, line: "Historic safari charm overlooking one of Africa's great wildlife landscapes.", image: { url: `${B44}/c636dd862_5ce4e7daf_6a511c21d736e3f6fb85883e_Kirkmans-kamp.jpg`, alt: "Kirkman's Kamp: 1920s homestead veranda on the Mala Mala reserve, South Africa" } },
      { name: "Ellerman House", id: "STY-2026-000075", slug: "ellerman-house", status: null, statusDate: null, line: "Clifftop Cape Town, the house to begin or end a safari in.", image: { url: `${B44}/a69ea5ee9_e843f4e96_694b0eac021864ade3c6e7b8_Ellerman_House_Aerial.jpg`, alt: "Aerial view of Ellerman House on the cliffs above Bantry Bay, Cape Town" } },
      { name: "Vahine Private Island", id: "STY-2026-000213", slug: "pearl-resort-vahine-private-island", status: null, statusDate: null, line: "A hidden motu off Taha'a, in the lagoon of French Polynesia.", image: { url: `${B44}/5418a95ca_7a112fc97_6a4fd0c262087e5e71a962d0_Pearl-Resort-Vahine-Private-Island-Beach-Suite.avif`, alt: "Beach suite on Vahine Private Island in the Taha'a lagoon, French Polynesia" } },
      { name: "Tswalu Reserve", id: "STY-2026-138258", slug: "tswalu-reserve", kind: "reserve", status: null, statusDate: null, line: "The Kalahari, restored: red dunes, meerkats and regeneration at scale.", image: { url: `${B44}/da29b879e_b8e57bff0_67e2fb586fb457d27739577c_tswalu.avif`, alt: "Tswalu Kalahari Reserve: red dunes and camelthorn trees at dusk, South Africa" } },
      { name: "Leeu House", id: "STY-2026-000149", slug: "leeu-house", status: null, statusDate: null, line: "A village-side Winelands house in Franschhoek, for the family to gather in.", image: { url: `${B44}/ae294f982_cc67a2d17_6a230a0a714287d73d103c0e_5fdc91f8cde8e-Header.jpg`, alt: "The entrance garden at Leeu House, Franschhoek, with mountains above the village" } },
    ] as { name: string; id: string; slug: string; kind?: RecordKind; status: HouseStatus | null; statusDate: string | null; line: string; image: Img }[],
  },

  overland: {
    eyebrow: "Volume 05 · Overland Expeditions",
    title: "Routes James Designed, Field Notes Included",
    intro:
      "Each one is a route James designed, with a field note on what to expect and what to avoid, and every stay on the way linked to its own entry. The stamp shows exactly how far the founder has taken it himself.",
    honesty:
      "Field tested means James has travelled the route or its camps himself, with the year shown. Designed by James means he built the route; the stays on it are vetted by the house.",
    routes: [
      {
        name: "Grand Kwando Botswana", slug: "grand-kwando-botswana", subtitle: "Lagoon, Lebala, Splash and Tau Pan", ledgerId: "ITN-LAND-2026-713648",
        tested: true, year: 2012,
        facts: [["Length", "13 days · 12 nights"], ["Route", "Maun to Maun"], ["Style", "Private guided, light aircraft"], ["Best months", "May to October"]] as [string, string][],
        expect: ["Predator action along the shady banks of the Kwando River", "Huge elephant herds moving through the Linyanti marshes", "Stargazing from a high dune in the Central Kalahari"],
        avoid: ["Hard-sided suitcases: bush flights take soft bags only, with a tight weight limit", "Booking late for July to September, when the small camps fill first"],
        stays: [["Kwando Lagoon", "kwando-lagoon"], ["Kwando Lebala", "kwando-lebala"], ["Kwando Splash", "kwando-splash"], ["Kwando Tau Pan", "kwando-tau-pan"]] as [string, string | null][],
        note: "James first travelled with Kwando in 2012: intimate camps, private concessions, no crowds and predator-rich game viewing.",
        image: { url: GETTY("1201436116"), alt: "Elephants walking among drowned trees above still water at last light" },
      },
      {
        name: "Kalahari & Salt Pans", slug: "kalahari-salt-pans", subtitle: "Tau Pan and Nxai Pan", ledgerId: "ITN-LAND-2026-664245",
        tested: true, year: 2012,
        facts: [["Length", "8 days · 7 nights"], ["Route", "Maun to Maun"], ["Style", "Private guided"], ["Best months", "Dec–Apr herds · May–Oct predators"]] as [string, string][],
        expect: ["Endless horizons from the raised decks of Tau Pan", "Walking the ancient sands with San Bushman guides", "The centuries-old baobabs of Nxai Pan"],
        avoid: ["Picking the wrong season: the zebra and springbok herds arrive with the summer rains", "Underpacking for winter nights, when desert temperatures drop sharply after dark"],
        stays: [["Kwando Tau Pan", "kwando-tau-pan"], ["Kwando Nxai Pan", "kwando-nxai-pan"]] as [string, string | null][],
        note: "Part of the Kwando circuit James first travelled in 2012, chosen for its intimate camps and empty horizons.",
        image: { url: GETTY("813447208"), alt: "A maned male lion resting in warm late light, gazing across the bush" },
      },
      {
        name: "North by Northwest", slug: "north-by-northwest", subtitle: "Ireland self-drive, Dublin to Shannon", ledgerId: "ITN-LAND-2026-IRE003",
        tested: false, year: undefined,
        facts: [["Length", "11 days · 10 nights"], ["Route", "Dublin to Shannon"], ["Style", "Self-drive"], ["Best months", "April to October"]] as [string, string][],
        expect: ["Estate life and woodland paths in County Monaghan", "Donegal's high cliffs and uncrowded roads", "An Atlantic island stay on Achill, then Connemara's layered light"],
        avoid: ["Over-scheduling driving days: the small northwest roads take longer than the map says", "Fixing every hour in advance: the route rewards room for weather and a longer lunch"],
        // Breac.House is coming_soon in the Ledger: named, not linked.
        stays: [["Castle Leslie", "castle-leslie"], ["Breac.House", null], ["Ferndale, Achill Island", "ferndale-achill-island"], ["Aiteall", "aiteall-boutique-accommodation"], ["Ariel House", "ariel-house"]] as [string, string | null][],
        note: "The northwest feels earned. Its rewards arrive through the distance, the weather and the welcome at the end of the road.",
        noteIsQuote: true,
        image: { url: `${B44}/eec19dde3_da1e04ac4_697a1381f7ac415cea3407e4_castle-leslie-exterior.jpg`, alt: "Castle Leslie Estate in County Monaghan, the first stop on the North by Northwest Ireland route" },
      },
    ],
  },

  film: {
    eyebrow: "The house film",
    title: "Wild Places, by Land and by Water",
    intro: "The Wild Earth Stays film: the places the house was built on. Press play to watch it full size.",
    caption: "James knows a place.",
    // When the YouTube film is uploaded, set its ID here: the section becomes
    // a click-to-play lite embed and the page adds VideoObject schema.
    youtubeId: null as string | null,
  },

  journal: {
    eyebrow: "From the house",
    title: "Read Before You Go",
    items: [
      { kicker: "Captain's Log", title: "Stranded at the Bottom of the World", line: "February 2020: James sails the Antarctic Peninsula, and the world shuts down behind the ship.", cta: "Read the Journal", href: "/journal" },
      { kicker: "Travel Notes", title: "New Stays, First", line: "A short letter when a new stay or ship enters the Ledger, with the stay-longer offers before they go public.", cta: "Get Travel Notes", href: "/travel-notes" },
      { kicker: "Meet Iggi", title: "Ask the House Anything", line: "Iggi answers from the same Ledger the advisors use: best months, transfers, who a place suits.", cta: "Talk to Iggi", href: "/plan/iggi" },
    ],
  },

  jamesNote:
    "It started in 1983 with friends who wanted to surf Eleuthera. Forty-four years on, the rule hasn't changed: go somewhere new, stay long enough to know it, and come home with a place you'd send your own family.",

  stewards: {
    eyebrow: "We're stewards of nature",
    line: "This is more than a journey. It's a chance to move with the pulse of the Earth itself.",
    text: "Each hand-selected place invites you to see the world from new angles, forge lasting connections, and honour the wild places that sustain us.",
    cta: { label: "Our philosophy", href: "/about/philosophy" },
    image: { url: `${HOME_CDN}/67c0ba1451873b039065af7f_gorillas-nest-rwanda-africa.avif`, alt: "Forest canopy at One&Only Gorilla's Nest, Rwanda" },
    caption: "One&Only Gorilla's Nest · Rwanda",
  },

  faqs: [
    { q: "What is James Wild & Co?", a: "A founder-led travel house based in Miami, Florida, shaped by 44 years of exploring since 1982. It plans safaris, stays, family gatherings, small-ship voyages and overland routes using only places vetted in person and filed in the Ledger." },
    { q: "What are the five volumes?", a: "Stays (lodges, hideaways and private houses, home of Wild Earth Stays), Safaris (Africa only, with Indian Ocean island add-ons), Gatherings (generational and family travel), Voyages (small ships and expedition cruises, including the polar collection) and Overland (routes James designed, with field notes on what to expect and avoid)." },
    { q: "What is an Overland Expedition?", a: "A land route designed by James, from a guided Botswana safari circuit to a self-drive through Ireland. Each one lists what to expect, what to avoid and every stay on the way, and its stamp shows whether James has travelled it himself and when." },
    { q: "Has James stayed at every property?", a: "No, and the site says so. Every entry is vetted by the house; a founder mark appears only where James has personally been, with the year he was there." },
    { q: "I already have a travel advisor. Can I still use the house?", a: "Yes. The house works alongside your existing advisor, and James Wild & Co also works with independent advisors as a host agency and wholesaler." },
    { q: "How do I book?", a: "Book stays at live rates through the house booking engine, or plan a full journey with James and the team. Either way, nothing is quoted from a stale rate sheet." },
    { q: "Is James Wild & Co a registered seller of travel?", a: "Yes. The house is a Florida Seller of Travel (ST45327) and holds IATA number 10783883." },
  ],
};
