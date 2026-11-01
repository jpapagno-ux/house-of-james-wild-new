import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import OLD_SITE from "@/lib/redirects/old-site.json";

// One middleware, two jobs, each on its own paths (see matcher). Every other
// public page — stays, safaris, voyages, destinations — never runs it.
//
// 1. Old wildearthstays.com URLs -> their page on the new site (301), so the old
//    site's rankings and inbound links carry over at the domain switch. The map is
//    built by scripts/build-redirects.py from a crawl of the live Webflow site;
//    re-run it as country, stay and voyage pages ship. Pattern redirects that
//    don't need a lookup stay in redirects.json (next.config).
// 2. Session refresh on private routes only (/account, /auth, /api/v1/me for
//    Booking Live; /partner, /desk, /api/v1/partner for the Partner Desk). Off
//    entirely until the accounts flag or the Partner Desk flag is on.

const MAP = OLD_SITE as Record<string, string>;
const PRIVATE = /^\/(account|auth|booking|partner|desk|api\/v1\/(me|quotes|ops|partner|desk))(\/|$)/;
const DESK = /^\/(partner|desk|api\/v1\/(partner|desk))(\/|$)/;

function oldSiteRedirect(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const to = MAP[path] ?? MAP[path.toLowerCase()];
  if (!to) return null;
  const url = req.nextUrl.clone();
  const [p, hash] = to.split("#");
  const [pathname, query] = p.split("?");
  url.pathname = pathname;
  url.search = query ? `?${query}` : "";
  url.hash = hash ? `#${hash}` : "";
  return NextResponse.redirect(url, 301);
}

async function refreshSession(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const accounts = process.env.NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS === "on", desk = process.env.NEXT_PUBLIC_PARTNER_DESK === "on";
  const path = req.nextUrl.pathname;
  const wanted = DESK.test(path) ? desk : path.startsWith("/auth") ? accounts || desk : accounts;
  if (!wanted || !url || !key) return NextResponse.next();
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  // Refreshes an expiring session; the result is not trusted for authorisation
  // (pages and APIs call getUser() themselves).
  await sb.auth.getUser();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function middleware(req: NextRequest) {
  if (PRIVATE.test(req.nextUrl.pathname)) return refreshSession(req);
  return oldSiteRedirect(req) ?? NextResponse.next();
}

export const config = {
  matcher: [
    // Old site URL families (301 lookup)
    "/property/:path*", "/stay/:path*", "/book/:path*", "/country/:path*", "/itinerary/:path*", "/memoir/:path*", "/wellness-retreats/:path*", "/Contact", "/wild-earth-portfolio", "/find-stay", "/coming-soon", "/agent-application", "/influencer-application", "/request-itinerary", "/booking-itinerary", "/booking-form-retreat", "/wellness-retreats",
    // Booking Live private routes (session refresh)
    "/account/:path*", "/auth/:path*", "/booking/:path*", "/api/v1/me/:path*", "/api/v1/quotes", "/api/v1/ops/:path*",
    // Partner Desk private routes (session refresh)
    "/partner/:path*", "/desk/:path*", "/api/v1/partner/:path*", "/api/v1/desk/:path*",
  ],
};
