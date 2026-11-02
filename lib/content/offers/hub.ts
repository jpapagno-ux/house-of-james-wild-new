import { liveOffers, offerEnd, voyageOfferType, VOYAGE_OFFER_TYPES, type Offer, type OfferProgram, type VoyageOfferType } from "./offers";
import { stayBySlug, vesselBySlug } from "@/lib/content/stays";
import { RESERVES, campHref, reserveBySlug } from "@/lib/content/reserves";
import { SHIPS } from "@/lib/content/ships/index";
import { POLAR_VOYAGES, voyagePath } from "@/lib/content/polar";
import { VOLUME_ORDER, VOLUME_STYLES, type VolumeKey } from "@/lib/volumes";

// On the Horizon (James, 2 Nov 2026): the one offers hub, /offers, with a section per volume.
// Stays and Safaris keep their two programs (Worth Another Night, Time Rewarded, and Book Early
// where filed); voyage offers are grouped by type. Every offer is live under the date rule
// (lib/dates.ts: 30 days before it ends; Final Call 14 days before departure) and links to the page
// it belongs to when that page is built. Nothing here is new copy: terms are the Offer Ledger's.

export type HubOffer = Offer & { href: string | null; place: string | null; volumeKey: VolumeKey; type: VoyageOfferType | null };

/** The page an offer belongs to, when built: a stay, a reserve or camp, a ship, a polar voyage, a collection. */
export function offerHref(o: Offer): { href: string | null; place: string | null } {
  const stay = stayBySlug(o.ref);
  if (stay) return { href: `/stays/${stay.slug}`, place: stay.country };
  const ship = SHIPS.find((s) => s.slug === o.ref || s.offerRefs.includes(o.ref));
  if (ship) return { href: `/voyages/ships/${ship.slug}`, place: ship.data.country };
  const vessel = vesselBySlug(o.ref);
  if (vessel) return { href: `/stays/${vessel.slug}`, place: vessel.country };
  const polar = POLAR_VOYAGES.find((v) => v.slug === o.ref);
  if (polar) return { href: voyagePath(polar.slug), place: o.country || "Antarctica" };
  const r = reserveBySlug(o.ref);
  if (r) return { href: `/safaris/${r.slug}`, place: r.stay.country };
  for (const res of RESERVES) { const c = res.camps.find((x) => x.slug === o.ref); if (c) return { href: campHref(res, c), place: res.stay.country }; }
  if (o.collection) return { href: `/collections/${o.collection}`, place: o.country || null };
  return { href: null, place: o.country || null };
}

const volumeOf = (o: Offer): VolumeKey => o.volume ?? (o.scope === "vessel" || o.scope === "itinerary" ? "voyages" : "stays");

export function hubOffers(on?: string): HubOffer[] {
  return liveOffers(on).map((o) => {
    const v = volumeOf(o);
    return { ...o, ...offerHref(o), volumeKey: v, type: v === "voyages" ? voyageOfferType(o) : null };
  });
}

export type VolumeSection = { volume: VolumeKey; label: string; groups: { key: string; title: string; offers: HubOffer[] }[]; count: number };
const PROGRAM_ORDER: OfferProgram[] = ["Worth Another Night", "Time Rewarded", "Book Early", "Final Call", "On the Horizon"];

/** Sections in volume order, only volumes with a live offer; voyages grouped by type, the rest by program. */
export function sections(offers: HubOffer[]): VolumeSection[] {
  return VOLUME_ORDER.map((v) => {
    const mine = offers.filter((o) => o.volumeKey === v).sort((a, b) => (a.place ?? "").localeCompare(b.place ?? "") || a.name.localeCompare(b.name));
    const groups = v === "voyages"
      ? VOYAGE_OFFER_TYPES.map((t) => ({ key: t, title: t, offers: mine.filter((o) => o.type === t) }))
      : PROGRAM_ORDER.map((p) => ({ key: p, title: p, offers: mine.filter((o) => o.program === p) }));
    return { volume: v, label: VOLUME_STYLES[v].label, groups: groups.filter((g) => g.offers.length), count: mine.length };
  }).filter((s) => s.count > 0);
}

/** What each program and type means, in the house's words (offers.ts header; voyages plan Part 5). */
export const MEANING: Record<string, string> = {
  "Worth Another Night": "A free night on a shorter stay.",
  "Time Rewarded": "A reward for staying longer.",
  "Book Early": "A saving for booking well ahead.",
  "Final Call": "Late cabins released on a departure. Shown with the departure date until 14 days before it sails, never a countdown.",
  Solo: "A lower or waived single supplement.",
  Celebrations: "Honeymoons and anniversaries.",
  Family: "Savings for children or for families sailing together.",
  "Whole Ship": "Savings on chartering the whole vessel.",
  "On the Horizon": "A general saving on the voyage.",
};

/** Offer schema with validThrough (the offer's own end, not the date the site stops showing it). */
export function offerSchema(o: HubOffer, abs: (p: string) => string) {
  return {
    "@type": "Offer", name: `${o.headline}: ${o.name}`, description: o.conditions ?? o.headline, category: o.type ?? o.program,
    validFrom: o.travel.from, validThrough: offerEnd(o), ...(o.href ? { url: abs(o.href) } : {}),
    offeredBy: { "@type": "TravelAgency", name: "James Wild & Co", url: abs("/") },
  };
}
