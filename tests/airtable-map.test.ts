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
  assert.match(buildPlan(b, { allowSample: false, knownLedgerIds: KNOWN }).refused[0].reasons.join(), /re-approve/);
  b.cards[0].fields["Approved Revision"] = 1;
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

// ---- Independent review findings (27 Oct 2026)

const refusedFor = (b: Base) => buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).refused.flatMap((r) => r.reasons).join(" | ");

test("R2: percent offers are whole numbers 1–90; 150% or 0.1 are refused", () => {
  for (const v of [150, 0.1, 95]) {
    const b = clone();
    b.promotions[0].fields.Type = "Percent off"; b.promotions[0].fields.Value = v;
    assert.match(refusedFor(b), /whole number 1–90/, String(v));
  }
  const ok = clone();
  ok.promotions[0].fields.Type = "Percent off"; ok.promotions[0].fields.Value = 10;
  assert.equal(buildPlan(ok, { allowSample: true, knownLedgerIds: KNOWN }).promotions[0].discount_value, 1000);
  const n1 = clone(); n1.promotions[0].fields.Value = 1;
  assert.match(refusedFor(n1), /N between 2 and 30/);
});

test("R3: every database limit is checked before anything is written", () => {
  const cases: [string, (b: Base) => void, RegExp][] = [
    ["min nights 0", (b) => { b.rates[0].fields["Min Nights"] = 0; }, /min nights/],
    ["tax 200%", (b) => { b.taxes[1].fields.Percent = 2; }, /0–100%/],
    ["base occupancy 25", (b) => { b.rates[0].fields["Base Occupancy"] = 25; }, /base occupancy/],
    ["long label", (b) => { b.cards[0].fields.Card = "X".repeat(61); }, /60 characters/],
    ["Approved At TBD", (b) => { b.cards[0].fields["Approved At"] = "TBD"; }, /isn't a date/],
    ["duplicate code", (b) => { b.promotions.push({ id: "recDUP", fields: { ...b.promotions[0].fields } }); }, /appears twice/],
    ["max < min", (b) => { b.rates[0].fields["Max Nights"] = 1; }, /max ≥ min/],
    ["negative extra adult", (b) => { b.rates[0].fields["Extra Adult"] = -1; }, /extra adult/],
    ["min-stay without minimum", (b) => { b.restrictions.push({ id: "recR1", fields: { Name: "x", Type: "Min stay", Start: "2027-02-01", End: "2027-02-10", "Rate Card": ["recdv4NjxpNApVooT"] } }); }, /needs a minimum/],
  ];
  for (const [name, mutate, re] of cases) { const b = clone(); mutate(b); assert.match(refusedFor(b), re, name); }
});

test("R4: approval is tied to a revision and to the card's content", () => {
  const a = buildPlan(SAMPLE_BASE, { allowSample: true, knownLedgerIds: KNOWN }).cards[0].content_hash;
  const b2 = clone(); b2.rates[1].fields["Nightly Gross"] = 851;
  const b = buildPlan(b2, { allowSample: true, knownLedgerIds: KNOWN }).cards[0].content_hash;
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.notEqual(a, b); // any priced change → new fingerprint → DB refuses it under the old revision
  const c2 = clone(); c2.cards[0].fields["Approved By"] = { email: "x@y.z" };
  assert.equal(buildPlan(c2, { allowSample: true, knownLedgerIds: KNOWN }).cards[0].content_hash, a); // approval fields don't change it
});

test("R5: an offer limited to plans must name plans at this property", () => {
  const b = clone(); b.promotions[0].fields["Eligible Plans"] = ["recMISSING"];
  assert.match(refusedFor(b), /eligible plan isn't a plan at this property/);
});

test("R10: bad time zones and foreign restriction rooms are refused, not guessed", () => {
  const b = clone(); b.properties[0].fields["Time Zone"] = "Africa/Joburg";
  const p = buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN });
  assert.match(p.warnings.join(), /isn't recognised/);
  assert.equal(p.cards.length, 0);
  const r = clone(); r.restrictions.push({ id: "recR2", fields: { Name: "x", Type: "Closed", Start: "2027-02-01", End: "2027-02-02", "Room Type": ["recNOPE"], "Rate Card": ["recdv4NjxpNApVooT"] } });
  assert.match(refusedFor(r), /room isn't at this property/);
});

test("each partner carries a stay type and a rate source (owner request, 27 Oct)", () => {
  const b = clone();
  assert.equal(buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).properties[0].rate_source, "rate_card");
  assert.equal(buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).properties[0].stay_type, null);
  b.properties[0].fields["Stay Type"] = "Family Residence";
  b.properties[0].fields["Rate Source"] = "Live API";
  const p = buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).properties[0];
  assert.equal(p.stay_type, "family_residence");
  assert.equal(p.rate_source, "live_api");
  b.properties[0].fields["Stay Type"] = "Spaceship";
  assert.equal(buildPlan(b, { allowSample: true, knownLedgerIds: KNOWN }).properties[0].stay_type, null);
});
