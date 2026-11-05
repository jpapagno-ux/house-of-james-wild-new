// Commission from Airtable Partner Brands (D-31). Pure: maps the table's rows to what
// public.sync_commission_terms() takes, and words its answer for the Sync Log.
// Airtable is where the house types a commission; the desk only reads a synced copy.

export type BrandRow = { id: string; fields: Record<string, unknown> };
export type CommissionSyncRow = { record_id: string; brand: string; partner_code: string; rate_bp: number | null; net: boolean; confirmed: boolean; note: string };
export type CommissionSyncAnswer = Partial<Record<"created" | "adopted" | "changed" | "status_or_note" | "unchanged" | "unmatched" | "orphaned", string[]>>;

export const PARTNER_BRANDS_TABLE = "Partner Brands";
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const choice = (v: unknown) => (typeof v === "string" ? v : v && typeof v === "object" && "name" in v ? String((v as { name: unknown }).name) : "");

/** Airtable percent fields arrive as a fraction (0.2 = 20%). Anything odd becomes null, never a guess. */
export function percentToBp(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) return null;
  return Math.round(v * 10000);
}

export function mapPartnerBrands(rows: BrandRow[]): CommissionSyncRow[] {
  return rows.map(({ id, fields: f }) => {
    const brand = text(f["Brand"]) || "(unnamed brand)";
    const basis = choice(f["Commission basis"]);
    const on = text(f["Commissionable on"]);
    const checked = text(f["Source and date checked"]);
    const note = [`${brand} (Airtable Partner Brands)`, basis && `Basis: ${basis}`, on && `Commissionable on: ${on}`, checked && `Checked: ${checked}`]
      .filter(Boolean).join(". ").slice(0, 1000);
    return {
      record_id: id, brand, partner_code: text(f["Partner Code"]).toUpperCase(),
      rate_bp: percentToBp(f["Commission %"]),
      net: basis.startsWith("Net"),
      confirmed: choice(f["Contract status"]) === "Confirmed",
      note,
    };
  });
}

/** One line per outcome for the Airtable Sync Log; empty groups are left out. */
export function describeCommissionSync(a: CommissionSyncAnswer): string {
  const line = (label: string, xs?: string[]) => (xs && xs.length ? `${label}: ${xs.join(", ")}` : "");
  return [
    line("Commission new on the desk", a.created), line("Commission now read from Airtable", a.adopted),
    line("Commission changed", a.changed), line("Status or note updated", a.status_or_note),
    line("Unchanged", a.unchanged), line("NOT SYNCED (add the Partner Code)", a.unmatched),
    line("On the desk but gone from Airtable (left as it was)", a.orphaned),
  ].filter(Boolean).join("\n") || "No Partner Brands rows.";
}
