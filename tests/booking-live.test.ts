// Run: node --experimental-strip-types --test tests/booking-live.test.ts
// Booking Live Phase 1: flags default off, and every API body is validated
// strictly (spec §8 "input schema validation", §16 cases 1–3).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFlags } from "../lib/booking-live/flags.ts";
import { isUuid, isValidDate, parseFavorite, parseFolio, parseInvite, parseItem, parseProfile, safeNext } from "../lib/booking-live/validate.ts";

const SB = { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "k" };

test("flags: everything is off by default", () => {
  assert.deepEqual(readFlags({}), { accounts: false, save: false, share: false });
});

test("flags: only the exact word 'on' switches a flag", () => {
  for (const v of ["true", "1", "ON", "yes", " on"]) assert.equal(readFlags({ ...SB, NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS: v }).accounts, false, v);
  assert.equal(readFlags({ ...SB, NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS: "on" }).accounts, true);
});

test("flags: save and share need accounts and Supabase config", () => {
  assert.equal(readFlags({ ...SB, NEXT_PUBLIC_BOOKING_LIVE_SAVE: "on" }).save, false);
  assert.equal(readFlags({ NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS: "on", NEXT_PUBLIC_BOOKING_LIVE_SAVE: "on" }).save, false);
  assert.equal(readFlags({ ...SB, NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS: "on", NEXT_PUBLIC_BOOKING_LIVE_SAVE: "on" }).save, true);
});

test("favorite: slug only, no extra fields", () => {
  assert.deepEqual(parseFavorite({ property: "Leeu-Estates" }), { ok: true, value: { slug: "leeu-estates" } });
  assert.equal(parseFavorite({ property: "../etc" }).ok, false);
  assert.equal(parseFavorite({ property: "leeu-estates", user_id: "someone-else" }).ok, false);
  assert.equal(parseFavorite(null).ok, false);
  assert.equal(parseFavorite(["leeu-estates"]).ok, false);
});

test("folio: title required, real dates, end not before start", () => {
  const good = parseFolio({ title: "  Cape   Winelands ", startDate: "2027-05-01", endDate: "2027-05-09" });
  assert.ok(good.ok && good.value.title === "Cape Winelands");
  assert.equal(parseFolio({ title: "" }).ok, false);
  assert.equal(parseFolio({ title: "x", startDate: "2027-02-30" }).ok, false);
  assert.equal(parseFolio({ title: "x", startDate: "2027-05-09", endDate: "2027-05-01" }).ok, false);
  assert.equal(parseFolio({ title: "x", owner_user_id: "b" }).ok, false);
  const long = parseFolio({ title: "a".repeat(500) });
  assert.ok(long.ok && long.value.title.length === 120);
});

test("item: a stay or a type, valid dates, departure after arrival", () => {
  assert.ok(parseItem({ property: "monwana-thornybush" }).ok);
  assert.ok(parseItem({ type: "note", notes: "Ask about the Ivory suites" }).ok);
  assert.equal(parseItem({}).ok, false);
  assert.equal(parseItem({ type: "booking" }).ok, false);
  assert.equal(parseItem({ type: "note", arrival: "2027-05-03", departure: "2027-05-03" }).ok, false);
  assert.equal(parseItem({ type: "note", folio_id: "x" }).ok, false);
});

test("invite: valid email and role only", () => {
  assert.deepEqual(parseInvite({ email: " Miriam@Example.com ", role: "editor" }), { ok: true, value: { email: "miriam@example.com", role: "editor" } });
  assert.equal(parseInvite({ email: "nope", role: "viewer" }).ok, false);
  assert.equal(parseInvite({ email: "a@b.co", role: "owner" }).ok, false);
});

test("profile: email and ids are never accepted", () => {
  assert.equal(parseProfile({ email: "x@y.z" }).ok, false);
  assert.equal(parseProfile({ id: "x" }).ok, false);
  assert.equal(parseProfile({ preferredCurrency: "BTC" }).ok, false);
  assert.equal(parseProfile({ phone: "<script>" }).ok, false);
  assert.deepEqual(parseProfile({ firstName: "James", preferredCurrency: "ZAR" }), { ok: true, value: { first_name: "James", preferred_currency: "ZAR" } });
  assert.equal(parseProfile({}).ok, false);
});

test("safeNext: same-site account and stay paths only (no open redirects)", () => {
  assert.equal(safeNext("/stays/leeu-estates"), "/stays/leeu-estates");
  assert.equal(safeNext("/account/folios/abc"), "/account/folios/abc");
  for (const bad of ["https://evil.test", "//evil.test", "/\\evil.test", "/admin", "javascript:alert(1)", null, ""]) assert.equal(safeNext(bad), "/account", String(bad));
});

test("dates and ids", () => {
  assert.ok(isValidDate("2028-02-29"));
  assert.ok(!isValidDate("2027-02-29"));
  assert.ok(!isValidDate("2027-13-01"));
  assert.ok(isUuid("2cf9b544-8151-47ec-bc00-ad708d9506e8"));
  assert.ok(!isUuid("2cf9b544-8151-47ec-bc00-ad708d9506e8' or 1=1"));
});
