// Reserves: the parent page for an African reserve and the camps, lodges and
// residences inside it. Built by scripts/export-reserves.py from the library's
// Room records (camps = is_parent_stay, suites assigned by name) plus the
// reserve's Stay record. Founder marks follow lib/ledger/status.ts.
import data from "./reserves.json";
import { STAYS, pageReady, type StayData } from "./stays";
import type { HouseStatus } from "@/lib/ledger/status";

export type ReserveRoom = { name: string; capacity: number | null; quantity: number | null; beds: string | null; from: number | null; currency: string; basis: string | null; photos: string[] };
export type ReserveCamp = { slug: string; name: string; key: string; kind: "camp" | "residence" | "suite"; intro: string; description: string; units: string[]; features: string[]; experiences: string[]; hero: string | null; gallery: string[]; rooms: ReserveRoom[]; fromRate: number | null;
  // A lodge with its own Stay page (shared reserves such as Madikwe): the card links there.
  stayHref?: string | null };
type Block = { title?: string | null; body: string };
export type ReserveStay = { ledgerId: string | null; tagline: string | null; quote: string | null; hero: string | null; gallery: string[]; bestMonths: string | null; bestMonthsNote: string | null; airport: string | null; airportDirections: string | null; coords: { lat: number; lng: number } | null; why: Block[]; experiences: { items: string[]; paras: string[] }; features: { items: string[]; paras: string[] }; onlyHere: string[]; country: string | null; countrySlug: string | null; regionSlug: string | null; status: string | null; statusDate: string | null; founderNote?: string | null };
// shared: a reserve whose lodges are run independently (Madikwe), not one owner's camps.
export type Reserve = { slug: string; name: string; rsv: string; area: string; province: string; shared?: boolean; stay: ReserveStay; camps: ReserveCamp[] };

// Shared reserves (lodges run independently, each with its own Stay page) are built
// from the Stay export on every publish, so the library stays the source:
//   stay: the reserve's own Stay record; camps: the Stay records of its lodges.
type SharedDef = { slug: string; name: string; rsv: string; area: string; province: string; stay: string; camps: string[] };
const SHARED: SharedDef[] = [
  { slug: "madikwe", name: "Madikwe Game Reserve", rsv: "RSV-2026-000008", area: "North West Province", province: "North West Province", stay: "madikwe", camps: ["jacis-private-lodge", "morukuru-farm-house"] },
];
const fromStay = (s: StayData): ReserveStay => ({ ledgerId: s.ledgerId, tagline: s.tagline, quote: s.quote, hero: s.hero, gallery: s.gallery, bestMonths: s.bestMonths, bestMonthsNote: s.bestMonthsNote, airport: s.airport, airportDirections: s.airportDirections, coords: s.coords, why: s.why, experiences: s.experiences, features: s.features, onlyHere: s.onlyHere, country: s.country, countrySlug: s.countrySlug, regionSlug: s.regionSlug, status: s.status, statusDate: s.statusDate, founderNote: s.founderNote });
const campFromStay = (s: StayData): ReserveCamp => ({ slug: s.slug, name: s.name, key: s.name, kind: /house|villa|residence/i.test(s.name) ? "residence" : "camp", intro: s.tagline ?? "", description: s.quote ?? s.why[0]?.body ?? "", units: [...s.rooms.items], features: [...s.features.items], experiences: [...s.experiences.items], hero: s.hero, gallery: s.gallery, rooms: [], fromRate: null, stayHref: pageReady(s) ? `/stays/${s.slug}` : null });
const shared: Reserve[] = SHARED.flatMap((d) => {
  const st = STAYS.find((s) => s.slug === d.stay);
  if (!st || !pageReady(st)) return [];
  const camps = d.camps.map((c) => STAYS.find((s) => s.slug === c)).filter((s): s is StayData => !!s).map(campFromStay);
  // A reserve page needs at least two lodges on the site to be worth its own page.
  if (camps.filter((c) => c.stayHref).length < 2) return [];
  return [{ slug: d.slug, name: d.name, rsv: d.rsv, area: d.area, province: d.province, shared: true, stay: fromStay(st), camps }];
});

// Every reserve reads its own copy (best months, airport, why, photos) from the Stay
// export at build time, so a library edit reaches the reserve page on the next publish.
const fresh = (r: Reserve): Reserve => { const s = STAYS.find((x) => x.slug === r.slug); return s ? { ...r, stay: fromStay(s) } : r; };
// House order on /safaris: the founder's own reserves first.
const FIRST = ["tswalu-reserve", "lion-sands"];
export const RESERVES = [...(data.reserves as unknown as Reserve[]).map(fresh), ...shared].sort((a, b) => (FIRST.indexOf(a.slug) + 1 || 99) - (FIRST.indexOf(b.slug) + 1 || 99));
export const reserveBySlug = (slug: string) => RESERVES.find((r) => r.slug === slug);

// A camp gets its own page when it has a photograph to lead with.
export const campReady = (c: ReserveCamp) => !!c.hero && !c.stayHref;
// Where a camp card links: its own camp page, or its Stay page on a shared reserve.
export const campHref = (r: Reserve, c: ReserveCamp) => c.stayHref ?? (campReady(c) ? `/safaris/${r.slug}/${c.slug}` : null);
export const campBySlug = (r: Reserve, slug: string) => r.camps.find((c) => c.slug === slug && campReady(c));

// Founder status per camp. The library holds house_status on Stay records
// only; camps are Room records, so a status James has stated is kept here
// until the field exists on the camp record.
//   Ivory Lodge: stayed and vetted May 2026, "a five-star favourite" (James, 25 Oct 2026)
export const CAMP_STATUS: Record<string, { status: HouseStatus; date: string; line: string }> = {
  //   The Motse: "where it all began for me at Tswalu", May 2012; Tswalu is his number one founder favourite (James, 30 Oct 2026)
  "tswalu-reserve/motse": { status: "founder_returned", date: "2012-05", line: "James stayed at The Motse in May 2012; Tswalu is his number one founder favourite" },
  "lion-sands/ivory-lodge": { status: "founder_visited", date: "2026-05", line: "James stayed at Ivory Lodge in May 2026 and calls it a five-star favourite" },
  //   Varty Camp: James stayed at Londolozi Varty Camp in 2018 (James, 30 Oct 2026). Varty only; no mark on Londolozi's other camps.
  "londolozi-reserve/varty-camp": { status: "founder_visited", date: "2018", line: "James stayed at Varty Camp in 2018" },
};
export const campStatus = (r: Reserve, c: ReserveCamp) => CAMP_STATUS[`${r.slug}/${c.slug}`];

export const KIND_LABEL: Record<ReserveCamp["kind"], string> = { camp: "Lodge & camp", residence: "Private residence", suite: "Private suite" };
export const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
export const reserveFrom = (r: Reserve) => { const f = r.camps.flatMap((c) => c.rooms.filter((m) => m.from && c.kind === "camp").map((m) => m.from as number)); return f.length ? Math.min(...f) : null; };

// Whose photographs each reserve's pages use (the reserve's own media library,
// supplied to us as its booking partner). Printed under the gallery and written
// into each image's structured data.
export const RESERVE_PHOTO_CREDIT: Record<string, string> = {
  "lion-sands": "Lion Sands Game Reserve",
  "londolozi-reserve": "Londolozi",
  "lalibela-reserve": "Lalibela Game Reserve",
  "tswalu-reserve": "Tswalu Kalahari",
};
