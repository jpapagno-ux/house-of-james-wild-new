import type { Guide } from "./guides";

// New Zealand place guides (James, 15 Nov 2026): Taupō and Northland from the stays already in the Ledger (Huka Lodge,
// Tahi), facts only from each lodge's own library record; no outbound links. Central Otago (The Lindis) and Queenstown
// (Lodge Lorien) follow once those two library records are filled from their own sites (flagged in Stay Studio).

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/oceania/new-zealand";
const EYEBROW = "Destinations · Oceania · New Zealand";
const ONWARD = (except: string) => [
  { name: "Taupō", href: `${BASE}/taupo`, line: "Huka Lodge on the Waikato River" },
  { name: "Northland", href: `${BASE}/northland`, line: "Tahi's beaches, wetlands and dune forest" },
  { name: "New Zealand", href: BASE, line: "Every New Zealand stay in the Ledger" },
].filter((o) => !o.href.endsWith(`/${except}`));

export const NEW_ZEALAND_GUIDES: Record<string, Guide> = {
  taupo: {
    slug: "taupo", region: "oceania", country: "new-zealand", parent: "new-zealand", name: "Taupō", path: `${BASE}/taupo`,
    theme: "stays", stays: ["beckon-huka-lodge"],
    proofEyebrow: "On the river · the house's Taupō file",
    seo: {
      title: "Taupō Luxury Lodge: Huka Lodge, Huka Falls and Fly Fishing",
      description: "Taupō in New Zealand's North Island: Huka Lodge on the Waikato River, Huka Falls, fly fishing, lakes and geothermal parks. How to get there from Auckland and when to go.",
      keywords: ["Huka Lodge", "Taupō luxury lodge", "Huka Falls", "Taupō fly fishing", "North Island luxury lodge", "Lake Taupō"],
    },
    eyebrow: EYEBROW,
    h1: "Taupō",
    tagline: "A lodge on the Waikato River, a short walk from Huka Falls",
    slides: [],
    slidesFromStay: { slug: "beckon-huka-lodge", alt: "Huka Lodge on the banks of the Waikato River", credit: "Photograph courtesy of Huka Lodge" },
    answer: "In Taupō, the house stays at Huka Lodge, on the Waikato River with seventeen acres of gardens and easy access to Huka Falls. It is about 15 km, 15 to 20 minutes, from Taupō Airport; most international guests arrive through Auckland and connect by domestic flight or private transfer. Days are fly fishing, the river, Taupō's lakes, geothermal parks and native forest. November to April is the lodge's best season.",
    facts: [
      ["The stay", "Huka Lodge: lodge suites, the Owner's Cottage, the Alan Pye Cottage and private residences"],
      ["Getting there", "Taupō Airport (TUO), 15 to 20 minutes; Auckland (AKL) for international flights"],
      ["Best months", "November to April, late spring to autumn"],
      ["Days", "Huka Falls, fly fishing, the river, lakes and geothermal parks"],
    ],
    proof: "Huka Lodge is in the Ledger with its own ID.",
    months: [{ area: "Fishing, gardens and the lakes", note: "Late spring to autumn, November to April (Huka Lodge)", months: M("BBBBggggggBB") }],
    airports: [["Taupō Airport (TUO)", "About 15 km from the lodge"], ["Auckland (AKL)", "The international gateway"]],
    transfers: [["Taupō Airport → Huka Lodge", "15 to 20 minutes by private vehicle"], ["Auckland → Taupō", "Domestic flight or private transfer"]],
    highlights: [
      { title: "Huka Falls", line: "On the Waikato", body: "The lodge sits on the river with easy access to the falls." },
      { title: "Fly fishing", line: "Late spring to autumn", body: "The lodge's best season for fishing runs November to April." },
      { title: "Private cottages", line: "For exclusive stays", body: "The Owner's Cottage and the Alan Pye Cottage, apart from the lodge." },
    ],
    suits: [{ who: "Anglers and couples", line: "A river lodge with its own cottages.", href: "/stays/beckon-huka-lodge", label: "Huka Lodge" }],
    howTo: { title: "Taupō in a Journey", intro: "Two or three nights on the river, between Auckland and the rest of the North Island. The house books the flights and transfers.", options: [
      { name: "Taupō and Northland", body: "Huka Lodge, then north past Auckland to Tahi's beaches and wetlands.", href: `${BASE}/northland`, label: "Northland" },
    ] },
    onwardEyebrow: "Continue through New Zealand",
    onward: ONWARD("taupo"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Huka Lodge?", a: "Fly to Taupō Airport, 15 to 20 minutes from the lodge. International visitors usually arrive in Auckland and connect by domestic flight or private transfer." },
      { q: "When is the best time to visit Taupō?", a: "November to April, the lodge says: warm days, fly fishing, the gardens in flower, and good weather for the lakes and geothermal parks." },
    ],
    geo: { lat: -38.6427, lng: 176.0945 },
    sources: [{ title: "Huka Lodge", url: "https://www.hukalodge.co.nz/" }],
  },

  northland: {
    slug: "northland", region: "oceania", country: "new-zealand", parent: "new-zealand", name: "Northland", path: `${BASE}/northland`,
    theme: "stays", stays: ["tahi"],
    proofEyebrow: "Regeneration · the house's Northland file",
    seo: {
      title: "Northland, New Zealand: Tahi, Wild Beaches and Rare Birds",
      description: "Northland, New Zealand: Tahi's eco-lodges and cottages among wetlands and dune forest, rare birds, wild beaches, surfing and horse riding. 30 minutes from Whangarei, 2.5 hours from Auckland.",
      keywords: ["Northland New Zealand lodge", "Tahi New Zealand", "eco lodge New Zealand", "Whangarei luxury stay", "New Zealand conservation stay"],
    },
    eyebrow: EYEBROW,
    h1: "Northland",
    tagline: "Wild beaches, rare birds, and a stay that restores the land around it",
    slides: [],
    slidesFromStay: { slug: "tahi", alt: "Tahi in Northland, New Zealand", credit: "Photograph courtesy of Tahi New Zealand" },
    answer: "In Northland, the house stays at Tahi: designer eco-lodges and historic cottages with ocean or wetland views, solar powered, among wetland boardwalks and ancient dune forest, with conservation built into every stay. Fly to Whangarei, 30 minutes by road, or drive 2.5 hours from Auckland. Days are nature walks, birdwatching, horse riding, surfing, guided conservation tours and honey tasting. October to April is best.",
    facts: [
      ["The stay", "Tahi: a villa, cottage and studio, or the whole place"],
      ["Getting there", "Whangarei (WRE), 30 minutes; Auckland (AKL), 2.5 hours by road"],
      ["Best months", "October to April"],
      ["Days", "Wetland and dune forest walks, birdwatching, surfing, horse riding, conservation tours"],
    ],
    proof: "Tahi is in the Ledger with its own ID, for travellers who want their stay to give back to the land.",
    months: [{ area: "Beaches, birds and wildflowers", note: "Spring to autumn, October to April (Tahi)", months: M("BBBBggggggBB") }],
    airports: [["Whangarei (WRE)", "30 minutes by road"], ["Auckland (AKL)", "2.5 hours by road"]],
    transfers: [["Whangarei → Tahi", "About 30 minutes; private transfers on request"], ["Auckland → Tahi", "About 2.5 hours by road"]],
    highlights: [
      { title: "Wetland and dune forest", line: "On foot", body: "Boardwalks through the wetlands and walks in ancient dune forest, with rare birds at the door." },
      { title: "Honey and the land", line: "Tahi", body: "Honey tastings and guided conservation tours of the regeneration work." },
      { title: "Wild beaches", line: "In the water", body: "Surfing and long beaches on the coast." },
    ],
    suits: [{ who: "Families and the eco-minded", line: "Exclusive use for a group, or a cottage for two.", href: "/stays/tahi", label: "Tahi" }],
    howTo: { title: "Northland in a Journey", intro: "Northland is an easy first or last stop from Auckland. The house books the flights and transfers.", options: [
      { name: "Northland and Taupō", body: "Tahi, then south to Huka Lodge on the Waikato River.", href: `${BASE}/taupo`, label: "Taupō" },
    ] },
    onwardEyebrow: "Continue through New Zealand",
    onward: ONWARD("northland"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Tahi?", a: "Fly to Whangarei, 30 minutes by road, or drive about 2.5 hours from Auckland. Private transfers are available on request." },
      { q: "When is the best time to visit Northland?", a: "October to April: warm weather, active birdlife, wildflowers and easy beach access. Winters are quieter." },
    ],
    geo: { lat: -35.812, lng: 174.5325 },
    sources: [{ title: "Tahi", url: "https://www.tahi.co.nz/" }],
  },
};
