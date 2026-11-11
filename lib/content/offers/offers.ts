// The Offer Ledger: every promotion the house shows, with a permanent ID,
// tracked by year, country and what it belongs to (stay, vessel, residence,
// reserve or collection). Pages read their offers from here, never from a
// partner's site, and booking always routes to Plan with James (no partner
// links). An offer shows only while status is "Live" and its travel window
// hasn't ended. IDs are OFR-<year>-<4 digits>, issued in order and never
// reused, even when an offer ends or is withdrawn.
//
// Program names (James, 27 Oct 2026): "Worth Another Night" = a free night on
// a shorter stay; "Time Rewarded" = a reward for staying longer. "On the
// Horizon" (James, 2 Nov 2026) = the site-wide name for offers: one hub,
// /offers, with a section per volume; Stays keep their two marks inside it and
// voyage offers carry a type (VoyageOfferType). "Final Call"
// (James, 29 Oct 2026) = last-minute savings on a departure, Voyages and
// Overland only; drawn as a split-flap board (components/ledger/OfferPanel). "Book Early"
// = a hotel's early-booking discount (working name, James to confirm).

import type { VolumeKey } from "@/lib/volumes";
import LIBRARY from "./library.json";
import { activeOnly, offerLastDay, today } from "@/lib/dates";

export type OfferScope = "stay" | "vessel" | "residence" | "reserve" | "collection" | "itinerary";
export type OfferStatus = "Live" | "Awaiting terms" | "Draft" | "Ended" | "Withdrawn";
export type OfferProgram = "Worth Another Night" | "Time Rewarded" | "Final Call" | "On the Horizon" | "Book Early";
export type OfferImage = { id: string; alt: string; w: number; h: number };
export type Offer = {
  id: string;
  year: number;
  status: OfferStatus;
  scope: OfferScope;
  ref: string; // the stay/vessel/residence/reserve slug
  name: string;
  collection?: string; // e.g. "cayuga-collection"
  country: string;
  program: OfferProgram;
  headline: string; // "Stay 3 nights, pay 2"
  travel: { from: string; to: string; text: string }; // ISO dates + display text
  conditions?: string;
  source: string; // where the terms came from (never linked on the site)
  checked: string; // ISO date the terms were last checked
  image?: OfferImage;
  volume?: VolumeKey; // set in the library; decides the offer's colour and mark
  departure?: string; // Final Call: the departure date (ISO), shown as a date, never a countdown
  /** The window is a booking deadline, not travel dates ("book by 31 December 2026"); the card says so. */
  bookingWindow?: boolean;
  /** Further pages the same offer belongs to (one promotion across several voyages). */
  refs?: string[];
  /** The partner whose offer it is (lib/content/partners), for the partner page. */
  partner?: string;
  /** Voyages only: the offer's type under On the Horizon (James, 2 Nov 2026). Synced from the library's
   *  `offer_type` when set; otherwise `voyageOfferType` maps the offer from its program and terms. */
  offerType?: VoyageOfferType;
  /** Voyages: the last sailing date the offer covers when its window is a booking deadline (Windstar's all-inclusive:
   *  book by 17 Nov 2026 for sailings through 2027), so the sailing table can flag the sailings it applies to. */
  sailingsUntil?: string;
  /** A short label for the sailing table's flag ("All-inclusive"), 14 characters or fewer. */
  flag?: string;
};

/** The voyage offer types under On the Horizon (James, 2 Nov 2026, voyages plan Part 5). "On the Horizon"
 *  alone is a general saving that fits none of the others (Antarctica21's booking-window savings). */
export type VoyageOfferType = "Final Call" | "Book Early" | "Solo" | "Celebrations" | "Family" | "Whole Ship" | "On the Horizon";
export const VOYAGE_OFFER_TYPES: VoyageOfferType[] = ["Final Call", "Book Early", "Solo", "Celebrations", "Family", "Whole Ship", "On the Horizon"];

const CAY = "cayuga-collection";
const SRC = "Cayuga Collection official special offers page";
const T26 = { from: "2026-04-13", to: "2026-12-19", text: "13 April to 19 December 2026" };
const cy = (id: string, alt: string, w: number, h: number): OfferImage => ({ id: `jwco/collections/cayuga-collection/offers/${id}`, alt, w, h });

const HAND_KEPT: Offer[] = [
  // ── 2026 · Cayuga Collection (checked 27 Oct 2026) ──
  { id: "OFR-2026-0001", year: 2026, status: "Live", scope: "stay", ref: "boluntiku-hotel", name: "Bolontiku", collection: CAY, country: "Guatemala", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, source: SRC, checked: "2026-10-27", image: cy("bolontiku-lake", "A forested shore of Lake Petén Itzá with boats at a jetty, from the air", 4032, 3024) },
  { id: "OFR-2026-0002", year: 2026, status: "Live", scope: "stay", ref: "senda-monteverde-lodge", name: "Senda Monteverde", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, conditions: "A free room upgrade when you book Senda Monteverde and Arenas del Mar together, subject to availability.", source: SRC, checked: "2026-10-27", image: cy("senda-monteverde-offer", "A terrace with a fire and seating looking over the forest at sunset at Senda Monteverde", 2054, 1667) },
  { id: "OFR-2026-0003", year: 2026, status: "Live", scope: "stay", ref: "jicaro-island-lodge", name: "Jicaro Island Lodge", collection: CAY, country: "Nicaragua", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, source: SRC, checked: "2026-10-27", image: cy("jicaro-island-from-lake", "Jicaro Island Lodge seen across Lake Nicaragua in the Granada Isletas", 4066, 3300) },
  { id: "OFR-2026-0004", year: 2026, status: "Live", scope: "stay", ref: "kura-boutique-resort", name: "Kura", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 4 nights, pay 3", travel: T26, source: SRC, checked: "2026-10-27", image: cy("kura-offer", "Kura's infinity pool and open lounge lit at dusk above the forest at Uvita", 2000, 1623) },
  { id: "OFR-2026-0005", year: 2026, status: "Live", scope: "stay", ref: "aguas-claras", name: "Aguas Claras", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 4 nights, pay 3", travel: { from: "2026-04-13", to: "2026-12-19", text: "13 April to 30 September and 1 November to 19 December 2026" }, conditions: "Not available in October.", source: SRC, checked: "2026-10-27", image: cy("aguas-claras-offer", "A pool among tropical gardens below the white main house at Aguas Claras", 2000, 1623) },
  { id: "OFR-2026-0006", year: 2026, status: "Live", scope: "stay", ref: "isla-palenque-resort", name: "Isla Palenque", collection: CAY, country: "Panama", program: "Time Rewarded", headline: "Stay 5 nights, pay 4", travel: T26, source: SRC, checked: "2026-10-27", image: cy("isla-palenque-offer", "A thatched pavilion at the end of a palm-lined path on Isla Palenque", 2000, 1622) },
  { id: "OFR-2026-0007", year: 2026, status: "Live", scope: "stay", ref: "arenas-del-mar-resort", name: "Arenas del Mar", collection: CAY, country: "Costa Rica", program: "Time Rewarded", headline: "Stay 5 nights, pay 4", travel: T26, conditions: "A free room upgrade when you book Arenas del Mar and Senda Monteverde together, subject to availability.", source: SRC, checked: "2026-10-27", image: cy("arenas-del-mar-offer", "A hammock strung between palms on the beach at Arenas del Mar at dusk", 4930, 4000) },

  // ── 2027 · Cayuga Collection ──
  // Seen in Cayuga's booking engine on 27 Oct 2026 (3-, 4- and 5-night searches
  // for May, Jul and Sep 2027). Terms only, no rates. Kept as Draft (not shown
  // on the site) until Cayuga's written 2027 terms confirm dates and conditions.
  ...([
    ["OFR-2027-0001", "boluntiku-hotel", "Bolontiku", "Guatemala", "Worth Another Night", "2027 terms to come", "Awaiting terms", "Not in Cayuga's booking engine; to request"],
    ["OFR-2027-0002", "senda-monteverde-lodge", "Senda Monteverde", "Costa Rica", "Worth Another Night", "Stay 2 nights, the 3rd on us", "Draft", "Seen in Cayuga's booking engine, May to Sep 2027 dates"],
    ["OFR-2027-0003", "jicaro-island-lodge", "Jicaro Island Lodge", "Nicaragua", "Worth Another Night", "2027 terms to come", "Awaiting terms", "Not in Cayuga's booking engine; to request"],
    ["OFR-2027-0004", "kura-boutique-resort", "Kura", "Costa Rica", "Book Early", "Early Bird: 10% off", "Draft", "Seen in Cayuga's booking engine, Feb to Sep 2027 dates (15% in Jan 2027)"],
    ["OFR-2027-0005", "aguas-claras", "Aguas Claras", "Costa Rica", "Book Early", "Early Bird: 10% off", "Draft", "Seen in Cayuga's booking engine, Feb to Jul 2027 dates"],
    ["OFR-2027-0006", "isla-palenque-resort", "Isla Palenque", "Panama", "Time Rewarded", "Stay 5 nights, pay 4", "Draft", "Seen in Cayuga's booking engine, May 2027 dates"],
    ["OFR-2027-0007", "arenas-del-mar-resort", "Arenas del Mar", "Costa Rica", "Time Rewarded", "Stay 5 nights, pay 4", "Draft", "Seen in Cayuga's booking engine, May 2027 dates"],
  ] as const).map(([id, ref, name, country, program, headline, status, source]): Offer => ({
    id, year: 2027, status, scope: "stay", ref, name, collection: CAY, country, program, headline,
    travel: { from: "2027-01-01", to: "2027-12-31", text: "2027 [dates to confirm]" }, source, checked: "2026-10-27",
  })),

  // ── 2026 · A&K Sanctuary, Egypt (approved by James, 1 Nov 2026) ──
  // Filed in the Base44 library as OFR-2026-000129 to 000132 (record_type
  // "vessel"); kept here until the nightly library sync carries them, after
  // which the library records replace these by ID. Not on Zein Nile Chateau.
  ...([
    ["OFR-2026-000129", "ak-sanctuary-nile-adventurer", "Nile Adventurer"],
    ["OFR-2026-000130", "nile-seray", "Nile Seray"],
    ["OFR-2026-000131", "sun-boat-iii", "Sun Boat III"],
    ["OFR-2026-000132", "sun-boat-iv", "Sun Boat IV"],
  ] as const).map(([id, ref, name]): Offer => ({
    id, year: 2026, status: "Live", scope: "vessel", ref, name: `Honeymoon in Egypt (${name})`, country: "Egypt", program: "Time Rewarded",
    headline: "Honeymoon: 50% off one partner's stay",
    travel: { from: "2026-11-01", to: "2027-12-31", text: "Travel until 31 December 2027, within 6 months of your marriage" },
    conditions: "One partner's stay is 50% off. Travel by 31 December 2027 and within 6 months of the date on the marriage certificate. Not combinable with any other offer. Not available on Zein Nile Chateau. Abercrombie & Kent may withdraw the offer at any time. A&K terms apply.",
    source: "A&K offers page, honeymoon in Egypt with A&K Sanctuary", checked: "2026-11-01", volume: "voyages",
  })),

  // ── 2026 · Antarctica21 (checked 2 Nov 2026, antarctica21.com/our-promotions) ──
  // Booking-window savings on the polar voyages (James, 2 Nov 2026). They end with the booking deadline,
  // so they hide on their own after 31 December 2026 (lib/dates.ts). The promotional "from" fare quoted
  // on the Patagonia card is left out: that card gives a different length from the itinerary.
  { id: "OFR-2026-000160", year: 2026, status: "Live", scope: "itinerary", ref: "classic-antarctica-air-cruise", partner: "antarctica21", name: "Classic Antarctica Air-Cruise", country: "Antarctica", program: "On the Horizon",
    headline: "Save up to US$4,000 per person", travel: { from: "2026-11-02", to: "2026-12-31", text: "Book by 31 December 2026" }, bookingWindow: true,
    conditions: "On select Classic Antarctica Air-Cruise departures, new bookings only. Antarctica21 sets which departures qualify; James confirms yours.",
    source: "Antarctica21 promotions page", checked: "2026-11-02", volume: "voyages" },
  { id: "OFR-2026-000161", year: 2026, status: "Live", scope: "itinerary", ref: "patagonia-chilean-fjords", refs: ["falkland-islands"], partner: "antarctica21", name: "Patagonia and Falklands sea voyages", country: "Chile", program: "On the Horizon",
    headline: "Save up to US$1,000 per person", travel: { from: "2026-11-02", to: "2026-12-31", text: "Book by 31 December 2026" }, bookingWindow: true,
    conditions: "On Antarctica21's Patagonia and Chilean Fjords and Falklands sea voyages, new bookings only. Antarctica21 terms apply.",
    source: "Antarctica21 promotions page", checked: "2026-11-02", volume: "voyages" },

  // ── 2026 · Royal Galapagos, Galapagos Horizon (James approved, 2 Nov 2026) ──
  // The only dated deals Royal Galapagos' booking engine showed on 2 Nov 2026, each on one departure, so each is
  // a Final Call that stays live until its departure day (valid_to). Filed in the Base44 library as
  // OFR-2026-000162 to 000164; kept here until the nightly sync carries them. 000163 and 000164 (the 6 July 2027
  // sailing, US$500 off and US$8,000 off the charter) were archived on 2 Nov 2026 (James): Royal Galapagos shows
  // that sailing as full. Their IDs are never reused. Its undated promotions (free hotel
  // nights, 2X1, standing group and child discounts) are not shown (house rule).
  // Windstar (read on windstarcruises.com/specials, 11 Nov 2026): the Complimentary All-Inclusive Package, on every
  // Tahiti sailing of Star Breeze and Wind Star through 2027 when booked by 17 November 2026.
  { id: "OFR-2026-000172", year: 2026, status: "Live", scope: "vessel", ref: "star-breeze", refs: ["wind-star"], partner: "windstar", name: "Windstar Complimentary All-Inclusive Package", country: "French Polynesia", program: "On the Horizon",
    headline: "All-inclusive at no charge: drinks, Wi-Fi and gratuities", travel: { from: "2026-11-11", to: "2026-11-17", text: "Book by 17 November 2026, for voyages sailing through 2027" }, bookingWindow: true,
    conditions: "Unlimited Wi-Fi, gratuities, and select beer, cocktails and wine by the glass, included on voyages departing through 2027 when booked by 17 November 2026; Windstar puts the value at more than US$1,300 for two guests on a 7-night cruise. A reduced deposit of US$300 per stateroom, based on double occupancy. Windstar's terms apply; James confirms it on your sailing.",
    source: "Windstar specials page (Say Yes)", checked: "2026-11-11", volume: "voyages", offerType: "Book Early", sailingsUntil: "2027-12-31", flag: "All-inclusive" },
  { id: "OFR-2026-000173", year: 2026, status: "Live", scope: "vessel", ref: "star-breeze", partner: "windstar", name: "Windstar Star Collector Voyages", country: "French Polynesia", program: "On the Horizon",
    headline: "Star Collector: about 20% off two sailings back to back", travel: { from: "2026-11-11", to: "2027-12-31", text: "Ongoing, on Windstar's Star Collector Voyages" },
    conditions: "Star Collector Voyages join two or more back-to-back sailings into one journey; Windstar puts the saving at about 20% against booking each voyage separately, with few if any repeated ports. Windstar's terms apply.",
    source: "Windstar specials page (Star Collector Perks)", checked: "2026-11-11", volume: "voyages", offerType: "On the Horizon" },

  ...([
    ["OFR-2026-000162", "2027-06-22", "22 June 2027", "Galapagos Horizon, 22 June 2027 Northern islands", "US$1,000 off per person", "On the 22 June 2027 departure of the 5-day Northern islands cruise (4 nights), Baltra round trip: US$5,345 per person instead of US$6,345. New bookings only; subject to availability. Royal Galapagos terms apply."],
          ] as const).map(([id, dep, words, name, headline, conditions]): Offer => ({
    id, year: 2026, status: "Live", scope: "vessel", ref: "galapagos-horizon-trimaran", partner: "royal-galapagos", name, country: "Ecuador", program: "Final Call",
    headline, travel: { from: "2026-11-02", to: dep, text: `Departs ${words}` }, departure: dep, conditions,
    source: "Royal Galapagos booking engine", checked: "2026-11-02", volume: "voyages",
  })),
];

// Offers filed in the Base44 library arrive with the nightly sync
// (scripts/export-offers.py). A library record replaces a hand-kept one with
// the same ID, so terms can move into the library one offer at a time.
// The library has no partner or page-ref field for a partner's offer, so the hand-kept copy's partner and
// ref carry over by ID (the partner page lists its offers; the ship page reads its ref).
const HAND_BY_ID = new Map(HAND_KEPT.map((o) => [o.id, o]));
const FROM_LIBRARY = (LIBRARY as Offer[]).map((o) => { const h = HAND_BY_ID.get(o.id); return h?.partner ? { ...o, partner: o.partner ?? h.partner, ref: h.ref, refs: o.refs ?? h.refs, country: o.country || h.country } : o; });
const LIB_IDS = new Set(FROM_LIBRARY.map((o) => o.id));
export const OFFER_LEDGER: Offer[] = [...HAND_KEPT.filter((o) => !LIB_IDS.has(o.id)), ...FROM_LIBRARY];

// Typed by James (2 Nov 2026): A&K's Nile honeymoon offer is Celebrations; Antarctica21's two booking-window
// savings stay On the Horizon (general). The library's own `offer_type` wins once it is set there.
const TYPE_BY_ID: Record<string, VoyageOfferType> = {
  "OFR-2026-000129": "Celebrations", "OFR-2026-000130": "Celebrations", "OFR-2026-000131": "Celebrations", "OFR-2026-000132": "Celebrations",
  "OFR-2026-000160": "On the Horizon", "OFR-2026-000161": "On the Horizon",
  // Royal Galapagos' Galapagos Horizon departure deals: Final Call (James, 2 Nov 2026).
  "OFR-2026-000162": "Final Call",
};
/** A voyage offer's type: the filed type, James's typing by ID, then a reading of its program and terms. */
export function voyageOfferType(o: Pick<Offer, "id" | "program" | "headline" | "name" | "offerType">): VoyageOfferType {
  if (o.offerType) return o.offerType;
  if (TYPE_BY_ID[o.id]) return TYPE_BY_ID[o.id];
  if (o.program === "Final Call") return "Final Call";
  if (o.program === "Book Early") return "Book Early";
  const t = `${o.headline} ${o.name}`;
  if (/honeymoon|anniversar|celebrat/i.test(t)) return "Celebrations";
  if (/\bsolo\b|single supplement/i.test(t)) return "Solo";
  if (/famil|child|kids/i.test(t)) return "Family";
  if (/charter|whole (ship|yacht|boat)/i.test(t)) return "Whole Ship";
  return "On the Horizon";
}

/** When an offer ends: its travel window, or a Final Call's departure date if that comes first. */
export const offerEnd = (o: Pick<Offer, "travel" | "departure">) => (o.departure && o.departure < o.travel.to ? o.departure : o.travel.to);
/** Offers a page may show: Live, and not past the day they expire (lib/dates.ts offerLastDay, James,
 *  2 Nov 2026): every offer stays live through its end date; a Final Call through its own end date and
 *  never past its departure. The 30-day rule applies only when an offer is first filed (see docs/site-rules.md). */
export const liveOffers = (on = today()) => activeOnly(OFFER_LEDGER.filter((o) => o.status === "Live"), offerLastDay, on);
export const offersFor = (ref: string, on = today()) => liveOffers(on).filter((o) => o.ref === ref || (o.refs ?? []).includes(ref));
export const offersForPartner = (partner: string, on = today()) => liveOffers(on).filter((o) => o.partner === partner);
/** Live voyage offers of one type (the honeymoon page shows Celebrations). */
export const voyageOffersOfType = (t: VoyageOfferType, on = today()) => liveOffers(on).filter((o) => o.volume === "voyages" && voyageOfferType(o) === t);
export const offersInCollection = (collection: string, on = today()) => liveOffers(on).filter((o) => o.collection === collection);
