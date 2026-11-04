// Publish run (D-18 option A). Pure: turns what the editors approved on the Partner Desk into the
// batch the Library's contentApply function takes, and checks a batch before anything is sent.
//
// Where each approved field lands in the Library (Stay records):
//   nearest_airport  -> airport_name          (shown on the stay page today)
//   getting_there    -> airport_directions    (shown on the stay page today)
//   best_months      -> best_months           (shown on the stay page today)
//   everything else  -> partner_facts         (one structured field: the partner's own facts for the
//                       house to write from and for Iggi; the house's editorial copy, the features and
//                       experiences blocks, the tagline and "why we chose it", is never overwritten)

export const DIRECT: Record<string, string> = { nearest_airport: "airport_name", getting_there: "airport_directions", best_months: "best_months" };
export const FACTS = ["overview", "features", "experiences", "inclusions", "exclusions", "children_policy", "sustainability", "conservation", "community"] as const;

export type PendingRow = { property_id: string; ledger_id: string | null; name: string; content: Record<string, unknown>; fields: string[]; revision_ids: string[]; last_decided: string | null };
export type PartnerFacts = Partial<Record<(typeof FACTS)[number], string | string[]>> & { updated: string };
export type BatchRecord = { ledger_id: string; name: string; set: Record<string, string | PartnerFacts>; revision_ids: string[] };
export type Batch = { _note: string; by: string; batch: string; appliedOn: string | null; records: BatchRecord[]; skipped: { name: string; why: string }[] };

const LEDGER = /^[A-Z]{3}-\d{4}-\d{6}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (v: unknown): string | string[] | null => {
  if (Array.isArray(v)) { const xs = v.map(String).map((x) => x.trim()).filter(Boolean); return xs.length ? xs : null; }
  return typeof v === "string" && v.trim() ? v.trim() : null;
};

export const NOTE = "Publish run (D-18 A): content the house approved on the Partner Desk, applied to the Library by .github/workflows/content-apply.yml when this file is merged on main. Only airport_name, airport_directions, best_months and partner_facts can change. The workflow stamps the desk revisions published once the Library reports ok; appliedOn is then set by the follow-up commit.";

export function buildBatch(rows: PendingRow[], by: string, batch: string, today: string): Batch {
  const records: BatchRecord[] = [], skipped: Batch["skipped"] = [];
  for (const r of rows) {
    if (!r.ledger_id || !LEDGER.test(r.ledger_id)) { skipped.push({ name: r.name, why: "no Ledger ID" }); continue; }
    const set: BatchRecord["set"] = {};
    for (const [from, to] of Object.entries(DIRECT)) {
      const v = clean(r.content[from]);
      if (typeof v === "string" && r.fields.includes(from)) set[to] = v;
    }
    const facts: PartnerFacts = { updated: today };
    for (const k of FACTS) { const v = clean(r.content[k]); if (v) facts[k] = v; }
    if (Object.keys(facts).length > 1) set.partner_facts = facts;
    if (!Object.keys(set).length) { skipped.push({ name: r.name, why: "nothing the Library takes" }); continue; }
    records.push({ ledger_id: r.ledger_id, name: r.name, set, revision_ids: r.revision_ids.filter((x) => UUID.test(x)) });
  }
  return { _note: NOTE, by, batch, appliedOn: null, records, skipped };
}

/** What the workflow and the Library both enforce: nothing but the four fields, no long dashes, sane sizes. */
export function checkBatch(b: unknown): string[] {
  const out: string[] = [];
  const x = b as Partial<Batch> | null;
  if (!x || !Array.isArray(x.records)) return ["records missing"];
  if (typeof x.batch !== "string" || !/^[a-z0-9-]{3,80}$/.test(x.batch)) out.push("batch name");
  const allowed = new Set([...Object.values(DIRECT), "partner_facts"]);
  x.records.forEach((r, i) => {
    if (!LEDGER.test(String(r?.ledger_id))) out.push(`record ${i}: ledger_id`);
    for (const [k, v] of Object.entries(r?.set ?? {})) {
      if (!allowed.has(k)) out.push(`record ${i}: ${k} is not allowed`);
      const text = JSON.stringify(v);
      if (/[–—]/.test(text)) out.push(`record ${i}: ${k} has a long dash`);
      if (text.length > 12000) out.push(`record ${i}: ${k} too long`);
    }
    if (!Array.isArray(r?.revision_ids) || !r.revision_ids.every((id) => UUID.test(id))) out.push(`record ${i}: revision_ids`);
  });
  return out;
}

export const batchName = (now: Date) => `desk-${now.toISOString().slice(0, 16).replace(/[:T]/g, "-")}`;
