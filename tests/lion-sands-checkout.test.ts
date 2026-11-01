import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildPlan } from "../lib/booking-live/rates/airtable-map.ts";
import { quote, type RateCard, type Room } from "../lib/booking-live/pricing/engine.ts";

// The Lion Sands checkout, end to end through the real pipeline: the Airtable
// export → buildPlan (the sync's validation) → the pricing engine (what
// /api/v1/availability/search and /api/v1/quotes run) → the figures the
// traveler sees on Request to Reserve. Every unit, one worked stay:
// 3 nights, 10–13 June 2027, 2 adults (6 for the whole residence).
//
// Pricing order (COMMERCIAL-RULES.md): room nights − offers + local taxes the
// rate excludes + 7% Florida sales tax = total → 30% deposit → balance 60 days
// before arrival. VAT 15% is in the rate: shown, never added.

type Rec = { id: string; cellValuesByFieldId: Record<string, unknown> };
const RAW = JSON.parse(readFileSync(new URL("./fixtures/airtable-export-lion-sands.json", import.meta.url), "utf8")) as Record<string, Rec[]>;
const NAME: Record<string, Record<string, string>> = {
  properties: { fldD0Dxwcn29tD2bH: "Ledger ID", fldwGhL5wBPbo5DGk: "Site Slug", fldqoRn5u9SQm33pD: "Time Zone", fldH6NwiLn0jOH7Vq: "Booking Mode", fldn4H89LVrYUaY3C: "Merchant Model", fldPw6HVzOn0Wu81W: "Stay Type", fldJDrqrfzXtpyJDq: "Rate Source" },
  roomTypes: { flda8Eu0PJ9X6p3CS: "Room Code", fldcD8aIXGKDnMnx1: "Room Name", fldtzkzdgBR8VYSGX: "Max Adults", fldKBsBPbdUT6RQ2X: "Max Children", fldPpN9QzQxopG5eA: "Max Occupancy", fld4cFXTmPDW0SvSs: "Description", fldRfCye0UJ2d16HR: "Active", fldJBiCovoZYpeeWP: "Property" },
  ratePlans: { fldGTMoFrQFxutqE6: "Plan Code", fld0gPNljaifiqc1n: "Plan Name", fldp3D7qJOenqxhQo: "Board Basis", fldPgvCAb0DBGU1YQ: "Refundability", fldAANASFiqSJxPe1: "Inclusions", fldPVTDZlA75QMvbe: "Active", fldJSQcpHA8NTciVk: "Room Type" },
  cards: { fldJum6vCEkeKNESP: "Card", fldQ3O60392ByqpET: "Status", fldNGNSZ6FgT6FANb: "Currency", fldOLmHRvvPylXjvm: "Effective From", fldSnFiC03lYCrFJv: "Effective To", fldC6tJYcgh5buiXc: "Contract Reference", fldnth7DRrQxKX7gp: "Deposit %", flduDBHCrnixoEnwX: "Balance Due (days before arrival)", fldLicyNay0J7QUhE: "Cancellation Summary", fldoisPzvpMjxR7a5: "Cancellation Tiers", fld2WUPdKEbun6uKO: "Approved At", fldZuYDcij1wBcHgG: "Revision", fldwkcGNw1rEAS1Cy: "Sample Data", fld2GLjAnpzzDcK1K: "Property", fld1XEDdmw71rH865: "Approved Revision" },
  rates: { fldGGcvxjBVyJyunK: "Season", fldXs26HOWuPXJ2Fz: "Stay Start", fldEhCN4nLoa4bxZr: "Stay End", fldsX0xyR1BGwGJyT: "Base Occupancy", fldyhI3g4yLgjh6Pe: "Nightly Gross", fldw9C20nxPu3fRcA: "Active", fldffowfs9OCTotOV: "Rate Card", fldZrQVT0Fn1GzzJm: "Room Type", fld93xGvzmubO4l3X: "Rate Plan" },
  taxes: { fldGIsHS0oY88lrBV: "Name", fldS1oi2glLOU1yHx: "Kind", fldIL4l0wwxogLqSv: "Basis", fld9u1tRVDfKR1aUr: "Percent", fldbTseNAexvOAGWG: "Included in Rate", fld4eJIhabXmbdnIL: "Jurisdiction", fld49yAamhgq107Oi: "Rate Card" },
};
const conv = (t: string) => (RAW[t] ?? []).map((r) => ({ id: r.id, fields: Object.fromEntries(Object.entries(r.cellValuesByFieldId).map(([k, v]) => {
  const name = NAME[t][k] ?? k;
  if (Array.isArray(v)) return [name, (v as { id: string }[]).map((x) => x.id)];
  if (v && typeof v === "object" && "name" in (v as object)) return [name, (v as { name: string }).name];
  return [name, v];
})) }));
const base = { properties: conv("properties"), roomTypes: conv("roomTypes"), ratePlans: conv("ratePlans"), cards: conv("cards"), rates: conv("rates"), taxes: conv("taxes"), promotions: [], restrictions: [], terms: [] };
const plan = buildPlan(base, { allowSample: false, knownLedgerIds: new Set(["STY-2026-290658"]) });

const c = plan.cards[0];
const card: RateCard = {
  versionId: `lion-sands:${c.version_label}:rev${c.source_revision}`, propertySlug: "lion-sands", currency: c.currency, status: c.status,
  rules: plan.rules.map((r) => ({ id: r.airtable_record_id, season: r.season, roomTypeId: r.room_type_at, ratePlanId: r.rate_plan_at, stayStart: r.stay_start, stayEnd: r.stay_end, bookingStart: r.booking_start, bookingEnd: r.booking_end, baseOccupancy: r.base_occupancy, amountMinor: r.amount_minor, extraAdultMinor: r.extra_adult_minor, childBands: r.child_bands, minNights: r.min_nights, maxNights: r.max_nights, daysOfWeek: r.days_of_week, priority: r.priority })),
  restrictions: [], promotions: [],
  taxes: plan.taxes.map((t) => ({ id: t.airtable_record_id, name: t.name, kind: t.kind, basis: t.charge_basis as "percent_of_room", percentBp: t.percentage_bp, amountMinor: t.amount_minor, included: t.included_in_display_price, minAge: t.min_age })),
  paymentTerms: c.payment_terms, cancellation: c.cancellation,
};
const rooms: Room[] = plan.roomTypes.map((r) => ({ id: r.airtable_record_id, name: r.name, maxAdults: r.max_adults, maxChildren: r.max_children, maxOccupancy: r.max_occupancy }));
const planFor = (roomId: string) => plan.ratePlans.find((p) => p.room_type_at === roomId)!.airtable_record_id;
const STAY = { arrival: "2027-06-10", departure: "2027-06-13", bookingDate: "2026-11-01", childAges: [] as number[] };

// Expected per-night gross (USD) from the published card, revision 2.
const NIGHTLY: Record<string, number> = {
  "Ivory Lodge · Ivory Suite": 6840, "River Lodge · Luxury Room": 3886, "River Lodge · Superior Luxury Room": 4274, "River Lodge · Luxury River Suite": 4996,
  "River Lodge · Family River Suite": 5996, "Narina Lodge · Narina Suite": 4460, "Tinga Lodge · Tinga Suite": 5848, "Fish Eagle Residence · The Residence, exclusive use": 11845,
};

test("the Lion Sands card passes the sync's validation with a VAT-included tax", () => {
  assert.deepEqual(plan.refused, []);
  assert.equal(c.status, "published"); assert.equal(c.source_revision, 2); assert.equal(c.approved_revision, 2);
  assert.equal(plan.rules.length, 8); assert.equal(plan.taxes.length, 1); assert.equal(plan.taxes[0].included_in_display_price, true);
});

export const EXAMPLES: { unit: string; nightly: number; roomNights: number; vatIncluded: number; floridaTax: number; total: number; deposit: number; balance: number; balanceDue: string | null }[] = [];

test("every unit prices 3 nights in June 2027: nights + 7% Florida tax = total, 30% deposit, balance 60 days out, VAT shown not added", () => {
  for (const room of rooms) {
    const adults = room.maxOccupancy >= 6 ? 6 : 2;
    const q = quote(card, room, { roomTypeId: room.id, ratePlanId: planFor(room.id), adults, ...STAY });
    assert.ok("nights" in q, `${room.name}: ${"message" in q ? q.message : "no quote"}`);
    if (!("nights" in q)) continue;
    const nightly = NIGHTLY[room.name]; assert.ok(nightly, `unexpected unit ${room.name}`);
    const roomNights = nightly * 3 * 100;
    assert.equal(q.nights.length, 3);
    assert.equal(q.roomSubtotalMinor, roomNights, room.name);
    assert.equal(q.discountsMinor, 0);
    const vat = q.charges.find((x) => x.name.startsWith("VAT"))!;
    assert.equal(vat.included, true, "VAT is in the rate");
    const added = q.charges.filter((x) => !x.included && x.kind !== "house_tax").reduce((s, x) => s + x.amountMinor, 0);
    assert.equal(added, 0, "nothing else is added for Lion Sands");
    assert.equal(q.floridaTaxMinor, Math.floor((roomNights * 700 + 5000) / 10_000));
    assert.equal(q.grandTotalMinor, roomNights + q.floridaTaxMinor);
    assert.equal(q.depositDueMinor, Math.floor((q.grandTotalMinor * 3000 + 5000) / 10_000));
    assert.equal(q.balanceMinor, q.grandTotalMinor - q.depositDueMinor);
    assert.equal(q.balanceDueDate, "2027-04-11");
    EXAMPLES.push({ unit: room.name, nightly, roomNights: roomNights / 100, vatIncluded: vat.amountMinor / 100, floridaTax: q.floridaTaxMinor / 100, total: q.grandTotalMinor / 100, deposit: q.depositDueMinor / 100, balance: q.balanceMinor / 100, balanceDue: q.balanceDueDate });
  }
  assert.equal(EXAMPLES.length, 8);
  if (process.env.PRINT_EXAMPLES) console.log(JSON.stringify(EXAMPLES, null, 1));
});

test("the whole residence refuses a party above its limit, and a stay before the card starts is quoted by the house", () => {
  const fe = rooms.find((r) => r.maxOccupancy === 6)!;
  const over = quote(card, fe, { roomTypeId: fe.id, ratePlanId: planFor(fe.id), adults: 7, ...STAY });
  assert.ok("code" in over && !("nights" in over));
  const early = quote(card, rooms[0], { roomTypeId: rooms[0].id, ratePlanId: planFor(rooms[0].id), adults: 2, ...STAY, arrival: "2026-12-28", departure: "2026-12-31" });
  assert.ok("code" in early && !("nights" in early));
});
