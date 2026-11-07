// Advisor Desk · Step 6 · The commission ledger. Pure helpers, no imports, so plain Node can test them.
// The database records and moves the lines (supabase/migrations/*_commission_ledger.sql); these word the
// statuses, add up the totals by currency, and group them for the house's reports.

export type LineStatus = "expected" | "invoiced" | "received" | "advisor_paid" | "cancelled";
export const LINE_STATUS: Record<LineStatus, { label: string; advisor: string; tone: "progress" | "good" | "attention" | "neutral" }> = {
  expected: { label: "Expected", advisor: "Expected after travel", tone: "progress" },
  invoiced: { label: "Invoiced to partner", advisor: "The house has invoiced the partner", tone: "progress" },
  received: { label: "Received", advisor: "Received by the house; your payment is next", tone: "good" },
  advisor_paid: { label: "Advisor paid", advisor: "Paid to you", tone: "good" },
  cancelled: { label: "Cancelled", advisor: "Cancelled", tone: "neutral" },
};
export const NEXT: Partial<Record<LineStatus, { to: LineStatus; action: string; ref: string }>> = {
  expected: { to: "invoiced", action: "Mark invoiced to the partner", ref: "Invoice number" },
  invoiced: { to: "received", action: "Mark received from the partner", ref: "Payment reference" },
  received: { to: "advisor_paid", action: "Mark paid to the advisor", ref: "Payment reference" },
};

export type Line = {
  id: string; ref: string; source: string; advisor_id: string | null; organization_id: string | null; property_id: string | null;
  stay_name: string; client_name: string | null; arrival: string; departure: string; booked_on: string; currency: string;
  sell_minor: number; base_minor: number; rate_bp: number; rate_source: string; gross_minor: number; tier: string | null;
  advisor_share_bp: number; advisor_minor: number; house_minor: number; status: LineStatus;
  invoiced_on: string | null; invoice_reference: string | null; received_on: string | null; received_reference: string | null;
  paid_on: string | null; paid_reference: string | null; note: string | null; advisor_request_id: string | null;
};

type Sums = { sell: number; gross: number; advisor: number; house: number; count: number };
const zero = (): Sums => ({ sell: 0, gross: 0, advisor: 0, house: 0, count: 0 });
/** Totals per currency (amounts in different currencies are never added together). Cancelled lines left out. */
export function totals(lines: Line[], key: (l: Line) => string = () => "all"): Map<string, Map<string, Sums>> {
  const out = new Map<string, Map<string, Sums>>();
  for (const l of lines) {
    if (l.status === "cancelled") continue;
    const k = key(l);
    const byCur = out.get(k) ?? new Map<string, Sums>();
    const s = byCur.get(l.currency) ?? zero();
    s.sell += l.sell_minor; s.gross += l.gross_minor; s.advisor += l.advisor_minor; s.house += l.house_minor; s.count += 1;
    byCur.set(l.currency, s); out.set(k, byCur);
  }
  return out;
}

/** What the house is owed by partners and owes advisors, per currency. */
export function position(lines: Line[]): Map<string, { owedToHouse: number; owedToAdvisors: number; paidToAdvisors: number }> {
  const out = new Map<string, { owedToHouse: number; owedToAdvisors: number; paidToAdvisors: number }>();
  for (const l of lines) {
    if (l.status === "cancelled") continue;
    const p = out.get(l.currency) ?? { owedToHouse: 0, owedToAdvisors: 0, paidToAdvisors: 0 };
    if (l.status === "expected" || l.status === "invoiced") p.owedToHouse += l.gross_minor;
    if (l.status !== "advisor_paid") p.owedToAdvisors += l.advisor_minor; else p.paidToAdvisors += l.advisor_minor;
    out.set(l.currency, p);
  }
  return out;
}

export type Earning = { id: string; ref: string; stay_name: string; client_name: string | null; arrival: string; departure: string; booked_on: string; currency: string; sell_minor: number; advisor_minor: number; tier: string | null; status: LineStatus; paid_on: string | null; paid_reference: string | null; request_id: string | null };
/** The advisor's own totals per currency: on the way (expected, invoiced, received) and paid. */
export function earningTotals(rows: Earning[]): Map<string, { coming: number; paid: number; count: number }> {
  const out = new Map<string, { coming: number; paid: number; count: number }>();
  for (const r of rows) {
    if (r.status === "cancelled") continue;
    const t = out.get(r.currency) ?? { coming: 0, paid: 0, count: 0 };
    if (r.status === "advisor_paid") t.paid += r.advisor_minor; else t.coming += r.advisor_minor;
    t.count += 1; out.set(r.currency, t);
  }
  return out;
}

export const pct = (bp: number) => `${(bp / 100).toFixed(bp % 100 ? 2 : 0)}%`;
export const month = (iso: string) => iso.slice(0, 7);
/** Same split as the database: gross half-up from base and rate, the advisor's share of the gross, the rest to the house. */
export function split(baseMinor: number, rateBp: number, shareBp: number) {
  const gross = Math.round((baseMinor * rateBp) / 10000);
  const advisor = Math.round((gross * shareBp) / 10000);
  return { gross, advisor, house: gross - advisor };
}
