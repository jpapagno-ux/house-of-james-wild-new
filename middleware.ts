import { NextResponse, type NextRequest } from "next/server";
import OLD_SITE from "@/lib/redirects/old-site.json";

// Old wildearthstays.com URLs -> their page on the new site (301), so the old
// site's rankings and inbound links carry over at the domain switch. The map is
// built by scripts/build-redirects.py from a crawl of the live Webflow site;
// re-run it as country, stay and voyage pages ship. Pattern redirects that
// don't need a lookup stay in redirects.json (next.config).
const MAP = OLD_SITE as Record<string, string>;

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const to = MAP[path] ?? MAP[path.toLowerCase()];
  if (!to) return NextResponse.next();
  const url = req.nextUrl.clone();
  const [p, hash] = to.split("#");
  const [pathname, query] = p.split("?");
  url.pathname = pathname;
  url.search = query ? `?${query}` : "";
  url.hash = hash ? `#${hash}` : "";
  return NextResponse.redirect(url, 301);
}

// Only the old site's URL families pass through the lookup; everything else skips it.
export const config = {
  matcher: ["/property/:path*", "/stay/:path*", "/book/:path*", "/country/:path*", "/itinerary/:path*", "/memoir/:path*", "/wellness-retreats/:path*", "/Contact", "/wild-earth-portfolio", "/find-stay", "/coming-soon", "/agent-application", "/influencer-application", "/request-itinerary", "/booking-itinerary", "/booking-form-retreat", "/wellness-retreats"],
};
