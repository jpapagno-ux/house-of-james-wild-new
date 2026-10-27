// Booking Live · Phase 2 · Airtable commercial base → Supabase rows (spec §6).
//
// Pure: takes Airtable records (fields by NAME, as the REST API returns them)
// and produces the rows to upsert, plus every card it refused and why. No
// imports, so plain Node can test it. The server-side sync (sync.ts) does the
// fetching and writing.
//
// Validation gates a card must pass before it can reach the website:
//   • Status "Published" AND an approver (Approved By or Approved At) — the
//     explicit approval the spec requires — unless it's a Sample card on Preview
//   • Sample Data cards only when allowSample is on (Preview), never Production
//   • currency, effective dates, deposit and cancellation tiers well-formed
//   • every rate row: dates inside the card's effective range, money ≥ 0,
//     room and plan belonging to the card's property
//   • no two published cards for one property with overlapping dates
// A refused card is skipped whole (the website keeps whatever it had before).

export type AirtableRecord = { id: string; fields: Record<string, unknown> };
export type Base = {
  properties: AirtableRecord[]; roomTypes: AirtableRecord[]; ratePlans: AirtableRecord[]; cards: AirtableRecord[];
  rates: AirtableRecord[]; taxes: AirtableRecord[]; promotions: AirtableRecord[]; restrictions: AirtableRecord[]; terms: AirtableRecord[];
};

export type PropertyRow = { airtable_record_id: string; legacy_cms_id: string; timezone: string; booking_mode: "inquiry" | "request" | "live"; merchant_model: string };
export type RoomTypeRow = { airtable_record_id: string; property_at: string; code: string; name: string; description: string | null; max_adults: number; max_children: number; max_occupancy: number; active: boolean };
export type RatePlanRow = { airtable_record_id: string; room_type_at: string; code: string; name: string; board_basis: string; refundability: string; inclusions: string | null; active: boolean };
export type CardRow = {
  airtable_record_id: string; property_at: string; version_label: string; supplier_contract_reference: string | null; source_revision: number;
  currency: string; effective_from: string; effective_to: string; status: "draft" | "approved" | "published" | "retired";
  payment_terms: { depositPercentBp?: number; depositFixedMinor?: number; balanceDueDaysBeforeArrival: number };
  cancellation: { summary: string; tiers: { daysBeforeArrival: number; penaltyBp: number }[] };
  timezone: string; approved_by: string | null; approved_at: string | null; sample: boolean;
};
export type RuleRow = {
  airtable_record_id: string; card_at: string; room_type_at: string; rate_plan_at: string; season: string; stay_start: string; stay_end: string;
  booking_start: string | null; booking_end: string | null; base_occupancy: number; amount_minor: number; extra_adult_minor: number | null;
  child_bands: { minAge: number; maxAge: number; amountMinor: number }[]; min_nights: number | null; max_nights: number | null;
  days_of_week: number[] | null; priority: number; active: boolean;
};
export type TaxRow = { airtable_record_id: string; card_at: string; name: string; jurisdiction: string | null; kind: "tax" | "fee"; charge_basis: string; amount_minor: number | null; percentage_bp: number | null; included_in_display_price: boolean; min_age: number | null };
export type PromoRow = { airtable_record_id: string; card_at: string; promotion_code: string; label: string; discount_type: string; discount_value: number; booking_start: string | null; booking_end: string | null; stay_start: string | null; stay_end: string | null; min_nights: number | null; eligible_plan_ats: string[]; stacking_policy: string; approval_status: string };
export type RestrictionRow = { airtable_record_id: string; card_at: string; room_type_at: string | null; start_date: string; end_date: string; restriction_type: string; minimum_stay: number | null };
export type TermsRow = { card_at: string; rates_are_net: boolean; commission_bp: number | null; net_rate_notes: string | null; contract_contact: string | null };

export type Plan = {
  properties: PropertyRow[]; roomTypes: RoomTypeRow[]; ratePlans: RatePlanRow[]; cards: CardRow[]; rules: RuleRow[];
  taxes: TaxRow[]; promotions: PromoRow[]; restrictions: RestrictionRow[]; terms: TermsRow[];
  refused: { card: string; label: string; reasons: string[] }[];
  warnings: string[];
};

// ---------- small readers

const str = (f: Record<string, unknown>, k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
const opt = (f: Record<string, unknown>, k: string) => str(f, k) || null;
const num = (f: Record<string, unknown>, k: string): number | null => (typeof f[k] === "number" && Number.isFinite(f[k]) ? (f[k] as number) : null);
const bool = (f: Record<string, unknown>, k: string) => f[k] === true;
const link = (f: Record<string, unknown>, k: string): string[] => (Array.isArray(f[k]) ? (f[k] as unknown[]).filter((x): x is string => typeof x === "string") : []);
const one = (f: Record<string, unknown>, k: string) => link(f, k)[0] ?? null;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const date = (f: Record<string, unknown>, k: string) => { const v = str(f, k); return DATE.test(v) ? v : null; };

/** Minor-unit digits for a currency (JPY 0, USD 2, KWD 3). */
export function currencyDigits(currency: string): number {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2; } catch { return 2; }
}
export const toMinor = (amount: number, digits: number) => Math.round(amount * 10 ** digits);
/** Airtable percent fields hold fractions (0.3 = 30%) → basis points. */
export const toBp = (fraction: number) => Math.round(fraction * 10_000);

const STATUS: Record<string, CardRow["status"]> = { Draft: "draft", Submitted: "draft", Approved: "approved", Published: "published", Retired: "retired" };
const BOARD: Record<string, string> = { "Room only": "room_only", "Bed & breakfast": "bed_breakfast", "Half board": "half_board", "Full board": "full_board", "Fully inclusive": "fully_inclusive" };
const REFUND: Record<string, string> = { Refundable: "refundable", "Partially refundable": "partially_refundable", "Non-refundable": "non_refundable" };
const BASIS: Record<string, string> = { "% of room": "percent_of_room", "Per person per night": "per_person_per_night", "Per room per night": "per_room_per_night", "Per stay": "per_stay" };
const PROMO: Record<string, string> = { "Percent off": "percent", "Fixed per night": "fixed_per_night", "Stay N pay N-1": "nth_night_free" };
const RESTRICT: Record<string, string> = { Closed: "closed", "Min stay": "min_stay", "Closed to arrival": "close_to_arrival", "Closed to departure": "close_to_departure" };
const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MODE: Record<string, PropertyRow["booking_mode"]> = { Inquiry: "inquiry", Request: "request", Live: "live" };
const MERCHANT: Record<string, string> = { "Supplier-direct": "supplier_direct", "House collection": "house_collection", "Connected account": "connected_account" };

export function parseTiers(s: string): { daysBeforeArrival: number; penaltyBp: number }[] | null {
  if (!s.trim()) return [];
  const out: { daysBeforeArrival: number; penaltyBp: number }[] = [];
  for (const part of s.split(",")) {
    const m = part.trim().match(/^(\d{1,3})\s*:\s*(\d{1,3}(?:\.\d+)?)%?$/);
    if (!m || Number(m[2]) > 100) return null;
    out.push({ daysBeforeArrival: Number(m[1]), penaltyBp: Math.round(Number(m[2]) * 100) });
  }
  return out;
}

export function buildPlan(base: Base, opts: { allowSample: boolean; knownLedgerIds: Set<string> }): Plan {
  const plan: Plan = { properties: [], roomTypes: [], ratePlans: [], cards: [], rules: [], taxes: [], promotions: [], restrictions: [], terms: [], refused: [], warnings: [] };

  // Properties
  const propTz = new Map<string, string>();
  for (const r of base.properties) {
    const f = r.fields, ledger = str(f, "Ledger ID");
    if (!/^[A-Z]{3}-\d{4}-\d{6}$/.test(ledger)) { plan.warnings.push(`Property ${r.id}: Ledger ID "${ledger}" is not a Ledger ID`); continue; }
    if (!opts.knownLedgerIds.has(ledger)) { plan.warnings.push(`Property ${ledger}: not on the website yet (no matching stay)`); continue; }
    const tz = str(f, "Time Zone") || "UTC";
    propTz.set(r.id, tz);
    plan.properties.push({ airtable_record_id: r.id, legacy_cms_id: ledger, timezone: tz, booking_mode: MODE[str(f, "Booking Mode")] ?? "inquiry", merchant_model: MERCHANT[str(f, "Merchant Model")] ?? "supplier_direct" });
  }

  // Room types and plans
  const roomProp = new Map<string, string>();
  for (const r of base.roomTypes) {
    const f = r.fields, prop = one(f, "Property"), code = str(f, "Room Code").toLowerCase();
    const maxA = num(f, "Max Adults"), maxC = num(f, "Max Children") ?? 0, maxO = num(f, "Max Occupancy");
    if (!prop || !propTz.has(prop)) { plan.warnings.push(`Room ${code || r.id}: no website property`); continue; }
    if (!/^[a-z0-9-]{1,60}$/.test(code) || !maxA || !maxO) { plan.warnings.push(`Room ${code || r.id}: needs a code and max adults / occupancy`); continue; }
    roomProp.set(r.id, prop);
    plan.roomTypes.push({ airtable_record_id: r.id, property_at: prop, code, name: str(f, "Room Name") || code, description: opt(f, "Description"), max_adults: maxA, max_children: maxC, max_occupancy: maxO, active: bool(f, "Active") });
  }
  const planRoom = new Map<string, string>();
  for (const r of base.ratePlans) {
    const f = r.fields, room = one(f, "Room Type"), code = str(f, "Plan Code").toLowerCase();
    if (!room || !roomProp.has(room)) { plan.warnings.push(`Plan ${code || r.id}: no room type`); continue; }
    if (!/^[a-z0-9-]{1,60}$/.test(code) || !BOARD[str(f, "Board Basis")]) { plan.warnings.push(`Plan ${code || r.id}: needs a code and board basis`); continue; }
    planRoom.set(r.id, room);
    plan.ratePlans.push({ airtable_record_id: r.id, room_type_at: room, code, name: str(f, "Plan Name") || code, board_basis: BOARD[str(f, "Board Basis")], refundability: REFUND[str(f, "Refundability")] ?? "refundable", inclusions: opt(f, "Inclusions"), active: bool(f, "Active") });
  }

  // Cards, each validated with its children as one unit
  for (const c of base.cards) {
    const f = c.fields, label = str(f, "Card") || c.id, reasons: string[] = [];
    const prop = one(f, "Property"), status = STATUS[str(f, "Status")] ?? "draft";
    const currency = str(f, "Currency"), from = date(f, "Effective From"), to = date(f, "Effective To");
    const sample = bool(f, "Sample Data");
    const approver = (f["Approved By"] as { email?: string; name?: string } | undefined)?.email ?? (f["Approved By"] as { name?: string } | undefined)?.name ?? null;
    const approvedAt = opt(f, "Approved At");
    if (!prop || !propTz.has(prop)) reasons.push("no website property linked");
    if (!/^[A-Z]{3}$/.test(currency)) reasons.push("currency missing");
    if (!from || !to || to < from) reasons.push("effective dates missing or reversed");
    if (sample && !opts.allowSample) reasons.push("Sample Data cards are allowed on Preview only");
    if (status === "published" && !sample && !approver && !approvedAt) reasons.push("published without an approver (fill Approved By or Approved At)");
    const tiers = parseTiers(str(f, "Cancellation Tiers"));
    if (tiers === null) reasons.push('cancellation tiers must look like "60:30, 30:100"');
    const depPct = num(f, "Deposit %"), depFixed = num(f, "Deposit Fixed"), balDays = num(f, "Balance Due (days before arrival)");
    if (depPct != null && (depPct < 0 || depPct > 1)) reasons.push("deposit % must be between 0 and 100");
    if (depFixed != null && depFixed < 0) reasons.push("deposit fixed can't be negative");
    const digits = currencyDigits(currency || "USD");

    const card: CardRow = {
      airtable_record_id: c.id, property_at: prop ?? "", version_label: label, supplier_contract_reference: opt(f, "Contract Reference"),
      source_revision: Math.max(1, Math.floor(num(f, "Revision") ?? 1)), currency, effective_from: from ?? "", effective_to: to ?? "", status,
      payment_terms: { ...(depFixed != null ? { depositFixedMinor: toMinor(depFixed, digits) } : { depositPercentBp: toBp(depPct ?? 1) }), balanceDueDaysBeforeArrival: Math.max(0, Math.floor(balDays ?? 0)) },
      cancellation: { summary: str(f, "Cancellation Summary"), tiers: tiers ?? [] },
      timezone: prop ? propTz.get(prop) ?? "UTC" : "UTC", approved_by: approver, approved_at: approvedAt, sample,
    };

    const inRange = (d: string | null) => !d || !from || !to || (d >= from && d <= to);
    const rules: RuleRow[] = [];
    for (const r of base.rates.filter((x) => one(x.fields, "Rate Card") === c.id)) {
      const g = r.fields, room = one(g, "Room Type"), rp = one(g, "Rate Plan"), name = str(g, "Season") || r.id;
      const ss = date(g, "Stay Start"), se = date(g, "Stay End"), amount = num(g, "Nightly Gross"), base0 = num(g, "Base Occupancy");
      if (!room || roomProp.get(room) !== prop) { reasons.push(`rate "${name}": room isn't at this property`); continue; }
      if (!rp || planRoom.get(rp) !== room) { reasons.push(`rate "${name}": plan doesn't belong to its room`); continue; }
      if (!ss || !se || se < ss) { reasons.push(`rate "${name}": stay dates missing or reversed`); continue; }
      if (!inRange(ss) || !inRange(se)) { reasons.push(`rate "${name}": dates fall outside the card's effective dates`); continue; }
      if (amount == null || amount < 0 || !base0 || base0 < 1) { reasons.push(`rate "${name}": nightly gross and base occupancy are required`); continue; }
      const bands: RuleRow["child_bands"] = [];
      for (const [k, lo, hi] of [["Child 0-3", 0, 3], ["Child 4-11", 4, 11], ["Child 12-17", 12, 17]] as const) {
        const v = num(g, k);
        if (v != null) { if (v < 0) reasons.push(`rate "${name}": ${k} can't be negative`); else bands.push({ minAge: lo, maxAge: hi, amountMinor: toMinor(v, digits) }); }
      }
      const extra = num(g, "Extra Adult");
      const days = Array.isArray(g["Nights of Week"]) ? (g["Nights of Week"] as string[]).map((d) => DOW[d]).filter((d) => d !== undefined) : [];
      rules.push({
        airtable_record_id: r.id, card_at: c.id, room_type_at: room, rate_plan_at: rp, season: name, stay_start: ss, stay_end: se,
        booking_start: date(g, "Booking Start"), booking_end: date(g, "Booking End"), base_occupancy: base0, amount_minor: toMinor(amount, digits),
        extra_adult_minor: extra == null ? null : toMinor(extra, digits), child_bands: bands, min_nights: num(g, "Min Nights"), max_nights: num(g, "Max Nights"),
        days_of_week: days.length ? days : null, priority: Math.floor(num(g, "Priority") ?? 0), active: bool(g, "Active"),
      });
    }
    if (status === "published" && !rules.some((r) => r.active)) reasons.push("published with no active rates");

    const taxes: TaxRow[] = [];
    for (const t of base.taxes.filter((x) => one(x.fields, "Rate Card") === c.id)) {
      const g = t.fields, basis = BASIS[str(g, "Basis")], pctv = num(g, "Percent"), amt = num(g, "Amount");
      if (!basis) { reasons.push(`tax "${str(g, "Name")}": basis missing`); continue; }
      if (basis === "percent_of_room" ? pctv == null : amt == null) { reasons.push(`tax "${str(g, "Name")}": ${basis === "percent_of_room" ? "percent" : "amount"} missing`); continue; }
      taxes.push({ airtable_record_id: t.id, card_at: c.id, name: str(g, "Name"), jurisdiction: opt(g, "Jurisdiction"), kind: str(g, "Kind") === "Fee" ? "fee" : "tax", charge_basis: basis, amount_minor: basis === "percent_of_room" ? null : toMinor(amt ?? 0, digits), percentage_bp: basis === "percent_of_room" ? toBp(pctv ?? 0) : null, included_in_display_price: bool(g, "Included in Rate"), min_age: num(g, "Min Age") });
    }

    const promos: PromoRow[] = [];
    for (const p of base.promotions.filter((x) => one(x.fields, "Rate Card") === c.id)) {
      const g = p.fields, code = str(g, "Code").toUpperCase(), type = PROMO[str(g, "Type")], value = num(g, "Value");
      if (!/^[A-Z0-9-]{2,30}$/.test(code) || !type || !value || value <= 0) { reasons.push(`promotion "${code || p.id}": code, type and value required`); continue; }
      promos.push({ airtable_record_id: p.id, card_at: c.id, promotion_code: code, label: str(g, "Label") || code, discount_type: type,
        discount_value: type === "percent" ? Math.round(value * 100) : type === "fixed_per_night" ? toMinor(value, digits) : Math.round(value),
        booking_start: date(g, "Booking Start"), booking_end: date(g, "Booking End"), stay_start: date(g, "Stay Start"), stay_end: date(g, "Stay End"),
        min_nights: num(g, "Min Nights"), eligible_plan_ats: link(g, "Eligible Plans"), stacking_policy: str(g, "Stacking") === "Stackable" ? "stackable" : "exclusive",
        approval_status: str(g, "Approval") === "Approved" ? "approved" : str(g, "Approval") === "Retired" ? "retired" : "draft" });
    }

    const restrictions: RestrictionRow[] = [];
    for (const x of base.restrictions.filter((y) => one(y.fields, "Rate Card") === c.id)) {
      const g = x.fields, type = RESTRICT[str(g, "Type")], s = date(g, "Start"), e = date(g, "End");
      if (!type || !s || !e || e < s) { reasons.push(`restriction "${str(g, "Name") || x.id}": type and dates required`); continue; }
      restrictions.push({ airtable_record_id: x.id, card_at: c.id, room_type_at: one(g, "Room Type"), start_date: s, end_date: e, restriction_type: type, minimum_stay: num(g, "Minimum Stay") });
    }

    const termsRec = base.terms.find((t) => one(t.fields, "Rate Card") === c.id);
    if (reasons.length) { plan.refused.push({ card: c.id, label, reasons }); continue; }
    plan.cards.push(card);
    plan.rules.push(...rules);
    plan.taxes.push(...taxes);
    plan.promotions.push(...promos);
    plan.restrictions.push(...restrictions);
    if (termsRec) {
      const g = termsRec.fields, comm = num(g, "Commission %");
      plan.terms.push({ card_at: c.id, rates_are_net: bool(g, "Rates Are Net"), commission_bp: comm == null ? null : toBp(comm), net_rate_notes: opt(g, "Net Rate Notes"), contract_contact: opt(g, "Contract Contact") });
    }
  }

  // Overlapping published cards for one property: refuse both (a human must decide).
  const pub = plan.cards.filter((c) => c.status === "published");
  const clash = new Set<string>();
  for (const a of pub) for (const b of pub) if (a !== b && a.property_at === b.property_at && a.effective_from <= b.effective_to && b.effective_from <= a.effective_to) clash.add(a.airtable_record_id);
  if (clash.size) {
    for (const id of clash) {
      const c = plan.cards.find((x) => x.airtable_record_id === id)!;
      plan.refused.push({ card: id, label: c.version_label, reasons: ["overlaps another published card for the same property"] });
    }
    const keep = (id: string) => !clash.has(id);
    plan.cards = plan.cards.filter((c) => keep(c.airtable_record_id));
    plan.rules = plan.rules.filter((r) => keep(r.card_at));
    plan.taxes = plan.taxes.filter((r) => keep(r.card_at));
    plan.promotions = plan.promotions.filter((r) => keep(r.card_at));
    plan.restrictions = plan.restrictions.filter((r) => keep(r.card_at));
    plan.terms = plan.terms.filter((r) => keep(r.card_at));
  }
  return plan;
}
