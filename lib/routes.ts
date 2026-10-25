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
  "/safaris",
  "/gatherings",
  "/voyages",
  "/overland",
  "/destinations",
  "/journal",
  "/legal/terms",
  "/legal/privacy",
  "/legal/booking-conditions",
];

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
  return BUILT.some((b) => (b.endsWith("/*") ? path.startsWith(b.slice(0, -1)) : b === path));
}

/** In production, drop links to unbuilt pages; in previews, keep them all. */
export function live<T extends { href: string }>(links: readonly T[], on = GUARD_ON): T[] {
  return on ? links.filter((l) => isBuilt(l.href)) : [...links];
}
