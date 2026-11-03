// Commission arithmetic for the house (D-25, James, 3 Nov 2026).
// Rules: docs/booking-live/COMMERCIAL-RULES.md. Money is whole cents, rates are basis points
// (2000 = 20.00%), so every figure ties to the cent: advisor + house always equals gross.
//
//   commissionable base = room, land or vessel cost after offers; never taxes, fees or sales tax
//   commission basis    = base x partner rate (from commission_terms)
//   net basis           = sell price - net price
//   advisor share       = 70% of the commission by default (per-advisor or per-booking override)
//   house share         = the rest

export const DEFAULT_ADVISOR_SHARE_BP = 7000;

export type CommissionLine = { kind: "accommodation" | "land" | "vessel" | "tax" | "fee" | "sales_tax" | "other"; cents: number };
export type CommissionInput =
  | { basis: "commission"; lines: CommissionLine[]; offerCents?: number; rateBp: number; advisorShareBp?: number }
  | { basis: "net"; sellCents: number; netCents: number; advisorShareBp?: number };
export type CommissionResult = {
  baseCents: number;
  rateBp: number | null;
  grossCents: number;
  advisorShareBp: number;
  advisorCents: number;
  houseCents: number;
};

const COMMISSIONABLE = new Set<CommissionLine["kind"]>(["accommodation", "land", "vessel"]);

function cents(n: number, label: string): number {
  if (!Number.isInteger(n) || n < 0) throw new Error(`${label} must be whole cents, zero or more`);
  return n;
}
function bp(n: number, label: string): number {
  if (!Number.isInteger(n) || n < 0 || n > 10000) throw new Error(`${label} must be 0 to 10000 basis points`);
  return n;
}
/** Half-up rounding of cents x bp / 10000, in integers only. */
export function applyBp(c: number, b: number): number {
  return Math.floor((c * b + 5000) / 10000);
}

export function commissionableBase(lines: CommissionLine[], offerCents = 0): number {
  const gross = lines.reduce((sum, l) => sum + (COMMISSIONABLE.has(l.kind) ? cents(l.cents, "line") : 0), 0);
  return Math.max(0, gross - cents(offerCents, "offer"));
}

export function calculateCommission(input: CommissionInput): CommissionResult {
  const share = bp(input.advisorShareBp ?? DEFAULT_ADVISOR_SHARE_BP, "advisor share");
  let baseCents: number, rateBp: number | null, grossCents: number;
  if (input.basis === "net") {
    const sell = cents(input.sellCents, "sell"), net = cents(input.netCents, "net");
    if (net > sell) throw new Error("net is above sell: no margin");
    baseCents = sell; rateBp = null; grossCents = sell - net;
  } else {
    baseCents = commissionableBase(input.lines, input.offerCents);
    rateBp = bp(input.rateBp, "rate");
    grossCents = applyBp(baseCents, rateBp);
  }
  const advisorCents = applyBp(grossCents, share);
  return { baseCents, rateBp, grossCents, advisorShareBp: share, advisorCents, houseCents: grossCents - advisorCents };
}

export function formatBp(b: number | null): string {
  if (b === null) return "Net";
  return `${(b / 100).toFixed(b % 100 === 0 ? 0 : 2)}%`;
}

export function formatMoney(c: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(c / 100);
}

// ===== who keeps the commercial terms, and the form fields (shared by the page and the API)
export const COMMISSION_KEEPER_ROLES = ["jw_admin", "jw_portfolio_manager", "admin", "finance"];
export const TERM_STATUS_LABEL = { to_confirm: "To confirm", confirmed: "Confirmed", retired: "Retired" } as const;
export type TermStatus = keyof typeof TERM_STATUS_LABEL;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export type TermFields = { scope: "partner" | "brand" | "property"; scopeId: string | null; basis: "commission" | "net"; rateBp: number | null; effectiveFrom: string; effectiveTo: string | null; status: TermStatus; note: string | null };

/** Parses the form: rate as a percentage ("17", "17.5") into basis points. */
export function parseTermFields(raw: Record<string, unknown>): { ok: true; value: TermFields } | { ok: false; message: string; field: string } {
  const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const scope = s("scope") || "partner";
  if (scope !== "partner" && scope !== "brand" && scope !== "property") return { ok: false, message: "Choose partner, brand or property", field: "scope" };
  const scopeId = scope === "partner" ? null : s("scopeId");
  if (scopeId !== null && !UUID.test(scopeId)) return { ok: false, message: `Choose the ${scope}`, field: "scopeId" };
  const basis = s("basis") || "commission";
  if (basis !== "commission" && basis !== "net") return { ok: false, message: "Commission or net", field: "basis" };
  let rateBp: number | null = null;
  if (basis === "commission") {
    const pct = s("rate").replace("%", "");
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(pct)) return { ok: false, message: "Enter the rate as a percentage, like 20 or 17.5", field: "rate" };
    rateBp = Math.round(Number(pct) * 100);
    if (rateBp > 10000) return { ok: false, message: "A rate can't be over 100%", field: "rate" };
  }
  const effectiveFrom = s("effectiveFrom");
  if (!DATE.test(effectiveFrom)) return { ok: false, message: "Enter the date the terms start", field: "effectiveFrom" };
  const effectiveTo = s("effectiveTo") || null;
  if (effectiveTo && (!DATE.test(effectiveTo) || effectiveTo < effectiveFrom)) return { ok: false, message: "The end date must be after the start", field: "effectiveTo" };
  const status = (s("status") || "to_confirm") as TermStatus;
  if (!(status in TERM_STATUS_LABEL)) return { ok: false, message: "Unknown status", field: "status" };
  const note = s("note").slice(0, 1000) || null;
  return { ok: true, value: { scope, scopeId, basis, rateBp, effectiveFrom, effectiveTo, status, note } };
}

// ===== which term applies to a property (mirrors private.commission_rate_for in the database)
export type TermLike = { id: string; brand_id: string | null; property_id: string | null; basis: "commission" | "net"; rate_bp: number | null; effective_from: string; effective_to: string | null; status: TermStatus };
export type TermSource = "property" | "brand" | "partner";
/** Most specific wins (property, then brand, then the whole partner); among equals, the latest start on or before the date. */
export function resolveTerm<T extends TermLike>(terms: T[], entity: { id: string; brand_id: string | null }, on: string): { term: T; source: TermSource } | null {
  const rank = (t: T) => (t.property_id ? 1 : t.brand_id ? 2 : 3);
  const fits = terms.filter((t) => t.status !== "retired" && t.effective_from <= on && (!t.effective_to || t.effective_to >= on)
    && (t.property_id === entity.id || (!t.property_id && (t.brand_id === null || t.brand_id === entity.brand_id))));
  fits.sort((a, b) => rank(a) - rank(b) || (a.effective_from < b.effective_from ? 1 : a.effective_from > b.effective_from ? -1 : 0));
  const t = fits[0];
  return t ? { term: t, source: rank(t) === 1 ? "property" : rank(t) === 2 ? "brand" : "partner" } : null;
}

// ===== advisor tiers (D-26, James, 3 Nov 2026). The database (public.advisor_tiers) is the source;
// these mirror it for display and tests. Without a tier an advisor is on Tier 2.
export const ADVISOR_TIERS = [
  { key: "tier_1", label: "Tier 1", shareBp: 7500 },
  { key: "tier_2", label: "Tier 2", shareBp: 7000 },
  { key: "tier_3", label: "Tier 3", shareBp: 5500 },
] as const;
export type AdvisorTier = (typeof ADVISOR_TIERS)[number]["key"];
export const advisorShareForTier = (tier: AdvisorTier | null | undefined): number =>
  (ADVISOR_TIERS.find((t) => t.key === tier) ?? ADVISOR_TIERS[1]).shareBp;
