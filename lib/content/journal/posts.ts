// The Journal: James's own stories, brought over from the Base44 library
// (Story records, "Wild Edit") one at a time and redesigned for the house.
// Each post carries its Ledger ID, the stays it is about (for cross-links
// both ways), its film when there is one, and the FAQs it answers on the
// page (and only those go into FAQPage schema).
//
// Body copy is James's library text, lightly edited for the site: library
// notes to the team are removed, and "James Wild & Co should" reads "we".
import { MONWANA_BODY } from "./monwana-couples-first-safari";
import { AFRICA_BODY } from "./africa-inspired-wild-and-co-safaris";
import { CAYUGA_BODY } from "./cayuga-collection-sustainable-luxury";
import { cayugaImg as cy } from "../collections/cayuga";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
// Full-resolution delivery: AI upscale for anything under ~2400px wide, then
// Cloudinary's best-quality JPEG. next/image takes the widths it needs.
const hi = (id: string, up = true) => `${CLD}/${up ? "e_upscale/" : ""}c_limit,w_3200/q_auto:best/f_jpg/${id}`;
const MON = "wildco/south-africa/monwana-thornybush";
const J = "/journal/monwana"; // James's own photographs and film, May 2026
const MORE = "jwco/journal/monwana-couples-first-safari"; // Monwana's own photographs (more.co.za)
const AFR = "jwco/journal/africa-inspired-wild-and-co-safaris";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
/** The licensed lion print, kept in Cloudinary's design-effects folder for every platform. */
export const LION_PRINT: JournalImage = { url: `${CLD}/e_upscale/c_limit,w_2400/q_auto:best/f_jpg/design-effects/lion-at-rest-print`, alt: "A male lion asleep with his head on his paws, in black and white", w: 964, h: 1403 };

export type JournalImage = { url: string; alt: string; w: number; h: number; caption?: string; video?: string; credit?: string };
export type JournalFigure = { after: string; layout: "bleed" | "wide" | "pair" | "tall"; images: JournalImage[] };
export type JournalPost = {
  slug: string;
  ledgerId: string;
  shelf: "Captain's Log" | "Field notes";
  title: string;
  seoTitle: string;
  description: string;
  dek: string;
  answer: string;
  place: string;
  trip?: string;
  published: string;
  modified: string;
  readMinutes?: number;
  hero: JournalImage;
  film?: { id: string; title: string; description: string; uploadDate: string; after: string };
  body: string;
  figures: JournalFigure[];
  pull?: { text: string; after: string; image?: JournalImage };
  close: string;
  faqs: { q: string; a: string }[];
  stays: { slug: string; name: string; line: string; note?: string; image: JournalImage }[];
  faqTitle?: string;
  planPlace?: string;
  links: { label: string; href: string; line: string }[];
  keywords: string[];
  about: string[];
  oldUrl?: string;
  approved?: boolean; // James's OK on the Proofs sheet; indexable once true
  youtube?: string;
};

export const POSTS: Record<string, JournalPost> = {
  "cayuga-collection-sustainable-luxury": {
    slug: "cayuga-collection-sustainable-luxury",
    ledgerId: "WED-2026-000007",
    shelf: "Field notes",
    title: "What the Cayuga Collection Gets Right About Sustainable Luxury",
    seoTitle: "Cayuga Collection: Sustainable Luxury Hotels in Central America",
    description: "James Papagno on the Cayuga Collection's seven sustainable boutique hotels in Costa Rica, Panama, Nicaragua and Guatemala, which suits whom, and how to judge a hotel's green claims.",
    dek: "More than three decades in Central America taught me what a sustainable hotel should actually prove. Here is what Cayuga gets right, which of its seven hotels suits whom, and what to ask before you book.",
    answer: "The Cayuga Collection is seven independently owned boutique hotels in Costa Rica, Panama, Nicaragua and Guatemala, launched in 2003 by Andrea Bonilla and Hans Pfister. What it gets right is people: local teams, year-round jobs, local sourcing and fewer single-use plastics, with each hotel keeping its own sense of place. Pair two or three, three or four nights each.",
    place: "Costa Rica · Panama · Nicaragua · Guatemala",
    published: "2026-09-22",
    modified: "2026-10-27",
    hero: { url: cy("arenas-del-mar/arenas-del-mar-01"), alt: "A rainforest headland meeting a turquoise beach at Manuel Antonio, from the air", w: 1200, h: 899 },
    body: CAYUGA_BODY,
    figures: [
      { after: "lead", layout: "bleed", images: [{ url: cy("aguas-claras/aguas-claras-11"), alt: "The Caribbean coast and reef near Playa Chiquita from the air", w: 1920, h: 1438, caption: "Costa Rica's Caribbean coast, near Aguas Claras.", credit: "Aguas Claras" }] },
      { after: "the-work-behind-the-awards", layout: "wide", images: [{ url: cy("gallery/experiences-04", false), alt: "A team of guides and hotel staff walking together outdoors at Senda Monteverde", w: 2560, h: 1707, caption: "The people are the point: the team at Senda Monteverde.", credit: "Cayuga Collection" }] },
      { after: "what-is-the-cayuga-collection", layout: "pair", images: [
        { url: cy("aguas-claras/aguas-claras-02"), alt: "A wooden Caribbean-style cottage among banana leaves at Aguas Claras", w: 1920, h: 1280, caption: "Aguas Claras feels like the Caribbean coast.", credit: "Aguas Claras" },
        { url: cy("senda-monteverde/senda-monteverde-06", false), alt: "A guest with coffee on a balcony in the cloud forest at Senda Monteverde", w: 2880, h: 1921, caption: "Senda feels rooted in the cloud forest.", credit: "Senda Monteverde" },
      ] },
      { after: "what-does-sustainable-luxury-mean-here", layout: "wide", images: [{ url: cy("isla-palenque/isla-palenque-03"), alt: "A thatched open pavilion in the island forest on Isla Palenque", w: 1500, h: 1000, caption: "Built light, in the forest, on Isla Palenque.", credit: "Isla Palenque" }] },
      { after: "why-cayuga-s-focus-on-people-matters", layout: "pair", images: [
        { url: cy("gallery/people-05"), alt: "Two naturalist guides with a telescope on a forest trail at Senda Monteverde", w: 1200, h: 800, caption: "A guide who knows the forest personally.", credit: "Cayuga Collection" },
        { url: cy("gallery/people-15"), alt: "A boat captain smiling beside the water at Isla Palenque", w: 1200, h: 800, caption: "A career built without leaving home, on Isla Palenque.", credit: "Cayuga Collection" },
      ] },
      { after: "how-should-you-combine-the-properties", layout: "pair", images: [
        { url: cy("gallery/wildlife-04", false), alt: "A resplendent quetzal in flight among cloud-forest trees at Senda Monteverde", w: 2560, h: 1707, caption: "A quetzal in the cloud forest above Senda.", credit: "Cayuga Collection" },
        { url: cy("gallery/beachfront-05", false), alt: "A mother and small child playing in the surf at sunset at Arenas del Mar", w: 1712, h: 2560, caption: "Then the beach at Manuel Antonio.", credit: "Cayuga Collection" },
      ] },
      { after: "which-cayuga-hotel-fits-which-traveler", layout: "bleed", images: [{ url: cy("kura/kura-06"), alt: "Kura's infinity pool deck looking over the Pacific", w: 1024, h: 683, caption: "Kura, above Uvita: adults only, and the Pacific to yourself.", credit: "Kura" }] },
      { after: "why-central-america-still-matters-to-me", layout: "bleed", images: [{ url: cy("aguas-claras/aguas-claras-05", false), alt: "A swimmer in a clear tide pool on the reef at Playa Chiquita", w: 5000, h: 3333, caption: "The reef at Playa Chiquita, at low tide.", credit: "Aguas Claras" }] },
    ],
    pull: { text: "Luxury becomes more meaningful when the people who welcome you and the place that holds you are both better for your having stayed.", after: "planning-a-cayuga-journey" },
    close: "James Papagno",
    faqTitle: "Questions About the Cayuga Collection",
    planPlace: "Central America",
    faqs: [
      { q: "How many hotels are currently in the Cayuga Collection?", a: "Cayuga's current official hotel page presents seven properties across Costa Rica, Panama, Nicaragua and Guatemala. Collection membership can change, so confirm the current roster before booking." },
      { q: "Which Cayuga hotel is best for a honeymoon?", a: "Kura is the clearest adults-only choice for privacy and ocean views. Aguas Claras can suit couples drawn to art and Caribbean culture, while Isla Palenque offers a more remote island experience." },
      { q: "Which Cayuga hotels are best for families?", a: "Arenas del Mar is a strong first choice for an accessible Costa Rica family trip. Senda Monteverde can suit active families, and Isla Palenque works for those wanting nature and island time. Always confirm current age and room-occupancy policies." },
      { q: "Can I combine several Cayuga properties?", a: "Yes. Two contrasting properties in one country usually create the best-paced journey. Allow at least three nights in each and account for road, boat or domestic-flight connections." },
      { q: "How long has James Papagno known the Cayuga Collection's founders?", a: "James has followed the Cayuga team and co-founder Hans Pfister since 2003, the year Hans and Andrea Bonilla launched Cayuga Hospitality, and has always been inspired by their commitment to hospitality and sustainability." },
      { q: "What awards has the Cayuga Collection won?", a: "The Cayuga Collection won the WTTC Tourism for Tomorrow People award in 2018 and a Travel + Leisure Global Vision Award in 2022. In the 2026 MICHELIN Guide selection, Kura and Aguas Claras each hold one MICHELIN Key, and Isla Palenque was named a National Geographic Unique Lodge of the World in 2019." },
      { q: "Does the Cayuga Collection have special offers?", a: "Yes, each hotel runs its own. For example, Kura offers stay 4 nights, pay 3 on travel until 19 December 2026. The 2027 offers are being updated, so ask James Wild & Co for the current terms before you book." },
      { q: "How can I verify whether a hotel is genuinely sustainable?", a: "Look beyond marketing language. Ask about local employment, wastewater, energy, food sourcing, plastic use, habitat protection, community partnerships and independent certification. Clear, specific answers are more useful than broad claims." },
    ],
    stays: [
      { slug: "arenas-del-mar-resort", name: "Arenas del Mar", line: "Manuel Antonio, Costa Rica", note: "Rainforest beside the beach. Families and first-timers.", image: { url: cy("arenas-del-mar/arenas-del-mar-04"), alt: "A suite with a daybed and an outdoor plunge pool at Arenas del Mar", w: 1200, h: 800 } },
      { slug: "kura-boutique-resort", name: "Kura", line: "Uvita, Costa Rica", note: "Adults only, above the Pacific. Couples and honeymooners.", image: { url: cy("kura/kura-01"), alt: "A guest in Kura's infinity pool above the Pacific coast at Uvita", w: 1024, h: 683 } },
      { slug: "senda-monteverde-lodge", name: "Senda Monteverde", line: "Monteverde, Costa Rica", note: "Cloud forest. Curious travellers and birders.", image: { url: cy("senda-monteverde/senda-monteverde-01", false), alt: "Senda Monteverde's hot pools set in the cloud forest, from above", w: 2560, h: 1440 } },
      { slug: "aguas-claras", name: "Aguas Claras", line: "Playa Chiquita, Costa Rica", note: "The Caribbean coast. Couples and creative travellers.", image: { url: cy("aguas-claras/aguas-claras-01"), alt: "The pool among tropical gardens below the main house at Aguas Claras at dusk", w: 1920, h: 1280 } },
      { slug: "isla-palenque-resort", name: "Isla Palenque", line: "Gulf of Chiriquí, Panama", note: "A private island. Families and couples.", image: { url: cy("isla-palenque/isla-palenque-05"), alt: "An open-sided thatched lounge looking through palms to the sea on Isla Palenque", w: 1000, h: 751 } },
    ],
    links: [
      { label: "The Cayuga Collection", href: "/collections/cayuga-collection", line: "All seven hotels, who each suits and how to pair them." },
      { label: "Costa Rica", href: "/destinations/central-america/costa-rica", line: "Where the house began: every Costa Rica stay in the Ledger." },
      { label: "The Original Costa Route", href: "/overland/costa-rica/the-original-costa-route-7-days", line: "James's 7- and 10-day routes on Cayuga hotels, with a board waiting." },
      { label: "Two Oceans, One Volcano", href: "/overland/costa-rica/two-oceans-one-volcano", line: "James's Costa Rica route, coast to coast." },
      { label: "Meet James", href: "/about/founder", line: "Forty-four years on the road, Central America since the early days." },
    ],
    keywords: ["sustainable luxury hotels Central America", "Cayuga Collection hotels", "sustainable hotels Costa Rica", "eco luxury Central America", "sustainable boutique hotels", "Cayuga Collection Costa Rica", "Kura Uvita", "Arenas del Mar", "Senda Monteverde", "Isla Palenque"],
    about: ["Cayuga Collection", "Sustainable luxury hotels", "Costa Rica", "Central America"],
    oldUrl: "/memoir/james-papagno-on-the-cayuga-collection-and-central-americas-sustainable-travel-renaissance",
  },
  "africa-inspired-wild-and-co-safaris": {
    slug: "africa-inspired-wild-and-co-safaris",
    ledgerId: "WED-2026-000002",
    shelf: "Captain's Log",
    title: "Africa Changed the Way I Travel",
    seoTitle: "How Africa Inspired Wild & Co Safaris: James Papagno's Story",
    description: "One journey into the Kalahari changed everything. James Papagno on Tswalu in 2012, the guide who taught him to read the land, and why he built Wild & Co Safaris.",
    dek: "It began in the Kalahari in 2012, with a guide who taught me to read the land. Years later, a chance reunion in the bush, and the safari house that grew out of both.",
    answer: "James Papagno's first great safari was at Tswalu Kalahari in 2012, tracking white rhino on foot with guide Joffers McCormick and finding a pangolin, lions hunting oryx and a brown hyena. That trip taught him the guide matters more than the lodge, and it led to Wild & Co Safaris: private, advisor-led African safaris planned around the traveller.",
    place: "Tswalu · the Kalahari · South Africa",
    trip: "2012 and 2018",
    published: "2026-09-22",
    modified: "2026-10-27",
    hero: { url: hi(`${AFR}/hero-leopard-log`), alt: "A leopard resting on a fallen log in long grass at golden hour", w: 1600, h: 900 },
    body: AFRICA_BODY,
    figures: [
      { after: "lead", layout: "bleed", images: [{ url: hi(`${AFR}/tswalu-loapi-kalahari-hills`), alt: "A daybed on the Loapi deck at Tswalu looking out over the Kalahari grassland to the Korannaberg hills", w: 1620, h: 1080, caption: "The Kalahari from Tswalu, where it started.", credit: "Photograph: Tswalu" }] },
      { after: "the-journey-that-started-it", layout: "pair", images: [
        { url: hi("wildco/partners/feline-fields/lodge/fl-07"), alt: "A guide leading guests in single file on a walking safari across golden grassland", w: 1660, h: 1040, caption: "On foot, single file. The guide reads the ground before anyone else sees a thing.", credit: "Feline Fields, Botswana" },
        { url: hi("wildco/south-africa/madikwe-wildlife/white-rhino-game-drive-madikwe"), alt: "A white rhino grazing beside an open game vehicle", w: 1600, h: 900, caption: "White rhino, close enough to hear it graze.", credit: "Madikwe, South Africa" },
      ] },
      { after: "why-the-right-safari-guide-matters", layout: "bleed", images: [{ url: hi("wildco/botswana/hero/qorokwe-lions-game-drive"), alt: "A pride of lions resting in the grass beside an open game vehicle at sunset", w: 1277, h: 850, caption: "Knowing when to wait. The lions decided when we'd leave.", credit: "Qorokwe, Okavango Delta" }] },
      { after: "returning-to-africa-with-my-daughter", layout: "pair", images: [
        { url: hi("wildco/south-africa/madikwe-wildlife/family-game-drive-madikwe"), alt: "A family on an open game vehicle with their guide and tracker", w: 1400, h: 699, caption: "A first safari, seen through someone else's eyes.", credit: "Madikwe, South Africa" },
        { url: hi("wildco/tanzania/serengeti-south/charlie-southwest-serengeti/charlie-southwest-serengeti-game-drive", false), alt: "An open game vehicle crossing the short-grass plains of the southern Serengeti", w: 2400, h: 1479, caption: "Then north to Tanzania and the Serengeti.", credit: "Southern Serengeti, Tanzania" },
      ] },
      { after: "returning-to-africa-with-my-daughter", layout: "wide", images: [{ url: hi("wildco/south-africa/kapama/reserve/kapama-leopard-drinking"), alt: "A leopard drinking at a waterhole", w: 1600, h: 1080, caption: "The leopard who keeps everyone quiet in the vehicle.", credit: "Kapama, Greater Kruger" }] },
      { after: "from-wild-earth-stays-to-wild-co-safaris", layout: "pair", images: [
        { url: hi("wildco/botswana/hero/xaranna-mokoro"), alt: "A poler guiding a mokoro canoe through the reeds of the Okavango Delta", w: 1920, h: 1280, caption: "Time beside the waterways of Botswana: by mokoro.", credit: "Okavango Delta, Botswana" },
        { url: hi("wildco/partners/feline-fields/lodge/fl-08"), alt: "A rider on horseback talking with her guide in the bush at sunset", w: 1620, h: 1040, caption: "Or on horseback, for those who'd rather not sit still.", credit: "Feline Fields, Botswana" },
      ] },
      { after: "what-makes-a-wild-co-safari-different", layout: "wide", images: [{ url: hi("wildco/botswana/hero/qorokwe-sundowner-elephants"), alt: "Guests at a sundowner by the water as elephants cross behind them", w: 1275, h: 850, caption: "The sundowner. Most of the planning happens here, honestly.", credit: "Qorokwe, Okavango Delta" }] },
      { after: "africa-is-not-a-once-in-a-lifetime-place", layout: "bleed", images: [{ url: hi("wildco/botswana/helicopter-horizons/hh-elephant-aerial"), alt: "A herd of elephants wading through the Okavango Delta seen from above", w: 1200, h: 787, caption: "The Okavango from the air. One more reason to come back.", credit: "Helicopter Horizons, Botswana" }] },
    ],
    pull: { text: "Every journey to Africa has taught me something, but the most important lesson is simple: Africa does not give you a reason to visit once. It gives you a reason to keep coming back.", after: "begin-your-african-story", image: LION_PRINT },
    close: "James Papagno",
    faqTitle: "Questions About Wild & Co Safaris",
    planPlace: "Africa",
    faqs: [
      { q: "What is Wild & Co Safaris?", a: "Wild & Co Safaris is the African safari house of James Wild & Co. It plans personalized, advisor-led safaris with experienced guides, carefully selected camps and detailed destination knowledge." },
      { q: "Who founded Wild & Co Safaris?", a: "James Papagno, founder of James Wild & Co. He has 44 years of travel behind him, has designed journeys since 1983 and has been on safari across Africa since 2011." },
      { q: "Does Wild & Co Safaris offer private safaris?", a: "Yes. Wild & Co Safaris specializes in personalized and privately designed African journeys for couples, families, honeymooners, small groups and returning safari travelers." },
      { q: "Which African destinations can Wild & Co Safaris plan?", a: "Journeys may include South Africa, Botswana, Kenya, Tanzania, Zambia, Zimbabwe, Namibia, Rwanda, Madagascar, the Seychelles and other carefully selected regions across Africa." },
      { q: "How does the safari-planning process begin?", a: "It begins with a conversation about your interests, preferred pace, travel history, wildlife priorities and the kind of experience you want. From there, Wild & Co Safaris recommends the right destinations, season, camps and journey structure." },
      { q: "Why does the safari guide matter so much?", a: "The guide connects everything: when to wait, when to move, what the tracks mean and how the land, weather and wildlife fit together. James's first great safari, at Tswalu in 2012, was shaped by his guide more than by the lodge." },
    ],
    stays: [
      { slug: "tswalu-reserve", name: "Tswalu Kalahari", line: "The Kalahari, South Africa", note: "Where it started, in 2012. Still one of James's favourite places in the world.", image: { url: hi(`${AFR}/tswalu-loapi-kalahari-hills`), alt: "The Loapi deck at Tswalu over the Kalahari", w: 1620, h: 1080 } },
      { slug: "singita-ebony", name: "Singita Ebony Lodge", line: "Sabi Sand, Greater Kruger", note: "On the 2018 safari with his daughter.", image: { url: `${B44}/687cecf9a_26e2d6372_69d3c74c8c6ac8a1bc2a8b75_SingitaEbonyLodge_FireDeck_RossCouper.jpg`, alt: "The fire deck at Singita Ebony Lodge above the Sand River", w: 1600, h: 1067 } },
      { slug: "singita-boulders", name: "Singita Boulders", line: "Sabi Sand, Greater Kruger", note: "On the 2018 safari with his daughter.", image: { url: `${B44}/b33f9c716_80ac67848_69cf70352224b2c3b7563d5e_SingitaBouldersLodge_SuitePool.jpg`, alt: "A suite and its pool at Singita Boulders Lodge, Sabi Sand", w: 1600, h: 1067 } },
      { slug: "ngala-safari-lodge-by-beyond", name: "Ngala Safari Lodge", line: "Timbavati, Greater Kruger", note: "On the 2018 safari with his daughter.", image: { url: `${B44}/301472440_1bf9b77a5_6942909e4d2140c1851a2362_South-Africa-Ngala-Safari-Lodge-Outdoor-view-of-evening.`, alt: "Dinner by the pool at Ngala Safari Lodge at dusk", w: 1600, h: 1067 } },
    ],
    links: [
      { label: "Wild & Co Safaris", href: "/safaris", line: "Private, advisor-led safaris across Africa." },
      { label: "South Africa", href: "/destinations/africa/south-africa", line: "Every stay and reserve the house has vetted in South Africa." },
      { label: "Wild Together at Monwana", href: "/journal/monwana-couples-first-safari", line: "James's wife's first safari, in Thornybush." },
      { label: "Meet James", href: "/about/founder", line: "Forty-four years on the road, safaris since 2011." },
    ],
    keywords: ["African safari planning", "Wild & Co Safaris", "private African safaris", "luxury safari planning", "South Africa safari", "Tswalu Kalahari", "experienced safari planner", "personalized African safari", "safari guide"],
    about: ["African safari planning", "Tswalu Kalahari", "Wild & Co Safaris", "Safari guiding"],
    oldUrl: "/memoir/africa-inspired-wild-and-co-safaris",
  },
  "monwana-couples-first-safari": {
    slug: "monwana-couples-first-safari",
    ledgerId: "WED-2026-000013",
    shelf: "Captain's Log",
    title: "Wild Together: My Wife's First Safari at Monwana",
    seoTitle: "Monwana Safari Review: My Wife's First Safari in Thornybush",
    description: "Why intimate Monwana in Thornybush suited my wife's first safari, with practical advice for couples planning Greater Kruger: nights, seasons, flights and what to ask.",
    dek: "My wife's first safari reminded me that the wild becomes new when you share it. Why this small Thornybush lodge works so well for couples, and what first-timers should know.",
    answer: "Monwana suits a couple's first safari because it is small: six suites and a villa for 24 guests at most, open vehicles that carry no more than six, and twice-daily drives with a guide and tracker in Thornybush, on an unfenced boundary with Greater Kruger. Stay three nights at least; four is better. Hoedspruit is about 45 minutes away.",
    place: "Monwana · Thornybush · South Africa",
    trip: "May 2026",
    published: "2026-09-15",
    modified: "2026-10-27",
    hero: { url: `${J}/james-miriam-game-drive.jpg`, alt: "James Papagno and his wife in a Monwana game vehicle on Thornybush, morning light", w: 2576, h: 1932 },
    film: {
      id: "YR_8uiBObZ4",
      title: "Wild Together: My Wife's First Safari, Monwana, Thornybush",
      description: "My wife's first safari, filmed on location at Monwana in Thornybush Private Game Reserve, Greater Kruger: the intimate, guide-led stay we recommend to couples and honeymooners on a first safari.",
      uploadDate: "2026-09-23",
      after: "why-did-i-choose-monwana-for-my-wife-s-first-safari",
    },
    body: MONWANA_BODY,
    figures: [
      { after: "lead", layout: "pair", images: [
        { url: `${J}/miriam-first-drive.jpg`, alt: "James's wife wrapped in a blanket on the back row of the game vehicle on her first morning drive", w: 1932, h: 2576, caption: "Her first morning drive. The blankets are not for show." },
        { url: `${J}/coffee-stop-james.jpg`, alt: "James at the coffee stop beside the Monwana game vehicles on Thornybush", w: 1932, h: 2576, caption: "The coffee stop. A splash of Amarula is traditional, apparently." },
      ] },
      { after: "what-changes-when-you-share-a-safari-as-a-couple", layout: "bleed", images: [{ url: hi(`${MORE}/more-main-lodge-05`, false), alt: "Monwana's main lodge reflected in the dam at dusk, Thornybush", w: 3000, h: 2000, caption: "The main lodge at dusk.", credit: "Photograph: Monwana" }] },
      { after: "what-is-monwana-actually-like", layout: "pair", images: [
        { url: hi(`${MORE}/more-villa-16`, false), alt: "The exclusive-use villa at Monwana under its thatched gable", w: 3000, h: 2000, caption: "The villa: your own house, your own vehicle.", credit: "Photograph: Monwana" },
        { url: `${J}/main-lodge-interior.jpg`, alt: "The main lodge at Monwana with a telescope by the door and the bar beyond", w: 1932, h: 2576, caption: "Inside the main lodge. The telescope is for later." },
      ] },
      { after: "does-a-quieter-private-reserve-mean-less-wildlife", layout: "tall", images: [
        { url: `${J}/lion-on-the-road-poster.jpg`, video: `${J}/lion-on-the-road.mp4`, alt: "A male lion walking down the sand road towards the game vehicle at dawn on Thornybush", w: 720, h: 1280, caption: "Dawn on Thornybush. He had the road; we had the good sense to wait." },
        { url: `${J}/lion-thornybush.jpg`, alt: "A male lion resting in the grass in early light on Thornybush", w: 1512, h: 2016, caption: "Later, close enough to count the scars." },
      ] },
      { after: "how-many-nights-should-couples-stay-at-monwana", layout: "tall", images: [
        { url: `${J}/nyala-plunge-pool.jpg`, alt: "A nyala ewe and her calf grazing beside the suite's plunge pool at Monwana", w: 1932, h: 2576, caption: "Midday visitors at the plunge pool." },
        { url: `${J}/miriam-suite-afternoon.jpg`, alt: "James's wife resting in their suite at Monwana between drives", w: 1932, h: 2576, caption: "The afternoon pause, taken seriously." },
      ] },
      { after: "what-should-first-time-safari-travelers-expect-each-day", layout: "pair", images: [
        { url: `${J}/breakfast-deck.jpg`, alt: "Breakfast on the deck at Monwana: fruit, honeycomb, preserves and pastries", w: 1932, h: 2576, caption: "Breakfast after the morning drive." },
        { url: hi(`${MORE}/more-main-lodge-39`, false), alt: "Guests at dinner on the Monwana deck by the fire under the trees", w: 3000, h: 2000, caption: "Dinner, outside.", credit: "Photograph: Monwana" },
      ] },
      { after: "when-is-the-best-time-to-visit-thornybush", layout: "bleed", images: [{ url: `${J}/sundowner-tree.jpg`, alt: "A bird in a dead tree silhouetted against the sunset over Thornybush", w: 2016, h: 1512, caption: "Sundowner, Thornybush. May, dry season." }] },
      { after: "is-monwana-right-for-every-couple", layout: "wide", images: [{ url: hi(`${MORE}/more-monwana-og`), alt: "The boardwalk over the water garden to the entrance of Monwana", w: 1976, h: 1317, caption: "The way in.", credit: "Photograph: Monwana" }] },
    ],
    pull: { text: "Safari had already taught me how to look at the wild. Watching my wife discover it taught me how much more we see when wonder is shared.", after: "what-did-my-wife-s-first-safari-teach-me", image: LION_PRINT },
    close: "James Papagno",
    faqs: [
      { q: "Is Monwana good for a first safari?", a: "Yes. Its small guest capacity, vehicles limited to six guests and guided twice-daily drives can make the experience approachable and personal. Wildlife sightings can never be guaranteed." },
      { q: "How many nights should a couple spend at Monwana?", a: "Three nights is a practical minimum. Four nights offers a better balance of game drives, rest and flexibility." },
      { q: "Is Monwana inside Kruger National Park?", a: "No. Monwana is in Thornybush Nature Reserve, which shares an unfenced boundary with the Greater Kruger ecosystem." },
      { q: "Can couples request a private safari vehicle?", a: "Private vehicle arrangements may be available, and the exclusive-use villa includes a private safari setup according to current lodge information. Confirm availability and cost for the specific booking." },
      { q: "What is the best season for Monwana?", a: "The lodge operates year-round. May through September is generally drier with thinner vegetation; October through April is warmer, greener and particularly rewarding for birding." },
      { q: "How far is Monwana from Hoedspruit Airport?", a: "The lodge currently states approximately 45 minutes by road and provides complimentary airport transfers. Confirm this with the final flight itinerary." },
      { q: "Is Thornybush a malaria area?", a: "Yes. The lodge describes the area as low risk, but travelers should seek current advice from a qualified medical professional about prevention and medication." },
      { q: "Can children stay at Monwana?", a: "Current lodge guidance permits children aged ten and older in the lodge suites. The exclusive-use villa welcomes children of all ages. Reconfirm age policies before booking." },
    ],
    stays: [{ slug: "monwana-thornybush", name: "Monwana", line: "Thornybush, Greater Kruger · six suites and a villa", note: "Vetted in person by James, May 2026. The suites, the rates, the film and his verdict are on the stay page.", image: { url: hi(`${MON}/elephant-thornybush-monwana`), alt: "An elephant bull on the Thornybush reserve near Monwana", w: 1920, h: 1281 } }],
    links: [
      { label: "Monwana, the stay", href: "/stays/monwana-thornybush", line: "Suites, rates, the film and James's verdict." },
      { label: "South Africa", href: "/destinations/africa/south-africa", line: "Every stay and reserve the house has vetted in South Africa." },
      { label: "Wild & Co Safaris", href: "/safaris", line: "Private guided safaris, built around the right lodges." },
      { label: "Meet James", href: "/about/founder", line: "Forty-four years on the road, safaris since 2011." },
    ],
    keywords: ["Monwana safari review", "couples safari South Africa", "Thornybush safari", "first safari in South Africa", "Greater Kruger safari lodge", "private game reserve for couples", "luxury safari for couples", "Monwana Game Lodge", "South Africa honeymoon safari"],
    about: ["Monwana", "Thornybush Nature Reserve", "Greater Kruger", "Couples safari"],
    oldUrl: "/memoir/monwana-couples-first-safari",
    approved: true, // James, 27 Oct 2026
    youtube: "https://www.youtube.com/watch?v=YR_8uiBObZ4",
  },
};

export const POST_LIST = Object.values(POSTS).sort((a, b) => b.published.localeCompare(a.published));
export const postsForStay = (slug: string) => POST_LIST.filter((p) => p.stays.some((s) => s.slug === slug));
export const journalPath = (slug: string) => `/journal/${slug}`;
