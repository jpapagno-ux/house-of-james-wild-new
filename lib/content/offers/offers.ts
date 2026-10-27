// The Offer Ledger: every promotion the house shows, with a permanent ID,
// tracked by year, country and what it belongs to (stay, vessel, residence,
// reserve or collection). Pages read their offers from here, never from a
// partner's site, and booking always routes to Plan with James (no partner
// links). An offer shows only while status is "Live" and its travel window
// hasn't ended. IDs are OFR-<year>-<4 digits>, issued in order and never
// reused, even when an offer ends or is withdrawn.
//
// Program names (James, 27 Oct 2026): "Worth Another Night" = a free night on
// a shorter stay; "Time Rewarded" = a reward for staying longer; "On the
// Horizon" = suggested name for voyage savings, not yet in use.

export type OfferScope = "stay" | "vessel" | "residence" | "reserve" | "collection";
export type OfferStatus = "Live" | "Awaiting terms" | "Draft" | "Ended" | "Withdrawn";
export type OfferProgram = "Worth Another Night" | "Time Rewarded" | "On the Horizon";
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
};

const CAY = "cayuga-collection";
const SRC = "Cayuga Collection official special offers page";
const T26 = { from: "2026-04-13", to: "2026-12-19", text: "13 April to 19 December 2026" };
const cy = (id: string, alt: string, w: number, h: number): OfferImage => ({ id: `jwco/collections/cayuga-collection/offers/${id}`, alt, w, h });

export const OFFER_LEDGER: Offer[] = [
  // ── 2026 · Cayuga Collection (checked 27 Oct 2026) ──
  { id: "OFR-2026-0001", year: 2026, status: "Live", scope: "stay", ref: "bolontiku-hotel", name: "Bolontiku", collection: CAY, country: "Guatemala", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, source: SRC, checked: "2026-10-27", image: cy("bolontiku-lake", "A forested shore of Lake Petén Itzá with boats at a jetty, from the air", 4032, 3024) },
  { id: "OFR-2026-0002", year: 2026, status: "Live", scope: "stay", ref: "senda-monteverde-lodge", name: "Senda Monteverde", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, conditions: "A free room upgrade when you book Senda Monteverde and Arenas del Mar together, subject to availability.", source: SRC, checked: "2026-10-27", image: cy("senda-monteverde-offer", "A terrace with a fire and seating looking over the forest at sunset at Senda Monteverde", 2054, 1667) },
  { id: "OFR-2026-0003", year: 2026, status: "Live", scope: "stay", ref: "jicaro-island-lodge", name: "Jicaro Island Lodge", collection: CAY, country: "Nicaragua", program: "Worth Another Night", headline: "Stay 3 nights, pay 2", travel: T26, source: SRC, checked: "2026-10-27", image: cy("jicaro-island-from-lake", "Jicaro Island Lodge seen across Lake Nicaragua in the Granada Isletas", 4066, 3300) },
  { id: "OFR-2026-0004", year: 2026, status: "Live", scope: "stay", ref: "kura-boutique-resort", name: "Kura", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 4 nights, pay 3", travel: T26, source: SRC, checked: "2026-10-27", image: cy("kura-offer", "Kura's infinity pool and open lounge lit at dusk above the forest at Uvita", 2000, 1623) },
  { id: "OFR-2026-0005", year: 2026, status: "Live", scope: "stay", ref: "aguas-claras", name: "Aguas Claras", collection: CAY, country: "Costa Rica", program: "Worth Another Night", headline: "Stay 4 nights, pay 3", travel: { from: "2026-04-13", to: "2026-12-19", text: "13 April to 30 September and 1 November to 19 December 2026" }, conditions: "Not available in October.", source: SRC, checked: "2026-10-27", image: cy("aguas-claras-offer", "A pool among tropical gardens below the white main house at Aguas Claras", 2000, 1623) },
  { id: "OFR-2026-0006", year: 2026, status: "Live", scope: "stay", ref: "isla-palenque-resort", name: "Isla Palenque", collection: CAY, country: "Panama", program: "Time Rewarded", headline: "Stay 5 nights, pay 4", travel: T26, source: SRC, checked: "2026-10-27", image: cy("isla-palenque-offer", "A thatched pavilion at the end of a palm-lined path on Isla Palenque", 2000, 1622) },
  { id: "OFR-2026-0007", year: 2026, status: "Live", scope: "stay", ref: "arenas-del-mar-resort", name: "Arenas del Mar", collection: CAY, country: "Costa Rica", program: "Time Rewarded", headline: "Stay 5 nights, pay 4", travel: T26, conditions: "A free room upgrade when you book Arenas del Mar and Senda Monteverde together, subject to availability.", source: SRC, checked: "2026-10-27", image: cy("arenas-del-mar-offer", "A hammock strung between palms on the beach at Arenas del Mar at dusk", 4930, 4000) },

  // ── 2027 · Cayuga Collection: asked for, terms not yet in ──
  ...([
    ["OFR-2027-0001", "bolontiku-hotel", "Bolontiku", "Guatemala"],
    ["OFR-2027-0002", "senda-monteverde-lodge", "Senda Monteverde", "Costa Rica"],
    ["OFR-2027-0003", "jicaro-island-lodge", "Jicaro Island Lodge", "Nicaragua"],
    ["OFR-2027-0004", "kura-boutique-resort", "Kura", "Costa Rica"],
    ["OFR-2027-0005", "aguas-claras", "Aguas Claras", "Costa Rica"],
    ["OFR-2027-0006", "isla-palenque-resort", "Isla Palenque", "Panama"],
    ["OFR-2027-0007", "arenas-del-mar-resort", "Arenas del Mar", "Costa Rica"],
  ] as const).map(([id, ref, name, country]): Offer => ({
    id, year: 2027, status: "Awaiting terms", scope: "stay", ref, name, collection: CAY, country,
    program: "Worth Another Night", headline: "2027 terms to come", travel: { from: "2027-01-01", to: "2027-12-31", text: "2027" },
    source: "To request from Cayuga", checked: "2026-10-27",
  })),
];

const today = () => new Date().toISOString().slice(0, 10);
/** Offers a page may show: Live and still within their travel window. */
export const liveOffers = (on = today()) => OFFER_LEDGER.filter((o) => o.status === "Live" && o.travel.to >= on);
export const offersFor = (ref: string, on = today()) => liveOffers(on).filter((o) => o.ref === ref);
export const offersInCollection = (collection: string, on = today()) => liveOffers(on).filter((o) => o.collection === collection);
