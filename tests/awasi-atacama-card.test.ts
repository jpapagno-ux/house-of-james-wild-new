import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { quote, type RateCard, type Room, type Quote } from "../lib/booking-live/pricing/engine.ts";

// Awasi Atacama 2026-2027, the partner's own sheet priced through the checkout engine (James, 24 Nov 2026).
// The sheet prints totals for 2 to 6 nights. They are one nightly rate per season with a long-stay saving:
// 4 nights 3%, 5 nights 5%, 6 nights 8%. So the card is a nightly rate plus three automatic offers, with no
// change to the engine. Every double and triple figure on the sheet must come back within one dollar.
const C = JSON.parse(readFileSync(new URL("../scripts/booking-live/awasi-atacama-2026-2027.json", import.meta.url), "utf8"));
const ROOMS: Record<string, Room> = {
  "round-room": { id: "round-room", name: "Round Room", maxAdults: 2, maxChildren: 0, maxOccupancy: 2 },
  "superior-round-room": { id: "superior-round-room", name: "Superior Round Suite", maxAdults: 3, maxChildren: 0, maxOccupancy: 3 },
};
const rules: RateCard["rules"] = [];
for (const [room, bySeason] of Object.entries(C.sheet) as [string, Record<string, Record<string, number[]>>][])
  for (const s of C.seasons as { season: string; ranges: [string, string][] }[]) {
    const dbl = bySeason[s.season].DBL[0] / 2, trp = bySeason[s.season].TRP ? bySeason[s.season].TRP[0] / 2 : null;
    s.ranges.forEach(([a, b], k) => rules.push({ id: `${room}:${s.season}:${k}`, season: s.season, roomTypeId: room, ratePlanId: "fh", stayStart: a, stayEnd: b,
      baseOccupancy: 2, amountMinor: Math.round(dbl * 100), extraAdultMinor: trp == null ? null : Math.round((trp - dbl) * 100), minNights: C.minNights }));
  }
const card: RateCard = {
  versionId: "awasi-atacama:2026-2027-V1:test", propertySlug: C.slug, currency: C.currency, status: "published", rules, restrictions: [], taxes: [],
  promotions: C.longStay.map((p: { code: string; minNights: number; percent: number }) => ({ code: p.code, label: `${p.minNights} nights or more`, type: "percent" as const, value: p.percent * 100, minNights: p.minNights, stacking: "exclusive" as const, approved: true })),
  paymentTerms: { depositPercentBp: C.deposit.percent * 100, balanceDueDaysBeforeArrival: C.deposit.balanceDueDays },
  cancellation: { summary: "As Awasi's sheet states.", tiers: [] },
};
const START: Record<string, string> = { High: "2026-12-01", Shoulder: "2027-03-10", "Off-Peak": "2027-06-10" };
const add = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);

test("every double and triple total on Awasi Atacama's sheet comes back within one dollar", () => {
  let checked = 0;
  for (const [room, bySeason] of Object.entries(C.sheet) as [string, Record<string, Record<string, number[]>>][])
    for (const [season, occ] of Object.entries(bySeason))
      for (const [label, adults] of [["DBL", 2], ["TRP", 3]] as const) {
        if (!occ[label]) continue;
        occ[label].forEach((total, i) => {
          const q = quote(card, ROOMS[room], { roomTypeId: room, ratePlanId: "fh", arrival: START[season], departure: add(START[season], i + 2), adults, childAges: [], bookingDate: "2026-11-24" });
          assert.equal(q.ok, true, `${room} ${season} ${label} ${i + 2}n: ${JSON.stringify(q)}`);
          const got = (q as Quote).grandTotalMinor / 100;
          assert.ok(Math.abs(got - total) <= 1, `${room} ${season} ${label} ${i + 2} nights: sheet ${total}, engine ${got}`);
          checked++;
        });
      }
  assert.equal(checked, 45);
});

test("one night is refused, and the deposit is half", () => {
  const one = quote(card, ROOMS["round-room"], { roomTypeId: "round-room", ratePlanId: "fh", arrival: "2026-12-01", departure: "2026-12-02", adults: 2, childAges: [], bookingDate: "2026-11-24" });
  assert.equal(one.ok, false);
  const q = quote(card, ROOMS["round-room"], { roomTypeId: "round-room", ratePlanId: "fh", arrival: "2027-02-01", departure: "2027-02-04", adults: 2, childAges: [], bookingDate: "2026-11-24" }) as Quote;
  assert.equal(q.grandTotalMinor, 876000); assert.equal(q.depositDueMinor, 438000);
});

test("Awasi Atacama: the filed cancellation schedule reads as three seasons", async () => {
  const { readFileSync } = await import("node:fs");
  const { parseCancellation } = await import("../lib/booking-live/rates/airtable-map.ts");
  const intake = JSON.parse(readFileSync(new URL("../scripts/booking-live/intake-awasi-atacama-2026-2027.json", import.meta.url), "utf8"));
  const c = parseCancellation(JSON.stringify(intake).match(/"cancellationTiers":"([^"]+)"/)![1]);
  assert.ok(c);
  assert.deepEqual(c.seasons.map((s) => [s.from, s.to, s.tiers.map((t) => `${t.daysBeforeArrival}:${t.penaltyBp / 100}`).join(",")]), [["2026-12-20", "2027-01-03", "120:50,60:100"], ["2026-11-01", "2027-02-28", "44:50,30:100"]]);
  assert.deepEqual(c.tiers.map((t) => `${t.daysBeforeArrival}:${t.penaltyBp / 100}`), ["30:50", "15:100"]);
});
