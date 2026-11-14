import { TIMELESS_VOYAGES_ON, TV_PATH } from "./content/timeless-voyages-flag";
import { volumeLeather } from "@/lib/volumes";
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
  designingSince: "1982",
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
  tone?: string; // the volume's base (lib/volumes.ts volumeLeather, never a hex here): the 5px tab in the menus and footer, the header dot
};

// Utility row: trust and contact, above the main bar.
export const UTILITY_NAV: NavLink[] = [
  { label: "How the house works", href: "/how-the-house-works" },
  { label: "The Compass", href: "/compass" },
  { label: "The Ledger", href: "/the-ledger" },
  { label: "Meet James", href: "/about/founder" },
  { label: "For Advisors", href: "/for-advisors" },
];

// Main bar: the volumes in house order (I Stays, II Safaris, III Gatherings, IV Voyages,
// V Europe, VI Overland: lib/volumes.ts), then Destinations and Journal.
export const VOLUMES: MegaMenu[] = [
  {
    label: "Stays",
    href: "/stays",
    tone: volumeLeather("stays"),
    intro: "Lodges, camps, islands and houses James has vetted in person.",
    browse: [
      { label: "By land", href: "/stays?by=land" },
      { label: "By water", href: "/stays?by=water" },
      { label: "New to the Ledger", href: "/stays/new" },
      { label: "Our partner: COMO", href: "/collections/como" },
      { label: "Our partner: Belmond", href: "/collections/belmond" },
      { label: "On the Horizon: offers", href: "/offers#stays" },
    ],
    ledger: [],
  },
  {
    label: "Safaris",
    href: "/safaris",
    tone: volumeLeather("safaris"),
    intro: "Camps by reserve, from the Sabi Sand to the Okavango.",
    browse: [
      { label: "By country", href: "/destinations/africa" },
      { label: "Your first safari", href: "/safaris/first-safari" },
      { label: "Belmond: Cape Town to the Delta", href: "/collections/belmond" },
      { label: "Ask Crux, the safari guide", href: "/safaris/wild-co-safaris" },
    ],
    ledger: [],
  },
  {
    label: "Gatherings",
    href: "/gatherings",
    tone: volumeLeather("gatherings"),
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
    tone: volumeLeather("voyages"),
    intro: "Small ships and sailing yachts, never the big ones.",
    browse: [
      { label: "By River", href: "/voyages/rivers" },
      { label: "Under Sail", href: "/voyages/sailing" },
      { label: "To the Edges", href: "/voyages/expedition" },
      { label: "By Yacht", href: "/voyages/yachts" },
      { label: "Timeless Voyages", href: "/voyages/timeless-voyages" },
      { label: "The Whole Ship", href: "/voyages/charter" },
      { label: "The Nile", href: "/voyages/nile" },
      { label: "The Galápagos", href: "/voyages/galapagos" },
      { label: "On the Horizon: offers", href: "/offers#voyages" },
    ],
    ledger: [],
  },
  {
    label: "Other Europe",
    href: "/europe",
    tone: volumeLeather("europe"),
    intro: "Not the capitals and the queues. The valleys, islands and river towns James keeps going back to.",
    browse: [
      { label: "Greece, by sail", href: "/destinations/europe/greece" },
      { label: "Spain: Mallorca", href: "/destinations/europe/spain-isla-mallorca" },
      { label: "Italy: the Dolomites", href: "/destinations/europe/italy" },
      { label: "COMO in Italy", href: "/collections/como" },
      { label: "River cruises, before or after", href: "/voyages/rivers" },
    ],
    ledger: [],
  },
  {
    label: "Overland",
    href: "/overland",
    tone: volumeLeather("overland"),
    intro: "Land routes James designed, with what to expect and what to avoid.",
    browse: [
      { label: "Field-tested by James", href: "/overland?stamp=field-tested" },
      { label: "Designed by James", href: "/overland?stamp=designed" },
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
  { label: "Central America", slug: "central-america", href: "/destinations/central-america", countries: [{ label: "Belize", href: "/destinations/central-america/belize" }, { label: "Costa Rica", href: "/destinations/central-america/costa-rica" }, { label: "Guatemala", href: "/destinations/central-america/guatemala" }, { label: "Panama", href: "/destinations/central-america/panama" }] },
  { label: "Caribbean & Mexico", slug: "caribbean-mexico", href: "/destinations/caribbean-mexico", countries: [{ label: "Mexico", href: "/destinations/caribbean-mexico/mexico" }] },
  { label: "Oceania", slug: "oceania", href: "/destinations/oceania", countries: [{ label: "Australia", href: "/destinations/oceania/australia" }, { label: "Fiji", href: "/destinations/oceania/fiji" }, { label: "New Zealand", href: "/destinations/oceania/new-zealand" }, { label: "Tahiti", href: "/destinations/oceania/tahiti" }] },
  { label: "South America", slug: "south-america", href: "/destinations/south-america", countries: [{ label: "Argentina", href: "/destinations/south-america/argentina" }, { label: "Chile & Easter Island", href: "/destinations/south-america/chile" }, { label: "Ecuador & Galapagos", href: "/destinations/south-america/ecuador-galapagos" }, { label: "Peru", href: "/destinations/south-america/peru" }] },
  { label: "Europe", slug: "europe", href: "/destinations/europe", countries: [{ label: "Greece", href: "/destinations/europe/greece" }, { label: "Italy", href: "/destinations/europe/italy" }, { label: "Spain: Mallorca", href: "/destinations/europe/spain-isla-mallorca" }] },
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
      { label: "The Exceptional Few", href: "/the-exceptional-few" },
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
      { label: "On the Horizon: offers", href: "/offers" },
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

/** The volumes the header, menus and footer link to. Gatherings is a house brand named in
 *  plain text, never linked from shared chrome (James, 2 Nov 2026). */
export const LINKED_VOLUMES = VOLUMES.filter((v) => v.href !== "/gatherings");
/** The house's lines, as plain text for the footer ("Stays · Voyages · Safaris · Gatherings"). */
export const HOUSE_LINE = ["Stays", "Voyages", "Safaris", "Gatherings"];

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
  { path: "/destinations/south-america/bolivia/salar-de-uyuni", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/portugal/alentejo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/portugal/douro-valley", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/peloponnese", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/cyclades", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/crete", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/dodecanese", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/ionian-islands", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/europe/greece/zagori", priority: 0.8, changeFrequency: "monthly" },
  // The Galápagos, a place inside Ecuador & Galápagos (James approved, 2 Nov 2026).
  { path: "/destinations/south-america/ecuador-galapagos/galapagos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/tahiti/tahaa", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/tahiti/bora-bora", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/tahiti/tuamotu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/tahiti/marquesas", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/fiji/yasawa-islands", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/fiji/mamanuca-islands", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/fiji/vanua-levu-and-taveuni", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/fiji/kadavu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/oceania/fiji/beqa-lagoon-and-pacific-harbour", priority: 0.8, changeFrequency: "monthly" },
  // Voyages, the Aliikai profile and the Costa Rica route: approved on the Ledger Proofs sheet, 27 Oct 2026.
  { path: "/voyages/ships/aliikai", priority: 0.8, changeFrequency: "monthly" },
  // The Nile hub and the A&K Sanctuary ships: approved by James, 1 Nov 2026.
  { path: "/voyages/nile", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/ships/nile-adventurer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/nile-seray", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/sun-boat-iii", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/sun-boat-iv", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/zein-nile-chateau", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", priority: 0.8, changeFrequency: "monthly" },
  // The Voyages restructure (PR #185): type and waters hubs and the ship pages, approved for publishing by James, 2 Nov 2026.
  { path: "/voyages/rivers", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/sailing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/expedition", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/charter", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/yachts", priority: 0.8, changeFrequency: "monthly" },
  ...(TIMELESS_VOYAGES_ON ? [{ path: TV_PATH, priority: 0.8, changeFrequency: "monthly" as const }] : []),
  { path: "/voyages/amazon", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/galapagos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/indonesia", priority: 0.8, changeFrequency: "monthly" },
  // On the Horizon, the site-wide offers hub (James, 2 Nov 2026).
  { path: "/offers", priority: 0.8, changeFrequency: "daily" },
  // Voyages category pages (James, 2 Nov 2026), answer-first with a comparison table.
  { path: "/voyages/honeymoon", priority: 0.8, changeFrequency: "weekly" },
  { path: "/voyages/family", priority: 0.8, changeFrequency: "weekly" },
  { path: "/voyages/solo", priority: 0.8, changeFrequency: "weekly" },
  { path: "/voyages/ships/beyond-amazon-explorer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/aria-amazon", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/aqua-nera", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/aqua-mekong", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/aqua-mare", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/aqua-blu", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/aqua-lares", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/delfin-iii", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/anakonda-amazon-cruise", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/amazon-clipper-premium", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/ecoventura-origin-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/ecoventura-theory-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/ecoventura-evolve-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/alya-catamaran-galapagos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/sirius-yacht-galapagos", priority: 0.7, changeFrequency: "monthly" },
  // The Galápagos portfolio: twelve more ship pages (James approved, 2 Nov 2026).
  { path: "/voyages/ships/galapagos-horizon-trimaran", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/infinity-yacht-galapagos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/new-galapagos-sea-star", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/natural-paradise-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/grand-majestic-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/galapagos-angel-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/calipso-yacht-galapagos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/monserrat-yacht-galapagos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/galaxy-stella-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/ecogalaxy-catamaran", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/galaxy-bonita-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/galaxy-orion-yacht", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/hermes-galapagos", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/star-breeze", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/wind-star", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/yasawa-princess-ii", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/amandira", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/tao-philippines", priority: 0.7, changeFrequency: "monthly" },
  // The Indonesian fleets, partners and charter weeks (James approved, 2 Nov 2026).
  { path: "/voyages/ships/rascal", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/rebel", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/el-aleph", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/silolona", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/si-datu-bua", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/ships/celestia", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/indonesia/komodo-and-flores-charter", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voyages/indonesia/raja-ampat-and-misool-charter", priority: 0.8, changeFrequency: "monthly" },
  { path: "/partners/rascal-voyages", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/silolona-sojourns", priority: 0.6, changeFrequency: "monthly" },
  { path: "/voyages/ships/magellan-explorer", priority: 0.7, changeFrequency: "monthly" },
  // HX (James, 9 Nov 2026): the ship James sailed, and her Antarctic Circle Expedition.
  { path: "/voyages/ships/ms-roald-amundsen", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voyages/polar/hx-antarctic-circle-expedition", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/ships/magellan-discoverer", priority: 0.7, changeFrequency: "monthly" },
  // Polar Crossings and the Antarctica21 voyages, and the Antarctica21 partner page (James, 2 Nov 2026).
  { path: "/voyages/polar", priority: 0.8, changeFrequency: "weekly" },
  { path: "/voyages/polar/classic-antarctica-air-cruise", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/polar-circle-air-cruise", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/antarctica-express-air-cruise", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/magellan-discoverer-inaugural-air-cruise", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/antarctica-south-georgia-air-cruise", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/patagonia-chilean-fjords", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/falkland-islands", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/falklands-south-georgia", priority: 0.7, changeFrequency: "weekly" },
  { path: "/voyages/polar/falklands-south-georgia-antarctica", priority: 0.7, changeFrequency: "weekly" },
  { path: "/partners/antarctica21", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/aqua-expeditions", priority: 0.6, changeFrequency: "monthly" },
  // The Galápagos partners (James approved, 2 Nov 2026).
  { path: "/partners/royal-galapagos", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/galaxy-cruises", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/ecoventura", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/vianatura", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/windstar", priority: 0.6, changeFrequency: "monthly" },
  { path: "/partners/pearl-resorts", priority: 0.6, changeFrequency: "monthly" },
  { path: "/voyages/komodo/aliikai-5-day-komodo-island", priority: 0.8, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/two-oceans-one-volcano", priority: 0.7, changeFrequency: "monthly" },
  // Journal post and House Sessions: approved 27 Oct 2026.
  { path: "/journal/monwana-couples-first-safari", priority: 0.7, changeFrequency: "monthly" },
  { path: "/workshops", priority: 0.6, changeFrequency: "weekly" },
  // Cayuga set (journal, collection, three Original Costa Routes) and the Africa post: approved 27 Oct 2026.
  { path: "/journal/cayuga-collection-sustainable-luxury", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journal/africa-inspired-wild-and-co-safaris", priority: 0.7, changeFrequency: "monthly" },
  { path: "/collections/cayuga-collection", priority: 0.7, changeFrequency: "monthly" },
  { path: "/collections/como", priority: 0.7, changeFrequency: "monthly" },
  { path: "/collections/belmond", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-7-days", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-10-days", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/costa-rica/the-original-costa-route-coast-to-coast", priority: 0.7, changeFrequency: "monthly" },
  // South Africa Overland routes: copy approved by James, 30 Oct 2026 ("approved please push").
  { path: "/overland/south-africa/the-sand-river-by-road", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/leopards-through-the-lens", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/three-generations-at-pioneer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/south-africa/track-your-life-with-boyd-varty", priority: 0.7, changeFrequency: "monthly" },
  // Central America Overland routes: approved by James, 2 Nov 2026.
  { path: "/overland/mexico/yucatan-and-the-riviera-maya-with-chable", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/guatemala/guatemala-in-7-days", priority: 0.7, changeFrequency: "monthly" },
  { path: "/overland/belize/deep-belize", priority: 0.7, changeFrequency: "monthly" },
];

/** Years on the road (exploring since 1982). The house says "44 years" in 2026. */
export const FOUNDER_YEARS = 44;

// The one door to the safari desk (rule, 30 Oct 2026): the menu item and the
// Safaris hub land on `page`; only that page links out to `url`.
export const SAFARI_DESK = { page: "/safaris/wild-co-safaris", url: "https://wildcosafaris.com" } as const;
