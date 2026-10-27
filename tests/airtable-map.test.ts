// Run: node --experimental-strip-types --test tests/airtable-map.test.ts
// Booking Live Phase 2 — Airtable → Supabase validation and mapping (spec §6, §16 case 21).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPlan, parseTiers, toMinor, toBp, currencyDigits, type Base } from "../lib/booking-live/rates/airtable-map.ts";
import { SAMPLE_BASE } from "./fixtures/airtable-sample.ts";

const KNOWN = new Set(["STY-2026-000148"]);
const clone = (): Base => JSON.parse(JSON.stringify(SAMPLE_BASE));

test("the sample card maps cleanly on Preview", () => {
  const p = buildPlan(SAMPLE_BASE, { allowSample: true, knownLedgerIds: KNOWN });
  assert.deepEqual(p.refused, []);
  assert.equal(p.cards.length, 1);
  assert.equal(p.cards[0].status, "published");
  assert.deepEqual(p.cards[0].payment_terms, { depositPercentBp: 3000, balanceDueDaysBeforeArrival: 60 });
  assert.deepEqual(p.cards[0].cancellation.tiers, [{ daysBeforeArrival: 60, penaltyBp: 3000 }, { daysBeforeArrival: 30, penaltyBp: 10000 }]);
  assert.equal(p.rules.length, 4);
  const summer = p.rules.find((r) => r.season === "Summer")!;
  assert.equal(summer.amount_minor, 120000);
  assert.deepEqual(summer.child_bands, [{ minAge: 0, maxAge: 3, amountMinor: 0 }, { minAge: 4, maxAge: 11, amountMinor: 15000 }, { minAge: 12, maxAge: 17, amountMinor: 25000 }]);
  assert.equal(p.taxes.find((t) => t.name.startsWith("VAT"))!.percentage_bp, 1500);
  assert.equal(p.promotions[0].discount_value, 4);
  assert.equal(p.terms[0].commission_bp, 1500);
  assert.equal(p.cards[0].timezone, "Africa/Johannesburg");
});

test("§16.21 sample cards never sync to Production", () => {
  const p = buildPlan(SAMPLE_BASE, { allowSample: false, knownLedgerIds: KNOWN });
  assert.equal(p.cards.length, 0);
  assert.equal(p.rules.length, 0);
  assert.match(p.refused[0].reasons.join(), /Preview only/);
});

test("a real card needs an explicit approver before it publishes", () => {
  const b = clone();
  b.cards[0].fields["Sample Data"] = false;
  assert.match(buildPlan(b, { allowSample: false, knownLedgerIds: KNOWN }).refused[0].reasons.join(), /approver/);
  b.cards[0].fields["Approved By"] = { id: "usr1", email: "james@jameswildco.com", name: "James Papagno" };
  const ok = buildPlan(b, { allowSample: false, knownLedgerIds: KNOWN });
  assert.deepEqual(ok.refused, []);
  assert.equal(ok.cards[0].approved_by, "james@jameswildco.com");
});

test("bad rows refuse the whole card (website keeps what it had)", () => {
  const b = clone();
  b.rates[0].fields["Stay Start"] = "2026-12-01"; // before the card's effective dates
  const p = buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN });
  assert.equal(p.cards.length, 0);
  assert.equal(p.rules.length, 0);
  assert.match(p.refused[0].reasons.join(), /outside the card's effective dates/);
  const c = clone();
  c.rates[1].fields["Nightly Gross"] = -5;
  assert.match(buildPlan(c, { allowSample: true, knownLedgerIds: KNOWN }).refused[0].reasons.join(), /nightly gross/);
  const d = clone();
  d.cards[0].fields["Cancellation Tiers"] = "sixty days";
  assert.match(buildPlan(d, { allowSample: true, knownLedgerIds: KNOWN }).refused[0].reasons.join(), /cancellation tiers/);
});

test("a rate whose room belongs to another property is refused", () => {
  const b = clone();
  b.properties.push({ id: "recOTHER", fields: { "Ledger ID": "STY-2026-000171", "Time Zone": "Africa/Johannesburg" } });
  b.roomTypes.push({ id: "recROOM2", fields: { "Room Code": "other", "Max Adults": 2, "Max Occupancy": 2, Active: true, Property: ["recOTHER"] } });
  b.rates[0].fields["Room Type"] = ["recROOM2"];
  const p = buildPlan(b, { allowSample: true, knownLedgerIds: new Set([...KNOWN, "STY-2026-000171"]) });
  assert.match(p.refused[0].reasons.join(), /room isn't at this property/);
});

test("§16.21 overlapping published cards for one property are both refused", () => {
  const b = clone();
  b.cards.push({ id: "recCARD2", fields: { ...b.cards[0].fields, Card: "SAMPLE-2027-V2", "Effective From": "2027-06-01", "Effective To": "2028-05-31" } });
  b.rates.push({ id: "recRATE2", fields: { ...b.rates[1].fields, "Stay Start": "2027-06-01", "Stay End": "2027-08-31", "Rate Card": ["recCARD2"] } });
  const p = buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN });
  assert.equal(p.cards.length, 0);
  assert.equal(p.refused.filter((r) => /overlaps/.test(r.reasons.join())).length, 2);
});

test("drafts sync as drafts (hidden from the site), and unknown stays are skipped", () => {
  const b = clone();
  b.cards[0].fields.Status = "Submitted";
  assert.equal(buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).cards[0].status, "draft");
  const p = buildPlan(SAMPLE_BASE, { allowSample: true, knownLedgerIds: new Set() });
  assert.equal(p.properties.length, 0);
  assert.match(p.warnings.join(), /not on the website/);
});

test("money and percent conversions", () => {
  assert.equal(toMinor(1234.56, 2), 123456);
  assert.equal(toMinor(0.1 + 0.2, 2), 30);
  assert.equal(currencyDigits("JPY"), 0);
  assert.equal(toMinor(80000, currencyDigits("JPY")), 80000);
  assert.equal(toBp(0.075), 750);
  assert.deepEqual(parseTiers("45:50%, 14:100"), [{ daysBeforeArrival: 45, penaltyBp: 5000 }, { daysBeforeArrival: 14, penaltyBp: 10000 }]);
  assert.equal(parseTiers("10:150"), null);
});
