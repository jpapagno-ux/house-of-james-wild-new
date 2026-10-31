// The Advisor Desk: what an advisor carries in the book, and how the house
// finds the right advisor for a place. Ported from the James Wild & Co
// design (advisor-profile-sample-*.html, stay-sample-monwana-advisors.html,
// James, Oct 2026) into the Ledger data model.
//
// Two words the site is built on:
//   Advisor-led   — who travels with you. A named advisor with an ADV number
//                   carries the journey from first call to Folio. James
//                   vouches for the place; the advisor vouches for the client.
//   Advisor-built — who wrote the entry. A Ledger entry the advisor walked,
//                   stayed or sailed and marked in green ink; James's mark
//                   sits beside it, or "Pencilled · awaiting mark" until he
//                   has been.
//
// Oxblood is James's ink. Green is the advisor's. Dashed grey is pencil.
//
// SAMPLE advisors (sample: true) are invented to show the layout across the
// volumes and destinations; their names, agencies, contact details,
// photographs (AI-generated) and bookings are not real. James's marks and
// Ledger IDs are real. Real advisors (Kristina, Anthony) carry only what
// they have stated first-hand.

export type Volume = "stays" | "safaris" | "gatherings" | "voyages" | "overland" | "europe";

export const VOLUME_LABEL: Record<Volume, string> = {
  stays: "Stays",
  safaris: "Safaris",
  gatherings: "Gatherings",
  voyages: "Voyages",
  overland: "Overland",
  europe: "Other Europe",
};

export const VOLUME_HREF: Record<Volume, string> = {
  stays: "/stays",
  safaris: "/safaris",
  gatherings: "/gatherings",
  voyages: "/voyages",
  overland: "/overland",
  europe: "/europe",
};

// James's marks (the house vetting system) and the advisor's own marks.
export type JamesMark = "I Know a Place" | "I've Walked It" | "I Keep Going Back" | "I Know the Host" | "I Know Who Knows" | "Pencilled";
export type AdvisorMark = "Stayed" | "Walked It" | "Sailed It" | "Sent Guests";

export type DeskEntry = {
  ledgerId: string; // STY-…, ITN-VSL-…, RES-… (real where the Ledger has them)
  name: string;
  place: string; // "Franschhoek · South Africa"
  href: string | null; // record page, when built
  countrySlug: string | null; // ties the entry to a destination page
  regionSlug: string | null;
  volume: Volume;
  james: { mark: JamesMark; year?: number; favourite?: boolean };
  theirs: { mark: AdvisorMark; when?: string } | null; // null = sent guests only
  guests: number;
  folios: string[]; // FOL·420 …
  last: string; // "Oct 26"
  note?: string; // the advisor's own line on the place
};

export type DeskProfile = {
  adv: string; // ADV-2026-000033
  sample: boolean;
  since: number; // advising since
  joined: number; // Advisor Desk since
  agency: string | null;
  base: string | null; // "New York, New York"
  languages: string[];
  volumes: Volume[]; // which volumes the advisor carries entries in
  countries: string[]; // destination country slugs the advisor knows
  specialties: string[]; // shown on the card; approved for samples by definition
  line: string; // in their own words
  entries: DeskEntry[];
  folios: { id: string; title: string; route: string; status: "Open" | "Quoted" | "Booked" }[];
};

// Counters derived from the sheet, as the sample profile shows them.
export const deskCounts = (d: DeskProfile) => ({
  carried: d.entries.length,
  guests: d.entries.reduce((n, e) => n + e.guests, 0),
  folios: new Set(d.entries.flatMap((e) => e.folios)).size,
  slept: d.entries.filter((e) => e.theirs && e.theirs.mark !== "Sent Guests").length,
});

export const GREEN_INK = "#2F6B3A"; // the advisor's ink, approved Oct 2026
