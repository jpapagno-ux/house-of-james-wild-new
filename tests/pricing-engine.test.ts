// Run: node --experimental-strip-types --test tests/pricing-engine.test.ts
// Booking Live Phase 2 — rate-card pricing engine (spec §6 and §16 cases 4–8, 18).
// All amounts are ILLUSTRATIVE sample figures, not contracted rates.
import { test } from "node:test";
import assert from "node:assert/strict";
import { quote, localToday, addDays, money, pct, type RateCard, type Room, type QuoteRequest, type Quote } from "../lib/booking-live/pricing/engine.ts";

const ROOM: Room = { id: "river-suite", name: "River Suite", maxAdults: 3, maxChildren: 2, maxOccupancy: 4 };

const card = (over: Partial<RateCard> = {}): RateCard => ({
  versionId: "sample-lodge:2027-V1:rev1",
  propertySlug: "sample-lodge",
  currency: "USD",
  status: "published",
  rules: [
    { id: "green", season: "Green", roomTypeId: "river-suite", ratePlanId: "bb", stayStart: "2026-11-01", stayEnd: "2026-12-19", baseOccupancy: 2, amountMinor: 50000, extraAdultMinor: 10000, childBands: [{ minAge: 0, maxAge: 3, amountMinor: 0 }, { minAge: 4, maxAge: 11, amountMinor: 5000 }, { minAge: 12, maxAge: 17, amountMinor: 8000 }], minNights: 2 },
    { id: "festive", season: "Festive", roomTypeId: "river-suite", ratePlanId: "bb", stayStart: "2026-12-20", stayEnd: "2027-01-05", baseOccupancy: 2, amountMinor: 90000, extraAdultMinor: 15000, childBands: [{ minAge: 0, maxAge: 17, amountMinor: 10000 }], minNights: 5, priority: 1 },
    { id: "high", season: "High", roomTypeId: "river-suite", ratePlanId: "bb", stayStart: "2027-01-06", stayEnd: "2027-03-31", baseOccupancy: 2, amountMinor: 67500, extraAdultMinor: 10000, childBands: [{ minAge: 0, maxAge: 17, amountMinor: 6000 }], minNights: 3 },
  ],
  restrictions: [],
  promotions: [],
  taxes: [],
  paymentTerms: { depositPercentBp: 3000, balanceDueDaysBeforeArrival: 60 },
  cancellation: { summary: "Full refund until 60 days before arrival.", tiers: [{ daysBeforeArrival: 60, penaltyBp: 3000 }, { daysBeforeArrival: 30, penaltyBp: 10_000 }] },
  ...over,
});
const req = (over: Partial<QuoteRequest> = {}): QuoteRequest => ({ roomTypeId: "river-suite", ratePlanId: "bb", arrival: "2027-02-10", departure: "2027-02-13", adults: 2, childAges: [], bookingDate: "2026-10-27", ...over });
const ok = (r: ReturnType<typeof quote>): Quote => { assert.ok(r.ok, r.ok ? "" : `${r.code}: ${r.message}`); return r as Quote; };
const err = (r: ReturnType<typeof quote>) => { assert.equal(r.ok, false); return r as { code: string; date?: string }; };

test("a simple stay: three High nights, 7% Florida tax on top, 30% deposit", () => {
  const q = ok(quote(card(), ROOM, req()));
  assert.deepEqual(q.nights.map((n) => [n.date, n.season, n.totalMinor]), [["2027-02-10", "High", 67500], ["2027-02-11", "High", 67500], ["2027-02-12", "High", 67500]]);
  assert.equal(q.roomSubtotalMinor, 202500);
  assert.equal(q.floridaTaxMinor, 14175);
  assert.equal(q.grandTotalMinor, 216675);
  assert.equal(q.depositDueMinor, 65003); // 30% rounded half up
  assert.equal(q.balanceMinor, 151672);
  assert.equal(q.balanceDueDate, "2026-12-12");
  assert.equal(q.availability, "on_request");
  assert.equal(q.source, "contracted_card");
});

test("§16.4 season changes exactly at midnight and across the year boundary", () => {
  const q = ok(quote(card(), ROOM, req({ arrival: "2026-12-17", departure: "2027-01-08" })));
  const at = (d: string) => q.nights.find((n) => n.date === d)!.season;
  assert.equal(at("2026-12-19"), "Green");
  assert.equal(at("2026-12-20"), "Festive");
  assert.equal(at("2026-12-31"), "Festive");
  assert.equal(at("2027-01-01"), "Festive");
  assert.equal(at("2027-01-05"), "Festive");
  assert.equal(at("2027-01-06"), "High");
  assert.equal(q.nights.length, 22);
  assert.equal(q.nights.at(-1)!.date, "2027-01-07"); // departure morning is not a night
  assert.equal(q.roomSubtotalMinor, 3 * 50000 + 17 * 90000 + 2 * 67500);
});

test("§16.5 occupancy: extra adult, child age bands, infants free, limits", () => {
  const q = ok(quote(card(), ROOM, req({ arrival: "2026-11-10", departure: "2026-11-12", adults: 3, childAges: [] })));
  assert.equal(q.nights[0].extraAdultsMinor, 10000);
  const kids = ok(quote(card(), ROOM, req({ arrival: "2026-11-10", departure: "2026-11-12", adults: 2, childAges: [2, 8] })));
  assert.equal(kids.nights[0].childrenMinor, 0 + 5000);
  assert.equal(err(quote(card(), ROOM, req({ adults: 4 }))).code, "occupancy_exceeded");
  assert.equal(err(quote(card(), ROOM, req({ adults: 3, childAges: [5, 6] }))).code, "occupancy_exceeded");
  const noBand = card({ rules: [{ ...card().rules[2], childBands: [{ minAge: 0, maxAge: 11, amountMinor: 0 }] }] });
  assert.equal(err(quote(noBand, ROOM, req({ childAges: [14] }))).code, "child_age_unpriced");
});

test("§16.6 minimum stay (strictest season touched), blackout, arrival and departure rules", () => {
  assert.equal(err(quote(card(), ROOM, req({ arrival: "2027-02-10", departure: "2027-02-12" }))).code, "min_stay");
  // Touching one Festive night means the Festive 5-night minimum applies.
  assert.equal(err(quote(card(), ROOM, req({ arrival: "2026-12-17", departure: "2026-12-21" }))).code, "min_stay");
  const closed = card({ restrictions: [{ id: "x", start: "2027-02-11", end: "2027-02-11", type: "closed" }] });
  const c = err(quote(closed, ROOM, req()));
  assert.equal(c.code, "closed");
  assert.equal(c.date, "2027-02-11");
  const cta = card({ restrictions: [{ id: "y", start: "2027-02-10", end: "2027-02-10", type: "close_to_arrival" }] });
  assert.equal(err(quote(cta, ROOM, req())).code, "closed_to_arrival");
  const ctd = card({ restrictions: [{ id: "z", start: "2027-02-13", end: "2027-02-13", type: "close_to_departure" }] });
  assert.equal(err(quote(ctd, ROOM, req())).code, "closed_to_departure");
  const minStay = card({ restrictions: [{ id: "m", start: "2027-02-01", end: "2027-02-28", type: "min_stay", minimumStay: 4 }] });
  assert.equal(err(quote(minStay, ROOM, req())).code, "min_stay");
  // A restriction for another room doesn't apply.
  const other = card({ restrictions: [{ id: "o", roomTypeId: "garden", start: "2027-02-11", end: "2027-02-11", type: "closed" }] });
  ok(quote(other, ROOM, req()));
});

test("no rate for a night, booking window, unpublished card, past arrival", () => {
  const e = err(quote(card(), ROOM, req({ arrival: "2027-03-30", departure: "2027-04-02" })));
  assert.equal(e.code, "no_rate_for_night");
  assert.equal(e.date, "2027-04-01");
  const early = card({ rules: card().rules.map((r) => ({ ...r, bookingStart: "2026-11-01" })) });
  assert.equal(err(quote(early, ROOM, req())).code, "booking_window");
  assert.equal(err(quote(card({ status: "approved" }), ROOM, req())).code, "card_not_published");
  assert.equal(err(quote(card(), ROOM, req({ bookingDate: "2027-02-11" }))).code, "past_arrival");
  assert.equal(err(quote(card(), ROOM, req({ arrival: "2027-02-30" }))).code, "invalid_dates");
});

test("§16.7 promotions: expiry, eligibility, best exclusive vs stackables, never below zero", () => {
  const promos = card({ promotions: [
    { code: "WAN", label: "Worth Another Night", type: "nth_night_free", value: 4, stacking: "exclusive", approved: true, minNights: 4 },
    { code: "EARLY", label: "Book Early 10%", type: "percent", value: 1000, bookingEnd: "2026-11-30", stacking: "stackable", approved: true },
    { code: "LOYAL", label: "Returning guest 5%", type: "percent", value: 500, stacking: "stackable", approved: true },
    { code: "DRAFT", label: "Unapproved", type: "percent", value: 9000, stacking: "exclusive", approved: false },
  ] });
  // 3 nights: WAN needs 4 → stackables 10% + 5% = 15% of 202,500
  const q3 = ok(quote(promos, ROOM, req()));
  assert.deepEqual(q3.discounts.map((d) => d.code), ["EARLY", "LOYAL"]);
  assert.equal(q3.discountsMinor, 20250 + 10125);
  // 4 nights: one free night (67,500) beats 15% (40,500)
  const q4 = ok(quote(promos, ROOM, req({ departure: "2027-02-14" })));
  assert.deepEqual(q4.discounts.map((d) => d.code), ["WAN"]);
  assert.equal(q4.discountsMinor, 67500);
  // After EARLY expires only LOYAL stacks
  const late = ok(quote(promos, ROOM, req({ bookingDate: "2026-12-01" })));
  assert.deepEqual(late.discounts.map((d) => d.code), ["LOYAL"]);
  // An unapproved or out-of-window code is refused when asked for by name
  assert.equal(err(quote(promos, ROOM, req({ promoCode: "DRAFT" }))).code, "promo_invalid");
  // Fixed-per-night larger than the room can never go negative
  const huge = card({ promotions: [{ code: "BIG", label: "Big", type: "fixed_per_night", value: 999999, stacking: "exclusive", approved: true }] });
  const z = ok(quote(huge, ROOM, req()));
  assert.equal(z.grandTotalMinor, 0);
});

test("taxes: included ones shown not added; excluded added; Florida 7% on the lot", () => {
  const taxed = card({ taxes: [
    { id: "vat", name: "VAT 15%", kind: "tax", basis: "percent_of_room", percentBp: 1500, included: true },
    { id: "levy", name: "Tourism levy 1%", kind: "tax", basis: "percent_of_room", percentBp: 100, included: false },
    { id: "cons", name: "Conservation fee", kind: "fee", basis: "per_person_per_night", amountMinor: 2500, included: false, minAge: 12 },
  ] });
  const q = ok(quote(taxed, ROOM, req({ childAges: [8] })));
  const line = (id: string) => q.charges.find((c) => c.id === id)!;
  const room = 3 * (67500 + 6000);
  assert.equal(q.roomSubtotalMinor, room);
  assert.equal(line("vat").included, true);
  assert.equal(line("vat").amountMinor, room - Math.round(room / 1.15)); // backed out for display
  assert.equal(line("levy").amountMinor, pct(room, 100));
  assert.equal(line("cons").amountMinor, 2500 * 2 * 3); // the 8-year-old doesn't pay
  assert.equal(q.taxesMinor, pct(room, 100) + 15000);
  assert.equal(q.floridaTaxMinor, pct(room + q.taxesMinor, 700));
  assert.equal(q.grandTotalMinor, room + q.taxesMinor + q.floridaTaxMinor);
});

test("payment: inside the balance window everything is due now; fixed deposits", () => {
  const soon = ok(quote(card(), ROOM, req({ bookingDate: "2027-01-20" })));
  assert.equal(soon.depositDueMinor, soon.grandTotalMinor);
  assert.equal(soon.balanceDueDate, null);
  const fixed = ok(quote(card({ paymentTerms: { depositFixedMinor: 100000, balanceDueDaysBeforeArrival: 45 } }), ROOM, req()));
  assert.equal(fixed.depositDueMinor, 100000);
  assert.equal(fixed.depositDueMinor + fixed.balanceMinor, fixed.grandTotalMinor);
});

test("cancellation deadlines are dated from arrival", () => {
  const q = ok(quote(card(), ROOM, req()));
  assert.deepEqual(q.cancellation.deadlines.map((d) => [d.from, d.penaltyBp]), [["2026-12-12", 3000], ["2027-01-11", 10000]]);
});

test("§16.8 a rate-card change after the quote changes the revision", () => {
  const a = ok(quote(card(), ROOM, req()));
  const b = ok(quote(card(), ROOM, req()));
  assert.equal(a.revision, b.revision); // deterministic
  const changed = card({ rules: card().rules.map((r) => (r.id === "high" ? { ...r, amountMinor: 70000 } : r)) });
  const c = ok(quote(changed, ROOM, req()));
  assert.notEqual(c.revision, a.revision);
  assert.ok(c.grandTotalMinor > a.grandTotalMinor);
  assert.notEqual(ok(quote(card(), ROOM, req({ adults: 3 }))).revision, a.revision);
});

test("overlapping rules: higher priority wins, then the narrower date range", () => {
  const promo = { id: "valentine", season: "Valentine", roomTypeId: "river-suite", ratePlanId: "bb", stayStart: "2027-02-12", stayEnd: "2027-02-14", baseOccupancy: 2, amountMinor: 80000, extraAdultMinor: 10000, priority: 0 };
  const q = ok(quote(card({ rules: [...card().rules, promo] }), ROOM, req()));
  assert.deepEqual(q.nights.map((n) => n.season), ["High", "High", "Valentine"]);
  const weekend = { ...promo, id: "weekend", season: "Weekend", stayStart: "2027-01-06", stayEnd: "2027-03-31", daysOfWeek: [5, 6], priority: 2, amountMinor: 72000 };
  const w = ok(quote(card({ rules: [...card().rules, weekend] }), ROOM, req({ arrival: "2027-02-11", departure: "2027-02-14" })));
  assert.deepEqual(w.nights.map((n) => [n.date, n.season]), [["2027-02-11", "High"], ["2027-02-12", "Weekend"], ["2027-02-13", "Weekend"]]);
});

test("§16.18 zero-decimal currencies and local dates", () => {
  const jpy = ok(quote(card({ currency: "JPY", rules: card().rules.map((r) => ({ ...r, amountMinor: 80000 })) }), ROOM, req()));
  assert.equal(money(jpy.grandTotalMinor, "JPY").replace(/\s/g, ""), "¥256,800");
  assert.equal(money(216675, "USD"), "US$2,166.75");
  assert.equal(localToday("Africa/Johannesburg", new Date("2026-12-31T22:30:00Z")), "2027-01-01");
  assert.equal(localToday("America/New_York", new Date("2026-12-31T22:30:00Z")), "2026-12-31");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});
