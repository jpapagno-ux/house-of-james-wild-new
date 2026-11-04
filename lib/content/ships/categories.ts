import { SHIPS } from "./index";
import { shipCard, type ShipCardData } from "./cards";
import { SHIP_REGISTRY, WATERS_HUBS, type RegistryShip, type Waters } from "./registry";
import { singleLabel, singleWeight } from "./search-match";
import { nightsLabel } from "./types";
import type { HubProps } from "@/components/ships/VoyageHub";
import type { Tile } from "@/components/ships/VoyageTiles";
import { voyageOffersOfType, type Offer } from "@/lib/content/offers/offers";
import { volumeEyebrow } from "@/lib/volumes";

// The Voyages category pages (James, 2 Nov 2026): /voyages/honeymoon, /voyages/family and
// /voyages/solo. Each opens with the answer, then a comparison table built from the registry's
// published facts (ShipTraits), then the ship cards, FAQs and ItemList + FAQPage schema (VoyageHub).
// Rule (Part 4.6): a category gets its own page only when 3 or more ships qualify on published
// facts; `qualifies` is that test, and tests/voyage-categories.test.ts holds every page to it.
// Diving waits for Indonesia; snorkelling, kayaking, hiking, culture and length stay search filters.

export type CategoryKey = "honeymoon" | "family" | "solo";
export const MIN_SHIPS = 3;

/** One row of a comparison table: the ship, then a cell per column. */
export type CompareRow = { slug: string; name: string; href: string; where: string; cells: string[] };
export type CompareTable = { caption: string; columns: string[]; rows: CompareRow[]; note: string };

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");
const NOT = "Not published";
const paged = () => SHIP_REGISTRY.filter((r) => r.page);
const entry = (r: RegistryShip) => SHIPS.find((s) => s.slug === r.slug)!;
const whereOf = (r: RegistryShip) => [...new Set(r.waters.map((w) => WATERS_HUBS[w].name))].join(", ");
const fromOf = (r: RegistryShip) => shipCard(r)?.price?.amount ?? "Ask us";
const couples = (r: RegistryShip) => entry(r).data.suits.some((x) => /couple|honeymoon/i.test(x.who));

/** Does a ship qualify for the category on published facts? */
export const qualifies: Record<CategoryKey, (r: RegistryShip) => boolean> = {
  honeymoon: (r) => r.page && couples(r),
  family: (r) => r.page && r.traits?.minChildAge !== undefined,
  solo: (r) => r.page && (r.traits?.single?.kind === "percent" || r.traits?.single?.kind === "none"),
};
export const qualifying = (k: CategoryKey) => SHIP_REGISTRY.filter(qualifies[k]);

export const CATEGORY_PATHS: Record<CategoryKey, string> = { honeymoon: "/voyages/honeymoon", family: "/voyages/family", solo: "/voyages/solo" };
export const CATEGORY_NAMES: Record<CategoryKey, string> = { honeymoon: "Honeymoons and Couples", family: "Family Voyages", solo: "Solo Voyages" };

/** The three category tiles, for the landing and each page's "keep looking". */
export function categoryTiles(except?: CategoryKey): Tile[] {
  const line: Record<CategoryKey, string> = {
    honeymoon: "Ships that suit two, and the celebration offers on them.",
    family: "Minimum ages, connecting cabins and kids' programmes, ship by ship.",
    solo: "What a solo traveller pays on every ship, lowest supplement first.",
  };
  return (Object.keys(CATEGORY_PATHS) as CategoryKey[]).filter((k) => k !== except).map((k) => ({ key: k, name: CATEGORY_NAMES[k], href: CATEGORY_PATHS[k], line: line[k], count: qualifying(k).length }));
}

/** Offers that repeat across ships (one promotion, one card), merged into one with every ship named. */
export function mergeOffers(offers: Offer[]): Offer[] {
  const groups = new Map<string, Offer[]>();
  for (const o of offers) { const k = `${o.headline}|${o.conditions ?? ""}|${o.travel.to}`; groups.set(k, [...(groups.get(k) ?? []), o]); }
  return [...groups.values()].map((g) => {
    if (g.length === 1) return g[0];
    const names = g.map((o) => o.name.match(/\(([^)]+)\)$/)?.[1] ?? o.name);
    const base = g[0].name.replace(/\s*\([^)]+\)$/, "");
    const ids = g.map((o) => o.id).sort();
    return { ...g[0], name: `${base} (${list(names)})`, id: `${ids[0]} to ${ids[ids.length - 1].slice(-6)}` };
  });
}

// ── Honeymoon ────────────────────────────────────────────────────────────────
export function honeymoon(): HubProps & { table: CompareTable; offers: Offer[] } {
  const rows = qualifying("honeymoon");
  const cards = rows.map(shipCard).filter((c): c is ShipCardData => !!c);
  const celebrations = voyageOffersOfType("Celebrations");
  const onShip = (r: RegistryShip) => celebrations.filter((o) => o.ref === r.slug || (o.refs ?? []).includes(r.slug) || entry(r).offerRefs.includes(o.ref));
  const offerShips = rows.filter((r) => onShip(r).length);
  const ak = celebrations[0];
  const table: CompareTable = {
    caption: "Ships for two, compared",
    columns: ["Waters", "Nights", "From, per person", "Celebrations offer", "Slow or wellness"],
    rows: rows.map((r) => ({ slug: r.slug, name: r.name, href: `/voyages/ships/${r.slug}`, where: whereOf(r), cells: [whereOf(r), nightsLabel(entry(r).data) || "Ask us", fromOf(r), onShip(r)[0]?.headline ?? "None filed", (r.traits?.activities ?? []).includes("slow") ? "Yes" : NOT] })),
    note: "Ships listed are those whose own material names couples or honeymooners among the travellers they suit. “From” is the lowest published fare per person, two sharing.",
  };
  const suits = (r: RegistryShip) => entry(r).data.suits.find((x) => /couple|honeymoon/i.test(x.who))!.who;
  const answer = `${rows.length} small ships in the Ledger name couples or honeymooners among the travellers they suit: ${list(rows.map((r) => `${r.name} (${suits(r).replace(/^\w/, (c) => c.toLowerCase())})`))}.${ak && offerShips.length ? ` ${offerShips.length === 1 ? offerShips[0].name : list(offerShips.map((r) => r.name))} carry A&K's honeymoon offer: ${ak.headline.replace(/^Honeymoon: /, "").toLowerCase()}, ${ak.travel.text.replace(/^Travel/, "travel")}.` : ""} James confirms every fare and offer live before anything is booked.`;
  return {
    path: CATEGORY_PATHS.honeymoon, name: "Honeymoons", eyebrow: volumeEyebrow("voyages", "Voyages", "For two"),
    title: "Honeymoon Cruises and Small Ships for Couples",
    intro: "Small ships that suit two: Nile riverboats, Amazon river ships and Galápagos yachts, with the celebration offers filed on them.",
    question: "Which Small Ships Suit a Honeymoon?", answer, cards, table, offers: mergeOffers(celebrations),
    faqs: [
      { q: "Which small ship is best for a honeymoon?", a: `It depends on the waters. ${(["nile", "amazon", "galapagos", "indonesia"] as Waters[]).map((w) => [w, rows.filter((r) => r.waters.includes(w)).map((r) => r.name)] as const).filter(([, n]) => n.length).map(([w, n]) => `In ${WATERS_HUBS[w].name.replace(/^The /, "the ")}: ${list(n)}.`).join(" ")} Each names couples among the guests it suits; the table compares nights, fares and offers.` },
      ...(ak ? [{ q: "Is there a honeymoon offer on a Nile cruise?", a: `Yes. ${ak.headline.replace(/^Honeymoon: /, "A&K takes ")} on ${list(offerShips.map((r) => r.name))}. ${ak.conditions ?? ""}`.trim() }] : []),
      { q: "Can we take a whole ship for the two of us?", a: "Yes, several can be chartered whole: see The Whole Ship. A charter is priced for the vessel, not per person, and James confirms the rate live." },
      { q: "Do honeymoon offers combine with other savings?", a: "Usually not. Each offer's terms say so; A&K's honeymoon offer, for one, is not combinable with any other offer. James applies whichever fits your dates." },
    ],
    related: { title: "Who Else Is Sailing?", tiles: categoryTiles("honeymoon") },
  };
}

// ── Family ───────────────────────────────────────────────────────────────────
export function family(): HubProps & { table: CompareTable } {
  const q = qualifying("family").sort((a, b) => a.traits!.minChildAge! - b.traits!.minChildAge!);
  const cards = q.map(shipCard).filter((c): c is ShipCardData => !!c);
  const all = paged().sort((a, b) => (a.traits?.minChildAge ?? 99) - (b.traits?.minChildAge ?? 99));
  const yes = (v?: boolean) => (v ? "Yes" : NOT);
  const table: CompareTable = {
    caption: "Children aboard, ship by ship",
    columns: ["Waters", "Minimum age", "Connecting cabins", "Kids' programme"],
    rows: all.map((r) => ({ slug: r.slug, name: r.name, href: `/voyages/ships/${r.slug}`, where: whereOf(r), cells: [whereOf(r), r.traits?.childNote ?? NOT, yes(r.traits?.connecting), yes(r.traits?.kidsProgramme)] })),
    note: "From each operator's own material. “Not published” means the operator does not say; James asks before you book.",
  };
  const byAge = new Map<number, string[]>();
  for (const r of q) byAge.set(r.traits!.minChildAge!, [...(byAge.get(r.traits!.minChildAge!) ?? []), r.name]);
  const ages = [...byAge.entries()].map(([a, n]) => `${a === 0 ? "children of all ages on" : `from ${a} on`} ${list(n)}`);
  const conn = all.filter((r) => r.traits?.connecting).map((r) => r.name);
  const kids = all.filter((r) => r.traits?.kidsProgramme).map((r) => r.name);
  const answer = `${q.length} of the ${all.length} ships with pages publish a minimum age for children on shared sailings: ${list(ages)}. ${list(conn)} ${conn.length === 1 ? "has" : "have"} connecting cabins${kids.length ? `, and ${list(kids)} ${kids.length === 1 ? "runs" : "run"} a children's programme on board` : ""}. Several ships take younger children on a private charter.`;
  return {
    path: CATEGORY_PATHS.family, name: "Family Voyages", eyebrow: volumeEyebrow("voyages", "Voyages", "With children"),
    title: "Family Cruises on Small Ships: Ages, Cabins and Programmes",
    intro: "Every ship's minimum age for children, connecting cabins and kids' programme in one table, from each operator's own material.",
    question: "Which Small Ships Take Children?", answer, cards, table,
    faqs: [
      { q: "What is the youngest age children can sail?", a: `${byAge.has(0) ? `${list(byAge.get(0)!)} ${byAge.get(0)!.length === 1 ? "takes" : "take"} children of all ages. ` : ""}On shared sailings the other ships set ages from ${Math.min(...[...byAge.keys()].filter((a) => a > 0))} up; the table gives each one.` },
      { q: "Which ships have connecting cabins?", a: `${list(conn)}, per their operators. On the others connecting cabins are not published; James asks.` },
      ...(kids.length ? [{ q: "Is there a kids' club on board?", a: `${list(kids)} ${kids.length === 1 ? "runs" : "run"} a children's programme on board. Other operators publish children's menus; none publishes a programme.` }] : []),
      { q: "Can we take younger children on a private charter?", a: "Often, yes: andBeyond and Galaxy Cruises, for two, take children of any age on a full charter. See The Whole Ship." },
    ],
    related: { title: "Who Else Is Sailing?", tiles: categoryTiles("family") },
  };
}

// ── Solo ─────────────────────────────────────────────────────────────────────
export function solo(): HubProps & { table: CompareTable } {
  const q = qualifying("solo").sort((a, b) => singleWeight(a.traits!.single) - singleWeight(b.traits!.single));
  const cards = q.map(shipCard).filter((c): c is ShipCardData => !!c);
  const all = paged().sort((a, b) => singleWeight(a.traits?.single) - singleWeight(b.traits?.single));
  const table: CompareTable = {
    caption: "What a solo traveller pays",
    columns: ["Waters", "Single supplement", "The operator's terms", "From, per person"],
    rows: all.map((r) => ({ slug: r.slug, name: r.name, href: `/voyages/ships/${r.slug}`, where: whereOf(r), cells: [whereOf(r), singleLabel(r.traits?.single) ?? NOT, r.traits?.single?.note ?? (r.traits?.single ? "" : NOT), fromOf(r)] })),
    note: "The supplement is added to the two-sharing fare. “From” is the lowest published fare per person, two sharing. Sorted lowest supplement first.",
  };
  const none = q.filter((r) => r.traits!.single!.kind === "none").map((r) => r.name);
  const pct = q.filter((r) => r.traits!.single!.kind === "percent");
  const low = pct[0];
  const answer = `${q.length} ships publish what a solo traveller pays.${none.length ? ` ${list(none)} ${none.length === 1 ? "has" : "have"} single cabins with no supplement.` : ""}${low ? ` The lowest percentage is ${singleLabel(low.traits!.single)} on ${low.name}` : ""}; most others charge ${mostCommon(pct.map((r) => (r.traits!.single as { pct: number }).pct))}% over the two-sharing fare.${q.some((r) => r.slug === "delfin-iii") ? " Delfin III waives its supplement for up to two solo guests a sailing outside the holidays." : ""}`;
  return {
    path: CATEGORY_PATHS.solo, name: "Solo Voyages", eyebrow: volumeEyebrow("voyages", "Voyages", "Travelling alone"),
    title: "Solo Cruises on Small Ships: Single Supplements Compared",
    intro: "Every ship's single supplement in one table, lowest first, from each operator's own published fares.",
    question: "Which Small Ships Are Best for Solo Travellers?", answer, cards, table,
    faqs: [
      { q: "Which small ships have no single supplement?", a: none.length ? `${list(none)}: Antarctica21's Single Veranda Cabins carry none. In shared cabin categories Antarctica21 charges 85% or 100%.` : "None of the filed ships publishes a solo cabin without a supplement yet." },
      { q: "What is a single supplement?", a: "The extra a solo traveller pays to have a cabin built for two to themselves, as a percentage of the two-sharing fare. The table gives each ship's published figure." },
      { q: "Can the supplement be waived?", a: "Sometimes. Delfin III waives it for up to two solo guests per departure outside the holidays. Solo offers, when an operator files one, appear in On the Horizon." },
      { q: "Can I share a cabin instead?", a: "Galaxy Cruises offers a shared twin cabin (same sex) on Alya and Galaxy Sirius; ask James about the others." },
    ],
    related: { title: "Who Else Is Sailing?", tiles: categoryTiles("solo") },
  };
}

function mostCommon(xs: number[]): number {
  const c = new Map<number, number>();
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 50;
}

