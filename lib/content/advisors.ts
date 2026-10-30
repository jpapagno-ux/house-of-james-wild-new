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
  sample?: boolean; // invented to show the layout; labelled as such everywhere
  desk?: DeskProfile; // the Advisor Desk: ID, marks, entries carried, folios
};

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const ADVISORS: Advisor[] = [
  {
    slug: "james-papagno",
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
  },
  {
    slug: "kristina-larson",
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
    name: "Anthony Papagno",
    firstName: "Anthony",
    role: "Travel Advisor",
    roleApproved: false,
    portrait: { url: `${CDN}/67d1f822a724915185466057_team-anthony.avif`, alt: "Portrait of Anthony Papagno, travel advisor at James Wild & Co" },
    intro: "Travels for new perspectives and lasting connections. Recently sailed Raja Ampat with his father.",
    bio: [
      "Anthony spent years watching his father explore, then started doing it himself. He travels for the new perspective and the people, and he's the one who'll tell you which side trip was worth it.",
      "In November 2024 he sailed Raja Ampat in Indonesia aboard the yacht Aliikai with James. The trip sharpened what he already knew: the best of a place is usually just past where most people stop.",
      "He also works with the house's content team on the stories behind the Ledger.",
    ],
    specialties: [],
    traveled: [{ place: "Raja Ampat, Indonesia, aboard Aliikai", year: 2024 }],
    profileHref: "/advisors/anthony-papagno",
    desk: {
      adv: "ADV number pending", sample: false, since: 2024, joined: 2026, agency: null, base: "Palm Beach, Florida", languages: ["English"],
      volumes: ["voyages"], countries: ["indonesia"], specialties: [], line: "The best of a place is usually just past where the itinerary stops.",
      entries: [{ ledgerId: "STY-2026-882896", name: "Aliikai", place: "Raja Ampat · Indonesia", href: null, countrySlug: "indonesia", regionSlug: "asia", volume: "voyages", james: { mark: "I Know a Place", year: 2024, favourite: true }, theirs: { mark: "Sailed It", when: "Nov 2024" }, guests: 0, folios: [], last: "—" }],
      folios: [],
    },
  },
  {
    slug: "albert-alvarez",
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
    name: "Sofia Marchetti",
    firstName: "Sofia",
    role: "Independent travel advisor · sample",
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
    name: "Marcus Adeyemi",
    firstName: "Marcus",
    role: "Africa advisor · sample",
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
    name: "Mateo Rivas",
    firstName: "Mateo",
    role: "Voyages advisor · sample",
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
    name: "Clara Whitlock",
    firstName: "Clara",
    role: "Gatherings & wellness advisor · sample",
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
export const DESK_ADVISORS = ADVISORS.filter((a) => a.desk && a.slug !== "james-papagno");

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
  hits.sort((x, y) => y.es.reduce((n, e) => n + e.guests, 0) - x.es.reduce((n, e) => n + e.guests, 0));
  return {
    advisors: hits.map((x) => x.a),
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
