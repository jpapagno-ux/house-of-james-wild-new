import type { Guide } from "./guides";

// French Polynesia (Tahiti) place guides (James, 2 Nov 2026): Taha'a, Bora Bora, the Tuamotu atolls and the
// Marquesas, inside the French Polynesia (Tahiti) country page. Facts only from Tahiti Tourisme, Air Tahiti,
// UNESCO and MAB France (the national biosphere committee), as filed in the French Polynesia review; stays from
// their brands. No dashes in the copy. Heroes borrow each place's selected stay frames, credited, until the house
// files its own landscape photography (IMAGE FOLLOW-UP).

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/oceania/tahiti";
const TT = { title: "Tahiti Tourisme: when to visit the islands of Tahiti", url: "https://www.tahititourisme.com/preparing-you-trip/when-to-visit-the-islands-of-tahiti/" };
const TT_HOP = { title: "Tahiti Tourisme: getting from island to island", url: "https://www.tahititourisme.com/preparing-you-trip/getting-from-island-to-island/" };
const AT_SOC = { title: "Air Tahiti: the Society Islands", url: "https://www.airtahiti.com/en/archipel-de-la-societe" };
const AT_TUA = { title: "Air Tahiti: the Tuamotu", url: "https://www.airtahiti.com/en/archipel-des-tuamotu" };
const AT_MAR = { title: "Air Tahiti: the Marquesas", url: "https://www.airtahiti.com/en/archipel-des-marquises" };
const AT_PASS = { title: "Air Tahiti: island passes", url: "https://www.airtahiti.com/en/airpass-fares" };
const ONWARD = [
  { name: "French Polynesia (Tahiti)", href: BASE, line: "The lagoon atlas, the island-hopping routes and every stay" },
  { name: "Pearl Resorts of Tahiti", href: "/partners/pearl-resorts", line: "Every Pearl resort, founder vetted, and the Islands Dream Offer" },
];
const SOCIETY_MONTHS = [{ area: "Lagoon outings", note: "Dry season May to October; snorkelling good all year (Tahiti Tourisme)", months: M("ggggBBBBBBgg") }];

export const TAHITI_GUIDES: Record<string, Guide> = {
  tahaa: {
    slug: "tahaa", region: "oceania", country: "tahiti", parent: "tahiti", name: "Taha'a", path: `${BASE}/tahaa`,
    theme: "sea", stays: ["le-tahaa", "pearl-resort-vahine-private-island"],
    proofEyebrow: "The founder's favourite island in French Polynesia",
    seo: {
      title: "Taha'a Travel Guide: The Vanilla Island, Coral Garden and Where to Stay",
      description: "Taha'a, French Polynesia: no airport, one lagoon shared with Raiatea, the Coral Garden, and James Wild's favourite island. How to get there, when to go, Le Taha'a and Vahine Private Island.",
      keywords: ["Taha'a travel guide", "how to get to Taha'a", "Taha'a coral garden", "Le Taha'a", "Vahine Private Island", "Taha'a vanilla island"],
    },
    eyebrow: "Destinations · Oceania · French Polynesia (Tahiti)",
    h1: "Taha'a",
    tagline: "One lagoon with Raiatea, a coral garden between two motu, and no airport at all",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-vahine-private-island", alt: "Vahine Private Island on its motu in the Taha'a lagoon", credit: "Photograph courtesy of Vahine Private Island, Pearl Resorts of Tahiti" },
    answer: "Taha'a is a Society Island that shares one lagoon with Raiatea, and it has no airport: you fly to Raiatea with Air Tahiti, 40 to 45 minutes from Tahiti or direct from Bora Bora, then cross the lagoon by boat in about 30 minutes, usually with your hotel. Its Coral Garden, between two motu on the west coast, is one of Tahiti Tourisme's natural heritage sites. Lagoon outings are best in the dry season, May to October. Taha'a is James Wild's favourite island in French Polynesia; the house files Le Taha'a, a founder favourite, and Vahine Private Island, whose Royal Villa is in The Exceptional Few.",
    facts: [
      ["Where", "The Society Islands, inside the lagoon it shares with Raiatea"],
      ["Airport", "None: fly to Raiatea (RFP), then about 30 minutes by boat"],
      ["From Tahiti", "Air Tahiti to Raiatea, 40 to 45 minutes; direct from Bora Bora too"],
      ["Best time", "May to October for the lagoon; snorkelling all year"],
      ["Natural heritage", "The Coral Garden (Jardin de Corail), on the west coast"],
      ["Nearby UNESCO", "Taputapuātea on Raiatea, inscribed 2017"],
      ["In the Ledger", "Le Taha'a (founder favourite) · Vahine Private Island (vetted 2025; The Exceptional Few)"],
    ],
    proof: "Taha'a is James's favourite island in French Polynesia, and Tahiti is his favourite of all. He vetted Vahine Private Island here in 2025, has sailed Windstar to Taha'a with his wife, and every Pearl resort on the lagoon is founder vetted.",
    months: SOCIETY_MONTHS,
    airports: [["Raiatea (RFP)", "The airport for Taha'a; Air Tahiti from Tahiti and from Bora Bora"], ["Tahiti Faa'a (PPT)", "Every international flight lands here"]],
    transfers: [["Tahiti → Raiatea", "40 to 45 minutes by air (Air Tahiti)"], ["Raiatea → Taha'a", "About 30 minutes by boat, usually arranged by your hotel (Tahiti Tourisme)"], ["Bora Bora → Raiatea", "Direct by air (Air Tahiti)"]],
    highlights: [
      { title: "The Coral Garden", line: "Snorkel", body: "Shallow, clear water between two motu on the west coast, where you drift with the current over the coral (Tahiti Tourisme)." },
      { title: "One lagoon, two islands", line: "Raiatea", body: "Taha'a and Raiatea share a lagoon, so the crossing between them is a short boat ride." },
      { title: "Taputapuātea", line: "UNESCO 2017", body: "The marae of Taputapuātea on Raiatea is a World Heritage cultural landscape, inscribed in 2017." },
      { title: "A private motu", line: "The Exceptional Few", body: "Vahine's Ari'i Vahine Royal Villa: 12,669 sq ft on its own motu, for up to 14." },
    ],
    suits: [
      { who: "Couples", line: "Overwater suites over the Coral Garden at Le Taha'a.", href: "/stays/le-tahaa", label: "Le Taha'a" },
      { who: "Families and groups", line: "The whole Royal Villa on its own motu, for up to 14.", href: "/stays/pearl-resort-vahine-private-island", label: "Vahine Private Island" },
      { who: "Sailors", line: "Wind Star calls at Raiatea every week from March 2027.", href: "/voyages/ships/wind-star", label: "Wind Star" },
    ],
    howTo: {
      title: "How to See Taha'a",
      intro: "Fly to Raiatea, cross the lagoon, and let the boat set the pace.",
      options: [
        { name: "Stay on a motu", body: "Le Taha'a on Motu Tautau, beside the Coral Garden, or Vahine on Motu Tuvahine.", href: "/stays/le-tahaa", label: "Le Taha'a" },
        { name: "Pair it with Bora Bora", body: "Air Tahiti flies Raiatea to Bora Bora direct, and Pearl's Islands Dream Offer takes 25% off when you pair Le Taha'a with Le Bora Bora.", href: `${BASE}#island-hopping`, label: "The island-hopping routes" },
        { name: "Arrive by sail", body: "From March 2027, Wind Star's Dreams of Tahiti calls at Raiatea every week.", href: "/voyages/ships/wind-star", label: "Wind Star" },
      ],
    },
    onwardEyebrow: "Continue through French Polynesia",
    onward: ONWARD,
    voyageWaters: [],
    faqs: [
      { q: "Does Taha'a have an airport?", a: "No. Fly to Raiatea with Air Tahiti, 40 to 45 minutes from Tahiti or direct from Bora Bora, then cross the shared lagoon by boat in about 30 minutes, usually arranged by your hotel." },
      { q: "When is the best time to visit Taha'a?", a: "May to October, the dry season, is best for lagoon outings, per Tahiti Tourisme; snorkelling is good all year." },
      { q: "What is the Taha'a Coral Garden?", a: "A shallow, clear channel between two motu on Taha'a's west coast, where you drift with the current over the coral. Tahiti Tourisme lists it as natural heritage." },
      { q: "Where should I stay on Taha'a?", a: "Le Taha'a by Pearl Resorts on Motu Tautau, a founder favourite with the Coral Garden at the door, or Vahine Private Island, nine bungalows and a Royal Villa on its own motu." },
      { q: "Can I combine Taha'a and Bora Bora?", a: "Yes. Air Tahiti flies Raiatea to Bora Bora direct, and Pearl's Islands Dream Offer takes 25% off accommodation when you pair Le Taha'a with Le Bora Bora." },
      { q: "What is near Taha'a?", a: "Raiatea, across the lagoon, with Taputapuātea, a UNESCO World Heritage site inscribed in 2017." },
    ],
    geo: { lat: -16.62, lng: -151.5 },
    sources: [TT, TT_HOP, AT_SOC, { title: "Tahiti Tourisme: the Coral Garden, Taha'a", url: "https://www.tahititourisme.com/natural-heritage/jardin-de-corail/" }, { title: "Tahiti Tourisme: getting to Taha'a", url: "https://www.tahititourisme.com/islands/tahaa/getting-there-and-getting-around-in-tahaa/" }, { title: "UNESCO World Heritage Centre: Taputapuātea", url: "https://whc.unesco.org/en/list/1529/" }],
  },
  "bora-bora": {
    slug: "bora-bora", region: "oceania", country: "tahiti", parent: "tahiti", name: "Bora Bora", path: `${BASE}/bora-bora`,
    theme: "sea", stays: ["pearl-resort-le-bora-bora", "the-st-regis-bora-bora-resort", "conrad-bora-bora-nui"],
    proofEyebrow: "Founder vetted · Pearl Resorts",
    seo: {
      title: "Bora Bora Travel Guide: When to Go, Getting There and Where to Stay",
      description: "Bora Bora, French Polynesia: 50 minutes from Tahiti with Air Tahiti, direct flights to Taha'a's Raiatea and the Tuamotu atolls, the best months, and the overwater resorts the house files.",
      keywords: ["Bora Bora travel guide", "best time to visit Bora Bora", "how to get to Bora Bora", "Bora Bora overwater bungalow", "Le Bora Bora", "St. Regis Bora Bora", "Conrad Bora Bora Nui"],
    },
    eyebrow: "Destinations · Oceania · French Polynesia (Tahiti)",
    h1: "Bora Bora",
    tagline: "Mount Otemanu in a ring of motu, and the hub that flies straight to the atolls",
    slides: [],
    slidesFromStay: { slug: "conrad-bora-bora-nui", alt: "Conrad Bora Bora Nui on its motu in the Bora Bora lagoon", credit: "Photograph courtesy of Conrad Bora Bora Nui" },
    answer: "Bora Bora is a Society Island, Mount Otemanu inside a lagoon ringed by motu, 50 minutes from Tahiti with Air Tahiti on more than 10 flights a day. Its airport is a hub in its own right: Air Tahiti flies Bora Bora direct to Raiatea for Taha'a, to Huahine, Maupiti and Moorea, and to the Tuamotu atolls of Rangiroa, Tikehau and Fakarava. The dry season, May to October, is best for the lagoon, and whales pass from about July to November. The house files Le Bora Bora by Pearl Resorts, founder vetted, The St. Regis Bora Bora and Conrad Bora Bora Nui.",
    facts: [
      ["Where", "The Society Islands, about 50 minutes by air from Tahiti"],
      ["Fly into", "Bora Bora (BOB), on a motu; resorts send boats"],
      ["Direct flights", "Tahiti, Raiatea, Huahine, Maupiti, Moorea, Rangiroa, Tikehau, Fakarava (Air Tahiti)"],
      ["Best time", "May to October for the lagoon; whales about July to November (Tahiti Tourisme)"],
      ["In the Ledger", "Le Bora Bora (founder vetted) · The St. Regis Bora Bora · Conrad Bora Bora Nui"],
    ],
    proof: "Every Pearl resort is founder vetted by James, Le Bora Bora included, and the St. Regis and Conrad are vetted by the house's partners. James's own favourite in these islands is Taha'a, a short direct flight away.",
    months: [...SOCIETY_MONTHS, { area: "Whales", note: "Humpbacks pass the Society Islands from about July to November (Tahiti Tourisme)", months: M("ggggggBBBBBg") }],
    airports: [["Bora Bora (BOB)", "On Motu Mute; resorts meet you by boat"], ["Tahiti Faa'a (PPT)", "50 minutes away, more than 10 flights a day"]],
    transfers: [["Tahiti → Bora Bora", "50 minutes by air (Air Tahiti)"], ["Airport → The St. Regis", "About 20 minutes by boat (the resort)"], ["Bora Bora → Tikehau, Rangiroa, Fakarava", "Direct by air (Air Tahiti)"]],
    highlights: [
      { title: "The hub to the atolls", line: "Air Tahiti", body: "Direct flights to Rangiroa, Tikehau and Fakarava mean a lagoon week can roll into the Tuamotu without going back through Tahiti." },
      { title: "Pool villas over the lagoon", line: "Le Bora Bora", body: "The End of Pontoon Overwater Suite with Pool is 1,830 sq ft, per Le Bora Bora." },
      { title: "A private lagoonarium", line: "The St. Regis", body: "Snorkelling pontoons in the resort's own underwater sanctuary." },
      { title: "Whale season", line: "July to November", body: "Tahiti Tourisme puts humpbacks in the Society Islands from about July to November." },
    ],
    suits: [
      { who: "Honeymooners", line: "Overwater suites with their own pools facing Mount Otemanu.", href: "/stays/pearl-resort-le-bora-bora", label: "Le Bora Bora" },
      { who: "Families", line: "A kids' club and beach villas with pools.", href: "/stays/the-st-regis-bora-bora-resort", label: "The St. Regis Bora Bora" },
      { who: "Island hoppers", line: "Direct flights to Taha'a's Raiatea and the atolls.", href: `${BASE}#island-hopping`, label: "The routes" },
    ],
    howTo: {
      title: "How to See Bora Bora",
      intro: "Fly in, take the boat to your motu, and use the airport as a door to the rest of the islands.",
      options: [
        { name: "Bora Bora and Taha'a", body: "Fly Raiatea to Bora Bora direct; pair Le Bora Bora with Le Taha'a and the Islands Dream Offer takes 25% off.", href: `${BASE}#island-hopping`, label: "Tahiti, Taha'a, Bora Bora" },
        { name: "Lagoon to atoll", body: "Bora Bora, then Tikehau direct with Air Tahiti, to Le Tikehau.", href: `${BASE}/tuamotu`, label: "The Tuamotu" },
      ],
    },
    onwardEyebrow: "Continue through French Polynesia",
    onward: [...ONWARD, { name: "Taha'a", href: `${BASE}/tahaa`, line: "James's favourite island, a direct flight away" }],
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Bora Bora?", a: "Fly from Tahiti Faa'a with Air Tahiti in 50 minutes, on more than 10 flights a day. The airport is on a motu; resorts meet you by boat." },
      { q: "When is the best time to visit Bora Bora?", a: "May to October, the dry season, is best for the lagoon, per Tahiti Tourisme; humpback whales pass from about July to November." },
      { q: "Can you fly from Bora Bora to the Tuamotu?", a: "Yes. Air Tahiti flies Bora Bora direct to Rangiroa, Tikehau and Fakarava." },
      { q: "Which Bora Bora resorts does the house file?", a: "Le Bora Bora by Pearl Resorts (founder vetted), The St. Regis Bora Bora Resort and Conrad Bora Bora Nui." },
      { q: "How long is the boat to The St. Regis Bora Bora?", a: "About 20 minutes from the airport, per the resort." },
      { q: "Is there an offer for combining Bora Bora with another island?", a: "Pearl's Islands Dream Offer takes 25% off accommodation when you book Le Bora Bora with Le Taha'a, Le Tikehau, Le Tahiti or Le Nuku Hiva. Pearl lists it as available all year." },
    ],
    geo: { lat: -16.5, lng: -151.74 },
    sources: [TT, TT_HOP, AT_SOC],
  },
  tuamotu: {
    slug: "tuamotu", region: "oceania", country: "tahiti", parent: "tahiti", name: "The Tuamotu", path: `${BASE}/tuamotu`,
    theme: "sea", stays: ["pearl-resort-le-tikehau"],
    proofEyebrow: "Founder vetted · sailed with Windstar",
    seo: {
      title: "Tuamotu Guide: Rangiroa, Fakarava and Tikehau, Dive Passes and Flights",
      description: "The Tuamotu, French Polynesia: the largest chain of atolls in the world. Rangiroa's Tiputa Pass, Fakarava's UNESCO biosphere reserve and grey shark wall, Tikehau, flights and the best months.",
      keywords: ["Tuamotu travel guide", "Rangiroa Tiputa Pass", "Fakarava biosphere reserve", "Fakarava grey sharks", "Tikehau", "Le Tikehau", "Tuamotu diving"],
    },
    eyebrow: "Destinations · Oceania · French Polynesia (Tahiti)",
    h1: "The Tuamotu",
    tagline: "Seventy six atolls, three famous passes, and water warm enough all year",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-le-tikehau", alt: "Le Tikehau's overwater bungalows on Tikehau atoll, Tuamotu", credit: "Photograph courtesy of Le Tikehau, Pearl Resorts of Tahiti" },
    answer: "The Tuamotu are the largest chain of atolls in the world, 76 of them, north east of Tahiti. Air Tahiti flies to Rangiroa in about an hour and to Fakarava in 1 hour 10 minutes, and flies Bora Bora direct to Rangiroa, Tikehau and Fakarava; its TUAMOTU pass covers two or three of the three. Diving is good all year, with the warmest water from November to April. Rangiroa's Tiputa Pass brings dolphins, sharks and mantas; Fakarava and six neighbouring atolls form a UNESCO biosphere reserve, and over 700 grey sharks gather by its south pass in June and July. The house files Le Tikehau by Pearl Resorts.",
    facts: [
      ["What", "The largest chain of atolls in the world: 76 atolls (Tahiti Tourisme)"],
      ["Fly", "Rangiroa about 1 hour, Fakarava 1h10 from Tahiti; direct from Bora Bora to all three (Air Tahiti)"],
      ["Pass", "Air Tahiti's TUAMOTU pass: two or three of Rangiroa, Tikehau and Fakarava"],
      ["Best time", "All year; warmest water November to April; grouper spawning at Fakarava in June"],
      ["UNESCO", "Commune of Fakarava Biosphere Reserve: 7 atolls, 19,867 sq km; created 1977, renewed 2006 and 2017 (MAB France)"],
      ["In the Ledger", "Le Tikehau (founder vetted)"],
    ],
    proof: "James has sailed these atolls with Windstar, calling at Fakarava and Rangiroa with his wife, and every Pearl resort, Le Tikehau included, is founder vetted.",
    months: [{ area: "Diving", note: "All year; warmest water November to April (Tahiti Tourisme)", months: M("BBBBggggggBB") }, { area: "Fakarava grey sharks", note: "Over 700 grey sharks by Tumakohua Pass in June and July (Tahiti Tourisme)", months: M("gggggBBggggg") }],
    airports: [["Rangiroa (RGI)", "About 1 hour from Tahiti"], ["Fakarava (FAV)", "1h10 from Tahiti, 375 km"], ["Tikehau (TIH)", "308 km from Tahiti; direct from Bora Bora"]],
    transfers: [["Tahiti → Rangiroa", "About 1 hour by air"], ["Tahiti → Fakarava", "1h10 by air"], ["Tikehau village → Le Tikehau", "15 minutes by boat (the resort)"]],
    highlights: [
      { title: "Tiputa Pass, Rangiroa", line: "Dive", body: "Dolphins, sharks and mantas in the pass, 12 to 46 m (Tahiti Tourisme)." },
      { title: "The grey shark wall", line: "Fakarava", body: "Over 700 grey sharks near Tumakohua Pass in June and July; 12 and over, level 1 (Tahiti Tourisme)." },
      { title: "A biosphere reserve", line: "UNESCO", body: "Fakarava and six neighbouring atolls, 19,867 sq km; Fakarava's pass is 1,600 m wide, the largest in French Polynesia (MAB France)." },
      { title: "Pink sand", line: "Tikehau", body: "Le Tikehau sits on motu Tianoa, a pink sand motu 15 minutes by boat from the village." },
    ],
    suits: [
      { who: "Divers", line: "Tiputa Pass and the Fakarava passes, all year.", href: `${BASE}#lagoons`, label: "The lagoon atlas" },
      { who: "Couples", line: "Twenty nine bungalows on a pink sand motu.", href: "/stays/pearl-resort-le-tikehau", label: "Le Tikehau" },
    ],
    howTo: {
      title: "How to See the Tuamotu",
      intro: "Fly from Tahiti or straight from Bora Bora; the TUAMOTU pass strings two or three atolls together.",
      options: [
        { name: "The Tuamotu passes", body: "Rangiroa, Fakarava and Tikehau on one trip, on Air Tahiti's TUAMOTU pass.", href: `${BASE}#island-hopping`, label: "The route" },
        { name: "By small ship", body: "Star Breeze sails longer Windstar voyages to the Tuamotu.", href: "/voyages/ships/star-breeze", label: "Star Breeze" },
      ],
    },
    onwardEyebrow: "Continue through French Polynesia",
    onward: ONWARD,
    voyageWaters: [],
    faqs: [
      { q: "How many atolls are in the Tuamotu?", a: "Seventy six: the largest chain of atolls in the world, per Tahiti Tourisme." },
      { q: "How do you get to Rangiroa and Fakarava?", a: "Air Tahiti flies Tahiti to Rangiroa in about an hour and to Fakarava in 1 hour 10 minutes, and flies Bora Bora direct to Rangiroa, Tikehau and Fakarava." },
      { q: "When is the best time to dive the Tuamotu?", a: "All year, per Tahiti Tourisme, with the warmest water from November to April. Over 700 grey sharks gather near Fakarava's Tumakohua Pass in June and July." },
      { q: "Is Fakarava a UNESCO site?", a: "Fakarava and six neighbouring atolls form the Commune of Fakarava Biosphere Reserve under UNESCO's Man and the Biosphere programme: 19,867 sq km, created 1977, renewed 2006 and 2017." },
      { q: "What is Tiputa Pass?", a: "The famous pass on Rangiroa's north rim, with dolphins, sharks and mantas at 12 to 46 m, per Tahiti Tourisme." },
      { q: "Is there an Air Tahiti pass for the Tuamotu?", a: "Yes: the TUAMOTU pass covers two or three of Rangiroa, Tikehau and Fakarava, as a closed circuit from Tahiti." },
    ],
    geo: { lat: -15.5, lng: -146.8 },
    sources: [TT, AT_TUA, AT_PASS, { title: "Tahiti Tourisme: Tiputa Pass", url: "https://www.tahititourisme.com/natural-heritage/passe-de-tiputa/" }, { title: "Tahiti Tourisme: le Mur de Requins Gris", url: "https://www.tahititourisme.com/natural-heritage/le-mur-de-requins-gris/" }, { title: "MAB France: Commune of Fakarava Biosphere Reserve", url: "https://www.mab-france.org/en/biosphere-reserve/commune-of-fakarava/" }],
  },
  marquesas: {
    slug: "marquesas", region: "oceania", country: "tahiti", parent: "tahiti", name: "The Marquesas", path: `${BASE}/marquesas`,
    theme: "sea", stays: ["pearl-resort-le-nuku-hiva"],
    proofEyebrow: "Founder vetted · Pearl Resorts",
    seo: {
      title: "Marquesas Islands Guide: UNESCO Te Henua Enata, Flights and Nuku Hiva",
      description: "The Marquesas, French Polynesia: Te Henua Enata, a UNESCO World Heritage property since 2024. Air Tahiti flights, the MARQUESAS pass, the time difference, and Le Nuku Hiva by Pearl Resorts.",
      keywords: ["Marquesas Islands guide", "Te Henua Enata UNESCO", "how to get to Nuku Hiva", "Hiva Oa", "Le Nuku Hiva", "Marquesas travel"],
    },
    eyebrow: "Destinations · Oceania · French Polynesia (Tahiti)",
    h1: "The Marquesas",
    tagline: "Te Henua Enata, the Land of Men: a World Heritage property since 2024",
    slides: [],
    slidesFromStay: { slug: "pearl-resort-le-nuku-hiva", alt: "Le Nuku Hiva above Taiohae Bay, Marquesas", credit: "Photograph courtesy of Le Nuku Hiva, Pearl Resorts of Tahiti" },
    answer: "The Marquesas, Te Henua Enata or the Land of Men, are French Polynesia's most northerly islands, inscribed on the World Heritage List in 2024 as a mixed property. Air Tahiti flies from Tahiti several times a week, direct or with stops: Nuku Hiva is about 1,406 km away and Hiva Oa about 1,184 km, and the MARQUESAS pass covers both. The islands are half an hour behind Tahiti, and Tahiti Tourisme names no best season: hiking, culture and archaeology run all year. The house files Le Nuku Hiva by Pearl Resorts, founder vetted.",
    facts: [
      ["What", "Te Henua Enata, The Marquesas Islands: UNESCO mixed World Heritage property, 2024"],
      ["Fly", "Air Tahiti from Tahiti several times a week, direct or with stops"],
      ["Distance", "Nuku Hiva about 1,406 km, Hiva Oa about 1,184 km from Tahiti (Air Tahiti)"],
      ["Time", "Half an hour behind Tahiti"],
      ["Best time", "All year (Tahiti Tourisme names no best season)"],
      ["In the Ledger", "Le Nuku Hiva (founder vetted); Hanakee on Hiva Oa to follow"],
    ],
    proof: "Every Pearl resort is founder vetted by James, Le Nuku Hiva and Hanakee included.",
    months: [{ area: "Hiking and culture", note: "Year round; Tahiti Tourisme names no best months", months: M("gggggggggggg") }],
    airports: [["Nuku Hiva (NHV)", "Air Tahiti from Tahiti, about 1,406 km"], ["Hiva Oa (AUQ)", "Air Tahiti from Tahiti, about 1,184 km"]],
    transfers: [["Tahiti → Nuku Hiva", "Several flights a week, direct or with stops (Air Tahiti)"]],
    highlights: [
      { title: "Te Henua Enata", line: "UNESCO 2024", body: "Seven components across the islands, from Nuku Hiva and Ua Pou to Fatu Iva and the uninhabited Eiao and Hatu Tu, as UNESCO maps them." },
      { title: "Taiohae Bay", line: "Nuku Hiva", body: "Le Nuku Hiva's twenty bungalows sit on a hillside above the bay, a short walk from a black sand beach." },
    ],
    suits: [
      { who: "Travellers for culture and hiking", line: "Valleys, archaeology and crafts, all year.", href: "/stays/pearl-resort-le-nuku-hiva", label: "Le Nuku Hiva" },
      { who: "Long-voyage sailors", line: "Star Breeze reaches the Marquesas on longer Windstar voyages.", href: "/voyages/ships/star-breeze", label: "Star Breeze" },
    ],
    howTo: {
      title: "How to See the Marquesas",
      intro: "Fly from Tahiti, base yourself on Nuku Hiva, and add Hiva Oa on the MARQUESAS pass.",
      options: [
        { name: "Fly and stay", body: "Le Nuku Hiva above Taiohae Bay, with the MARQUESAS pass for Hiva Oa.", href: `${BASE}#island-hopping`, label: "The Marquesas route" },
        { name: "By small ship", body: "Star Breeze sails longer Windstar voyages that reach the Marquesas.", href: "/voyages/ships/star-breeze", label: "Star Breeze" },
      ],
    },
    onwardEyebrow: "Continue through French Polynesia",
    onward: ONWARD,
    voyageWaters: [],
    faqs: [
      { q: "Are the Marquesas a UNESCO World Heritage site?", a: "Yes. Te Henua Enata, The Marquesas Islands, was inscribed in 2024 as a mixed property with seven components." },
      { q: "How do you get to the Marquesas?", a: "Air Tahiti flies from Tahiti several times a week, direct or with stops. Nuku Hiva is about 1,406 km from Tahiti and Hiva Oa about 1,184 km; the MARQUESAS pass covers both." },
      { q: "What is the time difference in the Marquesas?", a: "The Marquesas are half an hour behind Tahiti, per Air Tahiti." },
      { q: "When should you go to the Marquesas?", a: "Any time: Tahiti Tourisme lists hiking, culture, archaeology and crafts in the Marquesas as year round." },
      { q: "Where should you stay on Nuku Hiva?", a: "Le Nuku Hiva by Pearl Resorts: twenty bungalows above Taiohae Bay, Relais & Châteaux, founder vetted." },
    ],
    geo: { lat: -9.4, lng: -139.9 },
    sources: [TT, AT_MAR, AT_PASS, { title: "UNESCO World Heritage Centre: Te Henua Enata, The Marquesas Islands", url: "https://whc.unesco.org/en/list/1707/" }],
  },
};
