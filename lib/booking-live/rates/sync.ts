import "server-only";
import { supabaseAdmin } from "../supabase/admin";
import { buildPlan, type AirtableRecord, type Base, type Plan } from "./airtable-map";

// Airtable commercial base → Supabase (spec §6: scheduled read, validation,
// approval gate, upsert, conflict detection, error log). Runs from
// POST /api/v1/internal/rates/sync (Vercel Cron or a manual call).
//
// Needs (server-only env): AIRTABLE_TOKEN (read-only personal access token,
// scoped to the commercial base), AIRTABLE_RATES_BASE_ID, SUPABASE_SERVICE_ROLE_KEY.
// Sample cards sync only when BOOKING_LIVE_ALLOW_SAMPLE_RATES=on (Preview).

const TABLES: Record<keyof Base, string> = {
  properties: "Properties", roomTypes: "Room Types", ratePlans: "Rate Plans", cards: "Rate Cards", rates: "Seasonal Rates",
  taxes: "Taxes & Fees", promotions: "Promotions", restrictions: "Restrictions", terms: "Contract Terms",
};

async function fetchTable(baseId: string, token: string, table: string): Promise<AirtableRecord[]> {
  const out: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`Airtable ${table}: HTTP ${res.status}`);
    const json = (await res.json()) as { records: AirtableRecord[]; offset?: string };
    out.push(...json.records);
    offset = json.offset;
  } while (offset);
  return out;
}

export async function fetchBase(baseId: string, token: string): Promise<Base> {
  const entries = await Promise.all(Object.entries(TABLES).map(async ([k, t]) => [k, await fetchTable(baseId, token, t)] as const));
  return Object.fromEntries(entries) as Base;
}

async function logToAirtable(baseId: string, token: string, event: string, result: "OK" | "Refused" | "Partial", details: string) {
  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent("Sync Log")}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields: { Event: event, When: new Date().toISOString(), Result: result, Details: details.slice(0, 90_000) } }] }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch { /* the log is best-effort; Supabase keeps the authoritative run record */ }
}

export type SyncResult = { ok: boolean; status: "ok" | "partial" | "failed"; cards: number; rows: number; refused: Plan["refused"]; warnings: string[]; error?: string };

export async function runSync(): Promise<SyncResult> {
  const token = process.env.AIRTABLE_TOKEN, baseId = process.env.AIRTABLE_RATES_BASE_ID;
  const sb = supabaseAdmin();
  if (!token || !baseId || !sb) return { ok: false, status: "failed", cards: 0, rows: 0, refused: [], warnings: [], error: "Sync is not configured (AIRTABLE_TOKEN, AIRTABLE_RATES_BASE_ID, SUPABASE_SERVICE_ROLE_KEY)" };
  const allowSample = process.env.BOOKING_LIVE_ALLOW_SAMPLE_RATES === "on" && process.env.VERCEL_ENV !== "production";

  try {
    const base = await fetchBase(baseId, token);
    const { data: props, error: pe } = await sb.from("properties").select("id, legacy_cms_id");
    if (pe) throw pe;
    const propId = new Map((props ?? []).map((p) => [p.legacy_cms_id as string, p.id as string]));
    const plan = buildPlan(base, { allowSample, knownLedgerIds: new Set(propId.keys()) });

    // Properties: booking mode and time zone, matched by Ledger ID (website rows are never created here).
    const atProp = new Map<string, string>();
    for (const p of plan.properties) {
      const id = propId.get(p.legacy_cms_id)!;
      atProp.set(p.airtable_record_id, id);
      const { error } = await sb.from("properties").update({ airtable_record_id: p.airtable_record_id, timezone: p.timezone, booking_mode: p.booking_mode, last_synced_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    }

    const upsert = async <T extends object>(table: string, rows: T[]) => {
      if (!rows.length) return new Map<string, string>();
      const { data, error } = await sb.from(table).upsert(rows, { onConflict: "airtable_record_id" }).select("id, airtable_record_id");
      if (error) throw new Error(`${table}: ${error.message}`);
      return new Map((data ?? []).map((r) => [r.airtable_record_id as string, r.id as string]));
    };

    const roomIds = await upsert("room_types", plan.roomTypes.map(({ property_at, ...r }) => ({ ...r, property_id: atProp.get(property_at) })));
    const planIds = await upsert("rate_plans", plan.ratePlans.map(({ room_type_at, ...r }) => ({ ...r, room_type_id: roomIds.get(room_type_at) })));
    const cardIds = await upsert("rate_card_versions", plan.cards.map(({ property_at, sample: _s, ...c }) => ({ ...c, property_id: atProp.get(property_at), published_at: c.status === "published" ? new Date().toISOString() : null, synced_at: new Date().toISOString() })));

    let rows = 0;
    // Children: upsert what's in Airtable, then remove rows deleted there (per card).
    const children: [string, { airtable_record_id: string; card_at: string }[], (r: never) => object][] = [
      ["seasonal_rate_rules", plan.rules, ({ card_at, room_type_at, rate_plan_at, ...r }: (typeof plan.rules)[number]) => ({ ...r, rate_card_version_id: cardIds.get(card_at), room_type_id: roomIds.get(room_type_at), rate_plan_id: planIds.get(rate_plan_at) })],
      ["tax_fee_rules", plan.taxes, ({ card_at, ...r }: (typeof plan.taxes)[number]) => ({ ...r, rate_card_version_id: cardIds.get(card_at) })],
      ["promotions", plan.promotions, ({ card_at, eligible_plan_ats, ...r }: (typeof plan.promotions)[number]) => ({ ...r, rate_card_version_id: cardIds.get(card_at), eligible_rate_plans: eligible_plan_ats.length ? eligible_plan_ats.map((a) => planIds.get(a)).filter(Boolean) : null })],
      ["inventory_restrictions", plan.restrictions, ({ card_at, room_type_at, ...r }: (typeof plan.restrictions)[number]) => ({ ...r, rate_card_version_id: cardIds.get(card_at), room_type_id: room_type_at ? roomIds.get(room_type_at) ?? null : null })],
    ];
    for (const [table, list, map] of children) {
      await upsert(table, list.map((r) => map(r as never)));
      rows += list.length;
      for (const [cardAt, cardId] of cardIds) {
        const keep = list.filter((r) => r.card_at === cardAt).map((r) => r.airtable_record_id);
        let q = sb.from(table).delete().eq("rate_card_version_id", cardId);
        if (keep.length) q = q.not("airtable_record_id", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
        const { error } = await q;
        if (error) throw new Error(`${table} cleanup: ${error.message}`);
      }
    }

    // Private terms through the service-role-only function.
    const terms = plan.terms.map(({ card_at, ...t }) => ({ ...t, rate_card_version_id: cardIds.get(card_at) })).filter((t) => t.rate_card_version_id);
    if (terms.length) {
      const { error } = await sb.rpc("sync_contract_terms", { rows: terms });
      if (error) throw new Error(`contract terms: ${error.message}`);
    }

    const status = plan.refused.length ? "partial" : "ok";
    await sb.rpc("log_rate_sync", { p_status: status, p_cards: plan.cards.length, p_rows: rows, p_errors: plan.refused });
    await logToAirtable(baseId, token, `Sync: ${plan.cards.length} card(s), ${rows} row(s)`, status === "ok" ? "OK" : "Partial",
      [...plan.refused.map((r) => `REFUSED ${r.label}: ${r.reasons.join("; ")}`), ...plan.warnings].join("\n") || "All cards accepted.");
    return { ok: true, status, cards: plan.cards.length, rows, refused: plan.refused, warnings: plan.warnings };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await sb.rpc("log_rate_sync", { p_status: "failed", p_cards: 0, p_rows: 0, p_errors: [{ error: message }] });
    await logToAirtable(baseId, token, "Sync failed", "Refused", message);
    return { ok: false, status: "failed", cards: 0, rows: 0, refused: [], warnings: [], error: message };
  }
}
