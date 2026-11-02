import { SHIPS } from "./index";
import { cardsFor, tally, type ShipCardData } from "./cards";
import { SHIP_REGISTRY, VOYAGE_TYPES, WATERS_HUBS, registryShip, shipsInWaters, shipsOfType, type VoyageType, type Waters } from "./registry";
import { atlasRoutes } from "./atlas";
import { NILE_CHART } from "./routes";
import { ALIIKAI_SHIP } from "./aliikai";
import { factOf, nightsLabel } from "./types";
import type { HubProps } from "@/components/ships/VoyageHub";
import type { Tile } from "@/components/ships/VoyageTiles";

// The copy for every Voyages hub, built from the registry and the ships' own records: each
// opening answers the question people search, in facts the ship pages already carry. No hub
// names a ship that is not filed; hubs still filling say so in one line.

const SMALL = new Set(["a", "an", "the", "for", "or", "in", "of", "to", "and", "on", "by"]);
/** House headings are title case: "Which Small-Ship River Cruise Is Right for You?" */
const titleCase = (q: string) => q.split(" ").map((w, i) => (i > 0 && SMALL.has(w) ? w : w.split("-").map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join("-"))).join(" ");
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");
const POLAR = "https://polarcrossings.com";
const polarTile: Tile = { key: "polar", name: "Antarctica and the Arctic", href: POLAR, line: "Polar ships sail with Polar Crossings, James's polar platform.", external: true };

/** "Origin (yacht, Ecoventura; 7 nights; 20 guests; from US$10,950)" from the ship's own record. */
function brief(c: ShipCardData): string {
  const e = SHIPS.find((x) => x.slug === c.slug);
  if (!e) return `${c.name} (${c.eyebrow.toLowerCase().replace(" · ", ", ")}; ship page to follow)`;
  const s = e.data;
  const g = s.glance?.guests ?? factOf(s, /guest/i);
  const parts = [c.eyebrow.replace(" · ", ", ").replace(/^\w/, (x) => x.toLowerCase()), nightsLabel(s), g ? `${g} guests` : null, c.price ? (c.price.label === "From" ? `from ${c.price.amount}` : c.price.label === "Journeys" ? `${s.operator} journeys from ${c.price.amount}` : c.price.amount.toLowerCase()) : null, /^launching/.test(s.status) ? s.status : null];
  return `${c.name} (${parts.filter(Boolean).join("; ")})`;
}
const briefs = (cs: ShipCardData[]) => cs.map(brief).join(". ");
const filedOnly = (cs: ShipCardData[]) => cs.filter((c) => !c.page).map((c) => c.name);

function typeTiles(except: VoyageType): Tile[] {
  return (Object.keys(VOYAGE_TYPES) as VoyageType[]).filter((t) => t !== except).map((t) => { const x = tally(cardsFor(shipsOfType(t))); return { key: t, name: VOYAGE_TYPES[t].name, href: VOYAGE_TYPES[t].path, line: VOYAGE_TYPES[t].line, count: x.count, from: x.from }; });
}
function watersTiles(except?: Waters): Tile[] {
  return (Object.keys(WATERS_HUBS) as Waters[]).filter((w) => w !== except).map((w) => { const x = tally(cardsFor(shipsInWaters(w))); return { key: w, name: WATERS_HUBS[w].name, href: WATERS_HUBS[w].path, line: WATERS_HUBS[w].countries.join(", "), count: x.count, from: x.from }; });
}
const routesFor = (cards: ShipCardData[]) => atlasRoutes(SHIPS.filter((e) => cards.some((c) => c.slug === e.slug)));
const FARES = { q: "How are the fares shown?", a: "Per person, two sharing, as each operator publishes them, with past departures removed automatically. Every fare and every cabin is confirmed live when you ask." };
const POLAR_FAQ = { q: "Where are the polar voyages?", a: "Antarctica and the Arctic are planned with Polar Crossings, James's polar platform at polarcrossings.com, not in Voyages." };

export function typeHub(t: VoyageType): HubProps {
  const T = VOYAGE_TYPES[t];
  const cards = cardsFor(shipsOfType(t));
  const live = cards.filter((c) => c.page);
  const filed = filedOnly(cards);
  const x = tally(cards);
  const base = { path: T.path, name: T.name, eyebrow: `Volume 04 · Voyages · ${T.name}`, question: titleCase(T.question), cards, related: { title: "How Else Could You Sail?", tiles: t === "expedition" ? [...typeTiles(t), polarTile] : typeTiles(t) } };
  if (t === "river") return { ...base,
    title: "Small-Ship River Cruises", intro: T.line,
    answer: `Voyages files ${cards.length} river ships: ${briefs(cards)}. On the Nile, a riverboat carries more guests with more cabin choice; the dahabiya is a sailing boat for twelve. Each ship page lists her cabins, deck plan, day by day and every published fare.`,
    faqs: [
      { q: "Which river cruises does James Wild & Co sell?", a: `${list(cards.map((c) => c.name))}: A&K Sanctuary on the Nile and andBeyond in the Peruvian Amazon.` },
      { q: "How long are the river cruises?", a: `${list(live.map((c) => `${c.name} ${SHIPS.find((e) => e.slug === c.slug) ? nightsLabel(SHIPS.find((e) => e.slug === c.slug)!.data) : ""}`))}.` },
      FARES,
    ],
    adding: "Mekong and Europe's rivers, and more Amazon ships in Peru, Ecuador and Brazil, are added as each operator's material is filed.",
    atlas: { routes: routesFor(cards), legend: "river", dest: "nile", chart: NILE_CHART, kicker: "THE VOYAGES · BY RIVER", title: "Where Do the River Ships Sail?", line: "Every river route on one chart: pick one and the globe flies to it, then sails it day by day." } };
  if (t === "sailing") return { ...base,
    title: "Small Sailing Ships and Phinisis", intro: T.line,
    answer: `Voyages files ${cards.length} sailing ships, all in Indonesia: ${briefs(cards)}. Aliikai has her full page, cabin by cabin with every published sailing; James sailed Raja Ampat aboard her in November 2024.${filed.length ? ` ${list(filed)} open their Ledger records until their ship pages are built.` : ""}`,
    faqs: [
      { q: "What is a phinisi?", a: "A traditional Indonesian wooden sailing ship. Aliikai was hand-built in Bulukumba, South Sulawesi, where these boats have been built for centuries, and refitted in 2020." },
      { q: "Can we take a sailing ship private?", a: `Yes: ${list(cards.filter((c) => c.types.includes("charter")).map((c) => c.name))} charter whole. Aliikai is ${usd(registryShip("aliikai")!.charter!.from!)} a night plus 11% tax for up to 15 guests.` },
      FARES,
    ],
    adding: filed.length ? `${list(filed)} have their ship pages to follow, written with James.` : undefined,
    atlas: { routes: routesFor(cards), legend: "sea", dest: "raja-ampat", kicker: "THE VOYAGES · UNDER SAIL", title: "Where Do the Sailing Ships Go?", line: "Aliikai's Raja Ampat and Komodo routes: pick one and the globe sails it day by day." } };
  if (t === "expedition") return { ...base,
    title: "Small Expedition Ships", intro: T.line,
    answer: `Voyages files ${cards.length} expedition ships, all in the Galápagos: ${briefs(cards)}. Antarctica and the Arctic sail with Polar Crossings, James's polar platform.`,
    faqs: [
      { q: "Which expedition ships does James Wild & Co sell?", a: `${list(cards.map((c) => c.name))} in the Galápagos.` },
      POLAR_FAQ, FARES,
    ],
    atlas: { routes: routesFor(cards), legend: "sea", dest: "galapagos", kicker: "THE VOYAGES · TO THE EDGES", title: "Where Do the Expedition Ships Sail?", line: "Every Galápagos route on one chart: pick one and the globe sails it day by day." } };
  // charter
  const a = registryShip("aliikai")!;
  return { ...base,
    title: "Private Yacht and Small-Ship Charters", intro: T.line,
    answer: `A whole-ship charter gives one party the boat, her crew and her route. Aliikai, for example: ${ALIIKAI_SHIP.charter.text} ${cards.length} ships charter whole in all: ${list(cards.map((c) => c.name))}. Charters other than Aliikai's are priced on enquiry, and James confirms every rate live.`,
    faqs: [
      { q: "What does a whole-yacht charter include?", a: `On Aliikai: the whole yacht for up to 15 guests, crewed and catered, on your route and dates, at ${usd(a.charter!.from!)} a night plus 11% tax (minimum 7 nights in Raja Ampat, 3 in Komodo). Each ship's page says what her operator includes.` },
      { q: "Which ships can we charter?", a: `${list(cards.map((c) => c.name))}.` },
      { q: "Can children come on a charter?", a: "Often younger children can sail on a private charter than on shared departures; each operator sets its own rule, and James confirms it for your party." },
    ],
    adding: x.count ? undefined : "Charters are added as operators publish them.",
    extraSchema: [{ "@type": "Offer", name: "Aliikai, whole-yacht charter", url: "https://www.jameswildco.com/voyages/ships/aliikai#charter", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: a.charter!.from, priceCurrency: "USD", unitText: "night", valueAddedTaxIncluded: false }, seller: { "@type": "TravelAgency", name: "James Wild & Co" } }] };
}

export function watersHub(w: Waters): HubProps {
  const W = WATERS_HUBS[w];
  const cards = cardsFor(shipsInWaters(w));
  const filed = filedOnly(cards);
  const base = { path: W.path, name: W.name, eyebrow: `Volume 04 · Voyages · ${W.countries.join(", ")}`, question: titleCase(W.question), cards, related: { title: "Which Other Waters?", tiles: [...watersTiles(w), polarTile] } };
  if (w === "amazon") {
    const e = SHIPS.find((x) => x.waters === "amazon");
    return { ...base,
      title: "Small-Ship Amazon River Cruises", intro: "River yachts in the Amazon basin: Peru first, with Ecuador and Brazil to follow.",
      answer: e ? `One small ship is filed so far: ${e.data.answer} ${cards[0]?.price?.label === "From" ? `Cruise fares start at ${cards[0].price.amount} per person, two sharing.` : ""}` : "No Amazon ship is filed yet.",
      faqs: [
        { q: "Where do Amazon cruises start?", a: e ? "andBeyond Amazon Explorer boards at Nauta, about two hours by road from Iquitos airport in Peru." : "Ask James." },
        { q: "Which countries does the Amazon hub cover?", a: "Peru, Ecuador and Brazil. Peru is filed first; ships in Ecuador and Brazil are added as their operators' material is filed." },
        FARES,
      ],
      adding: "More Amazon ships, in Peru, Ecuador and Brazil, are added as their photographs and operators' material are filed.",
      atlas: { routes: routesFor(cards), legend: "river", dest: "amazon", kicker: "THE AMAZON · BY RIVER", title: "Where Do the Amazon Ships Sail?", line: "Pick a route and the globe flies to Peru, then sails it day by day from Nauta." } };
  }
  if (w === "galapagos") {
    const yachts = cards.filter((c) => /^Yacht/.test(c.eyebrow)), cats = cards.filter((c) => /^Catamaran/.test(c.eyebrow));
    const grp = (cs: ShipCardData[]) => { const ss = cs.map((c) => SHIPS.find((e) => e.slug === c.slug)!.data); const g = [...new Set(ss.map((s) => factOf(s, /guest/i)))].join(" or "); const n = [...new Set(ss.map((s) => nightsLabel(s)))].join(" or "); const t = tally(cs); return `${g} guests for ${n} at a time${t.from ? `, from ${t.from}` : ""}`; };
    return { ...base,
      title: "Galápagos Yachts and Catamarans", intro: "Small expedition yachts and catamarans in the Galápagos Islands, Ecuador.",
      answer: `Yacht or catamaran in the Galápagos comes down to length of trip and size. Ecoventura's yachts ${list(yachts.map((c) => c.name))} take ${grp(yachts)}, from San Cristobal. Galaxy Cruises' catamarans ${list(cats.map((c) => c.name))} take ${grp(cats)}. Every fare is per person, two sharing, cruise only.`,
      faqs: [
        { q: "Is a yacht or a catamaran better in the Galápagos?", a: `It depends on the trip you want. The Ecoventura yachts sail week-long loops for ${factOf(SHIPS.find((e) => e.slug === yachts[0]?.slug)!.data, /guest/i)} guests; the Galaxy catamarans run shorter 4 and 5 night routes for ${factOf(SHIPS.find((e) => e.slug === cats[0]?.slug)!.data, /guest/i)}.` },
        { q: "Can we charter a whole Galápagos yacht?", a: "Yes. Ecoventura and Galaxy Cruises both publish private charters; James quotes them for your dates." },
        FARES,
      ],
      atlas: { routes: routesFor(cards), legend: "sea", dest: "galapagos", kicker: "THE GALÁPAGOS · BY SEA", title: "Where Do the Galápagos Ships Sail?", line: "Every Galápagos route on one chart: pick one and the globe sails it day by day." } };
  }
  if (w === "indonesia") {
    const s = ALIIKAI_SHIP;
    return { ...base,
      title: "Indonesia by Phinisi: Raja Ampat and Komodo", intro: "Hand-built phinisis and a wooden schooner in Raja Ampat, Komodo and the Banda Sea.",
      answer: `On Aliikai, a 40-metre phinisi for 14 guests, ${s.low !== null && s.high !== null ? `published shared voyages run from ${usd(s.low)} to ${usd(s.high)} per person for 3 to 11 nights, double occupancy, plus 11% tax` : "new shared-voyage dates are to be announced"}; by the night, cabins are US$850 to US$1,150 per person, and the whole yacht charters for ${usd(s.charter.rate)} a night. James sailed Raja Ampat aboard her in November 2024.${filed.length ? ` ${list(filed)} are filed too, with ship pages to follow.` : ""}`,
      faqs: [
        { q: "When is the best time for Raja Ampat and Komodo by boat?", a: "Aliikai sails Komodo from May to September, the Spice Islands in October and Raja Ampat from November to April, when its seas are calmest." },
        { q: "Can we charter a phinisi privately?", a: `Yes. Aliikai is ${usd(s.charter.rate)} a night plus 11% tax for up to 15 guests, minimum 7 nights in Raja Ampat and 3 in Komodo.` },
        FARES,
      ],
      adding: filed.length ? `${list(filed)} have their ship pages to follow, written with James.` : undefined,
      atlas: { routes: routesFor(cards), legend: "sea", dest: "raja-ampat", kicker: "INDONESIA · UNDER SAIL", title: "Where Do the Phinisis Sail?", line: "Aliikai's Raja Ampat and Komodo voyages: pick one and the globe sails it day by day." } };
  }
  // nile
  return { ...base, title: "Nile Cruises Aboard the A&K Sanctuary Ships", intro: "Riverboats and a dahabiya between Luxor and Aswan, each filed with its cabins, deck plan, day by day and every published date.", answer: "", faqs: [],
    atlas: { routes: routesFor(cards), legend: "river", dest: "nile", chart: NILE_CHART, kicker: "THE NILE · BY RIVER", title: "Every Nile Route on One Chart", line: "Pick a ship and a direction: the globe flies to Egypt and sails the river day by day." } };
}

export const ALL_SHIPS_COUNT = SHIP_REGISTRY.length;
