// The Cayuga Collection: seven independently owned, sustainably run boutique
// hotels in Costa Rica, Panama, Nicaragua and Guatemala (Cayuga's official
// hotel roster, as checked for the library story on 25 Aug 2026). Photos are
// in Cloudinary under jwco/collections/cayuga-collection/<hotel>/, each with
// its own alt text and place, so any house platform can use them. Add more
// photos to those folders and list them here.
//
// "Choose it for" lines are James's, from his library story WED-2026-000007.
// Jicaro and Bolontiku have no stay page or photos yet: their cards say so.

import { OFFER_LEDGER, offersInCollection, type Offer } from "@/lib/content/offers/offers";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const F = "jwco/collections/cayuga-collection";
/** Full-resolution delivery; AI upscale for the smaller originals. */
export const cayugaImg = (id: string, up = true) => `${CLD}/${up ? "e_upscale/" : ""}c_limit,w_3200/q_auto:best/f_jpg/${F}/${id}`;

export type CollectionImage = { url: string; alt: string; w: number; h: number };
export type GalleryImage = CollectionImage & { hotel: string };
export type GalleryGroup = { key: string; label: string; images: GalleryImage[] };
/** One hotel's current offer, from Cayuga's official offers page. */
export type CollectionOffer = {
  hotel: string; // hotel name, as in CAYUGA.hotels
  program: "Worth Another Night" | "Time Rewarded";
  headline: string;
  travel: string;
  until: string; // ISO date of the last travel night; hidden after this
  note?: string;
  image: CollectionImage;
};
export type CollectionHotel = {
  slug: string; // stay page slug, when built
  name: string;
  country: "Costa Rica" | "Panama" | "Nicaragua" | "Guatemala";
  setting: string;
  where: string;
  bestFor: string[];
  choose: string;
  line: string;
  image?: CollectionImage;
  gallery: CollectionImage[];
  built: boolean;
  /** Cayuga's own "who it's for" and key facts, from its official hotel page. */
  official: { who: string; facts: string };
};

const img = (id: string, alt: string, w: number, h: number, up = true): CollectionImage => ({ url: cayugaImg(id, up), alt, w, h });

export const CAYUGA = {
  slug: "cayuga-collection",
  name: "The Cayuga Collection",
  path: "/collections/cayuga-collection",
  approved: true, // James, on the Proofs sheet, 27 Oct 2026
  founded: "2003",
  founders: ["Andrea Bonilla", "Hans Pfister"],
  countries: ["Costa Rica", "Panama", "Nicaragua", "Guatemala"],
  seo: {
    title: "Cayuga Collection: Sustainable Luxury Hotels, Central America",
    description: "Seven sustainably run boutique hotels in Costa Rica, Panama, Nicaragua and Guatemala: which Cayuga hotel suits whom, how to pair them, and what to ask before you book.",
  },
  eyebrow: "The Collections · Central America",
  tagline: "Seven sustainably run boutique hotels, from cloud forest to private island",
  answer: "The Cayuga Collection is seven independently owned boutique hotels in Costa Rica, Panama, Nicaragua and Guatemala, run since 2003 by Andrea Bonilla and Hans Pfister. Its model puts local teams, year-round jobs, local sourcing and fewer single-use plastics at the centre, while each hotel keeps a strong sense of its own place.",
  hero: img("aguas-claras/aguas-claras-05", "A swimmer in a clear tide pool on the reef at Playa Chiquita, near Aguas Claras", 5000, 3333, false),
  hotels: [
    {
      slug: "arenas-del-mar-resort", name: "Arenas del Mar", country: "Costa Rica", setting: "Rainforest beside the beach", where: "Manuel Antonio, Pacific coast",
      bestFor: ["Families", "First-time Costa Rica", "Wildlife"],
      choose: "Choose it for an easier introduction to Costa Rica, especially when different generations need a balance of nature, beach time and familiar comforts.",
      line: "Rainforest beside the beach in Manuel Antonio, with wildlife and the national park close by.",
      image: img("arenas-del-mar/arenas-del-mar-01", "A rainforest headland meeting a turquoise beach at Manuel Antonio, from the air", 1200, 899),
      gallery: [img("arenas-del-mar/arenas-del-mar-05", "A guest on a glass balcony looking over the bay at Arenas del Mar", 1200, 800), img("arenas-del-mar/arenas-del-mar-04", "A suite with a daybed and an outdoor plunge pool at Arenas del Mar", 1200, 800)],
      official: { who: "Those dreaming of an easy beachfront vacation.", facts: "The only luxury resort in Manuel Antonio right on the beach: two pools, two beaches and two restaurants on 11 acres of rainforest." },
      built: true,
    },
    {
      slug: "kura-boutique-resort", name: "Kura", country: "Costa Rica", setting: "Adults-only, above the ocean", where: "Uvita, southern Pacific coast",
      bestFor: ["Couples", "Honeymooners", "Design"],
      choose: "Choose it for privacy, design and a slower stay. It is less about filling every hour and more about allowing the landscape to set the pace.",
      line: "An adults-only retreat above Uvita, with broad ocean views and modern architecture.",
      image: img("kura/kura-01", "A guest in Kura's infinity pool above the Pacific coast at Uvita", 1024, 683),
      gallery: [img("kura/kura-06", "Kura's infinity pool deck looking over the Pacific", 1024, 683), img("kura/kura-03", "A suite bedroom looking out to the ocean at Kura", 1024, 683)],
      official: { who: "The cosmopolitan couple who love the finer things.", facts: "Eight adults-only suites high in the Uvita rainforest, looking over the Whale\u2019s Tail sandbar and the Pacific." },
      built: true,
    },
    {
      slug: "senda-monteverde-lodge", name: "Senda Monteverde", country: "Costa Rica", setting: "Cloud forest", where: "Monteverde, beside the Aguti reserve",
      bestFor: ["Curious travellers", "Families with older children", "Birders"],
      choose: "Choose it for curious travelers, families with older children, birders and anyone who wants to understand why a cloud forest feels so different from the coast.",
      line: "Walking, naturalist guiding and cool mountain air on the edge of Monteverde's cloud forest.",
      image: img("senda-monteverde/senda-monteverde-04", "A balcony looking over the cloud forest at Senda Monteverde", 2881, 1921, false),
      gallery: [img("senda-monteverde/senda-monteverde-01", "Senda Monteverde's hot pools set in the cloud forest, from above", 2560, 1440, false), img("senda-monteverde/senda-monteverde-06", "A guest with coffee on a balcony in the cloud forest at Senda Monteverde", 2880, 1921, false)],
      official: { who: "The down-to-earth explorer.", facts: "Unlimited hiking in the neighbouring Aguti Wildlife Reserve, on the edge of Monteverde\u2019s cloud forest." },
      built: true,
    },
    {
      slug: "aguas-claras", name: "Aguas Claras", country: "Costa Rica", setting: "Caribbean coast", where: "Playa Chiquita, near Puerto Viejo",
      bestFor: ["Couples", "Creative travellers", "Repeat Costa Rica visitors"],
      choose: "Choose it for creative travelers, couples and repeat Costa Rica visitors who want the country's Caribbean personality rather than another Pacific beach.",
      line: "An art-filled boutique hotel drawing on the Caribbean coast's colour, music, food and Afro-Caribbean identity.",
      image: img("aguas-claras/aguas-claras-02", "A wooden Caribbean-style cottage among banana leaves at Aguas Claras", 1920, 1280),
      gallery: [img("aguas-claras/aguas-claras-07", "The colourful restaurant with turquoise chairs at Aguas Claras", 1920, 1280), img("aguas-claras/aguas-claras-11", "The Caribbean coast and reef near Playa Chiquita from the air", 1920, 1438)],
      official: { who: "The creative who thrives on flashes of inspiration.", facts: "Nine bungalows and six suites, each a living art installation in the jungle near Puerto Viejo." },
      built: true,
    },
    {
      slug: "isla-palenque-resort", name: "Isla Palenque", country: "Panama", setting: "Private island", where: "Gulf of Chiriquí",
      bestFor: ["Families", "Couples", "Island and nature"],
      choose: "Choose it for families, couples and travelers who want an island experience led by nature rather than nightlife.",
      line: "A forested private island with beaches, trails and wildlife, removed from the mainland without giving up service.",
      image: img("isla-palenque/isla-palenque-03", "A thatched open pavilion in the island forest on Isla Palenque", 1500, 1000),
      gallery: [img("isla-palenque/isla-palenque-05", "An open-sided thatched lounge looking through palms to the sea on Isla Palenque", 1000, 751), img("isla-palenque/isla-palenque-02", "A guest in an outdoor bathtub surrounded by jungle leaves on Isla Palenque", 2341, 2341, false)],
      official: { who: "The curious ones who still believe in wonder.", facts: "A 400-acre island of primary forest with seven secluded beaches." },
      built: true,
    },
    {
      slug: "jicaro-island-lodge", name: "Jicaro Island Lodge", country: "Nicaragua", setting: "Lake island", where: "Granada Isletas, Lake Nicaragua",
      bestFor: ["Intimacy", "Culture", "A wider Nicaragua journey"],
      choose: "Choose it for travelers who value intimacy, culture and a strong sense of place. The combination of lake, volcano views and Granada makes it especially useful in a wider Nicaragua journey.",
      line: "A small island lodge among the Granada Isletas, within easy reach of colonial Granada.",
      gallery: [], official: { who: "The off-the-beaten-path explorer who loves nature and local culture.", facts: "Nine two-storey casitas with lake-view terraces, a short boat ride from Granada, a UNESCO World Heritage city." },
      built: false,
    },
    {
      slug: "bolontiku-hotel", name: "Bolontiku", country: "Guatemala", setting: "Lakeside, in the Maya world", where: "Lake Petén Itzá, near Tikal",
      bestFor: ["Culture and history", "Archaeology", "Lakeside calm"],
      choose: "Choose it for culturally curious travelers who want meaningful days among Maya history followed by the calm of a lakeside retreat.",
      line: "A peaceful base on Lake Petén Itzá for Tikal and the archaeological sites of the Petén.",
      image: img("offers/bolontiku-lake", "A forested shore of Lake Petén Itzá with boats at a jetty, from the air", 4032, 3024, false),
      gallery: [], official: { who: "Adventurous travellers seeking luxury near Tikal.", facts: "A swimmable lake for dips and paddleboarding, a private Maya temazcal sweat lodge, and just over an hour to Tikal, Yaxhá and El Mirador." },
      built: false,
    },
  ] as CollectionHotel[],
  pairings: [
    { title: "Cloud forest, then the Pacific", hotels: ["Senda Monteverde", "Arenas del Mar"], line: "Walk the cloud forest, then let the family loose on the beach at Manuel Antonio." },
    { title: "Coast to coast, slowly", hotels: ["Kura", "Aguas Claras"], line: "Pacific views and design at Kura, then the Caribbean's colour and food at Aguas Claras." },
    { title: "Active, then adults-only", hotels: ["Senda Monteverde", "Kura"], line: "Days on foot in Monteverde, then nothing at all above Uvita." },
    { title: "Panama: island and city", hotels: ["Isla Palenque"], line: "Isla Palenque pairs naturally with a few nights in Panama City." },
    { title: "Nicaragua: lake and Granada", hotels: ["Jicaro Island Lodge"], line: "Jicaro belongs in a Nicaragua journey that gives Granada its due." },
    { title: "Guatemala: the Maya world", hotels: ["Bolontiku"], line: "Give Bolontiku time for both the lake and the archaeology; it isn't a quick Tikal stop." },
  ],
  rule: "Three or four nights in each setting is usually more rewarding than changing hotels every second day.",
  questions: [
    "How many employees are hired locally, and are they employed year-round?",
    "How does the property manage drinking water and wastewater?",
    "What food comes from nearby farms and fishers?",
    "How has the hotel reduced or removed single-use plastics?",
    "Which land or marine ecosystems does it actively protect?",
    "What current certification or independent verification does it hold?",
  ],
  faqs: [
    { q: "How many hotels are in the Cayuga Collection?", a: "Cayuga's official hotel page presents seven properties: Arenas del Mar, Kura, Senda Monteverde and Aguas Claras in Costa Rica, Isla Palenque in Panama, Jicaro Island Lodge in Nicaragua and Bolontiku in Guatemala. Membership can change, so the current roster is confirmed before booking." },
    { q: "Which Cayuga hotel is best for a honeymoon?", a: "Kura is the clearest adults-only choice for privacy and ocean views. Aguas Claras can suit couples drawn to art and Caribbean culture, while Isla Palenque offers a more remote island experience." },
    { q: "Which Cayuga hotels are best for families?", a: "Arenas del Mar is a strong first choice for an accessible Costa Rica family trip. Senda Monteverde can suit active families, and Isla Palenque works for those wanting nature and island time. Age and room-occupancy policies are confirmed when you book." },
    { q: "Can I combine several Cayuga hotels in one trip?", a: "Yes. Two contrasting properties in one country usually make the best-paced journey. Allow at least three nights in each and account for road, boat or domestic-flight connections." },
    { q: "Who founded the Cayuga Collection?", a: "Cayuga Hospitality was launched in 2003 by Andrea Bonilla and Hans Pfister." },
    { q: "How can I tell whether a hotel is genuinely sustainable?", a: "Look beyond marketing language. Ask about local employment, wastewater, energy, food sourcing, plastic use, habitat protection, community partnerships and independent certification. Clear, specific answers are more useful than broad claims." },
  ],
  disclosure: "James Wild & Co may help plan and book selected Cayuga Collection hotels. Recommendations remain based on traveller fit.",
};

const g = (id: string, alt: string, w: number, h: number, up: boolean, hotel: string): GalleryImage =>
  ({ url: cayugaImg(id, up), alt: hotel ? `${alt} at ${hotel}` : alt, w, h, hotel });

// Cayuga's own gallery, by theme. A hotel is named only where Cayuga's file
// name says which one; the rest describe what is visible (alt-text rule).
export const GALLERY: GalleryGroup[] = [
  { key: "beachfront", label: "Beachfront", images: [
    g("gallery/beachfront-01", "A couple picnicking on a sandy beach with a basket of tropical fruit", 2560, 1707, false, "Isla Palenque"),
    g("gallery/beachfront-02", "A rocky headland and calm bay in soft evening light", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/beachfront-03", "A long curved beach backed by rainforest, seen from the hillside", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/beachfront-04", "Thatched cabanas among palms at the edge of a quiet beach", 2560, 1707, false, "Isla Palenque"),
    g("gallery/beachfront-05", "A mother and small child playing in the surf at sunset", 1712, 2560, true, "Arenas del Mar"),
    g("gallery/beachfront-06", "A palm-framed beach looking out to a small offshore island", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/beachfront-07", "A beach picnic spread on a woven mat with tropical flowers and fruit", 2560, 1707, false, "Isla Palenque"),
    g("gallery/beachfront-08", "A forested island shore and calm sea from the air", 2560, 1440, false, "Isla Palenque"),
    g("gallery/beachfront-09", "Sun loungers and parasols around a stone-edged pool among trees", 1707, 2560, true, "Arenas del Mar"),
    g("gallery/beachfront-10", "A woman walking along a beach beneath an overhanging tree", 2560, 1707, false, "Isla Palenque"),
    g("gallery/beachfront-11", "Daybeds and a thatched pavilion beside a pool among palms", 2560, 1707, false, "Isla Palenque"),
    g("gallery/beachfront-12", "A wide empty beach meeting rainforest, seen from the air", 2560, 1917, false, ""),
    g("gallery/beachfront-13", "A rainforest-covered headland above a small sandy cove", 2560, 1918, false, "Arenas del Mar"),
    g("gallery/beachfront-14", "Footprints in the sand on a beach looking out to small islands", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/beachfront-15", "A plunge pool and white cottage veranda surrounded by tropical plants", 1706, 2560, true, ""),
  ] },
  { key: "rainforest", label: "Rainforest and cloud forest", images: [
    g("gallery/rainforest-01", "A guest wrapped in a blanket on a forest balcony at sunset", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/rainforest-02", "A curving pool beneath forest trees with a stone hot tub above", 1707, 2560, true, ""),
    g("gallery/rainforest-03", "A suite with a green roof set in dense cloud forest, from above", 2560, 1917, false, "Senda Monteverde"),
    g("gallery/rainforest-04", "A villa with a pool deck and thatched roofs in the forest", 2560, 1707, false, "Isla Palenque"),
    g("gallery/rainforest-05", "Dense rainforest undergrowth and tall trees", 2560, 1707, false, ""),
    g("gallery/rainforest-06", "A guest resting on a terrace above a coastline with bougainvillea", 2560, 1707, false, ""),
    g("gallery/rainforest-07", "A dark, calm suite with a bed by the window", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/rainforest-08", "Raindrops on a large monstera leaf", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/rainforest-09", "An infinity pool and loungers at a glass-walled lodge at dusk", 2560, 1707, false, ""),
    g("gallery/rainforest-10", "A group yoga class on a deck above the sea among palms", 2560, 1707, false, "Isla Palenque"),
    g("gallery/rainforest-11", "Red and pink tropical flowers in a garden", 1707, 2560, true, ""),
    g("gallery/rainforest-12", "Guests on daybeds under white parasols above the coast", 2560, 1707, false, ""),
    g("gallery/rainforest-13", "An open-sided restaurant lit at dusk among cloud-forest trees", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/rainforest-14", "Rooftops and pools scattered through the rainforest canopy, from above", 1200, 675, true, ""),
    g("gallery/rainforest-15", "Hands holding a coffee cup behind a rain-streaked window", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/rainforest-16", "A guest in a villa plunge pool looking out to the sea", 2560, 1707, false, "Isla Palenque"),
  ] },
  { key: "experiences", label: "Experiences and food", images: [
    g("gallery/experiences-01", "A host serving a family at an outdoor table among palms", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/experiences-02", "A cocktail and a small plate on a low table by a velvet sofa", 1707, 2560, true, "Senda Monteverde"),
    g("gallery/experiences-03", "A bowl of ceviche with lime beside a glass of beer", 1707, 2560, true, "Senda Monteverde"),
    g("gallery/experiences-04", "A team of hotel guides and staff walking together outdoors", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/experiences-05", "Guests around a fire pit beneath a treehouse villa at night", 1707, 2560, true, "Isla Palenque"),
    g("gallery/experiences-06", "A striped lounge chair, a book and a drink on a wooden deck", 2560, 1707, false, ""),
    g("gallery/experiences-07", "A coffee bag and coffee cups on a painted oxcart-style tray", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/experiences-08", "A chef holding a tray of food in a garden", 2560, 1706, false, ""),
    g("gallery/experiences-09", "A woodworker shaping timber in an island workshop", 2560, 1710, false, "Isla Palenque"),
    g("gallery/experiences-10", "Guests at an outdoor cooking class above the forest", 2560, 1707, false, ""),
    g("gallery/experiences-11", "A guide showing guests a plant on a forest walk", 2560, 1707, false, "Isla Palenque"),
    g("gallery/experiences-12", "A cushioned rattan sofa on a white veranda", 1706, 2560, true, ""),
    g("gallery/experiences-13", "A family making bracelets together at a craft class", 2560, 1707, false, "Arenas del Mar"),
    g("gallery/experiences-14", "A pool and thatched restaurant among tropical gardens, from above", 2560, 1706, false, ""),
    g("gallery/experiences-15", "A rider galloping a horse along a Caribbean beach", 2560, 1706, false, ""),
    g("gallery/experiences-16", "Beach chairs under a fringed parasol facing the sea", 2560, 1707, false, ""),
    g("gallery/experiences-17", "Chefs grilling under lights at an outdoor dinner", 2560, 1707, false, "Arenas del Mar"),
  ] },
  { key: "wildlife", label: "Wildlife and nature", images: [
    g("gallery/wildlife-01", "A hummingbird feeding at purple flowers", 2560, 1707, false, ""),
    g("gallery/wildlife-02", "Large monstera leaves in the rainforest", 2048, 1365, false, ""),
    g("gallery/wildlife-03", "A boat over turquoise water and reef, from above", 2560, 1437, false, ""),
    g("gallery/wildlife-04", "A resplendent quetzal in flight among cloud-forest trees", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/wildlife-05", "Guests on a boat watching the water", 2560, 1707, false, ""),
    g("gallery/wildlife-06", "Birders with telescopes and binoculars in the forest", 2560, 1707, false, "Senda Monteverde"),
    g("gallery/wildlife-07", "A beach between palm trees looking out to a small island", 1920, 2560, true, ""),
    g("gallery/wildlife-08", "A guide and guest using torches on a night walk", 2560, 1707, false, ""),
    g("gallery/wildlife-09", "A motmot perched on a branch", 1707, 2560, true, "Senda Monteverde"),
    g("gallery/wildlife-10", "A humpback whale breaching beside a whale-watching boat", 1632, 1360, true, ""),
    g("gallery/wildlife-11", "A guest beneath a waterfall in a rocky forest pool", 2560, 1707, false, ""),
    g("gallery/wildlife-12", "A rider on a white horse on a green hilltop in mist", 2560, 1440, false, ""),
    g("gallery/wildlife-13", "A sloth climbing a tree trunk", 2560, 1707, false, ""),
    g("gallery/wildlife-14", "A guide studying a frog on a leaf at night by torchlight", 2560, 1707, false, ""),
    g("gallery/wildlife-15", "A close view of a pleated palm leaf", 1707, 2560, true, ""),
    g("gallery/wildlife-16", "A sloth hanging in a tree", 2560, 1706, false, ""),
    g("gallery/wildlife-17", "Dolphins swimming beside a boat", 2560, 1707, false, ""),
    g("gallery/wildlife-18", "Birders looking up at a giant buttressed tree", 2560, 1707, false, "Senda Monteverde"),
  ] },
  { key: "people", label: "The people", images: [
    g("gallery/people-01", "A chef plating food in a hotel kitchen", 1200, 1800, true, "Arenas del Mar"),
    g("gallery/people-02", "Guests talking at a wooden bar", 1200, 800, true, ""),
    g("gallery/people-03", "A smiling server holding two green drinks on a tray", 1200, 1800, true, "Isla Palenque"),
    g("gallery/people-04", "Three groundskeepers standing in the forest", 1200, 1800, true, "Senda Monteverde"),
    g("gallery/people-05", "Two naturalist guides with a telescope on a forest trail", 1200, 800, true, "Senda Monteverde"),
    g("gallery/people-06", "A server carrying a breakfast tray through a garden", 1200, 1800, true, ""),
    g("gallery/people-07", "A host with a tablet in a hotel lobby", 1200, 800, true, "Arenas del Mar"),
    g("gallery/people-08", "A housekeeper making up a bed in a suite", 1200, 800, true, "Senda Monteverde"),
    g("gallery/people-09", "Hotel team members standing together outside the lodge", 1200, 800, true, "Senda Monteverde"),
    g("gallery/people-10", "A smiling driver at the wheel of a shuttle cart", 1200, 800, true, "Arenas del Mar"),
    g("gallery/people-11", "A bartender standing beside a garden bar", 1200, 800, true, ""),
    g("gallery/people-12", "Three chefs with a spread of dishes above the forest", 1200, 800, true, ""),
    g("gallery/people-13", "Two gardeners tending plants in a garden bed", 1200, 799, true, ""),
    g("gallery/people-14", "Staff sharing a meal together in a kitchen", 1200, 800, true, ""),
    g("gallery/people-15", "A boat captain smiling beside the water", 1200, 800, true, "Isla Palenque"),
    g("gallery/people-16", "A pastry chef at work in an open kitchen", 1200, 800, true, "Arenas del Mar"),
    g("gallery/people-17", "Two gardeners passing seedlings in a greenhouse", 1200, 800, true, ""),
  ] },
];

// Cayuga's offers now live in the Offer Ledger (lib/content/offers/offers.ts),
// each with its own ID. This maps them to the collection page's cards.
const cardOf = (x: Offer): CollectionOffer & { id: string } => ({
  id: x.id, hotel: x.name, program: x.program as CollectionOffer["program"], headline: x.headline, travel: x.travel.text, until: x.travel.to, note: x.conditions,
  image: x.image ? img(x.image.id.replace(`${F}/`, ""), x.image.alt, x.image.w, x.image.h, false) : CAYUGA.hero,
});
export const OFFERS = OFFER_LEDGER.filter((x) => x.collection === "cayuga-collection" && x.status === "Live").map(cardOf);
export const OFFER_PROGRAMS = [
  { name: "Worth Another Night" as const, line: "A free night on a shorter stay: three nights for the price of two, or four for three." },
  { name: "Time Rewarded" as const, line: "Stay five nights and the fifth is on the hotel, for the places that reward slowing down." },
];
/** Offers still open on a given day (build time for the static site). */
export const liveOffers = (today = new Date().toISOString().slice(0, 10)) => offersInCollection("cayuga-collection", today).map(cardOf);

/** The collection a stay belongs to, for the link on its stay page. */
export const collectionForStay = (slug: string) => (CAYUGA.hotels.some((h) => h.built && h.slug === slug) ? CAYUGA : undefined);

/** This stay's live Cayuga offer, if any, for its stay page. */
export const offerForStay = (slug: string) => {
  const h = CAYUGA.hotels.find((x) => x.slug === slug);
  return h ? liveOffers().find((x) => x.hotel === h.name) : undefined;
};
