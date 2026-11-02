import { SHIPS } from "./index";
import { cardsFor, tally, type ShipCardData } from "./cards";
import { POLAR_WATERS, SHIP_REGISTRY, VOYAGE_TYPES, WATERS_HUBS, registryShip, shipsInWaters, shipsOfType, type VoyageType, type Waters } from "./registry";
import { atlasRoutes } from "./atlas";
import { NILE_CHART } from "./routes";
import { ALIIKAI_SHIP } from "./aliikai";
import { factOf, nightsLabel } from "./types";
import type { HubProps } from "@/components/ships/VoyageHub";
import type { Tile } from "@/components/ships/VoyageTiles";
import { POLAR_PATH, POLAR_VOYAGES, voyageFrom } from "@/lib/content/polar";

// The copy for every Voyages hub, built from the registry and the ships' own records: each
// opening answers the question people search, in facts the ship pages already carry. No hub
// names a ship that is not filed; hubs still filling say so in one line.

const SMALL = new Set(["a", "an", "the", "for", "or", "in", "of", "to", "and", "on", "by"]);
/** House headings are title case: "Which Small-Ship River Cruise Is Right for You?" */
const titleCase = (q: string) => q.split(" ").map((w, i) => (i > 0 && SMALL.has(w) ? w : w.split("-").map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join("-"))).join(" ");
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");
// The polar card opens Polar Crossings on this site (/voyages/polar, James, 2 Nov 2026); only that
// page links out to polarcrossings.com.
const polarLows = POLAR_VOYAGES.map(voyageFrom).filter((n): n is number => typeof n === "number");
export const polarTile: Tile = { key: "polar", name: "Polar Crossings", href: POLAR_PATH, line: "Antarctica, South Georgia, the Falklands and Patagonia with Antarctica21.", note: `${POLAR_VOYAGES.length} itineraries`, from: polarLows.length ? usd(Math.min(...polarLows)) : null };

/** "Origin (yacht, Ecoventura; 7 nights; 20 guests; from US$10,950)" from the ship's own record. */
function brief(c: ShipCardData): string {
  const e = SHIPS.find((x) => x.slug === c.slug);
  if (!e) return `${c.name} (${c.eyebrow.toLowerCase().replace(" · ", ", ")}; ship page to follow)`;
  const s = e.data;
  const g = s.glance?.guests ?? factOf(s, /guest/i);
  const gw = g ? g.replace(/\s*\(.*?\)/, "").replace(/^Up to/, "up to") : null;
  const parts = [c.eyebrow.replace(" · ", ", ").replace(/^\w/, (x) => x.toLowerCase()), nightsLabel(s), gw ? `${gw} guests` : null, c.price ? (c.price.label === "From" ? `from ${c.price.amount}` : c.price.label === "Journeys" ? `${s.operator} journeys from ${c.price.amount}` : c.price.amount.toLowerCase()) : null, /^launching/.test(s.status) ? s.status : null];
  return `${c.name} (${parts.filter(Boolean).join("; ")})`;
}
const briefs = (cs: ShipCardData[]) => cs.map(brief).join(". ");
const filedOnly = (cs: ShipCardData[]) => cs.filter((c) => !c.page).map((c) => c.name);

function typeTiles(except: VoyageType): Tile[] {
  return (Object.keys(VOYAGE_TYPES) as VoyageType[]).filter((t) => t !== except).map((t) => { const x = tally(cardsFor(shipsOfType(t))); return { key: t, name: VOYAGE_TYPES[t].name, href: VOYAGE_TYPES[t].path, line: VOYAGE_TYPES[t].line, count: x.count, from: x.from }; });
}
function watersTiles(except?: Waters): Tile[] {
  return (Object.keys(WATERS_HUBS) as Waters[]).filter((w) => w !== except && !POLAR_WATERS.includes(w)).map((w) => { const x = tally(cardsFor(shipsInWaters(w))); return { key: w, name: WATERS_HUBS[w].name, href: WATERS_HUBS[w].path, line: WATERS_HUBS[w].countries.join(", "), count: x.count, from: x.from }; });
}
const routesFor = (cards: ShipCardData[]) => atlasRoutes(SHIPS.filter((e) => cards.some((c) => c.slug === e.slug)));
const FARES = { q: "How are the fares shown?", a: "Per person, two sharing, as each operator publishes them, with past departures removed automatically. Every fare and every cabin is confirmed live when you ask." };
const POLAR_FAQ = { q: "Where are the polar voyages?", a: `In Polar Crossings, the house's polar arm under To the Edges: all ${POLAR_VOYAGES.length} Antarctica21 itineraries, each with its own page.` };

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
      { q: "Which river cruises does James Wild & Co sell?", a: `${list(cards.map((c) => c.name))}: A&K Sanctuary on the Nile, and ${list([...new Set(cards.filter((c) => c.waters.includes("amazon")).map((c) => c.eyebrow.split(" · ")[1]).filter(Boolean))])} in the Amazon.` },
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
    atlas: { routes: routesFor(cards), legend: "sea", dest: "raja-ampat", kicker: "THE VOYAGES · UNDER SAIL", title: "Where Do the Sailing Ships Go?", line: "Aliikai's and Amandira's routes in Raja Ampat and Komodo: pick one and the globe sails it day by day." } };
  if (t === "expedition") {
    const gal = cards.filter((c) => c.waters.includes("galapagos")), pol = cards.filter((c) => c.waters.includes("antarctica"));
    const where = [gal.length ? `${list(gal.map((c) => c.name))} in the Galápagos` : "", pol.length ? `${list(pol.map((c) => c.name))} in Antarctica, South Georgia, the Falklands and Patagonia` : ""].filter(Boolean);
    return { ...base,
    title: "Small Expedition Ships", intro: T.line,
    answer: `Voyages files ${cards.length} expedition ships: ${briefs(cards)}. Every Antarctica21 itinerary, with its own page, sits in Polar Crossings, the house's polar arm.`,
    faqs: [
      { q: "Which expedition ships does James Wild & Co sell?", a: `${list(where)}.` },
      POLAR_FAQ, FARES,
    ],
    atlas: { routes: routesFor(gal), legend: "sea", dest: "galapagos", kicker: "THE VOYAGES · TO THE EDGES", title: "Where Do the Galápagos Expedition Ships Sail?", line: "Every Galápagos route on one chart: pick one and the globe sails it day by day. The polar routes have their own chart in Polar Crossings." } };
  }
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
    // By country, in the hub's order (Peru, Ecuador, Brazil), from each ship's own record.
    const byCountry = W.countries.map((k) => ({ k, cs: cards.filter((c) => shipsInWaters("amazon").find((r) => r.slug === c.slug)?.country.includes(k)) })).filter((x) => x.cs.length);
    const port = (slug: string) => SHIPS.find((e) => e.slug === slug)?.data.glance?.route ?? null;
    return { ...base,
      title: "Small-Ship Amazon River Cruises", intro: "Small river ships in the Amazon basin of Peru, Ecuador and Brazil, each filed from her operator's own site.",
      answer: `Voyages files ${cards.length} small ships in the Amazon. ${byCountry.map(({ k, cs }) => `In ${k}: ${briefs(cs)}.`).join(" ")} The right one depends on the river and the length of trip you want: each ship page lists her cabins, her day by day and her published fares, or says "ask us" where the operator publishes none.`,
      faqs: [
        { q: "Where do Amazon cruises start?", a: byCountry.map(({ k, cs }) => `${k}: ${cs.map((c) => `${c.name}, ${(port(c.slug) ?? "ask us").toLowerCase()}`).join("; ")}`).join(". ") + "." },
        { q: "Which countries does the Amazon hub cover?", a: `Peru, Ecuador and Brazil: ${byCountry.map(({ k, cs }) => `${cs.length} in ${k}`).join(", ")} so far.` },
        FARES,
      ],
      adding: "More Amazon ships are added as their photographs and operators' material are filed.",
      atlas: { routes: routesFor(cards), legend: "river", dest: "amazon", kicker: "THE AMAZON · BY RIVER", title: "Where Do the Amazon Ships Sail?", line: "Pick a route and the globe flies to the Amazon, then sails it day by day." } };
  }
  if (w === "galapagos") {
    const yachts = cards.filter((c) => /^Yacht/.test(c.eyebrow)), cats = cards.filter((c) => /^Catamaran · Galaxy/.test(c.eyebrow));
    // Ships beyond Ecoventura's yachts and Galaxy's catamarans (Via Natura's Hermes), each in her own brief.
    const others = cards.filter((c) => !yachts.includes(c) && !cats.includes(c));
    const grp = (cs: ShipCardData[]) => { const ss = cs.map((c) => SHIPS.find((e) => e.slug === c.slug)!.data); const g = [...new Set(ss.map((s) => factOf(s, /guest/i)))].join(" or "); const n = [...new Set(ss.map((s) => nightsLabel(s)))].join(" or "); const t = tally(cs); return `${g} guests for ${n} at a time${t.from ? `, from ${t.from}` : ""}`; };
    return { ...base,
      title: "Galápagos Yachts and Catamarans", intro: "Small expedition yachts and catamarans in the Galápagos Islands, Ecuador.",
      answer: `Yacht or catamaran in the Galápagos comes down to length of trip and size. Ecoventura's yachts ${list(yachts.map((c) => c.name))} take ${grp(yachts)}, from San Cristobal. Galaxy Cruises' catamarans ${list(cats.map((c) => c.name))} take ${grp(cats)}.${others.length ? ` Also filed: ${briefs(others)}.` : ""} Every fare is per person, two sharing, cruise only.`,
      faqs: [
        { q: "Is a yacht or a catamaran better in the Galápagos?", a: `It depends on the trip you want. The Ecoventura yachts sail week-long loops for ${factOf(SHIPS.find((e) => e.slug === yachts[0]?.slug)!.data, /guest/i)} guests; the Galaxy catamarans run shorter 4 and 5 night routes for ${factOf(SHIPS.find((e) => e.slug === cats[0]?.slug)!.data, /guest/i)}.` },
        { q: "Can we charter a whole Galápagos yacht?", a: `Yes. ${list([...new Set(cards.filter((c) => c.types.includes("charter")).map((c) => shipsInWaters("galapagos").find((r) => r.slug === c.slug)?.operator).filter((o): o is string => !!o))])} all publish private charters; James quotes them for your dates.` },
        FARES,
      ],
      atlas: { routes: routesFor(cards), legend: "sea", dest: "galapagos", kicker: "THE GALÁPAGOS · BY SEA", title: "Where Do the Galápagos Ships Sail?", line: "Every Galápagos route on one chart: pick one and the globe sails it day by day." } };
  }
  if (w === "indonesia") {
    const s = ALIIKAI_SHIP;
    const amandira = cards.some((c) => c.slug === "amandira" && c.page);
    return { ...base,
      title: "Indonesia by Phinisi: Raja Ampat and Komodo", intro: "Hand-built phinisis and a wooden schooner in Raja Ampat, Komodo and the Banda Sea.",
      answer: `On Aliikai, a 40-metre phinisi for 14 guests, ${s.low !== null && s.high !== null ? `published shared voyages run from ${usd(s.low)} to ${usd(s.high)} per person for 3 to 11 nights, double occupancy, plus 11% tax` : "new shared-voyage dates are to be announced"}; by the night, cabins are US$850 to US$1,150 per person, and the whole yacht charters for ${usd(s.charter.rate)} a night. James sailed Raja Ampat aboard her in November 2024.${amandira ? ` Aman's Amandira, a 52-metre phinisi for up to 10 guests in five cabins, sails as a private charter; Aman publishes no rates, so James quotes her.` : ""}${filed.length ? ` ${list(filed)} are filed too, with ship pages to follow.` : ""}`,
      faqs: [
        { q: "When is the best time for Raja Ampat and Komodo by boat?", a: "Aliikai sails Komodo from May to September, the Spice Islands in October and Raja Ampat from November to April, when its seas are calmest." },
        { q: "Can we charter a phinisi privately?", a: `Yes. Aliikai is ${usd(s.charter.rate)} a night plus 11% tax for up to 15 guests, minimum 7 nights in Raja Ampat and 3 in Komodo.${amandira ? " Amandira is chartered only, for up to 10 guests; Aman quotes her on request." : ""}` },
        FARES,
      ],
      adding: filed.length ? `${list(filed)} have their ship pages to follow, written with James.` : undefined,
      atlas: { routes: routesFor(cards), legend: "sea", dest: "raja-ampat", kicker: "INDONESIA · UNDER SAIL", title: "Where Do the Phinisis Sail?", line: "Aliikai's and Amandira's Raja Ampat and Komodo voyages: pick one and the globe sails it day by day." } };
  }
  // nile
  return { ...base, title: "Nile Cruises Aboard the A&K Sanctuary Ships", intro: "Riverboats and a dahabiya between Luxor and Aswan, each filed with its cabins, deck plan, day by day and every published date.", answer: "", faqs: [],
    atlas: { routes: routesFor(cards), legend: "river", dest: "nile", chart: NILE_CHART, kicker: "THE NILE · BY RIVER", title: "Every Nile Route on One Chart", line: "Pick a ship and a direction: the globe flies to Egypt and sails the river day by day." } };
}

export const ALL_SHIPS_COUNT = SHIP_REGISTRY.length;
