// The editorial for Aqua Expeditions' ships (read by aqua-build.mjs). Every fact is from
// aquaexpeditions.com (ship, destination and about pages, read 13 Nov 2026) or Aqua's booking data;
// nothing is filled in. Photographs: Aqua Expeditions (partner agreement, James). No stock-library
// photographs from Aqua's pages are used (their licence is Aqua's, not ours).
export const CLD = "jwco/voyages/ships";
const CF = "https://d20knvk822eu5a.cloudfront.net/s3fs-public/";
const BK = "https://d20knvk822eu5a.cloudfront.net/booking-optimized/sites/default/files/";
const URL = (slug, id) => `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/${CLD}/${slug}/${id}`;
const CREDIT = "Aqua Expeditions";
const img = (slug, id, alt) => ({ url: URL(slug, id), alt, credit: CREDIT });
const SOURCES = (ship, dest) => [`https://www.aquaexpeditions.com/cruise-ships/${ship}`, `https://www.aquaexpeditions.com/destinations/${dest}`, "https://www.aquaexpeditions.com/about-us", "https://book.aquaexpeditions.com (departures and fares)"];
const PRICES = "Per person, cruise only, in US dollars, as Aqua Expeditions lists each departure in its booking system (read 13 Nov 2026), before any offer. Where a category shows no fare it is sold out or not sold on that date. Aqua's Early Bird, returning-guest and loyalty savings are applied when booking, so the fare you pay can be lower; we confirm it with Aqua before you commit.";
const common = { brandLine: "Aqua Expeditions", operator: "Aqua Expeditions", status: "sailing", deckPlans: [], why: [], rateBasis: "per-cruise" };
const gallery = (slug, list) => list.map(([id, , alt]) => img(slug, id, alt));
const photoList = (list) => list.map(([id, src]) => ({ id, src }));

// ── Aqua Mekong ───────────────────────────────────────────────────────────────
const MEKONG_PHOTOS = [
  ["hero", CF + "2024-03/MAQ%20vessel%20page%20banner.jpg", "Aqua Mekong at dusk on the Mekong with a skiff of guests"],
  ["exterior-front", CF + "2024-02/Aqua%20Mekong_Exterior_Frontview.jpg", "Aqua Mekong seen from the front on the river"],
  ["vessel-20", CF + "2023-12/Aqua%20Mekong%20-%20Vessel%20-%2020.jpeg", "Aqua Mekong sailing the Mekong in Cambodia"],
  ["sporleder-2", CF + "2023-12/%C2%A9Scott%20Sporleder%20-%20Aqua.Mekong.2018%20%282%20of%20172%29.jpeg", "Apsara carvings on a Khmer temple wall in Cambodia"],
  ["plunge-pool", BK + "image/2018-06/Aqua%20Mekong%20Outdoor%20Top%20Deck%20Plunge%20Pool%20-%20High%20Resolution.jpg.webp", "Plunge pool on Aqua Mekong's top deck"],
  ["lounge", BK + "image/2018-06/Aqua%20Mekong%20Indoor%20Lounge%20-%20High%20Resolution.jpg.webp", "Indoor lounge on Aqua Mekong"],
  ["dining", BK + "image/2018-06/Aqua%20Mekong%20Dining%20Room%20-%20High%20Resolution.jpg.webp", "Dining room on Aqua Mekong"],
  ["cinema", BK + "image/2018-06/Aqua%20Mekong%20Private%20Cinema.jpg.webp", "Private cinema on Aqua Mekong"],
  ["spa", CF + "2024-01/Mekong_Spa_02.jpg", "Spa treatment room on Aqua Mekong"],
  ["food", CF + "2023-12/Aqua%20Mekong%20-%20F%26B%20Experience%20-%2003.jpeg", "Dinner served on Aqua Mekong"],
  ["biking", CF + "2024-03/Mekong_Biking%20Excursion_05.jpg", "Guests cycling through the Cambodian countryside on an Aqua Mekong excursion"],
  ["kayaking", CF + "2024-03/Mekong_Kayaking%20Excursion_12.jpg", "Kayaking on the Mekong with Aqua Expeditions"],
  ["kayaking-2", CF + "2024-09/Mekong_Kayaking%20Excursion_01_PC.jpg", "A skiff on a quiet channel of the Mekong"],
  ["apsara", CF + "2023-12/Cambodia%20-%20Aspara%20Dance%20-%2003.jpeg", "Khmer Apsara dance performed for Aqua Mekong guests"],
  ["royal-palace", CF + "2024-01/Cambodia%20-%20Royal%20Palace%20-%2005.jpg", "The Royal Palace in Phnom Penh"],
  ["suite-balcony", CF + "static-assets/ships/aqua-mekong/suites/design-suite-with-balcony_1.webp", "Design Suite with a balcony on Aqua Mekong"],
  ["suite-balcony-2", CF + "static-assets/ships/aqua-mekong/suites/design-suite-with-balcony_2.webp", "Design Suite with a balcony and river view on Aqua Mekong"],
  ["suite", CF + "static-assets/ships/aqua-mekong/suites/non-balconied-design-suite_1.webp", "Design Suite with panoramic windows on Aqua Mekong"],
  ["suite-twin", CF + "static-assets/ships/aqua-mekong/suites/non-balconied-design-suite-with-twin-beds.webp", "Design Suite with twin beds on Aqua Mekong"],
  ["suite-bathroom", CF + "static-assets/ships/aqua-mekong/suites/design-suite-bathroom_1.webp", "Design Suite bathroom with walk-in shower on Aqua Mekong"],
];
const mekong = {
  slug: "aqua-mekong", code: "MAQ", folder: "mekong", film: { id: "LY3D0IdlMmM", title: "Cultural expeditions in Cambodia and Vietnam aboard Aqua Mekong" },
  categories: { "1STDECK": "First Deck Suite", "2NDDECK": "Second Deck Suite", "1STOWNERS": "First Deck Owners Suite", "2NDOWNERS": "Second Deck Owners Suite" },
  order: ["First Deck Suite", "Second Deck Suite", "First Deck Owners Suite", "Second Deck Owners Suite"],
  photos: photoList(MEKONG_PHOTOS),
  record: ({ itineraries, departures }) => ({
    slug: "aqua-mekong", name: "Aqua Mekong", ledgerId: "VSL-2026-000032", ...common, type: "riverboat",
    waters: "Mekong River and Tonle Sap, Cambodia and Vietnam", country: "Cambodia, Vietnam",
    seo: { title: "Aqua Mekong: Luxury Mekong River Cruise | James Wild & Co", description: "Aqua Mekong by Aqua Expeditions: 20 suites, 40 guests, 40 crew. Three, four and seven nights between Ho Chi Minh City, Phnom Penh and Siem Reap, with every departure and fare.", keywords: ["Aqua Mekong", "luxury Mekong river cruise", "Mekong cruise Cambodia Vietnam", "Phnom Penh to Siem Reap cruise", "Aqua Expeditions Mekong"] },
    tagline: "Twenty suites, a 1:1 crew, and the Mekong from Ho Chi Minh City to the Tonle Sap.",
    answer: "Aqua Mekong is Aqua Expeditions' 20-suite river ship on the Mekong. She carries 40 guests with 40 crew and sails three, four and seven nights between Ho Chi Minh City, Phnom Penh and Siem Reap, through Cambodia's villages and temples and Vietnam's delta, all year. She suits travellers who want culture by day and a five-star ship at night.",
    facts: [["Suites", "20 design suites of 30 sq m (322 sq ft); 644 sq ft interconnecting"], ["Guests", "40"], ["Crew", "40 (a 1:1 crew-to-guest ratio)"], ["Decks", "3"], ["Launched", "2014"], ["Route", "Ho Chi Minh City, Phnom Penh and Siem Reap; 3, 4 or 7 nights"], ["Season", "All year: high water mid-August to November, low water December to mid-August"], ["Children", "Ask us"]],
    overview: [
      "Aqua Mekong carries 40 guests in 20 design suites across three decks, with 40 crew: one for every guest, per Aqua Expeditions. Every suite is 30 sq m (322 sq ft) with a California king or twin beds; some have a balcony with a daybed, the others panoramic windows that open and a sofa that becomes a single bed, and pairs connect to make 644 sq ft.",
      "On board are a plunge pool on the top deck, a spa, a gym, a private cinema, an indoor lounge and the dining room, and speedboats take guests ashore twice a day. The river decides the route: from mid-August to November the high water carries her up the Tonle Sap toward Siem Reap; from December to mid-August, in the low water, Siem Reap departures switch to Phnom Penh with a flight, which Aqua includes.",
    ],
    hero: img("aqua-mekong", "hero", MEKONG_PHOTOS[0][2]),
    gallery: gallery("aqua-mekong", MEKONG_PHOTOS.slice(1, 15)),
    cabins: [
      { type: "First Deck Suite", count: null, size: "30 sq m (322 sq ft)", beds: "California king or twin", deck: "First deck", features: ["Panoramic windows", "Walk-in rain shower", "Air conditioning", "Safe", "Interconnecting pairs (644 sq ft)"], image: img("aqua-mekong", "suite", MEKONG_PHOTOS[17][2]) },
      { type: "Second Deck Suite", count: null, size: "30 sq m (322 sq ft)", beds: "California king or twin", deck: "Second deck", features: ["Balcony with daybed on suites so designed", "Walk-in rain shower", "Air conditioning", "Safe", "Interconnecting pairs (644 sq ft)"], image: img("aqua-mekong", "suite-balcony", MEKONG_PHOTOS[15][2]) },
    ],
    itineraries, departures,
    pricesNote: PRICES + " Aqua Mekong's Early Bird saving is 30% on 2026 to 2028 departures, on Aqua's terms.",
    inclusions: ["All meals on board", "Selected premium wines and beer, and non-alcoholic drinks", "Twice-daily excursions with expert local guides", "Group transfers to and from the ship on Aqua's recommended flights", "Laundry", "Bicycles and kayaks", "Starlink internet"],
    children: "",
    faqs: [
      ["How much does an Aqua Mekong cruise cost?", "Aqua lists three nights from about US$4,940 per person and seven nights from about US$11,800, depending on the deck and the date. Every departure's fare is in the table on this page."],
      ["Where does Aqua Mekong sail?", "Between Ho Chi Minh City (boarding at My Tho), Phnom Penh and Siem Reap, through the Mekong Delta in Vietnam and along the Mekong and Tonle Sap in Cambodia."],
      ["When is the best time for a Mekong cruise?", "Any time: Aqua sails all year. High water, mid-August to November, lets the ship reach the Tonle Sap near Siem Reap; low water, December to mid-August, brings quieter rivers and cycling through the countryside."],
      ["How many guests does Aqua Mekong carry?", "Forty, in 20 suites, with 40 crew."],
      ["Can I combine Aqua Mekong with Angkor Wat?", "Yes. Routes that start or end in Siem Reap sit beside the Angkor temples; ask us to add nights there."],
      ["What is included?", "All meals, selected wines and beer, two guided excursions a day, group transfers on Aqua's recommended flights, laundry, bicycles, kayaks and Starlink internet."],
    ],
    suits: [{ who: "Culture lovers", line: "Temples, silversmiths and floating villages, with a guide every day." }, { who: "First timers to Indochina", line: "Phnom Penh, the delta and Siem Reap in one trip." }, { who: "Families", line: "Connecting suites and a plunge pool; ask us about ages." }],
    sources: SOURCES("aqua-mekong", "mekong-river-cruise"),
    film: { id: "LY3D0IdlMmM", title: "Cultural expeditions in Cambodia and Vietnam aboard Aqua Mekong" },
    glance: { route: "Ho Chi Minh City, Phnom Penh, Siem Reap" },
  }),
};

// ── Aqua Nera ─────────────────────────────────────────────────────────────────
const NERA_PHOTOS = [
  ["hero", CF + "2024-03/Aqua%20Nera_Top%20banner_Desktop.jpg", "Aqua Nera river ship on the Amazon in Peru"],
  ["exterior", CF + "2024-03/Aqua%20Nera_09_0.jpg", "Aqua Nera on a black water river in the Peruvian Amazon"],
  ["exterior-2", "api:Aqua Nera Exterior", "Aqua Nera's three decks and floor-to-ceiling windows"],
  ["saloon", "api:Aqua Nera Saloon", "The saloon on Aqua Nera"],
  ["lounge", "api:Aqua Nera Indoor Lounge", "Indoor lounge on Aqua Nera"],
  ["pool-deck", "api:Aqua Nera Pool Deck", "Outdoor lounge on Aqua Nera's top deck at sunset"],
  ["screening-room", "api:Aqua Nera Screening Room", "Screening room on Aqua Nera"],
  ["dining", "api:Aqua Nera Dining Room", "Dining room on Aqua Nera"],
  ["spa", "api:Aqua Nera Spa Room", "Spa room on Aqua Nera"],
  ["mirrored-forest", CF + "2024-01/Amazon%20-%20Mirrored%20Forest%20-%2002.jpg", "Flooded forest reflected in black water in the Peruvian Amazon"],
  ["skiff", CF + "2023-12/Amazon%20-%20Skiff%20Tour%20-%2028.jpeg", "Guests on a skiff excursion in the Amazon"],
  ["kayaking", CF + "2023-12/Amazon%20-%20Kayaking%20-%2006.jpeg", "Kayaking on an Amazon tributary with Aqua Expeditions"],
  ["monkeys", CF + "2023-12/squirrel-monkeys-on-gnarly-tree.jpeg", "Squirrel monkeys on a tree in the Pacaya-Samiria reserve"],
  ["jungle-walk", CF + "2023-12/Amazon%20-%20Jungle%20Trekking%20-%2001.jpeg", "Guided jungle walk in the Peruvian Amazon"],
  ["riberenos", CF + "2024-08/riberenos_Masthead_PC.jpg", "A riverside community on the Amazon in Peru"],
  ["suite", CF + "static-assets/ships/aqua-nera/suites/suite-with-daybed.webp", "Design Suite with a daybed and floor-to-ceiling window on Aqua Nera"],
  ["suite-sofa", CF + "static-assets/ships/aqua-nera/suites/suite-with-sofa.webp", "Design Suite with an in-room sofa on Aqua Nera"],
  ["suite-connecting", CF + "static-assets/ships/aqua-nera/suites/interconnecting-suites_1.webp", "Interconnecting suites on Aqua Nera"],
  ["suite-bathroom", CF + "static-assets/ships/aqua-nera/suites/design-suite-bathroom.webp", "Suite bathroom with walk-in rain shower on Aqua Nera"],
];
const nera = {
  slug: "aqua-nera", code: "AQN", folder: "amazon", film: { id: "WlHWXzRL4WI", title: "Sail the Peruvian Amazon with Aqua Nera" },
  categories: { "1STDECK": "First Deck Suite", "2NDDECK": "Second Deck Suite", "1STOWNERS": "First Deck Owners Suite", "2NDOWNERS": "Second Deck Owners Suite" },
  order: ["First Deck Suite", "Second Deck Suite", "First Deck Owners Suite", "Second Deck Owners Suite"],
  photos: photoList(NERA_PHOTOS),
  record: ({ itineraries, departures }) => ({
    slug: "aqua-nera", name: "Aqua Nera", ledgerId: "VSL-2026-000030", ...common, type: "riverboat",
    waters: "Amazon, Marañón and Ucayali rivers, Pacaya-Samiria", country: "Peru",
    seo: { title: "Aqua Nera Amazon River Cruise, Peru | James Wild & Co", description: "Aqua Nera by Aqua Expeditions: 20 suites, 40 guests, 40 crew, a plunge pool and spa. Three, four and seven nights from Iquitos and Nauta into Pacaya-Samiria, with every fare.", keywords: ["Aqua Nera", "luxury Amazon river cruise Peru", "Pacaya-Samiria cruise", "Iquitos Amazon cruise", "Aqua Expeditions Amazon"] },
    tagline: "Twenty suites, a plunge pool and the black water lagoons of the Peruvian Amazon.",
    answer: "Aqua Nera is Aqua Expeditions' 20-suite river ship in the Peruvian Amazon, launched in 2021. She carries 40 guests with 40 crew and sails three, four and seven nights from Iquitos and Nauta into the Pacaya-Samiria National Reserve, with chef Pedro Miguel Schiaffino's menu on board. She suits couples and families who want the Amazon with a spa, a pool and twice-daily skiff excursions.",
    facts: [["Suites", "20 design suites of 320 sq ft; 640 sq ft interconnecting"], ["Guests", "40"], ["Crew", "40"], ["Decks", "3"], ["Launched", "2021"], ["Design", "Noor Design"], ["Chef", "Pedro Miguel Schiaffino"], ["Route", "Iquitos and Nauta, 3, 4 or 7 nights"]],
    overview: [
      "Aqua Nera takes her name from the black water lagoons of the Peruvian Amazon. Noor Design drew her 20 suites and her social spaces, with accents from the rubber boom era. She carries 40 guests with 40 crew and sails with her sister Aria Amazon.",
      "Every suite has floor-to-ceiling windows, a sofa, a king or twin beds and a walk-in rain shower; 105 and 107, 106 and 108, 205 and 207, and 206 and 208 connect. The top deck holds a plunge pool, indoor and outdoor lounges, a games room and a screening room; there is also a gym and a spa. Naturalist guides lead small groups out by skiff twice a day.",
    ],
    hero: img("aqua-nera", "hero", NERA_PHOTOS[0][2]),
    gallery: gallery("aqua-nera", NERA_PHOTOS.slice(1, 15)),
    cabins: [
      { type: "First Deck Suite", count: 10, size: "320 sq ft", beds: "California king or twin", deck: "First deck", features: ["Floor-to-ceiling panoramic windows", "In-room sofa", "Walk-in rain shower", "Air conditioning", "Safe", "Connecting: 105 and 107, 106 and 108"], image: img("aqua-nera", "suite", NERA_PHOTOS[15][2]) },
      { type: "Second Deck Suite", count: 10, size: "320 sq ft", beds: "California king or twin", deck: "Second deck", features: ["Floor-to-ceiling panoramic windows", "In-room sofa", "Walk-in rain shower", "Air conditioning", "Safe", "Connecting: 205 and 207, 206 and 208"], image: img("aqua-nera", "suite-sofa", NERA_PHOTOS[16][2]) },
    ],
    itineraries, departures,
    pricesNote: PRICES + " Aqua Nera's Early Bird saving is 20% on 2026 to 2028 departures, on Aqua's terms.",
    inclusions: ["All meals on board", "Selected premium wines and beer, and non-alcoholic drinks", "Twice-daily excursions with naturalist guides", "Group transfers on Aqua's recommended flights", "Pacaya-Samiria entrance fee", "Laundry", "Starlink internet"],
    children: "",
    faqs: [
      ["How much does Aqua Nera cost?", "Aqua lists three nights from about US$5,300 per person and seven nights from about US$12,800, by deck and date. Every departure is in the table on this page."],
      ["Where does Aqua Nera start?", "In Iquitos, Peru, where Aqua's crew meets the noon flight. Depending on the season and route the ship boards at Iquitos or at Nauta, about two hours away."],
      ["What is the difference between Aqua Nera and Aria Amazon?", "Both are Aqua's, both sail the same reserve. Aqua Nera (2021) has 20 suites, a plunge pool, spa, gym and screening room; Aria Amazon has 16 suites and is a little smaller."],
      ["What wildlife will I see?", "Aqua names pink river dolphins, sloths, monkeys, caiman, macaws and other birds; nothing is promised in the wild."],
      ["High water or low water?", "Roughly December to May the rivers are high and skiffs reach into the flooded forest; June to November the water drops and jungle trails open. Aqua sails both seasons with different routes."],
      ["What is included?", "All meals, selected wines and beer, two guided excursions a day, group transfers, the Pacaya-Samiria fee, laundry and Starlink internet."],
    ],
    suits: [{ who: "Couples", line: "A suite with a wall of glass on the river, and a spa." }, { who: "Nature lovers", line: "Skiffs at dawn and dusk into Pacaya-Samiria." }, { who: "Families", line: "Connecting suites and a pool on the top deck." }],
    sources: SOURCES("aqua-nera", "amazon-river-cruise"),
    film: { id: "WlHWXzRL4WI", title: "Sail the Peruvian Amazon with Aqua Nera" },
    glance: { route: "Iquitos and Nauta" },
  }),
};

// ── Aqua Mare ─────────────────────────────────────────────────────────────────
const MARE_PHOTOS = [
  ["hero", CF + "2024-03/Aqua%20Mare_Top%20Banner.jpg", "Aqua Mare superyacht in the Galápagos Islands"],
  ["exterior-32", CF + "2023-12/Aqua%20Mare_Exterior_32.jpeg", "Aqua Mare under way in the Galápagos"],
  ["horizon", CF + "2024-03/Aqua%20Mare_Horizon_01.jpg", "Sunset from the deck of Aqua Mare"],
  ["exterior-17", CF + "2024-03/Aqua%20Mare_Exterior_17.jpg", "Aqua Mare at anchor in the Galápagos"],
  ["sun-deck", CF + "2024-02/Aqua%20Mare_TopDeck_Sunbed_02.jpg", "Sunbeds on Aqua Mare's top deck"],
  ["beach-club", CF + "2024-03/Aqua%20Mare_Beach%20Club_02.jpg", "The Beach Club at Aqua Mare's stern"],
  ["service", CF + "2024-02/Aqua%20Mare_Service_05.jpeg", "Guests with drinks in Aqua Mare's lounge"],
  ["food", CF + "2024-02/food.jpg", "A dish from chef Pedro Miguel Schiaffino's menu on Aqua Mare"],
  ["sea-lion", CF + "2023-12/Aqua%20Mare_Sealion_06.jpeg", "Sea lion on a Galápagos beach on an Aqua Mare excursion"],
  ["snorkelling", CF + "2023-12/Aqua%20Mare_Snorkeling_E2_03_0.jpeg", "Snorkelling in the Galápagos with Aqua Mare"],
  ["trekking", CF + "2023-12/Aqua%20Mare_Trekking_03.jpeg", "Guests hiking a lava trail with an Aqua Mare naturalist"],
  ["paddleboard", CF + "2024-03/Aqua%20Mare_Standup%20Paddling_E2_02.jpg", "Stand-up paddleboarding from Aqua Mare"],
  ["tender", CF + "2024-03/Aqua%20Mare_Tender%20Ride_W3_02.jpg", "Aqua Mare's tender heading for a landing"],
  ["bartolome", CF + "2023-12/Bartolome-island-sunset.jpeg", "Pinnacle Rock on Bartolomé Island at sunset"],
  ["boobies", CF + "2023-12/blue-footed-boobie_galapagos.jpeg", "Blue-footed boobies in the Galápagos"],
  ["owners-suite", "api:Aqua Mare Owner's Suite", "The Owner's Suite on Aqua Mare"],
  ["lounge", "api:Aqua Mare Panoramic Lounge", "Panoramic lounge on Aqua Mare"],
  ["jacuzzi", "api:Aqua Mare Jacuzzi", "Jacuzzi on Aqua Mare's sun deck"],
  ["bathroom", "api:Aqua Mare Bathroom", "Marble bathroom on Aqua Mare"],
];
const mare = {
  slug: "aqua-mare", code: "AQM", folder: "galapagos", film: { id: "m3XcuaK8GjY", title: "Sail the Galápagos Islands on Aqua Mare" },
  categories: { CTGOS: "Owner's Suite", CTGII: "Category II", CTGIII: "Category III", CTGIV: "Category IV", CTGV: "Category V" },
  order: ["Owner's Suite", "Category II", "Category III", "Category IV", "Category V"],
  photos: photoList(MARE_PHOTOS),
  record: ({ itineraries, departures }) => ({
    slug: "aqua-mare", name: "Aqua Mare", ledgerId: "VSL-2026-000009", ...common, type: "motor-yacht",
    waters: "Galápagos Islands, east and west", country: "Ecuador",
    seo: { title: "Aqua Mare Galápagos Superyacht Cruise | James Wild & Co", description: "Aqua Mare by Aqua Expeditions: a 50 m superyacht for 16 guests, 7 cabins with an 80 sq m Owner's Suite, two naturalists. East and west Galápagos, 7 or 14 nights, every fare.", keywords: ["Aqua Mare", "Galapagos superyacht", "luxury Galapagos yacht cruise", "Aqua Expeditions Galapagos", "16 guest Galapagos yacht"] },
    tagline: "A 50-metre Italian superyacht for 16, and two naturalists for the islands.",
    answer: "Aqua Mare is Aqua Expeditions' 50-metre superyacht in the Galápagos, built by CRN in Italy and refitted in 2021. She carries 16 guests in seven cabins, including an 80 sq m Owner's Suite, with 16 crew and two naturalist guides (eight guests to a guide). She sails seven-night east and west itineraries that join into 14 nights, and suits couples and families who want the islands on a private-feeling yacht.",
    facts: [["Length", "50 m"], ["Built", "1998 by CRN, Italy; refitted 2021"], ["Cabins", "7, including an 80 sq m (861 sq ft) Owner's Suite for up to 4"], ["Guests", "16"], ["Crew", "16, with 2 naturalist guides"], ["Guide ratio", "1 guide to 8 guests"], ["Decks", "4"], ["Routes", "East or west, 7 nights; both, 14 nights"]],
    overview: [
      "Aqua Mare was built in 1998 by the Italian yard CRN, with interiors by François Zuretti. Aqua Expeditions' Birgit Galli Zugaro led her 2021 refit, which kept the walnut-panelled interiors and added two cabins. Aqua says she has some 30% more indoor volume than most yachts her size.",
      "Her seven cabins run from 16 sq m to the 80 sq m Owner's Suite on the main deck, the largest of its kind in the islands, per Aqua. The upper deck has a panoramic lounge in Carrara marble and an all-weather outdoor dining deck; the sun deck a barbecue, a six-person jacuzzi and sunbeds; the lower deck the Beach Club, a lounge at the waterline from which the twice-daily excursions leave. She carries eight double kayaks and two paddleboards.",
    ],
    hero: img("aqua-mare", "hero", MARE_PHOTOS[0][2]),
    gallery: gallery("aqua-mare", MARE_PHOTOS.slice(1, 15).concat(MARE_PHOTOS.slice(16, 18))),
    cabins: [
      { type: "Owner's Suite", count: 1, size: "80 sq m (861 sq ft)", beds: "King; up to 4 guests", deck: "Main deck", features: ["The largest suite in the Galápagos, per Aqua", "Marble bathroom with walk-in rain shower", "Premium spirits and beers included", "Walnut panelling"], image: img("aqua-mare", "owners-suite", MARE_PHOTOS[15][2]) },
      { type: "Category II", count: 1, size: "Ask us", beds: "King or twin", deck: "Main deck", features: ["Marble bathroom with walk-in rain shower", "Large windows", "Safe"], image: null },
      { type: "Category III", count: null, size: "Ask us", beds: "King or twin", deck: "Lower deck", features: ["Marble bathroom with walk-in rain shower", "Safe"], image: null },
      { type: "Category IV", count: null, size: "Ask us", beds: "King or twin", deck: "Lower deck", features: ["Marble bathroom with walk-in rain shower", "Safe"], image: null },
      { type: "Category V", count: 1, size: "From 16 sq m (172 sq ft)", beds: "King or twin", deck: "Upper deck", features: ["Marble bathroom with walk-in rain shower", "Safe"], image: null },
    ],
    itineraries, departures,
    pricesNote: PRICES + " Galápagos National Park entrance and transit card fees and flights to the islands are not in Aqua's fares.",
    inclusions: ["All meals on board", "Selected house wines and beer, and non-alcoholic drinks (premium beers and spirits in the Owner's Suite)", "Twice-daily excursions with naturalist guides", "Group transfers on Aqua's recommended flights", "Kayaks, paddleboards, snorkel gear and wetsuits", "Laundry", "Starlink internet"],
    exclusions: ["Flights to the Galápagos", "Galápagos National Park entrance fee and transit card"],
    children: "",
    faqs: [
      ["How much does Aqua Mare cost?", "Aqua lists seven nights from about US$11,900 per person in a Category V cabin to about US$32,000 and up in the Owner's Suite, by date. Every departure is in the table on this page."],
      ["Which Galápagos islands does Aqua Mare visit?", "The east route takes in Genovesa, Santiago, Bartolomé, Santa Cruz, Española, Santa Fé and South Plaza; the west route Floreana, Isabela, Fernandina, Santiago, Rábida and North Seymour. Fourteen nights does both."],
      ["How many guests are on Aqua Mare?", "Sixteen, in seven cabins, with two naturalist guides: eight guests to a guide."],
      ["Can we charter Aqua Mare?", "Yes. Aqua offers her as a private charter on her 7 and 14 night routes or one made for you; ask us."],
      ["Is it a good Galápagos yacht for families?", "Yes for families who want a whole small ship: the Owner's Suite takes four. Ask us about children's ages."],
      ["What is not included?", "Flights to the islands and the national park fees."],
    ],
    suits: [{ who: "Couples", line: "Sixteen guests, a jacuzzi, and naturalists who know every trail." }, { who: "Families and friends", line: "Take the whole yacht for 16." }, { who: "Divers and snorkellers", line: "Twice-daily landings and snorkels from the Beach Club." }],
    sources: SOURCES("aqua-mare", "galapagos-cruise"),
    film: { id: "m3XcuaK8GjY", title: "Sail the Galápagos Islands on Aqua Mare" },
    glance: { route: "Baltra and Santa Cruz", guests: "16" },
  }),
};

// ── Aqua Blu ──────────────────────────────────────────────────────────────────
const BLU_PHOTOS = [
  ["hero", CF + "2024-03/Aqua%20Blu_Top%20banner.jpg", "Aqua Blu at dusk in Indonesia"],
  ["exterior", CF + "2024-02/Aqua%20Blu%20-%2015.jpg", "Aqua Blu at anchor among Indonesia's islands"],
  ["at-sea", CF + "2024-04/Aqua%20Blu_desktop.jpg", "Aqua Blu at anchor in a turquoise bay"],
  ["speed", CF + "2024-03/Speed_Aqua%20Blu.jpg", "Aqua Blu's tender carrying guests ashore"],
  ["design", CF + "2024-03/Design_Aqua%20Blu.jpg", "Sofas in Aqua Blu's saloon"],
  ["saloon", "api:Aqua Blu Saloon", "The saloon on Aqua Blu"],
  ["lounge", "api:Aqua Blu Lounge", "Lounge on Aqua Blu"],
  ["cuisine", CF + "2024-03/Cuisine_AquaBlu.jpg", "Dining on Aqua Blu"],
  ["sundowner", CF + "2024-01/Aqua%20Blu%20-%20Experience%20-%20Sundowner%20-%2003_0.jpg", "Drinks on Aqua Blu's deck"],
  ["guests", CF + "2024-01/Aqua%20Blu%20-%20Guest%20Experience%20-%2001_0.jpg", "A crew member serving a guest on Aqua Blu's deck"],
  ["snorkelling", CF + "2024-03/Snorkelling_Aqua%20Blu.jpg", "Guests in snorkel gear on Aqua Blu's tender"],
  ["kayaking", CF + "2024-03/Kayaking_Aqua%20Blu.jpg", "Kayaking from Aqua Blu"],
  ["wildlife", CF + "2024-03/Wildlife_Aqua%20Blu.jpg", "Swimming with a whale shark on an Aqua Blu expedition"],
  ["hike", CF + "2024-03/Hike_Aqua%20Blu.jpg", "Guests hiking to a viewpoint on an Aqua Blu expedition"],
  ["swimming", CF + "2024-01/Aqua%20Blu%20-%20Swimming%20-%2002_0.jpg", "Swimming from Aqua Blu"],
  ["equipment", CF + "2024-03/Equipment_Aqua%20Blu.jpg", "Scuba diving on an Aqua Blu expedition"],
  ["suite-bridge", "api:Design Suite - Bridge Deck", "Design Suite on Aqua Blu's bridge deck"],
  ["suite-connecting", "api:Interconnecting Suite - Bridge Deck", "Interconnecting suite on Aqua Blu's bridge deck"],
];
const blu = {
  slug: "aqua-blu", code: "AQB", folder: "indonesia", film: { id: "qWyHzb2mWGo", title: "Life aboard Aqua Blu in East Indonesia" },
  categories: { "Category I": "Category I", "Category II": "Category II", "Category III": "Category III" },
  order: ["Category I", "Category II", "Category III"],
  photos: photoList(BLU_PHOTOS),
  record: ({ itineraries, departures }) => ({
    slug: "aqua-blu", name: "Aqua Blu", ledgerId: "VSL-2026-000031", ...common, type: "motor-yacht",
    waters: "Komodo, Raja Ampat, the Spice Islands, the Forgotten Islands and West Papua", country: "Indonesia",
    seo: { title: "Aqua Blu: Komodo, Raja Ampat and Spice Islands Expeditions | James Wild & Co", description: "Aqua Blu by Aqua Expeditions: a 60 m former British naval explorer, 15 suites, 30 guests. Bali and Komodo, Raja Ampat, the Spice Islands and the Asmat, 7 to 21 nights, every fare.", keywords: ["Aqua Blu", "Aqua Blu Komodo", "Raja Ampat luxury cruise", "Spice Islands cruise", "Aqua Expeditions Indonesia"] },
    tagline: "A former Royal Navy explorer, fifteen suites, and the far east of Indonesia.",
    answer: "Aqua Blu is Aqua Expeditions' 60-metre expedition yacht in Indonesia, once the British naval explorer HMS Beagle and refitted in 2019. She carries 30 guests in 15 suites with 30 crew and sails seven nights between Bali and Komodo, Raja Ampat, the Spice Islands and, on longer voyages of up to 21 nights, the Forgotten Islands and West Papua. She suits divers, snorkellers and travellers who want remote islands with a five-star ship.",
    facts: [["Length", "60 m"], ["History", "Former British Royal Navy explorer HMS Beagle; refitted 2019"], ["Suites", "15, from 12 to 31 sq m"], ["Guests", "30"], ["Crew", "30"], ["Decks", "5"], ["Diving", "Scuba gear on board"], ["Routes", "7 to 21 nights, by season"]],
    overview: [
      "Aqua Blu began life as HMS Beagle, a British Royal Navy explorer, and was refitted for Aqua Expeditions in 2019 with interiors by Cor D. Rover. She carries 30 guests in 15 suites across five decks, with 30 crew; suites 301 and 302, and 401 and 402, connect.",
      "She follows the weather around eastern Indonesia: Bali and Komodo from April to September, Raja Ampat from December to February, the Spice Islands of the Banda Sea between, and long voyages through the Forgotten Islands and to the Asmat of West Papua. Snorkel and scuba gear, kayaks and paddleboards are on board, and twice-daily excursions run by tender.",
    ],
    hero: img("aqua-blu", "hero", BLU_PHOTOS[0][2]),
    gallery: gallery("aqua-blu", BLU_PHOTOS.slice(1, 16)),
    cabins: [
      { type: "Category I", count: null, size: "25 to 34 sq m", beds: "King or twin", deck: "Bridge, forecastle, main and lower decks", features: ["Windows", "En suite bathroom", "Air conditioning", "Connecting: 301 and 302, 401 and 402"], image: img("aqua-blu", "suite-bridge", BLU_PHOTOS[16][2]) },
      { type: "Category II", count: null, size: "24 sq m", beds: "King or twin", deck: "Bridge, forecastle and main decks", features: ["Windows", "En suite bathroom", "Air conditioning"], image: img("aqua-blu", "suite-connecting", BLU_PHOTOS[17][2]) },
      { type: "Category III", count: null, size: "14 sq m", beds: "King or twin", deck: "Main and lower decks", features: ["Portholes or windows", "En suite bathroom", "Air conditioning"], image: null },
    ],
    itineraries, departures,
    pricesNote: PRICES + " Indonesian national park and marine park fees are paid locally where Aqua's terms say so.",
    inclusions: ["All meals on board", "Selected premium wines and beer, and non-alcoholic drinks", "Twice-daily excursions with expert local guides", "Group transfers on Aqua's recommended flights", "Snorkel gear, wetsuits and scuba equipment", "Kayaks and paddleboards", "Laundry", "Starlink internet"],
    children: "",
    faqs: [
      ["How much does Aqua Blu cost?", "Aqua lists seven nights from about US$11,000 per person in Category III, more for the longer voyages and larger suites. Every departure is in the table on this page."],
      ["When does Aqua Blu sail Komodo and Raja Ampat?", "Bali and Komodo from April to September; Raja Ampat from December to February; the Spice Islands and the Forgotten Islands in between."],
      ["Can I dive on Aqua Blu?", "Yes. Scuba equipment is on board and dives are offered on the excursions; bring your certification."],
      ["Where do Aqua Blu voyages start?", "Bali (Benoa), Labuan Bajo, Ambon or Sorong, depending on the route."],
      ["What was Aqua Blu before?", "HMS Beagle, a British Royal Navy explorer, refitted for Aqua in 2019."],
      ["What is included?", "All meals, selected wines and beer, excursions, group transfers, snorkel and dive equipment, kayaks, laundry and Starlink internet."],
    ],
    suits: [{ who: "Divers and snorkellers", line: "Raja Ampat, Komodo and the Banda Sea, with gear on board." }, { who: "Explorers", line: "The Forgotten Islands and the Asmat, places few ships reach." }, { who: "Families", line: "Connecting suites on two decks." }],
    sources: SOURCES("aqua-blu", "indonesia-cruise"),
    film: { id: "qWyHzb2mWGo", title: "Life aboard Aqua Blu in East Indonesia" },
    glance: { route: "Bali, Komodo, Raja Ampat, Spice Islands" },
  }),
};

// ── Aqua Lares ────────────────────────────────────────────────────────────────
const LARES_PHOTOS = [
  ["hero", CF + "2025-07/Masthead%20Desktop.png", "Aqua Lares under way, seen from above"],
  ["seychelles", CF + "2026-04/Seychelles_D.png", "Granite boulders and a beach in the Seychelles"],
  ["arctic", CF + "2025-10/Arctic_D%26T.png", "Sea ice and mountains in the Arctic"],
  ["svalbard", CF + "2026-10/Destinations%20-%20Masthead%20D.png", "Aqua Lares in a still Arctic fjord"],
  ["svalbard-2", CF + "2025-10/Masthead_D_1.png", "Aqua Lares before a glacier in Svalbard"],
  ["svalbard-3", CF + "2025-10/Primary_D_0.png", "Fishing villages among the islands of Arctic Norway"],
  ["svalbard-4", CF + "2025-10/Secondary_D_0.png", "A Svalbard reindeer"],
  ["seychelles-2", CF + "2026-04/Seychelles_D_0.png", "Aqua Lares off a Seychelles island"],
  ["owners-suite-303", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-303-01.png", "Owner's Suite 303 on Aqua Lares"],
  ["cabin-301", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-301-01.png", "Cabin 301 on Aqua Lares"],
  ["cabin-401", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-401-01.png", "Cabin 401 on Aqua Lares"],
  ["cabin-201", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-201-01.png", "Cabin 201 on Aqua Lares"],
  ["cabin-104", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-104-01.png", "Cabin 104 on Aqua Lares"],
  ["cabin-205", CF + "static-assets/ships/aqua-lares/suites/aqua-lares-cabin-205-01.png", "Cabin 205 on Aqua Lares"],
];
const lares = {
  slug: "aqua-lares", code: "AQL", folder: "seychelles", film: { id: "THyQrz5bUL0", title: "Aqua Lares in the Seychelles and Tanzania" },
  categories: { OWNSTI: "Owner's Suite I", OWNSTII: "Owner's Suite II", OWNSTIII: "Owner's Suite III", OWNERSAPT: "Owner's Apartment", CATII: "Category II", CATIII: "Category III", CATIV: "Category IV", CATV: "Category V" },
  order: ["Owner's Suite I", "Owner's Suite II", "Owner's Suite III", "Owner's Apartment", "Category II", "Category III", "Category IV", "Category V"],
  photos: photoList(LARES_PHOTOS),
  record: ({ itineraries, departures }) => ({
    slug: "aqua-lares", name: "Aqua Lares", ledgerId: "VSL-2026-000033", ...common, type: "motor-yacht",
    waters: "Seychelles and Zanzibar in the northern winter; Svalbard, Arctic Norway and the Scottish Isles in summer", country: "Seychelles, Tanzania, Norway (Svalbard), United Kingdom (Scotland)",
    seo: { title: "Aqua Lares: Seychelles, Aldabra and Svalbard Superyacht | James Wild & Co", description: "Aqua Lares by Aqua Expeditions: a 77 m icebreaker superyacht, 15 cabins, 30 guests, 32 crew. Seychelles, Aldabra and Zanzibar; Svalbard and Arctic Norway from June 2026. Every fare.", keywords: ["Aqua Lares", "Seychelles superyacht cruise", "Aldabra cruise", "Svalbard luxury cruise", "Aqua Expeditions Arctic"] },
    tagline: "A 77-metre icebreaker superyacht: Aldabra in winter, Svalbard in summer.",
    answer: "Aqua Lares is Aqua Expeditions' 77-metre icebreaker superyacht, the first, says Aqua, to sell single cabins as well as private charters in East Africa and the Norwegian Arctic. She carries 30 guests in 15 cabins with 32 crew. From late in the year she sails the Seychelles, Aldabra and Zanzibar for five to 14 nights; from June 2026 she sails Svalbard, Arctic Norway and the Scottish Isles. She suits travellers who want remote islands, or polar bears, with superyacht service.",
    facts: [["Length", "77 m"], ["Type", "Icebreaker superyacht"], ["Cabins", "15 in five categories, including 3 Owner's Suites of 39 to 66 sq m"], ["Guests", "30"], ["Crew", "32"], ["Decks", "6"], ["Chef", "Karime López, Michelin-starred"], ["Routes", "Seychelles and Zanzibar; Svalbard, Norway and Scotland; 5 to 14 nights"]],
    overview: [
      "Aqua Lares carries 30 guests in 15 cabins across six decks with 32 crew, more than one for every guest. Three Owner's Suites run from 39 to 66 sq m (419 to 710 sq ft); the other cabins from 13 to 30 sq m. Interiors use Dedar fabrics, Minotti and Poltrona Frau furniture and Gaya Ceramics tableware, with antique maps and prints.",
      "She has a sun deck lounge and bar, a heli deck lounge with daybeds, a saloon, a cinema, al fresco dining, an outdoor jacuzzi and swim platform, and a lower deck spa with a sauna, a massage room and a gym. Michelin-starred chef Karime López writes her menus for each region. In the Indian Ocean she reaches Aldabra, Assumption, Astove, Alphonse and the Amirantes; in the Arctic, Longyearbyen, Smeerenburg, Hinlopen and the pack ice.",
    ],
    hero: img("aqua-lares", "hero", LARES_PHOTOS[0][2]),
    gallery: gallery("aqua-lares", LARES_PHOTOS.slice(1, 7).concat(LARES_PHOTOS.slice(9, 14))),
    cabins: [
      { type: "Owner's Suite I", count: null, size: "Up to 66 sq m (710 sq ft)", beds: "King, double or twin", deck: "Owner's deck and main deck", features: ["The largest cabin on board is the 66 sq m CAT I suite on the owner's deck", "Deluxe bathroom with walk-in rain shower", "Air conditioning", "Safe"], image: img("aqua-lares", "owners-suite-303", LARES_PHOTOS[8][2]) },
      { type: "Owner's Suites II and III", count: null, size: "39 sq m and up (419 sq ft)", beds: "King, double or twin", deck: "Ask us", features: ["Deluxe bathroom with walk-in rain shower", "Air conditioning", "Safe"], image: null },
      { type: "Categories II to V", count: null, size: "13 to 30 sq m (139 to 322 sq ft)", beds: "King, double or twin", deck: "Bridge, owner's, upper and main decks", features: ["Individually designed and furnished", "Dedar wallpapers and fabrics", "Deluxe bathroom with walk-in rain shower", "Air conditioning"], image: img("aqua-lares", "cabin-301", LARES_PHOTOS[9][2]) },
    ],
    itineraries, departures,
    pricesNote: PRICES + " Aqua's Early Bird saving on Seychelles and Tanzania voyages is 20% on 2026 to 2028 departures, on Aqua's terms.",
    inclusions: ["All meals on board", "House wines and beer, and non-alcoholic drinks", "Twice-daily excursions with expert guides", "Snorkel gear, wetsuits and scuba equipment", "Kayaks, paddleboards and fly-fishing equipment", "High-speed WiFi"],
    children: "",
    faqs: [
      ["How much does Aqua Lares cost?", "Aqua lists five nights in the Seychelles from about US$9,300 per person in Category V; Owner's Suites and longer voyages cost more. Every departure is in the table on this page."],
      ["Where does Aqua Lares sail?", "From about November to April, the Seychelles (Mahé, Praslin, La Digue, Aldabra and the outer islands) and Zanzibar and Mafia in Tanzania; from June, Svalbard, Arctic Norway and the Scottish Isles."],
      ["Can I see polar bears on Aqua Lares?", "Her Svalbard voyages reach the pack ice, polar bear country, and walrus haul-outs; sightings are never promised."],
      ["Can we charter Aqua Lares?", "Yes. Aqua sells her by the cabin and as a whole-yacht charter for up to 30."],
      ["Is Aqua Lares an icebreaker?", "Aqua calls her an icebreaker superyacht: her hull is built for ice, which takes her into Svalbard's fjords and to the pack ice edge."],
      ["What is included?", "All meals, house wines and beer, excursions, snorkel and dive gear, kayaks, paddleboards, fly-fishing gear and WiFi."],
    ],
    suits: [{ who: "Island lovers", line: "Aldabra's giant tortoises and atolls few ships reach." }, { who: "Arctic first timers", line: "Svalbard in comfort, with zodiacs and kayaks." }, { who: "Groups", line: "Charter the whole yacht for 30." }],
    sources: [...SOURCES("aqua-lares", "seychelles-tanzania-cruise"), "https://www.aquaexpeditions.com/destinations/svalbard-arctic-cruise"],
    film: { id: "THyQrz5bUL0", title: "Aqua Lares in the Seychelles and Tanzania" },
    glance: { route: "Seychelles and Zanzibar; Svalbard" },
  }),
};

// Aria Amazon keeps her filed page; her routes, departures and film are refreshed.
const aria = {
  slug: "aria-amazon", code: "AAR", folder: "amazon", keep: true, film: { id: "idgZWXfY57U", title: "Sail into the Amazon's wild heart aboard Aria Amazon" },
  categories: { "1STDECKSUITE": "First Deck Suite", "2NDDECKSUITE": "Second Deck Suite" },
  order: ["First Deck Suite", "Second Deck Suite"],
  pricesNote: PRICES,
  photos: [],
};

export const SHIPS = [mekong, nera, aria, mare, blu, lares];
