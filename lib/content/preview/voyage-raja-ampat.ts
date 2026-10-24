// Sample voyage-itinerary content for the Ledger Edit design reference.
// Staged from the live Aliikai 10 Day Raja Ampat North itinerary page.
// Editorial gaps are filled for design purposes only; day-by-day detail and
// rates are pending fact-check before any Webflow template rebuild.

export const STAMP_URL = "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/e248c138e_stamp-transparent.png";

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const SAMPLE_VOYAGE_ITINERARY = {
  name: "10 Day Raja Ampat North",
  vessel: "Aliikai Voyage",
  ledgerId: "ITN-VSL-2026-000012",
  introQuote: "Set sail on a 10-day luxury voyage aboard Aliikai through Raja Ampat's legendary reefs and wild islands.",
  meta: [
    ["Ledger ID", "ITN-VSL-2026-000012"],
    ["Vessel", "Aliikai Voyage · STY-registered phinisi"],
    ["Waters", "Raja Ampat, West Papua · Indonesia"],
    ["Duration", "10 days / 9 nights"],
    ["Embarkation", "Sorong"],
    ["Disembarkation", "Sorong"],
    ["Rate year", "2026 / 27 season"],
  ],
  hero: {
    url: `${CDN}/68bf434cfbdffdbeebf4a0a7_Raja%20Hero%20Main.JPG`,
    alt: "Aliikai Voyage in Raja Ampat: green limestone islands rising from turquoise water at sunset",
  },
  overview: [
    "Embark on a ten-day luxury sailing expedition through Indonesia's most biodiverse marine paradise aboard Aliikai, a handcrafted phinisi created for intimate journeys. Each day brings its own rhythm of discovery, from snorkeling in vibrant coral gardens and diving alongside graceful manta rays to hiking limestone islands with sweeping views and encountering rare birds in untouched habitats.",
    "Adventure, culture, and serenity blend seamlessly, making this voyage ideal for couples, families, and solo explorers seeking a transformative escape into the wild.",
  ],
  rate: {
    fromPrice: 4830,
    currency: "US$",
    basis: "Per person · shared cabin · double occupancy",
    season: "2026 / 27 sailing year",
    includes: [
      "10 days / 9 nights aboard Aliikai",
      "All meals — eco-sourced Indonesian cuisine",
      "Expert-guided diving & snorkelling with Nitrox",
      "Kayaks, paddleboards & water sports from the ship",
      "Sorong airport transfers and all park fees",
    ],
    note: "Rates shown are the live registry rate for the 2026/27 sailing year. The House re-verifies every rate at enquiry and negotiates directly with the owner; nothing is booked through an engine.",
  },
  days: [
    {
      day: 1,
      port: "Sorong",
      label: "Embarkation & Arrival",
      summary: "Met at Sorong airport by the crew and transferred to the harbour — a twenty-minute drive. Settle in, lunch on deck, and depart for the islands of Raja Ampat. If time allows, a first snorkel or check dive, then sundowners against a magnificent sunset and dinner under the stars.",
    },
    {
      day: 2,
      port: "Kri Peninsula",
      label: "Set Sail",
      summary: "Awake to the calls of tropical birds. Mioskon Bay is a spectacular spot to snorkel the mangroves or kayak mirrored waters along the verdant coastline; the Kri peninsula offers some of the most exquisite underwater vistas in Raja Ampat. Nearby Mansuar holds a village worth a first glimpse of local culture.",
      image: `${CDN}/68c174018f41b9fa8ec16567_Misool.Heinrichs.033.webp`,
      imageAlt: "Raja Ampat: wooden jetty over turquoise water with green limestone islands in the background",
    },
    {
      day: 3,
      port: "The Passage",
      label: "The Passage",
      summary: "Rise at dawn for the best chance of spotting the rare Red Bird of Paradise — the cruise director leads the jungle hike to the bird-watching platform. After breakfast, take in the mushroom islands of Kabui Bay and the narrow saltwater river channel where strong currents carry plentiful coral and fish life.",
      image: `${CDN}/688bbf7375df689220c0b0bd_68479380012974600a56c2ff_Aliikai-BirdWatching.webp`,
      imageAlt: "Aliikai Voyage: guests birdwatching from a jungle platform in Raja Ampat at dawn",
    },
    {
      day: 4,
      port: "Penemu Islands",
      label: "Penemu",
      summary: "A cluster of rocky limestone domes draped in lush vegetation, encircling a shallow bay and a walking trail to a panoramic lookout. The nearby waters are among the most outstanding snorkelling and diving sites in the area — sea turtles, manta rays and large schools of game fish.",
      image: `${CDN}/688bbf7375df689220c0b0ba_68570d74eae5f52a10c63398_Aliikai-Dining.webp`,
      imageAlt: "Aliikai Voyage: al fresco dining service prepared on deck between island stops",
    },
    {
      day: 5,
      port: "Wayag",
      label: "Wayag Islands",
      summary: "An interminable maze of lush green peaks rising from multi-hued azure water — the quintessential landscape of Raja Ampat. Climb the island peak for the panoramic view of turquoise waterways, or take the ultimate downtime on a deserted beach. Both are ideal spots to watch the sun melt into the horizon.",
      image: `${CDN}/688bbf7375df689220c0b0cd_684792f157be66f5080ba354_Aliikai-Snorkeling.webp`,
      imageAlt: "Aliikai Voyage: guest snorkeling over a vivid coral garden in Raja Ampat",
    },
    {
      day: 6,
      port: "Wofoh",
      label: "Wofoh Islands",
      summary: "Two islands connected by a shallow reef — beachcombing, paddle boarding and kayaking. Wofoh is also home to a magnificent coral wall plunging into crystal blue water, with brightly colored sea life darting between barrel sponges and soft and hard corals.",
      image: `${CDN}/688bbf7375df689220c0b0d0_68570dd2d563a8a1425bd646_Allikai_CapeKri.jpeg`,
      imageAlt: "Aliikai Voyage: the phinisi at anchor off a coral wall island in Raja Ampat",
    },
    {
      day: 7,
      port: "Arborek",
      label: "Arborek",
      summary: "The waters near Arborek Island, where majestic manta rays gather to feast on plankton-rich tidal surges from the Dampier Strait. Dive or snorkel over the sandy bottom watching the mantas' underwater ballet, then head ashore to explore Arborek — one of only eighteen villages in Raja Ampat.",
      image: `${CDN}/688bbf7375df689220c0b0c0_68570dd8bc500d75cd2160ca_Aliikai-JellyfishLake.webp`,
      imageAlt: "Aliikai Voyage: guests swimming in a secluded Raja Ampat lagoon",
    },
    {
      day: 8,
      port: "Mansuar",
      label: "Mansuar Island",
      summary: "A new day of discovery at Mansuar Island — snorkelling and diving waters with turtles and manta rays, then ashore to a local village to learn of daily life in this remote locale. Sundowners in the afternoon as Aliikai sails on toward Batanta.",
      image: `${CDN}/688bbf7375df689220c0b0c7_68570de223fc5bfc3dc6cba9_Allikai-Boat.webp`,
      imageAlt: "Aliikai Voyage: the two-masted phinisi under sail in calm Raja Ampat waters",
    },
    {
      day: 9,
      port: "Batanta & Dayang Island",
      label: "Waterfalls & Jungle",
      summary: "Explore the natural beauty of Batanta, the smallest of Raja Ampat's four major islands. After breakfast, trek the northern coast to cool off at two jungle waterfalls, then return to the ship for a final evening at anchor.",
    },
    {
      day: 10,
      port: "Sorong",
      label: "Disembarkation",
      summary: "A final breakfast on deck before the short crossing to Sorong and the crew's farewell. Transfers to the airport are arranged to meet your onward flight — most guests break the journey in Bali or continue with a land stay in Sumba.",
    },
  ],
  faqs: [
    {
      q: "How is this voyage priced?",
      a: "US$4,830 per person for a shared cabin in the 2026/27 season, based on double occupancy, including all meals, guided diving and snorkelling, water sports and Sorong transfers. Private charters are quoted by the sailing year.",
    },
    {
      q: "Can the route be customised?",
      a: "Yes — itineraries may be custom designed in most cases. Scheduled fixed departures run the route above; private charters can redraw the day-to-day around your group.",
    },
    {
      q: "When should we sail?",
      a: "The Raja Ampat season runs broadly October to April, when the seas are calmest and the visibility at its best. The House confirms the right departure window before anything is booked.",
    },
  ],
};