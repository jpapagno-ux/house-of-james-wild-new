import type { Partner } from "./types";
import { POLAR_PATH, POLAR_VOYAGES, STYLES, nightsWords, usd, voyageFrom, voyagePath } from "@/lib/content/polar";

// Antarctica21, filed 2 Nov 2026 from antarctica21.com (our-company, antarctic-air-cruises,
// antarctic-flights-guide, sustainability, travel-tips and the 2026-27 and 2027-28 season pages).
// Photographs Antarctica21 (no media kit is published; images from its own pages). Left out: the
// aircraft operator's other name in some image captions (the site does not reconcile it), the
// airstrip details it does not publish, and Ocean Nova, which Antarctica21 says has left the fleet.
const IMG = "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/partners/antarctica21";

export const ANTARCTICA21: Partner = {
  slug: "antarctica21",
  name: "Antarctica21",
  kind: "Expedition operator",
  seo: {
    title: "Antarctica21: Fly the Drake Air-Cruises",
    description: "Antarctica21 pioneered Antarctic air-cruises from Punta Arenas in 2003: a two hour flight to King George Island, then 88-guest Magellan ships. Ships, voyages and FAQs.",
    keywords: ["Antarctica21", "Antarctica air-cruise", "fly to Antarctica from Punta Arenas", "Magellan Discoverer", "Magellan Explorer", "skip the Drake Passage"],
  },
  line: "The Chilean company behind the Antarctic air-cruise, and every voyage in Polar Crossings.",
  answer: "Antarctica21 is a Chilean expedition company founded in Punta Arenas in 2003 that says it pioneered the Antarctic air-cruise. Guests fly about two hours over the Drake Passage to King George Island and board one of its two small ships, Magellan Explorer or Magellan Discoverer, each carrying up to 88 guests on air-cruises.",
  who: {
    facts: [
      ["Founded", "2003, as ANTARCTICA XXI; Antarctica21 since 2018"],
      ["Based", "Punta Arenas, Chile, where it runs Explorers House, a private guest club opened in 2023"],
      ["Season", "Air-cruises from late November through March; sea voyages in spring and autumn"],
      ["Memberships", "IAATO (since 2003), Pure Life Experiences, Adventure Travel Trade Association, LATA Sustainable Travel Network, Arbeitsgemeinschaft Lateinamerika, Serandipians Afloat"],
    ],
    history: [
      ["2003", "Founded with MV Grigoriy Mikheev and a Dash-7 aircraft; joins IAATO"],
      ["2007", "C-130 Hercules replaces the Dash-7"],
      ["2009", "BAE 146 jet introduced; MV Professor Multanovskiy joins"],
      ["2010", "MV Ocean Nova joins"],
      ["2015", "MV Sea Explorer joins"],
      ["2016", "Construction of Magellan Explorer begins"],
      ["2018", "Rebranded Antarctica21"],
      ["2019", "CarbonNeutral certification; Magellan Explorer launches"],
      ["2021", "Antarctica21 Foundation launches"],
      ["2023", "Explorers House opens; 20th anniversary"],
      ["2024", "HIF e-fuel partnership; first steel cut for Magellan Discoverer"],
      ["2025", "HIF alliance renewed for e-gasoline Zodiac operations"],
    ],
  },
  how: {
    paragraphs: [
      "The air-cruise: instead of two days each way across the Drake Passage, guests fly from Punta Arenas to King George Island in the South Shetland Islands and board the ship by Zodiac. A single flight carries every guest, per Antarctica21.",
      "Flights go only when the weather on King George Island allows. Outbound, Antarctica21 keeps trying until 2 PM on Day 4, covering the Day 1 hotel, meals and Punta Arenas tours, and refunds 100% of the cruise fare if guests still cannot fly. On the way back the ship keeps cruising until the flight is cleared. No refund applies on itineraries that start in Ushuaia.",
      "Antarctica21 also runs sea voyages that sail both ways: the Falklands, South Georgia and the Chilean fjords, from Punta Arenas, Ushuaia and Puerto Montt.",
    ],
    facts: [
      ["Flight", "About two hours, up to 2.5, Punta Arenas to King George Island"],
      ["Aircraft", "BAE 146-200, AVRO RJ 85 and AVRO RJ 100: high wing jets built for short runways"],
      ["Airline", "Aerovias DAP (DAP Airlines), Antarctica21's partner since 2003"],
      ["Flight record", "346 flights to April 2025: 264 on schedule, 26 a day early, 56 delayed one to three days"],
      ["Luggage", "25 kg (55 lb) per person, hand luggage included, no item over 20 kg"],
    ],
  },
  fleet: ["magellan-explorer", "magellan-discoverer"],
  fleetNote: "Ocean Nova still has a page on Antarctica21's site, which says she has made her final trip and left the fleet.",
  itineraries: {
    title: `${POLAR_VOYAGES.length} Itineraries, From Air-Cruises to Sea Voyages`,
    href: POLAR_PATH,
    hrefLabel: "Browse them by trip style, region, length, month and ship",
    items: POLAR_VOYAGES.map((v) => {
      const from = voyageFrom(v);
      return { name: v.name, href: voyagePath(v.slug), eyebrow: STYLES[v.style].name, line: v.tagline, image: v.hero, price: v.status === "sold-out" ? "Sold out" : from ? `From ${usd(from)}` : null, facts: [["Nights", nightsWords(v).replace(" nights", "")]] };
    }),
  },
  apart: [
    { claim: "Pioneered air-cruise expeditions in Antarctica", attribution: "Our Company page" },
    { claim: "The company that invented the Air-Cruise Model", attribution: "Antarctic Air-Cruises page" },
    { claim: "The most extensive suite of Antarctic air-cruises in the world", attribution: "Our Company page" },
    { claim: "Magellan Explorer is the world's first expedition vessel custom designed for Antarctic air-cruise operations", attribution: "Our Company page" },
    { claim: "Magellan Discoverer is the first hybrid electric polar ship built in the Americas", attribution: "Our Company page" },
    { claim: "A single flight carries all guests, ships carry a maximum of 88 guests, and every journey has at least 13 polar guides", attribution: "2027-28 season announcement" },
  ],
  sustainability: [
    "CarbonNeutral certified company since 2019, through emission reduction and offsetting",
    "Says it was the first company to use e-fuel in Antarctic travel operations (2024, with HIF), renewed in 2025 to power Zodiac landings with e-gasoline",
    "Antarctica21 Foundation (2021) supports Antarctic science, art, conservation and education in Chile",
    "Citizen science programmes on every expedition",
  ],
  why: [
    "Its air-cruises fly over the Drake Passage, for travellers who want Antarctica without two days at sea each way.",
    "Its ships carry at most 88 guests on an air-cruise, with at least 13 polar guides on every journey, per Antarctica21.",
    "It publishes its flight record and its weather contingency, including a full refund of the cruise fare if guests cannot fly out by Day 4.",
    "It has been a member of IAATO since 2003.",
    "Its sea voyages reach the Falklands, South Georgia and the Chilean fjords, so a longer journey can stay with one operator.",
  ],
  faqs: [
    ["What is an Antarctica21 air-cruise?", "A trip that flies over the Drake Passage instead of sailing it. Guests fly about two hours from Punta Arenas, Chile, to King George Island in the South Shetland Islands and board a small expedition ship there. Antarctica21 says it invented the model and has flown it since 2003."],
    ["Do you have to cross the Drake Passage?", "Not on the Classic and Polar Circle air-cruises, which fly both ways. The Antarctica Express, the Antarctica and South Georgia air-cruise and the Magellan Discoverer inaugural fly one way and sail the other. The sea voyages sail both ways."],
    ["Which ships does Antarctica21 use?", "Two: Magellan Explorer (launched 2019) and Magellan Discoverer (new for the 2026-27 season). Ocean Nova has left the fleet."],
    ["How many guests are on board?", "Up to 88 on air-cruises and up to 96 on sea voyages, on either ship."],
    ["What happens if weather delays the flight?", "Flights go only when King George Island weather allows. Antarctica21 keeps trying until 2 PM on Day 4, covering hotel, meals and Punta Arenas tours in the meantime, and refunds 100% of the cruise fare if guests cannot fly by then. On the way back the ship keeps cruising until the flight is cleared."],
    ["How often are flights delayed?", "Of 346 flights to April 2025, Antarctica21 reports 264 on schedule, 26 a day early and 56 delayed by one to three days."],
    ["How much luggage can I bring?", "25 kg (55 lb) per person on the flights, hand luggage included, with no single item over 20 kg. Extra allowance cannot be bought."],
    ["Can children go?", "On air-cruises, from age 8, with a minimum height of 1.20 m and weight of 30 kg, travelling with a responsible adult. Under 12s get 5% off. Sea voyages take children from 12."],
    ["Is there a single supplement?", "Not in dedicated single cabins. Shared cabin categories carry an 85% or 100% supplement depending on the category."],
    ["Where does an Antarctica21 trip start?", "Most air-cruises start and end in Punta Arenas, Chile, with a briefing at Antarctica21's Explorers House. Some voyages use Ushuaia, Argentina, or Puerto Montt, Chile."],
  ],
  hero: { url: `${IMG}/aircraft-landing-king-george-island`, alt: "Antarctica21 charter flight landing on King George Island in Antarctica", credit: "Antarctica21" },
  gallery: [
    { url: `${IMG}/zodiac-among-ice`, alt: "Guests in yellow jackets and life vests in an inflatable boat surrounded by ice", credit: "Antarctica21" },
    { url: `${IMG}/aircraft-over-ship`, alt: "Aircraft flying low over snowy mountains and the sea with an expedition ship below", credit: "Antarctica21" },
    { url: `${IMG}/adelie-penguins`, alt: "A group of Adelie penguins on ice in Antarctica", credit: "Antarctica21" },
    { url: `${IMG}/aircraft-gravel-runway`, alt: "Front view of a white four engine aircraft on a gravel runway edged with snow", credit: "Antarctica21" },
    { url: `${IMG}/bridge-visit`, alt: "Ship captain explaining the controls to a group of guests on the bridge", credit: "Antarctica21" },
    { url: `${IMG}/air-cruise-model-map`, alt: "Map of the Antarctica21 air cruise model from Punta Arenas to King George Island", credit: "Antarctica21" },
  ],
  credit: "Antarctica21",
  related: [{ label: "Polar Crossings: every Antarctica21 voyage", href: POLAR_PATH }],
  organization: { foundingDate: "2003", locality: "Punta Arenas", country: "CL", memberOf: ["IAATO", "Adventure Travel Trade Association", "Pure Life Experiences"] },
  sources: [
    "https://www.antarctica21.com/our-company",
    "https://www.antarctica21.com/antarctic-air-cruises",
    "https://www.antarctica21.com/antarctic-flights-guide",
    "https://www.antarctica21.com/sustainability",
    "https://www.antarctica21.com/travel-tips-antarctica",
    "https://www.antarctica21.com/journal/introducing-our-2027-28-antarctic-air-cruises",
  ],
  checked: "2026-11-02",
};
