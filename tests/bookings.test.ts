import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingWords, parseBooking, quoteState, timeline } from "../lib/booking-live/bookings.ts";

// Trips shelf: the traveler's state words and the house's booking input.

const now = new Date("2026-11-01T12:00:00Z");
const base = { status: "quoted", advisor_status: "pending", expires_at: "2026-11-04T12:00:00Z", held_until: null };

test("a quote's state in the traveler's words", () => {
  assert.equal(quoteState(base, now), "waiting");
  assert.equal(quoteState({ ...base, expires_at: "2026-10-30T00:00:00Z" }, now), "expired");
  assert.equal(quoteState({ ...base, advisor_status: "held", held_until: "2026-11-10T00:00:00Z" }, now), "held");
  assert.equal(quoteState({ ...base, advisor_status: "held", held_until: "2026-10-30T00:00:00Z" }, now), "expired");
  assert.equal(quoteState({ ...base, advisor_status: "approved" }, now), "confirmed");
  assert.equal(quoteState({ ...base, advisor_status: "approved", status: "converted" }, now), "booked");
  assert.equal(quoteState({ ...base, advisor_status: "declined", status: "rejected" }, now), "declined");
});

test("the timeline marks the step reached and nothing beyond it", () => {
  const t = timeline("confirmed");
  assert.deepEqual(t.map((s) => [s.step, s.done, s.current]), [["Requested", true, false], ["Confirmed by the house", false, true], ["Booked", false, false], ["Deposit paid", false, false], ["Balance paid", false, false], ["Stayed", false, false]]);
  assert.ok(timeline("declined").every((s) => !s.done && !s.current));
});

test("a booking's money position", () => {
  const b = { status: "deposit_paid", grand_total_minor: 1247406, deposit_due_minor: 374222, deposit_paid_minor: 374222, balance_paid_minor: 0, balance_due_date: "2027-04-11" };
  const w = bookingWords(b);
  assert.equal(w.label, "Deposit paid"); assert.equal(w.outstandingMinor, 873184); assert.match(w.line, /2027-04-11/);
  assert.equal(bookingWords({ ...b, status: "paid", balance_paid_minor: 873184 }).outstandingMinor, 0);
  assert.equal(bookingWords({ ...b, status: "cancelled" }).outstandingMinor, 0);
});

test("the house's booking input: from a quote, or recorded by an advisor", () => {
  assert.equal(parseBooking({ quoteId: "6b4e5a1c-2d3f-4a5b-8c6d-7e8f9a0b1c2d", partnerConfirmationNumber: "LS-44871" }, "from_quote").ok, true);
  assert.equal(parseBooking({ quoteId: "nope" }, "from_quote").ok, false);
  assert.equal(parseBooking({ quoteId: "6b4e5a1c-2d3f-4a5b-8c6d-7e8f9a0b1c2d", grandTotalMinor: 1 }, "from_quote").ok, false, "a quote booking never takes a price from the request");
  const adv = parseBooking({ travelerUserId: "6b4e5a1c-2d3f-4a5b-8c6d-7e8f9a0b1c2d", propertySlug: "Lion-Sands", roomCode: "ivory-lodge-ivory-suite", arrival: "2027-06-10", departure: "2027-06-13", adults: 2, currency: "usd", grandTotalMinor: 2195640, depositDueMinor: 658692, balanceDueDate: "2027-04-11", partnerConfirmationNumber: "LS-44871" }, "advisor");
  assert.equal(adv.ok, true);
  if (adv.ok) { assert.equal(adv.value.propertySlug, "lion-sands"); assert.equal(adv.value.currency, "USD"); assert.equal(adv.value.children, 0); }
  assert.equal(parseBooking({ travelerUserId: "6b4e5a1c-2d3f-4a5b-8c6d-7e8f9a0b1c2d", propertySlug: "lion-sands", arrival: "2027-06-13", departure: "2027-06-10", adults: 2, currency: "USD", grandTotalMinor: 1 }, "advisor").ok, false);
  assert.equal(parseBooking({ travelerUserId: "6b4e5a1c-2d3f-4a5b-8c6d-7e8f9a0b1c2d", propertySlug: "lion-sands", arrival: "2027-06-10", departure: "2027-06-13", adults: 2, currency: "USD", grandTotalMinor: 100, depositDueMinor: 200 }, "advisor").ok, false, "deposit above total");
});
