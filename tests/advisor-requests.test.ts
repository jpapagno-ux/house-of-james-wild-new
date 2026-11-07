import { test } from "node:test";
import assert from "node:assert/strict";
import { money, parseRequest, priceMinor, shareText } from "../lib/platform/advisor-requests.ts";

const base = { stay: "lion-sands", client_name: " Ana  Reyes ", client_email: "Ana@Example.com", arrival: "2027-03-10", departure: "2027-03-13", adults: "2", child_ages: "12, 9", notes: "Anniversary" };

test("parseRequest: tidy values, dates and party checked", () => {
  const r = parseRequest(base, "2026-11-07");
  assert.ok(r.ok);
  if (r.ok) { assert.equal(r.value.client_name, "Ana Reyes"); assert.equal(r.value.client_email, "ana@example.com"); assert.deepEqual(r.value.child_ages, [12, 9]); assert.equal(r.value.adults, 2); }
  const past = parseRequest({ ...base, arrival: "2026-11-01" }, "2026-11-07");
  assert.equal(!past.ok && past.field, "arrival");
  const back = parseRequest({ ...base, departure: "2027-03-10" }, "2026-11-07");
  assert.equal(!back.ok && back.field, "departure");
  const kid = parseRequest({ ...base, child_ages: "18" }, "2026-11-07");
  assert.equal(!kid.ok && kid.field, "child_ages");
  const noEmail = parseRequest({ ...base, client_email: "" }, "2026-11-07");
  assert.ok(noEmail.ok && noEmail.value.client_email === null);
});

test("prices and the words to share", () => {
  assert.equal(priceMinor("18,400"), 1840000);
  assert.equal(priceMinor("18400.5"), 1840050);
  assert.equal(priceMinor("abc"), null);
  assert.equal(money(1840000, "USD"), "$18,400");
  const t = shareText({ stay_name: "Lion Sands Reserve", arrival: "2027-03-10", departure: "2027-03-13", adults: 2, child_ages: [], price_minor: 1840000, currency: "USD", hold_until: "2026-11-10", status: "held", room_pref: "Ivory Lodge suite", house_note: null, ref: "AR-2026-000001" }, "Kristina Larson", (d) => d);
  assert.match(t, /\(3 nights\), 2 adults/);
  assert.match(t, /Price: \$18,400, confirmed by James Wild & Co\./);
  assert.match(t, /Held for you until 2026-11-10/);
  assert.match(t, /ref\. AR-2026-000001/);
});
