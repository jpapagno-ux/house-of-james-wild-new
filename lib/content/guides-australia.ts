import type { Guide } from "./guides";

// Australia place guides (James, 15 Nov 2026: "a Queensland and Great Barrier Reef page with a reef map, and the
// regions"). Facts only from each lodge's own site, as filed in its library record (stays.json); no outbound links,
// sources kept as data. Capella Lodge is Lord Howe Island and The Louise is the Barossa, so the regions are the reef,
// the Red Centre, the Top End, Ningaloo, South Australia and Lord Howe. Tasmania waits for a Tasmanian stay.
// Heroes borrow the lead stay's frames, credited (IMAGE FOLLOW-UP). Each stay has one home guide.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/oceania/australia";
const SITES: Record<string, string> = {
  "Lizard Island Resort": "https://www.lizardisland.com.au/", "Orpheus Island Lodge": "https://www.orpheus.com.au/", "Pelorus Private Island": "https://www.pelorus.com.au/",
  qualia: "https://www.qualia.com.au/", "Silky Oaks Lodge": "https://www.silkyoakslodge.com.au/", "Longitude 131°": "https://longitude131.com.au/",
  "Bamurru Plains": "https://www.bamurruplains.com/", "Sal Salis Ningaloo Reef": "https://salsalis.com.au/", "Southern Ocean Lodge": "https://southernoceanlodge.com.au/",
  "The Louise": "https://thelouise.com.au/", "Capella Lodge": "https://capellalodge.com.au/",
};
// Sources are kept as data, never printed as links (James, 13 Nov 2026).
const src = (title: string) => ({ title, url: SITES[title] });

const ALL = [
  { name: "The Great Barrier Reef", slug: "queensland-and-the-great-barrier-reef", line: "qualia, Lizard Island, Orpheus, Pelorus and the Daintree" },
  { name: "The Red Centre", slug: "red-centre", line: "Uluru and Kata Tjuta from Longitude 131°" },
  { name: "The Top End", slug: "top-end", line: "Kakadu's floodplains by airboat from Bamurru Plains" },
  { name: "Ningaloo", slug: "ningaloo", line: "Whale sharks and humpbacks from the dunes at Sal Salis" },
  { name: "South Australia", slug: "south-australia", line: "Kangaroo Island's cliffs and the Barossa's vines" },
  { name: "Lord Howe Island", slug: "lord-howe-island", line: "Capella Lodge under Mount Gower and Mount Lidgbird" },
];
const ONWARD = (except: string) => [...ALL.filter((a) => a.slug !== except).map((a) => ({ name: a.name, href: `${BASE}/${a.slug}`, line: a.line })), { name: "Australia", href: BASE, line: "Every Australian stay in the Ledger" }];
const EYEBROW = "Destinations · Oceania · Australia";
const ONWARD_EYEBROW = "Continue through Australia";

export const AUSTRALIA_GUIDES: Record<string, Guide> = {
  "queensland-and-the-great-barrier-reef": {
    slug: "queensland-and-the-great-barrier-reef", region: "oceania", country: "australia", parent: "australia", name: "Queensland and the Great Barrier Reef", path: `${BASE}/queensland-and-the-great-barrier-reef`,
    theme: "sea", stays: ["qualia", "lizard-island", "orpheus-island-lodge", "pelorus-private-island", "beckon-silky-oaks-lodge"],
    proofEyebrow: "Island by island · the house's reef file",
    seo: {
      title: "Great Barrier Reef Luxury Islands: qualia, Lizard Island, Orpheus and Pelorus",
      description: "Where to stay on the Great Barrier Reef: qualia in the Whitsundays, Lizard Island's 24 beaches, Orpheus Island Lodge, Pelorus Private Island, and Silky Oaks in the Daintree. Flights, helicopters, stinger season and the reef map.",
      keywords: ["Great Barrier Reef luxury resort", "best island Great Barrier Reef", "Lizard Island Resort", "qualia Hamilton Island", "Orpheus Island Lodge", "Pelorus Private Island", "Silky Oaks Lodge Daintree", "Queensland luxury lodge"],
    },
    eyebrow: EYEBROW,
    h1: "Queensland and the Great Barrier Reef",
    tagline: "Four islands on the reef, a treehouse in the rainforest, and a helicopter between them",
    slides: [],
    slidesFromStay: { slug: "lizard-island", alt: "Lizard Island on the Great Barrier Reef", credit: "Photograph courtesy of Lizard Island Resort" },
    answer: "To stay on the Great Barrier Reef itself, the house chooses from four islands, north to south: Lizard Island, an hour's flight from Cairns, with 40 rooms and 24 beaches and a dinghy to take you to your own; Orpheus Island Lodge, 14 rooms in a national park, 30 minutes by helicopter from Townsville; Pelorus Private Island beside it, one five-suite residence that is always yours alone; and qualia on Hamilton Island in the Whitsundays, with direct flights from Sydney, Melbourne and Brisbane. Add Silky Oaks Lodge in the Daintree rainforest, 80 km north of Cairns. The reef is warm all year; stinger suits are advised November to May, and humpbacks pass the Whitsundays June to September.",
    facts: [
      ["The islands", "Lizard Island · Orpheus · Pelorus · qualia (Hamilton Island)"],
      ["The rainforest", "Silky Oaks Lodge, on the Mossman River in the Daintree"],
      ["Getting there", "Cairns, Townsville or Hamilton Island, then plane, helicopter or VIP transfer"],
      ["Best months", "Reef all year; May to October drier and cooler; black marlin September to December at Lizard"],
      ["Stinger season", "November to May; the lodges supply sunsuits"],
      ["Whales", "Humpbacks through the Whitsundays, June to September (qualia)"],
    ],
    proof: "James has known this coast since 2011, when he stayed at Silky Oaks while it was still an independent lodge. Every island on the reef file is in the Ledger, each with its own ID.",
    months: [
      { area: "The reef", note: "Warm all year; drier May to October (the lodges)", months: M("ggggBBBBBBgg") },
      { area: "Black marlin, Lizard Island", note: "September to December (Lizard Island)", months: M("wwwwwwwwBBBB") },
      { area: "Humpbacks, the Whitsundays", note: "June to September (qualia)", months: M("wwwwwBBBBwww") },
    ],
    airports: [["Cairns (CNS)", "For Lizard Island, Silky Oaks, and helicopters to Orpheus and Pelorus"], ["Townsville (TSV)", "30 minutes by helicopter to Orpheus or Pelorus"], ["Hamilton Island (HTI)", "Direct from Sydney, Melbourne and Brisbane, minutes from qualia"]],
    transfers: [["Cairns → Lizard Island", "About an hour by scheduled charter flight over the reef, booked by the resort"], ["Townsville → Orpheus or Pelorus", "30 minutes by helicopter (90 from Cairns)"], ["Cairns → Silky Oaks", "About 1 hour 20 minutes by road"], ["Hamilton Island airport → qualia", "Minutes, by qualia's VIP transfer"]],
    highlights: [
      { title: "A beach of your own", line: "Lizard Island", body: "Take the included motorised dinghy to one of 24 beaches and keep it for the day; dive the Cod Hole; climb to Cook's Look." },
      { title: "An island that is always yours", line: "Pelorus", body: "One residence of five suites on a 400 hectare island, booked whole even by two: the beaches, the reef, the pool and the chef are never shared." },
      { title: "The reef from your room", line: "Orpheus Island Lodge", body: "Step off the beach into a fringing reef inside a national park; the lodge's three boats run to the outer reef." },
      { title: "Whitehaven by sail", line: "qualia", body: "Sail to Whitehaven Beach and Hill Inlet, fly over Heart Reef, and come back to a plunge pool over the Coral Sea. Guests 16 and over." },
    ],
    suits: [
      { who: "Honeymooners", line: "Pavilions with plunge pools, adults only.", href: "/stays/qualia", label: "qualia" },
      { who: "Divers and anglers", line: "The Cod Hole and black marlin season.", href: "/stays/lizard-island", label: "Lizard Island" },
      { who: "Families and friends", line: "A whole island for up to 11.", href: "/stays/pelorus-private-island", label: "Pelorus" },
      { who: "Rainforest and reef", line: "Treehouses above the Mossman River.", href: "/stays/beckon-silky-oaks-lodge", label: "Silky Oaks" },
    ],
    howTo: {
      title: "Island to Island on the Reef",
      intro: "The islands sit a short flight apart, so a reef journey can take two. The house books every leg with the stays.",
      options: [
        { name: "Rainforest, then the far north", body: "Silky Oaks in the Daintree, then the hour's flight from Cairns to Lizard Island for the outer reef and the Cod Hole.", href: "/stays/lizard-island", label: "Lizard Island" },
        { name: "The Palm Islands by helicopter", body: "Orpheus or Pelorus, 30 minutes from Townsville; Pelorus can also be reached by Morris Nautical yacht from Cairns or Townsville.", href: "/stays/orpheus-island-lodge", label: "Orpheus" },
        { name: "The Whitsundays by sail", body: "Fly straight into Hamilton Island for qualia, then sail to Whitehaven Beach and fly over Heart Reef.", href: "/stays/qualia", label: "qualia" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("queensland-and-the-great-barrier-reef"),
    voyageWaters: [],
    see3d: {
      page: "destinations/oceania/australia/queensland-and-the-great-barrier-reef", title: "The Reef, Island by Island", playLabel: "Fly the reef",
      intro: "Every Queensland stay in the Ledger, from Lizard Island in the far north to qualia in the Whitsundays. Positions from each lodge.",
      points: [
        { name: "Lizard Island", lat: -14.668, lng: 145.459 },
        { name: "Silky Oaks Lodge, Daintree", lat: -16.4653, lng: 145.3709 },
        { name: "Orpheus Island Lodge", lat: -18.611, lng: 146.491 },
        { name: "Pelorus Private Island", lat: -18.551774, lng: 146.497191 },
        { name: "qualia, Hamilton Island", lat: -20.33, lng: 148.9555 },
      ],
    },
    faqs: [
      { q: "What is the best island resort on the Great Barrier Reef?", a: "It depends on the trip. Lizard Island is the farthest north and closest to the outer reef, with 24 beaches; Orpheus Island Lodge has 14 rooms on a national park island; Pelorus is one residence booked whole; qualia in the Whitsundays is the easiest to reach, with direct flights, and is for guests 16 and over." },
      { q: "When is the best time to visit the Great Barrier Reef?", a: "The reef can be visited all year. May to October is drier and cooler; stinger season runs November to May, when the lodges supply sunsuits. Humpbacks pass the Whitsundays from June to September, and black marlin season at Lizard Island runs September to December." },
      { q: "How do you get to Lizard Island?", a: "Fly to Cairns, then about an hour by scheduled charter flight over the reef to the island's own airstrip. The resort books the transfer." },
      { q: "How do you get to Orpheus Island and Pelorus?", a: "By helicopter, 30 minutes from Townsville or 90 from Cairns. Orpheus can also be reached by boat from Lucinda on request, and Pelorus by Morris Nautical yacht." },
      { q: "Can we combine the rainforest and the reef?", a: "Yes. Silky Oaks Lodge is in the Daintree, about 1 hour 20 minutes from Cairns, and pairs naturally with Lizard Island, an hour's flight from Cairns." },
    ],
    geo: { lat: -17.5, lng: 146.5 },
    sources: [src("Lizard Island Resort"), src("Orpheus Island Lodge"), src("Pelorus Private Island"), src("qualia"), src("Silky Oaks Lodge")],
  },

  "red-centre": {
    slug: "red-centre", region: "oceania", country: "australia", parent: "australia", name: "The Red Centre", path: `${BASE}/red-centre`,
    theme: "stays", stays: ["beckon-longitude-131"],
    proofEyebrow: "Founder visited · the Red Centre, 2011",
    seo: {
      title: "Uluru Luxury Stay: Longitude 131° and the Red Centre",
      description: "The Red Centre: Longitude 131°'s tented pavilions facing Uluru, guided walks at Uluru and Kata Tjuta, the Field of Light and desert dining. How to get there and when to go.",
      keywords: ["Uluru luxury lodge", "Longitude 131", "Red Centre Australia", "Kata Tjuta", "Field of Light Uluru", "where to stay Uluru"],
    },
    eyebrow: EYEBROW,
    h1: "The Red Centre",
    tagline: "Uluru from your bed, Kata Tjuta at dawn, and the southern sky at night",
    slides: [],
    slidesFromStay: { slug: "beckon-longitude-131", alt: "Longitude 131° pavilions in the dunes facing Uluru", credit: "Photograph courtesy of Longitude 131°" },
    answer: "For Uluru, the house stays at Longitude 131°, tented pavilions in the red dunes with Uluru in view, 15 km from Ayers Rock Airport (AYQ) and met by the lodge's transfer. Days are guided walks at Uluru and Kata Tjuta, sunrise and sunset in the desert, and the Field of Light; nights are desert dining and stargazing. April to September is the cool season the lodge recommends for walking.",
    facts: [
      ["The stay", "Longitude 131°: Luxury Tented Pavilions, View Pavilions and Dune Pavilions"],
      ["Getting there", "Ayers Rock Airport (AYQ), 15 to 20 minutes by lodge transfer"],
      ["Best months", "April to September, the cooler months"],
      ["Days", "Guided walks at Uluru and Kata Tjuta, sunrise and sunset, the Field of Light"],
      ["Nights", "Desert dining, bush food and stargazing"],
    ],
    proof: "James first came to the Red Centre in 2011, and Longitude 131° is a stay he has returned to. It is in the Ledger with its own ID.",
    months: [{ area: "Walking and stargazing", note: "Cooler months April to September (Longitude 131°)", months: M("gggBBBBBBggg") }],
    airports: [["Ayers Rock Airport (AYQ)", "15 km from the lodge"]],
    transfers: [["Ayers Rock Airport → Longitude 131°", "15 to 20 minutes; lodge transfers usually meet scheduled flights"]],
    highlights: [
      { title: "Uluru on foot", line: "Guided walks", body: "Walk the base of Uluru with the lodge's guides, and the domes and gorges of Kata Tjuta." },
      { title: "The Field of Light", line: "After dark", body: "The lodge includes the Field of Light among its experiences, with desert dining under the stars." },
      { title: "The southern sky", line: "Stargazing", body: "Clear desert skies in the cooler months, the lodge says, for exceptional stargazing." },
    ],
    suits: [{ who: "Couples and first visits", line: "Uluru in view from the pavilion.", href: "/stays/beckon-longitude-131", label: "Longitude 131°" }],
    howTo: { title: "The Red Centre in a Journey", intro: "Most guests spend two or three nights at Uluru, then fly on to the reef or the Top End. The house books the flights with the stays.", options: [
      { name: "Uluru and the reef", body: "Longitude 131°, then a flight to Cairns for Lizard Island or the Daintree.", href: `${BASE}/queensland-and-the-great-barrier-reef`, label: "The reef" },
      { name: "Uluru and the Top End", body: "From the desert to Kakadu's floodplains at Bamurru Plains, open February to October.", href: `${BASE}/top-end`, label: "The Top End" },
    ] },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("red-centre"),
    voyageWaters: [],
    faqs: [
      { q: "Where should we stay at Uluru?", a: "The house stays at Longitude 131°, tented pavilions in the dunes with Uluru in view, 15 to 20 minutes from Ayers Rock Airport." },
      { q: "When is the best time to visit Uluru?", a: "April to September, when the days are cool enough for walking and the skies are clear for stargazing." },
      { q: "How do you get to Uluru?", a: "Fly to Ayers Rock Airport (AYQ); Longitude 131°'s transfers usually meet scheduled flights." },
    ],
    geo: { lat: -25.3444, lng: 131.0369 },
    sources: [src("Longitude 131°")],
  },

  "top-end": {
    slug: "top-end", region: "oceania", country: "australia", parent: "australia", name: "The Top End", path: `${BASE}/top-end`,
    theme: "stays", stays: ["bamurru-plains"],
    proofEyebrow: "Safari, Australian style · the house's Top End file",
    seo: {
      title: "Kakadu Luxury Safari: Bamurru Plains and the Top End",
      description: "Australia's safari at the edge of Kakadu: Bamurru Plains' twelve bungalows on the Mary River floodplain, airboat safaris, crocodile cruises and buffalo on the plains. Open February to October.",
      keywords: ["Kakadu luxury lodge", "Bamurru Plains", "Top End safari", "Australian safari", "Mary River floodplain", "airboat safari Kakadu"],
    },
    eyebrow: EYEBROW,
    h1: "The Top End",
    tagline: "Australia's safari: an airboat across the floodplain and crocodiles at sunset",
    slides: [],
    slidesFromStay: { slug: "bamurru-plains", alt: "Bamurru Plains on the Mary River floodplain", credit: "Photograph courtesy of Bamurru Plains" },
    answer: "The Top End's safari is Bamurru Plains: twelve bungalows raised on poles on 300 km² of the Mary River floodplain at the edge of Kakadu, for 26 guests at most, all inclusive. It is about three hours by road from Darwin or a charter flight arranged by the camp. Open February to October: early in the year the plains are flooded and safaris are by airboat; by late September they dry and the wildlife gathers at the waterholes. Kakadu opens to visitors from May.",
    facts: [
      ["The stay", "Bamurru Plains: 12 bungalows, 26 guests at most, all inclusive"],
      ["Getting there", "Darwin (DRW), then about 3 hours by road or a charter flight"],
      ["Open", "February to October; closed in the monsoon"],
      ["On the water", "Airboat safaris; Sampan Creek crocodile cruises"],
      ["On land", "Open-top drives for buffalo, wallabies, brumbies and dingoes; birding from The Hide"],
    ],
    proof: "The Top End is the house's answer to an African safari in Australia, and Bamurru Plains is in the Ledger with its own ID.",
    months: [{ area: "Floodplain safaris", note: "Open February to October; Kakadu from May (Bamurru Plains)", months: M("wgggBBBBBBww") }],
    airports: [["Darwin (DRW)", "The gateway to the Top End"]],
    transfers: [["Darwin → Bamurru Plains", "About 3 hours by road (met at Bark Hut Inn), or a charter flight booked through the camp"]],
    highlights: [
      { title: "The airboat", line: "Bamurru Plains", body: "The only way across the flooded plains, skimming through melaleuca forest among magpie geese, whistling ducks, egrets and crocodiles." },
      { title: "Sampan Creek", line: "At sunset", body: "Crocodile-spotting cruises with sunset canapés." },
      { title: "Mesh walls", line: "At night", body: "The bungalows have mesh walls, so the floodplain is with you through the night." },
    ],
    suits: [{ who: "Wildlife and birders", line: "Magpie geese, buffalo and crocodiles.", href: "/stays/bamurru-plains", label: "Bamurru Plains" }, { who: "Families (10 and over)", line: "Or take the whole camp.", href: "/stays/bamurru-plains", label: "Bamurru Plains" }],
    howTo: { title: "The Top End in a Journey", intro: "Three nights on the floodplain fit before or after Uluru or the reef. The house books the flights.", options: [
      { name: "Floodplain and desert", body: "Bamurru Plains, then Longitude 131° at Uluru.", href: `${BASE}/red-centre`, label: "The Red Centre" },
    ] },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("top-end"),
    voyageWaters: [],
    faqs: [
      { q: "Is there a safari in Australia?", a: "Yes. Bamurru Plains, on the Mary River floodplain at the edge of Kakadu, runs airboat safaris, crocodile cruises and open-top drives for buffalo, wallabies, brumbies and dingoes." },
      { q: "When is Bamurru Plains open?", a: "February to October. It closes in the monsoon. Early in the season safaris are on the water; by late September the plains dry and wildlife gathers at the waterholes. Kakadu opens to visitors from May." },
      { q: "How do you get to Bamurru Plains?", a: "About three hours by road from Darwin, or a charter flight from Darwin arranged by the camp." },
    ],
    geo: { lat: -12.24, lng: 131.87 },
    sources: [src("Bamurru Plains")],
  },

  ningaloo: {
    slug: "ningaloo", region: "oceania", country: "australia", parent: "australia", name: "Ningaloo", path: `${BASE}/ningaloo`,
    theme: "sea", stays: ["sal-salis"],
    proofEyebrow: "In the water · the house's Ningaloo file",
    seo: {
      title: "Swim with Whale Sharks at Ningaloo Reef: Sal Salis and When to Go",
      description: "Ningaloo Reef: swim with whale sharks mid-March to October and humpbacks from August, snorkel from the beach, and stay in Sal Salis' sixteen tents in Cape Range National Park.",
      keywords: ["Ningaloo Reef whale sharks", "swim with whale sharks Australia", "Sal Salis Ningaloo", "Ningaloo humpback swim", "Exmouth luxury camp", "Cape Range National Park"],
    },
    eyebrow: EYEBROW,
    h1: "Ningaloo",
    tagline: "Whale sharks, humpbacks, and a reef you snorkel from the beach",
    slides: [],
    slidesFromStay: { slug: "sal-salis", alt: "Sal Salis tents in the dunes above Ningaloo Reef", credit: "Photograph courtesy of Sal Salis Ningaloo Reef" },
    answer: "Ningaloo, on Western Australia's coast, is one of the few places to swim with whale sharks (mid-March to October) and humpback whales (swims from August). The house stays at Sal Salis: sixteen tents in the dunes of Cape Range National Park, steps from the reef, reopening refurbished in late March 2027. Qantas flies daily from Perth to Learmonth (Exmouth), and the camp's included road transfer takes about 90 minutes. Sal Salis is open late March to the end of October.",
    facts: [
      ["The stay", "Sal Salis: 15 tents and one honeymoon tent, in Cape Range National Park"],
      ["Getting there", "Perth → Learmonth (LEA) daily with Qantas, then about 90 minutes by the camp's transfer"],
      ["Whale sharks", "Mid-March to October (extra cost; book early)"],
      ["Humpbacks", "June to October, with swims from August"],
      ["Open", "Late March to end of October; refurbished for 2027"],
      ["Turtles", "Nesting from October, hatching to March"],
    ],
    proof: "Ningaloo is on the house's ocean file for the swims you cannot have anywhere else, and Sal Salis is in the Ledger with its own ID.",
    months: [
      { area: "Whale sharks", note: "Mid-March to October (Sal Salis)", months: M("wwgBBBBBBBww") },
      { area: "Humpback swims", note: "August to October (Sal Salis)", months: M("wwwwwwwBBBww") },
    ],
    airports: [["Learmonth (LEA), Exmouth", "Daily Qantas flights from Perth"]],
    transfers: [["Learmonth → Sal Salis", "About 90 minutes by road, included"]],
    highlights: [
      { title: "Whale sharks", line: "Mid-March to October", body: "Swim beside the largest fish in the sea on Ningaloo Reef." },
      { title: "Drift snorkelling", line: "From the beach", body: "Walk down from your tent and drift over the reef." },
      { title: "The honeymoon tent", line: "Sal Salis", body: "Apart from the others, with private beach access and a four-poster bed." },
    ],
    suits: [{ who: "Honeymooners", line: "The tent set apart, on its own beach.", href: "/stays/sal-salis", label: "Sal Salis" }, { who: "Ocean people", line: "Whale sharks and humpbacks in one season.", href: "/stays/sal-salis", label: "Sal Salis" }],
    howTo: { title: "Ningaloo in a Journey", intro: "Fly via Perth; three or four nights give time for a whale shark swim and the reef from the beach.", options: [
      { name: "Ningaloo and the Red Centre", body: "Sal Salis, then Longitude 131° at Uluru, the ocean and the desert in one trip.", href: `${BASE}/red-centre`, label: "The Red Centre" },
    ] },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("ningaloo"),
    voyageWaters: [],
    faqs: [
      { q: "When can you swim with whale sharks at Ningaloo?", a: "Mid-March to October. Humpback whale swims run from August to October. Both are extra cost and book early." },
      { q: "How do you get to Ningaloo?", a: "Fly Qantas from Perth to Learmonth Airport (Exmouth); Sal Salis' included road transfer takes about 90 minutes." },
      { q: "When is Sal Salis open?", a: "Late March to the end of October. It reopens refurbished in late March 2027, with every tent new." },
    ],
    geo: { lat: -22.08, lng: 113.9 },
    sources: [src("Sal Salis Ningaloo Reef")],
  },

  "south-australia": {
    slug: "south-australia", region: "oceania", country: "australia", parent: "australia", name: "South Australia", path: `${BASE}/south-australia`,
    theme: "stays", stays: ["beckon-southern-ocean-lodge", "beckon-the-louise"],
    proofEyebrow: "Cliffs and vines · the house's South Australia file",
    seo: {
      title: "Kangaroo Island and the Barossa: Southern Ocean Lodge and The Louise",
      description: "South Australia in two stays: Southern Ocean Lodge on Kangaroo Island's limestone cliffs, and The Louise among the Barossa Valley's vineyards. Flights from Adelaide, the best months, and how to pair them.",
      keywords: ["Southern Ocean Lodge", "Kangaroo Island luxury lodge", "The Louise Barossa", "Barossa Valley luxury", "South Australia luxury travel"],
    },
    eyebrow: EYEBROW,
    h1: "South Australia",
    tagline: "Kangaroo Island's cliffs and the Barossa's vines, an hour from Adelaide each way",
    slides: [],
    slidesFromStay: { slug: "beckon-southern-ocean-lodge", alt: "Southern Ocean Lodge on the cliffs of Kangaroo Island", credit: "Photograph courtesy of Southern Ocean Lodge" },
    answer: "South Australia pairs two stays from Adelaide. Southern Ocean Lodge sits on limestone cliffs above the Southern Ocean on Kangaroo Island: fly to Kingscote, then about an hour by road, or take the ferry from Cape Jervis; October to April is best for wildlife and coastal walks. The Louise is among the Barossa Valley's vineyards, about an hour's drive from Adelaide; autumn brings the vintage, and March to November is the lodge's season.",
    facts: [
      ["Kangaroo Island", "Southern Ocean Lodge, on the cliffs of the south coast"],
      ["The Barossa", "The Louise, among the vineyards"],
      ["Getting there", "Adelaide (ADL); Kingscote (KGC) for the island"],
      ["Best months", "Kangaroo Island October to April; the Barossa March to November"],
      ["Days", "Wildlife, coastal walks, wine tastings, cycling, hot air ballooning"],
    ],
    proof: "Both stays are in the Ledger, each with its own ID, and pair naturally in one week from Adelaide.",
    months: [
      { area: "Kangaroo Island", note: "October to April (Southern Ocean Lodge)", months: M("BBBBggggggBB") },
      { area: "The Barossa", note: "March to November; vintage in autumn (The Louise)", months: M("ggBBBBBBBBBg") },
    ],
    airports: [["Adelaide (ADL)", "The gateway for both"], ["Kingscote (KGC), Kangaroo Island", "Connecting flights from Adelaide"]],
    transfers: [["Kingscote → Southern Ocean Lodge", "About 60 minutes by road; or the ferry from Cape Jervis"], ["Adelaide → The Louise", "About an hour by road"]],
    highlights: [
      { title: "Above the Southern Ocean", line: "Southern Ocean Lodge", body: "Suites on limestone cliffs, with Kangaroo Island's wildlife and coastal walks." },
      { title: "In the vines", line: "The Louise", body: "Vineyard suites, private vineyard tours, cycling and hot air ballooning over the Barossa." },
    ],
    suits: [{ who: "Wildlife and walking", line: "Kangaroo Island's coast.", href: "/stays/beckon-southern-ocean-lodge", label: "Southern Ocean Lodge" }, { who: "Food and wine", line: "The Barossa at vintage.", href: "/stays/beckon-the-louise", label: "The Louise" }],
    howTo: { title: "A Week from Adelaide", intro: "Three nights on Kangaroo Island and three in the Barossa, with Adelaide between. The house books the flights and transfers.", options: [
      { name: "Island, then vines", body: "Southern Ocean Lodge first, back through Adelaide, then The Louise for the Barossa.", href: "/stays/beckon-the-louise", label: "The Louise" },
    ] },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("south-australia"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Southern Ocean Lodge?", a: "Fly to Kingscote on Kangaroo Island, then about an hour by road, or take the ferry from Cape Jervis and cross the island." },
      { q: "When is the best time to visit Kangaroo Island?", a: "October to April, the lodge says, for wildlife, wildflowers in spring and the best weather for coastal walks." },
      { q: "When is the best time for the Barossa?", a: "March to November. Autumn is vintage and harvest; spring brings mild days for touring and cycling." },
    ],
    geo: { lat: -35.2, lng: 137.8 },
    sources: [src("Southern Ocean Lodge"), src("The Louise")],
  },

  "lord-howe-island": {
    slug: "lord-howe-island", region: "oceania", country: "australia", parent: "australia", name: "Lord Howe Island", path: `${BASE}/lord-howe-island`,
    theme: "sea", stays: ["beckon-capella-lodge"],
    proofEyebrow: "A World Heritage island · the house's Lord Howe file",
    seo: {
      title: "Lord Howe Island: Capella Lodge, Mount Gower and the Reef",
      description: "Lord Howe Island, World Heritage in the Tasman Sea: Capella Lodge beneath its volcanic peaks, the Mount Gower trek, snorkelling the lagoon reef. Flights from Sydney and Brisbane; best September to April.",
      keywords: ["Lord Howe Island luxury", "Capella Lodge", "Mount Gower trek", "Lord Howe Island snorkelling", "how to get to Lord Howe Island"],
    },
    eyebrow: EYEBROW,
    h1: "Lord Howe Island",
    tagline: "Two volcanic peaks, a lagoon reef, and a lodge beneath them",
    slides: [],
    slidesFromStay: { slug: "beckon-capella-lodge", alt: "Capella Lodge beneath Lord Howe Island's peaks", credit: "Photograph courtesy of Capella Lodge" },
    answer: "Lord Howe Island is a World Heritage island in the Tasman Sea, reached by scheduled flights from Sydney and Brisbane to its own airport, 10 minutes from Capella Lodge, whose suites look over the lagoon and the island's volcanic peaks. Days are the Mount Gower trek with local guides, snorkelling and glass-bottom boat trips on the reef, and birdwatching. September to April is the lodge's best season.",
    facts: [
      ["The stay", "Capella Lodge, suites over the lagoon and mountains"],
      ["Getting there", "Lord Howe Island Airport (LDH) from Sydney or Brisbane; 10 minutes to the lodge"],
      ["Best months", "September to April"],
      ["Days", "Mount Gower with local guides, the reef, birdwatching"],
    ],
    proof: "Capella Lodge is in the Ledger with its own ID.",
    months: [{ area: "Walking and the reef", note: "Spring and autumn best, September to April (Capella Lodge)", months: M("BBBBggggBBBB") }],
    airports: [["Lord Howe Island Airport (LDH)", "Scheduled flights from Sydney and Brisbane"]],
    transfers: [["Airport → Capella Lodge", "About 10 minutes; guests are usually met"]],
    highlights: [
      { title: "Mount Gower", line: "On foot", body: "The trek to the summit with the island's local guides." },
      { title: "The lagoon reef", line: "In the water", body: "Snorkelling and glass-bottom boat trips." },
    ],
    suits: [{ who: "Walkers and honeymooners", line: "Peaks, reef and quiet.", href: "/stays/beckon-capella-lodge", label: "Capella Lodge" }],
    howTo: { title: "Lord Howe in a Journey", intro: "Three or four nights from Sydney or Brisbane; the house books the flights with the stay.", options: [
      { name: "Lord Howe and the reef", body: "Back through Brisbane, then north to the Whitsundays or Lizard Island.", href: `${BASE}/queensland-and-the-great-barrier-reef`, label: "The reef" },
    ] },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("lord-howe-island"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Lord Howe Island?", a: "By scheduled flight from Sydney or Brisbane to Lord Howe Island Airport, about 10 minutes from Capella Lodge." },
      { q: "When is the best time to visit Lord Howe Island?", a: "September to April, for walking weather and clear water for snorkelling." },
    ],
    geo: { lat: -31.5389, lng: 159.0796 },
    sources: [src("Capella Lodge")],
  },
};
