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
export const ty = (id: string, w = 2000) => `${CLD}/image/upload/c_limit,w_${w}/q_auto:good/f_auto/jwco/terra-y/${id}`;
export const tyFilm = (id: string) => `${CLD}/video/upload/q_auto/f_auto/jwco/terra-y/films/${id}`;
export const tyPoster = (id: string) => `${CLD}/video/upload/so_2,q_auto,f_jpg,w_1600/jwco/terra-y/films/${id}`;

export const TY_PATH = "/overland/terra-y";
export const tyPath = (slug: string) => `${TY_PATH}/${slug}`;

export type TyFile = "ice" | "dc3";
export type TyDay = { n: string; title: string; body: string; place: string; coords?: string; photo?: { id: string; alt: string } };
export type TyRate = { season: string; option: string; rate: string; dates: string[]; note?: string };
export type TyAddition = { title: string; body: string; stays?: string[] };
export type TyDossier = {
  slug: string; no: string; file: TyFile; title: string; operator: "White Desert" | "Echo Charlie";
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
