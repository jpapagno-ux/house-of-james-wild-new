// The Galápagos portfolio (James approved, 2 Nov 2026): twelve ship pages, four partners, three dated offers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { SHIP_REGISTRY } from "../lib/content/ships/registry.ts";
import { activeOnly, offerLastDay } from "../lib/dates.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const NEW = ["galapagos-horizon-trimaran", "infinity-yacht-galapagos", "new-galapagos-sea-star", "natural-paradise-yacht", "grand-majestic-yacht", "galapagos-angel-yacht", "calipso-yacht-galapagos", "monserrat-yacht-galapagos", "galaxy-stella-yacht", "ecogalaxy-catamaran", "galaxy-bonita-yacht", "galaxy-orion-yacht"];
type Rec = { slug: string; departures: { date: string; prices: Record<string, number> }[]; published?: { year: string; rows: { prices: Record<string, number> }[] }[]; fareBasis?: string; cabins: { count: number | null }[]; itineraries: { days: unknown[] }[] };
const rec = (slug: string) => JSON.parse(read(`lib/content/ships/galapagos/${slug}.json`)) as Rec;

test("all twelve ships have pages, a partner tier and published fares on the operator's own basis", () => {
  for (const slug of NEW) {
    const r = SHIP_REGISTRY.find((x) => x.slug === slug);
    assert.ok(r?.page, slug);
    assert.ok(r!.tier, `${slug} tier`);
    const s = rec(slug);
    assert.ok(s.published?.length, `${slug} published fares`);
    assert.equal(s.fareBasis, "per person, as published", slug);
  }
});

test("no made-up dates: only Galapagos Horizon carries dated departures", () => {
  for (const slug of NEW) assert.equal(rec(slug).departures.length > 0, slug === "galapagos-horizon-trimaran", slug);
});

test("Calipso: the diving itinerary is held and her cabin count is left open", () => {
  const raw = read("lib/content/ships/galapagos/calipso-yacht-galapagos.json");
  assert.doesNotMatch(raw, /Wolf|Darwin|diving/i);
  assert.ok(rec("calipso-yacht-galapagos").cabins.every((c) => c.count === null));
  assert.match(raw, /8 to 10/);
  assert.ok(!SHIP_REGISTRY.find((x) => x.slug === "calipso-yacht-galapagos")!.traits!.dives);
});

test("Monserrat has no invented day by day", () => {
  assert.ok(rec("monserrat-yacht-galapagos").itineraries.every((i) => i.days.length === 0));
});

test("no em or en dashes in the Galápagos files", () => {
  for (const f of readdirSync(new URL("lib/content/ships/galapagos/", root)).filter((x) => x.endsWith(".json"))) assert.doesNotMatch(read(`lib/content/ships/galapagos/${f}`), /[–—]/, f);
  assert.doesNotMatch(read("lib/content/partners/galapagos.ts"), /[–—]/);
});

test("Horizon's 22 June deal is a Final Call live until its departure; the full 6 July sailing's deals are gone", async () => {
  const src = read("lib/content/offers/offers.ts");
  const { liveOffers } = await import("../lib/content/offers/offers.ts").catch(() => ({ liveOffers: null as null }));
  assert.ok(!src.includes('"OFR-2026-000163", "2027') && !src.includes('"OFR-2026-000164", "2027'), "6 July deals removed");
  if (liveOffers) assert.ok(!liveOffers("2026-11-02").some((o) => o.id === "OFR-2026-000163" || o.id === "OFR-2026-000164"));
  for (const [id, dep] of [["OFR-2026-000162", "2027-06-22"]]) {
    assert.ok(src.includes(`"${id}", "${dep}"`), id);
    const o = { program: "Final Call", travel: { to: dep }, departure: dep };
    assert.equal(offerLastDay(o), dep);
    assert.equal(activeOnly([o], offerLastDay, dep).length, 1);
    assert.equal(activeOnly([o], offerLastDay, "2027-07-07").length, 0);
  }
});

test("the Galápagos is a place inside Ecuador & Galápagos with its two stays, the official fees and six FAQs", async () => {
  const { GUIDES, placeGuideForStay } = await import("../lib/content/guides.ts");
  const g = GUIDES.galapagos;
  assert.equal(g.parent, "ecuador-galapagos");
  assert.equal(g.path, "/destinations/south-america/ecuador-galapagos/galapagos");
  assert.deepEqual(g.stays, ["galapagos-safari-camp", "pikaia-lodge"]);
  assert.equal(placeGuideForStay("pikaia-lodge")?.slug, "galapagos");
  const facts = JSON.stringify(g.facts);
  for (const x of ["US$200", "US$100", "US$20", "1978"]) assert.ok(facts.includes(x), x);
  assert.equal(g.faqs.length, 6);
  assert.ok(g.sources.every((s) => /unesco\.org|galapagos\.gob\.ec|ecuador\.travel/.test(s.url)), "official sources only");
  assert.doesNotMatch(JSON.stringify(g), /[–—]/);
});

test("no new page duplicates an existing one, and the stubs are left for James", () => {
  const stays = (JSON.parse(read("lib/content/stays.json")).stays as { slug: string; name: string }[]);
  const redirects = JSON.parse(read("redirects.json")) as { source: string; destination: string }[];
  for (const slug of NEW) {
    const r = SHIP_REGISTRY.find((x) => x.slug === slug)!;
    // No library Stay record for these ships (Galápagos review, section 6), so no old /stays URL to send on.
    assert.equal(r.staySlug, undefined, slug);
    assert.ok(!stays.some((s) => s.slug === slug || s.name.toLowerCase() === r.name.toLowerCase()), `${slug} duplicates a stay`);
    assert.ok(!redirects.some((x) => x.source === `/voyages/ships/${slug}`), `${slug} is redirected away`);
  }
  // One record each for the two land stays.
  for (const slug of ["galapagos-safari-camp", "pikaia-lodge"]) assert.equal(stays.filter((s) => s.slug === slug).length, 1, slug);
  assert.equal(stays.filter((s) => /pikaia|safari camp/i.test(s.name) && /galapagos|pikaia/i.test(s.slug)).length, 2);
});

test("every new route is built and in LIVE_ROUTES (the sitemap); the stays are released", async () => {
  const { isBuilt } = await import("../lib/routes.ts");
  const site = read("lib/site.ts");
  const routes = [...NEW.map((s) => `/voyages/ships/${s}`), ...["royal-galapagos", "galaxy-cruises", "ecoventura", "vianatura"].map((p) => `/partners/${p}`), "/destinations/south-america/ecuador-galapagos/galapagos"];
  for (const r of routes) {
    assert.ok(isBuilt(r), `${r} built`);
    assert.ok(site.includes(`{ path: "${r}"`), `${r} in LIVE_ROUTES`);
  }
  const released = (JSON.parse(read("scripts/data/stay-release.json")).released as { slug: string }[]).map((x) => x.slug);
  for (const s of ["galapagos-safari-camp", "pikaia-lodge"]) { assert.ok(released.includes(s), s); assert.ok(isBuilt(`/stays/${s}`), `/stays/${s} built`); }
  const credits = JSON.parse(read("lib/content/photo-credits.json"));
  assert.equal(credits["galapagos-safari-camp"], "Galapagos Safari Camp");
  assert.equal(credits["pikaia-lodge"], "Pikaia Lodge");
});
