// Manual rate-card push: runs the SAME buildPlan() and apply_rate_card path as
// the server sync (lib/booking-live/rates/sync.ts) over an export of the
// Commercial Rates base taken with the Airtable MCP (records keyed by field id),
// and prints the SQL to run in Supabase. Use it when the server sync cannot be
// called (no sync secret in hand) — see docs/booking-live/RATE-CARD-PUSH.md.
//
//   node --experimental-strip-types tests/tools/sync-from-export.ts export.json [STY-2026-290658 ...] > /tmp/sync.sql
//
// export.json: { properties, roomTypes, ratePlans, cards, rates, taxes?, promotions?, restrictions?, terms? },
// each an array of { id, cellValuesByFieldId } as list_records_for_table returns them.
// Ledger IDs after the file name restrict the run to those properties' cards.
import { readFileSync } from "node:fs";
const RAW = JSON.parse(readFileSync(process.argv[2], "utf8"));
import { buildPlan, type AirtableRecord } from "../../lib/booking-live/rates/airtable-map.ts";
const F: Record<string, Record<string, string>> = {
  properties: { fldD0Dxwcn29tD2bH: "Ledger ID", fldNjVZNl6b4jSsPb: "Property", fldwGhL5wBPbo5DGk: "Site Slug", fldqoRn5u9SQm33pD: "Time Zone", fldH6NwiLn0jOH7Vq: "Booking Mode", fldn4H89LVrYUaY3C: "Merchant Model", fldt1ZzBTPNj6cyH6: "Partner Contact", fldokqGsitlIT7C2L: "Notes", flde8105lI4IrhbnB: "Room Types", fld4qDUBMroJFfyvj: "Rate Cards", fldPw6HVzOn0Wu81W: "Stay Type", fldJDrqrfzXtpyJDq: "Rate Source" },
  roomTypes: { flda8Eu0PJ9X6p3CS: "Room Code", fldcD8aIXGKDnMnx1: "Room Name", fldtzkzdgBR8VYSGX: "Max Adults", fldKBsBPbdUT6RQ2X: "Max Children", fldPpN9QzQxopG5eA: "Max Occupancy", fld4cFXTmPDW0SvSs: "Description", fldRfCye0UJ2d16HR: "Active", fldJBiCovoZYpeeWP: "Property", fldrizVqzfz8po5i4: "Rate Plans", fld0goAUG3xtiqJcP: "Seasonal Rates", fldDxmDfZHDKeisf5: "Restrictions" },
  ratePlans: { fldGTMoFrQFxutqE6: "Plan Code", fld0gPNljaifiqc1n: "Plan Name", fldp3D7qJOenqxhQo: "Board Basis", fldPgvCAb0DBGU1YQ: "Refundability", fldAANASFiqSJxPe1: "Inclusions", fldPVTDZlA75QMvbe: "Active", fldJSQcpHA8NTciVk: "Room Type", fldip7uzj5QSrWfDr: "Seasonal Rates", fldEGhxHxLUeGCKaP: "Promotions" },
  cards: { fldJum6vCEkeKNESP: "Card", fldQ3O60392ByqpET: "Status", fldNGNSZ6FgT6FANb: "Currency", fldOLmHRvvPylXjvm: "Effective From", fldSnFiC03lYCrFJv: "Effective To", fldC6tJYcgh5buiXc: "Contract Reference", fldnth7DRrQxKX7gp: "Deposit %", fldK7W9murFtctrVW: "Deposit Fixed", flduDBHCrnixoEnwX: "Balance Due (days before arrival)", fldLicyNay0J7QUhE: "Cancellation Summary", fldoisPzvpMjxR7a5: "Cancellation Tiers", fldfPz3YYgjQqxIfp: "Approved By", fld2WUPdKEbun6uKO: "Approved At", fldZuYDcij1wBcHgG: "Revision", fldwkcGNw1rEAS1Cy: "Sample Data", fld2GLjAnpzzDcK1K: "Property", fld1aPkfWJutYQutN: "Seasonal Rates", fldLjatHAV2fnmRqg: "Taxes & Fees", fldsBLzBxq2YxZrpv: "Promotions", fldwddELy9EwKCUUk: "Restrictions", fldIPQN6e90f3nxpt: "Contract Terms", fld1XEDdmw71rH865: "Approved Revision" },
  rates: { fldGGcvxjBVyJyunK: "Season", fldXs26HOWuPXJ2Fz: "Stay Start", fldEhCN4nLoa4bxZr: "Stay End", fldEd61pHZtNEEhug: "Booking Start", fldsakmpNEiMzceN3: "Booking End", fldsX0xyR1BGwGJyT: "Base Occupancy", fldyhI3g4yLgjh6Pe: "Nightly Gross", fldWkR0xbRaQBYJiY: "Extra Adult", fldOMhalM5NbW9Fxq: "Child 0-3", fldojQiWU5vSpHn0V: "Child 4-11", fldRdcjZpKpy1oVMd: "Child 12-17", fldpsSFpFEG5xUQvX: "Min Nights", fldlfo7In41ehoW2D: "Max Nights", fldldfZMsrOa576CA: "Nights of Week", fldYVog1NI9RYuRNw: "Priority", fldw9C20nxPu3fRcA: "Active", fldffowfs9OCTotOV: "Rate Card", fldZrQVT0Fn1GzzJm: "Room Type", fld93xGvzmubO4l3X: "Rate Plan" },
};
const conv = (t: string, recs: { id: string; cellValuesByFieldId: Record<string, unknown> }[]): AirtableRecord[] => recs.map((r) => ({ id: r.id, fields: Object.fromEntries(Object.entries(r.cellValuesByFieldId).map(([k, v]) => {
  const name = F[t][k] ?? k;
  if (Array.isArray(v) && v.length && typeof v[0] === "object" && v[0] && "id" in (v[0] as object)) return [name, (v as { id: string; name?: string }[]).map((x) => x.id)];
  if (v && typeof v === "object" && "name" in (v as object) && "color" in (v as object)) return [name, (v as { name: string }).name];
  return [name, v];
})) }));
const only = new Set(process.argv.slice(3));
const F2: Record<string, Record<string, string>> = { ...F,
  taxes: { fldGIsHS0oY88lrBV: "Name", fldS1oi2glLOU1yHx: "Kind", fldIL4l0wwxogLqSv: "Basis", fld9u1tRVDfKR1aUr: "Percent", fldz5grk0iQw9NXBx: "Amount", fldbTseNAexvOAGWG: "Included in Rate", flduxMiSGBMPHU7nl: "Min Age", fld4eJIhabXmbdnIL: "Jurisdiction", fld49yAamhgq107Oi: "Rate Card" },
  promotions: { fld2oahsvNc1A4MdK: "Code", fldXx96yIYU35MBQJ: "Label", fldBRSCO5XhQK7YLe: "Type", fldnu6uuKRsfL51xd: "Value", fldje0K6UUgBaybPw: "Booking Start", fldEpjOQ5Vl4ZnTZf: "Booking End", fldAaUHlUzIfe5XFg: "Stay Start", fldJ3k5Q4ioze7CvO: "Stay End", fldMxdne1EzsZSj0B: "Min Nights", fldRErSYMKM5dMv0a: "Stacking", fldlziRgTVnisk3eI: "Approval", fld9J8rHRoU40Xvrh: "Rate Card", fldAU8dIaoV9qUa5w: "Eligible Plans" },
  restrictions: { fldFJZcXT4GKAtEqK: "Name", fldY2QppYhdUxDC4Z: "Type", fldXvQfqIfuRbAtDw: "Start", fldpPk72Nt92xehe6: "End", fldflOgmrRkej6iSc: "Minimum Stay", fldTXyVHqsvnwJkZX: "Rate Card", fldlieD5kfzqerWSD: "Room Type" },
  terms: { fldzaJoEOCoJZuZf0: "Term", fld1OuYNTzcz3ZoXV: "Rates Are Net", fldywmVrGmdk0yJ0B: "Commission %", fldr7ST5fjgmPnQGP: "Net Rate Notes", fld4ybYzvBhhNM4fb: "Contract Contact", fldEq3x1ZZblWObh2: "Contract File", fldhuIkJarrA0MhlK: "Rate Card" },
};
Object.assign(F, F2);
const base = {
  properties: conv("properties", (RAW.properties ?? []).filter((p: { cellValuesByFieldId: Record<string, unknown> }) => !only.size || only.has(String(p.cellValuesByFieldId.fldD0Dxwcn29tD2bH)))),
  roomTypes: conv("roomTypes", RAW.roomTypes),
  ratePlans: conv("ratePlans", RAW.ratePlans),
  cards: conv("cards", RAW.cards),
  rates: conv("rates", RAW.rates),
  taxes: conv("taxes", RAW.taxes ?? []), promotions: conv("promotions", RAW.promotions ?? []), restrictions: conv("restrictions", RAW.restrictions ?? []), terms: conv("terms", RAW.terms ?? []),
};
const keep = new Set(base.properties.map((p) => p.id));
base.cards = base.cards.filter((c) => keep.has((c.fields["Property"] as string[] | undefined)?.[0] ?? ""));
const plan = buildPlan(base, { allowSample: false, knownLedgerIds: new Set(base.properties.map((p) => p.fields["Ledger ID"] as string)) });
console.error(JSON.stringify({ refused: plan.refused, warnings: plan.warnings, cards: plan.cards.length, rules: plan.rules.length, rooms: plan.roomTypes.length, plans: plan.ratePlans.length }));
if (plan.refused.length) process.exit(1);
const q = (v: unknown): string => v === null || v === undefined ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const out: string[] = ["begin;"];
for (const p of plan.properties) out.push(`update public.properties set airtable_record_id=${q(p.airtable_record_id)}, timezone=${q(p.timezone)}, booking_mode=${q(p.booking_mode)}, stay_type=${q(p.stay_type)}, rate_source=${q(p.rate_source)}, last_synced_at=now() where legacy_cms_id=${q(p.legacy_cms_id)};`);
for (const r of plan.roomTypes) out.push(`insert into public.room_types (airtable_record_id, property_id, code, name, description, max_adults, max_children, max_occupancy, active) values (${q(r.airtable_record_id)}, (select id from public.properties where airtable_record_id=${q(r.property_at)}), ${q(r.code)}, ${q(r.name)}, ${q(r.description)}, ${r.max_adults}, ${r.max_children}, ${r.max_occupancy}, ${r.active}) on conflict (airtable_record_id) do update set code=excluded.code, name=excluded.name, description=excluded.description, max_adults=excluded.max_adults, max_children=excluded.max_children, max_occupancy=excluded.max_occupancy, active=excluded.active;`);
for (const r of plan.ratePlans) out.push(`insert into public.rate_plans (airtable_record_id, room_type_id, code, name, board_basis, refundability, inclusions, active) values (${q(r.airtable_record_id)}, (select id from public.room_types where airtable_record_id=${q(r.room_type_at)}), ${q(r.code)}, ${q(r.name)}, ${q(r.board_basis)}, ${q(r.refundability)}, ${q(r.inclusions)}, ${r.active}) on conflict (airtable_record_id) do update set name=excluded.name, board_basis=excluded.board_basis, refundability=excluded.refundability, inclusions=excluded.inclusions, active=excluded.active;`);
for (const card of plan.cards) {
  const at = card.airtable_record_id, mine = <T extends { card_at: string }>(xs: T[]) => xs.filter((x) => x.card_at === at);
  const { sample, ...c } = card;
  const t = plan.terms.find((x) => x.card_at === at);
  const payload = { card: { ...c, is_sample: sample }, rules: mine(plan.rules), taxes: mine(plan.taxes), promotions: mine(plan.promotions), restrictions: mine(plan.restrictions), terms: t ? { rates_are_net: t.rates_are_net, commission_bp: t.commission_bp, net_rate_notes: t.net_rate_notes, contract_contact: t.contract_contact } : null };
  out.push(`select public.apply_rate_card(${q(JSON.stringify(payload))}::jsonb) as card_id;`);
}
out.push(`select public.log_rate_sync('ok', ${plan.cards.length}, ${plan.rules.length}, '[]'::jsonb);`, "commit;");
console.log(out.join("\n"));
