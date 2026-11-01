import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Destination cards (James, 1 Nov 2026, Sri Lanka first): a country with no stay pages gets a page
// when its library record is live, approved and AEO-approved. scripts/export-countries.py is run on
// a fixture in a scratch copy of the repo layout, so the real countries-library.json is untouched.
const ROOT = new URL("..", import.meta.url).pathname;

function runExport(destinations: object[]) {
  const dir = mkdtempSync(join(tmpdir(), "cards-"));
  mkdirSync(join(dir, "scripts"));
  mkdirSync(join(dir, "lib/content"), { recursive: true });
  cpSync(join(ROOT, "scripts/export-countries.py"), join(dir, "scripts/export-countries.py"));
  writeFileSync(join(dir, "lib/content/stays.json"), JSON.stringify({ stays: [] }));
  writeFileSync(join(dir, "lib/content/regions.json"), JSON.stringify({ regions: [{ slug: "asia", name: "Asia" }] }));
  writeFileSync(join(dir, "dest.json"), JSON.stringify({ entities: destinations }));
  execFileSync("python3", ["-I", join(dir, "scripts/export-countries.py"), join(dir, "dest.json")], { stdio: "pipe" });
  return JSON.parse(readFileSync(join(dir, "lib/content/countries-library.json"), "utf8")).countries as Record<string, unknown>[];
}

const card = {
  name: "Testland", webflow_slug: "testland", region_slug: "asia", ledger_id: "DST-2026-999999",
  site_status: "live", content_status: "approved", aeo_approved: true, featured_image_url: null,
  leading_description: "A test island.", section_1_subtitle: "Two coasts", section_1_title: "Two Coasts", section_1_description: "One paragraph.", section_1_image: null,
  fact_blocks: {
    best_months: "West coast: December to March, calm seas. East coast: April to November, the other monsoon.",
    how_to_get_there: "Fly into Testland International Airport (TST), 30 km from the capital.",
  },
  faq_blocks: [{ question: "When?", answer: "It depends on the coast." }],
};

test("a live, reviewed country with no stays is exported as a destination card", () => {
  const [c] = runExport([card]);
  assert.equal(c.slug, "testland");
  assert.equal(c.staysComing, true);
  assert.deepEqual(c.hero, { src: null, alt: "Testland, Asia" }); // no stand-in photograph
  assert.deepEqual(c.airports, [["Testland International Airport (TST)", "The main international gateway"]]);
  assert.equal(c.flyInto, "TST");
  assert.equal(c.bestShort, "Year-round"); // the two coasts' seasons cover all twelve months
  const months = c.months as { area: string; months: string[] }[];
  assert.deepEqual(months.map((m) => m.area), ["West coast", "East coast"]);
  assert.equal(months[0].months.filter((m) => m === "best").length, 4);
  assert.equal((c.faqs as unknown[]).length, 1);
});

test("unreviewed, coming-soon and place records are not exported as cards", () => {
  const out = runExport([
    { ...card, webflow_slug: "draftland", content_status: "none" },
    { ...card, webflow_slug: "hiddenland", site_status: "coming_soon" },
    { ...card, webflow_slug: "placeland", parent_destination_id: "abc" },
  ]);
  assert.deepEqual(out, []);
});

test("a best-months note that is not written by area keeps a single band", () => {
  const [c] = runExport([{ ...card, fact_blocks: { ...card.fact_blocks, best_months: "Dry season November to April. Rain from May." } }]);
  const months = c.months as { area: string }[];
  assert.deepEqual(months.map((m) => m.area), ["Across Testland"]);
  assert.equal(c.bestShort, "Nov–Apr");
});
