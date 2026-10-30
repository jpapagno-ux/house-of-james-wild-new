"use client";
import Script from "next/script";
import { useEffect } from "react";

// Loads the house map script once, and asks it to draw the maps on this page every time a
// page with a map mounts. Without this, a route chart reached by clicking through the site
// (rather than opened directly) never drew, because the script only scanned the first page.
declare global { interface Window { JWEmbed?: { scan: () => void } } }

export default function MapBoot() {
  useEffect(() => { window.JWEmbed?.scan(); }, []);
  return <Script src="/maps/jw-embed.js" strategy="afterInteractive" />;
}
