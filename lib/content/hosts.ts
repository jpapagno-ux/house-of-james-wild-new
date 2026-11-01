import films from "./films.json";
// The host card switchboard. Every stay, camp and reserve page shows the
// "Meet your host" card (components/record/HostPanel.tsx); this is where
// each one is switched. The library has no host_connect field and no host
// Person records linked yet, so every record defaults to "not_linking" (the
// house takes the call). Set "available" with a host once a partner approves
// host calls, or "off" to hide the card.
import type { Host, HostConnect } from "@/components/record/HostPanel";

// Group connect: a live call with the host or manager, a James Wild & Co
// advisor and up to six travellers. It runs on every record type once the
// partner asks for it and we switch it on: stays ("stay:<slug>"), lodges,
// camps and residences / homesteads on a reserve ("camp:<reserve>/<camp>"),
// reserves ("reserve:<slug>") and vessels ("voyage:<vessel>"). The card's
// wording follows the record type (host, camp manager, house manager, crew). GROUP_CONNECT_ON switches every group card
// at once; set a record's state to "off" (or "not_linking") to switch one.
export const GROUP_CONNECT_ON = true;

// PLACEHOLDER until James's live Calendly group event is set.
const GROUP_CALENDLY = "https://calendly.com/jameswildco/group-connect";

// SAMPLE host cards (sample: true): roles only, no names, until each property
// confirms who takes the call. Topics come from the Ledger record.
export const HOSTS: Record<string, { state: HostConnect; host?: Host }> = {
  "stay:leeu-estates": { state: "available", host: {
    name: "Leeu Estates Guest Relations", role: "Your host · Franschhoek", sample: true, seats: 6,
    tz: "Africa/Johannesburg", place: "Franschhoek", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=leeu-estates`,
    topics: [
      "The rooms side by side, Classic to Executive Suite with Terrace to Terroir Cottage, and which suits your party",
      "What the rate includes and what's extra: the spa, La Petite Colombe, the wine studio",
      "Your dates against the best months (October to April) and harvest season",
      "Getting there: about 60 to 75 minutes by car from Cape Town International",
      "Children, celebrations, dietary needs, and anything that keeps you up at night",
    ],
  } },
  "stay:aguas-claras": { state: "available", host: {
    name: "Aguas Claras Front of House", role: "Your host · Playa Chiquita", sample: true, seats: 6,
    tz: "America/Costa_Rica", place: "Playa Chiquita", zoneLabel: "Costa Rica time (UTC−6, no daylight saving)",
    calendlyUrl: `${GROUP_CALENDLY}?property=aguas-claras`,
    topics: [
      "Twelve rooms on the sand: which bungalow or suite fits your group, and which have plunge pools",
      "Full board or not: Papaya restaurant, the Dalime beach club and what's included",
      "Your dates against the best months (May to November)",
      "Getting there: a domestic flight to Limón, a private driver from SJO, or a helicopter",
      "Snorkelling, surf lessons, naturalist walks: what to book ahead and what to leave loose",
    ],
  } },
  // Approved showcase hosts (James, 30 Oct 2026). The on/off switch for each
  // lives in Airtable (Wild & Co Safaris base, Hosts table, "Show on site");
  // mirror it here: untick there, set state "not_linking" here.
  "camp:lion-sands/ivory-lodge": { state: "available", host: {
    name: "Matthew Christopher Smith", role: "Your host · International Sales Manager, MORE Collection (Lion Sands)", seats: 6,
    tz: "Africa/Johannesburg", place: "Johannesburg", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=lion-sands-ivory-lodge`,
    topics: [
      "The suites at Ivory Lodge and which suits your party",
      "What the rate includes and what's extra",
      "Your dates against the best months in the Sabi Sand",
      "Getting there: flights, the airstrip and the transfer",
      "Children, celebrations, dietary needs, and anything that keeps you up at night",
    ],
  } },
  "stay:wilderness-dumatau": { state: "available", host: {
    name: "Iain McConachie", role: "Your host · North America Retail Manager, Wilderness", seats: 6,
    tz: "America/Denver", place: "Denver", zoneLabel: "US Mountain Time",
    calendlyUrl: `${GROUP_CALENDLY}?property=wilderness-dumatau`,
    topics: [
      "DumaTau's suites and which suits your party",
      "What the rate includes and what's extra",
      "Your dates against the best months in the Linyanti",
      "Getting there: flights into Maun or Kasane and the light-aircraft transfer",
      "Pairing DumaTau with other Wilderness camps, and anything that keeps you up at night",
    ],
  } },
  "stay:wilderness-little-duma-tau": { state: "available", host: {
    name: "Iain McConachie", role: "Your host · North America Retail Manager, Wilderness", seats: 6,
    tz: "America/Denver", place: "Denver", zoneLabel: "US Mountain Time",
    calendlyUrl: `${GROUP_CALENDLY}?property=wilderness-little-duma-tau`,
    topics: [
      "Little DumaTau's suites and which suits your party",
      "What the rate includes and what's extra",
      "Your dates against the best months in the Linyanti",
      "Getting there: flights into Maun or Kasane and the light-aircraft transfer",
      "Pairing DumaTau with other Wilderness camps, and anything that keeps you up at night",
    ],
  } },
  // Londolozi (James, 31 Oct 2026): one host across every Londolozi listing.
  // Garrett Fitzpatrick, Sales Manager, as Londolozi's own blog lists him
  // (confirmed by James, 31 Oct 2026).
  "reserve:londolozi-reserve": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi`,
    topics: [
      "Londolozi's four camps, the Granite Suites and the villas, and which suits your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "stay:londolozi-reserve": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi`,
    topics: [
      "Londolozi's four camps, the Granite Suites and the villas, and which suits your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/founders-camp": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-founders-camp`,
    topics: [
      "Founders Camp: the Cubs Den for children and daily yoga on the ebony-tree deck, and whether it suits your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/varty-camp": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-varty-camp`,
    topics: [
      "Varty Camp: the Healing House, the photographic studio and the gym, and whether it suits your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/tree-camp": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-tree-camp`,
    topics: [
      "Tree Camp's suites, and whether they suit your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/pioneer-camp": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-pioneer-camp`,
    topics: [
      "Pioneer Camp: just three suites on the river, and whether it suits your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/private-granite-suites": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-private-granite-suites`,
    topics: [
      "The Private Granite Suites, and whether they suit your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "camp:londolozi-reserve/private-villas": { state: "available", host: {
    name: "Garrett Fitzpatrick", role: "Your host · Sales Manager, Londolozi", seats: 6,
    tz: "Africa/Johannesburg", place: "Londolozi, Sabi Sand", zoneLabel: "South Africa Standard Time (UTC+2)",
    calendlyUrl: `${GROUP_CALENDLY}?property=londolozi-private-villas`,
    topics: [
      "The Private Villas and the Pioneer Homestead, and whether they suit your party",
      "The Healing House, daily yoga and private wellness sessions, and how to fit them around game drives",
      "Photographing leopards: private vehicles, camera hire and Lightroom tuition in the studio",
      "Your dates against the best months in the Sabi Sand",
      "Getting there, children and celebrations, and anything that keeps you up at night",
    ],
  } },
  "voyage:aliikai": { state: "available", host: {
    name: "Aliikai Cruise Director", role: "Your host · aboard Aliikai, Raja Ampat", sample: true, seats: 6,
    tz: "Asia/Jayapura", place: "Raja Ampat", zoneLabel: "Eastern Indonesia Time (UTC+9)",
    calendlyUrl: `${GROUP_CALENDLY}?property=aliikai`,
    topics: [
      "The seven cabins and the whole-yacht charter: who sleeps where",
      "The route, the season and what the sea does that month",
      "Diving, snorkelling and shore days: levels, kit and what's included",
      "Getting to the boat: flights into Sorong and the transfer",
      "Food, children aboard, and anything the crew should know before you sail",
    ],
  } },
};

export const hostFor = (key: string) => {
  const h = HOSTS[key] ?? { state: "not_linking" as HostConnect };
  return !GROUP_CONNECT_ON && h.state === "available" ? { state: "not_linking" as HostConnect } : h;
};

// Films come from the Film Desk in Stay Studio (approved FilmLink records,
// exported nightly to films.json). Everything else gets the placeholder slot.
export const VIDEOS: Record<string, { id: string; title: string }> = films;
