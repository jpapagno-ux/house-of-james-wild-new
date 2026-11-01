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

// 1 Nov 2026: the engine wraps each plan in an <article data-sentry-component="RateCard">
// whose <h2> names it; other properties name plans freely (Kayumanis, Le Quartier).
const articles = `<div>nav</div>
<article class="x" data-sentry-component="RateCard" data-sentry-source-file="RateCard.tsx"><h2 class="t">Non-Refundable Rate – Best Value</h2><h3>One Bedroom Private Pool Villa</h3><span>$1,452.00</span><h3>Three Bedroom Owner's Pool</h3>$2,910.00<h3>One Bedroom Private Pool Villa</h3>$1,452.00</article>
<article data-sentry-component="RateCard"><h2>Flexible Rate – Kayumanis Ubud</h2><h3>One Bedroom Private Pool Villa</h3>$1,700.00</article>
<h3>properties in our collection</h3><article data-sentry-component="RateCard"><h2>Elsewhere</h2><h3>Other</h3>$1.00</article>`;

test("reads plans from RateCard articles by their h2, de-duplicated, stopping at the footer", () => {
  const p = parseEngine(articles);
  assert.deepEqual(p.map((x) => x.plan), ["Non-Refundable Rate – Best Value", "Flexible Rate – Kayumanis Ubud"]);
  assert.deepEqual(p[0].rooms.map((r) => [r.name, r.total]), [["One Bedroom Private Pool Villa", 1452], ["Three Bedroom Owner's Pool", 2910]]);
  assert.deepEqual(p[1].rooms, [{ name: "One Bedroom Private Pool Villa", total: 1700, display: "$1,700.00" }]);
});

test("a page without RateCard articles still parses by the fixed plan names", () => {
  assert.deepEqual(parseEngine(html).map((x) => x.plan), ["Length of Stay Discount", "Best Available Rate"]);
});
