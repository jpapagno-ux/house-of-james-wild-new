import type { NextConfig } from "next";
import redirects from "./redirects.json";

// Redirects: every old wildearthstays.com path maps 1:1 (permanent 301). The
// list grows in step 8 from the live site's sitemap (every stay and region).
// The wildearthstays.com domain itself is pointed at this project in Vercel
// and redirected to www.jameswildco.com at launch (step 9).
// Previews: an X-Robots-Tag noindex header on everything that isn't the
// production deployment, as a second lock beside robots.txt and meta robots.
const isProd = process.env.VERCEL_ENV === "production" && process.env.NEXT_PUBLIC_INDEXING === "on";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      // Ledger images hosted by the Base44 library (moving to Supabase storage).
      { protocol: "https", hostname: "base44.app" },
      { protocol: "https", hostname: "media.base44.com" },
    ],
  },
  async redirects() {
    return redirects as { source: string; destination: string; permanent: boolean }[];
  },
  async headers() {
    return isProd ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
