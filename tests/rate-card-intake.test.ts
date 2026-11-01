import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIntake, intakeOrder, type IntakeInput } from "../lib/booking-live/rates/intake.ts";

// The rate-card intake template, checked against the Lion Sands shape it was
// drawn from: room codes equal the canonical codes, per-person rates convert
// to per-room with the season saying so, problems stop a bad card early, and
// the link SQL binds canonical rows to the Airtable ids.

const base: IntakeInput = {
  ledgerId: "STY-2026-290658", slug: "lion-sands", propertyName: "Lion Sands Game Reserve", timeZone: "Africa/Johannesburg", stayType: "Lodge",
  units: [
    { code: "ivory-lodge-ivory-suite", name: "Ivory Lodge · Ivory Suite", maxAdults: 2, maxChildren: 0, maxOccupancy: 2, bedConfiguration: "King bed" },
    { code: "fish-eagle-residence-the-residence-exclusive-use", name: "Fish Eagle Residence · exclusive use", maxAdults: 6, maxChildren: 0, maxOccupancy: 6 },
  ],
  plan: { code: "fi", name: "Fully inclusive", boardBasis: "Fully inclusive", refundability: "Refundable" },
  card: { label: "2027-V2", currency: "USD", effectiveFrom: "2027-01-01", effectiveTo: "2027-12-31", contractReference: "Lion Sands 2027 contracted rates (PDF)", depositPercent: 0.3, balanceDueDays: 60, cancellationSummary: "Full refund until 60 days before arrival; 100% from 60 days." },
  seasons: {
    "ivory-lodge-ivory-suite": [{ season: "High", stayStart: "2027-06-01", stayEnd: "2027-10-31", nightly: 3420, basis: "per_person_sharing" }, { season: "Green", stayStart: "2027-01-01", stayEnd: "2027-05-31", nightly: 5800, basis: "per_room" }],
    "fish-eagle-residence-the-residence-exclusive-use": [{ season: "All year", stayStart: "2027-01-01", stayEnd: "2027-12-31", nightly: 11845, basis: "per_room", baseOccupancy: 6 }],
  },
  taxes: [{ name: "VAT 15% (included in the rate)", kind: "Tax", basis: "% of room", percent: 0.15, includedInRate: true, jurisdiction: "South Africa" }],
};

test("builds the Airtable records in link order with room codes equal to the canonical codes", () => {
  const p = buildIntake(base);
  assert.deepEqual(p.problems, []);
  assert.deepEqual(intakeOrder(p), ["Properties", "Room Types", "Rate Plans", "Rate Cards", "Seasonal Rates", "Taxes & Fees"]);
  const rooms = p.writes.filter((w) => w.table === "Room Types");
  assert.deepEqual(rooms.map((r) => r.fields["Room Code"]), base.units.map((u) => u.code));
  assert.equal(p.writes.find((w) => w.table === "Rate Cards")!.fields.Status, "Draft");
  assert.equal(p.writes.filter((w) => w.table === "Rate Plans").length, 2);
  assert.equal(p.writes.filter((w) => w.table === "Seasonal Rates").length, 3);
});

test("per-person seasons convert to per-room for the base occupancy and say so; per-room seasons pass through", () => {
  const p = buildIntake(base);
  const high = p.writes.find((w) => w.key === "season:ivory-lodge-ivory-suite:0")!;
  assert.equal(high.fields["Nightly Gross"], 6840);
  assert.equal(high.fields["Base Occupancy"], 2);
  assert.match(String(high.fields.Season), /per person × 2, verify/);
  const green = p.writes.find((w) => w.key === "season:ivory-lodge-ivory-suite:1")!;
  assert.equal(green.fields["Nightly Gross"], 5800);
  assert.equal(green.fields.Season, "Green");
  const house = p.writes.find((w) => w.key === "season:fish-eagle-residence-the-residence-exclusive-use:0")!;
  assert.equal(house.fields["Base Occupancy"], 6);
  assert.deepEqual(p.perPersonConverted, ["Ivory Lodge · Ivory Suite · High"]);
});

test("stops a bad intake: bad codes, missing seasons, seasons outside the card, missing occupancy", () => {
  const p = buildIntake({ ...base, units: [{ code: "Ivory Suite", name: "Ivory", maxAdults: null, maxChildren: null, maxOccupancy: null }], seasons: { "Ivory Suite": [{ season: "X", stayStart: "2026-12-01", stayEnd: "2027-01-05", nightly: 100, basis: "per_room" }] } });
  assert.ok(p.problems.some((x) => /lowercase-with-dashes/.test(x)));
  assert.ok(p.problems.some((x) => /max occupancy unknown/.test(x)));
  assert.ok(p.problems.some((x) => /outside the card's effective dates/.test(x)));
  const none = buildIntake({ ...base, seasons: {} });
  assert.equal(none.problems.filter((x) => /no seasons/.test(x)).length, 2);
});

test("the link SQL binds canonical rows to the Airtable ids by code, once", () => {
  const sql = buildIntake(base).linkSql({ "property:lion-sands": "recP", "room:ivory-lodge-ivory-suite": "recA", "room:fish-eagle-residence-the-residence-exclusive-use": "recB" });
  assert.match(sql, /\('ivory-lodge-ivory-suite','recA'\), \('fish-eagle-residence-the-residence-exclusive-use','recB'\)/);
  assert.match(sql, /airtable_record_id is null/);
  assert.match(sql, /set airtable_record_id = 'recP' where slug = 'lion-sands'/);
});
