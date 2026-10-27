// The link guard. BUILT lists every page that exists in the current build
// step; in production any link to a page that isn't built is hidden from the
// header, menus and footer, so nothing broken goes live. Previews show every
// link (so the plan stays visible while we build). Add a path here the
// moment its page ships; the sitemap separately lists only pages that are
// both built and indexable (LIVE_ROUTES in site.ts).
//
// Turn the guard on in a preview with NEXT_PUBLIC_LINK_GUARD=on.

export const BUILT: string[] = [
  "/",
  "/compass",
  "/plan",
  "/plan/iggi",
  "/about",
  "/about/founder",
  "/about/team",
  "/advisors/*", // profiles; each is generated only when a bio is on file
  "/the-ledger",
  "/for-advisors",
  "/partners",
  "/stays",
  // Journeys and voyages from James's route files (lib/content/trips)
  "/overland/costa-rica/two-oceans-one-volcano",
  "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north",
  "/voyages/komodo/aliikai-5-day-komodo-island",
  "/voyages/ships/aliikai",
  "/safaris",
  // Reserves and their camps (scripts/export-reserves.py)
  "/safaris/lion-sands",
  "/safaris/lion-sands/ivory-lodge",
  "/safaris/lion-sands/river-lodge",
  "/safaris/lion-sands/narina-lodge",
  "/safaris/lion-sands/tinga-lodge",
  "/safaris/lion-sands/fish-eagle-residence",
  "/safaris/lion-sands/hinkwenu-residence",
  "/safaris/londolozi-reserve",
  "/safaris/londolozi-reserve/founders-camp",
  "/safaris/londolozi-reserve/varty-camp",
  "/safaris/londolozi-reserve/tree-camp",
  "/safaris/londolozi-reserve/pioneer-camp",
  "/safaris/londolozi-reserve/private-granite-suites",
  "/safaris/lalibela-reserve",
  "/safaris/lalibela-reserve/marks-camp",
  "/safaris/lalibela-reserve/kichaka-lodge",
  "/safaris/lalibela-reserve/lentaba-lodge",
  "/safaris/lalibela-reserve/inzolo-lodge",
  "/safaris/lalibela-reserve/tree-tops-safari-lodge",
  "/safaris/lalibela-reserve/mills-manor-residence",
  "/gatherings",
  "/voyages",
  "/overland",
  "/destinations",
  "/destinations/africa",
  "/destinations/asia",
  "/destinations/usa-canada",
  "/destinations/central-america",
  "/destinations/caribbean-mexico",
  "/destinations/oceania",
  "/destinations/south-america",
  "/destinations/europe",
  "/destinations/central-america/costa-rica",
  "/destinations/africa/south-africa",
  "/destinations/asia/indonesia",
  "/destinations/asia/indonesia/raja-ampat",
  "/destinations/asia/indonesia/komodo",
  "/destinations/polar-arctic",
  "/journal",
  "/journal/monwana-couples-first-safari",
  "/workshops",
  "/legal/terms",
  "/legal/privacy",
  "/legal/booking-conditions",
];

// BEGIN GENERATED STAYS (scripts/export-stays.py rewrites this list)
export const STAY_SLUGS: string[] = [
  "aguas-claras",
  "amor-arenal",
  "arenal-springs-camp-by-nayara",
  "arenas-del-mar-resort",
  "babylonstoren",
  "camp-hwange-muddy-teak",
  "cape-cadogan-boutique-hotel",
  "cheetah-plains",
  "coot-club",
  "dulini-daunara-lodge",
  "dulini-leadwood-lodge",
  "dulini-moya-lodge",
  "dulini-river-lodge",
  "ellerman-house",
  "gorongosa-safaris",
  "grootbos-private-nature-reserve",
  "gwe-gwe-beach-lodge",
  "isla-palenque-resort",
  "kura-boutique-resort",
  "kwande-private-game-reserve",
  "la-cle",
  "la-residence",
  "lales-camp-expeditions",
  "lalibela-reserve",
  "lapa-rios-lodge",
  "le-quartier-francais",
  "leeu-estates",
  "leeu-house",
  "lekkerwater-dehoop",
  "leopard-hills",
  "lion-sands",
  "londolozi-reserve",
  "madikwe",
  "monwana-thornybush",
  "morukuru-farm-house",
  "nayara-gardens",
  "nayara-tented-camp",
  "ngala-safari-lodge-by-beyond",
  "pacuare-lodge",
  "pearl-resort-vahine-private-island",
  "phinda-homestead-by-and-beyond",
  "pods-camp-bay",
  "royal-malewane",
  "samara-karoo-reserve",
  "senda-monteverde-lodge",
  "singita-boulders",
  "singita-castleton",
  "singita-ebony",
  "singita-ebony-villa",
  "singita-lebombo",
  "singita-lebombo-villa",
  "singita-sweni",
  "tabacon-thermal-resort-spa",
  "tanda-tula",
  "tengile-mala-mala-camp",
  "tengile-mala-mala-kirkmans-kamp",
  "tengile-mala-mala-rattrays-lodge",
  "tengile-mala-mala-sable-camp",
  "tengile-river-lodge-by-mala-mala",
  "the-art-villa",
  "tswalu-reserve",
];
// END GENERATED STAYS

export const GUARD_ON = process.env.NEXT_PUBLIC_LINK_GUARD === "on" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

// Pages that actually read their query string. A filter link such as
// /stays?by=land only appears once its hub can filter; until then it would
// just reload the same page.
export const QUERY_AWARE: string[] = ["/plan", "/compass"];

/** True when the link's page exists (external links always pass). */
export function isBuilt(href: string): boolean {
  if (/^(https?:|mailto:|tel:)/.test(href)) return true;
  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (href.split("#")[0].includes("?") && !QUERY_AWARE.includes(path)) return false;
  if (path.startsWith("/stays/")) return STAY_SLUGS.includes(path.slice(7));
  return BUILT.some((b) => (b.endsWith("/*") ? path.startsWith(b.slice(0, -1)) : b === path));
}

/** In production, drop links to unbuilt pages; in previews, keep them all. */
export function live<T extends { href: string }>(links: readonly T[], on = GUARD_ON): T[] {
  return on ? links.filter((l) => isBuilt(l.href)) : [...links];
}
