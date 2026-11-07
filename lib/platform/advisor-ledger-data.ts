import "server-only";
import { STAYS, pageReady } from "@/lib/content/stays";
import { pathwayStays } from "@/lib/content/pathways";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { offersFor } from "@/lib/content/offers/offers";
import { MORE } from "@/lib/content/rate-cards";
import { BASIS_LABEL } from "@/lib/rate-card";
import { isPast } from "@/lib/dates";
import { founderProof, type HouseStatus } from "@/lib/ledger/status";
import { ADVISORS } from "@/lib/content/advisors";
import type { LedgerRow } from "./advisor-ledger";

// The Ledger as advisors see it: every stay on file with its Pathways, how it is priced, its live offers,
// the founder's testimony and the advisor's own mark. Built from the same data the website shows; never
// a partner's commission rate.

/** The house's MORE rate card for a stay page, from its current year: the lowest "from" rate. */
function cardRate(slug: string): LedgerRow["rate"] | null {
  const page = MORE.pages[`stay:${slug}`];
  if (!page) return null;
  const years = Object.values(MORE.properties[page.property]?.years ?? {}).filter((y) => !isPast(y.validTo));
  const rows = (years[0]?.rows ?? []).filter((r) => !page.rows || page.rows.includes(r.key));
  if (!rows.length) return { kind: "card", fromUsd: null, basis: null, estimated: false };
  const low = rows.reduce((a, b) => (b.usd < a.usd ? b : a));
  return { kind: "card", fromUsd: low.usd, basis: BASIS_LABEL[low.basis], estimated: false };
}

let cache: LedgerRow[] | null = null;
function baseRows(): LedgerRow[] {
  if (cache) return cache;
  const chips = new Map(pathwayStays().map((p) => [p.slug, [p.primary, ...p.secondary]]));
  cache = STAYS.filter((s) => s.ledgerId).map((s) => {
    const pw = chips.get(s.slug) ?? (s.pathway?.status === "approved" ? [s.pathway.primary, ...s.pathway.secondary].map((id) => PATHWAYS[id as PathwayId]).filter(Boolean) : []);
    return {
      slug: s.slug, name: s.name, ledgerId: s.ledgerId, country: s.country, countrySlug: s.countrySlug, regionSlug: s.regionSlug,
      category: s.category, volumes: s.volumes ?? [], pathways: pw.map((p) => ({ id: p.id, name: p.name })),
      hero: s.hero, href: pageReady(s) ? `/stays/${s.slug}` : null, tagline: s.tagline, bestMonths: s.bestMonths,
      rate: s.engine ? { kind: "live", fromUsd: null, basis: null, estimated: false } : cardRate(s.slug) ?? { kind: "request", fromUsd: null, basis: null, estimated: false },
      offers: [], founder: founderProof(s.name, s.status as HouseStatus, s.statusDate, s.slug), mine: null,
    } satisfies LedgerRow;
  });
  return cache;
}

/** The rows for one advisor: offers as of today (they end by date) and the advisor's own marks. */
export function ledgerRows(advisorSlug: string): LedgerRow[] {
  const marks = new Map((ADVISORS.find((a) => a.slug === advisorSlug)?.dna?.marks ?? []).map((m) => [m.ledgerId, m.mark as string]));
  return baseRows().map((r) => ({
    ...r,
    offers: offersFor(r.slug).map((o) => ({ headline: o.headline, travel: o.travel.text, program: o.program, ends: o.travel.to, conditions: o.conditions ?? null })),
    mine: r.ledgerId ? marks.get(r.ledgerId) ?? null : null,
  }));
}
export const ledgerRow = (advisorSlug: string, slug: string) => ledgerRows(advisorSlug).find((r) => r.slug === slug) ?? null;
