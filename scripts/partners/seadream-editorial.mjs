// SeaDream Yacht Club: the yacht records' copy, in the house voice, from facts on seadream.com only (read 15 and
// 16 Nov 2026: the yachts, deck plan, stateroom, charter, spa and policy pages, and each voyage page). No invented
// quotes; nothing here is James's testimony. {n} {from} {first} {last} {regions} are filled by seadream-build.mjs
// from the published voyages, so the copy never states a count or a fare the data does not hold.
// Pictures are ids in the house Cloudinary library (scripts/data/seadream/library.json holds each caption).

export const REGIONS = { caribbean: "The Caribbean", mediterranean: "The Mediterranean", "scandinavia-northern-europe": "Northern Europe", "trans-atlantic": "Transatlantic", asia: "Asia", "oceania-and-pacific": "Oceania and the Pacific", "north-and-south-america": "The Americas", arctic: "The Arctic" };
/** House rule (CLAUDE.md, "Where the house sells"): no Middle East pages or maps. A voyage that calls there is not filed. */
export const NOT_SOLD = ["United Arab Emirates", "Oman", "Qatar", "Saudi Arabia", "Jordan", "Israel", "Bahrain", "Kuwait"];
/** The picture a voyage shows until its own photograph is filed: the yacht herself, never a place she may not visit. */
export const REGION_PICTURE = { caribbean: "site/water-toys", mediterranean: "site/yachts-5", "scandinavia-northern-europe": "site/fjord", "trans-atlantic": "site/transatlantic", arctic: "site/fjord" };

export const INCLUSIONS = [
  "All meals, served to order, in the Dining Salon or outdoors at the Topside Restaurant",
  "Open bar with select premium brands",
  "Wines with lunch and dinner",
  "Gratuities",
  "The marina's water toys, from kayaks and paddleboards to sailing dinghies",
  "Mountain bikes to take ashore",
  "The golf simulator",
  "Room service around the clock",
  "Morning yoga and Tai Chi, and the fitness centre",
];
export const EXCLUSIONS = ["Port and government fees", "Wi-Fi (US$35 a day or US$99 a week)", "Spa treatments", "Premium wines and spirits beyond the open bar", "Land adventures ashore", "Laundry", "Flights and transfers", "Travel insurance, which SeaDream strongly recommends"];
export const TERMS = [
  "Deposit: 25% of the fare to confirm.",
  "Final payment: 90 days before departure.",
  "Cancellation more than 120 days before departure: US$200 per booking.",
  "Cancellation 120 to 91 days before: 25% of the fare. 90 to 61 days: 50%. 60 to 31 days: 75%. 30 days or fewer: 100%.",
  "Fares are capacity controlled and can change without notice.",
];
export const SOURCES = ["seadream.com/yachts", "seadream.com/voyages and each voyage page", "seadream.com deck plans and stateroom pages", "seadream.com/charter", "seadream.com/spa", "seadream.com policies, terms and conditions"];

const CABINS = [
  { type: "Yacht Club Stateroom (Deck 2)", count: null, size: "195 sq ft (18 sq m)", beds: "Twin beds or a queen", deck: "Deck 2", features: ["Two round windows on the sea", "Sofa, chair and cocktail table", "Marble bathroom with a multi-jet shower"], photo: "suites/yacht-club-stateroom-deck-2-1" },
  { type: "Yacht Club Stateroom (Deck 3)", count: null, size: "195 sq ft (18 sq m)", beds: "Twin beds or a queen", deck: "Deck 3", features: ["Picture window on the sea", "Sofa, chair and cocktail table", "Marble bathroom, a multi-jet shower in select staterooms", "Steps from the pool"], photo: "suites/yacht-club-stateroom-deck-3-4-1" },
  { type: "Yacht Club Stateroom (Deck 4)", count: null, size: "195 sq ft (18 sq m)", beds: "Twin beds or a queen", deck: "Deck 4", features: ["Picture window on the sea", "Sofa, chair and cocktail table", "Near the spa, the fitness centre and the library"], photo: "suites/yacht-club-stateroom-deck-3-4-3" },
  { type: "Commodore Suite (Deck 2)", count: null, size: "390 sq ft (36 sq m)", beds: "A queen, with room for a second permanent queen or a dining area", deck: "Deck 2", features: ["Two Yacht Club Staterooms joined", "Two marble bathrooms with multi-jet showers", "Two closets, a sitting area and a desk"], photo: "suites/commodore-suite-deck-2-1" },
  { type: "Commodore Suite (Deck 3)", count: null, size: "390 sq ft (36 sq m)", beds: "A queen, with room for a second permanent queen or a dining area", deck: "Deck 3", features: ["Two Yacht Club Staterooms joined", "Two marble bathrooms with multi-jet showers", "Picture windows on the sea"], photo: "suites/commodore-suite-deck-3-2" },
  { type: "Admiral Suite", count: 1, size: "375 sq ft (35 sq m)", beds: "Queen, in a separate bedroom", deck: "Deck 4", features: ["Three picture windows", "Living and dining area, and a guest half bath", "Marble bathroom with a soaking tub and a multi-jet shower"], photo: "suites/admirals-suite-1" },
  { type: "Owner's Suite", count: 1, size: "447 sq ft (42 sq m)", beds: "Queen, in a separate bedroom", deck: "Deck 3", features: ["Living and dining area", "Bathroom with a soaking tub facing the sea and a massage shower"], photo: "suites/owners-suite-1" },
];
const DECKS = [
  { deck: "Deck 2", id: "deck-2", cabins: ["Yacht Club Stateroom (Deck 2)", "Commodore Suite (Deck 2)"] },
  { deck: "Deck 3", id: "deck-3", cabins: ["Yacht Club Stateroom (Deck 3)", "Commodore Suite (Deck 3)", "Owner's Suite"] },
  { deck: "Deck 4", id: "deck-4", cabins: ["Yacht Club Stateroom (Deck 4)", "Admiral Suite"] },
  { deck: "Deck 5", id: "deck-5", cabins: [] },
  { deck: "Deck 6", id: "deck-6", cabins: [] },
];
const CHILDREN = "SeaDream takes no children under one year old, guests under 18 travel with an adult, and there is no children's programme on board. She suits older children and teenagers who are happy at an adults' pace. One stateroom (215) is accessible.";

const twin = (name, other, hero, gallery) => ({
  name, status: "sailing",
  brandLine: "SeaDream Yacht Club: 112 guests, 95 crew, a marina at the stern",
  waters: "Caribbean, Bahamas and Mediterranean",
  country: "The Caribbean, the Bahamas and the Mediterranean",
  seo: {
    title: `${name}: Every Voyage, Stateroom and Fare | James Wild & Co`,
    description: `${name}, SeaDream Yacht Club's 112-guest yacht: {n} published voyages across {regions}, each with its day by day and fares, from {from} per person. Staterooms, suites and deck plans.`,
    keywords: [name, "SeaDream Yacht Club", `${name} voyages`, `${name} staterooms`, `${name} deck plan`, "SeaDream Caribbean yacht", "SeaDream Bahamas", "small luxury yacht cruise", "all inclusive yacht voyage"],
  },
  tagline: "A hundred and twelve guests, ninety-five crew, and a marina that opens off the stern.",
  answer: `${name} is one of SeaDream Yacht Club's twin yachts: 104.8 metres long, with 56 staterooms and suites for 112 guests and a crew of 95. Every stateroom faces the sea. Meals, an open bar, wines with lunch and dinner, gratuities and the marina's water toys are in the fare. SeaDream publishes {n} voyages for her, across {regions}, with fares from {from} per person, double occupancy. Each voyage has its own page here with its day by day and the fare of every stateroom and suite.`,
  facts: [
    ["Guests", "112, in 56 staterooms and suites"],
    ["Crew", "95"],
    ["Length", "104.8 m (343.8 ft), beam 18.2 m, draft 4.4 m"],
    ["Tonnage", "4,333 gross tons"],
    ["Speed", "15 knots"],
    ["Decks", "Five guest decks, Deck 2 to Deck 6"],
    ["Refit", "Upgraded 2023 to 2024; her construction began in 1984"],
    ["Marina", "A platform at the stern on Deck 2, with the water toys"],
    ["Dining", "The Dining Salon and the open-air Topside Restaurant"],
    ["Voyages", "{n} published, to {last}"],
  ],
  glance: { guests: "112 guests, 95 crew", route: "Caribbean, Bahamas, Mediterranean, northern Europe", ages: "One year and over; no children's programme" },
  overview: [
    `${name} and ${other} are twins, and small by design: 112 guests is a dinner party next to the ships that share their harbours. She calls at small yachting harbours and anchors off beaches, and her marina opens at the stern for kayaks, paddleboards and sailing dinghies.`,
    "Life aboard is mostly outdoors. Lunch and dinner are served to order at the Topside Restaurant when the weather allows, the pool is on Deck 3, and Deck 6 has the Balinese Dream Beds, which can be made up for a night under the stars, and the Top of the Yacht Bar.",
    "Inside are the Dining Salon, the Main Salon, a library, the piano bar, a small casino, a fitness centre and the spa, which SeaDream describes as the only Thai-certified spa at sea. Yoga and Tai Chi on deck each morning are in the fare.",
    "SeaDream also charters each yacht whole, for up to 56 couples, in the Caribbean or the Mediterranean.",
  ],
  why: [
    "Small enough to anchor where the large ships cannot, with a marina at the waterline.",
    "Close to one crew member for every guest: 95 crew for 112 guests.",
    "The fare covers the things that usually become a bill: the bar, wine with meals, gratuities and the water toys.",
    "Every stateroom and suite faces the sea, and the top deck beds can be made up for a night outside.",
    "SeaDream publishes each voyage with its ports, times and the fare of every category, so the choice is made on facts.",
    "Voyages run back to back, so two can be joined without changing yacht.",
  ],
  hero, gallery,
  cabins: CABINS,
  decks: DECKS.map((d) => ({ ...d, alt: `Deck plan of ${d.deck} aboard ${name}` })),
  pricesNote: `SeaDream prices each voyage per person, double occupancy, in US dollars, by stateroom and suite category. Each sailing below shows its lowest published fare, as SeaDream publishes it; open a voyage for the fare of every category. Fares are capacity controlled and can change, port and government fees are extra, and single and third-person fares are on request. James confirms yours before you book.`,
  children: CHILDREN,
  faqs: [
    [`How many guests does ${name} carry?`, "112 guests in 56 staterooms and suites, with a crew of 95."],
    [`What is included in the fare aboard ${name}?`, "All meals, an open bar with select premium brands, wines with lunch and dinner, gratuities, the marina's water toys, mountain bikes, the golf simulator, morning yoga and Tai Chi, and room service around the clock. Port and government fees, Wi-Fi, spa treatments, premium wines and spirits, land adventures and laundry are extra."],
    [`Where does ${name} sail?`, `SeaDream publishes {n} voyages for her across {regions}, from {first} to {last}. Each has its own page with its day by day.`],
    [`Does ${name} sail the Bahamas?`, "{bahamas}"],
    [`What staterooms and suites does ${name} have?`, "Yacht Club Staterooms of 195 square feet on Decks 2, 3 and 4; Commodore Suites of 390 square feet, which are two staterooms joined; the 375 square foot Admiral Suite on Deck 4; and the 447 square foot Owner's Suite on Deck 3. All face the sea."],
    [`Can children sail aboard ${name}?`, "From one year old. Guests under 18 travel with an adult, and there is no children's programme on board."],
    [`How much does a voyage aboard ${name} cost?`, "Published fares start from {from} per person, double occupancy, and vary by voyage and by stateroom or suite. Every voyage page shows the fare of every category as SeaDream publishes it."],
    ["What are SeaDream's payment and cancellation terms?", "A 25% deposit confirms, and the balance is due 90 days before departure. Cancelling more than 120 days out costs US$200 per booking; from 120 to 91 days, 25% of the fare; 90 to 61 days, 50%; 60 to 31 days, 75%; and 30 days or fewer, the full fare."],
    [`Can ${name} be chartered whole?`, "Yes. SeaDream charters each of the twin yachts for up to 56 couples in the Caribbean or the Mediterranean, on a published itinerary or one set with you. Ask James."],
    ["Is there Wi-Fi?", "Yes, at US$35 a day or US$99 a week."],
  ],
  suits: [
    { who: "Couples", line: "A stateroom on the sea, dinner outdoors, and a bed on deck for one night." },
    { who: "Groups of friends", line: "Small enough that the yacht feels shared, and she can be chartered whole." },
    { who: "Swimmers and sailors", line: "The marina opens at anchor: kayaks, paddleboards, dinghies and a swim off the stern." },
    { who: "Solo travellers", line: "Single fares are on request for every voyage." },
    { who: "First time at sea", line: "Short Caribbean and Bahamas voyages, port to port, with few days at sea." },
  ],
  pathway: { primary: "PATH-02", secondary: ["PATH-05"] },
});

const DECK_LIFE = ["site/yachts-3", "site/yachts-7", "site/yachts-9", "site/yachts-12", "site/yachts-13", "site/yachts-14", "site/yachts-18", "site/yachts-19", "site/yachts-20", "site/champagne-caviar-splash", "site/yachts-4", "site/entire-ship"];
export const YACHTS = {
  "seadream-i": { ...twin("SeaDream I", "SeaDream II", "site/yachts-1", DECK_LIFE), ledgerId: "VSL-2026-000053" },
  "seadream-ii": { ...twin("SeaDream II", "SeaDream I", "site/yachts-2", ["site/yachts-6", ...DECK_LIFE.filter((x) => x !== "site/yachts-4")]), ledgerId: "VSL-2026-000054" },
  "seadream-iii": {
    name: "SeaDream III", ledgerId: "VSL-2026-000055", status: "launching", launch: "2029-07-10",
    brandLine: "SeaDream Yacht Club's new yacht, sailing from July 2029",
    waters: "Pacific, Atlantic and Arctic",
    country: "Asia, the Pacific, the Americas and Europe",
    seo: {
      title: "SeaDream III: The New Yacht, Her Inaugural Voyage and Every Published Sailing | James Wild & Co",
      description: "SeaDream III joins SeaDream Yacht Club in July 2029. Her inaugural voyage leaves Hong Kong for Tokyo on 10 July 2029. {n} published voyages across {regions}, each day by day, from {from} per person.",
      keywords: ["SeaDream III", "SeaDream III inaugural voyage", "SeaDream new yacht 2029", "SeaDream III voyages", "SeaDream Asia", "SeaDream Yacht Club"],
    },
    tagline: "SeaDream's third yacht, sailing from July 2029.",
    answer: "SeaDream III is the new yacht SeaDream Yacht Club is adding to SeaDream I and SeaDream II after twenty-five years on the water. Her inaugural voyage, The Inaugural Journey: Japan, the Ryukyus & Korea, leaves Hong Kong on 10 July 2029 for Tokyo. SeaDream publishes {n} voyages for her here, across {regions}, with fares from {from} per person, double occupancy. SeaDream has not yet published her size, her suites or a picture of her; each voyage is filed with its day by day and its lead fare, and the rest follows as SeaDream releases it.",
    facts: [
      ["Status", "Launching; inaugural voyage 10 July 2029"],
      ["Inaugural voyage", "Hong Kong to Tokyo: Japan, the Ryukyus and Korea"],
      ["Fleet", "The third SeaDream yacht, after the twins SeaDream I and SeaDream II"],
      ["Voyages", "{n} published, {first} to {last}"],
      ["Waters", "{regions}"],
      ["Fares", "From {from} per person, double occupancy, as published"],
      ["Suites", "Not yet published by SeaDream"],
    ],
    glance: { guests: "To be announced", route: "Asia, the Pacific, the Americas and Europe" },
    overview: [
      "SeaDream calls her a new chapter. The twins' published voyages keep to the Caribbean, the Mediterranean, northern Europe and the Atlantic crossings between them; SeaDream III's begin in Asia and go on to the Pacific, the Americas and the Arctic.",
      "What SeaDream has published so far is her voyages: the ports, the times and a lead fare for each. It has not published her length, her guest count, her suites or her deck plans, and it shows no picture of her yet. We have filed what is published and nothing more.",
      "If you want a suite on her first voyages, ask James and he will send the suite categories and fares as SeaDream releases them.",
    ],
    why: [
      "The first new SeaDream yacht since the twins, from a club that has spent twenty-five years with two.",
      "Her inaugural voyage is published: Hong Kong to Tokyo on 10 July 2029.",
      "Her published voyages reach Asia, the Pacific, the Americas and the Arctic.",
      "Every published voyage is filed here day by day, with its lead fare.",
    ],
    hero: "site/sdiii-launch", gallery: ["site/hero-image-yachts-v3", "site/yachts-2", "site/champagne-caviar-splash", "site/yachts-9"],
    cabins: [], decks: [],
    pricesNote: "SeaDream publishes one lead fare for each SeaDream III voyage, per person, double occupancy, in US dollars, and has not yet published fares by suite. Each sailing below shows that fare, as SeaDream publishes it. Fares can change; James confirms yours and sends the suite fares as they are released.",
    inclusions: ["SeaDream has not yet published what the SeaDream III fare includes. Aboard the twin yachts it covers all meals, an open bar, wines with lunch and dinner, gratuities and the water toys; James confirms what applies to her."],
    exclusions: ["Port and government fees", "Flights and transfers", "Travel insurance, which SeaDream strongly recommends"],
    children: "SeaDream has not published a children's policy for SeaDream III. Aboard the twin yachts it takes no children under one year old and guests under 18 travel with an adult; James confirms the rule for her.",
    faqs: [
      ["When does SeaDream III first sail?", "Her inaugural voyage leaves Hong Kong on 10 July 2029 and ends in Tokyo, by way of Japan, the Ryukyu Islands and Korea."],
      ["Where will SeaDream III sail?", "SeaDream publishes {n} voyages for her here, across {regions}, from {first} to {last}."],
      ["How many guests will SeaDream III carry?", "SeaDream has not published it yet. The twin yachts carry 112 guests each."],
      ["How much is a SeaDream III voyage?", "SeaDream publishes a lead fare for each voyage, from {from} per person, double occupancy. Fares by suite are not yet published."],
      ["Can I book SeaDream III now?", "Yes. The voyages are published and open; ask James, who confirms the fare and holds the suite with SeaDream."],
      ["Are the pictures on this page of SeaDream III?", "No. SeaDream has not published a picture of her. The pictures here are SeaDream's own, of the sea and of SeaDream I and SeaDream II, and each is captioned as what it is."],
    ],
    suits: [
      { who: "SeaDream regulars", line: "The club you know, on a new yacht." },
      { who: "Maiden voyage collectors", line: "Hong Kong to Tokyo, 10 July 2029." },
      { who: "Long-haul travellers", line: "Asia and the Pacific by small yacht, port to port." },
    ],
    pathway: { primary: "PATH-02", secondary: ["PATH-05"] },
  },
};
