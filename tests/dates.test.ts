// The one date rule (lib/dates.ts): nothing past its date shows. Every test
// passes a fixed "today" so the results never depend on when they run.
import { test } from "node:test";
import assert from "node:assert/strict";
import { activeGroups, activeOnly, departureEnd, endOf, isPast, nextDate, today, withActiveDepartures } from "../lib/dates.ts";
import { fromPrice, cabinFrom, priceLine, type ShipDeparture, type ShipRecord } from "../lib/content/ships/types.ts";
import NileAdventurer from "../lib/content/ships/nile/nile-adventurer.json" with { type: "json" };

const ON = "2026-11-01";

test("today is the house's date (New York), not UTC", () => {
  // 03:30 UTC on 2 Nov is still 1 Nov in New York.
  assert.equal(today(new Date("2026-11-02T03:30:00Z")), "2026-11-01");
  assert.equal(today(new Date("2026-11-02T03:30:00Z"), "UTC"), "2026-11-02");
});

test("endOf reads ISO days, months, years, timestamps and display dates", () => {
  assert.equal(endOf("2027-03-14"), "2027-03-14");
  assert.equal(endOf("2027-02"), "2027-02-28");
  assert.equal(endOf("2028-02"), "2028-02-29");
  assert.equal(endOf("2027"), "2027-12-31");
  assert.equal(endOf("2027-01-08T12:00:00-05:00"), "2027-01-08");
  assert.equal(endOf("22 May 2027 · Bali to Komodo"), "2027-05-22");
  assert.equal(endOf("3 June 2027"), "2027-06-03");
  assert.equal(endOf("August 2027"), "2027-08-31");
  assert.equal(endOf("dates to confirm"), null);
  assert.equal(endOf(null), null);
});

test("isPast: yesterday is past, today and later are not, undated never is", () => {
  assert.equal(isPast("2026-10-31", ON), true);
  assert.equal(isPast("2026-11-01", ON), false);
  assert.equal(isPast("2026-12-01", ON), false);
  assert.equal(isPast("2026-10", ON), true);
  assert.equal(isPast("2026-11", ON), false);
  assert.equal(isPast(null, ON), false);
  assert.equal(isPast("to be announced", ON), false);
});

test("activeOnly keeps what has not ended", () => {
  const items = [{ id: "a", to: "2026-10-30" }, { id: "b", to: "2026-11-01" }, { id: "c", to: null }];
  assert.deepEqual(activeOnly(items, (x) => x.to, ON).map((x) => x.id), ["b", "c"]);
});

const dep = (date: string, dateTo: string | null, price: number): ShipDeparture => ({ date, dateTo, itinerary: "4 nights", direction: "Luxor to Aswan", status: null, prices: { "Standard Cabin": price } });

test("a departure ends on dateTo if it has one; a band under way stays", () => {
  assert.equal(departureEnd({ date: "2026-10-01", dateTo: "2026-11-30" }), "2026-11-30");
  assert.equal(departureEnd({ date: "2026-10-01" }), "2026-10-01");
  const ship = { departures: [dep("2026-09-01", "2026-10-31", 1000), dep("2026-10-01", "2026-11-30", 2000), dep("2026-10-20", null, 1500), dep("2027-01-10", null, 3000)] };
  const left = withActiveDepartures(ship, ON).departures;
  assert.deepEqual(left.map((d) => d.date), ["2026-10-01", "2027-01-10"]);
});

test("'from' prices come only from remaining departures", () => {
  const ship = { departures: [dep("2026-10-20", null, 900), dep("2026-12-01", null, 1800), dep("2027-02-01", null, 2400)] } as Pick<ShipRecord, "departures">;
  assert.equal(fromPrice(ship), 900); // as filed
  const live = withActiveDepartures(ship, ON);
  assert.equal(fromPrice(live), 1800);
  assert.equal(cabinFrom(live, "Standard Cabin"), 1800);
  assert.equal(priceLine(live).amount, "US$1,800");
});

test("a ship with no dates left says new dates are to be announced", () => {
  const gone = withActiveDepartures({ departures: [dep("2026-09-01", "2026-10-31", 1000)] }, ON);
  assert.equal(gone.departures.length, 0);
  const p = priceLine(gone);
  assert.equal(p.kind, "tba");
  assert.equal(p.amount, "To be announced");
});

test("a past departure injected into a real ship file (Nile Adventurer) is hidden", () => {
  const filed = NileAdventurer as unknown as ShipRecord;
  const injected = { ...filed, departures: [dep("2026-03-01", "2026-04-30", 1), ...filed.departures] };
  const live = withActiveDepartures(injected, ON);
  assert.equal(live.departures.some((d) => d.date === "2026-03-01"), false);
  assert.equal(live.departures.length, filed.departures.length);
  assert.notEqual(fromPrice(live), 1);
});

test("voyage sailing groups drop past sailings, and empty groups go", () => {
  const groups = [
    { name: "Komodo", sailings: [{ date: "22 May 2026 · Bali to Komodo", price: 4000 }, { date: "15 September 2027", price: 3400 }] },
    { name: "Spice Islands", sailings: [{ date: "10 October 2026", price: 6000 }] },
  ];
  const left = activeGroups(groups, ON);
  assert.deepEqual(left.map((g) => g.name), ["Komodo"]);
  assert.deepEqual(left[0].sailings.map((s) => s.price), [3400]);
});

test("nextDate is the first date still to come", () => {
  const items = [{ d: "2026-10-01" }, { d: "2027-02-01" }, { d: "2026-12-05" }];
  assert.equal(nextDate(items, (x) => x.d, ON), "2026-12-05");
  assert.equal(nextDate([{ d: "2026-01-01" }], (x) => x.d, ON), null);
});
