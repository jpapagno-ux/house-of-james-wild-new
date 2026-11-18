import type { Guide } from "./guides";

// Thailand place guides (James, 17 Nov 2026: "Let's go to Thailand and Cambodia now"). Three regions, the way the
// Tourism Authority of Thailand splits the seasons: the Andaman coast (November to April), the Gulf (December to
// June) and the north (the cool season, November to February). Facts only from each resort's own site as filed in
// its library record (stays.json) and from TAT; no outbound links, sources kept as data (James, 13 Nov 2026).
// James has not yet stayed in Thailand, so no founder marks. Heroes borrow the lead stay's frames, credited
// (IMAGE FOLLOW-UP). Each stay has one home guide. Pins are still missing for six Andaman stays, so no 3D map yet.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/asia/thailand";
const SITES: Record<string, string> = {
  Amanpuri: "https://www.aman.com/resorts/amanpuri", "Rosewood Phuket": "https://www.rosewoodhotels.com/en/phuket", Keemala: "https://www.keemala.com/",
  "The Sarojin": "https://www.sarojin.com/", "Six Senses Yao Noi": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/thailand/yao-noi/",
  Rayavadee: "https://www.rayavadee.com/", "Banyan Tree Krabi": "https://www.banyantree.com/thailand/krabi",
  "Six Senses Samui": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/thailand/samui/", "Kamalaya Koh Samui": "https://kamalaya.com/",
  "Anantara Bophut Koh Samui": "https://www.anantara.com/en/bophut-koh-samui", "KAIA Resorts": "https://www.kaiaresorts.com",
  "Anantara Hua Hin": "https://www.anantara.com/en/hua-hin", "Anantara Chiang Mai": "https://www.anantara.com/en/chiang-mai",
  "Anantara Golden Triangle": "https://www.anantara.com/en/golden-triangle-chiang-rai", "Four Seasons Tented Camp Golden Triangle": "https://www.fourseasons.com/goldentriangle/",
  Trisara: "https://trisara.com/", "Phulay Bay": "https://www.ritzcarlton.com/en/hotels/phulay-bay",
  "Aman Nai Lert Bangkok": "https://www.aman.com/hotels/aman-nai-lert-bangkok", "The Siam": "https://www.thesiamhotel.com/",
  "TAT: plan your trip": "https://www.tourismthailand.org/Articles/plan-your-trip-around-thailand",
  "TAT: the cooler months": "https://www.tatnews.org/2020/11/thailands-comfortable-cooler-months-of-november-february-are-a-fantastic-time-to-travel/",
  "TAT: the Andaman opens its doors again": "https://www.tatnews.org/2026/10/the-andaman-opens-its-doors-again/",
};
// Sources are kept as data, never printed as links (James, 13 Nov 2026).
const src = (title: string) => ({ title, url: SITES[title] });

const ALL = [
  { name: "The Andaman Coast", slug: "andaman-coast", line: "Phuket, Phang Nga Bay, Khao Lak and Krabi, November to April" },
  { name: "Koh Samui and the Gulf", slug: "koh-samui-and-the-gulf", line: "Samui, Koh Phangan and Hua Hin, December to June" },
  { name: "Northern Thailand", slug: "northern-thailand", line: "Chiang Mai and the Golden Triangle, cool from November to February" },
  { name: "Bangkok", slug: "bangkok", line: "Two quiet ways into the capital, before the beach or the north" },
];
const ONWARD = (except: string) => [...ALL.filter((a) => a.slug !== except).map((a) => ({ name: a.name, href: `${BASE}/${a.slug}`, line: a.line })), { name: "Cambodia", href: "/destinations/asia/cambodia", line: "The Cardamom rainforest and Siem Pang, across the border" }, { name: "Thailand", href: BASE, line: "Every Thailand stay in the Ledger" }];
const EYEBROW = "Destinations · Asia · Thailand";
const ONWARD_EYEBROW = "Continue through Thailand";
const PROOF = "Filed from each resort's own pages and the Tourism Authority of Thailand's seasons. Every stay on this page is in the Ledger with its own ID; the house books every transfer with the stays.";

export const THAILAND_GUIDES: Record<string, Guide> = {
  "andaman-coast": {
    slug: "andaman-coast", region: "asia", country: "thailand", parent: "thailand", name: "The Andaman Coast", path: `${BASE}/andaman-coast`,
    theme: "sea", stays: ["amanpuri", "rosewood-phuket", "keemala", "the-sarojin", "six-senses-yao-noi", "rayavadee", "banyan-tree-krabi", "trisara", "phulay-bay-ritz-carlton-reserve"],
    proofEyebrow: "Resort by resort · the house's Andaman file",
    seo: {
      title: "Phuket, Phang Nga and Krabi Luxury Resorts: Thailand's Andaman Coast",
      description: "Where to stay on Thailand's Andaman coast: Amanpuri, Rosewood Phuket, Keemala, The Sarojin at Khao Lak, Trisara, Six Senses Yao Noi in Phang Nga Bay, Rayavadee, Banyan Tree Krabi and Phulay Bay. Transfers, best months and the Similan season.",
      keywords: ["best luxury resort Phuket", "Amanpuri", "Trisara Phuket", "Phulay Bay Ritz-Carlton Reserve", "Rosewood Phuket", "Keemala Phuket", "Six Senses Yao Noi", "Rayavadee Krabi", "Banyan Tree Krabi", "The Sarojin Khao Lak", "Phang Nga Bay resort", "Andaman coast Thailand"],
    },
    eyebrow: EYEBROW,
    h1: "The Andaman Coast",
    tagline: "Phuket's west coast, the karsts of Phang Nga Bay and the cliffs of Krabi",
    slides: [],
    slidesFromStay: { slug: "six-senses-yao-noi", alt: "Phang Nga Bay's limestone karsts from Six Senses Yao Noi", credit: "Photograph courtesy of Six Senses Yao Noi" },
    answer: "On Thailand's Andaman coast the house chooses from nine stays in three provinces. On Phuket: Amanpuri, Aman's first resort, on its own peninsula at Pansea Beach; Trisara, private pool villas above a secluded beach on the north west coast, with PRU, its Michelin-starred restaurant; Rosewood Phuket, on a 600 metre beach at Emerald Bay; and Keemala, 38 pool villas in the rainforest above Kamala. North at Khao Lak, The Sarojin keeps 56 residences beside an 11 km beach. In Phang Nga Bay, Six Senses Yao Noi faces the limestone karsts from Koh Yao Noi, about 70 minutes from Phuket airport by car and speedboat. In Krabi, Rayavadee sits on the Phranang Peninsula inside Krabi Marine National Park, Banyan Tree Krabi has 72 pool suites and villas at the north end of Tubkaek Beach, and Phulay Bay, a Ritz-Carlton Reserve, keeps pool pavilions and villas with a butler for every guest, 40 km from Krabi airport. The Tourism Authority of Thailand names November to April as the Andaman's best months.",
    facts: [
      ["Phuket", "Amanpuri · Trisara · Rosewood Phuket · Keemala"],
      ["Khao Lak", "The Sarojin, an hour north of Phuket airport"],
      ["Phang Nga Bay", "Six Senses Yao Noi, on Koh Yao Noi"],
      ["Krabi", "Rayavadee · Banyan Tree Krabi · Phulay Bay"],
      ["Best months", "November to April (Tourism Authority of Thailand)"],
      ["Marine parks", "The Similan Islands reopened on 15 October 2026 after the monsoon closure (TAT)"],
    ],
    proof: PROOF,
    months: [
      { area: "The Andaman coast", note: "Best November to April; May to October is the green season (TAT, Keemala)", months: M("BBBBwwwwwwBB") },
      { area: "Diving from Koh Yao Noi", note: "October to April (Six Senses Yao Noi)", months: M("BBBBwwwwwBBB") },
      { area: "The Similan Islands", note: "Reopened 15 October 2026; dry season settles by December (TAT)", months: M("BBBBwwwwwgBB") },
    ],
    airports: [["Phuket (HKT)", "For Amanpuri, Rosewood, Keemala, The Sarojin and the boat to Koh Yao Noi"], ["Krabi (KBV)", "For Rayavadee and Banyan Tree Krabi"]],
    transfers: [
      ["Phuket airport → Amanpuri", "About 30 minutes by road"],
      ["Phuket airport → Keemala", "About 45 minutes in normal traffic"],
      ["Phuket airport → Rosewood Phuket", "About 40 km, 60 to 90 minutes depending on traffic"],
      ["Phuket airport → The Sarojin", "About one hour, 88.7 km"],
      ["Phuket airport → Six Senses Yao Noi", "30 minutes to Ao Po Grand Marina, then 40 minutes by speedboat"],
      ["Krabi airport → Rayavadee", "20 minutes to Nong Nuch pier, then 20 minutes by boat to the resort beach"],
      ["Krabi airport → Banyan Tree Krabi", "40 km, about 45 minutes"],
      ["Krabi airport → Phulay Bay", "40 km; the resort books the transfer (130 km from Phuket airport)"],
    ],
    highlights: [
      { title: "Where Aman began", line: "Amanpuri", body: "Aman's first resort still has its own peninsula on Phuket's west coast: pool pavilions for two, and villas of three to nine bedrooms with a Villa Host and a personal Thai chef." },
      { title: "The karsts from your pool", line: "Six Senses Yao Noi", body: "Every villa type looks across Phang Nga Bay's limestone towers; island hopping and diving run October to April." },
      { title: "A beach inside a national park", line: "Rayavadee", body: "Two storey pavilions on the Phranang Peninsula, a few minutes' walk from Railay and Phranang beaches, reached by boat." },
      { title: "Tree houses and bird's nests", line: "Keemala", body: "Clay cottages, tents, two storey tree houses and woven bird's nest villas, each with a pool, on a rainforest hillside above Kamala." },
    ],
    suits: [
      { who: "Honeymooners", line: "A tree house or bird's nest with its own pool.", href: "/stays/keemala", label: "Keemala" },
      { who: "Families and groups", line: "A villa of up to nine bedrooms with a Thai chef.", href: "/stays/amanpuri", label: "Amanpuri" },
      { who: "A family beach house", line: "The Palm House sleeps up to 12 on Emerald Bay.", href: "/stays/rosewood-phuket", label: "Rosewood Phuket" },
      { who: "Quiet on a long beach", line: "56 residences; children 10 and over.", href: "/stays/the-sarojin", label: "The Sarojin" },
    ],
    howTo: {
      title: "Phuket, Then the Bay by Boat",
      intro: "The coast is close enough to take two stays in one trip: a Phuket beach, then the islands of Phang Nga Bay or the cliffs of Krabi by sea.",
      options: [
        { name: "Phuket, then Koh Yao Noi", body: "Amanpuri or Rosewood first, then 40 minutes by speedboat from Ao Po Grand Marina into Phang Nga Bay.", href: "/stays/six-senses-yao-noi", label: "Six Senses Yao Noi" },
        { name: "Phuket, then Krabi by sea", body: "Rayavadee's private speedboat crosses from a Phuket marina in about 90 minutes, weather permitting.", href: "/stays/rayavadee", label: "Rayavadee" },
        { name: "Khao Lak and a long beach", body: "An hour north of Phuket airport, The Sarojin runs island day trips and local diving from its 11 km beach.", href: "/stays/the-sarojin", label: "The Sarojin" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("andaman-coast"),
    voyageWaters: [],
    faqs: [
      { q: "What is the best time to visit Phuket and Krabi?", a: "November to April, the Tourism Authority of Thailand says. May to October is the green season, with short showers and livelier seas; the resorts stay open." },
      { q: "Andaman coast or Gulf of Thailand?", a: "Go by the month. The Andaman coast (Phuket, Phang Nga, Krabi) is best November to April; the Gulf islands (Samui, Koh Phangan) are best December to June, according to the Tourism Authority of Thailand." },
      { q: "Which Phuket resort is best for families?", a: "Amanpuri's villas of three to nine bedrooms come with a Villa Host and a personal Thai chef, and children 5 and over have daily programmes. Rosewood Phuket's Palm House has four bedrooms and two pools for up to 12. The Sarojin at Khao Lak takes children 10 and over." },
      { q: "How do you get to Six Senses Yao Noi?", a: "From Phuket airport, 30 minutes by car to Ao Po Grand Marina and 40 minutes by speedboat, about 70 minutes in all. Transfers also run from Krabi. Boat times depend on the weather." },
      { q: "When are the Similan Islands open?", a: "The Similan Islands reopened on 15 October 2026 after a five month monsoon closure, the Tourism Authority of Thailand reported, and the marine parks now use e-tickets." },
    ],
    geo: { lat: 8.1, lng: 98.45 },
    sources: [src("Amanpuri"), src("Rosewood Phuket"), src("Keemala"), src("The Sarojin"), src("Six Senses Yao Noi"), src("Rayavadee"), src("Banyan Tree Krabi"), src("Trisara"), src("Phulay Bay"), src("TAT: the cooler months"), src("TAT: the Andaman opens its doors again")],
  },

  "koh-samui-and-the-gulf": {
    slug: "koh-samui-and-the-gulf", region: "asia", country: "thailand", parent: "thailand", name: "Koh Samui and the Gulf", path: `${BASE}/koh-samui-and-the-gulf`,
    theme: "sea", stays: ["six-senses-samui", "kamalaya-koh-samui", "anantara-bophut-koh-samui-resort", "kaia-koh-phangan", "anantara-hua-hin"],
    proofEyebrow: "Island by island · the house's Gulf file",
    seo: {
      title: "Koh Samui, Koh Phangan and Hua Hin: Luxury Stays in the Gulf of Thailand",
      description: "Where to stay in the Gulf of Thailand: Six Senses Samui, Kamalaya's wellness sanctuary, Anantara Bophut, KAIA Koh Phangan (opening) and Anantara Hua Hin. Best months, whale shark season and transfers.",
      keywords: ["best resort Koh Samui", "Six Senses Samui", "Kamalaya Koh Samui", "Anantara Bophut", "KAIA Koh Phangan", "Koh Phangan new resort", "Anantara Hua Hin", "Gulf of Thailand best time"],
    },
    eyebrow: EYEBROW,
    h1: "Koh Samui and the Gulf",
    tagline: "Samui's headlands, a monks' cave at Kamalaya, Koh Phangan's jungle coast and the royal seaside at Hua Hin",
    slides: [],
    slidesFromStay: { slug: "six-senses-samui", alt: "Six Senses Samui's hillside villas above the Gulf of Thailand", credit: "Photograph courtesy of Six Senses Samui" },
    answer: "In the Gulf of Thailand the house chooses from three stays on Koh Samui, one opening on Koh Phangan and one on the mainland at Hua Hin. Six Senses Samui sets hillside villas over the sea on the island's northeast tip, 15 minutes from the airport. Kamalaya is a wellness sanctuary of 76 rooms and villas on the south coast, built around a cave once used by Buddhist monks for meditation. Anantara Bophut is on Bophut Beach, a short walk from Fisherman's Village. KAIA Koh Phangan is the first of a new collection of place-led resorts, where jungle meets the coast. Anantara Hua Hin, Anantara's first resort, reopened in November 2025, two minutes from Hua Hin Airport. The Tourism Authority of Thailand names December to June as the Gulf's best months; Six Senses Samui puts whale shark season from April to September.",
    facts: [
      ["Koh Samui", "Six Senses Samui · Kamalaya · Anantara Bophut"],
      ["Koh Phangan", "KAIA Koh Phangan, preparing to open"],
      ["Hua Hin", "Anantara Hua Hin, about three hours from Bangkok"],
      ["Best months", "December to June (Tourism Authority of Thailand)"],
      ["Rains", "Late October to December, heaviest in October and November (Kamalaya)"],
      ["Whale sharks", "April to September, with snorkelling and diving (Six Senses Samui)"],
    ],
    proof: PROOF,
    months: [
      { area: "The Gulf islands", note: "Best December to June (TAT); rains late October to December (Kamalaya)", months: M("BBBBBBgggwwg") },
      { area: "Snorkelling, diving and whale sharks", note: "April to September (Six Senses Samui)", months: M("wwwBBBBBBwww") },
    ],
    airports: [["Samui (USM)", "15 minutes from Six Senses Samui and Anantara Bophut; about 45 from Kamalaya"], ["Hua Hin (HHQ)", "Two minutes from Anantara Hua Hin"], ["Bangkok Suvarnabhumi (BKK)", "About three hours by road to Hua Hin"]],
    transfers: [
      ["Samui airport → Six Senses Samui", "About 15 minutes; the resort arranges a car or minibus"],
      ["Samui airport → Anantara Bophut", "About 15 minutes"],
      ["Samui airport → Kamalaya", "About 25 km, roughly 45 minutes"],
      ["Surat Thani → Samui, without a direct flight", "About 60 minutes by bus to the port, then 90 minutes by ferry (Anantara)"],
      ["Bangkok → Anantara Hua Hin", "About three hours by road, or around four by train from Bang Sue"],
    ],
    highlights: [
      { title: "A monks' cave at the heart of it", line: "Kamalaya", body: "A wellness sanctuary built around a centuries old cave once used by Buddhist monks for meditation; every room needs one adult on a programme." },
      { title: "Whale shark season", line: "Six Senses Samui", body: "April to September is the resort's season for snorkelling, diving, kayaking and the best chance of whale sharks." },
      { title: "A new name on Koh Phangan", line: "KAIA", body: "The first resort of KAIA's place-led collection, shaped by the island's rhythm, culture and character. The house is filing its details as KAIA publishes them." },
      { title: "Where Anantara began", line: "Anantara Hua Hin", body: "Relaunched on 1 November 2025 with 171 renovated rooms and suites, a new kids' club and an adults' lagoon pool on the seafront." },
    ],
    suits: [
      { who: "A wellness programme", line: "Detox, yoga, holistic healing and a monks' cave.", href: "/stays/kamalaya-koh-samui", label: "Kamalaya" },
      { who: "Couples and divers", line: "Pool villas over the sea, whale sharks in season.", href: "/stays/six-senses-samui", label: "Six Senses Samui" },
      { who: "Families", line: "Kids' club, and children to 11 free with parents.", href: "/stays/anantara-bophut-koh-samui-resort", label: "Anantara Bophut" },
      { who: "Bangkok and the beach", line: "Three hours by road, or a train to the coast.", href: "/stays/anantara-hua-hin", label: "Anantara Hua Hin" },
    ],
    howTo: {
      title: "Two Islands, or Bangkok and the Sea",
      intro: "Samui is a short flight from Bangkok, and Hua Hin a drive. The house books every leg with the stays.",
      options: [
        { name: "Wellness, then the beach", body: "A Kamalaya programme on the south coast, then Six Senses Samui or Anantara Bophut on the north shore.", href: "/stays/kamalaya-koh-samui", label: "Kamalaya" },
        { name: "Samui and Koh Phangan", body: "Pair a Samui stay with KAIA Koh Phangan once it opens; the house will confirm the crossing when KAIA publishes it.", href: "/stays/kaia-koh-phangan", label: "KAIA Koh Phangan" },
        { name: "Bangkok, then Hua Hin", body: "Limousine from Suvarnabhumi or the train from Bang Sue to Anantara Hua Hin, Thai royalty's favourite seaside town.", href: "/stays/anantara-hua-hin", label: "Anantara Hua Hin" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("koh-samui-and-the-gulf"),
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit Koh Samui?", a: "December to June, the Tourism Authority of Thailand says. Kamalaya notes that the rains fall from late October to December, heaviest in October and November, and that February is the only true dry month." },
      { q: "When can you see whale sharks off Koh Samui?", a: "Six Senses Samui puts April to September as the season for snorkelling, diving, kayaking and the best chance of whale sharks." },
      { q: "Is Kamalaya suitable for children?", a: "Kamalaya is for adults on a wellness programme. Children up to 16 may stay only in the private villas, one per villa, and cannot join wellness activities; Kamalaya does not recommend it for infants and children." },
      { q: "When does KAIA Koh Phangan open?", a: "KAIA has not yet announced an opening date. The house will add rooms, transfers and dates as soon as KAIA publishes them." },
      { q: "How far is Hua Hin from Bangkok?", a: "About three hours by road, with limousine pick up at Suvarnabhumi, or around four hours by train from Bang Sue. Hua Hin Airport is two minutes from Anantara Hua Hin." },
    ],
    geo: { lat: 9.5, lng: 100.0 },
    sources: [src("Six Senses Samui"), src("Kamalaya Koh Samui"), src("Anantara Bophut Koh Samui"), src("KAIA Resorts"), src("Anantara Hua Hin"), src("TAT: the cooler months")],
  },

  "northern-thailand": {
    slug: "northern-thailand", region: "asia", country: "thailand", parent: "thailand", name: "Northern Thailand", path: `${BASE}/northern-thailand`,
    theme: "stays", stays: ["anantara-chiang-mai-resort", "anantara-golden-triangle-chiang-rai", "four-seasons-tented-camp-golden-triangle"],
    proofEyebrow: "Camp by camp · the house's northern file",
    seo: {
      title: "Chiang Mai and the Golden Triangle: Luxury Camps and Elephants in Northern Thailand",
      description: "Northern Thailand with James Wild & Co: Anantara Chiang Mai on the Mae Ping River, Anantara Golden Triangle and its rescued elephants, and Four Seasons Tented Camp where Thailand, Laos and Myanmar meet. Helicopter and road transfers, the cool season.",
      keywords: ["Golden Triangle luxury camp", "Four Seasons Tented Camp Golden Triangle", "Anantara Golden Triangle elephants", "Anantara Chiang Mai", "Chiang Rai luxury resort", "northern Thailand best time", "ethical elephant experience Thailand"],
    },
    eyebrow: EYEBROW,
    h1: "Northern Thailand",
    tagline: "The Mae Ping in Chiang Mai, and the bamboo jungle where three countries meet",
    slides: [],
    slidesFromStay: { slug: "four-seasons-tented-camp-golden-triangle", alt: "A tent on its deck above the Ruak River at Four Seasons Tented Camp Golden Triangle", credit: "Photograph courtesy of Four Seasons" },
    answer: "For northern Thailand the house pairs a city base with the Golden Triangle. Anantara Chiang Mai has 86 rooms and suites on the Mae Ping River, 15 minutes from the airport and a few minutes from the city centre. In the Golden Triangle, where the Ruak meets the Mekong and Thailand, Laos and Myanmar meet, Anantara Golden Triangle sits in 160 acres of bamboo jungle with the rescued elephants of the Golden Triangle Asian Elephant Foundation, and Four Seasons Tented Camp keeps 15 tents and a two bedroom lodge above the Ruak, sold as all inclusive stays of two to four nights. The Golden Triangle is about an hour from Chiang Rai airport, or a 70 minute helicopter from Chiang Mai. The Tourism Authority of Thailand names the cool season, November to February, as the north's best months.",
    facts: [
      ["Chiang Mai", "Anantara Chiang Mai, on the Mae Ping River"],
      ["The Golden Triangle", "Anantara Golden Triangle · Four Seasons Tented Camp"],
      ["Elephants", "Golden Triangle Asian Elephant Foundation (Anantara); My Elephant & I with the camp's mahouts (Four Seasons)"],
      ["Getting there", "Chiang Mai (CNX) or Chiang Rai (CEI); helicopter or road between them"],
      ["Best months", "November to February, the cool season (TAT)"],
    ],
    proof: PROOF,
    months: [{ area: "Chiang Mai and the Golden Triangle", note: "Cool season November to February; misty mornings December to February (TAT)", months: M("BBggggggggBB") }],
    airports: [["Chiang Mai (CNX)", "15 minutes from Anantara Chiang Mai"], ["Chiang Rai (CEI)", "About an hour from the Golden Triangle"]],
    transfers: [
      ["Chiang Mai → the Golden Triangle", "A 70 minute helicopter charter for up to six (book 72 hours ahead), or about 4.5 hours by road"],
      ["Chiang Rai airport → Anantara Golden Triangle", "About one hour by road"],
      ["The Explorer's Arrival", "Private car to Chiang Saen, then a longtail boat on the Mekong to Anantara's jetty"],
    ],
    highlights: [
      { title: "Walking with rescued elephants", line: "Anantara Golden Triangle", body: "The elephants of the Golden Triangle Asian Elephant Foundation live in the resort's 160 acres of bamboo jungle on a ridge above the Mekong and Ruak rivers." },
      { title: "Fifteen tents above the Ruak", line: "Four Seasons Tented Camp", body: "Decks over the river near its confluence with the Mekong, an open air spa, and My Elephant & I, walking with a herd and the camp's own mahouts to the river." },
      { title: "The city on the river", line: "Anantara Chiang Mai", body: "86 rooms around a garden courtyard on the Mae Ping, 1921 House and a 34 metre riverside pool, a few minutes from the city centre." },
    ],
    suits: [
      { who: "Couples", line: "A tent on the Ruak, everything included.", href: "/stays/four-seasons-tented-camp-golden-triangle", label: "Four Seasons Tented Camp" },
      { who: "Families", line: "Family suites for up to six and childcare.", href: "/stays/anantara-golden-triangle-chiang-rai", label: "Anantara Golden Triangle" },
      { who: "Temples and markets", line: "A riverside base a few minutes from the centre.", href: "/stays/anantara-chiang-mai-resort", label: "Anantara Chiang Mai" },
    ],
    howTo: {
      title: "City, Then the Triangle",
      intro: "Most northern journeys run Chiang Mai first, then the Golden Triangle by helicopter or road.",
      options: [
        { name: "The helicopter loop", body: "Anantara Chiang Mai, then 70 minutes by helicopter to the Golden Triangle.", href: "/stays/anantara-golden-triangle-chiang-rai", label: "Anantara Golden Triangle" },
        { name: "By the Mekong", body: "Car to Chiang Saen, then a longtail boat up the Mekong to the resort's jetty.", href: "/stays/anantara-golden-triangle-chiang-rai", label: "The Explorer's Arrival" },
        { name: "All in at the camp", body: "Two to four nights at Four Seasons Tented Camp, with meals, drinks, spa and exploration included.", href: "/stays/four-seasons-tented-camp-golden-triangle", label: "Four Seasons Tented Camp" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("northern-thailand"),
    voyageWaters: [],
    faqs: [
      { q: "When is the best time to visit northern Thailand?", a: "The cool season, November to February, says the Tourism Authority of Thailand; mornings and nights can drop to about 10°C, with misty mornings from December to February." },
      { q: "How do you get to the Golden Triangle from Chiang Mai?", a: "By a 70 minute helicopter charter for up to six, booked 72 hours ahead, or about 4.5 hours by road. Chiang Rai airport is about an hour away." },
      { q: "What is included at Four Seasons Tented Camp?", a: "Four Seasons sells the camp as all inclusive packages of two to four nights, with meals, drinks, spa and exploration." },
      { q: "Can families stay in the Golden Triangle?", a: "Yes. Anantara's Mekong Explorer Family Suites take up to six adults and a child, with childcare offered; Four Seasons' two bedroom Explorer's Lodge takes up to six." },
    ],
    geo: { lat: 19.6, lng: 99.6 },
    sources: [src("Anantara Chiang Mai"), src("Anantara Golden Triangle"), src("Four Seasons Tented Camp Golden Triangle"), src("TAT: the cooler months")],
  },
  bangkok: {
    slug: "bangkok", region: "asia", country: "thailand", parent: "thailand", name: "Bangkok", path: `${BASE}/bangkok`,
    theme: "stays", stays: ["aman-nai-lert-bangkok", "the-siam-bangkok"],
    proofEyebrow: "City by city · the house's Bangkok file",
    seo: {
      title: "Where to Stay in Bangkok: Aman Nai Lert and The Siam",
      description: "Bangkok with James Wild & Co: Aman Nai Lert's 52 suites in the gardens of Nai Lert Park, and The Siam's pool villas among art and antiques on the Chao Phraya in old Dusit. Airports, transfers and how to pair the city with the beach or the north.",
      keywords: ["best hotel Bangkok", "Aman Nai Lert Bangkok", "The Siam Bangkok", "Bangkok luxury hotel river", "Bangkok pool villa hotel", "Nai Lert Park", "Dusit Bangkok hotel"],
    },
    eyebrow: EYEBROW,
    h1: "Bangkok",
    tagline: "A garden in the middle of the city, and a river house full of antiques in old Dusit",
    slides: [],
    slidesFromStay: { slug: "aman-nai-lert-bangkok", alt: "Aman Nai Lert Bangkok rising above the trees of Nai Lert Park", credit: "Photograph courtesy of Aman" },
    answer: "In Bangkok the house chooses two quiet ways into the capital. Aman Nai Lert Bangkok has 52 suites by Jean-Michel Gathy within the seven-acre gardens of Nai Lert Park, with a 1,500 square metre spa; Aman includes round-trip airport transfers for stays of two nights or more. The Siam keeps suites and pool villas full of art and antiques in three acres of gardens on the Chao Phraya River in Dusit, beside the old city's sights, with its own river shuttle. Both work as the first or last nights of a trip to the Andaman coast, the Gulf islands or the north. Bangkok is served by two airports, Suvarnabhumi and Don Mueang.",
    facts: [
      ["The stays", "Aman Nai Lert Bangkok · The Siam"],
      ["Airports", "Suvarnabhumi (BKK) and Don Mueang (DMK)"],
      ["Aman Nai Lert", "52 suites in the seven-acre Nai Lert Park"],
      ["The Siam", "Three acres of gardens on the Chao Phraya in Dusit"],
      ["Onward", "Short flights to Phuket, Krabi, Samui and Chiang Mai"],
    ],
    proof: PROOF,
    months: [{ area: "Bangkok", note: "Cooler and drier November to February (TAT)", months: M("BBggggggggBB") }],
    airports: [["Bangkok Suvarnabhumi (BKK)", "The main international airport"], ["Bangkok Don Mueang (DMK)", "The second airport"]],
    transfers: [["Airport → Aman Nai Lert", "Aman's limousine from Suvarnabhumi or Don Mueang, included for two nights or more, with fast-track arrival at Suvarnabhumi"], ["Airport → The Siam", "The house arranges the car; the hotel's river shuttle runs into the city"]],
    highlights: [
      { title: "A garden in the middle of Bangkok", line: "Aman Nai Lert Bangkok", body: "Fifty-two suites among the largest in the city, in the green of Nai Lert Park, with Aman Spa & Wellness over two floors." },
      { title: "Antiques on the river", line: "The Siam", body: "Suites and pool villas full of art and antiques in three acres of gardens on the Chao Phraya, with Chon Thai and Opium Spa." },
    ],
    suits: [
      { who: "Wellness in the city", line: "A 1,500 sqm spa and thermal suite.", href: "/stays/aman-nai-lert-bangkok", label: "Aman Nai Lert Bangkok" },
      { who: "Old Bangkok by river", line: "A pool villa and the hotel's own boat.", href: "/stays/the-siam-bangkok", label: "The Siam" },
    ],
    howTo: {
      title: "Bangkok First, or Last",
      intro: "Bangkok is where most Thailand journeys begin or end. Two or three nights here, then a short flight south or north.",
      options: [
        { name: "Bangkok and the Andaman", body: "The city, then an hour's flight to Phuket or Krabi.", href: `${BASE}/andaman-coast`, label: "The Andaman Coast" },
        { name: "Bangkok and the Gulf", body: "The city, then a short flight to Samui.", href: `${BASE}/koh-samui-and-the-gulf`, label: "Koh Samui and the Gulf" },
        { name: "Bangkok and the north", body: "The city, then Chiang Mai and the Golden Triangle.", href: `${BASE}/northern-thailand`, label: "Northern Thailand" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("bangkok"),
    voyageWaters: [],
    faqs: [
      { q: "Which Bangkok hotel is best for a first night?", a: "Aman Nai Lert includes round-trip limousine transfers for stays of two nights or more, with fast-track arrival at Suvarnabhumi, so it is the easiest landing. The Siam suits travellers who want the river and the old city on the doorstep." },
      { q: "How many nights in Bangkok?", a: "Two or three nights before or after the beach or the north, the house suggests; the city connects by short flights to Phuket, Krabi, Samui and Chiang Mai." },
      { q: "Which airport does Bangkok use?", a: "Two: Suvarnabhumi (BKK), the main international airport, and Don Mueang (DMK). Aman's transfers run from both." },
    ],
    geo: { lat: 13.75, lng: 100.52 },
    sources: [src("Aman Nai Lert Bangkok"), src("The Siam"), src("TAT: plan your trip"), src("TAT: the cooler months")],
  },
};
