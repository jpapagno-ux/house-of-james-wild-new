// The house configuration: one place for the name, domain, contact details,
// credentials and every navigation list. Header, footer, schema, sitemap and
// llms.txt all read from here, so the name, address and phone match
// everywhere (Google compares them).

export const SITE = {
  name: "James Wild & Co",
  legalName: "James Wild & Co",
  tagline: "James knows a place.",
  homeOf: "Home of Wild Earth Stays",
  url: "https://www.jameswildco.com",
  locale: "en_US",
  description:
    "A founder-led travel house exploring since 1982. Every safari camp, stay, family residence, small-ship voyage and overland route is vetted in person and filed in the Ledger.",
  founder: {
    name: "James Papagno",
    alternateName: "James",
    jobTitle: "Founder & Chief Expedition Officer",
  },
  exploringSince: "1982",
  designingSince: "1983",
  safariSince: "2011",
  phone: { display: "1.800.419.7000", tel: "+18004197000" },
  // Email addresses are being defined; add here once confirmed.
  email: null as string | null,
  address: { locality: "Miami", region: "FL", country: "US" },
  credentials: [
    { label: "Florida Seller of Travel", value: "ST45327" },
    { label: "IATA", value: "10783883" },
  ],
  memberships: ["IATAN", "CLIA", "The Long Run", "Reef Ball Foundation"],
  booking: { label: "Find Your Wild", url: "https://book.wildearthstays.com" },
  social: [
    { label: "Instagram", url: "https://www.instagram.com/wild_earth_stays/" },
    { label: "YouTube", url: "https://www.youtube.com/@WildEarthStays1" },
    { label: "Facebook", url: "https://www.facebook.com/profile.php?id=100094279719768" },
    { label: "Pinterest", url: "https://www.pinterest.com/wildearthstays/" },
    { label: "X", url: "https://x.com/wildearthstays" },
  ],
} as const;

export type NavLink = { label: string; href: string; note?: string };
export type MegaMenu = {
  label: string;
  href: string;
  intro: string;
  browse: NavLink[];
  ledger: NavLink[]; // filled from the Ledger export in step 5
};

// Utility row: trust and contact, above the main bar.
export const UTILITY_NAV: NavLink[] = [
  { label: "The Ledger", href: "/the-ledger" },
  { label: "About James", href: "/about/founder" },
  { label: "Advisors & Partners", href: "/advisors" },
];

// Main bar: the five volumes, then Destinations and Journal.
export const VOLUMES: MegaMenu[] = [
  {
    label: "Stays",
    href: "/stays",
    intro: "Lodges, camps, islands and houses James has vetted in person.",
    browse: [
      { label: "By land", href: "/stays?by=land" },
      { label: "By water", href: "/stays?by=water" },
      { label: "Stay longer, pay less", href: "/stays/promos" },
      { label: "All stays", href: "/stays" },
    ],
    ledger: [],
  },
  {
    label: "Safaris",
    href: "/safaris",
    intro: "Camps by reserve, from the Sabi Sand to the Okavango.",
    browse: [
      { label: "By reserve", href: "/safaris" },
      { label: "By country", href: "/destinations/africa" },
      { label: "Your first safari", href: "/safaris/first-safari" },
      { label: "Planning a safari", href: "/plan" },
    ],
    ledger: [],
  },
  {
    label: "Gatherings",
    href: "/gatherings",
    intro: "Family residences for the generations who travel together.",
    browse: [
      { label: "Family residences", href: "/gatherings" },
      { label: "Celebrations", href: "/gatherings?for=celebrations" },
      { label: "Multigenerational", href: "/gatherings?for=multigenerational" },
    ],
    ledger: [],
  },
  {
    label: "Voyages",
    href: "/voyages",
    intro: "Small ships and sailing yachts, never the big ones.",
    browse: [
      { label: "By ship", href: "/voyages" },
      { label: "Polar", href: "/voyages?region=polar" },
      { label: "Islands", href: "/voyages?region=islands" },
      { label: "Sailing yachts", href: "/voyages?type=yacht" },
    ],
    ledger: [],
  },
  {
    label: "Overland",
    href: "/overland",
    intro: "Land routes James designed, with what to expect and what to avoid.",
    browse: [
      { label: "All routes", href: "/overland" },
      { label: "Field-tested by James", href: "/overland?stamp=field-tested" },
      { label: "Designed by James", href: "/overland?stamp=designed" },
    ],
    ledger: [],
  },
];

export const REGIONS: NavLink[] = [
  { label: "Africa", href: "/destinations/africa" },
  { label: "Asia", href: "/destinations/asia" },
  { label: "USA & Canada", href: "/destinations/usa-canada" },
  { label: "Central America", href: "/destinations/central-america" },
  { label: "Caribbean & Mexico", href: "/destinations/caribbean-mexico" },
  { label: "Oceania", href: "/destinations/oceania" },
  { label: "South America", href: "/destinations/south-america" },
  { label: "Europe", href: "/destinations/europe" },
  { label: "Polar: Antarctica", href: "/destinations/polar-antarctica" },
  { label: "Polar: Arctic", href: "/destinations/polar-arctic" },
];

export const MAIN_EXTRA: NavLink[] = [
  { label: "Destinations", href: "/destinations" },
  { label: "Journal", href: "/journal" },
];

export const PLAN_CTA: NavLink = { label: "Plan a Journey", href: "/plan" };

// Footer: four columns over the credentials strip.
export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "The House",
    links: [
      { label: "The Ledger", href: "/the-ledger" },
      { label: "About James", href: "/about/founder" },
      { label: "The team", href: "/about/team" },
      { label: "Philosophy", href: "/about/philosophy" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "The Volumes",
    links: VOLUMES.map((v) => ({ label: v.label, href: v.href })),
  },
  {
    title: "Plan",
    links: [
      { label: "Plan a Journey", href: "/plan" },
      { label: "Iggi, the itinerary guide", href: "/plan/iggi" },
      { label: "Live workshops", href: "/plan/workshops" },
      { label: "FAQ", href: "/faq" },
      { label: "Booking conditions", href: "/legal/booking-conditions" },
    ],
  },
  {
    title: "For the trade",
    links: [
      { label: "Advisors & influencers", href: "/advisors" },
      { label: "Partner resources", href: "/partners" },
      { label: "Wild Earth Portfolio", href: "/wild-earth-portfolio" },
    ],
  },
];

export const LEGAL_NAV: NavLink[] = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
];

// Routes that exist in the current step. The sitemap lists only these, so it
// never advertises a page that is not built yet. Grows step by step.
export const LIVE_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
];
