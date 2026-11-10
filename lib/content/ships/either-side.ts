// Either side of the voyage (James, 9 Nov 2026: "develop a pre and post cruise layout ... places like Tahiti, Europe,
// Asia"; approved the same day with "yes to the house stays vs the cruise ship one"). Three steps on a voyage page:
// Arrive (a night or two in the gateway), Sail (the voyage), Stay on (a stay from the house's own collection where
// the ship finishes), plus "Add a night" ideas worth selling, and the operator's own package beside the house's way.
// Stays are library slugs only (lib/content/stays.json): a slug that is not released simply drops out. Operator
// packages are filed from the operator's own site, with its "from" fare and basis. No dashes in public copy.
//
// Pure module, no imports at run time, so the tests load it with plain Node.

export type EitherSideStep = { title: string; nights: string; line: string; stays: string[] };
export type AddNight = { label: string; where: string; line: string; stay?: string; founder?: string };
export type OperatorPackage = { name: string; by: string; nights: number; from: number; basis: string; line: string; hotels: string[]; ship: string; source: string };
export type EitherSide = {
  key: string;
  gateway: string;
  arrive: EitherSideStep;
  stayOn: EitherSideStep;
  addNights: AddNight[];
  operator?: OperatorPackage;
  /** a line on how the two ways differ, in the house voice */
  houseWay: string;
  planTrip: string;
  /** the voyage pages this band appears on, so a stay can show the voyages it is suggested with */
  voyages: { href: string; title: string; sub: string }[];
};

const TAHITI: EitherSide = {
  key: "tahiti",
  gateway: "Papeete, Tahiti",
  arrive: {
    title: "Arrive in Tahiti",
    nights: "1 to 2 nights",
    line: "Windstar's air packages from Los Angeles land the day before the ship sails, and boarding opens at 1 pm. A night on Tahiti's lagoon turns a long flight into the first evening of the trip.",
    stays: ["intercontinental-tahiti-resort-spa", "pearl-resort-le-tahiti"],
  },
  stayOn: {
    title: "Stay on in the islands",
    nights: "3 to 5 nights",
    line: "Guests leave the ship in Papeete by 8 am. From there it is a short flight to Raiatea for the Taha'a lagoon or to Bora Bora, or twenty minutes by air to Tetiaroa.",
    stays: ["pearl-resort-vahine-private-island", "le-tahaa", "the-brando-tetiaroa", "pearl-resort-le-bora-bora"],
  },
  addNights: [
    { label: "A night in Bora Bora", where: "Bora Bora", line: "Before you board or after you leave the ship: an overwater night on the lagoon. James and his wife spent a night in Bora Bora at the InterContinental Thalasso, now closed and rebuilding as the Regent; the house's Bora Bora stays today are the Conrad, Le Bora Bora and the St. Regis.", stay: "conrad-bora-bora-nui", founder: "James stayed a night in Bora Bora" },
    { label: "A night on Taha'a", where: "Vahine Private Island", line: "Nine bungalows on a private motu in the Taha'a lagoon, the island James calls his favourite in French Polynesia. He vetted it in 2025.", stay: "pearl-resort-vahine-private-island", founder: "Founder vetted, 2025" },
    { label: "A day room in Papeete", where: "Tahiti", line: "Flights home leave in the evening; a room on the lagoon fills the day between disembarking at 8 am and the airport.", stay: "intercontinental-tahiti-resort-spa" },
  ],
  operator: {
    name: "Bora Bora & Beyond Overwater Villa",
    by: "Windstar",
    nights: 10,
    from: 7343,
    basis: "per person, double occupancy, as Windstar publishes it",
    line: "Windstar's own package: a night in Papeete, two nights in an overwater villa in Bora Bora with the flights there and back, then the 7-night Dreams of Tahiti aboard Wind Star.",
    hotels: ["intercontinental-tahiti-resort-spa", "conrad-bora-bora-nui"],
    ship: "Wind Star",
    source: "https://www.windstarcruises.com/tour-details/BORABORA_OW_VILLA_T/tahiti/papeete-to-papeete/10-day-bora-bora-and-beyond-overwater-villa/?pkgid=1041596",
  },
  houseWay: "Windstar's package names its hotels \"or similar\" and fixes the order. The house chooses the stay for you from places James has stayed or vetted, sets the nights either side, and books it all as one journey.",
  planTrip: "Tahiti by Windstar, with stays either side",
  voyages: [
    { href: "/voyages/ships/wind-star", title: "Wind Star in French Polynesia", sub: "Windstar, from Papeete" },
    { href: "/voyages/ships/star-breeze", title: "Star Breeze in French Polynesia", sub: "Windstar, from Papeete" },
  ],
};

// Antarctica by HX (James, 9 Nov 2026: "in Antarctica and Arctic we really can't build that", then approved the gateway
// version): the ship cannot be extended, the gateways can. HX's voyages start with a night in Buenos Aires and fly to
// Ushuaia; Patagonia and Iguazú are the natural extensions, and HX sells its own programmes for both.
const ANTARCTICA_HX: EitherSide = {
  key: "antarctica-hx",
  gateway: "Buenos Aires",
  arrive: {
    title: "Arrive in Argentina",
    nights: "2 to 4 nights",
    line: "HX includes one night in Buenos Aires before the flight to Ushuaia and suggests arriving a few days early. The house adds Patagonia first: the glaciers at El Calafate or the peaks at El Chaltén.",
    stays: ["explora-el-calafate", "explora-el-chalten"],
  },
  stayOn: {
    title: "Stay on in Argentina",
    nights: "3 to 4 nights",
    line: "The voyage ends with the flight from Ushuaia back to Buenos Aires. From there Iguazú Falls is a short flight north, or Mendoza's wine country west under the Andes.",
    stays: ["iguazu", "awasi-mendoza"],
  },
  addNights: [
    { label: "A night by the falls", where: "Iguazú", line: "After two weeks of ice, the rainforest and the falls: the house's private lodge beside Iguazú.", stay: "iguazu" },
    { label: "An extra night in Buenos Aires", where: "Buenos Aires", line: "HX's own post programme adds a dinner and tango show in Buenos Aires, US$265 per person; the house can add a night either side of the voyage." },
  ],
  operator: {
    name: "The Iguazú Experience",
    by: "HX",
    nights: 0,
    from: 2796,
    basis: "per person, as HX publishes its post programme",
    line: "HX's own programme after the voyage, sold beside its Antarctic Circle Expedition; HX's Breathtaking Patagonia programme before the voyage is from US$1,675 per person.",
    hotels: [],
    ship: "MS Roald Amundsen",
    source: "https://www.travelhx.com/en-us/cruises/antarctic-circle-expedition/",
  },
  houseWay: "HX's programmes fix the hotel and the days. The house builds Patagonia before and Iguazú or Mendoza after from lodges in its own collection, and books the flights between them with the voyage.",
  planTrip: "Antarctica with HX, with Argentina either side",
  voyages: [{ href: "/voyages/polar/hx-antarctic-circle-expedition", title: "Antarctic Circle Expedition", sub: "HX, aboard MS Roald Amundsen" }],
};

/** By ship, then by waters: every ship in these waters gets the band. */
const BY_SLUG: Record<string, EitherSide> = { "ms-roald-amundsen": ANTARCTICA_HX, "hx-antarctic-circle-expedition": ANTARCTICA_HX };
const BY_WATERS: Record<string, EitherSide> = { tahiti: TAHITI };

export const eitherSideFor = (slug: string, waters: string | null | undefined): EitherSide | null => BY_SLUG[slug] ?? (waters ? BY_WATERS[waters] ?? null : null);

/** The voyages a stay is suggested with, before or after the ship (James, 10 Nov 2026: the routes a stay is on, built
 *  into the logic): read from the bands above, so a stay added to a band appears on its own page without a second list. */
export function voyagesThrough(stay: string): { href: string; eyebrow: string; title: string; sub: string; line: string }[] {
  const out: { href: string; eyebrow: string; title: string; sub: string; line: string }[] = [];
  for (const d of [TAHITI, ANTARCTICA_HX]) {
    const before = d.arrive.stays.includes(stay);
    const after = d.stayOn.stays.includes(stay) || d.addNights.some((a) => a.stay === stay) || !!d.operator?.hotels.includes(stay);
    if (!before && !after) continue;
    const when = before && after ? "before or after the voyage" : before ? "before the voyage" : "after the voyage";
    for (const v of d.voyages) if (!out.some((o) => o.href === v.href)) out.push({ href: v.href, eyebrow: "Voyage", title: v.title, sub: v.sub, line: `The house suggests this stay ${when}.` });
  }
  return out;
}
