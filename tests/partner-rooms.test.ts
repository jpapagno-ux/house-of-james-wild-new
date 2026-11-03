import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseRoomValue, parseRoomChanges, parseRoomRequest, roomRequestNote } from "../lib/platform/rooms.ts";

const R = "11111111-2222-3333-4444-555555555555";

test("room fields: lists, numbers, categories", () => {
  assert.deepEqual(normaliseRoomValue("included", "Breakfast\n- Airport transfer"), { ok: true, value: ["Breakfast", "Airport transfer"] });
  assert.deepEqual(normaliseRoomValue("size_sqm", "300,5"), { ok: true, value: 300.5 });
  assert.equal(normaliseRoomValue("size_sqm", "huge").ok, false);
  assert.deepEqual(normaliseRoomValue("unit_type", "Villa"), { ok: true, value: "villa" });
  assert.equal(normaliseRoomValue("unit_type", "palace").ok, false);
});

test("names and occupancy go by request, never by revision", () => {
  const r = parseRoomChanges({ roomId: R, changes: { name: "New name" } });
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.message : "", /by request/);
  assert.equal(parseRoomChanges({ roomId: R, changes: { max_occupancy: 4 } }).ok, false);
  assert.equal(parseRoomChanges({ roomId: R, changes: { features: "Private pool" } }).ok, true);
});

test("room requests", () => {
  assert.equal(parseRoomRequest({ propertyId: R, name: "x" }).ok, false);
  assert.equal(parseRoomRequest({ propertyId: R, kind: "change", name: "River Suite" }).ok, false);
  const ok = parseRoomRequest({ propertyId: R, name: "River Suite", category: "Suite", adults: "2", children: "1", units: "2", beds: "1 king bed" });
  assert.ok(ok.ok);
  const note = ok.ok ? roomRequestNote(ok.value) : "";
  assert.match(note, /New room: River Suite/);
  assert.match(note, /How many of them: 2/);
  assert.equal(parseRoomRequest({ propertyId: R, name: "River Suite", adults: "two" }).ok, false);
});
