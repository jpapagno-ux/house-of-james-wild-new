import type { Partner, PartnerItinerary } from "./types";
import type { ShipRecord } from "@/lib/content/ships/types";
import { today } from "@/lib/dates";
import AquaMekong from "@/lib/content/ships/mekong/aqua-mekong.json";
import AquaNera from "@/lib/content/ships/amazon/aqua-nera.json";
import AriaAmazon from "@/lib/content/ships/amazon/aria-amazon.json";
import AquaMare from "@/lib/content/ships/galapagos/aqua-mare.json";
import AquaBlu from "@/lib/content/ships/indonesia/aqua-blu.json";
import AquaLares from "@/lib/content/ships/seychelles/aqua-lares.json";

// Aqua Expeditions (James, 13 Nov 2026: "build out that portfolio to include all their itineraries globally"),
// filed from aquaexpeditions.com (ship, destination and about pages) and Aqua's own booking data, which
// scripts/partners/aqua-build.mjs turns into the six ship pages. Photographs and films: Aqua Expeditions
// (partner agreement). Claims about themselves are quoted with where they say them. No commission or net rates.
// The "from" fares are the lowest published per-person fare among the departures still to sail.
const ships = [AquaMekong, AquaNera, AriaAmazon, AquaMare, AquaBlu, AquaLares] as unknown as ShipRecord[];
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const fromOf = (s: ShipRecord, itinerary?: string) => {
  const t = today();
  const all = s.departures.filter((d) => d.date >= t && (!itinerary || d.itinerary === itinerary)).flatMap((d) => Object.values(d.prices)).filter((p): p is number => typeof p === "number" && p > 0);
  return all.length ? Math.min(...all) : null;
};
const REGION: Record<string, string> = { "aqua-mekong": "Cambodia and Vietnam", "aqua-nera": "Peruvian Amazon", "aria-amazon": "Peruvian Amazon", "aqua-mare": "Galápagos", "aqua-blu": "Indonesia", "aqua-lares": "Seychelles, Tanzania and the Arctic" };
const items: PartnerItinerary[] = ships.flatMap((s) =>
  s.itineraries.map((it) => {
    const from = fromOf(s, it.name);
    return { name: it.name.replace(/^(\d+)-night /, "$1 nights: "), href: `/voyages/ships/${s.slug}#itinerary`, eyebrow: `${s.name} · ${REGION[s.slug]}`, line: it.direction, image: s.hero, price: from ? `From ${usd(from)}` : "Ask us", facts: [["Nights", String(it.nights)]] as [string, string][] };
  }),
);

export const AQUA_EXPEDITIONS: Partner = {
  slug: "aqua-expeditions",
  name: "Aqua Expeditions",
  kind: "Small-ship operator",
  seo: {
    title: "Aqua Expeditions: Every Ship, Itinerary and Fare | James Wild & Co",
    description: "Aqua Expeditions' six ships: Aqua Mekong, Aqua Nera, Aria Amazon, Aqua Mare, Aqua Blu and Aqua Lares. The Mekong, the Amazon, the Galápagos, Indonesia, the Seychelles and Svalbard, with every departure.",
    keywords: ["Aqua Expeditions", "Aqua Expeditions ships", "Aqua Mekong", "Aqua Nera", "Aqua Mare", "Aqua Blu", "Aqua Lares", "luxury small ship expeditions"],
  },
  line: "Six small luxury ships, 16 to 40 guests, from the Mekong and the Amazon to Aldabra and Svalbard.",
  answer: "Aqua Expeditions is a luxury small-ship company founded in 2007 by Francesco Galli Zugaro. Its six ships carry 16 to 40 guests: Aqua Mekong on the Mekong, Aqua Nera and Aria Amazon in the Peruvian Amazon, the superyacht Aqua Mare in the Galápagos, Aqua Blu in Indonesia, and Aqua Lares in the Seychelles, Zanzibar and Svalbard. Each sails with a crew close to one per guest, twice-daily guided excursions and a menu by a named chef.",
  who: {
    facts: [
      ["Founded", "2007, by Francesco Galli Zugaro"],
      ["Fleet", "Six ships: Aria Amazon, Aqua Mekong, Aqua Blu, Aqua Nera, Aqua Mare and Aqua Lares"],
      ["Guests", "16 (Aqua Mare) to 40 (Aqua Mekong and Aqua Nera)"],
      ["Waters", "The Peruvian Amazon, the Mekong in Cambodia and Vietnam, the Galápagos, eastern Indonesia, the Seychelles and Tanzania, and Svalbard, Arctic Norway and the Scottish Isles"],
      ["Group", "Part of the PONANT Explorations Group"],
    ],
    history: [
      ["2007", "Founded by Francesco Galli Zugaro"],
      ["2011", "Aria Amazon launches in Peru"],
      ["2014", "Aqua Mekong launches on the Mekong"],
      ["2019", "Aqua Blu, the former HMS Beagle, begins sailing in Indonesia"],
      ["2021", "Aqua Nera launches in the Peruvian Amazon"],
      ["2022", "Aqua Mare's inaugural Galápagos voyage, June"],
      ["2026", "Aqua Lares: the Seychelles and Tanzania from February, Svalbard from June"],
    ],
  },
  how: {
    paragraphs: [
      "Every Aqua ship is small: 16 to 40 guests, with a crew close to one per guest. Each day has two guided excursions by skiff, tender, kayak, bicycle or on foot, in small groups, and each ship has a menu by a named chef: Pedro Miguel Schiaffino in the Amazon and the Galápagos, Karime López on Aqua Lares.",
      "Aqua publishes every departure and every cabin category's fare, and we read them from its own booking system for these pages. Meals, selected wines and beer, excursions and group transfers on its recommended flights are included; the Galápagos park fees and flights are not.",
      "Every ship can also be chartered whole. Aqua Mare and Aqua Lares are sold both by the cabin and as private yachts.",
    ],
    facts: [
      ["Excursions", "Twice daily, guided, in small groups"],
      ["Galápagos guides", "Eight guests to a naturalist guide on Aqua Mare"],
      ["Internet", "Starlink on the river ships and Aqua Blu; WiFi on Aqua Lares"],
      ["Films", "A film on each ship's page, from Aqua's own channel"],
    ],
  },
  fleet: ["aqua-mekong", "aqua-nera", "aria-amazon", "aqua-mare", "aqua-blu", "aqua-lares"],
  itineraries: { title: `${items.length} Itineraries on Six Ships`, items },
  apart: [
    { claim: "The first true superyacht in the Galápagos Islands", attribution: "Aqua Mare page" },
    { claim: "The archipelago's best guest-to-guide ratio, with only eight guests per expert naturalist guide", attribution: "Galápagos cruise page" },
    { claim: "The world's first superyacht offering both individual cabin bookings and private charters for expeditions in East Africa and the Norwegian Arctic", attribution: "Aqua Lares page" },
    { claim: "The only luxury Mekong river cruise that provides complimentary flight extensions to Siem Reap during the low water season", attribution: "Mekong river cruise page" },
    { claim: "A 1:1 crew-to-guest ratio", attribution: "Mekong river cruise page" },
  ],
  sustainability: [
    "Seventy per cent of the ingredients in Aqua Nera's kitchen are sourced locally, per Aqua",
    "Aqua Mare's menu sources from local farmers and fishermen in the spirit of Galápagos conservation, per Aqua",
    "Beach clean-ups in eastern Indonesia with IWP, per Aqua's own film",
  ],
  why: [
    "It publishes every departure and every cabin's fare, so the price on these pages is the price Aqua sells at.",
    "Its ships are small: 16 to 40 guests, with a crew close to one per guest.",
    "It reaches places few ships go: Aldabra, the Forgotten Islands, the Asmat of West Papua, Svalbard's pack ice.",
    "One company across six regions, so a second trip can keep the same standard.",
  ],
  faqs: [
    ["What is Aqua Expeditions?", "A luxury small-ship company founded in 2007, with six ships of 16 to 40 guests in the Amazon, the Mekong, the Galápagos, Indonesia, the Seychelles and Tanzania, and the Arctic."],
    ["Which Aqua Expeditions ship should I choose?", "By place: Aqua Mekong for Cambodia and Vietnam; Aqua Nera or Aria Amazon for the Peruvian Amazon; Aqua Mare for the Galápagos; Aqua Blu for Komodo, Raja Ampat and the Spice Islands; Aqua Lares for the Seychelles, Zanzibar or Svalbard."],
    ["How much does an Aqua Expeditions cruise cost?", "From about US$3,900 per person for three nights on Aria Amazon to US$30,000 and more for the Owner's Suite on Aqua Mare or Aqua Lares. Every departure's fare is on each ship's page."],
    ["What is included?", "All meals, selected wines and beer, twice-daily guided excursions and group transfers on Aqua's recommended flights; laundry and internet on most ships. Flights and park fees, such as the Galápagos', are extra."],
    ["Can you charter a whole Aqua Expeditions ship?", "Yes. Every ship can be chartered; Aqua Mare (16 guests) and Aqua Lares (30) are often taken whole."],
    ["Are children welcome?", "Aqua does not publish one age for every ship; ask us and we will confirm it for the ship and date."],
    ["Does Aqua Expeditions sail the Arctic?", "Yes, from June 2026: Aqua Lares sails Svalbard, Arctic Norway and the Scottish Isles for five to 14 nights."],
  ],
  hero: { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-mare/horizon", alt: "Aqua Mare on the horizon at sea", credit: "Aqua Expeditions" },
  gallery: [
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-mekong/vessel-20", alt: "Aqua Mekong sailing the Mekong in Cambodia", credit: "Aqua Expeditions" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-nera/exterior", alt: "Aqua Nera on a black water river in the Peruvian Amazon", credit: "Aqua Expeditions" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-blu/exterior", alt: "Aqua Blu at anchor among Indonesia's islands", credit: "Aqua Expeditions" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-lares/seychelles", alt: "Aqua Lares in the Seychelles", credit: "Aqua Expeditions" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-mare/snorkelling", alt: "Snorkelling in the Galápagos with Aqua Mare", credit: "Aqua Expeditions" },
    { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/voyages/ships/aqua-lares/svalbard", alt: "Aqua Lares among the glaciers of Svalbard", credit: "Aqua Expeditions" },
  ],
  credit: "Aqua Expeditions",
  related: [{ label: "The Amazon by river ship", href: "/voyages/amazon" }, { label: "The Galápagos by yacht", href: "/voyages/galapagos" }, { label: "Indonesia by yacht", href: "/voyages/indonesia" }],
  organization: { foundingDate: "2007" },
  sources: ["https://www.aquaexpeditions.com/about-us", "https://www.aquaexpeditions.com/cruise-ships/aqua-mare", "https://www.aquaexpeditions.com/cruise-ships/aqua-lares", "https://www.aquaexpeditions.com/destinations/mekong-river-cruise", "https://www.aquaexpeditions.com/destinations/galapagos-cruise", "https://book.aquaexpeditions.com"],
  checked: "2026-11-13",
};
