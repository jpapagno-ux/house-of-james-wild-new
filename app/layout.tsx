import type { Metadata, Viewport } from "next";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/caveat/500.css";
import "./globals.css";
import JsonLd from "@/components/ledger/JsonLd";
import SiteFooter from "@/components/ledger/SiteFooter";
import MobileActionBar from "@/components/ledger/MobileActionBar";
import { ScrollProgress } from "@/components/ledger/Motion";
import { founder, graph, organization, website } from "@/lib/schema";
import { isIndexable } from "@/lib/seo";
import { SITE } from "@/lib/site";

// Root layout: fonts (self-hosted, no third-party request), the house graph
// (Organization + founder + WebSite) on every page, footer and the mobile
// action bar. Each page renders its own header so the home page can float it
// over the film (overlay) while other pages keep it on paper.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Vetted Safaris, Stays & Voyages`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#F4F1ED", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="ledger-page ledger-body min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-paper focus:px-4 focus:py-2">
          Skip to content
        </a>
        <ScrollProgress />
        {children}
        <SiteFooter />
        <MobileActionBar />
        <JsonLd data={graph(organization(), founder(), website())} />
      </body>
    </html>
  );
}
