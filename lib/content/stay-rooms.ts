// Room types, published rates and what a stay includes (James, 10 Nov 2026: "show what some of the rooms look like ...
// each of the room types and a compact, tight way to look at the rooms. Maybe accordion style. Also, what's included in
// the rooms and excluded. Some footnotes. Quotes from James.").
//
// Sources: the brand's own website only (house rule, 31 Oct 2026), read on 10 Nov 2026. Rates are the brand's published
// rack rates on the basis it publishes them (James, 9 Nov 2026: "use published rack rates"); the house's commission is
// never shown. Anything the brand does not publish is left out, never filled in. No dashes in public copy.
// Photographs: the brand's own, in Cloudinary with credit. A room with no brand photograph shows none.

export type Money = { currency: "USD" | "ZAR"; amount: number };
export type Season = { key: string; label: string; dates: string; /** last night of the season, ISO; past seasons drop out */ to: string };
export type RoomRate = { season: string; rate: number; extra?: string };
export type RoomType = {
  name: string;
  count?: number;
  /** short facts, in the order shown: size, beds, who it sleeps, the view */
  facts: string[];
  features: string[];
  rates: RoomRate[];
  /** how the rate is charged, when it differs from the stay's basis */
  basis?: string;
  image?: { id: string; alt: string };
  note?: string;
};
export type StayRooms = {
  intro: string;
  currency: Money["currency"];
  basis: string;
  seasons: Season[];
  rooms: RoomType[];
  included: string[];
  excluded: string[];
  /** footnotes: the source, the terms the brand publishes, what the house confirms */
  notes: string[];
  source: { label: string; url: string };
  credit: string;
};

const ROOMS: Record<string, StayRooms> = {
  "wilderness-dumatau": {
    intro: "Eight tented suites on raised walkways above Osprey Lagoon, each with its own plunge pool, and a family room. Wilderness publishes one rate for every suite, per person sharing.",
    currency: "USD",
    basis: "per person a night, sharing",
    seasons: [
      { key: "g26", label: "Green season", dates: "1 Nov to 19 Dec 2026", to: "2026-12-19" },
      { key: "f26", label: "Festive", dates: "20 Dec 2026 to 5 Jan 2027", to: "2027-01-05" },
      { key: "g27", label: "Green season", dates: "6 Jan to 31 Mar 2027", to: "2027-03-31" },
      { key: "a27", label: "April", dates: "1 to 30 Apr 2027", to: "2027-04-30" },
      { key: "m27", label: "May", dates: "1 to 31 May 2027", to: "2027-05-31" },
      { key: "p27", label: "Peak", dates: "1 Jun to 31 Oct 2027", to: "2027-10-31" },
      { key: "n27", label: "Green season", dates: "1 Nov to 19 Dec 2027", to: "2027-12-19" },
      { key: "f27", label: "Festive", dates: "20 Dec 2027 to 5 Jan 2028", to: "2028-01-05" },
    ],
    rooms: [
      {
        name: "Tented Suite", count: 8,
        facts: ["Private plunge pool", "Deck over Osprey Lagoon"],
        features: ["Raised on wooden walkways above the lagoon", "Interiors of hand-crafted mosaic tile, acacia wood and local textiles", "A private plunge pool on the deck"],
        rates: [{ season: "g26", rate: 2285 }, { season: "f26", rate: 3678 }, { season: "g27", rate: 1914 }, { season: "a27", rate: 2422 }, { season: "m27", rate: 3177 }, { season: "p27", rate: 4587 }, { season: "n27", rate: 2422 }, { season: "f27", rate: 3899 }],
        image: { id: "wilderness-destinations/botswana/wilderness-dumatau/camp/wilderness-dumatau-from-the-river", alt: "Wilderness DumaTau from the Linyanti channel, the suites along the lagoon" },
      },
      {
        name: "Family Room", count: 1,
        facts: ["Designed for families"],
        features: ["Wilderness lists a family room among the camp's facilities; the house confirms its layout with your quote"],
        rates: [{ season: "g26", rate: 2285 }, { season: "f26", rate: 3678 }, { season: "g27", rate: 1914 }, { season: "a27", rate: 2422 }, { season: "m27", rate: 3177 }, { season: "p27", rate: 4587 }, { season: "n27", rate: 2422 }, { season: "f27", rate: 3899 }],
      },
    ],
    included: ["Your suite", "All meals", "Twice-daily camp activities", "Park fees", "Laundry", "All local drinks"],
    excluded: ["Premium imported drink brands and champagne", "Flights into the Linyanti, which the house books with your stay"],
    notes: [
      "Rates are Wilderness's published rates in US dollars, per person a night, sharing, read from wildernessdestinations.com on 10 Nov 2026.",
      "Wilderness describes eight suites and a family room, and up to 18 guests across nine tents.",
      "Wilderness has not published photographs of the suites themselves; the house will add them when it does.",
      "The house confirms the rate, what it includes and the deposit and cancellation terms with your quote, before anything is charged.",
    ],
    source: { label: "wildernessdestinations.com", url: "https://www.wildernessdestinations.com/africa/botswana/linyanti-region/dumatau-camp" },
    credit: "Photographs courtesy of Wilderness",
  },

  "singita-faru-faru-lodge": {
    intro: "Nine suites above the Grumeti River, every one with floor-to-ceiling windows and an outdoor deck: seven one-bedroom suites, a family suite and a two-bedroom suite with its own pool.",
    currency: "USD",
    basis: "per adult a night, sharing, tax included",
    seasons: [
      { key: "off", label: "Off-peak", dates: "1 Nov to 14 Dec 2026", to: "2026-12-14" },
      { key: "peak", label: "Peak", dates: "15 Dec 2026 to 5 Jan 2027", to: "2027-01-05" },
    ],
    rooms: [
      {
        name: "One-Bedroom Suite", count: 7,
        facts: ["Double or twin", "Floor-to-ceiling windows", "Deck over the Grumeti"],
        features: ["An outdoor deck overlooking the Grumeti River", "Floor-to-ceiling windows", "Children share at the child rate"],
        rates: [{ season: "off", rate: 2210, extra: "US$1,105 a child" }, { season: "peak", rate: 3220, extra: "US$1,610 a child" }],
        image: { id: "jwco/stays/singita-faru-faru-lodge/brand/rooms/suite", alt: "A one-bedroom suite at Singita Faru Faru Lodge, with floor-to-ceiling windows onto the deck" },
      },
      {
        name: "Family Suite", count: 1,
        facts: ["Two rooms, double or twin", "Up to 2 adults and 2 children aged 12 and under"],
        features: ["Two bedrooms under one roof for a family", "Priced per suite for up to three guests, then per extra guest"],
        basis: "per suite a night, up to 3 guests",
        rates: [{ season: "off", rate: 5530, extra: "US$1,105 an extra guest" }, { season: "peak", rate: 8050, extra: "US$1,610 an extra guest" }],
        image: { id: "jwco/stays/singita-faru-faru-lodge/brand/rooms/suite-2", alt: "A suite at Singita Faru Faru Lodge" },
      },
      {
        name: "Two-Bedroom Suite", count: 1,
        facts: ["Two bedrooms, double or twin", "Up to 4 guests", "Private pool"],
        features: ["The lodge's only suite with its own pool", "Priced per suite for up to four guests"],
        basis: "per suite a night, up to 4 guests",
        rates: [{ season: "off", rate: 9730 }, { season: "peak", rate: 14180 }],
        image: { id: "jwco/stays/singita-faru-faru-lodge/brand/rooms/suite-3", alt: "A suite at Singita Faru Faru Lodge" },
      },
    ],
    included: ["Your suite", "All meals and drinks, including premium wines, spirits and liqueurs", "Twice-daily game drives in open vehicles", "Road transfers between the Sasakwa airstrip and the lodge", "Laundry", "Telephone calls and WiFi"],
    excluded: ["Wildlife, park and concession fees and the tourism development levy", "The carbon offset levy", "Wellness treatments", "Boutique and gallery purchases", "Activities beyond those listed"],
    notes: [
      "Rates are Singita's published rates in US dollars, tax included and subject to change, read from singita.com on 10 Nov 2026. Rates for 2027 beyond 5 January are not yet published.",
      "Children of all ages are welcome; bush walks are from age 16, and children on drives are at the guide's discretion.",
      "Check in from 1 pm; check out by 11 am. The lodge is open all year.",
      "The house confirms the rate, the fees and the deposit and cancellation terms with your quote, before anything is charged.",
    ],
    source: { label: "singita.com", url: "https://singita.com/lodge/singita-faru-faru-lodge/information" },
    credit: "Photographs courtesy of Singita",
  },

  "ellerman-house": {
    intro: "Thirteen rooms and suites in the house, and two private villas below it, priced by the room, single or sharing. Most face Bantry Bay and the Atlantic.",
    currency: "ZAR",
    basis: "per room a night, single or sharing",
    seasons: [
      { key: "h26", label: "High", dates: "to 30 Nov 2026", to: "2026-11-30" },
      { key: "p27", label: "Peak", dates: "1 Dec 2026 to the end of Feb 2027", to: "2027-02-28" },
      { key: "h27", label: "High", dates: "1 Mar to 30 Apr, and 1 Oct to 30 Nov 2027", to: "2027-11-30" },
      { key: "l27", label: "Low", dates: "1 May to 30 Sep 2027", to: "2027-09-30" },
    ],
    rooms: [
      {
        name: "Classic House Room", count: 1,
        facts: ["30 m²", "King bed", "Garden side, quiet"],
        features: ["Away from the ocean side, in a calm, quiet setting", "Warm interiors hung with art from the collection"],
        rates: [{ season: "h26", rate: 23500 }, { season: "p27", rate: 28000 }, { season: "h27", rate: 26000 }, { season: "l27", rate: 24000 }],
        image: { id: "jwco/stays/ellerman-house/brand/rooms/classic-house-room", alt: "The Classic House Room at Ellerman House, with warm interiors and curated art" },
      },
      {
        name: "Superior House Room", count: 1,
        facts: ["30 m²", "King bed", "Bantry Bay and sea views"],
        features: ["A bay window onto the Atlantic", "Underfloor heating and air-conditioning", "Tea and coffee in the room"],
        rates: [{ season: "h26", rate: 28000 }, { season: "p27", rate: 33000 }, { season: "h27", rate: 31500 }, { season: "l27", rate: 29000 }],
        image: { id: "jwco/stays/ellerman-house/brand/rooms/superior-house-room", alt: "The Superior House Room at Ellerman House in natural light, with sea views" },
      },
      {
        name: "Deluxe Spa Room", count: 2,
        facts: ["37 m²", "King bed", "Water-facing, by the spa", "Shared balcony"],
        features: ["Beside the spa, facing the water", "A balcony shared with the neighbouring room"],
        rates: [{ season: "h26", rate: 44000 }, { season: "p27", rate: 52000 }, { season: "h27", rate: 49000 }, { season: "l27", rate: 41000 }],
        image: { id: "jwco/stays/ellerman-house/brand/rooms/deluxe-spa-room", alt: "A Deluxe Spa Room at Ellerman House" },
      },
      {
        name: "Deluxe House Room", count: 7,
        facts: ["44 m²", "King bed", "Ocean and garden views", "Private balcony"],
        features: ["Seven of the thirteen rooms in the house are Deluxe House Rooms, each with its own balcony", "Views over the garden to the ocean"],
        rates: [{ season: "h26", rate: 60000 }, { season: "p27", rate: 70000 }, { season: "h27", rate: 67000 }, { season: "l27", rate: 52000 }],
        image: { id: "jwco/stays/ellerman-house/brand/rooms/deluxe-house-room", alt: "A Deluxe House Room at Ellerman House with its private terrace" },
      },
      {
        name: "Ellerman House Suite", count: 2,
        facts: ["102 m²", "King bed", "Atlantic views", "Private balcony"],
        features: ["Its own living space", "A private balcony over the Atlantic"],
        rates: [{ season: "h26", rate: 63000 }, { season: "p27", rate: 76000 }, { season: "h27", rate: 70000 }, { season: "l27", rate: 59000 }],
        image: { id: "jwco/stays/ellerman-house/brand/rooms/ellerman-house-suite", alt: "An Ellerman House Suite, its living space and ocean views" },
      },
      {
        name: "Villa Two", count: 1,
        facts: ["3 en-suite bedrooms", "Sleeps 6", "Infinity pool"],
        features: ["Every bedroom en suite, with an open-plan dressing room and a private terrace", "Open-plan living and dining, a private cinema and a social kitchen", "A private chef and a dedicated hospitality team"],
        basis: "per villa a night",
        rates: [{ season: "h26", rate: 210000 }, { season: "p27", rate: 255000 }, { season: "h27", rate: 240000 }, { season: "l27", rate: 220000 }],
        image: { id: "jwco/stays/ellerman-house/brand/villas-hero", alt: "Villa living at Ellerman House, between sea, city and sky" },
      },
      {
        name: "Villa One", count: 1,
        facts: ["3 or 5 bedrooms", "Exclusive use of the spa on request"],
        features: ["Taken with three bedrooms or five", "The five-bedroom villa can be booked with exclusive use of the spa"],
        basis: "per villa a night, 3 bedrooms",
        rates: [{ season: "h26", rate: 245000, extra: "5 bedrooms R333,000; with the spa R373,000" }, { season: "p27", rate: 280000, extra: "5 bedrooms R384,000; with the spa R431,000" }, { season: "h27", rate: 275000, extra: "5 bedrooms R373,000; with the spa R420,000" }, { season: "l27", rate: 252000, extra: "5 bedrooms R334,000; with the spa R381,000" }],
      },
    ],
    included: ["Your room, suite or villa", "Breakfast for hotel guests", "Airport transfers to and from Cape Town International", "WiFi throughout the house", "In the villas: a private chef and hospitality team"],
    excluded: ["Ellerman House does not publish a full list of exclusions; the house sets out what your rate includes with your quote"],
    notes: [
      "Rates are Ellerman House's published rates in South African rand, per room, suite or villa a night, single or sharing, read from ellerman.co.za on 10 Nov 2026.",
      "The house welcomes guests aged 12 and over; the villas welcome families with younger children.",
      "Check in from 2 pm; check out by 11 am. Early arrival and late departure on request.",
      "The house confirms the rate in your currency, and the deposit and cancellation terms, with your quote, before anything is charged.",
    ],
    source: { label: "ellerman.co.za", url: "https://www.ellerman.co.za/rates/" },
    credit: "Photographs courtesy of Ellerman House",
  },
};

export const roomsFor = (slug: string): StayRooms | null => ROOMS[slug] ?? null;

export const money = (currency: Money["currency"], n: number) =>
  currency === "ZAR" ? `R${n.toLocaleString("en-US")}` : `US$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
