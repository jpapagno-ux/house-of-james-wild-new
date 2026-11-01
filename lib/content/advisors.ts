// The house's advisors: cards on /about/team and a profile page each at
// /advisors/[slug]. Snapshot until the advisor feed exists in the library
// (no Advisor/Person records filed yet, 25 Oct 2026); then this file is
// generated from it.
//
// Sources: the old Wild Earth Stays team page (/team) and the Base44 advisor
// sample (sampleAdvisorsContent.js). Albert Alvarez and Carlos Alger are new:
// names only until James sends titles, photos and bios. Rules:
//  - titles and specialties show only once approved (none approved yet);
//  - destination expertise is never inferred from a single trip;
//  - a profile page is built only when a bio is filed; until then the card
//    says the profile is on its way and offers the planning form;
//  - James's card opens /about/founder, so there's one page about him.
// Public fields only: no personal email or phone numbers here.

import { SAMPLE_DESKS, samplePortrait } from "./advisor-samples";
import { deskCounts, type DeskProfile, type Volume } from "./advisor-desk";

export type Advisor = {
  slug: string;
  name: string;
  firstName: string;
  role: string;
  roleApproved: boolean;
  portrait: { url: string; alt: string } | null;
  intro: string | null; // one line for the card
  bio: string[]; // profile paragraphs; empty = profile not built yet
  line?: string | null; // a line in their own words, once approved
  specialties: string[]; // approved only
  traveled: { place: string; year?: number }[]; // stated first-hand trips
  profileHref: string | null;
  ledgerId: string; // Person.ledger_id in the Intelligence Library (ADV-…), the Library being the sole issuer (Contract C2); James's 1982 ID is the one grandfathered exception
  sample?: boolean; // invented to show the layout; labelled as such everywhere
  desk?: DeskProfile; // the Advisor Desk: ID, marks, entries carried, folios
};

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const ADVISORS: Advisor[] = [
  {
    slug: "james-papagno",
    ledgerId: "ADV-1982-000001",
    name: "James Papagno",
    firstName: "James",
    role: "Founder & Chief Expedition Officer",
    roleApproved: true,
    portrait: { url: `${CDN}/67d1f755299cb464729f3b18_team-james.avif`, alt: "Portrait of James Papagno, founder of James Wild & Co" },
    intro: "Forty-four years on the road, and still the one who goes first. Every entry in the Ledger is held to his standard.",
    bio: [],
    specialties: [],
    traveled: [],
    profileHref: "/about/founder",
    // The founder's own Desk: ADV-0001. Every entry is a place James has stated
    // he stayed at or walked, with the year; the marks are his own. While the
    // house is in testing he is the advisor on every page (DEFAULT_ADVISOR).
    desk: {
      adv: "ADV-1982-000001", sample: false, since: 1983, joined: 2026, agency: "James Wild & Co", base: "Miami, Florida", languages: ["English"],
      volumes: ["safaris", "stays", "voyages", "gatherings", "overland", "europe"],
      countries: ["south-africa", "botswana", "tanzania", "kenya", "zambia", "indonesia", "tahiti", "mexico", "utah"],
      specialties: ["First safaris", "Private reserves", "Small ships & sailing yachts", "Islands & reefs", "Family gatherings", "Routes by road"],
      line: "I don't send anyone somewhere I wouldn't go back to. The Ledger is that list.",
      entries: [
        { ledgerId: "STY-2026-056524", name: "Wilderness DumaTau", place: "Linyanti · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26", note: "Elephants cross the channel at four. Nobody is late for that." },
        { ledgerId: "STY-2026-000347", name: "Wilderness Mombo Camp", place: "Okavango Delta · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026 }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-403235", name: "Wilderness Qorokwe", place: "Okavango Delta · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026 }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-000171", name: "Monwana", place: "Thornybush · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26", note: "Eight suites. The elephant at the waterhole arrived at five, as if he had a reservation." },
        { ledgerId: "STY-2026-290658", name: "Lion Sands Ivory Lodge", place: "Sabi Sand · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-000293", name: "Kirkman's Kamp", place: "Sabi Sand · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-000075", name: "Ellerman House", place: "Cape Town · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "stays", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-000148", name: "Leeu Estates", place: "Franschhoek · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "stays", james: { mark: "I've Walked It", year: 2026 }, theirs: { mark: "Walked It", when: "May 2026" }, guests: 0, folios: [], last: "May 26", note: "Every Leeu property, walked in one visit. Wine first, then bush." },
        { ledgerId: "STY-2026-119083", name: "Jaci's Private Lodge", place: "Madikwe · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "gatherings", james: { mark: "I Know the Host", year: 2026 }, theirs: { mark: "Walked It", when: "May 2026" }, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-950299", name: "Morukuru Farm House", place: "Madikwe · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "gatherings", james: { mark: "I Know Who Knows", year: 2026 }, theirs: null, guests: 0, folios: [], last: "May 26" },
        { ledgerId: "STY-2026-138258", name: "Tswalu Kalahari", place: "Kalahari · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2012, favourite: true }, theirs: { mark: "Stayed", when: "2012" }, guests: 0, folios: [], last: "2012" },
        { ledgerId: "STY-2026-000248", name: "Singita Faru Faru", place: "Grumeti · Tanzania", href: null, countrySlug: "tanzania", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2018, favourite: true }, theirs: { mark: "Stayed", when: "2012 & 2018" }, guests: 0, folios: [], last: "2018" },
        { ledgerId: "STY-2026-000066", name: "Cottar's 1920s Camp & Bush Villa", place: "Maasai Mara · Kenya", href: null, countrySlug: "kenya", regionSlug: "africa", volume: "gatherings", james: { mark: "I've Walked It" }, theirs: { mark: "Walked It" }, guests: 0, folios: [], last: "—" },
        { ledgerId: "STY-2026-000152", name: "Lewa House", place: "Laikipia · Kenya", href: null, countrySlug: "kenya", regionSlug: "africa", volume: "safaris", james: { mark: "I've Walked It" }, theirs: { mark: "Walked It" }, guests: 0, folios: [], last: "—" },
        { ledgerId: "STY-2026-882896", name: "Aliikai", place: "Raja Ampat · Indonesia", href: null, countrySlug: "indonesia", regionSlug: "asia", volume: "voyages", james: { mark: "I Keep Going Back", year: 2024, favourite: true }, theirs: { mark: "Sailed It", when: "Nov 2024" }, guests: 0, folios: [], last: "Nov 24", note: "Phinisi, eight guests, the best reef on earth under the hull. Sailed it with Anthony." },
        { ledgerId: "STY-2026-000213", name: "Vahine Private Island", place: "Taha'a · Tahiti", href: null, countrySlug: "tahiti", regionSlug: "oceania", volume: "stays", james: { mark: "I've Walked It", year: 2025 }, theirs: { mark: "Walked It", when: "2025" }, guests: 0, folios: [], last: "2025", note: "Taha'a is my favourite in Tahiti, and Tahiti is my favourite." },
      ],
      folios: [],
    },
  },
  {
    slug: "kristina-larson",
    ledgerId: "ADV-2026-000001",
    name: "Kristina Larson",
    firstName: "Kristina",
    role: "Travel Advisor",
    roleApproved: false,
    portrait: { url: `${CDN}/67d1f7cf2472ef3857bb48dd_team-kristina.avif`, alt: "Portrait of Kristina Larson, travel advisor at James Wild & Co" },
    intro: "Drawn to local cultures, outdoor adventures and the people you meet along the way.",
    bio: [
      "Kristina grew up watching her father, James, head off somewhere new and come home with stories. The travel habit stuck. She's drawn to local cultures, outdoor adventures and the connections that turn a trip into something you keep.",
      "Away from travel she runs a high-end catering business in Palm Beach, which means she notices the things that make a stay feel looked after: the table, the timing, the small touches nobody asked for.",
      "She also works with the house's content team, so she knows the Ledger's stays from the inside.",
    ],
    specialties: [],
    traveled: [],
    profileHref: "/advisors/kristina-larson",
  },
  {
    slug: "anthony-papagno",
    ledgerId: "ADV-2026-000002",
    name: "Anthony Papagno",
    firstName: "Anthony",
    role: "Travel Advisor · Nature & Wildlife",
    roleApproved: true,
    portrait: { url: `${CDN}/67d1f822a724915185466057_team-anthony.avif`, alt: "Portrait of Anthony Papagno, travel advisor at James Wild & Co" },
    intro: "James's son. Nature, wildlife and the trail: Indonesia, the Galápagos and Costa Rica so far, and he's following his father's footsteps.",
    bio: [
      "Anthony is James's son, and he grew up watching his father leave for somewhere wild and come back with a story. Then he started going himself. He travels for nature, wildlife and the walk in: the trail, the reef, the forest at first light.",
      "He has been to Indonesia, the Galápagos and Costa Rica. In November 2024 he sailed Raja Ampat aboard the yacht Aliikai with James, which sharpened what he already knew: the best of a place is usually just past where most people stop.",
      "He plans the journeys he would take himself: a boat you can jump off, a lodge with a trail from the door, a guide who knows the birds by call. He also works with the house's content team on the stories behind the Ledger.",
    ],
    specialties: ["Nature & wildlife", "Hikes & trails", "Islands & reefs", "Rainforest & cloud forest", "Small ships & sailing yachts"],
    traveled: [
      { place: "Raja Ampat, Indonesia, aboard Aliikai", year: 2024 },
      { place: "The Galápagos" },
      { place: "Costa Rica" },
    ],
    profileHref: "/advisors/anthony-papagno",
    desk: {
      adv: "ADV-2026-000002", sample: false, since: 2024, joined: 2026, agency: null, base: "Palm Beach, Florida", languages: ["English"],
      volumes: ["voyages", "stays", "overland"], countries: ["indonesia", "ecuador-galapagos", "costa-rica"],
      specialties: ["Nature & wildlife", "Hikes & trails", "Islands & reefs", "Rainforest & cloud forest", "Small ships & sailing yachts"],
      line: "The best of a place is usually just past where the itinerary stops.",
      // Entries carry only what Anthony has stated first-hand; the Galápagos and Costa Rica are on his record as places, not yet as marked stays.
      entries: [{ ledgerId: "STY-2026-882896", name: "Aliikai", place: "Raja Ampat · Indonesia", href: null, countrySlug: "indonesia", regionSlug: "asia", volume: "voyages", james: { mark: "I Know a Place", year: 2024, favourite: true }, theirs: { mark: "Sailed It", when: "Nov 2024" }, guests: 0, folios: [], last: "—" }],
      folios: [],
    },
  },
  {
    slug: "albert-alvarez",
    ledgerId: "ADV-2026-000003",
    name: "Albert Alvarez",
    firstName: "Albert",
    role: "Travel Advisor",
    roleApproved: false,
    portrait: null,
    intro: null,
    bio: [],
    specialties: [],
    traveled: [],
    profileHref: null,
  },
  {
    slug: "sofia-marchetti",
    ledgerId: "ADV-2026-000005",
    name: "Sofia Marchetti",
    firstName: "Sofia",
    role: "Independent travel advisor · stand-in",
    roleApproved: true,
    sample: true,
    portrait: { url: samplePortrait(1), alt: "Sample advisor portrait (AI-generated): Sofia Marchetti" },
    intro: "Wine country, islands and the occasional boat in the Aegean. Starts every honeymoon somewhere you can sleep off the flight.",
    bio: [
      "Sofia carries eight entries across four volumes and starts every honeymoon somewhere you can sleep off the flight. James vouches for the place; she vouches for the client.",
      "Her clients go to the Cape for wine, to the Indian Ocean for the last photograph, and to the Other Europe she keeps to herself until someone asks.",
    ],
    specialties: SAMPLE_DESKS["sofia-marchetti"].specialties,
    traveled: [{ place: "Leeu Estates and Ellerman House, South Africa", year: 2026 }, { place: "Miavana, Madagascar", year: 2025 }, { place: "The Cyclades, by sail", year: 2025 }, { place: "Dá Licença, Alentejo", year: 2026 }],
    profileHref: "/advisors/sofia-marchetti",
    desk: SAMPLE_DESKS["sofia-marchetti"],
  },
  {
    slug: "marcus-adeyemi",
    ledgerId: "ADV-2026-000006",
    name: "Marcus Adeyemi",
    firstName: "Marcus",
    role: "Africa advisor · stand-in",
    roleApproved: true,
    sample: true,
    portrait: { url: samplePortrait(2), alt: "Sample advisor portrait (AI-generated): Marcus Adeyemi" },
    intro: "Africa first. Private reserves, family safaris and the overland routes that earn the lodge at the end.",
    bio: [
      "Marcus has sent families to Africa since 2011 and picks the guide before the lodge. Nine entries carried, five countries walked, and a standing rule that first safaris start somewhere the guide learns your name on the first drive.",
      "He carries the Gatherings villas as well as the camps, because the trips he is proudest of had three generations in them.",
    ],
    specialties: SAMPLE_DESKS["marcus-adeyemi"].specialties,
    traveled: [{ place: "Monwana and Londolozi, South Africa", year: 2025 }, { place: "DumaTau and Qorokwe, Botswana", year: 2024 }, { place: "Cottar's villa, Kenya", year: 2023 }, { place: "Serra Cafema, Namibia", year: 2025 }],
    profileHref: "/advisors/marcus-adeyemi",
    desk: SAMPLE_DESKS["marcus-adeyemi"],
  },
  {
    slug: "mateo-rivas",
    ledgerId: "ADV-2026-000007",
    name: "Mateo Rivas",
    firstName: "Mateo",
    role: "Voyages advisor · stand-in",
    roleApproved: true,
    sample: true,
    portrait: { url: samplePortrait(3), alt: "Sample advisor portrait (AI-generated): Mateo Rivas" },
    intro: "Small ships, sailing yachts and reefs. Two nights on land first, because nobody enjoys a yacht with jet lag.",
    bio: [
      "Mateo plans the Voyages volume the way James does: land before the boat, and never the big ships. Raja Ampat aboard Aliikai, the Galápagos by yacht, Costa Rica by road before the dive.",
      "He is the advisor the house sends polar and diving enquiries to, and the one who will tell you which cabin to avoid.",
    ],
    specialties: SAMPLE_DESKS["mateo-rivas"].specialties,
    traveled: [{ place: "Raja Ampat aboard Aliikai", year: 2024 }, { place: "Galápagos aboard Sirius", year: 2025 }, { place: "The Classic, Costa Rica", year: 2026 }],
    profileHref: "/advisors/mateo-rivas",
    desk: SAMPLE_DESKS["mateo-rivas"],
  },
  {
    slug: "clara-whitlock",
    ledgerId: "ADV-2026-000008",
    name: "Clara Whitlock",
    firstName: "Clara",
    role: "Gatherings & wellness advisor · stand-in",
    roleApproved: true,
    sample: true,
    portrait: { url: samplePortrait(4), alt: "Sample advisor portrait (AI-generated): Clara Whitlock" },
    intro: "Whole houses for whole families, and the wellness stays nobody calls wellness. Book the house, not the rooms.",
    bio: [
      "Clara plans for families who travel together and would rather not share a corridor: farmhouses in Madikwe, a bush villa in the Mara, a quinta in the Alentejo with a pool and no schedule.",
      "Health and wellness run through her entries without the word on the door: the spa afternoon between two safaris, the olive-tree silence after a long year.",
    ],
    specialties: SAMPLE_DESKS["clara-whitlock"].specialties,
    traveled: [{ place: "Morukuru Farm House and Leeu House, South Africa", year: 2024 }, { place: "Cottar's Bush Villa, Kenya", year: 2025 }, { place: "Dá Licença, Alentejo", year: 2026 }],
    profileHref: "/advisors/clara-whitlock",
    desk: SAMPLE_DESKS["clara-whitlock"],
  },
  {
    slug: "carlos-alger",
    ledgerId: "ADV-2026-000004",
    name: "Carlos Alger",
    firstName: "Carlos",
    role: "Travel Advisor",
    roleApproved: false,
    portrait: null,
    intro: null,
    bio: [],
    specialties: [],
    traveled: [],
    profileHref: null,
  },
  {
    // James, 1 Nov 2026: Marissa, his daughter, joins the roster. ADV issued by the Library
    // (ADV-2026-000009). Card only until she states her own profile and DNA.
    slug: "marissa-held",
    ledgerId: "ADV-2026-000009",
    name: "Marissa Held",
    firstName: "Marissa",
    role: "Travel Advisor",
    roleApproved: false,
    // Family photo supplied by James, 1 Nov 2026 (house Cloudinary: jwco/advisors/marissa-held/portrait).
    portrait: { url: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto,c_fill,g_face,w_480,h_480/jwco/advisors/marissa-held/portrait", alt: "Portrait of Marissa Held, travel advisor at James Wild & Co" },
    intro: "Islands and beaches, Europe's small towns, Costa Rica, the desert West: journeys for families, adventure and culture, and island escapes.",
    bio: [],
    specialties: [],
    traveled: [],
    profileHref: null,
  },
];

// In the field with us: partners who aren't James Wild & Co booking
// advisors, shown with their own affiliation (old WES team page, 25 Oct 2026).
export type FieldPartner = { name: string; role: string; org: string; line: string; portrait: { url: string; alt: string }; href?: string };
export const FIELD_PARTNERS: FieldPartner[] = [
  { name: "Joffers McCormick", role: "Partner guide", org: "Wild & Co Safaris · Co-founder, Captivating Africa", line: "Grew up on a game reserve in Zimbabwe. For Joffers, guiding and conservation are a way of life. James met him at Tswalu in 2012.", portrait: { url: `${CDN}/6844b9c78c39cdc31d9a286d_WhatsApp%20Image%202024-05-02%20at%2012_03_16-2.avif`, alt: "Portrait of Joffers McCormick, partner guide with Wild & Co Safaris" }, href: "/safaris/wild-co-safaris" },
  { name: "Nick du Plessis", role: "Partner guide", org: "Wild & Co Safaris · Co-founder, Captivating Africa", line: "A formally trained specialist field guide who designs conservation-focused safaris that support local communities.", portrait: { url: `${CDN}/6846e56589033ecc444c87ad_WhatsApp%20Image%202024-05-02%20at%2012_04_38-2.avif`, alt: "Portrait of Nick du Plessis, partner guide with Wild & Co Safaris" }, href: "/safaris/wild-co-safaris" },
  { name: "Ryan Rapaport", role: "Media director", org: "Founder, Felix Studios, Cape Town", line: "The films, brand identity and conservation stories behind the house, made by his Cape Town studio.", portrait: { url: `${CDN}/69988bb19baf43624bf9a355_1642142199343.jpg`, alt: "Portrait of Ryan Rapaport, founder of Felix Studios" } },
  { name: "Michelle Anotado", role: "Stays content lead", org: "James Wild & Co", line: "Turns the Ledger's facts into stories you'd actually want to read, stay by stay.", portrait: { url: `${CDN}/6a2412562af10e9ae43c890f_Michelle.png`, alt: "Portrait of Michelle Anotado, stays content lead" } },
];

export const advisorBySlug = (slug: string) => ADVISORS.find((a) => a.slug === slug && a.bio.length > 0);

// ---- The Advisor Desk: who knows a place ----------------------------------
// Advisors with a desk, founder excluded (his page is /about/founder).
// While the house is in testing James is the advisor on every page: first in
// every strip and scroll, pre-addressed on the planning form, and the advisor
// Iggi is told about. Change this slug when a real advisor takes a page over.
export const DEFAULT_ADVISOR = "james-papagno";
export const defaultAdvisor = () => ADVISORS.find((a) => a.slug === DEFAULT_ADVISOR)!;

// Advisors with a Desk, the founder included (he is ADV-0001).
export const DESK_ADVISORS = ADVISORS.filter((a) => a.desk);

export type AdvisorsFor = { advisors: Advisor[]; slept: number; carried: number };

// Advisors who carry entries in a country, a region, a volume, or a specific
// Ledger record. "slept" counts those whose own mark is Stayed / Walked / Sailed.
export function advisorsFor(where: { countrySlug?: string | null; regionSlug?: string | null; volume?: Volume; ledgerId?: string | null }): AdvisorsFor {
  const match = (e: DeskProfile["entries"][number]) =>
    (where.ledgerId ? e.ledgerId === where.ledgerId : true) &&
    (where.countrySlug ? e.countrySlug === where.countrySlug : true) &&
    (where.regionSlug ? e.regionSlug === where.regionSlug : true) &&
    (where.volume ? e.volume === where.volume : true);
  const hits = DESK_ADVISORS.map((a) => ({ a, es: a.desk!.entries.filter(match) })).filter((x) => x.es.length);
  hits.sort((x, y) => (x.a.slug === DEFAULT_ADVISOR ? -1 : y.a.slug === DEFAULT_ADVISOR ? 1 : y.es.reduce((n, e) => n + e.guests, 0) - x.es.reduce((n, e) => n + e.guests, 0)));
  // After those with a marked entry here: advisors who state they know the country
  // (desk.countries) but have no marked stay in it yet — they still should be asked.
  const knows = where.countrySlug ? DESK_ADVISORS.filter((a) => !hits.some((h) => h.a === a) && a.desk!.countries.includes(where.countrySlug!) && (!where.volume || a.desk!.volumes.includes(where.volume))) : [];
  return {
    advisors: [...hits.map((x) => x.a), ...knows],
    slept: hits.filter((x) => x.es.some((e) => e.theirs && e.theirs.mark !== "Sent Guests")).length,
    carried: hits.reduce((n, x) => n + x.es.length, 0),
  };
}

export const advisorCounts = (a: Advisor) => (a.desk ? deskCounts(a.desk) : { carried: 0, guests: 0, folios: 0, slept: 0 });
export const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export const TEAM = {
  eyebrow: "The House · The team",
  title: "The People Behind Your Journey",
  subtitle: "A small house, on purpose. Pick the person you'd enjoy planning with, or tell us the trip and we'll make the introduction.",
  answer:
    "James Wild & Co is a small, founder-led team. Founder James Papagno and the house's advisors plan journeys from the Ledger of stays, camps, ships and routes James has vetted in person. You can choose an advisor yourself or ask the house to match you, and if you already have a travel advisor, the house works with them.",
  match: {
    title: "Not sure who to choose?",
    line: "Tell us a little about the trip. We'll introduce you to the person best placed to plan it.",
  },
  join: {
    eyebrow: "Join the house",
    title: "Advisors Wanted: Learn the Ledger, Book With James Wild & Co",
    line: "New to travel, or new to us? James Wild & Co is a wholesaler and a hybrid host agency, and it's looking for advisors who'd rather sell what they know than what's in the brochure.",
    points: [
      { icon: "compass", title: "Learn from the founder", line: "Training rooted in forty-four years on the road and journeys designed since 1983." },
      { icon: "key", title: "Quote the Ledger", line: "Vetted stays, camps, ships and routes, each with a permanent ID and rates re-checked at enquiry." },
      { icon: "route", title: "Book under the house", line: "Plan and book as part of a hybrid host agency, with the house behind every booking." },
    ],
    cta: { label: "Become a James Wild & Co advisor", href: "/for-advisors" },
  },
  faqs: [
    { q: "Who will plan my trip?", a: "James or one of the house's advisors, chosen by you or matched by the house to the kind of journey you're after. Every advisor plans from the same Ledger of places James has vetted in person." },
    { q: "Can I ask for James himself?", a: "Yes. Say so on the planning form and the house will tell you straight whether he can take the journey on, or who on the team he'd hand it to." },
    { q: "I'm a travel advisor. Can I join James Wild & Co?", a: "Yes. The house is a wholesaler and a hybrid host agency and welcomes new advisors, experienced or just starting. Start at For Advisors to see how training, the Ledger and booking work." },
    { q: "I already have a travel advisor. Can I still book with you?", a: "Yes. The house works with outside advisors, and yours can plan directly from the Ledger." },
  ],
};
