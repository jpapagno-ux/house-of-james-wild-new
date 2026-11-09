// Preview C ("the house opening") content for three records (James, 8 Nov 2026). Facts from each record (Antarctica21's
// and Ecoventura's own sites); photographs from Cloudinary with their recorded credits: brand and partner images, and
// James's own March 2020 Peninsula photographs (another ship, so used only for the place and captioned as his).
// Palettes: night = pathway accent 45% + the hero photograph's darkest tone 25% + Ink 30%; day = white 93% + the
// photograph's lightest tone 4% + accent 3%; hi = the photograph's light tone lifted. AA: white on night 11.7 to 13:1.
import type { HouseOpeningProps, OpeningImage, NextSailing } from "@/components/opening/HouseOpening";
import type { PolarVoyage } from "@/lib/content/polar";

const img = (id: string, alt: string, credit: string, caption?: string, w = 2560): OpeningImage =>
  ({ src: `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto:best,c_limit,w_${w}/${id}`, alt, credit, caption });
const A21 = "Photograph courtesy of Antarctica21";
const PARTNER = "Partner image";
const JAMES = "James Papagno, March 2020";
const ECO = (who?: string) => (who ? `Photo: ${who} for Ecoventura` : "Photograph courtesy of Ecoventura");
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const SHIP: Record<string, string> = { "magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer" };

/** The next open sailing of a polar voyage (sold-out sailings skipped). */
export function polarNext(v: PolarVoyage, plan: string): NextSailing {
  const s = v.sailings.find((x) => !/sold|full/i.test(x.status ?? ""));
  if (!s) return null;
  const from = Math.min(...Object.values(s.prices).filter((n): n is number => typeof n === "number"));
  return { date: fmt(s.date), ship: SHIP[s.ship] ?? s.ship, from: Number.isFinite(from) ? usd(from) : undefined, href: `${plan}&date=${s.date}` };
}

type Base = Omit<HouseOpeningProps, "next" | "grain">;

export const CLASSIC_C: Base = {
  palette: { night: "#163A5D", deep: "#182C41", day: "#F7F9FB", hi: "#E4ECF3" },
  pathway: "PATH-04",
  marker: "62° 10′ S · King George Island",
  designation: "Voyages · Air-Cruise · Antarctica21",
  title: "Classic Antarctica Air-Cruise",
  place: "Punta Arenas to the South Shetlands and the Antarctic Peninsula",
  line: "Eight days, and no Drake crossing: a two-hour flight to King George Island, then four days among the South Shetlands and the western Peninsula aboard a ship of 88 guests at most.",
  frames: [
    img("wildco/voyages/polar/antarctica/antarctic-peninsula-iceberg-alley", "Towering white icebergs in deep blue water off the Antarctic Peninsula, a small expedition boat at their base", PARTNER, "Iceberg alley, the Antarctic Peninsula"),
    img("jwco/partners/antarctica21/aircraft-landing-king-george-island", "Antarctica21 charter flight landing on King George Island", A21, "The way in: King George Island"),
    img("jwco/partners/antarctica21/aircraft-over-ship", "Aircraft flying low over snowy mountains and the sea with an expedition ship below", A21, "Air and ship"),
  ],
  glance: [["Length", "8 days, 7 nights"], ["Flight", "About 2 hours each way"], ["Guests", "Up to 88"], ["Ships", "Magellan Explorer or Discoverer"]],
  why: [
    { title: "Fly over the Drake", line: "About two hours by air from Punta Arenas to King George Island, so the days go to the ice, not the crossing.", photo: img("jwco/partners/antarctica21/aircraft-in-flight", "Four engine Antarctic charter aircraft in flight", A21, undefined, 1600) },
    { title: "Ashore every day", line: "Daily Zodiac landings led by guides among the South Shetlands and the western Peninsula, with talks on board.", photo: img("jwco/partners/antarctica21/zodiac-among-ice", "Guests in an inflatable boat surrounded by ice", A21, undefined, 1600) },
    { title: "Eighty-eight guests, at most", line: "A small ship, so more time ashore for everyone on board.", photo: img("jwco/partners/antarctica21/adelie-penguins", "A group of Adelie penguins on ice in Antarctica", A21, undefined, 1600) },
  ],
  close: { photo: img("wildco/voyages/journal/captains-log-antarctica-2020/zodiac-between-giant-icebergs", "A Zodiac full of guests passes between two massive icebergs", JAMES, "A Zodiac between the bergs"), line: "James sailed the Peninsula in February and March 2020. This is the light he still talks about." },
  planHref: "/plan?trip=Classic%20Antarctica%20Air-Cruise",
};

export const POLAR_CIRCLE_C: Base = {
  palette: { night: "#2A3140", deep: "#24272F", day: "#F8F8F9", hi: "#E7E5E2" },
  pathway: "PATH-06",
  marker: "Toward 66° 33′ S · the Polar Circle",
  designation: "Voyages · Air-Cruise · Antarctica21",
  title: "Polar Circle Air-Cruise",
  place: "Punta Arenas, the western Peninsula and far south toward the Polar Circle",
  line: "Antarctica21's longest air-cruise on the Peninsula: ten days, six of them on board, sailing south through the Gerlache and Penola straits toward the Polar Circle when ice and weather allow.",
  frames: [
    img("jwco/partners/antarctica21/voyages/polar-circle-air-cruise/3", "Zodiac excursion among the ice in Antarctica", A21, "Among the ice"),
    img("jwco/partners/antarctica21/aircraft-in-flight", "Four engine Antarctic charter aircraft in flight with landing gear down", A21, "The way in, by air"),
    img("jwco/partners/antarctica21/voyages/polar-circle-air-cruise/2", "Guests on snowshoes watching penguins on a snowy shore with icebergs beyond", A21, "Ashore, far south"),
  ],
  glance: [["Length", "10 days, 9 nights"], ["On board", "6 days"], ["Runs", "February"], ["Guests", "Up to 88"]],
  why: [
    { title: "As far south as the ice allows", line: "The goal is the Polar Circle; the route is set each day by ice and weather, through Crystal Sound when it opens.", photo: img("jwco/partners/antarctica21/voyages/polar-circle-air-cruise/1", "Chinstrap penguin standing on snow with wings spread", A21, undefined, 1600) },
    { title: "Six days on the Peninsula", line: "Daily Zodiac landings, small group hikes and exploratory Zodiac outings between the South Shetlands and the western Peninsula.", photo: img("jwco/partners/antarctica21/zodiac-among-ice", "Guests in an inflatable boat surrounded by ice", A21, undefined, 1600) },
    { title: "The Drake, by air", line: "About two hours from Punta Arenas to King George Island each way.", photo: img("jwco/partners/antarctica21/aircraft-gravel-runway", "A white four engine aircraft on a gravel runway edged with snow", A21, undefined, 1600) },
  ],
  close: { photo: img("wildco/voyages/journal/captains-log-antarctica-2020/tabular-iceberg-violet-sunset", "A flat-topped tabular iceberg along the horizon under a violet and orange sunset", JAMES, "A tabular berg at sunset"), line: "It runs in February, the voyage that aims furthest south." },
  planHref: "/plan?trip=Polar%20Circle%20Air-Cruise",
};

export const ORIGIN_C: Base = {
  palette: { night: "#1A374E", deep: "#1A2B38", day: "#F6F6F6", hi: "#DBC5A3" },
  pathway: "PATH-04",
  marker: "0° 54′ S · San Cristóbal",
  designation: "Voyages · Expedition yacht · Ecoventura",
  title: "Origin",
  place: "Two 7-night Galápagos loops from San Cristóbal",
  line: "Twenty guests, ten staterooms and two naturalist guides on a 43-metre expedition yacht, sailing every Sunday: Beaches and Bays one week, Volcanic Wonders the next, fourteen nights without repeating a site.",
  frames: [
    img("wildco/guides/galapagos/destination/landscape/leon-dormido-06", "León Dormido, Kicker Rock, off San Cristóbal", ECO("Brooke Pyke"), "León Dormido, San Cristóbal"),
    img("wildco/voyages/vessels/ecoventura-fleet/00-origin-theory", "Ecoventura's sister yachts Origin and Theory in the Galápagos", ECO(), "Origin and her sister Theory"),
    img("wildco/voyages/vessels/ecoventura-fleet/decks/4-12-jacuzzi", "The jacuzzi on deck with Kicker Rock beyond", ECO("Dana Bjarner"), "The sundeck, Kicker Rock beyond"),
  ],
  glance: [["Length", "7 nights, or 14"], ["Guests", "20"], ["Guides", "2 naturalists"], ["Departs", "San Cristóbal, Sundays"]],
  why: [
    { title: "Two naturalists for twenty", line: "Thirteen crew in all, two of them naturalist guides, for twenty guests.", photo: img("wildco/guides/galapagos/destination/activities/snorkeling-02", "Snorkelling with Galápagos marine life", ECO("Ollie Clarke"), undefined, 1600) },
    { title: "Fourteen nights, no repeats", line: "Beaches and Bays to Española, Floreana and Bartolomé; Volcanic Wonders north to Genovesa and west to Fernandina.", photo: img("wildco/guides/galapagos/destination/activities/land-excursions-08", "Guided hike on Bartolomé Island", ECO("Jaime Trejo"), undefined, 1600) },
    { title: "Built for the islands", line: "A hull designed to cut time between islands, which leaves more of each day ashore.", photo: img("wildco/guides/galapagos/destination/wildlife/galapagos-penguin", "Galápagos penguin", ECO("Brooke Pyke"), undefined, 1600) },
  ],
  close: { photo: img("wildco/guides/galapagos/destination/landscape/sombrero-chino-13", "Sombrero Chino, the Chinese Hat islet off Santiago", ECO("Maysa Santoro"), "Sombrero Chino"), line: "Every Sunday from San Cristóbal." },
  planHref: "/plan?trip=Origin%20(Ecoventura)",
};
