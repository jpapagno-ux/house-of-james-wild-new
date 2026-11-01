import { volumeInk } from "@/lib/volumes";
import { INBOXES } from "./inbox";

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
    email: "james@jameswildco.com", // James's own address, shown on Meet James
  },
  exploringSince: "1982",
  sailingSince: "1989",
  designingSince: "1983",
  safariSince: "2011",
  phone: { display: "1.800.419.7000", tel: "+18004197000" },
  // hello@ is the house address: customer enquiries, Travel Notes and all
  // campaign email (James, 25 Oct 2026). Sending runs through Resend.
  email: "hello@jameswildco.com" as string | null,
  inboxes: INBOXES, // see lib/inbox.ts
  address: { locality: "Miami", region: "FL", country: "US" },
  credentials: [
    { label: "Florida Seller of Travel", value: "ST45327" },
    { label: "IATA", value: "10783883" },
  ],
  memberships: ["IATAN", "CLIA", "The Long Run", "Reef Ball Foundation"],
  // Old Find Your Wild booking site, removed from the top bar 25 Oct 2026;
  // live pricing now runs on stay pages (components/record/Pricing.tsx).
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
  tone?: string; // the volume's colour (lib/volumes.ts, never a hex here): dots in the header, tabs in the footer
};

// Utility row: trust and contact, above the main bar.
export const UTILITY_NAV: NavLink[] = [
  { label: "The Compass", href: "/compass" },
  { label: "The Ledger", href: "/the-ledger" },
  { label: "Meet James", href: "/about/founder" },
  { label: "For Advisors", href: "/for-advisors" },
];

// Main bar: the five volumes, then Destinations and Journal.
export const VOLUMES: MegaMenu[] = [
  {
    label: "Stays",
    href: "/stays",
    tone: volumeInk("stays"),
    intro: "Lodges, camps, islands and houses James has vetted in person.",
    browse: [
      { label: "By land", href: "/stays?by=land" },
      { label: "By water", href: "/stays?by=water" },
      { label: "New to the Ledger", href: "/stays/new" },
      { label: "Stay longer, pay less", href: "/stays/promos" },
    ],
    ledger: [],
  },
  {
    label: "Safaris",
    href: "/safaris",
    tone: volumeInk("safaris"),
    intro: "Camps by reserve, from the Sabi Sand to the Okavango.",
    browse: [
      { label: "By country", href: "/destinations/africa" },
      { label: "Your first safari", href: "/safaris/first-safari" },
      { label: "Ask Crux, the safari guide", href: "/safaris/wild-co-safaris" },
    ],
    ledger: [],
  },
  {
    label: "Gatherings",
    href: "/gatherings",
    tone: volumeInk("gatherings"),
    intro: "Family residences for the generations who travel together.",
    browse: [
      { label: "Celebrations", href: "/gatherings?for=celebrations" },
      { label: "Multigenerational", href: "/gatherings?for=multigenerational" },
    ],
    ledger: [],
  },
  {
    label: "Voyages",
    href: "/voyages",
    tone: volumeInk("voyages"),
    intro: "Small ships and sailing yachts, never the big ones.",
    browse: [
      { label: "Departures 2027–2028", href: "/voyages/departures" },
      { label: "Charter a whole yacht", href: "/voyages/charter" },
      { label: "Polar", href: "/voyages?region=polar" },
      { label: "Islands", href: "/voyages?region=islands" },
      { label: "Sailing yachts", href: "/voyages?type=yacht" },
    ],
    ledger: [],
  },
  {
    label: "Overland",
    href: "/overland",
    tone: volumeInk("overland"),
    intro: "Land routes James designed, with what to expect and what to avoid.",
    browse: [
      { label: "Field-tested by James", href: "/overland?stamp=field-tested" },
      { label: "Designed by James", href: "/overland?stamp=designed" },
    ],
    ledger: [],
  },
  {
    label: "Other Europe",
    href: "/europe",
    tone: volumeInk("europe"),
    intro: "Not the capitals and the queues. The valleys, islands and river towns James keeps going back to.",
    browse: [
      { label: "Greece, by sail", href: "/destinations/europe/greece" },
      { label: "Spain: Mallorca", href: "/destinations/europe/spain-isla-mallorca" },
      { label: "River cruises, before or after", href: "/voyages?region=rivers" },
    ],
    ledger: [],
  },
];

// The ten regions and their live countries, from the Base44 Ledger
// (Destination records with site_status "live", 24 Oct 2026). Regenerated by
// the Ledger export in step 5; until then, edit here. A region with no live
// country still links to its region page.
export type Region = NavLink & { slug: string; countries: NavLink[] };
export const REGIONS: Region[] = [
  { label: "Africa", slug: "africa", href: "/destinations/africa", countries: [{ label: "Botswana", href: "/destinations/africa/botswana" }, { label: "Kenya", href: "/destinations/africa/kenya" }, { label: "Madagascar", href: "/destinations/africa/madagascar" }, { label: "Namibia", href: "/destinations/africa/namibia" }, { label: "Rwanda", href: "/destinations/africa/rwanda" }, { label: "Seychelles", href: "/destinations/africa/seychelles" }, { label: "South Africa", href: "/destinations/africa/south-africa" }, { label: "Tanzania", href: "/destinations/africa/tanzania" }, { label: "Zambia", href: "/destinations/africa/zambia" }, { label: "Zimbabwe", href: "/destinations/africa/zimbabwe" }] },
  { label: "Asia", slug: "asia", href: "/destinations/asia", countries: [{ label: "Cambodia", href: "/destinations/asia/cambodia" }, { label: "Indonesia", href: "/destinations/asia/indonesia" }, { label: "Maldives", href: "/destinations/asia/maldives" }, { label: "Philippines", href: "/destinations/asia/philippines" }, { label: "Thailand", href: "/destinations/asia/thailand" }] },
  { label: "USA & Canada", slug: "usa-canada", href: "/destinations/usa-canada", countries: [{ label: "Arizona", href: "/destinations/usa-canada/arizona" }, { label: "California", href: "/destinations/usa-canada/california" }, { label: "Montana", href: "/destinations/usa-canada/montana" }, { label: "New Mexico", href: "/destinations/usa-canada/new-mexico" }, { label: "Utah", href: "/destinations/usa-canada/utah" }, { label: "Wyoming", href: "/destinations/usa-canada/wyoming" }] },
  { label: "Central America", slug: "central-america", href: "/destinations/central-america", countries: [{ label: "Belize", href: "/destinations/central-america/belize" }, { label: "Costa Rica", href: "/destinations/central-america/costa-rica" }, { label: "Panama", href: "/destinations/central-america/panama" }] },
  { label: "Caribbean & Mexico", slug: "caribbean-mexico", href: "/destinations/caribbean-mexico", countries: [{ label: "Mexico", href: "/destinations/caribbean-mexico/mexico" }] },
  { label: "Oceania", slug: "oceania", href: "/destinations/oceania", countries: [{ label: "Australia", href: "/destinations/oceania/australia" }, { label: "Fiji", href: "/destinations/oceania/fiji" }, { label: "New Zealand", href: "/destinations/oceania/new-zealand" }, { label: "Tahiti", href: "/destinations/oceania/tahiti" }] },
  { label: "South America", slug: "south-america", href: "/destinations/south-america", countries: [{ label: "Argentina", href: "/destinations/south-america/argentina" }, { label: "Chile & Easter Island", href: "/destinations/south-america/chile" }, { label: "Ecuador & Galapagos", href: "/destinations/south-america/ecuador-galapagos" }, { label: "Peru", href: "/destinations/south-america/peru" }] },
  { label: "Europe", slug: "europe", href: "/destinations/europe", countries: [{ label: "Greece", href: "/destinations/europe/greece" }, { label: "Spain: Mallorca", href: "/destinations/europe/spain-isla-mallorca" }] },
  { label: "Polar: Antarctica", slug: "polar-antarctica", href: "/destinations/polar-antarctica", countries: [] },
  { label: "Polar: Arctic", slug: "polar-arctic", href: "/destinations/polar-arctic", countries: [{ label: "Iceland", href: "/destinations/polar-arctic/iceland" }] },
];

export const MAIN_EXTRA: NavLink[] = [
  { label: "Destinations", href: "/destinations" },
  { label: "Journal", href: "/journal" },
];

export const PLAN_CTA: NavLink = { label: "Plan with James", href: "/plan" };

// Footer: four columns over the credentials strip.
export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "The House",
    links: [
      { label: "About the house", href: "/about" },
      { label: "The Ledger", href: "/the-ledger" },
      { label: "Meet James", href: "/about/founder" },
      { label: "The team", href: "/about/team" },
      { label: "Journal", href: "/journal" },
      { label: "What's coming", href: "/whats-coming" },
    ],
  },
  {
    title: "The Volumes",
    links: VOLUMES.map((v) => ({ label: v.label, href: v.href })),
  },
  {
    title: "Before You Go",
    links: [
      { label: "Plan with James", href: "/plan" },
      { label: "The Compass", href: "/compass" },
      { label: "Free field guides", href: "/field-guides" },
      { label: "Find an advisor", href: "/about/team#advisors" },
      { label: "Iggi, the itinerary guide", href: "/plan/iggi" },
      { label: "House Sessions (workshops)", href: "/workshops" },
      { label: "FAQ", href: "/faq" },
      { label: "Booking conditions", href: "/legal/booking-conditions" },
    ],
  },
  {
    title: "For the trade",
    links: [
      { label: "For advisors", href: "/for-advisors" },
      { label: "Partner resources", href: "/partners" },
      { label: "Wild Earth Portfolio", href: "/wild-earth-portfolio" },
    ],
  },
];

export const LEGAL_NAV: NavLink[] = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
];

// Pages that are built AND indexable. The sitemap lists only these. Built
// pages awaiting sign-off stay noindex and off this list (see lib/routes.ts
// for the link guard's BUILT list). Grows step by step.
export const LIVE_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  // Wild Pathways: approved by James, 30 Oct 2026, once batch 1 (30 live records) was on the pages.
  { path: "/europe", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pathways", priority: 0.8, changeFrequency: "weekly" },
  // What's coming (James, 31 Oct 2026): lodges filed before they open.
  { path: "/whats-coming", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/into-the-green", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/between-tides", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/above-it-all", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/where-the-wild-lives", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/the-art-of-stillness", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/off-the-map", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/a-place-of-our-own", priority: 0.7, changeFrequency: "weekly" },
  { path: "/pathways/rooted-in-place", priority: 0.7, changeFrequency: "weekly" },
  // Guides: copy signed off by James, 27 Oct 2026.
  { path: "/destinations/asia/indonesia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/asia/indonesia/raja-ampat", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/asia/indonesia/komodo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/south-america/chile/rapa-nui", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/south-america/chile/atacama", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/south-america/chile/patagonia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/slovenia/ljubljana", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/slovenia/logar-valley", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/slovenia/brda", priority: 0.8, changeFrequency: "monthly" },
  // Voyages, the Aliikai profile and the Costa Rica route: approved on the Ledger Proofs sheet, 27 Oct 2026.
  { path: "/voyages/ships/aliikai", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/komodo/aliikai-5-day-komodo-island", priority: 0.8, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/two-oceans-one-volcano", priority: 0.7, changeFrequency: "monthly" },
  // Journal post and House Sessions: approved 27 Oct 2026.
  { path: "/journal/monwana-couples-first-safari", priority: 0.7, changeFrequency: "monthly" },
  { path: "/workshops", priority: 0.6, changeFrequency: "weekly" },
  // Cayuga set (journal, collection, three Original Costa Routes) and the Africa post: approved 27 Oct 2026.
  { path: "/journal/cayuga-collection-sustainable-luxury", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journal/africa-inspired-wild-and-co-safaris", priority: 0.7, changeFrequency: "monthly" },
  { path: "/collections/cayuga-collection", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-7-days", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-10-days", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-coast-to-coast", priority: 0.7, changeFrequency: "monthly" },
  // South Africa Overland routes: copy approved by James, 30 Oct 2026 ("approved please push").
  { path: "/overland/south-africa/the-sand-river-by-road", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/leopards-through-the-lens", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/three-generations-at-pioneer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/track-your-life-with-boyd-varty", priority: 0.7, changeFrequency: "monthly" },
];

/** Years on the road (exploring since 1982). The house says "44 years" in 2026. */
export const FOUNDER_YEARS = 44;

// The one door to the safari desk (rule, 30 Oct 2026): the menu item and the
// Safaris hub land on `page`; only that page links out to `url`.
export const SAFARI_DESK = { page: "/safaris/wild-co-safaris", url: "https://wildcosafaris.com" } as const;
