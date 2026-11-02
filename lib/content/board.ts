import { hubOffers, type HubOffer } from "@/lib/content/offers/hub";
import { stayBySlug, vesselBySlug } from "@/lib/content/stays";
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
