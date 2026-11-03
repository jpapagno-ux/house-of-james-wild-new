import { test } from "node:test";
import assert from "node:assert/strict";
import { cardAlerts, parseOffer, parseSeasonal } from "../lib/platform/rate-proposals.ts";

const A = "11111111-2222-3333-4444-555555555555", B = "11111111-2222-3333-4444-666666666666";

test("seasonal grid: blank lines skipped, rows checked, validity from the rows", () => {
  const r = parseSeasonal({ rows: [
    { roomId: A, season: "High", stayStart: "2027-06-01", stayEnd: "2027-10-31", nightly: "1,250", minNights: "2" },
    { roomId: "", season: "", nightly: "" },
    { roomId: B, season: "Festive", stayStart: "2027-12-20", stayEnd: "2028-01-05", nightly: 1900, basis: "per_person" },
  ] }, [A, B]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.value.rows.length, 2);
    assert.equal(r.value.rows[0].nightly, 1250);
    assert.equal(r.value.rows[1].basis, "per_person");
    assert.equal(r.validFrom, "2027-06-01");
    assert.equal(r.validTo, "2028-01-05");
  }
  assert.equal(parseSeasonal({ rows: [{ roomId: A, season: "High", stayStart: "2027-06-01", stayEnd: "2027-05-01", nightly: 1 }] }, [A]).ok, false);
  assert.equal(parseSeasonal({ rows: [{ roomId: "99999999-2222-3333-4444-555555555555", season: "High", stayStart: "2027-06-01", stayEnd: "2027-07-01", nightly: 1 }] }, [A]).ok, false);
  assert.equal(parseSeasonal({ rows: [] }, [A]).ok, false);
});

test("offers: kinds, values and dates", () => {
  const ok = parseOffer({ label: "Stay 4, pay 3", type: "stay_pay", value: "4", stayStart: "2027-01-10", stayEnd: "2027-03-31", rooms: [A, "x"] }, [A]);
  assert.ok(ok.ok);
  if (ok.ok) assert.deepEqual(ok.value.rooms, [A]);
  assert.equal(parseOffer({ label: "Big", type: "percent", value: 95, stayStart: "2027-01-01", stayEnd: "2027-02-01" }, [A]).ok, false);
  assert.equal(parseOffer({ label: "Honeymoon — bubbles", type: "added_value", stayStart: "2027-01-01", stayEnd: "2027-02-01" }, [A]).ok, false);
  assert.equal(parseOffer({ label: "Spa credit", type: "added_value", stayStart: "2027-01-01", stayEnd: "2027-02-01" }, [A]).ok, true);
  assert.equal(parseOffer({ label: "No dates", type: "percent", value: 10 }, [A]).ok, false);
});

test("card alerts: missing, running out, next year missing", () => {
  assert.equal(cardAlerts([], "2026-11-03").level, "missing");
  assert.equal(cardAlerts([{ version_label: "2026", effective_from: "2026-01-01", effective_to: "2026-12-31" }], "2026-11-03").level, "expiring");
  assert.match(cardAlerts([{ version_label: "2027-V1", effective_from: "2027-01-01", effective_to: "2027-12-31" }], "2026-11-03").text, /until 2027-12-31/);
  assert.match(cardAlerts([{ version_label: "2027-V1", effective_from: "2027-01-01", effective_to: "2027-12-31" }], "2027-08-01").text, /2028 rates missing/);
});
