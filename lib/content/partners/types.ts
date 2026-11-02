import type { ShipImage } from "@/lib/content/ships/types";

// A house partner page (/partners/<slug>, James, 2 Nov 2026): one shape for every operator the
// house works with (Antarctica21 first; Ecoventura, A&K and andBeyond to follow from data alone).
// Every fact comes from the partner's own website or media kit (CLAUDE.md, "Sources"); claims
// about themselves are printed with their attribution. Never commission, net rates or contact
// names. "Why we work with them" stays neutral and factual, never an invented James quote.
export type PartnerItinerary = { name: string; href: string; eyebrow: string; line: string; image?: ShipImage | null; price?: string | null; facts?: [string, string][] };
export type Partner = {
  slug: string;
  name: string;
  /** "Expedition operator", "Safari operator", "Small-ship operator". */
  kind: string;
  seo: { title: string; description: string; keywords?: string[] };
  /** One line under the name. */
  line: string;
  /** The answer, first (AEO). */
  answer: string;
  who: { facts: [string, string][]; history?: [string, string][] };
  /** How they work, in a few short paragraphs, and any facts that go with it (flights, fleet size). */
  how: { paragraphs: string[]; facts?: [string, string][] };
  /** Registry ship slugs (lib/content/ships/registry.ts); each links to her ship page. */
  fleet?: string[];
  fleetNote?: string;
  /** The partner's itineraries on this site, each with its page. */
  itineraries?: { title: string; items: PartnerItinerary[]; href?: string; hrefLabel?: string };
  /** What sets them apart, in their words, each with where they say it. */
  apart: { claim: string; attribution: string }[];
  /** Their own sustainability claims, attributed. */
  sustainability?: string[];
  /** Why the house works with them: neutral, factual reasons. */
  why: string[];
  faqs: [string, string][];
  hero: ShipImage;
  gallery: ShipImage[];
  credit: string;
  /** Where else on the site they live (a hub, a section). */
  related?: { label: string; href: string }[];
  organization: { foundingDate?: string; locality?: string; country?: string; memberOf?: string[] };
  sources: string[];
  checked: string;
};
