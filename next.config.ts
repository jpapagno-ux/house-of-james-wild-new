import type { NextConfig } from "next";
import redirects from "./redirects.json";
import journalPages from "./lib/journal-style/pages.json";
import journalReserves from "./lib/journal-style/reserves.json";

// Redirects: every old wildearthstays.com path maps 1:1 (permanent 301). The
// list grows in step 8 from the live site's sitemap (every stay and region).
// The wildearthstays.com domain itself is pointed at this project in Vercel
// and redirected to www.jameswildco.com at launch (step 9).
// Previews: an X-Robots-Tag noindex header on everything that isn't the
// production deployment, as a second lock beside robots.txt and meta robots.
const isProd = process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_INDEXING === "on";

// 3D terrain (components/maps/terrain): gated by a page allow-list in flag.ts, not by this config. There is no
// Content-Security-Policy header on this site, so its tile hosts (tiles.openfreemap.org, s3.amazonaws.com,
// api.maptiler.com) and MapLibre's worker need no allowance; if a CSP is added later it needs connect-src and img-src
// for those hosts and worker-src 'self' blob:.

// JWC-STYLE-01, the Modern Journal design pilot (lib/journal-style/flag.ts). The pilot's sample stays
// (lib/journal-style/pages.json) are served their new page at their own address by a rewrite, so the static stay
// page itself is never touched:
//  • flag off, production: no rule at all. The site is exactly as it is today.
//  • flag off, preview or local: only /stays/<slug>?journal=1 shows the new page.
//  • flag on: /stays/<slug> shows the new page (on a preview, ?journal=0 shows the old one for a before and after).
const journalOn = process.env.NEXT_PUBLIC_JOURNAL_STYLE === "on";
const journalSwitch = process.env.VERCEL_ENV !== "production";
// Stage 10: reserves on the locked template (lib/journal-style/reserves.json) follow the same switch at /safaris/<slug>.
const journalRewrites = [
  ...(journalPages.stays as string[]).map((slug) => ({ source: `/stays/${slug}`, destination: `/journal-style/stays/${slug}` })),
  ...(journalReserves.reserves as string[]).map((slug) => ({ source: `/safaris/${slug}`, destination: `/journal-style/safaris/${slug}` })),
].flatMap((rule) => {
  if (journalOn) return [journalSwitch ? { ...rule, missing: [{ type: "query" as const, key: "journal", value: "0" }] } : rule];
  return journalSwitch ? [{ ...rule, has: [{ type: "query" as const, key: "journal", value: "1" }] }] : [];
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // the share card (app/og) reads its fonts and seal from disk
  outputFileTracingIncludes: { "/og": ["./app/og/*.woff", "./app/og/*.png"] },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      // Ledger images hosted by the Base44 library (moving to Supabase storage).
      { protocol: "https", hostname: "base44.app" },
      { protocol: "https", hostname: "media.base44.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async redirects() {
    // An entry may carry statusCode 301 instead of permanent (308) where a true 301 is wanted (aliikai-voyage).
    return redirects as ({ source: string; destination: string; permanent: boolean } | { source: string; destination: string; statusCode: 301 | 308 })[];
  },
  async rewrites() {
    return { beforeFiles: journalRewrites, afterFiles: [], fallback: [] };
  },
  async headers() {
    return isProd ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
