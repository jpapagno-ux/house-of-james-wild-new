import type { Partner, PartnerItinerary } from "./types";
import { SEADREAM_VOYAGES, seadreamPath, finderRows, type OperatorVoyage } from "@/lib/content/ships/seadream";
import SeaDreamI from "@/lib/content/ships/caribbean/seadream-i.json";
import type { ShipRecord } from "@/lib/content/ships/types";

// SeaDream Yacht Club (James, 15 and 16 Nov 2026: "a great company that we're vetted and partner with"; the partner
// page term is "Preferred & Vetted partner"). Filed from seadream.com: the yachts, charter and spa pages, its policies,
// and every voyage page (scripts/partners/seadream-fetch.mjs and seadream-build.mjs). Photographs and suite films:
// SeaDream Yacht Club (partner agreement), enhanced only, nothing generated. Claims about themselves are quoted with
// where they say them. No commission or net rates. Voyages that call in the Middle East are not filed (CLAUDE.md).
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const when = (v: OperatorVoyage) => `${Number(v.date.slice(8, 10))} ${MON[+v.date.slice(5, 7) - 1]} ${v.date.slice(0, 4)}`;
const twin = SeaDreamI as unknown as ShipRecord;
const V = SEADREAM_VOYAGES;
const count = (ship: string) => V.filter((v) => v.ship === ship).length;
const low = Math.min(...V.map((v) => v.from$ ?? Infinity));
const bahamas = V.filter((v) => v.bahamas);
const item = (v: OperatorVoyage): PartnerItinerary => ({ name: v.title, href: seadreamPath(v), eyebrow: `${v.shipName} · ${when(v)}`, line: v.direction, image: v.hero, price: v.waitlisted ? "Waitlist" : v.from$ ? `From ${usd(v.from$)}` : "Ask us", facts: [["Nights", String(v.nights)]] });
const film = (id: string, title: string) => ({ title, src: `https://res.cloudinary.com/jhlnq5h5/video/upload/f_auto:video,q_auto/jwco/voyages/ships/seadream/films/${id}.mp4`, poster: `https://res.cloudinary.com/jhlnq5h5/video/upload/so_3,c_fill,g_auto,w_1280,h_720,f_jpg,q_auto/jwco/voyages/ships/seadream/films/${id}.jpg` });
const pic = (id: string, alt: string) => ({ url: `https://res.cloudinary.com/jhlnq5h5/image/upload/e_sharpen:40/f_auto,q_auto/jwco/voyages/ships/seadream/site/${id}`, alt, credit: "SeaDream Yacht Club" });

export const SEADREAM: Partner = {
  slug: "seadream-yacht-club",
  name: "SeaDream Yacht Club",
  kind: "Small-yacht operator",
  standing: "Preferred & Vetted partner",
  seo: {
    title: "SeaDream Yacht Club: Every Voyage, Yacht and Fare | James Wild & Co",
    description: `SeaDream Yacht Club's twin 112-guest yachts and the new SeaDream III: ${V.length} published voyages in the Caribbean, the Bahamas, the Mediterranean and beyond, each day by day with its fares, from ${usd(low)} per person.`,
    keywords: ["SeaDream Yacht Club", "SeaDream I", "SeaDream II", "SeaDream III", "SeaDream voyages", "SeaDream Bahamas", "SeaDream Caribbean", "SeaDream Mediterranean", "small luxury yacht cruise", "all inclusive yacht voyage"],
  },
  line: "Twin yachts for 112 guests with a marina at the stern, and a third yacht on the way.",
  answer: `SeaDream Yacht Club sails two twin yachts, SeaDream I and SeaDream II, each with 56 staterooms and suites for 112 guests and a crew of 95, and is adding SeaDream III, whose inaugural voyage leaves Hong Kong on 10 July 2029. Meals, an open bar, wines with lunch and dinner, gratuities and the water toys are in the fare. SeaDream publishes ${V.length} voyages still to sail, ${bahamas.length} of them calling in the Bahamas, with fares from ${usd(low)} per person, double occupancy. Every voyage has its own page here, with its day by day, chart and the fare of every stateroom and suite.`,
  who: {
    facts: [
      ["Fleet", "SeaDream I and SeaDream II, twins; SeaDream III from July 2029"],
      ["Guests", "112 on each twin, in 56 staterooms and suites"],
      ["Crew", "95 on each twin"],
      ["Waters", "The Caribbean and the Bahamas in winter; the Mediterranean and northern Europe in summer; Asia, the Pacific, the Americas and the Arctic with SeaDream III"],
      ["Fares", "Per person, double occupancy, in US dollars, by stateroom and suite category"],
      ["Recognition", "SeaDream says the Condé Nast Traveler Gold List, Travel + Leisure and Cruise Critic have each recognised it"],
      ["Private charter", "Each twin can be taken whole, for up to 56 couples"],
    ],
  },
  how: {
    paragraphs: [
      "SeaDream's twins are small on purpose. A hundred and twelve guests and ninety-five crew means the crew learn names, lunch is cooked to order and served outdoors, and the yacht calls at small harbours and anchors off beaches. At anchor the marina opens at the stern for kayaks, paddleboards and sailing dinghies.",
      "The fare covers most of what becomes a bill elsewhere: meals, the open bar, wines with lunch and dinner, gratuities, the water toys, mountain bikes and morning yoga. Port and government fees, Wi-Fi, spa treatments, premium wines and land adventures are extra.",
      "SeaDream publishes every voyage with its ports, its arrival and sailing times and the fare of every category, and we file each one on its own page. Voyages run back to back, so two can be joined without changing yacht. Use the finder below to narrow them by where, when, how long and which yacht.",
    ],
    facts: [
      ["Deposit", "25% of the fare"],
      ["Final payment", "90 days before departure"],
      ["Children", "From one year old; under 18 with an adult; no children's programme"],
      ["Wi-Fi", "US$35 a day or US$99 a week"],
      ["Voyages on the Ledger", `${count("seadream-i")} aboard SeaDream I, ${count("seadream-ii")} aboard SeaDream II, ${count("seadream-iii")} aboard SeaDream III`],
    ],
  },
  fleet: ["seadream-i", "seadream-ii", "seadream-iii"],
  fleetNote: "No picture of SeaDream III has been published; hers is SeaDream's launch picture of the sea.",
  itineraries: bahamas.length ? { title: "Which SeaDream Voyages Call in the Bahamas?", items: bahamas.map(item), href: "#voyages", hrefLabel: "Every SeaDream voyage, by region, month and yacht" } : undefined,
  finder: { title: "Which SeaDream Voyage Is Yours?", intro: `All ${V.length} published voyages still to sail. Pick a region, a month, a length or a yacht, or type a port. Each opens on its own page with the day by day and fares.`, rows: finderRows() },
  films: { title: "What Are the Staterooms and Suites Like?", intro: "SeaDream's own short films of each category aboard the twin yachts.", items: [film("yacht-club-stateroom", "Yacht Club Stateroom"), film("commodore-suite", "Commodore Suite"), film("admiral-suite", "Admiral Suite"), film("owners-suite", "Owner's Suite")] },
  apart: [
    { claim: "It's Yachting, Not Cruising", attribution: "its home page" },
    { claim: "95 crew members looking after just 112 guests", attribution: "its yachts page" },
    { claim: "the only Thai-certified yacht club spa at sea", attribution: "its spa page" },
    { claim: "1 to 1 guest-to-crew ratio", attribution: "its private charter page" },
  ],
  why: [
    "The house has vetted SeaDream and works with it as a Preferred & Vetted partner.",
    "Two yachts of 112 guests each, with close to one crew member for every guest.",
    "The fare is close to complete: the bar, wine with meals, gratuities and the water toys are in it.",
    "It publishes every voyage's ports, times and fares by category, so each can be filed here as it is sold.",
    "It sails the Bahamas and the small harbours of the Caribbean and the Mediterranean, where the house already places travellers ashore.",
  ],
  faqs: [
    ["What is SeaDream Yacht Club?", "A small-yacht company with two twin yachts, SeaDream I and SeaDream II, each carrying 112 guests with a crew of 95, and a third yacht, SeaDream III, sailing from July 2029."],
    ["What does a SeaDream fare include?", `${twin.inclusions.slice(0, 7).join("; ")}. Port and government fees, Wi-Fi, spa treatments, premium wines and spirits, land adventures and laundry are extra.`],
    ["Does SeaDream sail the Bahamas?", bahamas.length ? `Yes. ${bahamas.length} published voyages call in the Bahamas, the next on ${when(bahamas[0])} aboard ${bahamas[0].shipName} (${bahamas[0].title}, ${bahamas[0].direction}).` : "No Bahamas voyage is published at the moment; ask James."],
    ["How much is a SeaDream voyage?", `Published fares start from ${usd(low)} per person, double occupancy, and vary by voyage and by stateroom or suite. Each voyage page shows every category's fare as SeaDream publishes it.`],
    ["Are there SeaDream special offers?", "SeaDream lists its Signature Savings on its own site, and none were listed when we last read it. When SeaDream publishes one we file it here, with its dates and terms."],
    ["What are the payment and cancellation terms?", "A 25% deposit confirms and the balance is due 90 days before departure. Cancelling more than 120 days out costs US$200 per booking; 120 to 91 days, 25% of the fare; 90 to 61 days, 50%; 60 to 31 days, 75%; 30 days or fewer, the full fare."],
    ["Can I charter a SeaDream yacht?", "Yes. Each twin can be chartered whole for up to 56 couples, in the Caribbean or the Mediterranean, on a published itinerary or one set with you."],
    ["When does SeaDream III sail?", "Her inaugural voyage leaves Hong Kong for Tokyo on 10 July 2029. SeaDream has published her voyages and a lead fare for each, but not yet her size, suites or pictures."],
    ["Why are some SeaDream voyages not listed here?", "The house does not sell the Middle East, so SeaDream III's voyages that call in the Gulf and the Red Sea are not filed. Ask James about any SeaDream voyage you do not see."],
  ],
  hero: pic("hero-image-yachts-v3", "SeaDream I and SeaDream II at anchor on calm silver water, low islands and tall clouds behind"),
  gallery: [
    pic("yachts-1", "SeaDream yacht from the air, her pool and sun decks astern and a tender alongside, off a green hilly coast"),
    pic("yachts-9", "Balinese Dream Beds with navy cushions and rolled towels along the top deck, open sea beyond"),
    pic("yachts-12", "The open-air Topside Restaurant: tables in white linen on teak decking under an awning"),
    pic("champagne-caviar-splash", "SeaDream crew in bright shirts serving caviar from a surfboard in waist-deep water, the Champagne and Caviar Splash"),
    pic("yachts-3", "SeaDream yacht at anchor off a wooded shore, jet skis and a small sailing boat circling in her wake"),
    pic("yachts-7", "The pool on deck at sunset, sun loungers along the rail and an island on the horizon"),
    pic("yachts-4", "SeaDream yacht passing between the sheer rock walls of the Corinth Canal"),
    pic("fjord", "SeaDream yacht sailing up a narrow green fjord, seen from above her stern"),
  ],
  credit: "SeaDream Yacht Club",
  related: [{ label: "By Yacht", href: "/voyages/yachts" }, { label: "Timeless Voyages", href: "/voyages/timeless-voyages" }],
  organization: {},
  sources: ["seadream.com", "seadream.com/yachts", "seadream.com/voyages", "seadream.com/charter", "seadream.com/spa", "seadream.com policies, terms and conditions"],
  checked: "2026-11-16",
};
