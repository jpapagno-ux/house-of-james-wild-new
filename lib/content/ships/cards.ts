import { SHIPS } from "./index";
import { SHIP_REGISTRY, VOYAGE_TYPES, WATERS_HUBS, registryHref, type RegistryShip, type VoyageType, type Waters } from "./registry";
import { fromPrice, factOf, nightsLabel, priceLine, undash } from "./types";
import { VESSEL_RECORDS, pageReady } from "@/lib/content/stays";
import { pathway, type Pathway } from "@/lib/pathways";

// One card shape for every Voyages list (landing, type and waters hubs, pathway pages):
// built from the registry row plus the ship's record when she has a page, or her filed
// Ledger record when she does not. Nothing here is new copy.

export type ShipCardData = {
  slug: string; name: string; href: string; eyebrow: string; line: string;
  image: { url: string; alt: string } | null; credit?: string;
  facts: [string, string][]; price: { label: string; amount: string } | null; low: number | null;
  pathway: { primary: Pathway; secondary: Pathway[] } | null;
  types: VoyageType[]; waters: Waters[]; page: boolean; status: string;
};

const KIND: Record<string, string> = { riverboat: "Riverboat", dahabiya: "Dahabiya", phinisi: "Phinisi", catamaran: "Catamaran", yacht: "Yacht", schooner: "Schooner", "river-yacht": "River yacht", "motor-yacht": "Motor yacht", "expedition-ship": "Expedition ship" };

export function shipCard(r: RegistryShip): ShipCardData | null {
  const e = SHIPS.find((x) => x.slug === r.slug);
  const pw = r.pathway ? { primary: pathway(r.pathway.primary)!, secondary: r.pathway.secondary.map((p) => pathway(p)).filter((p): p is Pathway => !!p) } : null;
  const where = r.waters.map((w) => WATERS_HUBS[w].name).join(", ");
  const eyebrow = `${KIND[r.kind] ?? r.kind}${r.operator ? ` · ${r.operator}` : ""}`;
  if (e) {
    const s = e.data;
    const p = priceLine(s);
    const guests = s.glance?.guests ?? factOf(s, /guest/i);
    return {
      slug: r.slug, name: s.name, href: registryHref(r), eyebrow, line: undash(s.tagline), image: { url: s.hero.url, alt: s.hero.alt }, credit: e.credit,
      facts: [["Nights", nightsLabel(s).replace(" nights", "")], ["Guests", guests ?? "To confirm"]],
      price: p.kind === "cruise" ? { label: "From", amount: p.amount } : p.kind === "journey" ? { label: "Journeys", amount: p.amount } : p.kind === "tba" ? { label: "New dates", amount: "Ask James" } : { label: "Rates", amount: "On request" },
      low: fromPrice(s), pathway: pw, types: r.types, waters: r.waters, page: true, status: s.status,
    };
  }
  const st = VESSEL_RECORDS.find((x) => x.slug === r.staySlug);
  if (!st || !pageReady(st)) return null; // never a card without a live record
  return {
    slug: r.slug, name: r.name, href: registryHref(r), eyebrow, line: undash((st.tagline ?? "").replace(/^["“]|["”]$/g, "")),
    image: st.hero ? { url: st.hero, alt: `${r.name}, ${where}` } : null, facts: [], price: null, low: null, pathway: pw, types: r.types, waters: r.waters, page: false, status: "Ship page to follow",
  };
}

export const cardsFor = (rows: RegistryShip[]) => rows.map(shipCard).filter((c): c is ShipCardData => !!c);
export const allCards = () => cardsFor(SHIP_REGISTRY);

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
/** Ship count and lowest published "from" for a set of cards (landing tiles). */
export function tally(cards: ShipCardData[]): { count: number; from: string | null } {
  const lows = cards.map((c) => c.low).filter((n): n is number => typeof n === "number");
  return { count: cards.length, from: lows.length ? usd(Math.min(...lows)) : null };
}
export const typeCards = (t: VoyageType) => allCards().filter((c) => c.types.includes(t));
export const watersCards = (w: Waters) => allCards().filter((c) => c.waters.includes(w));
export { VOYAGE_TYPES, WATERS_HUBS };
