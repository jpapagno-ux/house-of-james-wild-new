import { advisorRows, config } from "@/lib/enquiry-record";
import { TA, TRADE_ACCOUNTS_TABLE, toTradeAccount, type TradeAccount } from "./trade-accounts";

// The fetch for trade accounts: the Enquiries base, with the token the enquiry record already uses
// (AIRTABLE_ENQUIRIES_TOKEN / AIRTABLE_ENQUIRIES_BASE_ID, server only). Never cached across requests:
// the desk pages are dynamic and the table is small.

export type TradeAccountsResult = { ok: true; accounts: TradeAccount[] } | { ok: false; reason: "not-configured" | "unavailable" };

export async function loadTradeAccounts(): Promise<TradeAccountsResult> {
  const cfg = config();
  if (!cfg) return { ok: false, reason: "not-configured" };
  try {
    const out: TradeAccount[] = [];
    let offset: string | undefined;
    do {
      const q = new URLSearchParams({ returnFieldsByFieldId: "1", pageSize: "100" });
      for (const id of Object.values(TA)) q.append("fields[]", id);
      if (offset) q.set("offset", offset);
      const r = await fetch(`https://api.airtable.com/v0/${cfg.baseId}/${TRADE_ACCOUNTS_TABLE}?${q}`, { headers: { Authorization: `Bearer ${cfg.token}` }, cache: "no-store" });
      if (!r.ok) return { ok: false, reason: "unavailable" };
      const j = (await r.json()) as { records: { id: string; fields: Record<string, unknown> }[]; offset?: string };
      for (const rec of j.records) { const a = toTradeAccount(rec); if (a) out.push(a); }
      offset = j.offset;
    } while (offset);
    return { ok: true, accounts: out };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

/** The advisor's row in the Airtable Advisors table, matched by slug; null when they have none. */
export async function advisorRecordIdFor(slug: string): Promise<string | null> {
  const cfg = config();
  if (!cfg || !slug) return null;
  try { return (await advisorRows(cfg)).find((a) => a.slug === slug)?.recordId ?? null; } catch { return null; }
}
