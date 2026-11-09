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
    { label: "A night in Bora Bora", where: "Bora Bora", line: "Before you board or after you leave the ship: an overwater night on the lagoon. James and his wife spent a night in Bora Bora at the Thalasso; the house's Bora Bora stays include the Conrad, Le Bora Bora and the St. Regis.", stay: "conrad-bora-bora-nui", founder: "James stayed a night in Bora Bora" },
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
};

/** By waters: every ship in these waters gets the band. */
const BY_WATERS: Record<string, EitherSide> = { tahiti: TAHITI };

export const eitherSideFor = (_slug: string, waters: string | null | undefined): EitherSide | null => (waters ? BY_WATERS[waters] ?? null : null);
