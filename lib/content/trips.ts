import type { TagInfo } from "@/components/notes/VoyageTag";
import land from "./trips/two-oceans-one-volcano.json";
import voyage from "./trips/10-day-raja-ampat-north.json";
import komodo5 from "./trips/5-day-komodo-island.json";
import founders7 from "./trips/the-original-costa-route-7-days.json";
import founders10 from "./trips/the-original-costa-route-10-days.json";
import foundersC2C from "./trips/the-original-costa-route-coast-to-coast.json";
import zaSandRiver from "./trips/the-sand-river-by-road.json";
import zaLens from "./trips/leopards-through-the-lens.json";
import zaTrack from "./trips/track-your-life-with-boyd-varty.json";
import zaPioneer from "./trips/three-generations-at-pioneer.json";
import polarCircle from "./trips/polar-circle-air-cruise.json";
import { activeGroups } from "@/lib/dates";

// Journeys (overland) and voyages, from James's route files. Each record is
// the content of one route page plus its JSON-LD; the live map's route lives
// in /public/maps/routes/<id>.json and the engraved fallback in ./trips/<id>.map.html.

/** credit: the photographer or owner line printed on the photo (e.g. "Photograph courtesy of Londolozi"). */
export type TripImg = { url: string; alt: string; credit?: string };
type Row = [string, string];
export type Trip = {
  id: string; kind: "overland" | "voyage"; h1: string; sub: string; crumbs: string[];
  seo: { path: string; title: string; description: string; keywords?: string[] };
  answer: string; quote: string; ledgerline: string; overview_title: string;
  meta: Row[]; herofacts: Row[]; herolabel: string; mark1: string; mark2: string;
  slides: { kicker: string; title: string; line: string; photo: string; bg: string }[];
  side: [string, string, string, string][];
  strip: Row[]; striptitle: string; strip_labels: string[];
  map_eyebrow: string; map_title: string; map_coord: string;
  suits: [string, string, string][]; twice: [string, string, string][];
  dayeyebrow: string; daytitle: string; staylabel: string; movelabel: string;
  days: { stayLinks?: [string, string][]; n: string; title: string; line: string; body: string; stay: string; meals: string; move: string; acts: string; img: string; head: boolean; stage: string; stageName: string; stageMeta: string; mark: string }[];
  exp_title: string;
  experiences: { name?: string; title?: string; kicker?: string; info?: string; dur?: string; incl?: string; season?: string; line?: string; chips?: string[]; photos?: string[]; body?: string; james?: string; rows?: Row[] }[];
  lodges_title?: string;
  lodges?: { name: string; line: string; chips: string[]; photos: string[]; body: string; james?: string; rows: Row[] }[];
  vessel?: { title: string; name: string; blurb: string; facts: Row[]; source?: string;
    gallery?: TripImg[];
    /** The line under "The cabins" (defaults to Aliikai's). */
    cabinsNote?: string;
    spaces?: { name: string; line: string; body: string; photos: TripImg[] }[];
    cabins?: { name: string; cat: string; deck: string; bed: string; sleeps: string; feats: string[]; night: number; photos: TripImg[] }[] };
  features: [string, string, string][];
  incl: string[]; excl: string[];
  calc: { title: string; note: string; maxG?: number; taxRate?: number; soloNote?: string; opts: { label: string; sub: string; pp: number; photo: string; sleeps: string; bed: string; size: string; feats: string }[]; adds: { label: string; sub: string; pp: number }[] };
  dates_head: [string, string, string];
  departures?: { source?: string; /** Set at build when this voyage's own sailings have all passed (lib/dates.ts). */ ownEnded?: boolean; groups: { name: string; nights: string; this?: boolean; sailings: { date: string; nights: number; price: number; status: string }[] }[] };
  dep_route?: string; dep_cta?: string; dep_season?: string; dep_note?: string;
  founder: { eyebrow: string; title: string; p1: string; p2: string; film: string; extra?: string; navLabel?: string;
    /** The founder's own footage, played silent and looping in place of the film placeholder. */
    video?: { src: string; poster: string; caption: string; alt: string };
    /** A photograph from the founder's own voyage, under the film. */
    photo?: TripImg };
  approve: { title: string; seal_bottom: string; seal_mark: string; why: string[]; quote: string };
  faqs: Row[]; reltitle: string; related: [string, string, string][];
  /** Links for the related cards, by position (else guessed from the card's code). */
  relatedHrefs?: string[];
  /** Day-by-day intro line (else the template's). */
  dayintro?: string;
  /** Tax line beside each departure price (default "+ 11% tax"; empty for none). */
  taxLine?: string;
  ctaline: string; ctabtn: string;
  prices_final: boolean; booking_live: boolean; copy_approved?: boolean;
  jsonld: Record<string, unknown>[];
  images?: Record<string, TripImg>;
  tag?: TagInfo;
  bestFor?: { who: string; why: string };
  /** The founder's testimony for this page: when he went, or plainly that he hasn't. */
  proof?: string;
  /** Why the route suits a first visit to the destination. */
  firstTime?: { eyebrow: string; title: string; intro: string; points: [string, string][] };
  /** Stay/vessel slugs whose live offers show on this route (Offer Ledger). */
  offerRefs?: string[];
  /** One line under the summary naming whose photographs the page uses. */
  photoCredit?: string;
  stamp?: { tint: string; tintName: string; label: string; where: string; sub: string; when: string; nudge: string; script: string; cta: string };
};

const FILED: Record<string, Trip> = {
  "two-oceans-one-volcano": land as unknown as Trip,
  "10-day-raja-ampat-north": voyage as unknown as Trip,
  "polar-circle-air-cruise": polarCircle as unknown as Trip,
  "5-day-komodo-island": komodo5 as unknown as Trip,
  "the-original-costa-route-7-days": founders7 as unknown as Trip,
  "the-original-costa-route-10-days": founders10 as unknown as Trip,
  "the-original-costa-route-coast-to-coast": foundersC2C as unknown as Trip,
  // South Africa: Londolozi routes (James, 30 Oct 2026). Copy approved by James 30 Oct 2026: indexed, in the sitemap and llms.txt.
  //   Founder mark: James stayed at Londolozi Varty Camp in 2018, so the 2018 mark names Varty Camp (James, 30 Oct 2026).
  //   Cape Town → Franschhoek: "about 1 hr 20 min by road" is James's own figure, house knowledge with no published
  //   source (James, 30 Oct 2026). Leeu Estates → Cape Town International (60–75 min) is a different leg, kept as is.
  "the-sand-river-by-road": zaSandRiver as unknown as Trip,
  "leopards-through-the-lens": zaLens as unknown as Trip,
  "track-your-life-with-boyd-varty": zaTrack as unknown as Trip,
  "three-generations-at-pioneer": zaPioneer as unknown as Trip,
};

// Sailings past their date are dropped here (lib/dates.ts), and a group left
// with none goes with them; a voyage with no sailings left shows "New dates to
// be announced" on its page (components/journey/TripPage).
function withActiveSailings(t: Trip): Trip {
  if (!t.departures) return t;
  const groups = activeGroups(t.departures.groups);
  const hadOwn = t.departures.groups.some((g) => g.this);
  const ownEnded = groups.length === 0 || (hadOwn && !groups.some((g) => g.this));
  // With its own sailings gone, the voyage's structured data stops offering them.
  const jsonld = ownEnded ? t.jsonld.map((x) => { const { offers: _gone, ...rest } = x; void _gone; return rest; }) : t.jsonld;
  return { ...t, jsonld, departures: { ...t.departures, ownEnded, groups } };
}
export const TRIPS: Record<string, Trip> = Object.fromEntries(Object.entries(FILED).map(([k, t]) => [k, withActiveSailings(t)]));

/** Routes built on a given stay (for "On these routes" bands). */
export const routesThrough = (staySlug: string) => Object.values(TRIPS).filter((t) => (t.offerRefs ?? []).includes(staySlug) || (t.lodges ?? []).some((l) => l.rows.some(([, v]) => v.includes(`/stays/${staySlug}"`))));
