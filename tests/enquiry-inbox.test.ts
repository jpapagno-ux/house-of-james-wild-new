import { test } from "node:test";
import assert from "node:assert/strict";
import { EQ, advisorFormula, canSee, daysSince, inboxCounts, inboxOrder, isRecordId, parseStatusChange, slugName, statusFields, toEnquiry } from "../lib/platform/enquiry-inbox.ts";

const now = new Date("2026-11-18T12:00:00Z");
const rec = (id: string, over: Record<string, unknown> = {}) => ({
  id, createdTime: "2026-11-17T12:00:00.000Z",
  fields: { [EQ.enquiryId]: "ENQ-2026-000001", [EQ.received]: "2026-11-17T12:00:00.000Z", [EQ.traveller]: "Ana Reyes", [EQ.status]: "New", [EQ.advisor]: ["recAAAAAAAAAAAAAA"], ...over },
});

test("an enquiry is flagged only when it is still New after more than two days", () => {
  assert.equal(toEnquiry(rec("recBBBBBBBBBBBBBB"), now).unanswered, false);
  assert.equal(toEnquiry(rec("recBBBBBBBBBBBBBB", { [EQ.received]: "2026-11-16T12:00:00Z" }), now).unanswered, false); // exactly two days
  const late = toEnquiry(rec("recBBBBBBBBBBBBBB", { [EQ.received]: "2026-11-15T11:00:00Z" }), now);
  assert.equal(late.daysWaiting, 3);
  assert.equal(late.unanswered, true);
  assert.equal(toEnquiry(rec("recBBBBBBBBBBBBBB", { [EQ.received]: "2026-11-01T00:00:00Z", [EQ.status]: "Replied" }), now).unanswered, false);
  assert.equal(daysSince("", now), 0);
  assert.equal(daysSince("2027-01-01T00:00:00Z", now), 0);
});

test("an unknown status reads as New; a blank Received falls back to the record's created time", () => {
  const e = toEnquiry(rec("recBBBBBBBBBBBBBB", { [EQ.status]: "Maybe", [EQ.received]: undefined }), now);
  assert.equal(e.status, "New");
  assert.equal(e.received, "2026-11-17T12:00:00.000Z");
});

test("an advisor sees only enquiries addressed to their Advisors row", () => {
  const e = toEnquiry(rec("recBBBBBBBBBBBBBB"), now);
  assert.equal(canSee(e, "recAAAAAAAAAAAAAA"), true);
  assert.equal(canSee(e, "recZZZZZZZZZZZZZZ"), false);
  assert.equal(canSee(e, null), false);
  assert.equal(canSee(toEnquiry(rec("recBBBBBBBBBBBBBB", { [EQ.advisor]: undefined }), now), null), false);
});

test("the advisor filter is built only from a clean slug", () => {
  assert.equal(advisorFormula("anthony-papagno"), 'FIND("|anthony-papagno|", "|" & ARRAYJOIN({Advisor}, "|") & "|")');
  for (const bad of ['a"|") & 1', "Anthony", "", "a b"]) assert.equal(advisorFormula(bad), null, bad);
  assert.equal(isRecordId("recAAAAAAAAAAAAAA"), true);
  assert.equal(isRecordId("recAAAA/../x"), false);
});

test("a status change: Closed needs a listed reason; any other status clears it; unknown fields are refused", () => {
  assert.deepEqual(parseStatusChange({ status: "Replied", note: "  Called her.  " }), { ok: true, value: { status: "Replied", closedReason: null, note: "Called her." } });
  assert.equal(parseStatusChange({ status: "Closed" }).ok, false);
  assert.equal(parseStatusChange({ status: "Closed", closedReason: "Bored" }).ok, false);
  assert.deepEqual(parseStatusChange({ status: "Closed", closedReason: "Duplicate" }), { ok: true, value: { status: "Closed", closedReason: "Duplicate", note: null } });
  assert.deepEqual(parseStatusChange({ status: "Quoted", closedReason: "Duplicate" }), { ok: true, value: { status: "Quoted", closedReason: null, note: null } });
  for (const bad of [null, [], { status: "Won" }, { status: "New", advisor: ["recAAAAAAAAAAAAAA"] }, { status: "New", note: 7 }]) assert.equal(parseStatusChange(bad).ok, false);
  const f = statusFields({ status: "Replied", closedReason: null, note: null }, "2026-11-18T12:00:00.000Z");
  assert.deepEqual(f, { [EQ.status]: "Replied", [EQ.closedReason]: null, [EQ.statusChanged]: "2026-11-18T12:00:00.000Z" });
  assert.equal(statusFields({ status: "Replied", closedReason: null, note: "" }, "x")[EQ.advisorNote], "");
});

test("counts and order: waiting enquiries first, then newest", () => {
  const list = [
    toEnquiry(rec("recCCCCCCCCCCCCCC", { [EQ.received]: "2026-11-18T09:00:00Z" }), now),
    toEnquiry(rec("recDDDDDDDDDDDDDD", { [EQ.received]: "2026-11-10T09:00:00Z" }), now),
    toEnquiry(rec("recEEEEEEEEEEEEEE", { [EQ.received]: "2026-11-12T09:00:00Z", [EQ.status]: "Booked" }), now),
  ];
  assert.deepEqual(inboxCounts(list), { new: 2, open: 2, unanswered: 1 });
  assert.deepEqual(inboxOrder(list).map((e) => e.recordId), ["recDDDDDDDDDDDDDD", "recCCCCCCCCCCCCCC", "recEEEEEEEEEEEEEE"]);
  assert.equal(slugName("anthony-papagno"), "Anthony Papagno");
});
