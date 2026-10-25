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

export const advisorBySlug = (slug: string) => ADVISORS.find((a) => a.slug === slug && a.bio.length > 0);
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
