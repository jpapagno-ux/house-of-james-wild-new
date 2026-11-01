// The Compass → Wild Pathways adapter: explainable, safe, and faithful to the taxonomy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CRUX_HREF, PATHWAY_NAMES, SETTING_TO_PATHWAY, fitsSeason, readPathways, suitabilityFrom } from "../lib/compass/pathway-adapter.ts";
import { PATHWAYS, type PathwayRecord } from "../lib/pathways.ts";

const MAP = JSON.parse(readFileSync(new URL("../lib/content/pathways/pathway-map.json", import.meta.url), "utf8")).records as PathwayRecord[];
const withVerdict = (slug: string) => ["leeu-estates", "monwana-thornybush", "tengile-mala-mala-kirkmans-kamp", "tswalu-reserve"].includes(slug);
const RECORDS = MAP.map((r) => ({ ...r, hasVerdict: withVerdict(r.slug), bestMonths: r.slug === "tswalu-reserve" ? "April to October" : "Year-round" }));

test("adapter vocabulary mirrors the taxonomy", () => {
  for (const [id, p] of Object.entries(PATHWAYS)) assert.equal(PATHWAY_NAMES[id as keyof typeof PATHWAY_NAMES], p.name);
  assert.equal(new Set(Object.values(SETTING_TO_PATHWAY)).size, 8, "every setting maps to its own pathway");
});

test("drafts are excluded unless asked for, and every fit is explained", () => {
  assert.equal(readPathways({ settings: ["wildlife"] }, RECORDS).fits.length, 0, "Phase 1 records are drafts");
  const out = readPathways({ settings: ["heritage"], party: "couple" }, RECORDS, { includeDrafts: true });
  assert.ok(out.fits.length > 0);
  for (const f of out.fits) {
    assert.ok(f.reasons.length > 0, `${f.slug} has reasons`);
    assert.equal(f.pathways[0], f.primaryPathway);
    assert.ok(f.score > 0);
    assert.ok(/^STY-\d{4}-\d{6}$/.test(f.ledgerId ?? ""), `${f.slug} keeps its Ledger ID`);
  }
  assert.equal(out.fits[0].slug, "leeu-estates", "primary pathway outranks a secondary");
  assert.match(out.explain, /Rooted in Place/);
});

test("a pure safari reading hands off to Crux; a mixed one does not", () => {
  const safari = readPathways({ settings: ["wildlife"] }, RECORDS, { includeDrafts: true });
  assert.equal(safari.handoff?.to, "crux");
  assert.equal(safari.handoff?.href, CRUX_HREF);
  assert.ok(safari.fits.length > 0, "the Ledger's safari stays are still listed for context");
  assert.equal(readPathways({ settings: ["wildlife", "hidden"] }, RECORDS, { includeDrafts: true }).handoff, null);
  assert.equal(readPathways({}, RECORDS, { includeDrafts: true }).handoff, null);
});

test("conservation and culture axes only credit what is documented or classified", () => {
  const out = readPathways({ conservation: true, culture: true }, RECORDS, { includeDrafts: true });
  const tswalu = out.fits.find((f) => f.slug === "tswalu-reserve")!;
  assert.ok(tswalu.impactDocumented);
  assert.ok(tswalu.reasons.some((r) => r.kind === "conservation"));
  assert.ok(!tswalu.reasons.some((r) => r.kind === "culture"), "Tswalu is not on Rooted in Place");
  const leeu = out.fits.find((f) => f.slug === "leeu-estates")!;
  assert.ok(leeu.reasons.some((r) => r.kind === "culture"));
  // A verdict is a tie-break, never the reason a stay appears.
  assert.ok(out.fits.every((f) => !f.fieldVerdict || f.reasons.some((r) => r.kind !== "verdict")));
});

test("season reads the Ledger's own best-months words", () => {
  assert.equal(fitsSeason("April to October", "dry"), true);
  assert.equal(fitsSeason("April to October", "green"), true);
  assert.equal(fitsSeason("December to March", "green"), false);
  assert.equal(fitsSeason(null, "dry"), null);
  assert.equal(fitsSeason("anything", "any"), null);
  const dry = readPathways({ settings: ["wildlife"], season: "dry" }, RECORDS, { includeDrafts: true });
  assert.ok(dry.fits.find((f) => f.slug === "tswalu-reserve")!.reasons.some((r) => r.kind === "season"));
});

test("the limit holds and ordering is stable", () => {
  const a = readPathways({ settings: ["wildlife", "heritage", "wellness"], party: "family" }, RECORDS, { includeDrafts: true, limit: 2 });
  assert.equal(a.fits.length, 2);
  const b = readPathways({ settings: ["wildlife", "heritage", "wellness"], party: "family" }, RECORDS, { includeDrafts: true, limit: 2 });
  assert.deepEqual(a.fits.map((f) => f.slug), b.fits.map((f) => f.slug));
});

test("naming a setting gates the shortlist to its pathways; other axes only rank within", () => {
  const recs: PathwayRecord[] = [
    { slug: "mountain-lodge", ledgerId: null, primaryPathway: "PATH-03", secondaryPathways: [], volumes: ["stays"], setting: "", intentions: [], suitability: [], classificationStatus: "approved", classifiedBy: "", impact: [] },
    { slug: "safari-camp", ledgerId: null, primaryPathway: "PATH-04", secondaryPathways: [], volumes: ["stays"], setting: "", intentions: [], suitability: ["friends", "couples"], classificationStatus: "approved", classifiedBy: "", impact: [{ kind: "conservation", status: "verified", statement: "x", source: "y", reviewedDate: "2026-10-01" } as unknown as PathwayRecord["impact"][number]] },
  ];
  const out = readPathways({ settings: ["mountain"], party: "friends", conservation: true }, recs);
  assert.deepEqual(out.fits.map((f) => f.slug), ["mountain-lodge"], "a better-documented camp off the pathway never outranks the pathway");
  assert.ok(readPathways({ party: "friends" }, recs).fits.some((f) => f.slug === "safari-camp"), "with no setting named, every axis may answer");
});

test("the whole Ledger answers: suitability widens from best-for, founder marks only tie-break, and no country takes the shortlist", () => {
  assert.deepEqual(suitabilityFrom(["honeymoon", "group_exclusive_use"], ["photographers"]).sort(), ["couples", "exclusive_use", "families", "honeymoon", "photographers", "private_groups"]);
  const many: PathwayRecord[] & { country?: string | null; founderMark?: string | null }[] = Array.from({ length: 12 }, (_, i) => ({
    slug: `camp-${String.fromCharCode(97 + i)}`, ledgerId: null, primaryPathway: "PATH-04" as const, secondaryPathways: [], volumes: ["stays" as const], setting: "", intentions: [], suitability: [],
    classificationStatus: "approved" as const, classifiedBy: "", impact: [], country: i < 8 ? "Botswana" : "Kenya", founderMark: i === 7 ? "founder_returned" : "unclassified",
  }));
  const out = readPathways({ settings: ["wildlife"] }, many, { limit: 5 });
  const countries = out.fits.map((f) => many.find((m) => m.slug === f.slug)!.country);
  assert.equal(countries.filter((c) => c === "Kenya").length, 2, "Kenya gets its two before Botswana fills the rest");
  assert.equal(countries.filter((c) => c === "Botswana").length, 3, "the cap lifts only once every country has had its turn");
  assert.equal(out.fits[0].slug, "camp-h", "the founder mark breaks the tie, and only the tie");
  assert.ok(out.fits.every((f) => f.reasons.some((r) => r.kind === "pathway")), "a founder mark alone never earns a place");
});
