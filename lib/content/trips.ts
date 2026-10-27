import type { TagInfo } from "@/components/notes/VoyageTag";
import land from "./trips/two-oceans-one-volcano.json";
import voyage from "./trips/10-day-raja-ampat-north.json";
import komodo5 from "./trips/5-day-komodo-island.json";

// Journeys (overland) and voyages, from James's route files. Each record is
// the content of one route page plus its JSON-LD; the live map's route lives
// in /public/maps/routes/<id>.json and the engraved fallback in ./trips/<id>.map.html.

export type TripImg = { url: string; alt: string };
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
  days: { n: string; title: string; line: string; body: string; stay: string; meals: string; move: string; acts: string; img: string; head: boolean; stage: string; stageName: string; stageMeta: string; mark: string }[];
  exp_title: string;
  experiences: { name?: string; title?: string; kicker?: string; info?: string; dur?: string; incl?: string; season?: string; line?: string; chips?: string[]; photos?: string[]; body?: string; james?: string; rows?: Row[] }[];
  lodges_title?: string;
  lodges?: { name: string; line: string; chips: string[]; photos: string[]; body: string; james?: string; rows: Row[] }[];
  vessel?: { title: string; name: string; blurb: string; facts: Row[]; source?: string;
    gallery?: TripImg[];
    spaces?: { name: string; line: string; body: string; photos: TripImg[] }[];
    cabins?: { name: string; cat: string; deck: string; bed: string; sleeps: string; feats: string[]; night: number; photos: TripImg[] }[] };
  features: [string, string, string][];
  incl: string[]; excl: string[];
  calc: { title: string; note: string; maxG?: number; taxRate?: number; soloNote?: string; opts: { label: string; sub: string; pp: number; photo: string; sleeps: string; bed: string; size: string; feats: string }[]; adds: { label: string; sub: string; pp: number }[] };
  dates_head: [string, string, string];
  departures?: { source?: string; groups: { name: string; nights: string; this?: boolean; sailings: { date: string; nights: number; price: number; status: string }[] }[] };
  dep_route?: string; dep_cta?: string; dep_season?: string; dep_note?: string;
  founder: { eyebrow: string; title: string; p1: string; p2: string; film: string; extra?: string; navLabel?: string };
  approve: { title: string; seal_bottom: string; seal_mark: string; why: string[]; quote: string };
  faqs: Row[]; reltitle: string; related: [string, string, string][];
  ctaline: string; ctabtn: string;
  prices_final: boolean; booking_live: boolean;
  jsonld: Record<string, unknown>[];
  images?: Record<string, TripImg>;
  tag?: TagInfo;
  bestFor?: { who: string; why: string };
  stamp?: { tint: string; tintName: string; label: string; where: string; sub: string; when: string; nudge: string; script: string; cta: string };
};

export const TRIPS: Record<string, Trip> = {
  "two-oceans-one-volcano": land as unknown as Trip,
  "10-day-raja-ampat-north": voyage as unknown as Trip,
  "5-day-komodo-island": komodo5 as unknown as Trip,
};
