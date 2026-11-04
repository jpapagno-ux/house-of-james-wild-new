// The Exceptional Few as cards: one resolved entry per live designation, for the collection page,
// the homepage band, the Ledger ribbon, country pages, search and the small card mark. Everything is
// read from the designation, its Stay or ship record and its approved hero; nothing is typed in here.
import { EXCEPTIONAL_FEW_LIVE, collectionNo, efEntityId, efHref, efName, type ExceptionalFew } from "@/lib/content/exceptional-few";
import { stayBySlug } from "@/lib/content/stays";
import { assetFor, mediaUrl } from "@/lib/content/media-assets";
import { SHIP_REGISTRY } from "@/lib/content/ships/registry";
import { COUNTRIES } from "@/lib/content/countries";
import { PATHWAYS, type Pathway } from "@/lib/pathways";
import type { VolumeKey } from "@/lib/volumes";

export { EF_PATH } from "@/lib/content/exceptional-few";

export type EFCard = {
  id: string; no: number; label: string; name: string; href: string; kind: "Stay" | "Ship";
  volume: VolumeKey; place: string; country: string | null; countryHref: string | null;
  line: string; image: { url: string; alt: string } | null; pathways: Pathway[];
  suits: string[]; why: string | null; whyByJames: boolean; pairs: { name: string; href: string; why: string }[];
};

const byPathKey = (k: string) => Object.values(PATHWAYS).find((p) => p.key === k || p.id === k) ?? null;
// Countries whose page is a hand-built guide or a combined page, not a library row by that name.
const GUIDE_PAGES: Record<string, string> = { ecuador: "/destinations/south-america/ecuador-galapagos", indonesia: "/destinations/asia/indonesia" };
const countryHrefFor = (name: string | null | undefined) => {
  if (!name) return null;
  if (GUIDE_PAGES[name.toLowerCase()]) return GUIDE_PAGES[name.toLowerCase()];
  const n = name.replace(/\s*\(.*\)$/, "").toLowerCase();
  const c = COUNTRIES.find((x) => x.name.toLowerCase() === n || x.slug === n.replace(/\s+/g, "-"));
  return c ? `/destinations/${c.region}/${c.slug}` : null;
};

function resolve(e: ExceptionalFew): Omit<EFCard, "pairs"> {
  const a = assetFor(efEntityId(e), "hero");
  const image = a ? { url: mediaUrl(a, { ratio: "4:5", width: 900 }), alt: a.alt } : null;
  const base = { id: e.id, no: e.collectionNumber, label: collectionNo(e.collectionNumber), name: efName(e), href: efHref(e), line: e.heroLine ?? "", why: e.jamesNote?.text ?? e.whyItMadeTheCut[0] ?? null, whyByJames: !!e.jamesNote, image, suits: e.whoItSuits.slice(0, 3), pathways: e.pathwaysOverride.map(byPathKey).filter((p): p is Pathway => !!p) };
  if (e.entityType === "vessel") {
    const ship = SHIP_REGISTRY.find((s) => s.slug === e.vesselSlug);
    const country = ship?.country[0] ?? null;
    const waters = ship?.waters[0] === "galapagos" ? "Galápagos" : ship?.waters[0] === "indonesia" ? "Indonesia" : country;
    return { ...base, kind: "Ship", volume: "voyages", place: [waters, country !== waters ? country : null].filter(Boolean).join(", "), country, countryHref: countryHrefFor(country) };
  }
  const s = e.staySlug ? stayBySlug(e.staySlug) : null;
  const country = s?.country ?? null;
  const area = (s as { area?: string | null } | null | undefined)?.area ?? null;
  return { ...base, kind: "Stay", volume: "stays", place: [area, country].filter(Boolean).join(", ") || (country ?? ""), country, countryHref: s?.countrySlug && s.regionSlug ? `/destinations/${s.regionSlug}/${s.countrySlug}` : countryHrefFor(country) };
}

const RESOLVED = EXCEPTIONAL_FEW_LIVE.map((e) => ({ e, c: resolve(e) }));

/** Pair it with: the stays James named on the designation, then the other Exceptional Few in the same country. */
function pairsFor(e: ExceptionalFew, c: Omit<EFCard, "pairs">): EFCard["pairs"] {
  const out: EFCard["pairs"] = [];
  for (const ref of e.continueRefs) {
    if (!ref.startsWith("stay:")) continue;
    const s = stayBySlug(ref.slice(5));
    if (s) out.push({ name: s.name, href: `/stays/${s.slug}`, why: "James pairs it with this" });
  }
  for (const o of RESOLVED) if (o.e.id !== e.id && c.country && o.c.country === c.country && !out.some((p) => p.href === o.c.href)) out.push({ name: o.c.name, href: o.c.href, why: `Also ${o.c.label}, ${c.country}` });
  return out.slice(0, 3);
}

export const EF_CARDS: EFCard[] = RESOLVED.map(({ e, c }) => ({ ...c, pairs: pairsFor(e, c) }));

/** The mark for a page path (a card's href), e.g. "/stays/amangiri" → "No. 001". */
const BY_HREF = new Map(EF_CARDS.map((c) => [c.href, c] as const));
export const efCardForHref = (href: string | null | undefined) => (href ? BY_HREF.get(href.replace(/[?#].*$/, "").replace(/\/$/, "")) ?? null : null);

/** The Exceptional Few in one country (destination pages). */
export const efInCountry = (countryHref: string) => EF_CARDS.filter((c) => c.countryHref === countryHref);
