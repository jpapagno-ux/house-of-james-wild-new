import type { Guide } from "./guides";

// Cambodia place guides (James, 17 Nov 2026: "Let's go to Thailand and Cambodia now", and Siempang Forest Lodge
// added the same day). The Cardamom rainforest and its coast, and Siem Pang in the north. Facts only from each
// lodge's own site (shintamani.com/wild, cardamomtentedcamp.com, Canvas & Orchids, the Six Senses fact sheet,
// siempangforestlodge.com) as filed in the library; no outbound links, sources kept as data (James, 13 Nov 2026).
// No founder marks. Heroes borrow the lead stay's frames, credited (IMAGE FOLLOW-UP). Each stay has one home guide.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/asia/cambodia";
const SITES: Record<string, string> = {
  "Shinta Mani Wild": "https://shintamani.com/wild/", "Cardamom Tented Camp": "https://cardamomtentedcamp.com/",
  "Canvas & Orchids Retreat": "https://canvasandorchids.com/", "Six Senses Krabey Island fact sheet": "https://media.sixsenses.com/B60H3R33/at/qnj8jf7gk6g5v6xzrz6v89q/Six_Senses_Krabey_Island_Factsheet.pdf",
  "Six Senses Krabey Island": "https://www.sixsenses.com/en/hotels-resorts/asia-the-pacific/cambodia/krabey-island",
  "Song Saa Private Island": "https://www.songsaa-privateisland.com", "Siempang Forest Lodge": "https://www.siempangforestlodge.com", "Siempang Forest Lodge: conservation": "https://www.siempangforestlodge.com/conservation",
  "Siempang Forest Lodge: FAQs": "https://www.siempangforestlodge.com/faqs",
};
// Sources are kept as data, never printed as links (James, 13 Nov 2026).
const src = (title: string) => ({ title, url: SITES[title] });

const ALL = [
  { name: "The Cardamom Mountains and the Coast", slug: "cardamom-mountains", line: "Shinta Mani Wild, Cardamom Tented Camp, Canvas & Orchids and Krabey Island" },
  { name: "Siem Pang", slug: "siem-pang", line: "The giant ibis, vultures and fifteen tents on a forest ridge" },
];
const ONWARD = (except: string) => [...ALL.filter((a) => a.slug !== except).map((a) => ({ name: a.name, href: `${BASE}/${a.slug}`, line: a.line })), { name: "Northern Thailand", href: "/destinations/asia/thailand/northern-thailand", line: "The Golden Triangle, a short flight away" }, { name: "Cambodia", href: BASE, line: "Every Cambodia stay in the Ledger" }];
const EYEBROW = "Destinations · Asia · Cambodia";
const ONWARD_EYEBROW = "Continue through Cambodia";
const PROOF = "Filed from each lodge's own pages. Every stay on this page is in the Ledger with its own ID, and each one pays for the forest around it: rangers, community jobs or both.";

export const CAMBODIA_GUIDES: Record<string, Guide> = {
  "cardamom-mountains": {
    slug: "cardamom-mountains", region: "asia", country: "cambodia", parent: "cambodia", name: "The Cardamom Mountains and the Coast", path: `${BASE}/cardamom-mountains`,
    theme: "stays", stays: ["shinta-mani-wild", "cardamom-tented-camp", "canvas-and-orchids-retreat", "six-senses-krabey-island", "song-saa-private-island"],
    proofEyebrow: "Camp by camp · the house's Cardamom file",
    seo: {
      title: "Cardamom Mountains Luxury Camps: Shinta Mani Wild, Cardamom Tented Camp and Krabey Island",
      description: "Cambodia's Cardamom rainforest and its coast: Shinta Mani Wild's zipline arrival and Bensley tents, Cardamom Tented Camp in Botum Sakor, Canvas & Orchids' floating tents on the Tatai River and Six Senses Krabey Island. Transfers, seasons and rangers.",
      keywords: ["Shinta Mani Wild", "Cardamom Tented Camp", "Canvas and Orchids Retreat", "Six Senses Krabey Island", "Cardamom Mountains Cambodia", "Cambodia eco lodge", "Botum Sakor National Park", "Cambodia luxury jungle camp"],
    },
    eyebrow: EYEBROW,
    h1: "The Cardamom Mountains and the Coast",
    tagline: "A zipline into the rainforest, tents on the river, and a private island off Ream",
    slides: [],
    slidesFromStay: { slug: "shinta-mani-wild", alt: "A tent above the river at Shinta Mani Wild in the Cardamom rainforest", credit: "Photograph courtesy of Shinta Mani Wild" },
    answer: "In Cambodia's south west the house chooses from three camps in the Cardamom rainforest and one island off the coast. Shinta Mani Wild has 15 tents along a river, designed by Bill Bensley; guests arrive by a 400 metre zipline, stay three nights or more, and everything, spa included, is in the rate. Cardamom Tented Camp sits in Botum Sakor National Park, reached by a 45 minute boat, with treks, kayaking on the Preak Tachan River and night boat safaris. Canvas & Orchids floats on the Tatai River below the mountains, run since 2009 by Valentin and Anna. Off the coast, Six Senses Krabey Island has 40 pool villas on a 30 acre island 15 minutes by speedboat from its mainland jetty. Further out, Song Saa Private Island spreads 24 pool villas across two small islands in the Koh Rong archipelago, built to support the Song Saa Foundation. Shinta Mani Wild and Cardamom Tented Camp both fund Wildlife Alliance rangers. November to April is the dry season the camps recommend.",
    facts: [
      ["The rainforest", "Shinta Mani Wild · Cardamom Tented Camp · Canvas & Orchids"],
      ["The coast", "Six Senses Krabey Island, about 5 km off Ream National Park · Song Saa Private Island in the Koh Rong archipelago"],
      ["Getting there", "Phnom Penh or Sihanoukville, then road, boat or zipline"],
      ["Best months", "November to April, the dry season (Cardamom Tented Camp, Six Senses); Shinta Mani Wild says there is no bad time"],
      ["Conservation", "Wildlife Alliance rangers patrol the forest (Shinta Mani Wild, Cardamom Tented Camp)"],
    ],
    proof: PROOF,
    months: [
      { area: "The Cardamom camps", note: "Dry November to April; the rains bring waterfalls, orchids and birding (the camps)", months: M("BBBBggggggBB") },
      { area: "Krabey Island", note: "November to April", months: M("BBBBwwwwwwBB") },
    ],
    airports: [["Phnom Penh (PNH)", "About 3.5 hours to Shinta Mani Wild; about two hours to Krabey Island's jetty"], ["Sihanouk (KOS)", "About 2.5 hours to Shinta Mani Wild, three to Cardamom Tented Camp's boat, 10 minutes to Krabey Island's jetty"]],
    transfers: [
      ["Phnom Penh or Sihanoukville → Shinta Mani Wild", "Collected by the camp; about 3.5 hours or 2.5 hours, then the zipline"],
      ["Sihanoukville or Phnom Penh → Cardamom Tented Camp", "About three or five hours to Trapeang Rung, then 45 minutes by boat"],
      ["Phnom Penh → Canvas & Orchids", "About 278 km, then the camp's own boat from its dock before Tatai Bridge"],
      ["Sihanouk airport → Six Senses Krabey Island", "10 minutes to the mainland lounge and jetty, then 15 minutes by speedboat"],
    ],
    highlights: [
      { title: "Arrive by zipline", line: "Shinta Mani Wild", body: "A 400 metre flight over the treetops into camp; then jungle cruises on the camp's pontoon, foraged dinners, and an anti-poaching patrol with the rangers if you want one." },
      { title: "Old poaching trails, walked the other way", line: "Cardamom Tented Camp", body: "Trek former poaching and logging trails, kayak the Preak Tachan, and help set camera traps in Botum Sakor National Park." },
      { title: "A tent on the river", line: "Canvas & Orchids", body: "Thirteen floating tents and five family tents on land on the Tatai River, with fireflies after dark and a local team, some of them former hunters, at the helm." },
      { title: "An island of forty villas", line: "Six Senses Krabey Island", body: "Living roofs, a pool for every villa, a 2,000 sqm spa with a meditation cave, and modern Khmer food at the Tree Restaurant." },
    ],
    suits: [
      { who: "Couples", line: "Everything included, spa and all, for three nights or more.", href: "/stays/shinta-mani-wild", label: "Shinta Mani Wild" },
      { who: "Families who like it wild", line: "Family tents, fireflies and a river.", href: "/stays/canvas-and-orchids-retreat", label: "Canvas & Orchids" },
      { who: "Hikers and wildlife watchers", line: "Treks, kayaks and night boat safaris.", href: "/stays/cardamom-tented-camp", label: "Cardamom Tented Camp" },
      { who: "Rainforest, then the sea", line: "A kids' club for 4 to 12 and a private island.", href: "/stays/six-senses-krabey-island", label: "Six Senses Krabey Island" },
    ],
    howTo: {
      title: "Forest First, Then the Island",
      intro: "The camps and the island share the same airports, so a Cambodian south coast journey can take the forest and the sea in one week.",
      options: [
        { name: "Two islands, the Sweethearts", body: "Finish on Song Saa Private Island, 24 pool villas over the water and in the jungle of the Koh Rong archipelago.", href: "/stays/song-saa-private-island", label: "Song Saa" },
        { name: "Zipline in, speedboat out", body: "Three nights at Shinta Mani Wild, then Six Senses Krabey Island via Sihanoukville.", href: "/stays/shinta-mani-wild", label: "Shinta Mani Wild" },
        { name: "Two rivers", body: "Cardamom Tented Camp's packages of two or three nights, then the floating tents of Canvas & Orchids on the Tatai.", href: "/stays/cardamom-tented-camp", label: "Cardamom Tented Camp" },
        { name: "North to the ibis", body: "Add Siem Pang in the north for the giant ibis and the vultures, via Siem Reap.", href: `${BASE}/siem-pang`, label: "Siem Pang" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("cardamom-mountains"),
    voyageWaters: [],
    faqs: [
      { q: "How do you arrive at Shinta Mani Wild?", a: "The camp collects you in Phnom Penh or Sihanoukville, about 3.5 or 2.5 hours away, and the last stretch is a 400 metre zipline over the treetops into camp." },
      { q: "What is included at Shinta Mani Wild?", a: "Everything: stays of three nights or more include meals, drinks, the activities and every spa treatment you want, with a Bensley Butler as your guide." },
      { q: "When is the best time to visit the Cardamom Mountains?", a: "Cardamom Tented Camp names November to April, the dry season, for wildlife, hiking and river trips; the rains are lush and good for birding. Shinta Mani Wild says there is no bad time: waterfalls and orchids peak in the wet season, river swims and butterflies from November." },
      { q: "How do you get to Six Senses Krabey Island?", a: "From Sihanouk International Airport, 10 minutes by car to the resort's mainland lounge and jetty, then a 15 minute speedboat. From Phnom Penh it is about two hours by motorway." },
      { q: "Do these camps support conservation?", a: "Yes. Shinta Mani Wild and Cardamom Tented Camp support Wildlife Alliance ranger teams who patrol the forest, and Canvas & Orchids employs people from the local villages, among them former hunters, as guides and boat drivers." },
    ],
    geo: { lat: 11.3, lng: 103.3 },
    sources: [src("Shinta Mani Wild"), src("Cardamom Tented Camp"), src("Canvas & Orchids Retreat"), src("Six Senses Krabey Island fact sheet"), src("Six Senses Krabey Island"), src("Song Saa Private Island")],
  },

  "siem-pang": {
    slug: "siem-pang", region: "asia", country: "cambodia", parent: "cambodia", name: "Siem Pang", path: `${BASE}/siem-pang`,
    theme: "stays", stays: ["siempang-forest-lodge"],
    proofEyebrow: "New to the Ledger · 17 November 2026",
    seo: {
      title: "Siem Pang Wildlife Sanctuary: Siempang Forest Lodge, the Giant Ibis and Vultures",
      description: "Siem Pang in northern Cambodia: Siempang Forest Lodge's fifteen safari tents inside a sanctuary co-managed by Rising Phoenix, home to the giant ibis and, the lodge says, Southeast Asia's largest vulture population. How to get there from Siem Reap and when to go.",
      keywords: ["Siempang Forest Lodge", "Siem Pang Wildlife Sanctuary", "giant ibis Cambodia", "Cambodia birding lodge", "Rising Phoenix Cambodia", "vulture restaurant Cambodia", "Stung Treng lodge"],
    },
    eyebrow: EYEBROW,
    h1: "Siem Pang",
    tagline: "Dry forest, savannah and forest pools, and the birds that need them",
    slides: [],
    slidesFromStay: { slug: "siempang-forest-lodge", alt: "Siempang Forest Lodge on its ridge in Siem Pang Wildlife Sanctuary, from the air", credit: "Photograph courtesy of Siempang Forest Lodge" },
    answer: "Siem Pang is a wildlife sanctuary of dry forest and savannah in Stung Treng Province, in Cambodia's far north. Siempang Forest Lodge sets fifteen safari tents on hardwood decks along a 10 hectare ridge inside it, about 5.5 to 6 hours by road from Siem Reap. The sanctuary is co-managed by the conservation group Rising Phoenix with Cambodia's Ministry of Environment, which has stabilised five critically endangered bird species here, the giant ibis, Cambodia's national bird, among them. Days are guided birding, the vulture feeding grounds and forest walks with trackers; ten percent of every booking goes to rangers, vulture feeding and the farmers of the IBIS Rice scheme. October to March brings clear skies and wildlife at the waterholes.",
    facts: [
      ["The stay", "Siempang Forest Lodge: 15 safari tents, Deluxe and Suite"],
      ["Where", "Western Siem Pang Wildlife Sanctuary, Stung Treng Province"],
      ["Getting there", "About 5.5 to 6 hours by road from Siem Reap; about 3.5 from Pakse, Laos"],
      ["Best months", "October to March for waterholes; August and September for vultures (the lodge)"],
      ["Conservation", "Rising Phoenix, under a 30 year co-management agreement with the Ministry of Environment"],
      ["Your stay", "Ten percent of each booking goes to rangers, vulture feeding and IBIS Rice farmers"],
    ],
    proof: "Filed from Siempang Forest Lodge's own pages on the day it joined the Ledger. Its Ledger ID is STY-2026-000665.",
    months: [
      { area: "Waterholes, Eld's deer and ibises", note: "October to March (the lodge)", months: M("BBBgggggggBB") },
      { area: "Vultures and greater adjutant storks", note: "August and September at the feeding sites (the lodge)", months: M("gggggggBBggg") },
      { area: "Orchids and storms", note: "April to June (the lodge)", months: M("gggBBBgggggg") },
    ],
    airports: [["Siem Reap", "About 5.5 to 6 hours by road via NR 64; the lodge's packages include the transfer"], ["Pakse, Laos", "About 3.5 hours by road"]],
    transfers: [["Siem Reap → Siempang Forest Lodge", "About 5.5 to 6 hours via NR 64, included in the International Explorer packages"], ["Phnom Penh → Siempang Forest Lodge", "A longer road journey with a Mekong ferry crossing; the house confirms the time with the lodge"]],
    highlights: [
      { title: "The giant ibis", line: "Cambodia's national bird", body: "One of five critically endangered birds Rising Phoenix has stabilised in the sanctuary, looked for with the lodge's expert local guides." },
      { title: "The vulture feeding grounds", line: "August and September", body: "Vultures and greater adjutant storks gather at the feeding sites the lodge's bookings help pay for." },
      { title: "Forest pools brought back", line: "Trapeangs", body: "Rising Phoenix has restored more than 60 ephemeral forest pools, the trapeangs, that the dry forest's wildlife depends on." },
      { title: "Fifteen tents among the trunks", line: "The lodge", body: "Each tent on its own hardwood deck, built around the standing trees; the Suite Tent is reached by boardwalk and looks over the meadow." },
    ],
    suits: [
      { who: "Birders", line: "The giant ibis and five critically endangered species.", href: "/stays/siempang-forest-lodge", label: "Siempang Forest Lodge" },
      { who: "Wildlife photographers", line: "Waterholes in the dry season, storms from April.", href: "/stays/siempang-forest-lodge", label: "When to go" },
      { who: "Angkor, then the wild", line: "Siem Reap is the gateway.", href: "/stays/siempang-forest-lodge", label: "Siempang" },
    ],
    howTo: {
      title: "From the Temples to the Forest",
      intro: "Siem Reap is the gateway, so Siem Pang follows Angkor naturally. The lodge's packages include the transfer.",
      options: [
        { name: "Siem Reap, then Siem Pang", body: "The temples first, then about six hours north by road to the sanctuary.", href: "/stays/siempang-forest-lodge", label: "Siempang Forest Lodge" },
        { name: "The forest and the sea", body: "Siem Pang in the north, then the Cardamom camps and Krabey Island in the south west.", href: `${BASE}/cardamom-mountains`, label: "The Cardamom Mountains" },
      ],
    },
    onwardEyebrow: ONWARD_EYEBROW,
    onward: ONWARD("siem-pang"),
    voyageWaters: [],
    faqs: [
      { q: "Where is Siempang Forest Lodge?", a: "On a 10 hectare ridge inside Western Siem Pang Wildlife Sanctuary in Stung Treng Province, northern Cambodia, overlooking dry forest and savannah." },
      { q: "How do you get to Siem Pang?", a: "About 5.5 to 6 hours by road from Siem Reap via NR 64, included in the lodge's International Explorer packages. Pakse in Laos is about 3.5 hours away." },
      { q: "When is the best time to visit Siem Pang?", a: "October to March for clear skies and wildlife at the waterholes, April to June for orchids and storms, and August and September for vultures and greater adjutant storks, the lodge says." },
      { q: "How does a stay support conservation?", a: "Ten percent of each booking goes to ranger patrols, premiums for rice farmers in the ibis conservation programme, vulture feeding and new community jobs." },
    ],
    geo: { lat: 14.1, lng: 106.4 },
    sources: [src("Siempang Forest Lodge"), src("Siempang Forest Lodge: conservation"), src("Siempang Forest Lodge: FAQs")],
  },
};
