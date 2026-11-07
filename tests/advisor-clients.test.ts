import { test } from "node:test";
import assert from "node:assert/strict";
import { attention, buildClients, money, personName, type BookingRow, type FolioRow, type Person, type QuoteRow } from "../lib/platform/advisor-clients.ts";

const today = "2026-11-05";
const people: Person[] = [
  { id: "a", first_name: "Ana", last_name: "Reyes", email: "ana@example.test" },
  { id: "b", first_name: null, last_name: null, email: "bo@example.test" },
  { id: "c", first_name: "Cy", last_name: "Ng", email: null },
];
const folio = (id: string, owner: string, updated: string): FolioRow => ({ id, owner_user_id: owner, title: "Trip", status: "planning", start_date: null, end_date: null, updated_at: updated });
const quote = (id: string, who: string, over: Partial<QuoteRow> = {}): QuoteRow => ({
  id, public_reference: `Q-${id}`, traveler_user_id: who, property_id: "p", arrival_date: "2027-05-10", departure_date: "2027-05-13",
  status: "quoted", advisor_status: "approved", held_until: null, expires_at: "2026-12-30T00:00:00Z", grand_total_minor: 300000, currency: "USD", created_at: "2026-11-01T10:00:00Z", ...over,
});
const booking = (id: string, who: string, over: Partial<BookingRow> = {}): BookingRow => ({
  id, public_reference: `B-${id}`, traveler_user_id: who, property_id: "p", arrival_date: "2027-05-10", departure_date: "2027-05-13",
  status: "deposit_paid", balance_due_date: "2027-03-10", grand_total_minor: 300000, deposit_paid_minor: 90000, balance_paid_minor: 0, currency: "USD", ...over,
});

test("one line per client; soonest arrival first, then most recent activity", () => {
  const cs = buildClients(people,
    [folio("f1", "c", "2026-11-04T09:00:00Z"), folio("f2", "b", "2026-10-01T09:00:00Z")],
    [quote("1", "b"), quote("2", "b", { status: "converted" }), quote("3", "a", { advisor_status: "declined" })],
    [booking("1", "a", { arrival_date: "2027-01-20" }), booking("2", "a", { status: "cancelled", arrival_date: "2026-12-01" })], today);
  assert.deepEqual(cs.map((c) => c.id), ["a", "c", "b"]);
  const a = cs[0];
  assert.equal(a.name, "Ana Reyes");
  assert.equal(a.nextArrival, "2027-01-20", "a cancelled booking is not the next arrival");
  assert.equal(a.bookings, 1);
  assert.equal(a.openQuotes, 0, "a declined quote is not open");
  const b = cs.find((x) => x.id === "b")!;
  assert.equal(b.name, "bo@example.test", "no name falls back to the email");
  assert.equal(b.openQuotes, 1, "a converted quote is not open");
  assert.equal(b.folios, 1);
});

test("what needs the advisor's eye, soonest first, and only within its window", () => {
  const items = attention(people,
    [quote("h", "a", { advisor_status: "held", held_until: "2026-11-07T12:00:00Z" }),
     quote("w", "b", { advisor_status: "pending", created_at: "2026-11-04T08:00:00Z" }),
     quote("x", "c", { expires_at: "2026-11-08T00:00:00Z" }),
     quote("far", "c", { expires_at: "2027-01-08T00:00:00Z" })],
    [booking("due", "a", { balance_due_date: "2026-11-20" }),
     booking("paid", "b", { balance_due_date: "2026-11-20", status: "paid", balance_paid_minor: 210000 }),
     booking("soon", "c", { arrival_date: "2026-11-12", status: "paid" })], today);
  assert.deepEqual(items.map((i) => i.kind), ["quote_waiting", "hold_ending", "quote_expiring", "arriving", "balance_due"]);
  assert.match(items[1].text, /Hold for Ana Reyes ends/);
  assert.ok(!items.some((i) => i.ref === "Q-far"), "a quote expiring in two months is not flagged");
  assert.ok(!items.some((i) => i.ref === "B-paid" && i.kind === "balance_due"), "a paid booking has no balance due");
});

test("names and money read plainly", () => {
  assert.equal(personName(undefined), "Client");
  assert.equal(personName({ id: "x", first_name: " Mia ", last_name: "", email: null }), "Mia");
  assert.equal(money(684000, "USD"), "$6,840");
  assert.equal(money(684000, "ZAR"), "ZAR 6,840");
});
