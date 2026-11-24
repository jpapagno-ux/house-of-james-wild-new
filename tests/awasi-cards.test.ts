import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { quote, type RateCard, type Room, type Quote } from "../lib/booking-live/pricing/engine.ts";

// Awasi Iguazú, Mendoza and Patagonia 2026-2027, each lodge's own published sheet priced through the checkout
// engine the way Awasi Atacama is (James, 24 Nov 2026: "add the room types and categories with prices").
// Each sheet prints totals for 2 (Patagonia 3) to 6 nights: one nightly rate per season per occupancy, less a
// long-stay saving. So a card is a nightly rate for the base occupancy, an extra-adult rate above it, and
// automatic long-stay offers, with no change to the engine. Single rates are left unpriced, as for Atacama.
// Every double, triple and quadruple figure must come back within one dollar, except where Awasi's own sheet
// rounds a total differently (listed in SHEET_ROUNDING with the sheet's figure).
const SHEET_ROUNDING: Record<string, number> = { "awasi-patagonia:master-villa:Shoulder:6": 3 };
const OCC = { DBL: 2, TRP: 3, QDL: 4 } as const;
type Sheet = { slug: string; currency: string; minNights: number; deposit: { percent: number; balanceDueDays: number };
  seasons: { season: string; ranges: [string, string][] }[]; sheet: Record<string, Record<string, Partial<Record<"SGL" | keyof typeof OCC, number[]>>>>;
  longStay: { code: string; minNights: number; percent: number }[]; availableFrom?: Record<string, string> };

/** Build the engine's card from a sheet: per room and season, the base occupancy is the largest one priced the same
 *  as a double; the next occupancy above it sets the extra-adult rate. */
export function cardFrom(C: Sheet) {
  const rooms: Record<string, Room> = {};
  const rules: RateCard["rules"] = [];
  for (const [room, bySeason] of Object.entries(C.sheet)) {
    const occs = Object.keys(Object.values(bySeason)[0]).filter((o) => o in OCC) as (keyof typeof OCC)[];
    const max = Math.max(...occs.map((o) => OCC[o]));
    rooms[room] = { id: room, name: room, maxAdults: max, maxChildren: 0, maxOccupancy: max };
    for (const s of C.seasons) {
      const occ = bySeason[s.season];
      const nightly = (o: keyof typeof OCC) => occ[o]![0] / C.minNights;
      const priced = occs.filter((o) => occ[o]).sort((a, b) => OCC[a] - OCC[b]);
      const base = priced.filter((o) => nightly(o) === nightly("DBL")).pop()!;
      const next = priced.find((o) => OCC[o] === OCC[base] + 1);
      s.ranges.forEach(([a, b], k) => {
        const from = C.availableFrom?.[room];
        if (from && b < from) return;
        rules.push({ id: `${room}:${s.season}:${k}`, season: s.season, roomTypeId: room, ratePlanId: "fh", stayStart: from && a < from ? from : a, stayEnd: b,
          baseOccupancy: OCC[base], amountMinor: Math.round(nightly("DBL") * 100), extraAdultMinor: next ? Math.round((nightly(next) - nightly(base)) * 100) : null, minNights: C.minNights });
      });
    }
  }
  const card: RateCard = {
    versionId: `${C.slug}:2026-2027-V1:test`, propertySlug: C.slug, currency: C.currency, status: "published", rules, restrictions: [], taxes: [],
    promotions: C.longStay.map((p) => ({ code: p.code, label: `${p.minNights} nights or more`, type: "percent" as const, value: p.percent * 100, minNights: p.minNights, stacking: "exclusive" as const, approved: true })),
    paymentTerms: { depositPercentBp: C.deposit.percent * 100, balanceDueDaysBeforeArrival: C.deposit.balanceDueDays },
    cancellation: { summary: "As Awasi's sheet states.", tiers: [] },
  };
  return { card, rooms };
}

const add = (d: string, n: number) => new Date(Date.parse(d + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
// A date inside each season, by sheet (Patagonia's shoulder is October, March and April).
const START: Record<string, Record<string, string>> = {
  "awasi-iguazu": { High: "2027-02-01", Shoulder: "2027-05-10" },
  "awasi-mendoza": { High: "2027-02-01", Shoulder: "2027-05-10", "Off-Peak": "2027-07-10" },
  "awasi-patagonia": { High: "2027-02-01", Shoulder: "2027-03-10", "Off-Peak": "2027-06-10" },
};

for (const [file, expected] of [["awasi-iguazu", 50], ["awasi-mendoza", 135], ["awasi-patagonia", 96]] as const) {
  test(`every double, triple and quadruple total on ${file}'s sheet comes back from the engine`, () => {
    const C = JSON.parse(readFileSync(new URL(`../scripts/booking-live/${file}-2026-2027.json`, import.meta.url), "utf8")) as Sheet;
    const { card, rooms } = cardFrom(C);
    let checked = 0;
    for (const [room, bySeason] of Object.entries(C.sheet))
      for (const [season, occ] of Object.entries(bySeason))
        for (const [label, adults] of Object.entries(OCC) as [keyof typeof OCC, number][]) {
          (occ[label] ?? []).forEach((total, i) => {
            const nights = C.minNights + i;
            const q = quote(card, rooms[room], { roomTypeId: room, ratePlanId: "fh", arrival: START[file][season], departure: add(START[file][season], nights), adults, childAges: [], bookingDate: "2026-11-24" });
            assert.equal(q.ok, true, `${room} ${season} ${label} ${nights}n: ${JSON.stringify(q)}`);
            const got = (q as Quote).grandTotalMinor / 100;
            const tol = SHEET_ROUNDING[`${C.slug}:${room}:${season}:${nights}`] ?? 1;
            assert.ok(Math.abs(got - total) <= tol, `${room} ${season} ${label} ${nights} nights: sheet ${total}, engine ${got}`);
            checked++;
          });
        }
    assert.equal(checked, expected);
  });
}

test("Patagonia refuses two nights, and Cenit Villa only sells from 15 December 2026", () => {
  const C = JSON.parse(readFileSync(new URL("../scripts/booking-live/awasi-patagonia-2026-2027.json", import.meta.url), "utf8")) as Sheet;
  const { card, rooms } = cardFrom(C);
  const two = quote(card, rooms.villa, { roomTypeId: "villa", ratePlanId: "fh", arrival: "2027-01-10", departure: "2027-01-12", adults: 2, childAges: [], bookingDate: "2026-11-24" });
  assert.equal(two.ok, false);
  const early = quote(card, rooms["cenit-villa"], { roomTypeId: "cenit-villa", ratePlanId: "fh", arrival: "2026-11-10", departure: "2026-11-13", adults: 2, childAges: [], bookingDate: "2026-11-24" });
  assert.equal(early.ok, false);
});
