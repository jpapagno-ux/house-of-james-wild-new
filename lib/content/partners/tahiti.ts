import type { Partner } from "./types";
import type { ShipImage } from "@/lib/content/ships/types";

// French Polynesia partners (James, 2 Nov 2026). Facts only from each brand's own site, as filed in the French
// Polynesia review (docs-out/french-polynesia-review.md): pearlresorts.com and the resorts' own sites for Pearl;
// windstarcruises.com (ship pages and the 2 Sep 2025 release) for Windstar. Claims about themselves are quoted
// and attributed. No commission, net rates, contracts or contact details; no links to the brands' own sites.

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2400/q_auto:good/f_auto/";
const V = `${CLD}gatherings/vahine-private-island-tahaa/`;
const vh = (n: string, alt: string): ShipImage => ({ url: `${V}vh-${n}`, alt, credit: "Vahine Private Island, Pearl Resorts of Tahiti" });
const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const PEARL_RESORTS: Partner = {
  slug: "pearl-resorts",
  name: "Pearl Resorts of Tahiti",
  kind: "Island resort collection",
  seo: {
    title: "Pearl Resorts of Tahiti: Le Taha'a, Le Bora Bora, Vahine and More",
    description: "Pearl Resorts of Tahiti across three archipelagos: Le Taha'a, Le Bora Bora, Vahine Private Island, Le Tikehau, Le Nuku Hiva, Le Tahiti and Hanakee. Every one founder vetted by James, with the Islands Dream combination.",
    keywords: ["Pearl Resorts Tahiti", "Pearl Resorts of Tahiti", "Le Taha'a", "Le Bora Bora by Pearl Resorts", "Vahine Private Island", "Le Tikehau", "Le Nuku Hiva", "Islands Dream Offer"],
  },
  line: "A Polynesian collection of island resorts, from the Taha'a lagoon to the Marquesas, every one founder vetted.",
  answer: "Pearl Resorts of Tahiti is a French Polynesian collection of island resorts in three archipelagos: Le Taha'a, Le Bora Bora and Vahine Private Island in the Society Islands, Le Tikehau in the Tuamotu and Le Nuku Hiva in the Marquesas, with Le Tahiti on Tahiti and Hanakee on Hiva Oa. James has founder vetted every one, and Le Taha'a is his favourite. Pearl's Islands Dream Offer takes 25% off accommodation when you pair Le Bora Bora with another of its hotels.",
  who: {
    facts: [
      ["Who", "A Polynesian collection of island resorts, Pearl Resorts of Tahiti"],
      ["Society Islands", "Le Taha'a (Motu Tautau), Le Bora Bora (Motu Tevairoa), Vahine Private Island (Motu Tuvahine, Taha'a lagoon) and Le Tahiti (Lafayette Beach, Arue)"],
      ["Tuamotu", "Le Tikehau, on motu Tianoa in Tikehau atoll"],
      ["Marquesas", "Le Nuku Hiva above Taiohae Bay, and Hanakee on Hiva Oa"],
      ["Labels", "Le Taha'a and Le Nuku Hiva are Relais & Châteaux; Le Taha'a and Le Bora Bora each hold two Michelin Keys, per Pearl Resorts"],
      ["Founder status", "Every Pearl property founder vetted by James (2 Nov 2026); Le Taha'a a founder favourite; Vahine inspected in 2025"],
    ],
  },
  how: {
    paragraphs: [
      "Each resort keeps its own character: overwater suites and a coral garden at Le Taha'a, pool villas facing Mount Otemanu at Le Bora Bora, nine bungalows and a royal villa on Vahine's own motu, a pink sand motu at Le Tikehau, and a lodge above Taiohae Bay at Le Nuku Hiva. Tāvai Spa is the spa at Le Taha'a, Le Bora Bora and Le Tikehau.",
      "Pearl's Islands Dream Offer takes 25% off accommodation when you book at least one night at Le Bora Bora and one at Le Nuku Hiva, Le Taha'a, Le Tahiti or Le Tikehau; at Le Nuku Hiva it is 10% off its package. Pearl lists it as available all year round, not retroactive, booked through its reservations team, and not combinable with other offers. It is the house's island-hopping hook: Bora Bora, then the Taha'a lagoon or the Tuamotu.",
      "Le Tahiti and Hanakee are Pearl properties (James, 2 Nov 2026) that pearlresorts.com does not yet list; the house has asked Pearl to list them and send their media.",
    ],
    facts: [
      ["Islands Dream Offer", "25% off accommodation with Le Bora Bora plus one more Pearl hotel; available all year, as Pearl publishes it (no end date stated)"],
      ["Le Taha'a offer", "Advance Booking Benefits: 20% off stays 1 January to 31 March 2027, booked 90 days ahead"],
      ["Getting between them", "Air Tahiti flies Bora Bora direct to Raiatea (for Taha'a), Tikehau, Rangiroa and Fakarava"],
    ],
  },
  itineraries: {
    title: "Every Pearl Resort on the Ledger",
    items: [
      { name: "Le Taha'a", href: "/stays/le-tahaa", eyebrow: "Taha'a · Founder favourite", line: "Fifty nine overwater suites and beach villas on Motu Tautau, with a coral garden at the door. Relais & Châteaux.", image: vh("05", "Thatched overwater bungalows on a timber pier over a turquoise lagoon, Taha'a") },
      { name: "Vahine Private Island", href: "/stays/pearl-resort-vahine-private-island", eyebrow: "Taha'a lagoon · The Exceptional Few", line: "Nine bungalows on Motu Tuvahine and the Ari'i Vahine Royal Villa, 12,669 sq ft for up to 14, on its own motu.", image: vh("17", "The two-storey timber Ari'i Vahine Royal Villa beside a thatched pavilion and palms at sunset") },
      { name: "Le Bora Bora", href: "/stays/pearl-resort-le-bora-bora", eyebrow: "Bora Bora", line: "Pool villas and overwater suites on Motu Tevairoa facing Mount Otemanu; five star, two Michelin Keys in 2025." },
      { name: "Le Tikehau", href: "/stays/pearl-resort-le-tikehau", eyebrow: "Tikehau · Tuamotu", line: "Twenty nine bungalows on a pink sand motu, a 15 minute boat ride from the village." },
      { name: "Le Nuku Hiva", href: "/stays/pearl-resort-le-nuku-hiva", eyebrow: "Nuku Hiva · Marquesas", line: "Twenty bungalows above Taiohae Bay, a Relais & Châteaux base for the Marquesas." },
      { name: "Le Tahiti", href: "/stays/pearl-resort-le-tahiti", eyebrow: "Tahiti", line: "Ninety one rooms and suites on Lafayette Beach in Arue, for the first and last nights." },
    ],
  },
  apart: [
    { claim: "The latest addition to the Pearl Resorts collection", attribution: "on Vahine Private Island, pearlresorts.com" },
    { claim: "Two Michelin Keys", attribution: "on Le Taha'a and on Le Bora Bora (2025), pearlresorts.com" },
    { claim: "A five star hotel", attribution: "on Le Bora Bora, leborabora.com" },
  ],
  why: [
    "Three archipelagos in one collection, so a trip can go from the Taha'a lagoon to a Tuamotu atoll to the Marquesas without changing who looks after you.",
    "James has founder vetted every Pearl property, and Le Taha'a, on the island he calls his favourite in French Polynesia, is a founder favourite.",
    "The Islands Dream Offer makes the classic pairing, Bora Bora and a second island, 25% kinder on accommodation.",
    "Vahine's Ari'i Vahine Royal Villa is one of the few true private-island houses in French Polynesia: The Exceptional Few.",
  ],
  faqs: [
    ["Which resorts are in Pearl Resorts of Tahiti?", "Le Taha'a, Le Bora Bora, Vahine Private Island, Le Tikehau and Le Nuku Hiva on pearlresorts.com, plus Le Tahiti on Tahiti and Hanakee on Hiva Oa, which James confirms are Pearl properties."],
    ["What is the Islands Dream Offer?", "25% off accommodation when you book at least one night at Le Bora Bora and one at Le Nuku Hiva, Le Taha'a, Le Tahiti or Le Tikehau (10% off Le Nuku Hiva's package). Pearl lists it as available all year round; it is not retroactive and does not combine with other offers."],
    ["Does Vahine Private Island count for the Islands Dream Offer?", "Not as Pearl publishes it: the offer names Le Bora Bora plus Le Nuku Hiva, Le Taha'a, Le Tahiti or Le Tikehau. Ask James about pairing Vahine."],
    ["Which Pearl resort is James's favourite?", "Le Taha'a, on Taha'a, the island he calls his favourite in French Polynesia."],
    ["Has James stayed at the Pearl resorts?", "He has founder vetted every one. He inspected Vahine Private Island in 2025 and has not stayed there; the site makes no stay claim for any Pearl resort."],
    ["How do you travel between Pearl resorts?", "By Air Tahiti: Bora Bora has direct flights to Raiatea (then about 30 minutes by boat to Taha'a), Tikehau, Rangiroa and Fakarava. The Marquesas are reached from Tahiti."],
    ["Which Pearl resort is best for families?", "Le Bora Bora's Royal Beach Villa with Pool sleeps up to six adults and two children under 13; Le Tahiti's suites come with kitchens; Vahine's Royal Villa takes up to 14."],
    ["Are the Pearl resorts on the water?", "Le Taha'a, Le Bora Bora, Le Tikehau and Vahine have overwater suites or bungalows; Le Nuku Hiva and Le Tahiti face the sea from the shore."],
  ],
  hero: vh("05", "Thatched overwater bungalows on a timber pier over a turquoise lagoon at Vahine Private Island, Taha'a"),
  gallery: [vh("18", "The infinity pool of the Ari'i Vahine Royal Villa, with its timber villa and a thatched pavilion among palms"), vh("09", "A covered terrace at the Royal Villa looking across the pool to a thatched pavilion, palms and the lagoon"), vh("02", "A thatched beach bungalow among palms on the shore of a clear lagoon"), vh("08", "Thatched overwater terrace at sunset, looking across the lagoon to the hills of Taha'a")],
  credit: "Vahine Private Island, Pearl Resorts of Tahiti",
  related: [{ label: "French Polynesia (Tahiti): islands, lagoons and island-hopping routes", href: "/destinations/oceania/tahiti" }],
  organization: { country: "PF" },
  sources: ["https://www.pearlresorts.com/", "https://www.leborabora.com/x,1002,20,2342,,,/islands-dream-offer.html", "https://www.letahaa.com/en-gb/suites-villas", "https://www.letahaa.com/en-gb/offers"],
  checked: "2026-11-02",
};

export const WINDSTAR: Partner = {
  slug: "windstar",
  name: "Windstar",
  kind: "Small-ship operator",
  seo: {
    title: "Windstar in Tahiti: Star Breeze and Wind Star with James Wild & Co",
    description: "Windstar's two ships in French Polynesia: Star Breeze, a 312-guest all-suite yacht sailing year round, and Wind Star, a 148-guest sailing yacht on the 7-night Dreams of Tahiti from March 2027.",
    keywords: ["Windstar Tahiti", "Windstar Cruises French Polynesia", "Star Breeze", "Wind Star", "Dreams of Tahiti", "small ship Tahiti cruise"],
  },
  line: "Small ships in French Polynesia: an all-suite yacht year round, and a four-masted sailing yacht from March 2027.",
  answer: "Windstar sails two ships in French Polynesia. Star Breeze, a 312-guest all-suite yacht, sails Tahiti year round with voyages almost every week from Papeete, and longer Star Collector Voyages of up to 21 days to the Tuamotu, the Marquesas, Fiji and the Cook Islands. From March 2027 Wind Star, a four-masted sailing yacht for 148 guests, joins her on the 7-night Dreams of Tahiti, Mondays from Papeete, calling at Raiatea every week.",
  who: {
    facts: [
      ["Who", "A small-ship cruise line with yachts and sailing yachts, as Windstar describes its fleet"],
      ["In Tahiti", "Star Breeze year round; Wind Star from March 2027, year round"],
      ["Port", "Papeete, Tahiti"],
      ["James and Windstar", "James has sailed Star Breeze with his wife: 11 days, calling at Fakarava and Rarotonga. With Windstar he has also called at Taha'a and Rangiroa"],
    ],
  },
  how: {
    paragraphs: [
      "Star Breeze is the all-suite yacht: 312 guests, 200 crew, suites from 277 sq ft, and all dining included. Her longer voyages reach the Tuamotu, the Marquesas, Fiji and the Cook Islands, which Windstar combines into Star Collector Voyages of up to 21 days.",
      "Wind Star is the sailing yacht: four masts and six self-furling sails for 148 guests. From March 2027 she sails the 7-night Dreams of Tahiti every Monday from Papeete, and every voyage visits Raiatea, across the lagoon from Taha'a.",
      "Windstar sells its sailings in its own booking tool and publishes no day by day the house can file, so James confirms the route and dates for your week. A night on Tahiti before you board, and Taha'a after, make the classic pairing.",
    ],
    facts: [
      ["Star Breeze", "312 guests, all suites, year round in Tahiti"],
      ["Wind Star", "148 guests, four masts, Dreams of Tahiti from March 2027"],
      ["Dreams of Tahiti", "7 nights, Mondays from Papeete, Raiatea every week"],
    ],
  },
  fleet: ["star-breeze", "wind-star"],
  fleetNote: "Windstar's own photographs are a follow-up; the cards show the Tahiti waters for now.",
  apart: [
    { claim: "Located just 8 hours from Los Angeles in beautiful Tahiti", attribution: "on Star Breeze, Star Breeze page" },
    { claim: "Sails year-round with voyages almost every week", attribution: "on Star Breeze, Star Breeze page" },
    { claim: "An intimate sailing yacht", attribution: "on Wind Star, Wind Star page" },
  ],
  why: [
    "Two very different ships in the same waters: an all-suite yacht for the long routes, and a real sailing yacht for a week in the Society Islands.",
    "Star Breeze reaches the Tuamotu and the Marquesas, which few small ships sail, on voyages of up to 21 days.",
    "Wind Star calls at Raiatea every week, so Taha'a, James's favourite island, sits right beside the sailing.",
    "James has sailed Windstar in French Polynesia himself, with his wife.",
  ],
  faqs: [
    ["Which Windstar ships sail in Tahiti?", "Star Breeze, year round, and Wind Star from March 2027."],
    ["Is Star Breeze a sailing ship?", "No. Windstar describes her as an all-suite yacht. Wind Star is its sailing yacht in Tahiti."],
    ["What is Dreams of Tahiti?", "Wind Star's 7-night voyage from Papeete, Mondays, from March 2027; every voyage visits Raiatea."],
    ["How long are Star Breeze's longer voyages?", "Windstar combines them into Star Collector Voyages of up to 21 days, to the Tuamotu, the Marquesas, Fiji and the Cook Islands."],
    ["Has James sailed with Windstar?", "Yes. He sailed Star Breeze with his wife for 11 days, calling at Fakarava and Rarotonga, and has also called at Taha'a and Rangiroa with Windstar."],
    ["Where should I stay before a Windstar sailing?", "On Tahiti: InterContinental Tahiti, a founder favourite, or Le Tahiti by Pearl Resorts."],
    ["Can I add Taha'a after Wind Star?", "Yes. Raiatea and Taha'a share a lagoon, about 30 minutes across by boat, so Le Taha'a or Vahine Private Island follow a sailing naturally."],
  ],
  hero: { url: `${WF}/6835a9e1638964759ac48945_gettyimages-488262775-170667a.jpg`, alt: "A lagoon in French Polynesia, where Windstar sails from Papeete" },
  gallery: [{ url: `${WF}/69e80c656320ee5d7a35e8f9_Tahiti%20-%20Section%201%20Image.jpg`, alt: "Lagoon and volcanic peaks in the Society Islands, French Polynesia" }],
  credit: "James Wild & Co (licensed Tahiti photography; Windstar's media to follow)",
  related: [{ label: "French Polynesia (Tahiti): islands, lagoons and island-hopping routes", href: "/destinations/oceania/tahiti" }],
  organization: {},
  sources: ["https://www.windstarcruises.com/ships/star-breeze/", "https://www.windstarcruises.com/ships/wind-star/", "https://www.windstarcruises.com/press-media/press-releases/Windstar-Cruises-Returns-Iconic-Sailing"],
  checked: "2026-11-02",
};
