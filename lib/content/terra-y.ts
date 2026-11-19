// Terra Y (James, 15 Nov 2026): "a VIP labeled James Wild & Co overland journey called Terra Y, exclusive hand selected
// and designed expeditions by James", built as expedition dossiers. Two files to start:
//   • The Ice: White Desert's six Antarctic trips, flown from Cape Town to its own camps in Queen Maud Land;
//   • The DC-3: Echo Charlie's three Modern Odysseys aboard its Basler BT-67, "Presented by White Desert".
// James is a White Desert partner (photographs and films cleared); Echo Charlie is White Desert's sister brand.
// Every fact, date and rate is from white-desert.com and echo-charlie.com as published on 15 Nov 2026; rates are
// per person sharing, as the brands publish them. Nothing links out (James, 13 Nov 2026). Coordinates are the
// brands' own for the camps, the Pole and Dixie's Camp; for towns, the town's own position.
// The pathway is The Far Edge (PATH-09), created for these on the same day.

const CLD = "https://res.cloudinary.com/jhlnq5h5";
/** A Terra Y photograph; an id that starts "jwco/" is a full public_id already in the library (one copy per image). */
export const ty = (id: string, w = 2000) => `${CLD}/image/upload/c_limit,w_${w}/q_auto:good/f_auto/${id.startsWith("jwco/") ? id : `jwco/terra-y/${id}`}`;
export const tyFilm = (id: string) => `${CLD}/video/upload/q_auto/f_auto/jwco/terra-y/films/${id}`;
export const tyPoster = (id: string) => `${CLD}/video/upload/so_2,q_auto,f_jpg,w_1600/jwco/terra-y/films/${id}`;

export const TY_PATH = "/overland/terra-y";
export const tyPath = (slug: string) => `${TY_PATH}/${slug}`;

export type TyFile = "ice" | "dc3" | "sea";
export type TyDay = { n: string; title: string; body: string; place: string; coords?: string; photo?: { id: string; alt: string } };
export type TyRate = { season: string; option: string; rate: string; dates: string[]; note?: string };
export type TyAddition = { title: string; body: string; stays?: string[] };
export type TyDossier = {
  slug: string; no: string; file: TyFile; title: string; operator: "White Desert" | "Echo Charlie" | "UnCruise Adventures";
  length: string; from: number; season: string; group: string; base: string;
  hero: { id: string; alt: string }; film?: string;
  line: string; answer: string; brief: string[];
  facts: [string, string][];
  days: TyDay[]; dayNote?: string;
  rates: TyRate[]; ratesNote: string;
  additions: TyAddition[];
  faqs: { q: string; a: string }[];
};

export const TY_FILES: Record<TyFile, { name: string; code: string; operator: string; line: string; film: string; poster: string; credit: string }> = {
  ice: { name: "The Ice", code: "FILE A", operator: "White Desert", line: "Cape Town to the Antarctic interior by private jet: three camps of six suites in Queen Maud Land, the South Pole and the Emperor penguins.", film: "white-desert", poster: "south-pole-penguins/hero", credit: "Photographs and films: White Desert" },
  sea: { name: "The North Pacific", code: "FILE C", operator: "UnCruise Adventures", line: "Small expedition yachts off Alaska's far coast: the Aleutian chain to Dutch Harbor, and a 22-guest yacht held for one party in Southeast Alaska.", film: "", poster: "", credit: "Photographs: UnCruise Adventures" },
  dc3: { name: "The DC-3", code: "FILE B", operator: "Echo Charlie", line: "Twelve guests, a 1942 Dakota rebuilt as a Basler BT-67, and twelve nights across a continent, landing at the door of each lodge.", film: "echo-charlie", poster: "scotland-to-greenland/hero", credit: "Photographs and films: Echo Charlie, presented by White Desert" },
};

const CAPE_TOWN = "33° 55′ S, 18° 25′ E";
const WHICHAWAY = "70° 48′ S, 11° 23′ E";
const ECHO = "71° 32′ 47″ S, 8° 50′ 11″ E";
const EXPLORER = "71° 31′ 37″ S, 8° 51′ 20″ E";
const POLE = "90° 00′ S";
const DIXIES = "83° S";

const ARRIVE: Omit<TyDay, "n" | "photo"> = { title: "Arrival in Antarctica", place: "Cape Town to Wolf's Fang Runway", coords: CAPE_TOWN, body: "A 5.5-hour flight due south from Cape Town, across the Southern Ocean and the sea ice, into the endless daylight of the Antarctic summer. The jet lands on a runway of blue ice, and the first drink in camp is chilled with 10,000-year-old ice." };
const DEPART = (photo?: TyDay["photo"]): TyDay => ({ n: "", title: "Departure", place: "Wolf's Fang Runway to Cape Town", coords: CAPE_TOWN, body: "The return jet, an A330 or A340, lands on the blue ice. There is time for the ice bar at Wolf's Fang, among sculptures carved from ice, before the flight north to Africa.", photo });
const POLE_DAY: Omit<TyDay, "n" | "photo"> = { title: "To the South Pole", place: "Dixie's Camp, then 90° South", coords: POLE, body: "The Basler flies five hours across mountain ranges to Dixie's Camp on the High Polar Plateau, refuels, and continues to the Pole: 2,400 km into the interior, cruising 3,000 m above the ice. Stand where every direction is north, stamp your passport, then return to Dixie's to sleep under canvas at 83° South." };
const POLE_RETURN = (to: string): Omit<TyDay, "n" | "photo"> => ({ title: "Back from the Pole", place: `Dixie's Camp to ${to}`, coords: DIXIES, body: `Morning on the High Polar Plateau, then the flight back across the continent to ${to}, and a three-course dinner with champagne to mark the Pole.` });
const WEATHER = "White Desert plans each week around the flying windows for the Pole and the penguins, so days can move. Its own line: Antarctica's the dealer.";

const iceAdditions = (after: string[] = ["monwana-thornybush", "lion-sands"]): TyAddition[] => [
  { title: "The two Cape Town days, planned", body: "White Desert asks every guest to reach Cape Town two days before the flight south and to stay two days after, in case the weather holds the aircraft. We turn those four days into part of the journey: Ellerman House on the Atlantic side, the Winelands at Leeu Estates, the safety briefing on Loop Street and the fast track to the aircraft.", stays: ["ellerman-house", "leeu-estates"] },
  { title: "Then into the bush", body: "From the ice to the Sabi Sand in one flight: James's own lodges from his 2026 safari, for the leopards after the penguins.", stays: after },
  { title: "A camp of your own", body: "White Desert takes exclusive-use families and groups, from 10 to 85 years old. Each camp has six suites; ask us to hold a whole camp for your party and your dates." },
  { title: "One Folio, one advisor", body: "Medical forms, insurance, polar kit (White Desert can have a full kit waiting in Cape Town), flights, transfers and the extensions, filed in one Traveler Folio and run by one James Wild & Co advisor from first call to last night." },
];

const dc3Additions = (stays: string[], extra?: TyAddition): TyAddition[] => [
  { title: "All twelve seats", body: "Echo Charlie flies twelve guests at most. For a family or a group of friends, ask us to hold every seat: the aircraft, the crew and the camps become your party's alone." },
  ...(stays.length ? [{ title: "Before and after", body: "The journey ends where James has lodges of his own on file. We add nights either side so the flight home is not the next morning.", stays }] : []),
  ...(extra ? [extra] : []),
  { title: "One Folio, one advisor", body: "Long-haul flights to the start and from the finish, the extra nights and the forms, in one Traveler Folio and run by one James Wild & Co advisor." },
];

export const TY_DOSSIERS: TyDossier[] = [
  {
    slug: "south-pole-penguins", no: "TY-001", file: "ice", operator: "White Desert", title: "South Pole & Emperor Penguins",
    length: "8 days", from: 95000, season: "December to January", group: "Six suites a camp", base: "Whichaway and Echo, or Explorer Camp",
    hero: { id: "south-pole-penguins/hero", alt: "The Ceremonial South Pole, ringed by the flags of the Antarctic Treaty nations" }, film: "south-pole-penguins",
    line: "The South Pole, reached by fewer than 500 people a year, and the Emperor colony at Atka Bay.",
    answer: "South Pole & Emperor Penguins is White Desert's most popular Antarctic trip: eight days flown from Cape Town to its camps in Queen Maud Land, a flight to the Emperor penguin colony at Atka Bay, and a two-day journey to the Geographic South Pole with a night at Dixie's Camp on the High Polar Plateau. Published rates for 2026 to 2027 are US $115,500 per person sharing at Whichaway and Echo, or US $95,000 at Explorer Camp.",
    brief: [
      "Two of the hardest places on Earth to reach, in one week. The Basler flies 2,400 km into the interior to 90° South, where all the lines of longitude meet, and the night on the way back is spent under canvas at Dixie's Camp, 83° South, in the silence of the plateau.",
      "By December the Emperor chicks have traded their down for juvenile feathers and, unused to visitors, often waddle close. The colony at Atka Bay is a 2.5-hour flight across the ice shelf, then a PistenBully ride to a respectful distance.",
    ],
    facts: [["Length", "8 days from Cape Town"], ["Camps", "Whichaway and Echo, or Explorer"], ["The Pole", "90° S, overnight at Dixie's Camp, 83° S"], ["Penguins", "Emperor colony, Atka Bay"], ["Group", "Six suites a camp, ages 10 to 85"]],
    days: [
      { n: "01", ...ARRIVE, photo: { id: "south-pole-penguins/d1", alt: "Guests stepping onto the blue ice runway in Antarctica" } },
      { n: "02", title: "Journey to Atka Bay", place: "Emperor colony, Atka Bay", coords: ECHO, body: "A 2.5-hour flight over the ice shelf to the colony, then on foot among thousands of Emperor penguins.", photo: { id: "south-pole-penguins/d2", alt: "A guest standing among Emperor penguins at Atka Bay" } },
      { n: "03", title: "Peaks and panoramas", place: "Above the ice sheet", coords: ECHO, body: "A hike above the ice sheet to views of untouched peaks, a champagne picnic, then further with your guide to a lookout.", photo: { id: "south-pole-penguins/d3", alt: "Hikers above the Antarctic ice sheet with peaks beyond" } },
      { n: "04", ...POLE_DAY, photo: { id: "south-pole-penguins/d4", alt: "A guest at the South Pole, where every direction is north" } },
      { n: "05", ...POLE_RETURN("Echo"), photo: { id: "south-pole-penguins/d5", alt: "Tents at Dixie's Camp on the High Polar Plateau" } },
      { n: "06", title: "At your own pace", place: "Around camp", coords: ECHO, body: "Gentle hikes, an abseil or the summit of a nunatak, or an afternoon of the explorer team's stories of Antarctic history beneath the endless sky.", photo: { id: "south-pole-penguins/d6", alt: "A climber on a nunatak above the ice" } },
      { n: "07", title: "Wild horizons", place: "The cliff trail", coords: ECHO, body: "A demanding cliff-side trail with IFMGA mountain guides and views across the last true wilderness.", photo: { id: "south-pole-penguins/d7", alt: "Guides leading a roped team along an Antarctic ridge" } },
      { ...DEPART(), n: "08" },
    ],
    dayNote: WEATHER,
    rates: [
      { season: "2026 to 2027", option: "Whichaway and Echo", rate: "US $115,500", dates: ["1 to 8 Dec 2026", "8 to 15 Dec 2026", "15 to 22 Dec 2026", "22 to 29 Dec 2026", "29 Dec 2026 to 5 Jan 2027", "5 to 12 Jan 2027"] },
      { season: "2026 to 2027", option: "Explorer Camp", rate: "US $95,000", dates: ["1 to 8 Dec 2026", "8 to 15 Dec 2026", "15 to 22 Dec 2026", "22 to 29 Dec 2026", "29 Dec 2026 to 5 Jan 2027", "5 to 12 Jan 2027"] },
      { season: "2027 to 2028", option: "Whichaway and Echo", rate: "US $120,000", note: "Asterisked as published; peak season over the holidays", dates: ["1 to 8 Dec 2027", "8 to 15 Dec 2027", "15 to 22 Dec 2027", "22 to 29 Dec 2027 (peak)", "29 Dec 2027 to 5 Jan 2028 (peak)", "5 to 12 Jan 2028"] },
      { season: "2027 to 2028", option: "Explorer Camp", rate: "US $105,000", dates: ["1 to 8 Dec 2027", "8 to 15 Dec 2027", "15 to 22 Dec 2027", "22 to 29 Dec 2027"] },
    ],
    ratesNote: "Per person sharing, as White Desert publishes them. Fixed dates; solo travellers, families and exclusive-use groups welcome, ages 10 to 85.",
    additions: iceAdditions(),
    faqs: [
      { q: "How do you get to the South Pole with White Desert?", a: "From the camps, White Desert's Basler flies about five hours to Dixie's Camp on the High Polar Plateau, refuels and continues to 90° South. Guests return to Dixie's Camp for the night and fly back to camp the next morning." },
      { q: "Which camp should I choose?", a: "Whichaway and Echo are the two main camps; Explorer Camp is the chalet-style base at a lower rate (US $95,000 for 2026 to 2027 against US $115,500). The itinerary is the same; the camp changes the feel." },
      { q: "Is it guaranteed?", a: "No trip to the interior can be. White Desert adjusts each week around the safest flying windows for the Pole and the colony, which is why it asks guests to keep two days either side in Cape Town." },
    ],
  },
  {
    slug: "south-pole-blue-rivers", no: "TY-002", file: "ice", operator: "White Desert", title: "South Pole & Blue Rivers",
    length: "8 days", from: 115500, season: "Late season, January", group: "Six suites a camp", base: "Whichaway and Echo",
    hero: { id: "south-pole-blue-rivers/hero", alt: "Blue meltwater rivers curving across the white Antarctic ice, from the air" }, film: "south-pole-blue-rivers",
    line: "The South Pole and the Blue Rivers, Antarctica's rarely seen meltwater channels.",
    answer: "South Pole & Blue Rivers is White Desert's newest Antarctic trip: eight days from Cape Town that join its journey to the Geographic South Pole with a hike to the Blue Rivers, channels of iridescent meltwater that run across the ice for a few weeks each summer near the Schirmacher Oasis. The published rate is US $115,500 per person sharing for January 2027 and US $120,000 for January 2028.",
    brief: [
      "Where the continent meets the frozen ocean, rivers of blue glacial water run across the surface, exposing ice compressed over tens of thousands of years. From the air they look unreal; on foot it feels like walking across a frozen sea.",
      "The week also takes in the Pole by Basler, with the night at Dixie's Camp, and ends with a trail where old rock breaks through the ice.",
    ],
    facts: [["Length", "8 days from Cape Town"], ["Camps", "Whichaway and Echo"], ["The Pole", "90° S, overnight at Dixie's Camp, 83° S"], ["Blue Rivers", "Near the Schirmacher Oasis, late season only"], ["Group", "Six suites a camp, ages 10 to 85"]],
    days: [
      { n: "01", ...ARRIVE, photo: { id: "south-pole-blue-rivers/d1", alt: "Arriving guests on the blue ice beside the aircraft" } },
      { n: "02", title: "Peaks and panoramas", place: "Above the ice sheet", coords: WHICHAWAY, body: "A hike above the ice sheet, a champagne picnic, then on with your guide to a lookout.", photo: { id: "south-pole-blue-rivers/d2", alt: "A guide on a ridge above the ice" } },
      { n: "03", ...POLE_DAY, photo: { id: "south-pole-blue-rivers/d3", alt: "The Basler on the ice of the polar plateau" } },
      { n: "04", ...POLE_RETURN("Echo"), photo: { id: "south-pole-blue-rivers/d4", alt: "Tents at Dixie's Camp on the High Polar Plateau" } },
      { n: "05", title: "At your own pace", place: "Around camp", coords: ECHO, body: "Gentle hikes, an abseil or a nunatak summit, or the explorer team's stories of Antarctic history.", photo: { id: "south-pole-blue-rivers/d5", alt: "A guest abseiling down an ice face" } },
      { n: "06", title: "The Blue Rivers", place: "Schirmacher Oasis", coords: WHICHAWAY, body: "Half an hour across the ice, then about two hours on foot to the rivers. A picnic beside the blue, and two hours back on crampons through the rocky Schirmacher Oasis.", photo: { id: "south-pole-blue-rivers/d6", alt: "A picnic beside the iridescent Blue Rivers" } },
      { n: "07", title: "Wild horizons", place: "Where rock breaks the ice", coords: WHICHAWAY, body: "A demanding trail with IFMGA mountain guides, where ancient rock breaks through the ice and snow.", photo: { id: "south-pole-blue-rivers/d7", alt: "A vivid blue meltwater river cutting through white ice" } },
      { ...DEPART(), n: "08" },
    ],
    dayNote: WEATHER,
    rates: [
      { season: "2026 to 2027", option: "Whichaway and Echo", rate: "US $115,500", dates: ["12 to 19 Jan 2027", "19 to 26 Jan 2027"] },
      { season: "2027 to 2028", option: "Whichaway and Echo", rate: "US $120,000", dates: ["12 to 19 Jan 2028", "19 to 26 Jan 2028"] },
    ],
    ratesNote: "Per person sharing, as White Desert publishes them. Fixed dates; the Blue Rivers run only late in the season.",
    additions: iceAdditions(),
    faqs: [
      { q: "What are the Blue Rivers?", a: "Channels of glacial meltwater that run across the Antarctic surface for a short time each summer where the land meets the frozen ocean, exposing ice compressed over tens of thousands of years." },
      { q: "How fit do I need to be?", a: "The Blue Rivers day is about two hours on foot each way on crampons, and the last full day is a demanding guided trail. White Desert asks for a medical check within 30 days of travel." },
    ],
  },
  {
    slug: "the-long-stay", no: "TY-003", file: "ice", operator: "White Desert", title: "The Long Stay",
    length: "8 days", from: 110000, season: "Late season, late January", group: "Six suites a camp", base: "Whichaway, then Echo",
    hero: { id: "the-long-stay/hero", alt: "Whichaway Camp's domes beside a frozen lake below rock and ice" }, film: "the-long-stay",
    line: "Both main camps, Whichaway and Echo, with the South Pole and the Blue Rivers between them.",
    answer: "The Long Stay is White Desert's longest itinerary and the only one that uses both of its main camps: Whichaway, by a frozen lake among rocky outcrops, and Echo, the futuristic camp among the nunataks, with the Geographic South Pole between them. The published rate is US $110,500 per person sharing for 26 January to 3 February 2027.",
    brief: [
      "Guests often ask White Desert which camp to choose. The Long Stay's answer is both: Whichaway's warmth, sauna and blue river system first, then Echo's otherworldly landscape after the Pole.",
      "The Pole comes in the middle: the flight to Dixie's Camp, on to 90° South, a night on the plateau, and the move to Echo the next day.",
    ],
    facts: [["Length", "8 days from Cape Town"], ["Camps", "Whichaway, then Echo"], ["The Pole", "90° S, overnight at Dixie's Camp, 83° S"], ["Season", "One departure a season, late January"], ["Group", "Six suites a camp, ages 10 to 85"]],
    days: [
      { n: "01", title: "Arrival at Whichaway", place: "Wolf's Fang Runway to Whichaway Camp", coords: WHICHAWAY, body: "The flight from Cape Town to Wolf's Fang Runway, then to Whichaway, a heated sleeping pod and a welcome dinner under the midnight sun.", photo: { id: "the-long-stay/d1", alt: "Guests arriving at Whichaway Camp" } },
      { n: "02", title: "Discovering Whichaway", place: "Whichaway Camp", coords: WHICHAWAY, body: "A guided hike among rocky outcrops and blue ice, the ice waves, or a descent into the blue river system that makes the camp. A sauna, then dinner by the fire.", photo: { id: "the-long-stay/d2", alt: "A guide walking through a channel of blue ice" } },
      { n: "03", title: "Ice adventures", place: "Whichaway Camp", coords: WHICHAWAY, body: "An abseil down ancient ice cliffs; or yoga in the dome, a massage with the camp's physical therapist and a walk across the frozen lake to the viewpoints.", photo: { id: "the-long-stay/d3", alt: "An ice climber on a frozen wall" } },
      { n: "04", ...POLE_DAY, photo: { id: "the-long-stay/d4", alt: "The marker at the Geographic South Pole" } },
      { n: "05", title: "To Echo", place: "Dixie's Camp to Echo", coords: ECHO, body: "Morning on the plateau, then the flight across the continent to Echo, your second camp, and a three-course dinner with champagne.", photo: { id: "the-long-stay/d5", alt: "The Basler on the ice at Dixie's Camp" } },
      { n: "06", title: "Echo's playground", place: "Echo", coords: ECHO, body: "The nunatak peaks around Echo, ice climbing or untouched ridgelines with views in every direction.", photo: { id: "the-long-stay/d6", alt: "Echo's Cosmos lounge looking out onto the ice" } },
      { n: "07", title: "High-mountain day", place: "The ridges above Echo", coords: ECHO, body: "A demanding hike with IFMGA mountain guides across exposed ridges and rock spires that pierce the ice cap.", photo: { id: "the-long-stay/d7", alt: "A roped team on a glacier hike" } },
      { ...DEPART(), n: "08" },
    ],
    dayNote: WEATHER,
    rates: [
      { season: "2026 to 2027", option: "Whichaway and Echo", rate: "US $110,500", dates: ["26 Jan to 3 Feb 2027"] },
      { season: "2027 to 2028", option: "Whichaway and Echo", rate: "US $110,000", dates: ["26 Jan to 3 Feb 2028"] },
    ],
    ratesNote: "Per person sharing, as White Desert publishes them. One departure a season.",
    additions: iceAdditions(),
    faqs: [
      { q: "Does The Long Stay include the Blue Rivers?", a: "White Desert describes it as including the South Pole and the Blue Rivers. Whichaway sits beside the blue river system near the Schirmacher Oasis, and the exact days follow the weather." },
      { q: "Why stay at both camps?", a: "Each shows a different Antarctica: Whichaway's rock, lakes and blue ice, and Echo's white wilderness among the nunataks." },
    ],
  },
  {
    slug: "baby-penguins-blue-tunnels", no: "TY-004", file: "ice", operator: "White Desert", title: "Baby Penguins & Blue Tunnels",
    length: "6 days", from: 65000, season: "Early season, November", group: "Six suites a camp", base: "Whichaway and Echo, or Explorer Camp",
    hero: { id: "baby-penguins-blue-tunnels/hero", alt: "Emperor penguin chicks with their parents on the sea ice" }, film: "baby-penguins-blue-tunnels",
    line: "The Emperor chicks' first steps at Atka Bay, and the blue ice tunnels.",
    answer: "Baby Penguins & Blue Tunnels is White Desert's early-season Antarctic trip: six days from Cape Town in late November, when the Emperor penguin chicks at Atka Bay take their first steps from their parents' feet, with a hike into the blue ice tunnels. Published rates for 2026 to 2027 are US $75,250 per person sharing at Whichaway and Echo, or US $65,000 at Explorer Camp.",
    brief: [
      "In November Atka Bay fills with newly hatched Emperor chicks, wobbling off their parents' feet in grey down that has to carry them through cold below minus 50°C. It is the most fragile moment in the colony's year, and the most intimate one to see.",
      "The tunnels are the other half: ice carved by meltwater over thousands of years, reached by a two-hour hike across the icefields, glowing blue inside.",
    ],
    facts: [["Length", "6 days from Cape Town"], ["Camps", "Whichaway and Echo, or Explorer"], ["Penguins", "Emperor chicks, Atka Bay"], ["Season", "Late November only"], ["Group", "Six suites a camp, ages 10 to 85"]],
    days: [
      { n: "01", ...ARRIVE, photo: { id: "baby-penguins-blue-tunnels/d1", alt: "Guests arriving on the Antarctic ice" } },
      { n: "02", title: "Your own pace", place: "Around camp", coords: WHICHAWAY, body: "Activities set to your level, from gentle hikes to ice climbing, then an evening talk on the Emperor penguins before the colony.", photo: { id: "baby-penguins-blue-tunnels/d2", alt: "A guest ice climbing near camp" } },
      { n: "03", title: "Journey to Atka Bay", place: "Emperor colony, Atka Bay", coords: WHICHAWAY, body: "The flight over the ice shelf to thousands of Emperor penguins with newly hatched chicks taking their first steps.", photo: { id: "baby-penguins-blue-tunnels/d3", alt: "Emperor chicks taking their first steps from beneath their parents" } },
      { n: "04", title: "The blue ice tunnels", place: "The icefields", coords: WHICHAWAY, body: "A ridge-line hike to ancient ice formations, then inside the tunnels, quiet and blue.", photo: { id: "baby-penguins-blue-tunnels/d4", alt: "Walking through the sapphire walls of the ice tunnels" } },
      { n: "05", title: "On the edge", place: "Glacier and nunatak", coords: WHICHAWAY, body: "A glacier hike with mountain guides to the summit of a nunatak, the tip of a mountain buried in the ice.", photo: { id: "baby-penguins-blue-tunnels/d5", alt: "A climber on a nunatak above the glacier" } },
      { ...DEPART({ id: "baby-penguins-blue-tunnels/d6", alt: "The returning jet on the blue ice runway" }), n: "06" },
    ],
    dayNote: WEATHER,
    rates: [
      { season: "2026 to 2027", option: "Whichaway and Echo", rate: "US $75,250", dates: ["19 to 25 Nov 2026", "25 Nov to 1 Dec 2026"] },
      { season: "2026 to 2027", option: "Explorer Camp", rate: "US $65,000", dates: ["25 Nov to 1 Dec 2026"] },
      { season: "2027 to 2028", option: "Whichaway and Echo", rate: "US $82,000", dates: ["19 to 25 Nov 2027", "25 Nov to 1 Dec 2027"] },
      { season: "2027 to 2028", option: "Explorer Camp", rate: "US $72,000", dates: ["19 to 25 Nov 2027", "25 Nov to 1 Dec 2027"] },
    ],
    ratesNote: "Per person sharing, as White Desert publishes them. Fixed dates in late November only.",
    additions: iceAdditions(),
    faqs: [
      { q: "When can you see Emperor penguin chicks?", a: "White Desert times this trip for late November, when the chicks at Atka Bay are newly hatched and taking their first steps. By December they are losing their down." },
      { q: "Is this the shortest overnight trip?", a: "Yes. Six days from Cape Town, against eight for the Pole trips. Only Antarctica in a Day is shorter, and it has no night on the ice." },
    ],
  },
  {
    slug: "discovery-week", no: "TY-005", file: "ice", operator: "White Desert", title: "Discovery Week",
    length: "7 days", from: 45000, season: "19 to 26 January 2027", group: "Explorer Camp", base: "Explorer Camp",
    hero: { id: "discovery-week/hero", alt: "Scientists and guests in a line across the Antarctic ice" },
    line: "A week on the ice with leading polar scientists, most of it a gift to Antarctic research.",
    answer: "Discovery Week is a seven-day White Desert expedition on 19 to 26 January 2027, based at Explorer Camp and led by polar scientists including Professor Steven Chown, with days on glaciology, microbiology, logistics and political science and a hike to the Blue Rivers. It costs US $45,000 per person sharing, and 65% of the price is a donation to the White Desert Foundation's science grant, tax deductible for US guests through a 501(c)(3).",
    brief: [
      "Glaciologists, geologists and climate researchers take you through the forces that shape Antarctica, then into the field to see them: ice sheets, rock, living systems, and the logistics that keep science running at the bottom of the world.",
      "It is philanthropy as much as travel. Most of the cost funds the next White Desert Foundation science grant, and guests meet the current grant recipients.",
    ],
    facts: [["Dates", "19 to 26 January 2027"], ["Camp", "Explorer Camp"], ["Led by", "Professor Steven Chown and polar scientists"], ["Donation", "65% of the price to the Foundation's science grant"], ["Tax", "Deductible for US guests (501(c)(3)); UK Gift Aid"]],
    days: [
      { n: "01", title: "Arrival in Antarctica", place: "Wolf's Fang Runway to Explorer Camp", coords: EXPLORER, body: "The Airbus A340 from Cape Town, the transfer to Explorer Camp and an introductory briefing.", photo: { id: "discovery-week/d1", alt: "Arrival on the ice at the start of Discovery Week" } },
      { n: "02", title: "Ice sheets and landscape history", place: "Glaciology and geology", coords: EXPLORER, body: "A field day in the ice and mountains around camp, down into an ice cave, then the afternoon on ice dynamics and long-term change.", photo: { id: "discovery-week/d2", alt: "Guests in an ice cave during the glaciology day" } },
      { n: "03", title: "Life at the extremes", place: "Microbiology", coords: EXPLORER, body: "Antarctic ecosystems and how living systems record the continent's history.", photo: { id: "discovery-week/d3", alt: "A scientist sampling in the field" } },
      { n: "04", title: "Scientists on the ice", place: "Logistics", coords: EXPLORER, body: "Behind the scenes of White Desert's logistics, environmental monitoring and sustainability protocols.", photo: { id: "discovery-week/d4", alt: "The logistics that support research on the ice" } },
      { n: "05", title: "The Blue Rivers expedition", place: "Schirmacher Oasis", coords: WHICHAWAY, body: "A Basler or Twin Otter flight to the Schirmacher Oasis and a guided day at the Blue Rivers on sea ice, meltwater and the global ocean.", photo: { id: "discovery-week/d5", alt: "Hiking to the Blue Rivers" } },
      { n: "06", title: "Big picture Antarctica", place: "Political science", coords: EXPLORER, body: "The week drawn together in open forums with the scientists, with time to ice or rock climb.", photo: { id: "discovery-week/d6", alt: "An open forum with the scientists at camp" } },
      { n: "07", title: "Departure", place: "Explorer Camp to Cape Town", coords: CAPE_TOWN, body: "Final reflections, then the flight back to Cape Town.", photo: { id: "discovery-week/d7", alt: "The aircraft departing the ice" } },
    ],
    rates: [{ season: "2026 to 2027", option: "Explorer Camp", rate: "US $45,000", dates: ["19 to 26 Jan 2027"] }],
    ratesNote: "Per person sharing, as White Desert publishes it. 65% of the price is a donation to the White Desert Foundation Science Grant.",
    additions: iceAdditions(),
    faqs: [
      { q: "Is Discovery Week tax deductible?", a: "White Desert says 65% of the price is a donation to the White Desert Foundation Science Grant, tax deductible for US guests through a 501(c)(3); UK guests receive a Gift Aid certificate. Take your own tax advice." },
      { q: "Who leads it?", a: "Professor Steven Chown, Director of Securing Antarctica's Environmental Future, with four decades of Antarctic research, alongside glaciologists, geologists and climate researchers, and White Desert's IFMGA guides." },
    ],
  },
  {
    slug: "antarctica-in-a-day", no: "TY-006", file: "ice", operator: "White Desert", title: "Antarctica in a Day",
    length: "1 day", from: 16500, season: "November to January", group: "Day flight", base: "Wolf's Fang",
    hero: { id: "antarctica-in-a-day/hero", alt: "The jet on the blue ice runway at Wolf's Fang below the mountains" }, film: "antarctica-in-a-day",
    line: "Cape Town to Antarctica and back in a day: an ice cave, a glacier abseil and the ice bar.",
    answer: "Antarctica in a Day is White Desert's day trip from Cape Town: a flight to Wolf's Fang Runway in Queen Maud Land, hours on the ice with an ice cave, an abseil down a glacier and a drink in an ice bar, and the flight home the same day. The published rate is US $16,500 per person, on set dates from November to January.",
    brief: [
      "The quickest way onto the Antarctic continent: no ship, no camp, no Drake Passage. You trade the African summer for the endless daylight of the ice, and you are back in Cape Town that night.",
      "On the ice: an ice cave walled in crystals, an abseil down a frozen cliff, and cocktails poured over 10,000-year-old glacier ice at the Wolf's Fang bar.",
    ],
    facts: [["Length", "One day, Cape Town and back"], ["On the ice", "Ice cave, glacier abseil, ice bar"], ["Season", "Set dates, November to January"], ["Before", "Safety briefing and kit check in Cape Town"]],
    days: [
      { n: "00", title: "Before you fly", place: "Cape Town", coords: CAPE_TOWN, body: "A safety briefing in Cape Town, where the guest team checks your polar kit and walks you through the day." },
      { n: "01", title: "Ice caves", place: "Wolf's Fang", body: "Into ice caves whose walls are crusted with crystals that catch the light.", photo: { id: "antarctica-in-a-day/caves", alt: "Inside an ice cave walled with crystals" } },
      { n: "02", title: "Abseiling", place: "Wolf's Fang", body: "A descent down a frozen cliff face.", photo: { id: "antarctica-in-a-day/abseil", alt: "A guest abseiling down a glacier wall" } },
      { n: "03", title: "The ice bar", place: "Wolf's Fang", body: "A toast at a bar carved from ice, with cocktails poured over glacier ice, before the flight home.", photo: { id: "antarctica-in-a-day/icebar", alt: "The Wolf's Fang ice bar" } },
    ],
    rates: [
      { season: "2026 to 2027", option: "Day flight", rate: "US $16,500", dates: ["19 Nov 2026", "25 Nov 2026", "1 Dec 2026", "8 Dec 2026", "15 Dec 2026", "22 Dec 2026", "29 Dec 2026", "5 Jan 2027", "12 Jan 2027", "19 Jan 2027", "26 Jan 2027"] },
      { season: "2027 to 2028", option: "Day flight", rate: "US $16,500", dates: ["1 Dec 2027", "8 Dec 2027", "15 Dec 2027", "29 Dec 2027", "5 Jan 2028", "12 Jan 2028", "19 Jan 2028"] },
    ],
    ratesNote: "Per person, as White Desert publishes it.",
    additions: iceAdditions().slice(0, 2).concat(iceAdditions().slice(3)),
    faqs: [
      { q: "Can you visit Antarctica in one day?", a: "Yes. White Desert flies from Cape Town to its blue-ice runway at Wolf's Fang in Queen Maud Land and back the same day, at US $16,500 per person." },
      { q: "Do I need polar kit for a day?", a: "Yes. The guest team checks your kit at the Cape Town briefing, and White Desert can prepare a full kit for your arrival." },
    ],
  },
  {
    slug: "peru-to-patagonia", no: "TY-007", file: "dc3", operator: "Echo Charlie", title: "Peru to Patagonia",
    length: "12 nights", from: 67500, season: "October 2027", group: "Twelve guests", base: "Six landings, Lima to Torres del Paine",
    hero: { id: "peru-to-patagonia/hero", alt: "The granite towers of Torres del Paine above the Patagonian steppe" },
    line: "Twelve nights down the Andes by DC-3: cloud forest, desert dunes, the Atacama sky and Patagonian ice.",
    answer: "Peru to Patagonia is a twelve-night Echo Charlie journey for twelve guests aboard a rebuilt 1942 DC-3, flying the length of the Andes from Lima to Torres del Paine with stops in the Chachapoyas cloud forest, the Paracas dunes, the Atacama Desert and Chiloé. It runs in October 2027 from US $67,500 per person.",
    brief: [
      "The Andes, country by country, in one arc: an archaeologist at the cliff tombs of the Chachapoya and the 771 m Gocta Falls, a night under canvas in the dunes, a private observatory under the clearest sky on the planet, a feast cooked in the ground on Chiloé, and the steppe on horseback with gauchos as the condors turn.",
      "Six landings, twelve guests and a route no airline flies, with a good bed at the end of each day.",
    ],
    facts: [["Length", "12 nights"], ["Group", "Twelve guests at most"], ["Aircraft", "Basler BT-67 (a rebuilt DC-3)"], ["Route", "Lima, Chachapoyas, Paracas, Atacama, Chiloé, Patagonia"], ["Departures", "October 2027"]],
    days: [
      { n: "1", title: "Lima", place: "Hotel B, Barranco", coords: "12° 03′ S, 77° 03′ W", body: "We gather in Barranco, Lima's best neighbourhood, at Hotel B, a 1914 Belle Époque house and Lima's only Relais & Châteaux hotel, for the welcome dinner.", photo: { id: "peru-to-patagonia/lima", alt: "Hotel B, a Belle Époque mansion in Barranco, Lima" } },
      { n: "3", title: "Chachapoyas", place: "Gocta Natura Reserve", coords: "6° 13′ S, 77° 52′ W", body: "Three nights in the cloud forest: a day to the foot of Gocta Falls, 771 m, the Chachapoya sarcophagi on their cliff ledge with an archaeologist, and dozens of hummingbirds, the Marvellous Spatuletail among them.", photo: { id: "peru-to-patagonia/chachapoyas", alt: "Gocta Natura Reserve in the Chachapoyas cloud forest" } },
      { n: "2", title: "Paracas", place: "Dune Camp", coords: "13° 50′ S, 76° 15′ W", body: "Two nights at Dune Camp, built for Echo Charlie: pisco at a 1625 vineyard, a day at sea diving with fan-shell fishermen, sunset in the dunes, and the Nazca Lines from the air on the way south.", photo: { id: "peru-to-patagonia/paracas", alt: "Dune Camp among the Paracas dunes" } },
      { n: "2", title: "Atacama", place: "Tierra Atacama", coords: "22° 55′ S, 68° 12′ W", body: "The driest non-polar desert on Earth: Rainbow Valley, a private observatory, and a hot-air balloon over the volcanoes at dawn.", photo: { id: "peru-to-patagonia/atacama", alt: "A hot-air balloon over the Atacama at dawn" } },
      { n: "1", title: "Chiloé", place: "Refugia Chiloé", coords: "42° 29′ S, 73° 46′ W", body: "The palafitos of Castro and a curanto, shellfish, meat and potatoes cooked underground as it has been for generations.", photo: { id: "peru-to-patagonia/chiloe", alt: "Tierra Chiloé above the bay" } },
      { n: "3", title: "Patagonia", place: "Tierra Patagonia", coords: "51° 00′ S, 72° 55′ W", body: "Three nights on the edge of Torres del Paine: the park overland, the steppe on horseback, and an estancia asado with the gauchos.", photo: { id: "peru-to-patagonia/patagonia", alt: "Riding across the Patagonian steppe" } },
    ],
    dayNote: "Each number is nights at that stop.",
    rates: [{ season: "2027", option: "Twelve guests", rate: "From US $67,500", dates: ["1 to 13 Oct 2027", "9 to 21 Oct 2027", "21 Oct to 2 Nov 2027"] }],
    ratesNote: "Per person, as Echo Charlie publishes it. When a journey is full, it is full.",
    additions: dc3Additions(["explora-sacred-valley", "inkaterra-machu-picchu-pueblo-hotel", "awasi-patagonia"], { title: "Machu Picchu first", body: "The journey starts in Lima and skips the Sacred Valley. Two or three nights before, at Explora Sacred Valley or Inkaterra at Machu Picchu, make it the whole of Peru." }),
    faqs: [
      { q: "How many guests fly on Echo Charlie?", a: "Twelve at most, with two polar pilots, an aircraft engineer, cabin crew and a trip host." },
      { q: "What is the aircraft?", a: "A Douglas C-47 commissioned in 1942, rebuilt by Basler Turbo Conversions as a Basler BT-67 with Pratt & Whitney turboprops, modern avionics and a new cabin of hand-stitched leather seats." },
    ],
  },
  {
    slug: "colombia-to-guatemala", no: "TY-008", file: "dc3", operator: "Echo Charlie", title: "Colombia to Guatemala",
    length: "12 nights", from: 54000, season: "August to September 2027", group: "Twelve guests", base: "Seven stops, Medellín to Antigua",
    hero: { id: "colombia-to-guatemala/hero", alt: "Maya ruins rising from the forest at Uaxactún, Guatemala" },
    line: "Twelve nights north by DC-3: the Llanos' cowboys, the river of five colours, a forgotten island and Maya cities under the forest.",
    answer: "Colombia to Guatemala is a twelve-night Echo Charlie journey for twelve guests aboard a rebuilt DC-3, flying north from Medellín through San Agustín, La Macarena, the Llanos and the island of Providencia to the Maya cities of Tikal and Uaxactún and on to Antigua. It runs in August and September 2027 from US $54,000 per person.",
    brief: [
      "The places Colombia's long closure kept wild: the stone figures of San Agustín, Caño Cristales running red, gold and green, and the llaneros who sing to their cattle. Then a reef island closer to Nicaragua than the mainland, and the Maya jungle.",
      "The flights are short, a few hours at most, and every landing is a different world.",
    ],
    facts: [["Length", "12 nights"], ["Group", "Twelve guests at most"], ["Aircraft", "Basler BT-67 (a rebuilt DC-3)"], ["Route", "Medellín, San Agustín, La Macarena, Los Llanos, Providencia, Uaxactún, Antigua"], ["Departures", "August to September 2027"]],
    days: [
      { n: "1", title: "Medellín", place: "El Cielo, El Poblado", coords: "6° 15′ N, 75° 34′ W", body: "The city that rebuilt itself: the cable car built for the hillside communities, the Comunas with the people who lived their history, and a coffee roastery.", photo: { id: "colombia-to-guatemala/medellin", alt: "Medellín's hillside neighbourhoods" } },
      { n: "3", title: "San Agustín", place: "Hotel El Monasterio", coords: "1° 53′ N, 76° 16′ W", body: "The largest necropolis in the Americas: carved statues guarding burial mounds, an evening with a traditional weaver, and a ceremony with a shaman.", photo: { id: "colombia-to-guatemala/san-agustin", alt: "Carved stone figures at San Agustín" } },
      { n: "2", title: "La Macarena", place: "La Manigua Lodge", coords: "2° 11′ N, 73° 47′ W", body: "A 9 km hike to Caño Cristales, the river of five colours, a cacao harvest, and sunset over the forest canopy.", photo: { id: "colombia-to-guatemala/la-macarena", alt: "Caño Cristales running red over the rocks" } },
      { n: "2", title: "Los Llanos", place: "Savanna Orinoquia Lodge", body: "On horseback with the llaneros, a microlight over the plains and the capybaras, and a parranda llanera by the fire.", photo: { id: "colombia-to-guatemala/llanos", alt: "Horsemen crossing the savanna of the Llanos" } },
      { n: "2", title: "Providencia", place: "Monasterio del Viento", coords: "13° 21′ N, 81° 22′ W", body: "Diving one of the largest reefs on Earth with turtles, rays and nurse sharks, dinner with an islander, and a spearfished dinner on the beach.", photo: { id: "colombia-to-guatemala/providencia", alt: "The clear blue water off Providencia" } },
      { n: "2", title: "Uaxactún", place: "Uaxactún Camp", coords: "17° 24′ N, 89° 38′ W", body: "Tikal at first light with a Maya archaeologist, then Uaxactún, older and almost unexcavated, with the Maya community and the chicleros.", photo: { id: "colombia-to-guatemala/uaxactun", alt: "The Petén forest around Uaxactún" } },
      { n: "2", title: "Antigua", place: "Las Cruces", coords: "14° 34′ N, 90° 44′ W", body: "Lunch inside a roofless 18th-century ruin, Pacaya volcano at 2,552 m, a market, and a Zacapa rum tasting.", photo: { id: "colombia-to-guatemala/antigua", alt: "Antigua's colonial streets below the volcanoes" } },
    ],
    dayNote: "Each number is nights at that stop.",
    rates: [{ season: "2027", option: "Twelve guests", rate: "From US $54,000", dates: ["11 to 23 Aug 2027", "26 Aug to 7 Sep 2027", "7 to 19 Sep 2027", "18 to 30 Sep 2027"] }],
    ratesNote: "Per person, as Echo Charlie publishes it. When a journey is full, it is full.",
    additions: dc3Additions(["casa-palopo", "blancaneaux-lodge"], { title: "Stay on in Central America", body: "From Antigua it is a short drive to Lake Atitlán, and a short flight to Belize's Mountain Pine Ridge." }),
    faqs: [
      { q: "Is Colombia to Guatemala safe?", a: "Echo Charlie flies direct between remote airstrips with its own crew and host, and the Medellín day is led by people who lived the Comunas' history. Talk to us about current advice for each region before you book." },
      { q: "Can I dive on this journey?", a: "Yes, on Providencia, with reef diving and snorkelling among turtles, rays and nurse sharks." },
    ],
  },
  {
    slug: "scotland-to-greenland", no: "TY-009", file: "dc3", operator: "Echo Charlie", title: "Scotland to Greenland",
    length: "12 nights", from: 79000, season: "June to August 2027", group: "Twelve guests", base: "Edinburgh, the Faroes, Iceland, Greenland",
    hero: { id: "scotland-to-greenland/hero", alt: "Icebergs crowding the fjord at Ilulissat, Greenland" }, film: "basler",
    line: "Twelve nights across the North Atlantic on a 1930s route: sea caves, glaciers, a Cold War station on the ice sheet and a fjord camp.",
    answer: "Scotland to Greenland is a twelve-night Echo Charlie journey for twelve guests aboard a rebuilt DC-3, reviving a 1930s transatlantic route from Edinburgh across the Faroe Islands and Iceland to East and West Greenland, with a landing on the ice sheet at the abandoned DYE-2 Cold War station. It runs from June to August 2027 from US $79,000 per person.",
    brief: [
      "The first transatlantic pilots crossed one island at a time. This journey does the same: Faroese sea caves, super-jeeps into Thor's Valley, sled dogs and an ice cave in East Greenland, then the aircraft's own day, a landing on the ice sheet at a radar station abandoned mid-shift in 1988.",
      "It ends among the icebergs of Ilulissat and at a camp deep in the Nuuk fjord that only a boat can reach.",
    ],
    facts: [["Length", "12 nights"], ["Group", "Twelve guests at most"], ["Aircraft", "Basler BT-67 (a rebuilt DC-3)"], ["Route", "Edinburgh, Faroes, Snæfellsnes, Kulusuk, Ilulissat, Nuuk fjord"], ["Departures", "June to August 2027"]],
    days: [
      { n: "1", title: "Edinburgh", place: "The Balmoral", coords: "55° 57′ N, 3° 11′ W", body: "We gather beneath the castle rock at The Balmoral, Rocco Forte's hotel on Princes Street since 1902, for the welcome dinner.", photo: { id: "scotland-to-greenland/edinburgh", alt: "Edinburgh beneath the castle rock" } },
      { n: "3", title: "The Faroes", place: "Private Faroese cottages", coords: "62° 04′ N, 7° 16′ W", body: "The lake that floats above the sea at Sørvágsvatn, the Drangarnir stacks by boat, a sail to Koltur and into the sea caves, and lunch in a Bøur farmhouse.", photo: { id: "scotland-to-greenland/faroes", alt: "Sea cliffs of the Faroe Islands" } },
      { n: "2", title: "Snæfellsnes", place: "Saga Lodge", coords: "64° 48′ N, 23° 46′ W", body: "An 1884 farmhouse on the River Langá, the whole house ours; the peninsula under its glacier, then Thor's Valley by super-jeep or the Highlands by air.", photo: { id: "scotland-to-greenland/iceland", alt: "Iceland's glacier country" } },
      { n: "2", title: "East Greenland", place: "Hotel Angmagssalik, Tasiilaq", coords: "65° 34′ N, 37° 11′ W", body: "Sled dogs and their musher, a glacier hike into a meltwater ice cave, a sauna and an iceberg plunge, then DYE-2 on the ice sheet.", photo: { id: "scotland-to-greenland/kulusuk", alt: "Kulusuk and the East Greenland coast" } },
      { n: "1", title: "Ilulissat", place: "Hotel Icefiord", coords: "69° 13′ N, 51° 06′ W", body: "Across the ice sheet to the Icefjord, kayaking or paddleboarding among icebergs, and an optional midnight paddle.", photo: { id: "scotland-to-greenland/ilulissat", alt: "Icebergs in the Ilulissat Icefjord" } },
      { n: "3", title: "Nuuk fjord", place: "Kiattua Camp", coords: "64° 11′ N, 51° 44′ W", body: "Heated tipis reached only by boat: kayaking, cod fishing, a waterfall off the ice, a deserted-island barbecue and a closing ceremony with a local angakkuq.", photo: { id: "scotland-to-greenland/nuuk", alt: "Kiattua Camp in the Nuuk fjord" } },
    ],
    dayNote: "Each number is nights at that stop. The journey ends in Nuuk, with direct flights to New York.",
    rates: [{ season: "2027", option: "Twelve guests", rate: "From US $79,000", dates: ["1 to 13 Jun 2027", "12 to 24 Jun 2027", "12 to 24 Jul 2027", "24 Jul to 5 Aug 2027"] }],
    ratesNote: "Per person, as Echo Charlie publishes it. When a journey is full, it is full.",
    additions: dc3Additions([], { title: "Home by New York", body: "Nuuk has direct flights to New York. We plan the onward night and the connection, so the last fjord morning is not rushed." }),
    faqs: [
      { q: "What is DYE-2?", a: "A Cold War radar station on the Greenland ice sheet, abandoned in 1988 with more than sixty people's things left behind. When conditions allow, the Basler lands beside it." },
      { q: "How do you get home from Greenland?", a: "The journey ends at the Nuuk fjord; Echo Charlie notes direct flights from Nuuk to New York." },
    ],
  },
  // ---------- FILE C · The North Pacific (James, 19 Nov 2026: "add those for Safari Quest, 22 guests, and the Aleutian
  // Islands Adventure, Kodiak and Dutch Harbor ... to Terra Y"). James is an UnCruise partner (photographs cleared);
  // every fact, date and rate is from uncruise.com as read on 19 Nov 2026 (scripts/data/uncruise), nothing links out.
  {
    slug: "aleutian-islands", no: "TY-010", file: "sea", operator: "UnCruise Adventures", title: "The Aleutian Islands",
    length: "10 nights", from: 13600, season: "June to August, 2027 and 2028", group: "36 guests (2027), 74 guests (2028)", base: "Seward to Dutch Harbor, or the reverse",
    hero: { id: "jwco/voyages/uncruise/breaching-humpback", alt: "A humpback whale breaching in Alaskan waters" },
    line: "Ten nights from Seward along the Alaska Peninsula to Dutch Harbor: Kenai Fjords, Kodiak, Katmai's bears, Aniakchak and the volcanoes of the Aleutian chain.",
    answer: "The Aleutian Islands Adventure is a ten-night UnCruise Adventures voyage between Seward and Dutch Harbor, in either direction, by way of Kenai Fjords National Park, Kodiak Island, Katmai National Park, Aniakchak National Monument and Akutan Island. It sails in June, July and August aboard Safari Explorer (36 guests) in 2027 and Wilderness Explorer (74 guests) in 2028, from US $13,600 per person sharing.",
    brief: [
      "Most Alaska voyages stay in the Inside Passage. This one turns west, out along the Alaska Peninsula where the National Park System is at its emptiest: Katmai's coast and its brown bears, the open tundra of the Alaska Peninsula refuge, and Aniakchak, one of the least visited places the Park Service keeps.",
      "Past Unga Island, with its abandoned village and petrified forest, the yacht threads the channels to Akutan, below one of Alaska's most active volcanoes, and ends at Dutch Harbor on Unalaska, the working heart of the Aleutians.",
    ],
    facts: [["Length", "10 nights"], ["Route", "Seward, Kenai Fjords, Kodiak, Katmai, Aniakchak, Unga, Akutan, Dutch Harbor"], ["Yacht", "Safari Explorer (2027), Wilderness Explorer (2028)"], ["Guests", "36 in 2027; 74 in 2028"], ["Departures", "June to August, both directions"], ["Included", "Meals, drinks, kayaks, skiffs, guides, port fees, transfers"]],
    days: [
      { n: "01", title: "Embark in Seward", place: "Seward", body: "Fly into Anchorage; the transfer down the Kenai Peninsula to Seward is included, and the yacht sails that evening.", photo: { id: "jwco/ships/safari-explorer/hero", alt: "Safari Explorer at anchor below green mountains in a still Alaskan fjord" } },
      { n: "02", title: "Kenai Fjords National Park", place: "Kenai Fjords", body: "A glacial coast, protected since 1980: tidewater ice, seals on the floes and the first skiff outing.", photo: { id: "jwco/ships/safari-explorer/harbor-seal-ice", alt: "A harbor seal resting on floating ice in an Alaskan bay" } },
      { n: "03", title: "Kodiak Island", place: "Kodiak", body: "Volcanic shores and clear water, explored by kayak and on foot." },
      { n: "04", title: "Katmai National Park", place: "Katmai", body: "A coast shaped by fire, and the brown bears that fish and graze along it." },
      { n: "05", title: "Alaska Peninsula National Wildlife Refuge", place: "The Alaska Peninsula", body: "Volcanic peaks and open tundra, walked with the naturalists." },
      { n: "06", title: "Aniakchak National Monument and Preserve", place: "Aniakchak", body: "One of the least visited places in the National Park System." },
      { n: "07", title: "Unga Island", place: "Unga Island", body: "An abandoned village and the petrified stumps of an ancient forest." },
      { n: "08", title: "Captain's choice", place: "The Alaska Peninsula", body: "The day is chosen by the tides, the weather and the shifting channels." },
      { n: "09", title: "Akutan Island", place: "Akutan", body: "Below Mount Akutan, one of Alaska's most active volcanoes." },
      { n: "10", title: "Unalaska and Dutch Harbor", place: "Dutch Harbor", body: "The heart of the Aleutians and its working waterfront." },
      { n: "11", title: "Disembark in Dutch Harbor", place: "Dutch Harbor, Unalaska", body: "The transfer to the airport is included." },
    ],
    dayNote: "Sailings alternate direction; from Dutch Harbor the days run in reverse. UnCruise plans each day around tides and weather, so the order can change.",
    rates: [
      {"season": "2027 · Safari Explorer, 36 guests", "option": "Navigator cabin", "rate": "From US $13,600", "dates": ["4 to 14 Jun 2027, Seward to Dutch Harbor", "15 to 25 Jun 2027, Dutch Harbor to Seward", "2 to 12 Jul 2027, Seward to Dutch Harbor", "13 to 23 Jul 2027, Dutch Harbor to Seward", "30 Jul to 9 Aug 2027, Seward to Dutch Harbor", "10 to 20 Aug 2027, Dutch Harbor to Seward"], "note": "Trailblazer US $15,000; Admiral US $17,700; Jr. Commodore Suite US $20,400; Commodore Suite US $22,500"},
      {"season": "2028 · Wilderness Explorer, 74 guests", "option": "Navigator cabin", "rate": "From US $13,600", "dates": ["2 to 12 Jun 2028, Seward to Dutch Harbor", "13 to 23 Jun 2028, Dutch Harbor to Seward", "23 Jun to 3 Jul 2028, Seward to Dutch Harbor", "4 to 14 Jul 2028, Dutch Harbor to Seward", "14 to 24 Jul 2028, Seward to Dutch Harbor", "25 Jul to 4 Aug 2028, Dutch Harbor to Seward", "4 to 14 Aug 2028, Seward to Dutch Harbor", "15 to 25 Aug 2028, Dutch Harbor to Seward"], "note": "Trailblazer US $15,000; Pathfinder US $16,300; Admiral US $17,700"}
    ],
    ratesNote: "Per person sharing, by cabin, as UnCruise Adventures publishes it. Port fees, taxes, drinks and the embarkation transfers included; gratuities and flights not.",
    additions: [
      { title: "Anchorage either side", body: "Every sailing starts or ends with the flight to or from Anchorage. We plan the night before Seward and the connection out of Dutch Harbor, with room in the plan for the weather." },
      { title: "The whole yacht", body: "In 2027 the voyage sails on Safari Explorer, 36 guests in 18 cabins. A family or a group of friends can ask us to hold every cabin; UnCruise quotes whole-yacht charters on request." },
      { title: "One Folio, one advisor", body: "Flights, the Anchorage nights, the packing list for the North Pacific and the forms, in one Traveler Folio and run by one James Wild & Co advisor." },
    ],
    faqs: [
      { q: "Which ship sails the Aleutian Islands Adventure?", a: "Safari Explorer, 36 guests, in June to August 2027; Wilderness Explorer, 74 guests, in June to August 2028. Both are UnCruise Adventures yachts." },
      { q: "Does it run in both directions?", a: "Yes. Sailings alternate between Seward to Dutch Harbor and Dutch Harbor to Seward." },
      { q: "What is included?", a: "UnCruise includes all meals and drinks, kayaks, paddleboards, skiffs and naturalist guides, port fees and taxes, and the transfers on embarkation and disembarkation days. Gratuities and flights are extra." },
      { q: "Why is it in Terra Y?", a: "Because it goes where the Inside Passage voyages do not: out along the Alaska Peninsula to the Aleutian chain, with a handful of departures a year." },
    ],
  },
  {
    slug: "safari-quest-charter", no: "TY-011", file: "sea", operator: "UnCruise Adventures", title: "Safari Quest, the Whole Yacht",
    length: "7 nights", from: 9900, season: "May to September, 2027 and 2028", group: "22 guests, one party", base: "Juneau round trip",
    hero: { id: "jwco/ships/safari-quest/hero", alt: "A humpback whale's tail fluke below snow-capped mountains in Southeast Alaska" },
    line: "Eleven cabins, 22 guests and a 120-foot yacht held for one party: seven nights from Juneau through Glacier Bay, Chichagof, Admiralty Island and Endicott Arm.",
    answer: "Safari Quest is a 22-guest UnCruise Adventures yacht, 120 feet long with 11 outside cabins, that sails seven-night Glacier Wilderness voyages from Juneau from May to September. Terra Y holds the whole yacht for one family or group; by the cabin, UnCruise publishes fares from US $9,900 per person sharing, and whole-yacht charters are quoted on request.",
    brief: [
      "Twenty-two guests is a dinner party. Hold all eleven cabins and Safari Quest becomes a private expedition yacht in Southeast Alaska, with its naturalists, skiffs and kayaks, and a week that bends around your party rather than a schedule.",
      "The route is UnCruise's Glacier Wilderness: Icy Strait's whales and Glacier Bay's outer reaches, Chichagof by skiff, Admiralty Island and its bears, a hot spring few reach, Frederick Sound, and the seals on the ice below Dawes Glacier.",
    ],
    facts: [["Yacht", "Safari Quest, built 1992"], ["Guests", "22 in 11 outside cabins"], ["Guest to crew", "2:1"], ["Length", "120 ft (37 m), four decks"], ["Route", "Juneau round trip, 7 nights"], ["Departures", "Weekly, May to September"]],
    days: [
      { n: "01", title: "Embark in Juneau", place: "Juneau", body: "Fly into Juneau by 3 pm and board Safari Quest.", photo: { id: "jwco/ships/safari-quest/admiral-cabin", alt: "A Safari Quest cabin with a wide window onto the water" } },
      { n: "02", title: "Icy Strait and Glacier Bay's outer bay", place: "Glacier Bay", body: "Whales in Icy Strait, then the quiet outer reaches of the park." },
      { n: "03", title: "Iyoukeen Cove and Basket Bay", place: "Chichagof Island", body: "Deep into Chichagof's wilderness by skiff and kayak." },
      { n: "04", title: "Whitewater Bay or Takatz Bay", place: "Admiralty Island", body: "Admiralty Island, Kootznoowoo to the Tlingit, the fortress of the bears." },
      { n: "05", title: "Warm Springs Bay", place: "Warm Springs Bay", body: "Hot springs few visitors reach, and the Red Bluff wilderness." },
      { n: "06", title: "Frederick Sound", place: "Admiralty Island National Monument", body: "Humpback, killer, minke and fin whales off Admiralty Island.", photo: { id: "jwco/voyages/uncruise/breaching-humpback", alt: "A humpback whale breaching in Alaskan waters" } },
      { n: "07", title: "Dawes Glacier", place: "Endicott Arm", body: "Skiffs up Endicott Arm among harbor seals on the ice." },
      { n: "08", title: "Disembark in Juneau", place: "Juneau", body: "Breakfast aboard, then the transfer to Juneau airport for flights from 11.30 am." },
    ],
    dayNote: "UnCruise plans each day around wildlife, tides and weather, so the order can change. A whole-yacht party can ask for the week's emphasis: more whales, more bears, more kayaking.",
    rates: [
      {"season": "2027 · Spring and early September", "option": "Navigator cabin", "rate": "From US $10,500", "dates": ["14 to 21 May 2027", "21 to 28 May 2027", "3 to 10 Sep 2027"], "note": "Pathfinder US $12,600; Admiral US $14,700"},
      {"season": "2027 · High summer", "option": "Navigator cabin", "rate": "From US $11,200", "dates": ["28 May to 4 Jun 2027", "4 to 11 Jun 2027", "11 to 18 Jun 2027", "18 to 25 Jun 2027", "25 Jun to 2 Jul 2027", "2 to 9 Jul 2027", "9 to 16 Jul 2027", "16 to 23 Jul 2027", "23 to 30 Jul 2027", "30 Jul to 6 Aug 2027", "6 to 13 Aug 2027", "13 to 20 Aug 2027", "20 to 27 Aug 2027", "27 Aug to 3 Sep 2027"], "note": "Pathfinder US $13,500; Admiral US $15,700"},
      {"season": "2027 · Late season", "option": "Navigator cabin", "rate": "From US $9,900", "dates": ["10 to 17 Sep 2027"], "note": "Pathfinder US $11,900; Admiral US $13,900"},
      {"season": "2028 · Spring and early September", "option": "Navigator cabin", "rate": "From US $10,500", "dates": ["19 to 26 May 2028", "26 May to 2 Jun 2028", "1 to 8 Sep 2028"], "note": "Pathfinder US $12,600; Admiral US $14,700"},
      {"season": "2028 · High summer", "option": "Navigator cabin", "rate": "From US $11,200", "dates": ["2 to 9 Jun 2028", "9 to 16 Jun 2028", "16 to 23 Jun 2028", "23 to 30 Jun 2028", "30 Jun to 7 Jul 2028", "7 to 14 Jul 2028", "14 to 21 Jul 2028", "21 to 28 Jul 2028", "28 Jul to 4 Aug 2028", "4 to 11 Aug 2028", "11 to 18 Aug 2028", "18 to 25 Aug 2028", "25 Aug to 1 Sep 2028"], "note": "Pathfinder US $13,500; Admiral US $15,700"},
      {"season": "2028 · Late season", "option": "Navigator cabin", "rate": "From US $9,900", "dates": ["8 to 15 Sep 2028"], "note": "Pathfinder US $11,900; Admiral US $13,900"}
    ],
    ratesNote: "Per person sharing, by cabin, as UnCruise Adventures publishes it; the whole yacht (all 11 cabins) is quoted by UnCruise on request. Port fees, taxes, drinks and transfers included; gratuities and flights not.",
    additions: [
      { title: "All eleven cabins", body: "Hold the yacht for one party and every cabin, every skiff seat and every naturalist is yours. We ask UnCruise for the charter rate on your dates and file it in your Folio." },
      { title: "We know the Safari Quest team", body: "James Wild & Co works with UnCruise as a partner and knows the people aboard Safari Quest; the brief for your week goes to them directly." },
      { title: "One Folio, one advisor", body: "Flights to Juneau, a night either side, the forms and the party's preferences, in one Traveler Folio and run by one James Wild & Co advisor." },
    ],
    faqs: [
      { q: "How many guests does Safari Quest carry?", a: "Twenty-two, in 11 outside cabins, with a guest to crew ratio of 2:1, as UnCruise publishes it." },
      { q: "Can we charter the whole yacht?", a: "Yes. UnCruise quotes whole-yacht charters on request; ask us for your dates and we request it." },
      { q: "Where does the week start?", a: "In Juneau. Fly in by 3 pm on the first day; on the last morning the transfer reaches the airport for flights from 11.30 am." },
    ],
  },
];

export const TY_AIRCRAFT = {
  name: "The Basler BT-67",
  facts: [["Built", "1942, as a Douglas C-47 for the US Air Force"], ["Rebuilt", "Basler Turbo Conversions, Oshkosh, 2014 to 2018"], ["Engines", "Pratt & Whitney turboprops, modern avionics"], ["Cabin", "Hand-stitched leather seats, entertainment, a guest restroom"], ["Crew", "Two polar pilots, an engineer, cabin crew, a trip host"]] as [string, string][],
  story: "The oldest surviving ex-RAF Dakota: in RAF service from 1943, later carrying migrants from post-war Europe to Australia, and on screen as Churchill's aircraft in The Eagle Has Landed. White Desert has flown Baslers in Antarctica for more than 20 years, most notably to the South Pole.",
  photos: [{ id: "aircraft/cabin", alt: "The Basler's leather-seated cabin" }, { id: "aircraft/vintage", alt: "The DC-3 in its early years" }, { id: "aircraft/private-access", alt: "The Basler on a remote airstrip" }],
};

export const TY_CAMPS = [
  { name: "Whichaway Camp", coords: WHICHAWAY, line: "The original camp, reimagined: rare exposed rock and freshwater lakes.", photo: { id: "camps/whichaway", alt: "Whichaway Camp's domes beside the frozen lake" } },
  { name: "Echo Base", coords: ECHO, line: "Inspired by astronauts: sleeping pods with endless views among the nunataks.", photo: { id: "camps/echo", alt: "An Echo Base sleeping pod looking out on the ice" } },
  { name: "Explorer Camp", coords: EXPLORER, line: "Chalet-style and true to the expeditionary roots: six tents beneath the T-rex range.", photo: { id: "camps/explorer", alt: "Explorer Camp's tents below the mountains" } },
];

export const tyDossier = (slug: string) => TY_DOSSIERS.find((d) => d.slug === slug) ?? null;
export const tyUsd = (n: number) => `US $${n.toLocaleString("en-US")}`;

// ---------- the route maps (James, 15 Nov 2026: "animate Terra Y… a chip of each location as the map scrolls along,
// and the boats or the planes must not go through the islands") ----------
// Every leg is flown except where noted: air legs draw as great-circle arcs (an aircraft crosses land; that is the
// point of the DC-3), ground legs straight, and the one sea leg, Kulusuk to Tasiilaq by boat, is routed round the
// islands by scripts/sealanes.py on the OSM coastline (scripts/data/coast/east-greenland.geojson), never across them.
// Camp, Pole and Dixie's positions are White Desert's own; Dixie's Camp sits at 83° S on the Pole meridian from
// the camps (White Desert gives the latitude only), Atka Bay and towns at their own positions.
export type TyStop = { name: string; lat: number; lng: number; mode: "air" | "ground" | "sea"; days: string[]; zoom?: number; path?: [number, number][] };

const S = {
  capeTown: { name: "Cape Town", lat: -33.92, lng: 18.42, zoom: 8 },
  wolfsFang: { name: "Wolf's Fang Runway", lat: -71.53, lng: 8.84, zoom: 6.8 },
  echo: { name: "Echo Base", lat: -71.5464, lng: 8.8364, zoom: 6.8 },
  explorer: { name: "Explorer Camp", lat: -71.5269, lng: 8.8556, zoom: 6.8 },
  whichaway: { name: "Whichaway Camp", lat: -70.8, lng: 11.3833, zoom: 6.8 },
  schirmacher: { name: "Blue Rivers, Schirmacher Oasis", lat: -70.75, lng: 11.6, zoom: 9.5 },
  atka: { name: "Atka Bay Emperor colony", lat: -70.6, lng: -8.0, zoom: 6.5 },
  dixies: { name: "Dixie's Camp, 83° S", lat: -83.0, lng: 8.84, zoom: 6 },
  pole: { name: "The South Pole, 90° S", lat: -89.99, lng: 0, zoom: 5 },
};
type P = { name: string; lat: number; lng: number; zoom?: number };
const at = (p: P, mode: TyStop["mode"], ...days: string[]): TyStop => ({ ...p, mode, days });

export const TY_ROUTES: Record<string, TyStop[]> = {
  "south-pole-penguins": [at(S.capeTown, "air"), at(S.echo, "air", "01"), at(S.atka, "air", "02"), at(S.echo, "air", "03"), at(S.dixies, "air"), at(S.pole, "air", "04"), at(S.dixies, "air", "05"), at(S.echo, "air", "06", "07"), at(S.capeTown, "air", "08")],
  "south-pole-blue-rivers": [at(S.capeTown, "air"), at(S.echo, "air", "01", "02"), at(S.dixies, "air"), at(S.pole, "air", "03"), at(S.dixies, "air", "04"), at(S.echo, "air", "05"), at(S.schirmacher, "ground", "06"), at(S.whichaway, "ground", "07"), at(S.capeTown, "air", "08")],
  "the-long-stay": [at(S.capeTown, "air"), at(S.whichaway, "air", "01", "02", "03"), at(S.dixies, "air"), at(S.pole, "air", "04"), at(S.dixies, "air"), at(S.echo, "air", "05", "06", "07"), at(S.capeTown, "air", "08")],
  "baby-penguins-blue-tunnels": [at(S.capeTown, "air"), at(S.whichaway, "air", "01", "02"), at(S.atka, "air", "03"), at(S.whichaway, "air", "04", "05"), at(S.capeTown, "air", "06")],
  "discovery-week": [at(S.capeTown, "air"), at(S.explorer, "air", "01", "02", "03", "04"), at(S.schirmacher, "air", "05"), at(S.explorer, "air", "06"), at(S.capeTown, "air", "07")],
  "antarctica-in-a-day": [at(S.capeTown, "air", "00"), at(S.wolfsFang, "air", "01", "02", "03"), at(S.capeTown, "air")],
  "peru-to-patagonia": [
    at({ name: "Lima", lat: -12.05, lng: -77.05, zoom: 9 }, "air", "Lima"), at({ name: "Chachapoyas", lat: -6.22, lng: -77.87, zoom: 9 }, "air", "Chachapoyas"),
    at({ name: "Paracas", lat: -13.83, lng: -76.25, zoom: 9 }, "air", "Paracas"), at({ name: "Atacama", lat: -22.91, lng: -68.2, zoom: 9 }, "air", "Atacama"),
    at({ name: "Chiloé", lat: -42.48, lng: -73.77, zoom: 9 }, "air", "Chiloé"), at({ name: "Torres del Paine", lat: -51.0, lng: -72.92, zoom: 9 }, "air", "Patagonia"),
  ],
  "colombia-to-guatemala": [
    at({ name: "Medellín", lat: 6.25, lng: -75.57, zoom: 10 }, "air", "Medellín"), at({ name: "San Agustín", lat: 1.88, lng: -76.27, zoom: 10 }, "air", "San Agustín"),
    at({ name: "La Macarena", lat: 2.18, lng: -73.79, zoom: 10 }, "air", "La Macarena"), at({ name: "Los Llanos", lat: 4.9, lng: -71.4, zoom: 7 }, "air", "Los Llanos"),
    at({ name: "Providencia", lat: 13.35, lng: -81.37, zoom: 11 }, "air", "Providencia"), at({ name: "Uaxactún", lat: 17.39, lng: -89.63, zoom: 10 }, "air", "Uaxactún"),
    at({ name: "Antigua", lat: 14.56, lng: -90.73, zoom: 11 }, "air", "Antigua"),
  ],
  "scotland-to-greenland": [
    at({ name: "Edinburgh", lat: 55.95, lng: -3.19, zoom: 10 }, "air", "Edinburgh"), at({ name: "The Faroes", lat: 62.07, lng: -7.27, zoom: 9 }, "air", "The Faroes"),
    at({ name: "Snæfellsnes", lat: 64.8, lng: -23.77, zoom: 8.5 }, "air", "Snæfellsnes"), at({ name: "Kulusuk", lat: 65.57, lng: -37.18, zoom: 10 }, "air"),
    { name: "Tasiilaq, by boat", lat: 65.61, lng: -37.64, mode: "sea", zoom: 10, days: ["East Greenland"], path: [[-37.18, 65.57], [-37.1784, 65.5811], [-37.1827, 65.5829], [-37.1611, 65.6078], [-37.1697, 65.6185], [-37.1956, 65.6327], [-37.2128, 65.6398], [-37.2257, 65.6416], [-37.2601, 65.6398], [-37.4711, 65.59], [-37.5399, 65.5793], [-37.5787, 65.5793], [-37.5873, 65.5811], [-37.5959, 65.5847], [-37.6002, 65.59], [-37.5916, 65.5953], [-37.5916, 65.5989], [-37.6002, 65.6025], [-37.64, 65.61]] },
    at({ name: "DYE-2, the ice sheet", lat: 66.48, lng: -46.3, zoom: 7 }, "air"), at({ name: "Ilulissat", lat: 69.22, lng: -51.1, zoom: 10 }, "air", "Ilulissat"),
    at({ name: "Nuuk fjord", lat: 64.18, lng: -51.72, zoom: 9 }, "air", "Nuuk fjord"),
  ],
  // UnCruise (19 Nov 2026): the Seward to Dutch Harbor sailing, every leg routed round the OSM coast by scripts/sealanes.py
  // (public/maps/routes/safari-explorer-seward-to-dutch-harbor-10n.json); the reverse sails the same water.
  "aleutian-islands": [
    {"name": "Seward", "lat": 60.095, "lng": -149.438, "mode": "ground", "days": ["01"], "zoom": 8},
    {"name": "Kenai Fjords National Park", "lat": 59.75, "lng": -149.65, "mode": "sea", "days": ["02"], "zoom": 8, "path": [[-149.438, 60.095], [-149.417, 60.075], [-149.368, 59.988], [-149.382, 59.919], [-149.432, 59.869], [-149.506, 59.696], [-149.516, 59.691], [-149.556, 59.685], [-149.576, 59.685], [-149.585, 59.688], [-149.66, 59.728], [-149.665, 59.735], [-149.665, 59.743], [-149.65, 59.75]]},
    {"name": "Kodiak Island", "lat": 57.782, "lng": -152.418, "mode": "sea", "days": ["03"], "zoom": 8, "path": [[-149.65, 59.75], [-149.69, 59.702], [-149.699, 59.649], [-149.745, 59.601], [-152.204, 57.772], [-152.251, 57.753], [-152.297, 57.739], [-152.325, 57.739], [-152.362, 57.748], [-152.418, 57.782]]},
    {"name": "Katmai National Park", "lat": 58.1, "lng": -154.55, "mode": "sea", "days": ["04"], "zoom": 8, "path": [[-152.418, 57.782], [-152.428, 57.77], [-152.42, 57.762], [-152.412, 57.758], [-152.374, 57.779], [-152.366, 57.787], [-152.328, 57.811], [-152.32, 57.823], [-152.473, 57.9], [-152.489, 57.904], [-152.496, 57.908], [-152.588, 57.929], [-152.803, 57.917], [-152.963, 57.965], [-153.293, 58.002], [-154.502, 58.075], [-154.518, 58.079], [-154.525, 58.083], [-154.533, 58.091], [-154.55, 58.1]]},
    {"name": "Alaska Peninsula National Wildlife Refuge", "lat": 57.043, "lng": -156.541, "mode": "sea", "days": ["05"], "zoom": 8, "path": [[-154.55, 58.1], [-154.498, 58.072], [-154.457, 58.065], [-154.43, 58.065], [-154.416, 58.057], [-154.416, 58.05], [-156.442, 57.074], [-156.511, 57.052], [-156.541, 57.043]]},
    {"name": "Aniakchak National Monument and Preserve", "lat": 56.667, "lng": -157.803, "mode": "sea", "days": ["06"], "zoom": 8, "path": [[-156.541, 57.043], [-156.535, 56.977], [-156.587, 56.948], [-156.656, 56.929], [-157.289, 56.649], [-157.394, 56.621], [-157.532, 56.602], [-157.689, 56.597], [-157.784, 56.649], [-157.803, 56.667]]},
    {"name": "Unga Island", "lat": 55.196, "lng": -160.721, "mode": "sea", "days": ["07"], "zoom": 8, "path": [[-157.803, 56.667], [-157.808, 56.491], [-158.109, 56.232], [-158.39, 56.008], [-158.711, 55.805], [-160.416, 55.142], [-160.536, 55.109], [-160.676, 55.142], [-160.716, 55.165], [-160.721, 55.196]]},
    {"name": "Captain's choice, the Alaska Peninsula", "lat": 54.8, "lng": -163.3, "mode": "sea", "days": ["08"], "zoom": 8, "path": [[-160.721, 55.196], [-160.778, 55.129], [-160.816, 55.108], [-162.178, 54.825], [-162.329, 54.797], [-163.3, 54.8]]},
    {"name": "Akutan Island", "lat": 54.13, "lng": -165.77, "mode": "sea", "days": ["09"], "zoom": 8, "path": [[-163.3, 54.8], [-163.179, 54.786], [-163.143, 54.772], [-163.065, 54.723], [-163.035, 54.688], [-163.029, 54.667], [-163.047, 54.653], [-163.059, 54.646], [-164.496, 54.4], [-164.653, 54.376], [-165.643, 54.306], [-165.697, 54.274], [-165.709, 54.253], [-165.709, 54.141], [-165.721, 54.134], [-165.752, 54.127], [-165.77, 54.13]]},
    {"name": "Dutch Harbor, Unalaska", "lat": 53.892, "lng": -166.53, "mode": "sea", "days": ["10", "11"], "zoom": 8, "path": [[-165.77, 54.13], [-165.756, 54.133], [-165.729, 54.142], [-165.724, 54.145], [-165.75, 54.163], [-165.881, 54.218], [-165.944, 54.228], [-165.985, 54.225], [-166.079, 54.182], [-166.44, 53.973], [-166.508, 53.899], [-166.518, 53.893], [-166.53, 53.892]]}
  ],
  // Safari Quest's Glacier Wilderness week (public/maps/routes/safari-quest-juneau-round-trip-7n.json).
  "safari-quest-charter": [
    {"name": "Juneau", "lat": 58.294, "lng": -134.418, "mode": "ground", "days": ["01"], "zoom": 8},
    {"name": "Glacier Bay, the outer bay", "lat": 58.45, "lng": -136.05, "mode": "sea", "days": ["02"], "zoom": 8, "path": [[-134.418, 58.294], [-134.394, 58.282], [-134.386, 58.279], [-134.262, 58.21], [-134.25, 58.198], [-134.25, 58.196], [-134.266, 58.187], [-134.294, 58.185], [-134.593, 58.225], [-134.637, 58.244], [-134.897, 58.382], [-134.905, 58.384], [-134.921, 58.392], [-134.925, 58.397], [-134.941, 58.407], [-134.957, 58.416], [-134.964, 58.411], [-134.976, 58.386], [-135.048, 58.19], [-135.06, 58.183], [-135.196, 58.2], [-135.918, 58.371], [-136.042, 58.443], [-136.05, 58.45]]},
    {"name": "Chichagof Island: Iyoukeen Cove and Basket Bay", "lat": 57.659, "lng": -134.903, "mode": "sea", "days": ["03"], "zoom": 8, "path": [[-136.05, 58.45], [-135.945, 58.367], [-135.678, 58.253], [-135.112, 58.101], [-134.968, 58.057], [-134.917, 58.03], [-134.896, 57.97], [-134.886, 57.682], [-134.903, 57.659]]},
    {"name": "Admiralty Island: Whitewater Bay", "lat": 57.227, "lng": -134.591, "mode": "sea", "days": ["04"], "zoom": 8, "path": [[-134.903, 57.659], [-134.891, 57.655], [-134.885, 57.652], [-134.863, 57.629], [-134.626, 57.255], [-134.591, 57.227]]},
    {"name": "Warm Springs Bay", "lat": 57.085, "lng": -134.819, "mode": "sea", "days": ["05"], "zoom": 8, "path": [[-134.591, 57.227], [-134.631, 57.248], [-134.639, 57.25], [-134.643, 57.248], [-134.775, 57.093], [-134.784, 57.086], [-134.792, 57.082], [-134.819, 57.085]]},
    {"name": "Frederick Sound, Admiralty Island National Monument", "lat": 57.15, "lng": -134.05, "mode": "sea", "days": ["06"], "zoom": 8, "path": [[-134.819, 57.085], [-134.791, 57.08], [-134.786, 57.083], [-134.781, 57.083], [-134.622, 57.011], [-134.501, 57.014], [-134.05, 57.15]]},
    {"name": "Endicott Arm and Dawes Glacier", "lat": 57.591, "lng": -133.368, "mode": "sea", "days": ["07"], "zoom": 8, "path": [[-134.05, 57.15], [-133.716, 57.331], [-133.518, 57.544], [-133.482, 57.574], [-133.47, 57.579], [-133.45, 57.585], [-133.376, 57.589], [-133.368, 57.591]]},
    {"name": "Juneau", "lat": 58.294, "lng": -134.418, "mode": "sea", "days": ["08"], "zoom": 8, "path": [[-133.368, 57.591], [-133.421, 57.586], [-133.451, 57.586], [-133.454, 57.584], [-133.457, 57.584], [-133.466, 57.58], [-133.566, 57.56], [-133.59, 57.564], [-133.62, 57.576], [-133.665, 57.612], [-134.102, 58.101], [-134.195, 58.174], [-134.355, 58.261], [-134.418, 58.294]]}
  ],
};
/** The route stop a day card belongs to: White Desert days by number, Echo Charlie stops by title. */
export const stopForDay = (slug: string, d: { n: string; title: string }) => (TY_ROUTES[slug] ?? []).findIndex((s) => s.days.includes(d.n) || s.days.includes(d.title));
