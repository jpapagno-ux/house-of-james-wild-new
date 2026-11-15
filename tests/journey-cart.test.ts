// Journey Cart (Booking & Checkout Studio, Session 03): the cart's rules. Every figure in this file is a
// TEST FIXTURE, invented to exercise the arithmetic. None is a real rate, and none is shown on any page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NO_PRICE, cartTotals, commissionHandoff, hasCardLikeData, idempotencyKey, ledgerHandoff, lineStatuses, paymentOptions, priceNights, simulatePayment, toUsdMinor, validLead, verified, type Line, type Policy, type Price, type SeasonRule } from "../lib/checkout/journey.ts";

const price = (source: Price["source"], usdMinor: number | null): Price => ({ source, usdMinor, sourceMinor: usdMinor, sourceCurrency: usdMinor == null ? null : "USD", fx: null, basis: "fixture", provenance: "fixture", fetchedAt: null });
const line = (id: string, p: Price, kind: Line["kind"] = "stay"): Line => ({ id, kind, productKey: "fixture", ledgerId: "FIXTURE", name: "Fixture House", supplier: "Fixture Supplier", unit: "Room", unitKey: "room", start: "2027-02-01", end: "2027-02-04", adults: 2, price: p });
const none: Policy = { payNow: { supported: false, basis: "not on file" }, deposit: null, depositNote: "Deposit terms not on file.", payAtProperty: { supported: false, basis: "not stated" }, balance: "Not on file.", cancellation: "Not on file." };

test("only a live or contracted price is verified; a from fare and a missing price never are", () => {
  assert.equal(verified(price("albie_live", 100000)), true);
  assert.equal(verified(price("rate_card", 100000)), true);
  assert.equal(verified(price("published_rate", 100000)), true, "a supplier's own published rate, approved by James on 15 Nov 2026");
  assert.equal(verified(price("published_from", 100000)), false);
  assert.equal(verified(NO_PRICE("x", "y")), false);
  assert.equal(verified(price("albie_live", 0)), false);
});

test("totals keep verified, from fares and unpriced lines in three separate piles", () => {
  const t = cartTotals([line("a", price("albie_live", 250000)), line("b", price("published_from", 3799000), "voyage"), line("c", NO_PRICE("x", "y")), line("d", NO_PRICE("x", "y"), "experience")]);
  assert.deepEqual(t, { verifiedMinor: 250000, verifiedCount: 1, fromMinor: 3799000, fromCount: 1, awaitingCount: 2, abroad: [] });
  const eur: Price = { source: "published_rate", usdMinor: null, sourceMinor: 1000000, sourceCurrency: "EUR", fx: null, basis: "fixture", provenance: "fixture", fetchedAt: null };
  const t2 = cartTotals([line("e", eur), line("f", eur), line("g", price("published_rate", 500000))]);
  assert.deepEqual(t2, { verifiedMinor: 500000, verifiedCount: 1, fromMinor: 0, fromCount: 0, awaitingCount: 0, abroad: [{ currency: "EUR", minor: 2000000 }] }, "a price with no US dollar rate on file stays in its own currency, outside the US dollar total");
  assert.equal(paymentOptions(line("e", eur), none).find((o) => o.method === "pay_now")?.amountMinor, null);
});

test("ZAR converts to USD for display with the filed rate, and never without one", () => {
  const fx = { rate: 16.69, date: "2026-11-01", source: "fixture" };
  assert.equal(toUsdMinor(1669000, "ZAR", fx), 100000);
  assert.equal(toUsdMinor(1669000, "ZAR", null), null);
  assert.equal(toUsdMinor(5000, "USD", null), 5000);
});

test("a contracted card prices night by night across seasons, and refuses a gap or an oversize party", () => {
  const rules: SeasonRule[] = [
    { season: "High", roomKey: "r1", stayStart: "2027-01-01", stayEnd: "2027-01-31", baseOccupancy: 2, amountMinor: 3000000 },
    { season: "Mid", roomKey: "r1", stayStart: "2027-02-01", stayEnd: "2027-02-28", baseOccupancy: 2, amountMinor: 2000000 },
    { season: "Festive", roomKey: "r1", stayStart: "2027-01-30", stayEnd: "2027-01-30", baseOccupancy: 2, amountMinor: 4000000, priority: 5 },
  ];
  const p = priceNights(rules, "r1", "2027-01-30", "2027-02-02", 2);
  assert.equal(p?.totalMinor, 4000000 + 3000000 + 2000000);
  assert.deepEqual(p?.seasons.map((s) => [s.season, s.nights]), [["Festive", 1], ["High", 1], ["Mid", 1]]);
  assert.equal(priceNights(rules, "r1", "2027-02-27", "2027-03-02", 2), null, "a night past the card is never guessed");
  assert.equal(priceNights(rules, "r1", "2027-01-05", "2027-01-07", 3), null, "over base occupancy goes to the house");
  assert.equal(priceNights(rules, "other", "2027-01-05", "2027-01-07", 2), null);
  const longer: SeasonRule[] = [...rules, { season: "Five nights or more", roomKey: "r1", stayStart: "2027-01-01", stayEnd: "2027-01-29", baseOccupancy: 2, amountMinor: 2400000, minNights: 5, priority: 1 }];
  assert.equal(priceNights(longer, "r1", "2027-01-05", "2027-01-08", 2)?.totalMinor, 3 * 3000000, "a long-stay rate never applies to a short stay");
  assert.equal(priceNights(longer, "r1", "2027-01-05", "2027-01-10", 2)?.totalMinor, 5 * 2400000);
});

test("payment methods open only on a supplier policy on file and a verified price; advisor assisted is always open", () => {
  const live = line("a", price("albie_live", 240000));
  const closed = paymentOptions(live, none);
  assert.deepEqual(closed.filter((o) => o.available).map((o) => o.method), ["advisor_assisted"]);
  const open: Policy = { ...none, payNow: { supported: true, basis: "engine" }, deposit: { percentBp: 3000, fixedMinor: null, basis: "30% on the card" }, payAtProperty: { supported: true, basis: "supplier states it" } };
  const o = paymentOptions(live, open);
  assert.deepEqual(o.map((x) => [x.method, x.available, x.amountMinor]), [["pay_now", true, 240000], ["deposit_now", true, 72000], ["pay_at_property", true, null], ["advisor_assisted", true, null]]);
  const from = paymentOptions(line("b", price("published_from", 3799000), "voyage"), open);
  assert.equal(from.find((x) => x.method === "pay_now")?.available, false, "a from fare can never be charged");
  assert.equal(from.find((x) => x.method === "deposit_now")?.available, false);
  assert.equal(paymentOptions(line("c", NO_PRICE("x", "y")), open).find((x) => x.method === "pay_now")?.amountMinor, null);
});

test("the simulator is deterministic by idempotency key, charges only verified amounts and can decline", () => {
  const key = idempotencyKey("cart1234", "lineA", "pay_now", 240000);
  const a = simulatePayment({ idempotencyKey: key, method: "pay_now", amountMinor: 240000, currency: "USD", lineId: "lineA" });
  const b = simulatePayment({ idempotencyKey: key, method: "pay_now", amountMinor: 240000, currency: "USD", lineId: "lineA" });
  assert.deepEqual(a, b, "a repeat is the same transaction");
  assert.ok(!("error" in a) && a.status === "succeeded" && a.livemode === false && a.provider === "simulation" && a.reference.startsWith("sim_"));
  assert.notEqual(key, idempotencyKey("cart1234", "lineB", "pay_now", 240000), "each line is its own transaction");
  assert.ok("error" in simulatePayment({ idempotencyKey: key, method: "pay_now", amountMinor: null, currency: "USD", lineId: "lineA" }));
  assert.ok("error" in simulatePayment({ idempotencyKey: "nope", method: "pay_now", amountMinor: 1, currency: "USD", lineId: "x" }));
  const d = simulatePayment({ idempotencyKey: key, method: "pay_now", amountMinor: 240000, currency: "USD", lineId: "lineA", outcome: "decline" });
  assert.ok(!("error" in d) && d.status === "declined" && d.amountMinor === 0);
  const adv = simulatePayment({ idempotencyKey: idempotencyKey("cart1234", "lineA", "advisor_assisted", null), method: "advisor_assisted", amountMinor: null, currency: "USD", lineId: "lineA" });
  assert.ok(!("error" in adv) && adv.amountMinor === 0 && adv.status === "no_charge_advisor_to_follow");
});

test("anything shaped like card data is detected, and ordinary traveler details are not", () => {
  assert.equal(hasCardLikeData({ note: "4242 4242 4242 4242" }), true);
  assert.equal(hasCardLikeData({ cardNumber: "x" }), true);
  assert.equal(hasCardLikeData({ nested: [{ cvv: "123" }] }), true);
  assert.equal(hasCardLikeData({ first: "Ada", last: "Lovelace", email: "ada@example.com", phone: "+1 305 555 0100", amountMinor: 240000 }), false);
  assert.match(validLead({ first: "Ada", last: "Lovelace", email: "ada@example.com", phone: "4242424242424242", country: "" }) ?? "", /card/);
  assert.equal(validLead({ first: "Ada", last: "Lovelace", email: "ada@example.com", phone: "", country: "" }), null);
  assert.match(validLead({ first: "Ada", last: "Lovelace", email: "nope", phone: "", country: "" }) ?? "", /email/);
});

test("payment, booking request and supplier confirmation stay three separate statuses; nothing is ever confirmed", () => {
  const l = line("a", price("albie_live", 240000));
  const paid = simulatePayment({ idempotencyKey: idempotencyKey("cart1234", "a", "pay_now", 240000), method: "pay_now", amountMinor: 240000, currency: "USD", lineId: "a" });
  assert.ok(!("error" in paid));
  const s = lineStatuses(l, paid);
  assert.match(s.payment.label, /Payment received \(simulated\)/);
  assert.match(s.supplier.label, /pending/);
  assert.doesNotMatch(JSON.stringify(s).replace(/not a confirmed booking|has not confirmed/g, ""), /confirmed/i);
  assert.match(lineStatuses(l, null).payment.label, /No payment/);
});

test("the hand-off keeps the advisor on every line and passes a commissionable base, never a commission", () => {
  const lines = [line("a", price("albie_live", 240000)), line("b", price("published_from", 3799000), "voyage"), line("c", NO_PRICE("x", "y"), "experience")];
  const h = ledgerHandoff({ cartId: "cart1234", lines, lead: { first: "Ada", last: "Lovelace", email: "ada@example.com", phone: "", country: "" }, party: [{ first: "Charles", last: "Babbage" }], advisor: { slug: "fixture", ledgerId: "ADV-FIXTURE", name: "Fixture Advisor" }, externalAdvisor: " Fixture Agency ", payments: {} });
  assert.equal(h.written, false);
  assert.match(h.journey.reference, /^SIMULATION-/);
  assert.equal(h.advisor.external, "Fixture Agency");
  assert.equal(h.leadTraveler.partySize, 2);
  assert.ok(h.lines.every((x) => x.commission.advisorLedgerId === "ADV-FIXTURE" && x.availability === "on_request"));
  assert.deepEqual(h.lines.map((x) => x.commission.commissionableBaseUsdMinor), [240000, null, null]);
  assert.doesNotMatch(JSON.stringify(commissionHandoff(lines[0], "ADV-FIXTURE")), /\d+\s*%/);
});

test("the cart's logic adds no Florida sales tax and the page copy carries no em or en dash", () => {
  const src = readFileSync(new URL("../lib/checkout/journey.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /FL_TAX|0\.07|700\b/);
  for (const f of ["components/checkout/JourneyCheckout.tsx", "components/checkout/Configurators.tsx", "lib/checkout/pilot.ts", "lib/checkout/journey.ts"]) {
    assert.doesNotMatch(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), /[–—]/, f);
  }
});

test("the published seasons on file map to night ranges for every priced room, with no dash in the catalogue's sources", () => {
  const rooms = readFileSync(new URL("../lib/content/stay-rooms.ts", import.meta.url), "utf8");
  const pilot = readFileSync(new URL("../lib/checkout/pilot.ts", import.meta.url), "utf8");
  for (const [stay, keys] of [["ellerman-house", ["h26", "p27", "h27", "l27"]], ["casali-di-casole", ["ba", "ss"]]] as const) {
    const block = rooms.slice(rooms.indexOf(`"${stay}": {`));
    const windows = pilot.slice(pilot.indexOf(`"${stay}": {`, pilot.indexOf("const WINDOWS")));
    for (const k of keys) { assert.match(block, new RegExp(`key: "${k}"`), `${stay} still publishes season ${k}`); assert.match(windows.slice(0, 900), new RegExp(`\\b${k}: \\{ ranges:`), `${stay} season ${k} has night ranges`); }
  }
  assert.match(pilot, /PCS-A21-CLA-\$\{d\.slice\(2\)/);
});
