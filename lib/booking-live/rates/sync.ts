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
      const { error } = await sb.from("properties").update({ airtable_record_id: p.airtable_record_id, timezone: p.timezone, booking_mode: p.booking_mode, stay_type: p.stay_type, rate_source: p.rate_source, last_synced_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    }

    const upsert = async <T extends object>(table: string, rows: T[]) => {
      if (!rows.length) return new Map<string, string>();
      const { data, error } = await sb.from(table).upsert(rows, { onConflict: "airtable_record_id" }).select("id, airtable_record_id");
      if (error) throw new Error(`${table}: ${error.message}`);
      return new Map((data ?? []).map((r) => [r.airtable_record_id as string, r.id as string]));
    };

    const roomIds = await upsert("room_types", plan.roomTypes.map(({ property_at, ...r }) => ({ ...r, property_id: atProp.get(property_at) })));
    await upsert("rate_plans", plan.ratePlans.map(({ room_type_at, ...r }) => ({ ...r, room_type_id: roomIds.get(room_type_at) })));

    // Each card and ALL its rows go through one database transaction
    // (apply_rate_card): a failure leaves that card's previous version untouched
    // and the next card still syncs. The database also refuses rate changes made
    // after approval (same revision, different content) and overlaps with cards
    // already published.
    let rows = 0, applied = 0;
    for (const card of plan.cards) {
      const at = card.airtable_record_id, mine = <T extends { card_at: string }>(xs: T[]) => xs.filter((x) => x.card_at === at);
      const { sample, ...c } = card;
      const terms = plan.terms.find((t) => t.card_at === at);
      const payload = {
        card: { ...c, is_sample: sample },
        rules: mine(plan.rules), taxes: mine(plan.taxes), promotions: mine(plan.promotions), restrictions: mine(plan.restrictions),
        terms: terms ? { rates_are_net: terms.rates_are_net, commission_bp: terms.commission_bp, net_rate_notes: terms.net_rate_notes, contract_contact: terms.contract_contact } : null,
      };
      const { error } = await sb.rpc("apply_rate_card", { p: payload });
      if (error) { plan.refused.push({ card: at, label: card.version_label, reasons: [error.message] }); continue; }
      applied += 1;
      rows += payload.rules.length + payload.taxes.length + payload.promotions.length + payload.restrictions.length;
    }

    // Cards deleted from Airtable stop pricing: retire them (quotes keep their snapshot).
    const present = base.cards.map((x) => x.id);
    let retire = sb.from("rate_card_versions").update({ status: "retired", published_at: null }).neq("status", "retired").not("airtable_record_id", "is", null);
    if (present.length) retire = retire.not("airtable_record_id", "in", `(${present.map((k) => `"${k}"`).join(",")})`);
    const { error: re } = await retire;
    if (re) plan.warnings.push(`retiring deleted cards: ${re.message}`);

    const status = plan.refused.length ? "partial" : "ok";
    await sb.rpc("log_rate_sync", { p_status: status, p_cards: applied, p_rows: rows, p_errors: plan.refused });
    await logToAirtable(baseId, token, `Sync: ${applied} card(s), ${rows} row(s)`, status === "ok" ? "OK" : "Partial",
      [...plan.refused.map((r) => `REFUSED ${r.label}: ${r.reasons.join("; ")}`), ...plan.warnings].join("\n") || "All cards accepted.");
    return { ok: true, status, cards: applied, rows, refused: plan.refused, warnings: plan.warnings };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await sb.rpc("log_rate_sync", { p_status: "failed", p_cards: 0, p_rows: 0, p_errors: [{ error: message }] });
    await logToAirtable(baseId, token, "Sync failed", "Refused", message);
    return { ok: false, status: "failed", cards: 0, rows: 0, refused: [], warnings: [], error: message };
  }
}
