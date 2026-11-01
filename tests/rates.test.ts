import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEngine, parseQuery, engineUrl, nightsBetween } from "../lib/rates.ts";

// Shape of the live engine page (25 Oct 2026): the Length of Stay plan comes
// first, then Best Available Rate; rooms repeat for mobile and desktop.
const html = `<div>Length of Stay Discount <p>15% off</p><h3 class="x">Studio Room</h3><span>$4,770.84</span><h3>Terroir Cottage</h3>$7,540.98<h3>Studio Room</h3>$4,770.84</div>
<div>Best Available Rate<h3>Studio Room</h3><b>$5,612.73</b><h3>Terroir Cottage</h3>$8,871.75</div><footer>properties in our collection</footer><h3>Elsewhere</h3>$1.00`;

test("parses both plans in page order, de-duplicated, stopping at the footer", () => {
  const p = parseEngine(html);
  assert.deepEqual(p.map((x) => x.plan), ["Length of Stay Discount", "Best Available Rate"]);
  assert.deepEqual(p[0].rooms.map((r) => [r.name, r.total]), [["Studio Room", 4770.84], ["Terroir Cottage", 7540.98]]);
  assert.equal(p[1].rooms[0].total, 5612.73);
  assert.ok(!p.flatMap((x) => x.rooms).some((r) => r.name === "Elsewhere"));
});
test("validates queries and builds the engine link", () => {
  assert.equal(typeof parseQuery(new URLSearchParams("property=../x&checkIn=2026-12-08&checkOut=2026-12-11")), "string");
  const q = parseQuery(new URLSearchParams("property=leeu-estates-resorts&checkIn=2026-12-08&checkOut=2026-12-11&adults=2"));
  assert.ok(typeof q !== "string");
  if (typeof q !== "string") assert.match(engineUrl(q), /leeu-estates-resorts\?checkIn=2026-12-08&checkOut=2026-12-11&adults=2/);
  assert.equal(nightsBetween("2026-12-08", "2026-12-11"), 3);
});

test("reads plan names from the engine's plan headings (Kayumanis, 1 Nov 2026)", () => {
  const k = `<h2 class="text-xl font-bold">NON REFUNDABLE</h2><p>enjoy exceptional savings</p><h3 class="x">One Bedroom Private Pool Villa</h3><span>$1,392.00</span><h3>One Bedroom Honeymoon Suite</h3>$2,910.00
<h2 class="text-xl font-bold">Flexible Rate – Kayumanis Nusa Dua</h2><h3>One Bedroom Private Pool Villa</h3>$1,600.00<footer>properties in our collection</footer>`;
  const p = parseEngine(k);
  assert.deepEqual(p.map((x) => x.plan), ["Non Refundable", "Flexible Rate – Kayumanis Nusa Dua"]);
  assert.deepEqual(p[0].rooms.map((r) => r.total), [1392, 2910]);
  assert.equal(p[1].rooms[0].total, 1600);
});
test("accepts the Jimbaran engine address with its trailing hyphen", () => {
  const q = parseQuery(new URLSearchParams("property=kayumanis-jimbaran-private-estates-&checkIn=2027-02-10&checkOut=2027-02-13"));
  assert.ok(typeof q !== "string");
});
