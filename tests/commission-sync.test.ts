import { test } from "node:test";
import assert from "node:assert/strict";
import { describeCommissionSync, mapPartnerBrands, percentToBp } from "../lib/platform/commission-sync.ts";

test("Airtable percent to basis points, nothing guessed", () => {
  assert.equal(percentToBp(0.2), 2000);
  assert.equal(percentToBp(0.17), 1700);
  assert.equal(percentToBp(0.175), 1750);
  assert.equal(percentToBp(20), null); // typed as 20 instead of 20%: refused, not 2000%
  assert.equal(percentToBp(undefined), null);
  assert.equal(percentToBp("0.2"), null);
});

test("Partner Brands rows become sync rows", () => {
  const [more, cayuga] = mapPartnerBrands([
    { id: "recWJRbZ0nksFaP8X", fields: { Brand: "MORE Collection", "Partner Code": " par-000002 ", "Commission %": 0.2, "Commission basis": "To confirm", "Contract status": "Confirmed", "Source and date checked": "James Papagno, 3 Nov 2026" } },
    { id: "recS6IeemXM3CjanD", fields: { Brand: "Cayuga Collection", "Commission %": 0.2, "Commission basis": { name: "Net (STO) rate + our margin" }, "Contract status": "Awaiting contract" } },
  ]);
  assert.equal(more.partner_code, "PAR-000002");
  assert.equal(more.rate_bp, 2000);
  assert.equal(more.confirmed, true);
  assert.equal(more.net, false);
  assert.match(more.note, /Basis: To confirm/);
  assert.equal(cayuga.partner_code, "");
  assert.equal(cayuga.net, true);
  assert.equal(cayuga.confirmed, false);
});

test("the Sync Log line names what did not sync", () => {
  const t = describeCommissionSync({ adopted: ["MORE Collection"], unmatched: ["Tswalu: no Partner Code"], unchanged: [] });
  assert.match(t, /now read from Airtable: MORE Collection/);
  assert.match(t, /NOT SYNCED \(add the Partner Code\): Tswalu/);
  assert.doesNotMatch(t, /Unchanged/);
  assert.equal(describeCommissionSync({}), "No Partner Brands rows.");
});
