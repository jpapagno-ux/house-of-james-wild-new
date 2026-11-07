// Advisor Desk · Step 4 · The Ledger for advisors. Pure helpers, no imports, so plain Node can test them.
// The rows are built on the server from the site's own data (lib/platform/advisor-ledger-data.ts); these
// filter, sort and word them. Advisors see the house's rates and offers, never a partner's commission rate.

export type RateKind = "live" | "card" | "request";
export type LedgerRow = {
  slug: string; name: string; ledgerId: string | null; country: string | null; countrySlug: string | null; regionSlug: string | null;
  category: string | null; volumes: string[]; pathways: { id: string; name: string }[];
  hero: string | null; href: string | null; tagline: string | null; bestMonths: string | null;
  rate: { kind: RateKind; fromUsd: number | null; basis: string | null; estimated: boolean };
  offers: { headline: string; travel: string; program: string; ends: string; conditions: string | null }[];
  founder: string | null; // the founder's testimony, when he has been
  mine: string | null; // the advisor's own approved mark here (Stayed, Walked It, Sailed It, Sent Guests)
};

export type LedgerQuery = { q: string; volume: string; region: string; country: string; pathway: string; offers: boolean; priced: boolean; mine: boolean; page: number };
export const PER_PAGE = 30;

const one = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const str = (v: unknown, max = 80) => (typeof one(v) === "string" ? (one(v) as string).trim().slice(0, max) : "");
/** Search params made safe: short strings, slugs only where slugs are meant, a page from 1. */
export function parseQuery(sp: Record<string, string | string[] | undefined>): LedgerQuery {
  const slug = (k: string) => { const s = str(sp[k], 60); return /^[a-z0-9-]*$/.test(s) ? s : ""; };
  const path = str(sp.pathway, 7);
  const page = Math.max(1, Math.min(200, parseInt(str(sp.page, 4) || "1", 10) || 1));
  return { q: str(sp.q), volume: slug("volume"), region: slug("region"), country: slug("country"), pathway: /^PATH-0[1-8]$/.test(path) ? path : "", offers: str(sp.offers) === "1", priced: str(sp.priced) === "1", mine: str(sp.mine) === "1", page };
}

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function filterRows(rows: LedgerRow[], f: LedgerQuery): LedgerRow[] {
  const q = fold(f.q);
  return rows.filter((r) =>
    (!q || fold(`${r.name} ${r.country ?? ""} ${r.ledgerId ?? ""}`).includes(q)) &&
    (!f.volume || r.volumes.includes(f.volume)) &&
    (!f.region || r.regionSlug === f.region) &&
    (!f.country || r.countrySlug === f.country) &&
    (!f.pathway || r.pathways.some((p) => p.id === f.pathway)) &&
    (!f.offers || r.offers.length > 0) &&
    (!f.priced || r.rate.kind !== "request") &&
    (!f.mine || !!r.mine));
}

/** Order: the advisor's own places first, then stays with an offer, then priced, then by name. */
export function sortRows(rows: LedgerRow[]): LedgerRow[] {
  const w = (r: LedgerRow) => (r.mine ? 0 : 4) + (r.offers.length ? 0 : 2) + (r.rate.kind === "request" ? 1 : 0);
  return [...rows].sort((a, b) => w(a) - w(b) || a.name.localeCompare(b.name));
}

export const RATE_LABEL: Record<RateKind, string> = { live: "Live rates", card: "House rate card", request: "Rate on request" };
export function rateLine(r: LedgerRow["rate"]): string {
  if (r.kind === "live") return "Live rates and availability from the property's own engine";
  if (r.kind === "card" && r.fromUsd) return `From US$${Math.round(r.fromUsd).toLocaleString("en-US")}${r.basis ? ` ${r.basis}` : ""}${r.estimated ? " (to be confirmed)" : ""}`;
  if (r.kind === "card") return "House rate card on file";
  return "Rate on request: the house prices it for your dates";
}

/** The query back as a URL, for filters and pages. */
export function queryHref(f: LedgerQuery, patch: Partial<LedgerQuery> = {}): string {
  const x = { ...f, page: 1, ...patch };
  const p = new URLSearchParams();
  if (x.q) p.set("q", x.q);
  for (const k of ["volume", "region", "country", "pathway"] as const) if (x[k]) p.set(k, x[k]);
  for (const k of ["offers", "priced", "mine"] as const) if (x[k]) p.set(k, "1");
  if (x.page > 1) p.set("page", String(x.page));
  const s = p.toString();
  return `/advisor/ledger${s ? `?${s}` : ""}`;
}
