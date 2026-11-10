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
const ECO = (who?: string) => (who ? `Photo: ${who} for Ecoventura` : "Photograph courtesy of Ecoventura");
const fmt = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const SHIP: Record<string, string> = { "magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer", "ms-roald-amundsen": "MS Roald Amundsen", "ms-fridtjof-nansen": "MS Fridtjof Nansen" };

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
  close: { photo: img("jwco/partners/antarctica21/voyages/classic-antarctica-air-cruise/3", "Travellers walking across the snow in Antarctica", A21, "Ashore on the Peninsula"), line: "Fly in, sail the Peninsula, fly home: the classic way to Antarctica without the Drake." },
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
  close: { photo: img("jwco/partners/antarctica21/voyages/classic-antarctica-air-cruise/1", "Zodiac excursion in Antarctica", A21, "Among the ice, far south"), line: "It runs in February, the voyage that aims furthest south." },
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
    { ...img("wildco/guides/galapagos/destination/landscape/leon-dormido-06", "León Dormido, Kicker Rock, off San Cristóbal", ECO("Brooke Pyke"), "León Dormido, San Cristóbal"), gravity: "east" },
    { ...img("wildco/voyages/vessels/ecoventura-fleet/00-origin-theory", "Ecoventura's sister yachts Origin and Theory in the Galápagos", ECO(), "Origin and her sister Theory"), gravity: "east" },
    img("wildco/voyages/vessels/ecoventura-fleet/decks/4-12-jacuzzi", "The jacuzzi on deck with Kicker Rock beyond", ECO("Dana Bjarner"), "The sundeck, Kicker Rock beyond"),
  ],
  glance: [["Length", "7 nights, or 14"], ["Guests", "20"], ["Guides", "2 naturalists"], ["Departs", "San Cristóbal, Sundays"]],
  why: [
    { title: "Two naturalists for twenty", line: "Thirteen crew in all, two of them naturalist guides, for twenty guests.", photo: img("wildco/guides/galapagos/destination/activities/snorkeling-02", "Snorkelling with Galápagos marine life", ECO("Ollie Clarke"), undefined, 1600) },
    { title: "Fourteen nights, no repeats", line: "Beaches and Bays to Española, Floreana and Bartolomé; Volcanic Wonders north to Genovesa and west to Fernandina.", photo: img("wildco/guides/galapagos/destination/activities/land-excursions-08", "Guided hike on Bartolomé Island", ECO("Jaime Trejo"), undefined, 1600) },
    { title: "Built for the islands", line: "A hull designed to cut time between islands, which leaves more of each day ashore.", photo: img("wildco/guides/galapagos/destination/wildlife/galapagos-penguin", "Galápagos penguin", ECO("Brooke Pyke"), undefined, 1600) },
  ],
  close: { photo: { ...img("wildco/guides/galapagos/destination/landscape/sombrero-chino-13", "Sombrero Chino, the Chinese Hat islet off Santiago", ECO("Maysa Santoro"), "Sombrero Chino"), gravity: "south" }, line: "Every Sunday from San Cristóbal." },
  planHref: "/plan?trip=Origin%20(Ecoventura)",
};

// HX Expeditions (James, 9 Nov 2026: "we now have approval from the brand, full use, give them credit ... do not use my
// images ... rebuild like The Exceptional Few entrance, top shelf"). HX's own photographs from travelhx.com, each with
// its photographer's credit as HX files it. Frames: the place, the way in, the ship. Palette: the pathway accent with
// the photographs' ice blues and dusk; white on night 13:1.
const HXP = (who?: string) => (who ? `Photo: ${who} / HX Expeditions` : "Photograph courtesy of HX Expeditions");
const HXI = (name: string) => `jwco/partners/hx/antarctica/${name}`;
const HX_PALETTE = { night: "#1E2C3D", deep: "#1A222E", day: "#F6F7F9", hi: "#DCE4EE" };

export const HX_CIRCLE_C: Base = {
  palette: HX_PALETTE,
  pathway: "PATH-04",
  marker: "68° 18′ S · Marguerite Bay",
  designation: "Voyages · Expedition voyage · HX Expeditions",
  title: "Antarctic Circle Expedition",
  place: "Buenos Aires, the Drake Passage both ways, and the Antarctic Peninsula south toward Marguerite Bay",
  line: "Sixteen days with HX: a night in Buenos Aires, the Drake by sea, then nine days on the Peninsula and an attempt through the sea ice, south of the Antarctic Circle to Marguerite Bay.",
  frames: [
    img(HXI("neko-harbour"), "Neko Harbour, Antarctic Peninsula", HXP("Kay Fochtmann"), "Neko Harbour"),
    img(HXI("lemaire-channel-ms-fridtjof-nansen"), "MS Fridtjof Nansen in the Lemaire Channel, Antarctica", HXP("Espen Mills"), "The way south, the Lemaire Channel"),
    img(HXI("ms-roald-amundsen-antarctica"), "MS Roald Amundsen at anchor among the ice of the Antarctic Peninsula", HXP("Dan and Zora Avila"), "MS Roald Amundsen"),
  ],
  glance: [["Length", "16 days, 15 nights"], ["Ships", "MS Roald Amundsen or MS Fridtjof Nansen"], ["Guests", "Up to 490"], ["Sailings", "7, Dec 2026 to Feb 2029"]],
  why: [
    { title: "As far south as the ice allows", line: "HX calls it an attempt: when the summer sea ice opens, the ship crosses 66 degrees for Marguerite Bay.", photo: img(HXI("hidden-bay"), "Hidden Bay on the Antarctic Peninsula", HXP(), undefined, 1600) },
    { title: "The Drake, by sea both ways", line: "Two days each way with the Expedition Team, lectures in the Science Center, and the seabirds that follow the ship.", photo: img(HXI("drake-passage-birds"), "Seabirds over the Drake Passage", HXP("Andrea Klaussner"), undefined, 1600) },
    { title: "Nine days on the Peninsula", line: "Landings by small expedition boat, ice cruising, whales and seals; kayaking and a night on the snow can be added on board.", photo: img(HXI("fournier-bay-crabeater-seal"), "A crabeater seal on an ice floe in Fournier Bay, Antarctica", HXP(), undefined, 1600) },
  ],
  close: { photo: img(HXI("brown-bluff"), "Brown Bluff on the Antarctic Peninsula", HXP("Yuri Choufour"), "Brown Bluff"), line: "Drinks, gratuities, Wi-Fi and the flights between Buenos Aires and Ushuaia are in the fare." },
  planHref: "/plan?trip=Antarctic%20Circle%20Expedition%2C%20HX",
};

export const RA_C: Base = {
  palette: HX_PALETTE,
  pathway: "PATH-04",
  marker: "64° 50′ S · the Antarctic Peninsula",
  designation: "Voyages · Expedition ship · HX Expeditions",
  title: "MS Roald Amundsen",
  place: "HX's hybrid powered expedition ship, sailing to Antarctica from Ushuaia",
  line: "Built in 2019 for polar waters and named for the first man to reach the South Pole: 490 guests, every cabin outside, the Science Center at her heart. The ship James sailed south in 2020.",
  frames: [
    img(HXI("brown-bluff"), "Brown Bluff on the Antarctic Peninsula", HXP("Yuri Choufour"), "Brown Bluff, the Peninsula"),
    img(HXI("weddell-sea-ms-roald-amundsen"), "MS Roald Amundsen in the Weddell Sea, Antarctica", HXP("Kay Fochtmann"), "The Weddell Sea"),
    img(HXI("ms-roald-amundsen-antarctica"), "MS Roald Amundsen at anchor among the ice of the Antarctic Peninsula", HXP("Dan and Zora Avila"), "MS Roald Amundsen"),
  ],
  glance: [["Guests", "Up to 490"], ["Built", "2019, Norway"], ["Power", "Hybrid"], ["Founder", "Sailed, 2020"]],
  why: [
    { title: "The Science Center", line: "Lectures, a small library and workshops with HX's Expedition Team, the heart of the ship.", photo: img(HXI("science-center-ms-roald-amundsen"), "The Science Center aboard MS Roald Amundsen", HXP("Espen Mills"), undefined, 1600) },
    { title: "Suites with hot tubs", line: "Aft and corner suites with private balconies, some with their own hot tub, and Lindstrøm included.", photo: img(HXI("expedition-suite-mc-balcony"), "The private balcony of an MC Corner Suite aboard MS Roald Amundsen", HXP("Tuan Lam"), undefined, 1600) },
    { title: "Ashore by small boat", line: "Landings and ice cruising with the Expedition Team; kayaking and camping bookable on board.", photo: img(HXI("neko-harbour"), "Neko Harbour, Antarctic Peninsula", HXP("Kay Fochtmann"), undefined, 1600) },
  ],
  close: { photo: img(HXI("hidden-bay"), "Hidden Bay on the Antarctic Peninsula", HXP()), line: "James sailed her to the Antarctic Peninsula in February and March 2020." },
  planHref: "/plan?trip=MS%20Roald%20Amundsen%2C%20HX",
};

// Stays, hand-set (James, 10 Nov 2026: "start the same process ... over in the stays ... select a few stays ... into the
// new Exceptional Few introduction"). Brand photographs only, each filed in Cloudinary from the brand's own site or
// media with its credit; the largest originals in the arrival, the smaller ones (upscaled) in the "why" frames. Words
// from each record. The palette and pathway still come from the record (stayOpening), so the tint follows the house rule.
export type StayHand = Omit<Base, "palette" | "pathway" | "planHref">;
const WILD = "Photograph courtesy of Wilderness";
const SING = (who?: string) => (who ? `Photo: ${who} / Singita` : "Photograph courtesy of Singita");
const ELL = "Photograph courtesy of Ellerman House";
const DT = (p: string) => `wilderness-destinations/botswana/wilderness-dumatau/${p}`;
const FF = (n: string) => `jwco/stays/singita-faru-faru-lodge/brand/${n}`;
const EH = (n: string) => `jwco/stays/ellerman-house/brand/${n}`;

export const STAY_HAND_C: Record<string, StayHand> = {
  "wilderness-dumatau": {
    marker: "18° 31′ S · the Linyanti",
    designation: "Stays · Safari camp · Botswana",
    title: "Wilderness DumaTau",
    place: "Osprey Lagoon on the Linyanti waterways, northern Botswana",
    line: "Eight tented suites on walkways above Osprey Lagoon, between the elephant corridors of the Linyanti: wildlife moves through camp while you swim, dine or simply sit and watch.",
    frames: [
      img(DT("camp/wilderness-dumatau-from-the-river"), "Wilderness DumaTau seen from the Linyanti channel", WILD, "From the Linyanti channel"),
      img(DT("experience/wilderness-dumatau-boat-trip"), "A boat trip on the lagoon at Wilderness DumaTau", WILD, "On Osprey Lagoon"),
      img(DT("camp/wilderness-dumatau-main-area-and-jetty"), "Wilderness DumaTau main area and jetty on Osprey Lagoon", WILD, "DumaTau and its jetty"),
    ],
    glance: [["Best months", "May to September"], ["Suites", "8, each with a plunge pool"], ["Fly in", "Linyanti airstrip, from Maun or Kasane"], ["Ledger ID", "STY-2026-056524"]],
    whyLabel: "Why it's here",
    why: [
      { title: "Between the elephant corridors", line: "Camp sits among active elephant corridors on an extraordinary stretch of the Linyanti waterways.", photo: img(DT("wildlife/wilderness-dumatau-elephant"), "An elephant in the bush at Wilderness DumaTau", WILD, undefined, 1600) },
      { title: "The Osprey Retreat", line: "A spa and retreat on the lagoon, with a gym and a lagoon-side pool.", photo: img(DT("camp/wilderness-dumatau-osprey-spa-and-retreat"), "The Osprey Spa and Retreat at Wilderness DumaTau", WILD, undefined, 1600) },
      { title: "By water after dark", line: "Boating the channels, barge sundowners and dining, and the floating fire pit at night.", photo: img(DT("camp/wilderness-dumatau-floating-fire-pit"), "The floating fire pit at Wilderness DumaTau", WILD, undefined, 1600) },
    ],
    close: { photo: img(DT("camp/wilderness-dumatau-iconic"), "Wilderness DumaTau, Linyanti, Botswana", WILD, "Wilderness DumaTau"), line: "James stayed in May 2026, and would go back." },
  },
  "singita-faru-faru-lodge": {
    marker: "2° 07′ S · the Grumeti River",
    designation: "Stays · Safari lodge · Tanzania",
    title: "Singita Faru Faru Lodge",
    place: "The Grumeti River, in Singita's private reserve in the Serengeti ecosystem, northern Tanzania",
    line: "Wake to the sound of the Grumeti River, watch wildlife from your pool, and discover safari in a playful, contemporary lodge.",
    frames: [
      img(FF("wildebeest-migration"), "Wildebeest on the migration across the Grumeti", SING(), "The migration, Grumeti"),
      img(FF("river-view"), "Faru Faru Lodge above the Grumeti River", SING("Adriaan Louw"), "Above the Grumeti River"),
      img(FF("welcome-at-entrance"), "The welcome at the entrance to Singita Faru Faru Lodge", SING("Adriaan Louw"), "The welcome at Faru Faru"),
    ],
    glance: [["Best months", "Year-round"], ["Suites", "9, one with a private pool"], ["Fly in", "Sasakwa airstrip, 1 hour from Arusha"], ["Ledger ID", "STY-2026-000248"]],
    whyLabel: "Why it's here",
    why: [
      { title: "Wildlife at the waterholes", line: "The lodge overlooks waterholes where wildlife gathers, inside Singita's 350,000-acre private reserve.", photo: img(FF("lion-male"), "A male lion sitting in the grass at Singita Grumeti", SING("Ross Couper"), undefined, 1600) },
      { title: "Nine suites on the river", line: "Seven suites, a family suite and a two-bedroom suite with its own pool, all with floor-to-ceiling windows and decks.", photo: img(FF("lodge-9"), "Singita Faru Faru Lodge", SING(), undefined, 1600) },
      { title: "A botanist's camp, reimagined", line: "Contemporary, organic design with a botanist's practicality: two pools, a café-style bar and a firepit.", photo: img(FF("fire-place"), "The fireplace at Singita Faru Faru Lodge", SING(), undefined, 1600) },
    ],
    close: { photo: img(FF("exterior-and-main-area"), "Singita Faru Faru Lodge, the lodge and main area above the Grumeti", SING(), "Singita Faru Faru"), line: "James stayed at Faru Faru in 2012 and went back in 2018." },
  },
  "ellerman-house": {
    marker: "33° 56′ S · Bantry Bay",
    designation: "Stays · House hotel · South Africa",
    title: "Ellerman House",
    place: "Kloof Road, Bantry Bay, on the Atlantic side of Cape Town",
    line: "An ocean-view hideaway that feels like home, with South African art, a wine archive and cuisine at every turn, high above the Atlantic.",
    frames: [
      img(EH("aerial"), "Ellerman House from the air, on the slope above Bantry Bay and the Atlantic", ELL, "Bantry Bay from the air"),
      img(EH("view"), "The view from Ellerman House over the Atlantic", ELL, "The Atlantic from the terraces"),
      img(EH("exterior"), "Ellerman House and its terraces above Bantry Bay", ELL, "Ellerman House"),
    ],
    glance: [["Best months", "October to March"], ["Rooms", "House rooms, suites and two villas"], ["From CPT", "About 30 minutes"], ["Ledger ID", "STY-2026-000075"]],
    whyLabel: "Why it's here",
    why: [
      { title: "A living art collection", line: "A significant collection of South African art, hung through the house and shown on art tours.", photo: img(EH("lounge"), "A lounge at Ellerman House hung with South African art", ELL, undefined, 1600) },
      { title: "More than 9,000 labels", line: "A wine archive of more than 9,000 labels, explored in the cellar.", photo: img(EH("wine-cellar"), "The wine cellar at Ellerman House", ELL, undefined, 1600) },
      { title: "Rooms over the Atlantic", line: "House rooms, suites and two private villas, many facing the sea.", photo: img(EH("ellerman-suite"), "The Ellerman House Suite, its living space and ocean views", ELL, undefined, 1600) },
    ],
    close: { photo: img(EH("legacy-above-the-atlantic"), "Ellerman House above the Atlantic", ELL, "Above the Atlantic"), line: "A view that makes the rest of Cape Town look like the warm-up act. Make it your base. JW" },
  },
};
