import type { MetadataRoute } from "next";
import { isIndexable, absoluteUrl } from "@/lib/seo";

// Previews and local builds disallow everything; production (after launch)
// allows all crawlers, including answer engines, and points to the sitemap.
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/auth/", "/partner/", "/desk/", "/booking/property/", "/booking/quote/", "/booking/checkout/", "/booking/return"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
