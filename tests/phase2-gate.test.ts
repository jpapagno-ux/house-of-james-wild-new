// Run: node --experimental-strip-types --test tests/phase2-gate.test.ts
// Phase 2 acceptance (spec §15): "A valid manual rate card can produce a
// traceable nightly quote without claiming real-time availability."
// Airtable sample card → buildPlan (the sync's mapper) → engine card (as
// load.ts shapes it) → quote. Figures are the ILLUSTRATIVE sample card.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan } from "../lib/booking-live/rates/airtable-map.ts";
import { quote, type RateCard, type Room } from "../lib/booking-live/pricing/engine.ts";
import { SAMPLE_BASE } from "./fixtures/airtable-sample.ts";

const plan = buildPlan(SAMPLE_BASE, { allowSample: true, knownLedgerIds: new Set(["STY-2026-000148"]) });
const c = plan.cards[0];
const card: RateCard = {
  versionId: `leeu-estates:${c.version_label}:rev${c.source_revision}`, propertySlug: "leeu-estates", currency: c.currency, status: c.status,
  rules: plan.rules.map((r) => ({ id: r.airtable_record_id, season: r.season, roomTypeId: r.room_type_at, ratePlanId: r.rate_plan_at, stayStart: r.stay_start, stayEnd: r.stay_end, bookingStart: r.booking_start, bookingEnd: r.booking_end, baseOccupancy: r.base_occupancy, amountMinor: r.amount_minor, extraAdultMinor: r.extra_adult_minor, childBands: r.child_bands, minNights: r.min_nights, maxNights: r.max_nights, daysOfWeek: r.days_of_week, priority: r.priority })),
  restrictions: [],
  promotions: plan.promotions.map((p) => ({ code: p.promotion_code, label: p.label, type: p.discount_type as "nth_night_free", value: p.discount_value, bookingStart: p.booking_start, bookingEnd: p.booking_end, stayStart: p.stay_start, stayEnd: p.stay_end, minNights: p.min_nights, ratePlanIds: null, stacking: p.stacking_policy as "exclusive", approved: p.approval_status === "approved" })),
  taxes: plan.taxes.map((t) => ({ id: t.airtable_record_id, name: t.name, kind: t.kind, basis: t.charge_basis as "percent_of_room", percentBp: t.percentage_bp, amountMinor: t.amount_minor, included: t.included_in_display_price, minAge: t.min_age })),
  paymentTerms: c.payment_terms, cancellation: c.cancellation,
};
const rt = plan.roomTypes[0];
const ROOM: Room = { id: rt.airtable_record_id, name: rt.name, maxAdults: rt.max_adults, maxChildren: rt.max_children, maxOccupancy: rt.max_occupancy };
const base = { roomTypeId: rt.airtable_record_id, ratePlanId: plan.ratePlans[0].airtable_record_id, adults: 2, childAges: [] as number[], bookingDate: "2026-10-27" };

test("GATE: the sample card prices 4 winter nights at Leeu, traceably, without claiming availability", () => {
  const q = quote(card, ROOM, { ...base, arrival: "2027-06-10", departure: "2027-06-14" });
  assert.ok(q.ok);
  if (!q.ok) return;
  // Night by night (hand-checked)
  assert.deepEqual(q.nights.map((n) => [n.date, n.season, n.totalMinor]), [["2027-06-10", "Winter", 85000], ["2027-06-11", "Winter", 85000], ["2027-06-12", "Winter", 85000], ["2027-06-13", "Winter", 85000]]);
  assert.equal(q.roomSubtotalMinor, 340000);   // 4 × US$850.00
  assert.equal(q.discountsMinor, 85000);       // Worth Another Night: stay 4, pay 3
  const levy = q.charges.find((x) => x.name.startsWith("Tourism"))!;
  const vat = q.charges.find((x) => x.name.startsWith("VAT"))!;
  assert.equal(levy.amountMinor, 2550);        // 1% of US$2,550.00, added
  assert.equal(vat.included, true);            // 15% VAT already in the rate: shown, not added
  assert.equal(vat.amountMinor, 255000 - Math.round(255000 / 1.15));
  assert.equal(q.floridaTaxMinor, 18029);      // 7% of US$2,575.50 = 180.285 → US$180.29
  assert.equal(q.grandTotalMinor, 275579);     // US$2,755.79
  assert.equal(q.depositDueMinor, 82674);      // 30%
  assert.equal(q.balanceMinor, 192905);
  assert.equal(q.balanceDueDate, "2027-04-11");// 60 days before arrival
  // Traceable and honest
  assert.equal(q.availability, "on_request");
  assert.equal(q.source, "contracted_card");
  assert.match(q.revision, /^leeu-estates:SAMPLE-2027-V1:rev1#[0-9a-f]{8}$/);
  assert.deepEqual(q.cancellation.deadlines.map((d) => d.from), ["2027-04-11", "2027-05-11"]);
});

test("GATE: the Festive 5-night minimum and the card's end date are enforced", () => {
  const short = quote(card, ROOM, { ...base, arrival: "2027-12-22", departure: "2027-12-25" });
  assert.equal(short.ok, false);
  const past = quote(card, ROOM, { ...base, arrival: "2027-12-29", departure: "2028-01-03" });
  assert.equal(past.ok, false);
  if (!past.ok) assert.equal(past.code, "no_rate_for_night");
});
