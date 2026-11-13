// Room types, published rates and what a stay includes (James, 10 Nov 2026: "show what some of the rooms look like ...
// each of the room types and a compact, tight way to look at the rooms. Maybe accordion style. Also, what's included in
// the rooms and excluded. Some footnotes. Quotes from James.").
//
// Sources: the brand's own website only (house rule, 31 Oct 2026), read on 10 Nov 2026. Rates are the brand's published
// rack rates on the basis it publishes them (James, 9 Nov 2026: "use published rack rates"); the house's commission is
// never shown. Anything the brand does not publish is left out, never filled in. No dashes in public copy.
// Photographs: the brand's own, in Cloudinary with credit. A room with no brand photograph shows none.

export type Money = { currency: "USD" | "ZAR" | "AUD" | "EUR"; amount: number };
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
  // Bali and the Exceptional Few (James, 12 Nov 2026: "list ... the room types ... inclusions and exclusions ... suggest
  // to inquire for price"). Brand facts only; none of these brands publishes rack rates, so every room reads "on enquiry".
  "tanah-gajah": {
    intro: "Twenty-four art-filled club suites and villas on a six-hectare estate of gardens and working rice paddies, every one with club benefits and a butler.",
    currency: "USD", basis: "per villa a night", seasons: [],
    rooms: [
      { name: "One Bedroom Club Suite", facts: ["80 m²", "King bed", "Two adults, three with an extra charge"], features: ["Semi-outdoor bathroom", "Club benefits"], rates: [] },
      { name: "One Bedroom Club Pool Villa", facts: ["220 m²", "King bed", "Two adults"], features: ["Private pool of 8 x 2.5 m", "Outdoor bathtub", "Club benefits"], rates: [] },
      { name: "Premier One Bedroom Club Pool Villa", facts: ["250 m²", "King bed", "Two adults"], features: ["Private pool of 8 x 2.5 m", "Outdoor bathtub", "Club benefits"], rates: [] },
      { name: "Two Bedroom Club Family Pool Villa", facts: ["250 m²", "King and twin beds", "Two adults and two children, or four adults"], features: ["Private pool of 7 x 2.5 m", "Outdoor bathtub", "Club benefits"], rates: [] },
      { name: "The Hadiprana Estate", facts: ["570 m²", "King and twin beds", "Four adults, up to six with an extra charge"], features: ["Private pool of 10 x 6 m", "Outdoor jacuzzi", "Club benefits"], rates: [] },
    ],
    included: ["Private airport transfers", "Daily yoga", "Sunset cocktails", "Butler service and club benefits", "A private car to Ubud centre, 08:00 to 18:00 daily"],
    excluded: ["Flights to Bali", "Anything Tanah Gajah does not list as included; James confirms with your quote"],
    notes: ["Room sizes, beds and pools as Tanah Gajah publishes them on tanahgajahubud.com/en/rooms, read 12 Nov 2026.", "Tanah Gajah does not publish rates; James quotes your dates.", "The whole estate can be bought out (The Art of Reuniting)."],
    source: { label: "tanahgajahubud.com", url: "https://tanahgajahubud.com/en/rooms" }, credit: "Details courtesy of Tanah Gajah, a Resort by Hadiprana",
  },
  "viceroy-bali": {
    intro: "Forty villas above the Petanu valley, every one with a heated private pool.",
    currency: "USD", basis: "per villa a night", seasons: [],
    rooms: [
      { name: "Pool Suite", facts: ["Heated plunge pool, 3 x 3 m", "Jungle view"], features: ["Semi-outdoor bathroom", "Indoor and outdoor living"], rates: [] },
      { name: "Terrace Villa", facts: ["Heated pool, 3.5 x 3.5 m", "Ubud jungle view"], features: ["A traditional balé over the pool", "Bedroom open to a living space"], rates: [], image: { id: "jwco/stays/viceroy-bali/g6", alt: "A Terrace Villa's pool and balé above the jungle at Viceroy Bali" } },
      { name: "Deluxe Terrace Villa", facts: ["Heated infinity pool, 3.5 x 4.5 m", "Valley view"], features: ["A traditional balé", "Contemporary Balinese style"], rates: [] },
      { name: "Premium Club Pool Villa", facts: ["Valley panoramas", "Club benefits for the whole stay"], features: ["A welcome surprise on arrival", "A different benefit each day, from a cocktail masterclass to a Balinese massage"], rates: [] },
      { name: "Elephant Villa", facts: ["Private pool, 4 x 10 m"], features: ["A traditional balé", "Valley view"], rates: [] },
      { name: "Family Deluxe Villa", facts: ["Two interconnecting bedrooms", "Two heated infinity pools"], features: ["A shared deck", "Privacy and togetherness for families"], rates: [] },
      { name: "Vice Regal Villa", count: 5, facts: ["Two bedrooms", "Large heated pool", "On the edge of the valley"], features: ["Master bedroom and living area opening to a deck", "A second bedroom and balcony upstairs"], rates: [], image: { id: "jwco/stays/viceroy-bali/g5", alt: "The Vice Regal Villa's balé over the Petanu valley at Viceroy Bali" } },
      { name: "The Viceroy Villa", facts: ["Two master bedrooms", "15 metre heated pool, 4 x 12 m"], features: ["Marble ensuites", "Outdoor jacuzzi", "Room for a private chef or barbecue evening"], rates: [] },
    ],
    included: ["A heated private pool in every villa", "Helicopter arrivals to the resort's own helipad, on request"],
    excluded: ["Flights to Bali", "Anything Viceroy does not list as included; James confirms with your quote"],
    notes: ["Villa details as Viceroy Bali publishes them on viceroybali.com, read 12 Nov 2026.", "Viceroy does not publish rates; James quotes your dates.", "Viceroy sets no minimum age; parents of young children sign an indemnity at check-in."],
    source: { label: "viceroybali.com", url: "https://www.viceroybali.com/en/bali-villa/" }, credit: "Details courtesy of Viceroy Bali",
  },
  "ungasan-clifftops": {
    intro: "Seven villa compounds and one-bedroom suites on the limestone cliffs of Uluwatu, every villa with its own pool and butler team.",
    currency: "USD", basis: "per villa a night", seasons: [],
    rooms: [
      { name: "Villa Ambar", facts: ["Three, four or five bedrooms", "Ocean views from every room"], features: ["Open-plan Balinese style", "Interconnecting bedrooms for young families", "A large lawn"], rates: [], image: { id: "jwco/stays/ungasan-clifftops/g5", alt: "Villa Ambar's pool and lawn above the Indian Ocean" } },
      { name: "Villa Pawana", facts: ["Five bedroom clifftop compound"], features: ["Curved infinity pool and clifftop balé", "Master suite with its own plunge pool"], rates: [] },
      { name: "Villa Tamarama", facts: ["Three, four or five bedrooms", "Two pools"], features: ["Hamptons colonial style", "A cliff-edge pool and an oversized bar", "Made for groups and celebrations"], rates: [], image: { id: "jwco/stays/ungasan-clifftops/g7", alt: "The garden path at Villa Tamarama" } },
      { name: "Villa Jamadara", facts: ["Three, four or five bedrooms", "Infinity pool over the cliffs"], features: ["Angular contemporary architecture", "Sunken lounge and media room", "Private outdoor baths"], rates: [], image: { id: "jwco/stays/ungasan-clifftops/g3", alt: "Villa Jamadara's infinity pool over the ocean" } },
      { name: "Villa Santai Sorga", facts: ["Three, four or five bedrooms", "Infinity pool"], features: ["Hacienda inspired", "A master bedroom taking the whole first floor", "Clifftop balé"], rates: [] },
      { name: "Villa Nora", facts: ["Five pavilion bedrooms", "25 metre lap pool on the cliff edge"], features: ["A garden terrace for every bedroom"], rates: [] },
      { name: "Villa Chintamani", facts: ["Five pavilion bedrooms", "A plunge pool for every bedroom"], features: ["Contemporary Balinese style"], rates: [], image: { id: "jwco/stays/ungasan-clifftops/g6", alt: "Villa Chintamani's pool and terrace" } },
      { name: "One Bedroom Suites", facts: ["Ocean View, Plunge Pool and Garden View"], features: ["Within the Nora and Chintamani residences", "Butler service"], rates: [], image: { id: "jwco/stays/ungasan-clifftops/g9", alt: "An ocean view suite bedroom at The Ungasan" } },
    ],
    included: ["Return airport transfers", "A dedicated butler team", "Access, priority and reserved sunbeds at Sundays Beach Club", "Water sports equipment at Sundays"],
    excluded: ["Flights to Bali", "Anything The Ungasan does not list as included; James confirms with your quote"],
    notes: ["Villa details from theungasan.com, read 12 Nov 2026.", "The Ungasan does not publish rates; James quotes your dates.", "Minimum stay: two nights in the villas, one night in the suites."],
    source: { label: "theungasan.com", url: "https://theungasan.com/bali-luxury-villas" }, credit: "Details courtesy of The Ungasan Clifftop Resort",
  },
  "hotel-indigo-bali-seminyak-beach": {
    intro: "289 rooms, suites and pool villas on Seminyak beach, each with a spa-inspired bathroom and a balcony or patio with daybeds.",
    currency: "USD", basis: "per room a night", seasons: [],
    rooms: [
      { name: "Standard Rooms", facts: ["Balcony or patio with daybeds"], features: ["Spa-inspired bathroom"], rates: [] },
      { name: "Premium Rooms", facts: ["Balcony or patio with daybeds"], features: ["Spa-inspired bathroom"], rates: [] },
      { name: "Suites", facts: ["Separate living space"], features: ["Spa-inspired bathroom"], rates: [] },
      { name: "One Bedroom Villa", facts: ["Private pool"], features: ["Spa-inspired bathroom"], rates: [], image: { id: "jwco/stays/hotel-indigo-bali-seminyak-beach/g3", alt: "A pool villa terrace at Hotel Indigo Bali Seminyak Beach" } },
      { name: "Two Bedroom Villa", facts: ["Private pool", "Two bedrooms"], features: ["Spa-inspired bathroom"], rates: [] },
    ],
    included: ["Wi-Fi", "The 24 hour Health Club"],
    excluded: ["Anything IHG does not list as included; James confirms with your quote"],
    notes: ["Room types as IHG lists them for Hotel Indigo Bali Seminyak Beach, read 12 Nov 2026.", "IHG does not publish fixed rates; James quotes your dates."],
    source: { label: "ihg.com", url: "https://www.ihg.com/hotelindigo/hotels/us/en/bali/dpsin/hoteldetail" }, credit: "Details courtesy of Hotel Indigo Bali Seminyak Beach",
  },
  amanwana: {
    intro: "Seventeen tents on Moyo Island, inside a national park on the Flores Sea, full board.",
    currency: "USD", basis: "per tent a night", seasons: [],
    rooms: [
      { name: "Luxury Tents", count: 17, facts: ["Backed by the jungle of Moyo Satonda National Park", "On the shores of the Flores Sea"], features: ["Full board", "Book ten or more and the camp is yours"], rates: [], image: { id: "jwco/stays/amanwana/g2", alt: "A beach pavilion under the trees at Amanwana" } },
    ],
    included: ["Full board, with much of the food grown or reared on the island", "Meeting at Sumbawa Besar airport by an Aman host"],
    excluded: ["Flights to Sumbawa Besar", "Anything Aman does not list as included; James confirms with your quote"],
    notes: ["From aman.com/resorts/amanwana, read 11 Nov 2026.", "Aman does not publish rates; James quotes your dates."],
    source: { label: "aman.com", url: "https://www.aman.com/resorts/amanwana" }, credit: "Details courtesy of Aman",
  },
  amanpuri: {
    intro: "Aman's fact sheet lists 40 guest pavilions and 40 villas on its own peninsula at Pansea Beach.",
    currency: "USD", basis: "per pavilion or villa a night", seasons: [],
    rooms: [
      { name: "Pavilions", count: 40, facts: ["Pavilion, Garden and Garden Pool Pavilions", "Partial Ocean, Ocean, Deluxe Ocean and Premium Ocean Pool Pavilions", "Two-Bedroom Pool Pavilion"], features: ["On the hillside above the Andaman Sea"], rates: [], image: { id: "jwco/stays/amanpuri/g3", alt: "An Amanpuri pool pavilion looking out to sea" } },
      { name: "Ocean and Garden Villas", count: 40, facts: ["Three to nine bedrooms", "A private pool in every villa"], features: ["A dedicated Villa Host", "A personal Thai chef", "Including the Five-Bedroom Ocean and Garden Villas and the Nine-Bedroom Ocean Villa"], rates: [], image: { id: "jwco/stays/amanpuri/g1", alt: "A villa pool on the hillside at Amanpuri" } },
    ],
    included: ["A Villa Host and a personal Thai chef with every villa", "Daily programmes for children five and older at the Eco-Beach Discovery Centre"],
    excluded: ["Anything Aman does not list as included; James confirms with your quote"],
    notes: ["From Aman's Amanpuri fact sheet and aman.com.", "Aman does not publish rates; James quotes your dates."],
    source: { label: "aman.com", url: "https://www.aman.com/resorts/amanpuri" }, credit: "Details courtesy of Aman",
  },
  "rosewood-phuket": {
    intro: "Rosewood's fact sheet lists 54 suites and 15 villas, plus its houses, on a 600 metre beachfront at Emerald Bay.",
    currency: "USD", basis: "per pavilion, villa or house a night", seasons: [],
    rooms: [
      { name: "Pool Pavilions", facts: ["Garden, Partial Ocean View and Lagoon Pool Pavilions", "Up to three guests"], features: ["A private pool"], rates: [], image: { id: "jwco/stays/rosewood-phuket/g3", alt: "Pool pavilions set into the hillside at Rosewood Phuket" } },
      { name: "Pool Villas", facts: ["Partial Ocean View and Beachfront Pool Villas", "Up to three guests"], features: ["A dedicated butler"], rates: [], image: { id: "jwco/stays/rosewood-phuket/g2", alt: "A private pool above the treetops at Rosewood Phuket" } },
      { name: "The Palm House", facts: ["Four master bedrooms", "Two pools", "Up to 12 guests"], features: ["A dedicated butler", "The Exceptional Few No. 006"], rates: [] },
      { name: "The Beach House", facts: ["Two bedrooms", "Up to five guests"], features: ["A dedicated butler"], rates: [] },
      { name: "The Coral House and The Ocean House", facts: ["Houses on the estate"], features: ["A dedicated butler"], rates: [] },
    ],
    included: ["A dedicated butler in the villas and houses"],
    excluded: ["Anything Rosewood does not list as included; James confirms with your quote"],
    notes: ["From Rosewood Phuket's fact sheet and rosewoodhotels.com.", "Rosewood does not publish rates; James quotes your dates."],
    source: { label: "rosewoodhotels.com", url: "https://www.rosewoodhotels.com/en/phuket" }, credit: "Details courtesy of Rosewood Hotels & Resorts",
  },
  "four-seasons-tented-camp-golden-triangle": {
    intro: "Fifteen tents and one two bedroom Explorer's Lodge above the Ruak River, sold as all inclusive packages of two, three and four nights.",
    currency: "USD", basis: "per package", seasons: [],
    rooms: [
      { name: "Golden Triangle, Mekong and Bamboo Tents", count: 15, facts: ["54 m²", "Up to three guests", "A deck over the Ruak River"], features: ["An outdoor shower or a wooden hot tub"], rates: [], image: { id: "jwco/stays/four-seasons-tented-camp-golden-triangle/g3", alt: "A wooden hot tub on a deck over green fields" } },
      { name: "Explorer's Lodge", count: 1, facts: ["Two bedrooms", "232 m²", "Up to six guests"], features: ["A private infinity pool and terrace over the jungle canopy"], rates: [], image: { id: "jwco/stays/four-seasons-tented-camp-golden-triangle/g4", alt: "The Explorer's Lodge and its long pool in the jungle" } },
    ],
    included: ["Two, three and four night all inclusive packages", "On the four night package: meals and beverages, spa, exploration and more, as Four Seasons describes it"],
    excluded: ["Flights to Chiang Rai", "Anything the package does not list; James confirms with your quote"],
    notes: ["From fourseasons.com/goldentriangle and the Four Seasons camp facts.", "Four Seasons does not publish prices on the pages read; James quotes your dates."],
    source: { label: "fourseasons.com", url: "https://www.fourseasons.com/goldentriangle/" }, credit: "Details courtesy of Four Seasons",
  },
  amanpulo: {
    intro: "Aman's fact sheet lists 43 casitas and 17 villas on Pamalican, the only resort on the island.",
    currency: "USD", basis: "per casita or villa a night", seasons: [],
    rooms: [
      { name: "Casitas", count: 43, facts: ["68 m²", "Treetop, Hillside, Deluxe Hillside, Treetop Pool, Beach and Beach Pool"], features: ["In the forest canopy, on the hillside or along the beach"], rates: [], image: { id: "jwco/stays/amanpulo/g2", alt: "Casitas along the beach at Amanpulo" } },
      { name: "Grand Beach Pool Casita", count: 1, facts: ["257 m²"], features: ["On the beach, with a pool"], rates: [] },
      { name: "Villas", count: 17, facts: ["One to four bedrooms", "Beach frontage and a pool"], features: ["A private chef and butler", "One club car per bedroom"], rates: [], image: { id: "jwco/stays/amanpulo/g9", alt: "A villa pool from above, Amanpulo" } },
    ],
    included: ["A private chef and butler with every villa", "Complimentary car transfers from Manila or Clark to the Amanpulo Lounge for same day connections"],
    excluded: ["Amanpulo's private flights from Clark", "Anything Aman does not list as included; James confirms with your quote"],
    notes: ["From Aman's Amanpulo fact sheet and aman.com.", "Aman does not publish rates; James quotes your dates and flights."],
    source: { label: "aman.com", url: "https://www.aman.com/resorts/amanpulo" }, credit: "Details courtesy of Aman",
  },
  "banwa-private-island": {
    intro: "Six beachfront villas and the Axis Garden Rooms on a private island off Palawan, for up to 40 guests, all inclusive.",
    currency: "USD", basis: "per villa or island a night", seasons: [],
    rooms: [
      { name: "South One, North One and North East Principal", facts: ["One bedroom", "Two to three guests", "A spring water pool"], features: ["Beachfront"], rates: [], image: { id: "jwco/stays/banwa-private-island/hero", alt: "A beachfront villa on Banwa's white sand" } },
      { name: "South Two and North Two", facts: ["Two bedrooms", "Four to six guests", "A spring water pool"], features: ["Beachfront"], rates: [] },
      { name: "South West Villa", facts: ["Four bedrooms", "Eight to twelve guests", "A spring water pool"], features: ["Beachfront"], rates: [], image: { id: "jwco/stays/banwa-private-island/g3", alt: "A spring water pool at a Banwa villa" } },
      { name: "Axis Garden Rooms", facts: ["Twelve bedrooms", "Twelve to twenty-four guests"], features: ["For larger parties taking the island"], rates: [] },
    ],
    included: ["All inclusive", "Pools filled from the island's own artesian well"],
    excluded: ["Helicopter or road and boat transfers, which James arranges", "Anything Banwa does not list as included; James confirms with your quote"],
    notes: ["From banwaprivateisland.com, read 2 and 12 Nov 2026.", "Banwa does not publish rates; James quotes your dates."],
    source: { label: "banwaprivateisland.com", url: "https://www.banwaprivateisland.com/villas" }, credit: "Details courtesy of Banwa Private Island",
  },
  "soori-bali": {
    intro: "Villas and residences between the Indian Ocean and the rice fields of Tabanan, designed by Soo K. Chan and Ling Fu from local materials.",
    currency: "USD", basis: "per villa or residence a night", seasons: [],
    rooms: [
      { name: "Beach Pool Villa", facts: ["One bedroom", "168 m²", "Two adults, or two adults and a child"], features: ["Beach view", "Private pool"], rates: [] },
      { name: "Ocean Pool Villa", facts: ["One bedroom", "275 m²", "Two adults, or two adults and a child"], features: ["Ocean view", "Private pool"], rates: [] },
      { name: "Mountain / Rice Paddies Pool Villa", facts: ["One bedroom", "290 m²", "Two adults, or two adults and a child"], features: ["Rice terrace and mountain view", "Private pool"], rates: [] },
      { name: "Deluxe Ocean Pool Villa", facts: ["One bedroom", "646 m²", "Two adults, or two adults and a child"], features: ["Indian Ocean view", "Private pool"], rates: [] },
      { name: "Residences", facts: ["Three and four bedrooms", "825 m²", "Up to eight adults"], features: ["Garden and partial ocean view"], rates: [] },
      { name: "Deluxe Four-Bedroom Residence", facts: ["Four bedrooms", "3,248 m²", "Up to eight adults and four children"], features: ["Indian Ocean view"], rates: [] },
      { name: "Soori Residence", facts: ["Six bedrooms", "1,350 m²", "Up to twelve adults and three children"], features: ["Indian Ocean view"], rates: [], image: { id: "jwco/stays/soori-bali/estate-2", alt: "A beachfront residence at Soori Bali" } },
      { name: "The Soori Estate", facts: ["Ten bedrooms", "5,250 m² of beachfront", "Up to twenty adults and four children"], features: ["Four private infinity pools, including a 20 metre pool with jacuzzi", "Private gym, spa room and library", "Butler service and a gourmet kitchen", "The Exceptional Few No. 021"], rates: [], image: { id: "jwco/stays/soori-bali/estate-1", alt: "The Soori Estate above the Indian Ocean" } },
    ],
    included: ["Butler service in the villas and residences", "Complimentary scheduled resort activities", "Wi-Fi"],
    excluded: ["Flights to Bali", "Anything Soori does not list as included; James confirms with your quote"],
    notes: ["Sizes and guests as Soori Bali publishes them on sooribali.com/accommodation, read 12 Nov 2026.", "Soori does not publish rates; James quotes your dates."],
    source: { label: "sooribali.com", url: "https://www.sooribali.com/accommodation" }, credit: "Details courtesy of Soori Bali",
  },
  "bawah-reserve": {
    intro: "Thirty-six earth conscious suites and villas across Bawah's islands, and Elang, an island of six lodges bought out whole. All inclusive, on a three night minimum.",
    currency: "USD", basis: "per suite or villa a night, all inclusive",
    seasons: [
      { key: "off", label: "Off peak", dates: "1 Sep to 20 Dec 2026; 6 Jan to 3 Feb, 13 Feb to 19 Mar and 4 Apr to 30 Jun 2027; 1 Sep to 25 Dec 2027", to: "2027-12-25" },
      { key: "sh", label: "Shoulder", dates: "4 to 12 Feb 2027; 1 to 31 Jul 2027", to: "2027-07-31" },
      { key: "pk", label: "Peak", dates: "21 Dec 2026 to 5 Jan 2027; 20 Mar to 3 Apr 2027; 1 to 31 Aug 2027; 26 Dec 2027 to 5 Jan 2028", to: "2028-01-05" },
    ],
    rooms: [
      { name: "Tented Garden Suite", facts: ["Garden setting"], features: ["All inclusive"], rates: [{ season: "off", rate: 1980 }, { season: "sh", rate: 2100 }, { season: "pk", rate: 2280 }] },
      { name: "Tented Oceanfront Suite", facts: ["On the water's edge"], features: ["All inclusive"], rates: [{ season: "off", rate: 2300 }, { season: "sh", rate: 2400 }, { season: "pk", rate: 2680 }] },
      { name: "Tented Beach Suite", facts: ["On the beach"], features: ["All inclusive"], rates: [{ season: "off", rate: 2480 }, { season: "sh", rate: 2550 }, { season: "pk", rate: 2800 }] },
      { name: "Overwater Bungalow", facts: ["Over the lagoon"], features: ["All inclusive"], rates: [{ season: "off", rate: 2800 }, { season: "sh", rate: 2950 }, { season: "pk", rate: 3300 }], image: { id: "jwco/stays/bawah-reserve/bawah-kayak-lagoon", alt: "Kayaks on Bawah's lagoon with the beach suites and forest behind" } },
      { name: "Treehouse Lodge", facts: ["Two bedrooms"], features: ["All inclusive"], rates: [{ season: "off", rate: 3950 }, { season: "sh", rate: 4350 }, { season: "pk", rate: 4750 }] },
      { name: "Garden Pool Villa", facts: ["Two bedrooms", "Private pool"], features: ["All inclusive"], rates: [{ season: "off", rate: 4350 }, { season: "sh", rate: 4850 }, { season: "pk", rate: 5500 }] },
      { name: "Infinity Pool Villa", facts: ["Two bedrooms", "Infinity pool"], features: ["All inclusive"], rates: [{ season: "off", rate: 5300 }, { season: "sh", rate: 5700 }, { season: "pk", rate: 6100 }] },
      { name: "Deluxe Pool Villa", facts: ["Two bedrooms", "Private pool"], features: ["All inclusive"], rates: [{ season: "off", rate: 5500 }, { season: "sh", rate: 5900 }, { season: "pk", rate: 6600 }] },
      { name: "Pool Villa", facts: ["Three bedrooms", "Private pool"], features: ["All inclusive"], rates: [{ season: "off", rate: 7350 }, { season: "sh", rate: 8000 }, { season: "pk", rate: 8500 }] },
      { name: "Infinity Pool Villa, four bedrooms", facts: ["Four bedrooms", "Infinity pool"], features: ["All inclusive"], rates: [{ season: "off", rate: 10050 }, { season: "sh", rate: 11300 }, { season: "pk", rate: 12300 }] },
      { name: "Elang Private Island, up to 10 guests", facts: ["Six cliffside lodges: five of one bedroom (136 m²), one of two (254 m²)", "Two private beaches"], features: ["Club House, Owner's Lounge, saltwater infinity pool", "Beach House restaurant and Kayu Spa", "A personal butler in every lodge", "The Exceptional Few No. 011"], basis: "buyout a night, from", rates: [{ season: "off", rate: 18000 }, { season: "sh", rate: 18000 }, { season: "pk", rate: 18000 }], image: { id: "jwco/stays/bawah-reserve/elang-aerial-jetty-club-house", alt: "Elang's jetty and Club House from the air" } },
      { name: "Elang Private Island, up to 14 guests", facts: ["The whole of Elang for a larger party"], features: ["As the 10 guest buyout"], basis: "buyout a night, from", rates: [{ season: "off", rate: 25000 }, { season: "sh", rate: 25000 }, { season: "pk", rate: 25000 }] },
    ],
    included: ["All meals", "Non alcoholic drinks", "One spa treatment per person per night", "Yoga, Pilates and meditation", "Land and water activities", "Laundry, five pieces a day", "Wi-Fi", "Wellness facilities", "Room tax and service charges"],
    excluded: ["Alcohol", "Scuba diving", "Bespoke experiences", "The transport package from Singapore, US$1,050 per person plus fuel surcharge", "Donations to the Anambas Foundation", "Gratuities"],
    notes: ["Rates are Bawah's published 2026 to 2027 rates in US dollars, from bawahreserve.com/rates and the Trade Factsheet August 2026, read 11 Nov 2026; prices from, based on two adults per room.", "Minimum three nights; five nights 27 Dec 2026 to 5 Jan 2027, 1 to 31 Aug 2027 and 28 Dec 2027 to 5 Jan 2028; four nights 4 to 12 Feb and 20 Mar to 3 Apr 2027.", "Children five and older; extra bed US$600 an adult, US$450 a child aged 5 to 12, a night.", "Stay 7 Pay 6 runs on set dates in 2026 and 2027; James confirms it for your dates.", "The house confirms the rate, what it includes and the deposit and cancellation terms with your quote."],
    source: { label: "bawahreserve.com", url: "https://www.bawahreserve.com/rates/" }, credit: "Photographs courtesy of Bawah Reserve",
  },
  "casali-di-casole": {
    intro: "Eighteen restored farmhouses, villas and a penthouse on a 4,200 acre estate, each let whole, sleeping four to sixteen. Casali di Casole publishes a nightly rate for each residence, including VAT.",
    currency: "EUR", basis: "per residence a night, including 10% VAT",
    seasons: [
      { key: "ba", label: "Best available", dates: "June and September 2027", to: "2027-09-18" },
      { key: "ss", label: "Season of Savings, five nights or more", dates: "June and September 2027", to: "2027-09-18" },
    ],
    rooms: [
      { name: "Villa Scuola", facts: ["One king and two queen bedrooms", "Sleeps 4", "1,883 sq ft"], features: ["Hot tub and fire pit"], rates: [{ season: "ba", rate: 2645 }, { season: "ss", rate: 2125 }], image: { id: "jwco/stays/casali-di-casole/c28", alt: "Villa Scuola's terrace at dusk" } },
      { name: "Villa Sant'Antonio", facts: ["Two king and two twin bedrooms", "Sleeps 6", "2,960 sq ft"], features: ["An 18th century house", "Infinity pool shared by the six villas of Sant'Antonio"], rates: [{ season: "ba", rate: 2855 }, { season: "ss", rate: 2295 }], image: { id: "jwco/stays/casali-di-casole/c15", alt: "A bedroom at Villa Sant'Antonio under beams and arched windows" } },
      { name: "Santa Lucia", facts: ["Three king and two queen bedrooms", "Sleeps 8", "4,090 sq ft"], features: ["Its own private vineyard", "Private pool"], rates: [{ season: "ba", rate: 4979 }, { season: "ss", rate: 4000 }], image: { id: "jwco/stays/casali-di-casole/c03", alt: "Santa Lucia's stone farmhouse, lawns and cypresses" } },
      { name: "Campo al Doccio", facts: ["Five king bedrooms", "Sleeps 10", "3,455 sq ft"], features: ["Private pool"], rates: [{ season: "ba", rate: 4979 }, { season: "ss", rate: 4000 }], image: { id: "jwco/stays/casali-di-casole/c17", alt: "A bathroom at Campo al Doccio with a freestanding tub" } },
      { name: "San Regolo", facts: ["Four king, two queen and one twin bedroom", "Sleeps 12", "6,253 sq ft"], features: ["Private pool"], rates: [{ season: "ba", rate: 4979 }, { season: "ss", rate: 4000 }], image: { id: "jwco/stays/casali-di-casole/c02", alt: "San Regolo's farmhouse among the oaks, from the air" } },
      { name: "Le Macie", facts: ["Four king and four twin bedrooms", "Sleeps 12", "5,478 sq ft"], features: ["Infinity pool and loggia", "Tennis court"], rates: [{ season: "ba", rate: 5999 }, { season: "ss", rate: 4800 }], image: { id: "jwco/stays/casali-di-casole/c04", alt: "Le Macie's infinity pool beside the farmhouse and loggia" } },
      { name: "Cetena Rossa", facts: ["Eight bedrooms: six king and four queen beds", "Sleeps 16", "12,916 sq ft"], features: ["The largest residence on the estate"], rates: [{ season: "ba", rate: 6625 }, { season: "ss", rate: 5325 }], image: { id: "jwco/stays/casali-di-casole/c09", alt: "A gravel drive between the stone houses of Cetena Rossa" } },
      { name: "San Giovanni", facts: ["Five king and two queen bedrooms", "Sleeps 12", "7,448 sq ft"], features: ["On 135 acres of its own"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c29", alt: "A canopy bed at San Giovanni" } },
      { name: "Casale La Casa", facts: ["Four king bedrooms", "Sleeps 8", "5,672 sq ft"], features: ["Pool and pergola"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c11", alt: "Casale La Casa's pool and pergola" } },
      { name: "Pietti", facts: ["Three king and one queen bedroom", "Sleeps 8", "5,758 sq ft"], features: ["Infinity pool above the valley"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c08", alt: "Pietti's infinity pool above the valley" } },
      { name: "San Damiano", facts: ["Three king and two queen bedrooms", "Sleeps 8", "4,736 sq ft"], features: ["Private pool"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c07", alt: "San Damiano lit at dusk above its pool" } },
      { name: "La Fonte di Barbena", facts: ["Three king bedrooms", "Sleeps 6", "3,379 sq ft"], features: ["Farmhouse and pool in the woods"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c10", alt: "La Fonte di Barbena's farmhouse and pool, from the air" } },
      { name: "Bargagli Penthouse", facts: ["Three suites", "3,350 sq ft"], features: ["Within the Castello di Casole", "A terrace under its canopy"], rates: [], note: "Rate on enquiry", image: { id: "jwco/stays/casali-di-casole/c05", alt: "The Bargagli Penthouse living room under a beamed ceiling" } },
      { name: "San Giuseppe, Pulcinello, Vemignano, Escaiole and Poggio alla Corona", facts: ["Each sleeps 8", "3,422 to 5,823 sq ft"], features: ["Restored farmhouses across the estate"], rates: [], note: "Rates on enquiry" },
    ],
    included: ["Welcome amenity and basic groceries", "A bilingual concierge", "Daily light cleaning", "Internet", "Access to the Belmond Castello di Casole restaurants and spa, subject to availability"],
    excluded: ["In-house chefs and sommelier tastings", "Spa treatments", "Cars and drivers", "Grocery shopping", "Hiking, riding, biking, vineyard tours and classes", "City tours and children's activities"],
    notes: ["Rates are Casali di Casole's published nightly rates in euros, including 10% VAT, from its booking engine for the weeks of 12 to 19 June and 11 to 18 September 2027, read 12 Nov 2026.", "The Season of Savings takes 20% off stays of five nights or more; the Welcome Dinner offer (four nights or more) and A Taste of Tuscany (10% off with a culinary experience) are also published.", "Rates for the other residences, and for your dates, James confirms with your quote."],
    source: { label: "casalidicasole.com", url: "https://www.casalidicasole.com/" }, credit: "Photographs courtesy of Casali di Casole",
  },
  "orpheus-island-lodge": {
    intro: "Fourteen rooms, suites and villas, all facing the Coral Sea, for no more than 28 guests. All inclusive, on a two night minimum.",
    currency: "AUD", basis: "per room a night, all inclusive", seasons: [],
    rooms: [
      { name: "North Beachfront Room", facts: ["King bed", "Outdoor bath and shower"], features: ["Coral Sea views through the palms", "Renovated, reopened July 2026"], rates: [] },
      { name: "North Beachfront Suite", facts: ["King bed", "Lounge", "Outdoor bath and shower"], features: ["Adjoining lounge facing the Coral Sea"], rates: [] },
      { name: "North Beachfront Villa", facts: ["Two king bedrooms", "Two bathrooms", "Lounge"], features: ["Outdoor bath and shower", "For family or friends travelling together"], rates: [], image: { id: "jwco/stays/orpheus-island-lodge/o03", alt: "A villa living room opening to the garden" } },
      { name: "South Beachfront Room", facts: ["King bed", "Bath"], features: ["In tropical gardens, a stone's throw from the water"], rates: [] },
      { name: "South Beachfront Suite", facts: ["King bed", "Lounge", "Bath"], features: ["Enclosed garden terrace over the Coral Sea", "Courtyard with a freestanding bathtub"], rates: [] },
    ],
    included: ["Three meals a day", "Australian wines, beers, spirits and soft drinks", "All-inclusive minibar and snacks", "Motorised dinghies, paddleboards, kayaks and catamarans", "Fishing and snorkelling gear", "A daily curated Orpheus experience", "Sunsuits in stinger season"],
    excluded: ["Helicopter or boat transfers", "Reef charters and bespoke experiences", "Gwandalan Day Spa treatments", "Premium wines beyond the selection"],
    notes: ["Orpheus publishes no nightly rates; James quotes your dates.", "Two night minimum; three to four recommended. Guests of all ages welcome.", "The whole lodge can be booked for exclusive use."],
    source: { label: "orpheus.com.au", url: "https://www.orpheus.com.au/stay/" }, credit: "Photographs courtesy of Orpheus Island Lodge",
  },
  "pelorus-private-island": {
    intro: "One residence of five suites for up to 11 guests, and the island always yours, however many suites you take. Fully hosted and all inclusive.",
    currency: "AUD", basis: "per night, exclusive use of the island",
    seasons: [{ key: "all", label: "2026 to 2027", dates: "From, excluding festive surcharges", to: "2027-12-31" }],
    rooms: [
      { name: "One suite, up to two guests", facts: ["The whole island for two"], features: ["Private chef, host and guides"], rates: [{ season: "all", rate: 18500 }], image: { id: "jwco/stays/pelorus-private-island/p10", alt: "A suite opening to palms and the Coral Sea" } },
      { name: "Two suites, up to four guests", facts: ["Two suites in the residence"], features: ["The whole island"], rates: [{ season: "all", rate: 20500 }] },
      { name: "Three suites, up to six guests", facts: ["Three suites in the residence"], features: ["The whole island"], rates: [{ season: "all", rate: 22500 }] },
      { name: "Four suites, up to eight guests", facts: ["Four suites in the residence"], features: ["The whole island"], rates: [{ season: "all", rate: 24500 }] },
      { name: "Full house, up to 11 guests", facts: ["All five suites: four king suites and one triple-share suite, each with ensuite and shower"], features: ["913 m² residence", "Beachfront solar-heated infinity pool"], rates: [{ season: "all", rate: 26500 }], image: { id: "jwco/stays/pelorus-private-island/p06", alt: "The infinity pool and loungers above the sea" } },
    ],
    included: ["All meals by your private chef", "Premium wines, beers, spirits, Champagne and soft drinks", "Fringing reef snorkelling", "Guided jet ski island tours", "Reef fishing", "A Hinchinbrook Island adventure", "An outer reef excursion", "Kayaks, seabobs, paddleboards and water bikes"],
    excluded: ["Helicopter transfers (priced by helicopter and departure point)", "Festive surcharges", "Morris Nautical yacht and private jet connections"],
    notes: ["Rates are Pelorus's published rates in Australian dollars, from pelorusprivateisland.au/rates, read 12 Nov 2026; from, subject to availability.", "Most guests stay three to five nights.", "The house confirms the rate and terms with your quote."],
    source: { label: "pelorusprivateisland.au", url: "https://pelorusprivateisland.au/rates/" }, credit: "Photographs courtesy of Pelorus Private Island",
  },
};

export const roomsFor = (slug: string): StayRooms | null => ROOMS[slug] ?? null;

export const money = (currency: Money["currency"], n: number) =>
  currency === "ZAR" ? `R${n.toLocaleString("en-US")}` : currency === "AUD" ? `AU$${n.toLocaleString("en-US")}` : currency === "EUR" ? `€${n.toLocaleString("en-US")}` : `US$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
