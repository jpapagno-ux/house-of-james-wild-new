import "server-only";
import staysData from "@/lib/content/stays.json";
import fxData from "@/lib/content/rates/fx.json";
import explorer from "@/lib/content/ships/polar/magellan-explorer.json";
import { POLAR_VOYAGES } from "@/lib/content/polar";
import type { Fx, Policy } from "./journey";

// The three pilot products for the Journey Cart (Booking & Checkout Studio, Session 03), read from
// the records the site already holds. Nothing here is a new ID, a new rate or a new product record:
//   Leeu House        STY-2026-000149   price: the house booking engine (ALBIE by TAG), live, at request time
//   Ellerman House    STY-2026-000075   price: its published contracted card in Supabase, when one exists
//   Magellan Explorer VSL-2026-000034   price: Antarctica21's published from fares, as filed in the polar voyage files
// Supplier payment policies below say only what is on file. "Not on file" is the honest answer for most
// of them today (audit, 15 Nov 2026); filling them in is a data task, never a guess.

type Stay = { slug: string; name: string; ledgerId: string; hero: string; tagline: string; rooms: { items: string[] }; experiences: { items: string[] } };
const stay = (ledgerId: string) => (staysData as unknown as { stays: Stay[] }).stays.find((s) => s.ledgerId === ledgerId) as Stay;

export type FeeRow = { name: string; state: "included" | "added" | "not_on_file" | "not_applied"; note: string };
export type StayProduct = { type: "stay"; key: string; slug: string; ledgerId: string; name: string; supplier: string; place: string; hero: string; alt: string; line: string; pricing: "albie" | "card"; engineProperty: string | null; pilotRoom: string | null; rooms: string[]; experiences: string[]; fees: FeeRow[]; inclusions: string[]; exclusions: string[]; inclusionsNote: string; policy: Policy };
export type Sailing = { date: string; dateTo: string | null; fromUsd: number | null; status: string | null };
export type VoyageOption = { slug: string; name: string; nights: number; route: string; checked: string; sailings: Sailing[]; inclusions: string[]; exclusions: string[]; optional: string[] };
export type VoyageProduct = { type: "voyage"; key: string; slug: string; ledgerId: string; name: string; supplier: string; place: string; hero: string; alt: string; line: string; cabins: { type: string; size: string | null; beds: string | null }[]; voyages: VoyageOption[]; pricesNote: string; fees: FeeRow[]; policy: Policy };
export type Product = StayProduct | VoyageProduct;
export type Catalogue = { today: string; fx: Record<string, Fx>; products: Product[] };

const FLORIDA: FeeRow = { name: "Florida sales tax", state: "not_applied", note: "Not added. The house does not add Florida sales tax to an international booking automatically; it applies only where the house's tax adviser says it does." };
const NOT_ON_FILE = "Not on file.";

const cleanName = (n: string) => n.replace(/\s*\n\s*/g, " ").trim();

export function pilotCatalogue(today: string): Catalogue {
  const leeu = stay("STY-2026-000149"), ellerman = stay("STY-2026-000075");
  const ship = explorer as unknown as { slug: string; name: string; ledgerId: string; operator: string; tagline: string; hero: { url: string; alt: string }; cabins: { type: string; size: string | null; beds: string | null }[]; pricesNote: string };

  const voyages: VoyageOption[] = POLAR_VOYAGES
    .filter((v) => v.operator === "Antarctica21" && v.status !== "sold-out")
    .map((v) => ({
      slug: v.slug, name: v.name, nights: v.nights, route: v.route, checked: v.checked,
      sailings: v.sailings.filter((s) => s.ship === ship.slug && s.date >= today).map((s) => ({ date: s.date, dateTo: s.dateTo ?? null, fromUsd: typeof s.prices.From === "number" ? s.prices.From : null, status: s.status })),
      inclusions: v.inclusions, exclusions: v.exclusions, optional: v.optional.map((o) => o.name),
    }))
    .filter((v) => v.sailings.length > 0)
    .sort((a, b) => b.sailings.length - a.sailings.length);

  return {
    today,
    fx: Object.fromEntries(Object.entries(fxData.rates).map(([c, rate]) => [c, { rate, date: fxData.date, source: fxData.source }])),
    products: [
      {
        type: "stay", key: "leeu-house", slug: leeu.slug, ledgerId: leeu.ledgerId, name: "Leeu House", supplier: "Leeu Collection", place: "Franschhoek, South Africa",
        hero: leeu.hero, alt: "Leeu House, Franschhoek", line: leeu.tagline,
        pricing: "albie", engineProperty: "leeu-house", pilotRoom: "Classic Room", rooms: [], experiences: leeu.experiences.items,
        fees: [
          { name: "South African VAT", state: "not_on_file", note: "The booking engine returns one total for the room and plan. Whether VAT sits inside that total is not stated in the feed." },
          { name: "Tourism levy", state: "not_on_file", note: "Not itemised by the booking engine feed." },
          { name: "Other mandatory charges", state: "not_on_file", note: "None are itemised by the feed. The house confirms with Leeu Collection before anything is charged." },
          FLORIDA,
        ],
        inclusions: [], exclusions: [],
        inclusionsNote: "What the rate includes follows the rate plan the booking engine prices (shown on the line). The plan's own inclusion list is not in the feed, so none is printed here.",
        policy: {
          payNow: { supported: true, basis: "The house booking engine (ALBIE by TAG) sells this rate with payment at booking. Taking that payment on this site is not yet authorised, so it is simulated here." },
          deposit: null, depositNote: "Deposit terms are not in the booking engine feed and no contracted card is on file for Leeu House.",
          payAtProperty: { supported: false, basis: "Not stated by Leeu Collection or by the booking engine feed." },
          balance: NOT_ON_FILE, cancellation: "Follows the rate plan the engine prices. The plan's cancellation terms are not in the feed.",
        },
      },
      {
        type: "stay", key: "ellerman-house", slug: ellerman.slug, ledgerId: ellerman.ledgerId, name: "Ellerman House", supplier: "Ellerman House", place: "Bantry Bay, Cape Town, South Africa",
        hero: ellerman.hero, alt: "Ellerman House above Bantry Bay, Cape Town", line: ellerman.tagline,
        pricing: "card", engineProperty: null, pilotRoom: null, rooms: ellerman.rooms.items, experiences: ellerman.experiences.items,
        fees: [
          { name: "South African VAT", state: "not_on_file", note: "Stated on the contracted card. No card is on file yet." },
          { name: "Tourism levy", state: "not_on_file", note: "Stated on the contracted card. No card is on file yet." },
          FLORIDA,
        ],
        inclusions: [], exclusions: [],
        inclusionsNote: "Inclusions and exclusions print from the contracted rate card's rate plan. No card is on file for Ellerman House yet.",
        policy: {
          payNow: { supported: false, basis: "No contracted rate card is on file for Ellerman House, so there is no amount to charge." },
          deposit: null, depositNote: "Deposit terms come from the contracted rate card. None is on file for Ellerman House.",
          payAtProperty: { supported: false, basis: "Not stated. Ellerman House's payment terms are not on file." },
          balance: NOT_ON_FILE, cancellation: NOT_ON_FILE,
        },
      },
      {
        type: "voyage", key: ship.slug, slug: ship.slug, ledgerId: ship.ledgerId, name: cleanName(ship.name), supplier: ship.operator, place: "Antarctica, from Punta Arenas",
        hero: ship.hero.url, alt: ship.hero.alt, line: ship.tagline,
        cabins: ship.cabins.map((c) => ({ type: c.type, size: c.size, beds: c.beds })), voyages, pricesNote: ship.pricesNote,
        fees: [
          { name: "IAATO passenger fee", state: "included", note: "Included in the fare, per Antarctica21's inclusions." },
          { name: "Port charges and other taxes", state: "not_on_file", note: "Antarctica21's fare breakdown is not on file." },
          { name: "Single supplement", state: "not_on_file", note: "None in the Single Veranda Cabin; 85% or 100% in shared categories, per Antarctica21. The figure depends on the cabin fare, which is not on file." },
          FLORIDA,
        ],
        policy: {
          payNow: { supported: false, basis: "Antarctica21's fares by cabin are not on file. The from fare is the ship's lowest published fare, not this booking's fare." },
          deposit: null, depositNote: "Antarctica21's deposit and payment schedule are not on file.",
          payAtProperty: { supported: false, basis: "Does not apply to a voyage." },
          balance: NOT_ON_FILE, cancellation: "Not on file, apart from Antarctica21's published flight contingency: a full refund of the cruise fare if guests cannot fly out by 2 PM on Day 4 (air-cruises from Punta Arenas).",
        },
      },
    ],
  };
}

/** Slugs the preview rate-card route may read. */
export const CARD_SLUGS = ["ellerman-house", "leeu-house"];
