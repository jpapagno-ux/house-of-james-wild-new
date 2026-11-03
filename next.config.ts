import type { NextConfig } from "next";
import redirects from "./redirects.json";

// Redirects: every old wildearthstays.com path maps 1:1 (permanent 301). The
// list grows in step 8 from the live site's sitemap (every stay and region).
// The wildearthstays.com domain itself is pointed at this project in Vercel
// and redirected to www.jameswildco.com at launch (step 9).
// Previews: an X-Robots-Tag noindex header on everything that isn't the
// production deployment, as a second lock beside robots.txt and meta robots.
const isProd = process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_INDEXING === "on";

// The 3D terrain pilot (components/maps/terrain): on in preview deployments, off in production until James sets
// NEXT_PUBLIC_TERRAIN_PILOT=true there. There is no Content-Security-Policy header on this site, so its tile hosts
// (tiles.openfreemap.org, s3.amazonaws.com, api.maptiler.com) and MapLibre's blob: worker need no allowance; if a CSP
// is added later it needs connect-src and img-src for those hosts and worker-src 'self' blob:.
const terrainPilot = process.env.NEXT_PUBLIC_TERRAIN_PILOT ?? (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" ? "true" : "false");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: { NEXT_PUBLIC_TERRAIN_PILOT: terrainPilot },
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
  async headers() {
    return isProd ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
