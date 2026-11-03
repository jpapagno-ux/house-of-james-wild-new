import { hubOffers, type HubOffer } from "@/lib/content/offers/hub";
import { STAYS, VESSEL_RECORDS, pageReady, stayBySlug, vesselBySlug } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { vesselHref } from "@/lib/content/vessels";
import { SHIPS, shipPath } from "@/lib/content/ships";
import { cruiseOnly } from "@/lib/content/ships/types";
import { boardDay } from "@/lib/content/coming-view";
import type { VolumeKey } from "@/lib/volumes";
import { RESERVES, reserveBySlug } from "@/lib/content/reserves";
import { offerLastDay, today } from "@/lib/dates";
import { boardStatus, mixBoard, offerBoardLines, offerIsPublic, type BoardEntry } from "@/lib/content/coming-view";
import type { Coming } from "@/lib/content/whats-coming";

// The departures board's entries (James, 2 Nov 2026: "add updated specials and savings for the ticker"):
// What's Coming openings mixed with live offers from the Offer Ledger. An offer shows through the day it
// expires and never past a departure (lib/dates.ts offerLastDay, via liveOffers); only offers whose page is
// built are listed, so every entry links somewhere; trade terms never appear. Words are the Ledger's own.

/** The property an offer belongs to, its name and country (stay, vessel, reserve or reserve camp). */
function owner(o: HubOffer): { name: string; countrySlug: string | null; country: string | null } {
  const st = stayBySlug(o.ref) ?? vesselBySlug(o.ref);
  if (st) return { name: st.name, countrySlug: st.countrySlug, country: st.country };
  const r = reserveBySlug(o.ref);
  if (r) return { name: r.name, countrySlug: r.stay.countrySlug, country: r.stay.country };
  for (const res of RESERVES) {
    const c = res.camps.find((x) => x.slug === o.ref);
    if (c) return { name: c.name, countrySlug: res.stay.countrySlug, country: res.stay.country };
  }
  return { name: o.name, countrySlug: null, country: o.place };
}

export type BoardOffer = BoardEntry & { countrySlug: string | null; ref: string; id: string; checked: string };

/** Every live, linkable, public offer as a board entry: most recently checked first, then ending soonest. One per property. */
export function offerEntries(on: string = today()): BoardOffer[] {
  const seen = new Set<string>();
  return hubOffers(on)
    .filter((o) => o.href && offerIsPublic(o))
    .map((o) => ({ o, last: offerLastDay(o) }))
    .sort((a, b) => b.o.checked.localeCompare(a.o.checked) || (a.last ?? "9999").localeCompare(b.last ?? "9999") || a.o.id.localeCompare(b.o.id))
    .filter(({ o }) => (seen.has(o.ref) ? false : (seen.add(o.ref), true)))
    .map(({ o, last }) => {
      const who = owner(o);
      return { key: o.id, id: o.id, ref: o.ref, checked: o.checked, kind: "offer" as const, place: who.country, countrySlug: who.countrySlug, name: who.name, href: o.href!, ...offerBoardLines(o, last) };
    });
}

export const openingEntries = (items: readonly Coming[]): BoardEntry[] =>
  items.map((c) => ({ key: c.slug, kind: "opening", place: c.country, name: c.name, flap: boardStatus(c), href: c.href ?? `/whats-coming#${c.slug}` }));

/** The main board: every opening, and the ten most recently updated offers dealt in between. */
export function mainBoard(items: readonly Coming[], on: string = today(), offers = 10): BoardEntry[] {
  return mixBoard(openingEntries(items), offerEntries(on).slice(0, offers));
}

/** A country page's board: that country's openings and its live offers (up to twelve). */
export function countryBoard(items: readonly Coming[], countrySlug: string, on: string = today()): BoardEntry[] {
  return mixBoard(openingEntries(items.filter((c) => c.countrySlug === countrySlug)), offerEntries(on).filter((o) => o.countrySlug === countrySlug).slice(0, 12));
}

/** A coming stay's board: the other openings in its region, and live offers in its country. */
export function stayBoard(items: readonly Coming[], self: Coming, on: string = today()): BoardEntry[] {
  const others = items.filter((x) => x.slug !== self.slug && x.regionSlug && x.regionSlug === self.regionSlug);
  const offers = self.countrySlug ? offerEntries(on).filter((o) => o.countrySlug === self.countrySlug).slice(0, 8) : [];
  return mixBoard(openingEntries(others), offers);
}

// ---------- the live board (James, 3 Nov 2026: a country's and a region's live board) ----------
// Four kinds, each linking to its page, every word from the record: New to the Ledger (stays, Gatherings residences
// and yachts filed in the last 90 days, by the library's filed date), Next sailing (a ship's next published departure,
// the date only, never cabins or spaces left), Offer (offerEntries: public, linkable, until it expires, no trade
// terms) and Opening (What's Coming). Dated entries drop out at render by today(); new filings arrive with the
// nightly Library sync. The kinds are dealt in turn so no one kind fills the board; a country with fewer than six
// entries is topped up from its region, labelled "Also in <region>".

const VOLUMES = new Set<VolumeKey>(["stays", "safaris", "gatherings", "voyages", "europe", "overland"]);
const asVolume = (v: string | null | undefined): VolumeKey | null => (v && VOLUMES.has(v as VolumeKey) ? (v as VolumeKey) : null);
const slugOf = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const REGION_OF = new Map<string, string>(STAYS.filter((x) => x.countrySlug && x.regionSlug).map((x) => [x.countrySlug as string, x.regionSlug as string]));
const volumeOfRef = (ref: string) => { const r = stayBySlug(ref) ?? vesselBySlug(ref); return asVolume((r as { volumes?: string[] } | undefined)?.volumes?.[0] ?? null); };

type Placed = BoardEntry & { countrySlug: string | null; regionSlug: string | null };
const NEW_DAYS = 90;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

/** Records filed in the last 90 days. The library export carries a record's filed date as `filed` (ISO); a record
 *  without one is never called new, so nothing is dated by guesswork. */
export function newEntries(on: string = today()): Placed[] {
  const filedOf = (r: unknown) => (r as { filed?: string | null; created?: string | null }).filed ?? (r as { created?: string | null }).created ?? null;
  return [...STAYS, ...VESSEL_RECORDS]
    .map((r) => ({ r, f: filedOf(r) }))
    .filter(({ r, f }) => (VESSEL_RECORDS.includes(r) || pageReady(r)) && !!f && /^\d{4}-\d{2}-\d{2}/.test(f) && daysBetween(f.slice(0, 10), on) >= 0 && daysBetween(f.slice(0, 10), on) <= NEW_DAYS)
    .sort((a, b) => b.f!.localeCompare(a.f!))
    .map(({ r, f }) => ({ key: `new-${r.slug}`, kind: "new" as const, place: r.country, name: r.name, flap: `NEW TO THE LEDGER · ${boardDay(f!.slice(0, 10))}`, href: VESSEL_RECORDS.includes(r) ? vesselHref(r.slug) : recordHref("stay", r.slug), volume: asVolume((r as { volumes?: string[] }).volumes?.[0] ?? null), countrySlug: r.countrySlug, regionSlug: r.regionSlug }));
}

/** Each ship's next published departure (cruise fares only; package journeys and season bands are not sailings). */
export function sailingEntries(on: string = today()): Placed[] {
  const out: Placed[] = [];
  for (const e of SHIPS) {
    const next = cruiseOnly(e.data).filter((d) => !d.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.date >= on).sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!next) continue;
    const country = e.reg.country[0] ?? null, cs = country ? slugOf(country) : null;
    out.push({ key: `sail-${e.slug}`, kind: "sailing", place: country, name: e.data.name, flap: `NEXT SAILING · ${boardDay(next.date)}`, href: `${shipPath(e.slug)}#dates`, volume: "voyages", countrySlug: cs, regionSlug: cs ? REGION_OF.get(cs) ?? null : null });
  }
  return out.sort((a, b) => a.flap.localeCompare(b.flap));
}

/** Deal the kinds in turn (opening, sailing, offer, new), so the board reads as a mix; no entry appears twice. */
export function dealKinds(lists: readonly (readonly BoardEntry[])[]): BoardEntry[] {
  const out: BoardEntry[] = [], seen = new Set<string>(), qs = lists.map((l) => [...l]);
  while (qs.some((q) => q.length)) for (const q of qs) { const e = q.shift(); if (e && !seen.has(e.key)) { seen.add(e.key); out.push(e); } }
  return out;
}

export const BOARD_MIN = 6;
/** The live board for a country (countrySlug) or a whole region (no countrySlug). */
export function liveBoard(items: readonly Coming[], scope: { regionSlug: string; regionName: string; countrySlug?: string }, on: string = today()): BoardEntry[] {
  const openings: Placed[] = items.map((c) => ({ ...openingEntries([c])[0], volume: asVolume(c.volume) ?? "stays", countrySlug: c.countrySlug, regionSlug: c.regionSlug }));
  const offers: Placed[] = offerEntries(on).map((o) => ({ ...o, volume: volumeOfRef(o.ref), regionSlug: o.countrySlug ? REGION_OF.get(o.countrySlug) ?? null : null }));
  const sails = sailingEntries(on), fresh = newEntries(on);
  const pick = (test: (e: Placed) => boolean) => dealKinds([openings.filter(test), sails.filter(test), offers.filter(test).slice(0, 12), fresh.filter(test)]);
  const strip = (e: BoardEntry): BoardEntry => { const { countrySlug: _c, regionSlug: _r2, ...rest } = e as Placed; void _c; void _r2; return rest; };
  if (!scope.countrySlug) return pick((e) => e.regionSlug === scope.regionSlug).map(strip);
  const local = pick((e) => e.countrySlug === scope.countrySlug);
  if (local.length >= BOARD_MIN) return local.map(strip);
  const extra = pick((e) => e.regionSlug === scope.regionSlug && e.countrySlug !== scope.countrySlug).slice(0, BOARD_MIN - local.length).map((e) => ({ ...e, also: `Also in ${scope.regionName}` }));
  return [...local, ...extra].map(strip);
}
