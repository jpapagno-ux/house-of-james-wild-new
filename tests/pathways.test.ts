// Wild Pathways: the taxonomy, its tokens and the sample record map.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { IMPACT, PATHWAYS, PATHWAY_LIST, PATHWAY_ORDER, VOLUME_KEYS, pathway, validatePathwayMap, type PathwayRecord } from "../lib/pathways.ts";
import { VOLUME_BRIEF_ID, VOLUME_BY_BRIEF_ID, VOLUME_ORDER, VOLUME_STYLES } from "../lib/volumes.ts";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const WHITE = "#FFFFFF", CARD = "#F6F4F0", INK = "#2D2A26";

test("eight pathways, stable IDs, unique keys, names and accents", () => {
  assert.equal(PATHWAY_ORDER.length, 8);
  assert.deepEqual(PATHWAY_ORDER, PATHWAY_LIST.map((p) => p.id));
  const uniq = (xs: string[]) => new Set(xs).size === xs.length;
  assert.ok(uniq(PATHWAY_LIST.map((p) => p.key)));
  assert.ok(uniq(PATHWAY_LIST.map((p) => p.name)));
  assert.ok(uniq(PATHWAY_LIST.map((p) => p.accent)), "one accent per pathway");
  for (const p of PATHWAY_LIST) {
    assert.match(p.id, /^PATH-0[1-8]$/);
    assert.match(p.key, /^[a-z-]+$/);
    for (const v of p.volumes) assert.ok(v in VOLUME_STYLES, `${p.id} volume ${v}`);
  }
  assert.equal(pathway("PATH-04")?.name, "Where the Wild Lives");
  assert.equal(pathway("between-tides")?.id, "PATH-02");
  assert.equal(pathway("PATH-09"), undefined, "no silent default");
});

test("pathway accents never collide with the impact palette or the house seal", () => {
  const taken = new Set([IMPACT.copy, IMPACT.panel, "#8B2525"]);
  for (const p of PATHWAY_LIST) assert.ok(!taken.has(p.accent), `${p.id} ${p.accent} reused`);
});

test("pathway text variants and impact copy meet WCAG AA on white and on the card tone", () => {
  for (const p of PATHWAY_LIST) {
    assert.ok(contrast(p.text, WHITE) >= 4.5, `${p.id} text on white ${contrast(p.text, WHITE).toFixed(2)}`);
    assert.ok(contrast(p.text, CARD) >= 4.5, `${p.id} text on card ${contrast(p.text, CARD).toFixed(2)}`);
    assert.ok(contrast(p.text, p.tint) >= 4.5, `${p.id} text on its own tint`);
    if (p.onAccent === "white") assert.ok(contrast(WHITE, p.accent) >= 4.5, `${p.id} white on accent`);
    if (p.onAccent === "ink") assert.ok(contrast(INK, p.accent) >= 4.5, `${p.id} ink on accent`);
    if (p.onAccent === "large") assert.ok(Math.max(contrast(WHITE, p.accent), contrast(INK, p.accent)) >= 3, `${p.id} large text on accent`);
  }
  assert.ok(contrast(IMPACT.copy, IMPACT.panel) >= 4.5, "forest on sage");
  assert.ok(contrast(IMPACT.highlight, IMPACT.panel) >= 4.5, "rust on sage");
});

test("globals.css carries the same pathway and impact tokens as lib/pathways.ts", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const p of PATHWAY_LIST) {
    const n = p.id.slice(-2);
    assert.ok(css.includes(`--jw-path-${n}: ${p.accent};`), `${p.id} accent in css`);
    assert.ok(css.includes(`--jw-path-${n}-text: ${p.text};`), `${p.id} text in css`);
    assert.ok(css.includes(`--jw-path-${n}-tint: ${p.tint};`), `${p.id} tint in css`);
    assert.ok(css.includes(`.pathway-${n} {`), `${p.id} scope class`);
  }
  assert.ok(css.includes(`--jw-impact-panel: ${IMPACT.panel};`));
  assert.ok(css.includes(`--jw-impact-copy: ${IMPACT.copy};`));
  // The house root accent is untouched: pages still open in oxblood, volumes still re-tint.
  assert.ok(css.includes(":root { --jw-accent: 139 37 37;"));
  assert.ok(css.includes(".theme-vol-stays {"));
});

test("brief volume IDs alias the six live volumes without renumbering them", () => {
  assert.equal(Object.keys(VOLUME_BRIEF_ID).length, 6);
  for (const k of VOLUME_ORDER) assert.equal(VOLUME_BY_BRIEF_ID[VOLUME_BRIEF_ID[k]], k);
  assert.deepEqual([...VOLUME_KEYS].sort(), [...VOLUME_ORDER].sort(), "pathways.ts mirrors the live volume keys");
  assert.equal(VOLUME_BRIEF_ID.stays, "VOL-01");
  assert.equal(VOLUME_BRIEF_ID.europe, "VOL-06");
  // The approved romans are untouched.
  assert.deepEqual(VOLUME_ORDER.map((k) => VOLUME_STYLES[k].roman), ["I", "II", "III", "IV", "V", "VI"]);
});

test("the sample pathway map is sound and every record is still in the library export", () => {
  const map = JSON.parse(readFileSync(new URL("../lib/content/pathways/pathway-map.json", import.meta.url), "utf8")) as { records: PathwayRecord[] };
  assert.deepEqual(validatePathwayMap(map.records), []);
  assert.ok(map.records.length >= 3 && map.records.length <= 8, "a handful of sample records in Phase 1");
  const stays = JSON.parse(readFileSync(new URL("../lib/content/stays.json", import.meta.url), "utf8")).stays as { slug: string; ledgerId: string | null }[];
  for (const r of map.records) {
    const s = stays.find((x) => x.slug === r.slug);
    assert.ok(s, `${r.slug} in export`);
    assert.equal(s!.ledgerId, r.ledgerId, `${r.slug} Ledger ID agrees with the export`);
    assert.equal(r.classificationStatus, "draft", "Phase 1 records are drafts until James approves");
    assert.ok(r.impact.length > 0, `${r.slug} carries at least one impact statement`);
  }
  const monwana = map.records.find((r) => r.slug === "monwana-thornybush")!;
  assert.ok(monwana.volumes.includes("safaris") && monwana.volumes.includes("stays"), "one property, many volumes");
});

test("the validator catches unsourced and invented impact claims", () => {
  const bad: PathwayRecord = { slug: "x", ledgerId: "STY-2026-000001", primaryPathway: "PATH-01", secondaryPathways: ["PATH-01"], volumes: ["stays"], setting: "", intentions: [], suitability: [], classificationStatus: "draft", classifiedBy: "", impact: [
    { kind: "levy", money: "guest_levy", statement: "10% of every room night funds the village school.", source: null, reviewed: "2026-10-30", status: "partner_reported" },
  ] };
  const errs = validatePathwayMap([bad]);
  assert.ok(errs.some((e) => /repeated as secondary/.test(e)));
  assert.ok(errs.some((e) => /names no source/.test(e)));
  assert.ok(errs.some((e) => /quotes a figure/.test(e)));
  assert.ok(Object.keys(PATHWAYS).length === 8);
});

test("Phase 2A: the library export wins, the override file fills gaps, and bad library values are ignored", async () => {
  const { mergeRecords } = await import("../lib/pathways.ts");
  const override: PathwayRecord = { slug: "a", ledgerId: "STY-2026-000001", primaryPathway: "PATH-01", secondaryPathways: ["PATH-02"], volumes: ["stays"], setting: "rainforest", intentions: ["canopy"], suitability: ["couples"], classificationStatus: "draft", classifiedBy: "house draft", impact: [{ kind: "habitat", money: "none", statement: "x", source: "y", reviewed: "2026-10-30", status: "partner_reported" }] };
  const libStay = { slug: "a", ledgerId: "STY-2026-000001", pathway: { primary: "PATH-04", secondary: ["PATH-04", "PATH-09", "PATH-08"], setting: null, intentions: [], suitability: ["families"], status: "approved" as const, classifiedBy: "James", classifiedAt: "2026-11-02" }, volumes: ["safaris", "bogus"] };
  const unclassified = { slug: "b", ledgerId: "STY-2026-000002", pathway: null, volumes: ["stays"] };
  const [a] = mergeRecords([libStay, unclassified], [override]);
  assert.equal(a.primaryPathway, "PATH-04", "library primary wins");
  assert.deepEqual(a.secondaryPathways, ["PATH-08"], "unknown IDs and the primary are dropped");
  assert.equal(a.classificationStatus, "approved");
  assert.deepEqual(a.volumes, ["safaris"], "unknown volume keys dropped");
  assert.equal(a.setting, "rainforest", "override fills an empty setting");
  assert.deepEqual(a.suitability, ["families"], "library suitability kept when present");
  assert.equal(a.impact.length, 1, "override impact used until ImpactNote records exist");
  assert.equal(mergeRecords([unclassified], []).length, 0, "an unclassified stay is not a pathway record");
  const lib = mergeRecords([libStay], [override], { a: [{ kind: "levy", money: "guest_levy", statement: "z", source: "s", reviewed: "2026-11-01", status: "verified" }] });
  assert.equal(lib[0].impact[0].kind, "levy", "library impact notes replace the override's");
});

test("Phase 2C: the pathways flag is off unless exactly 'on', and every pathway has house copy", async () => {
  const { readPathwaysFlag } = await import("../lib/content/pathways/flag.ts");
  assert.equal(readPathwaysFlag({}), false);
  assert.equal(readPathwaysFlag({ NEXT_PUBLIC_PATHWAYS: "true" }), false);
  assert.equal(readPathwaysFlag({ NEXT_PUBLIC_PATHWAYS: "on" }), true);
  const { PATHWAY_ANSWER, PATHWAY_FAQS } = await import("../lib/content/pathways/copy.ts");
  for (const p of PATHWAY_LIST) {
    assert.ok(PATHWAY_ANSWER[p.id].length > 120, `${p.id} answer`);
    assert.ok(PATHWAY_FAQS[p.id].length >= 2, `${p.id} faqs`);
    assert.ok(!/James (said|says|told)|"/.test(PATHWAY_ANSWER[p.id]), `${p.id} copy never quotes James`);
  }
});

test("Phase 2G: every pathway has an SEO title and description within search limits, and a keyword entry", async () => {
  const { PATHWAY_SEO } = await import("../lib/content/pathways/copy.ts");
  const kw = JSON.parse(readFileSync(new URL("../data/seo-keywords.json", import.meta.url), "utf8")).pages as Record<string, { targets: string[] }>;
  for (const p of PATHWAY_LIST) {
    const seo = PATHWAY_SEO[p.id];
    assert.ok(seo.title.startsWith(p.name), `${p.id} title leads with the pathway name`);
    assert.ok(seo.title.length <= 95, `${p.id} title length ${seo.title.length}`);
    assert.ok(seo.description.length >= 120 && seo.description.length <= 158, `${p.id} description length ${seo.description.length}`);
    assert.ok(kw[`/pathways/${p.key}`]?.targets.length >= 3, `${p.id} has keyword targets`);
  }
});

test("Phase 2E: Ledger chips resolve only for approved records", async () => {
  const { mergeRecords } = await import("../lib/pathways.ts");
  const lib = [{ slug: "ok", ledgerId: "STY-2026-000010", pathway: { primary: "PATH-02", secondary: [], setting: null, intentions: [], suitability: [], status: "approved" as const, classifiedBy: "James", classifiedAt: "2026-10-30" }, volumes: ["stays"] },
    { slug: "draft", ledgerId: "STY-2026-000011", pathway: { primary: "PATH-02", secondary: [], setting: null, intentions: [], suitability: [], status: "draft" as const, classifiedBy: "iggi-draft", classifiedAt: "2026-10-30" }, volumes: ["stays"] }];
  const recs = mergeRecords(lib, []);
  assert.equal(recs.find((r) => r.slug === "ok")?.classificationStatus, "approved");
  assert.equal(recs.find((r) => r.slug === "draft")?.classificationStatus, "draft", "drafts stay drafts; the Ledger pages filter them out via pathwayStays()");
});

// Phase 2B: voyages and routes on the pathways (trip-map.json).
test("2B trip map: every entry is a live trip with real pathways and volumes; nothing approved without James", () => {
  const tm = JSON.parse(readFileSync(new URL("../lib/content/pathways/trip-map.json", import.meta.url), "utf8")).records as { slug: string; kind: string; primary: string; secondary: string[]; volumes: string[]; status: string; classifiedBy: string; why: string }[];
  const trips = new Set(readdirSync(new URL("../lib/content/trips/", import.meta.url)).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
  assert.ok(tm.length >= 11);
  for (const e of tm) {
    assert.ok(trips.has(e.slug), `${e.slug} is a trip`);
    assert.ok(PATHWAYS[e.primary as keyof typeof PATHWAYS], `${e.slug} primary`);
    for (const s of e.secondary) { assert.ok(PATHWAYS[s as keyof typeof PATHWAYS]); assert.notEqual(s, e.primary); }
    assert.ok(e.volumes.includes(e.kind === "voyage" ? "voyages" : "overland"), `${e.slug} sits in its own volume`);
    assert.ok(e.why.length > 20, `${e.slug} has a reason`);
    if (e.status === "approved") assert.match(e.classifiedBy, /James/, `${e.slug}: only James approves`);
  }
});

// The apply batch (scripts/data/pathway-apply.json) is the audit trail of what the site writes to the library.
test("pathway-apply batch: valid ids, pathway ids and snake_case settings only", () => {
  const b = JSON.parse(readFileSync(new URL("../scripts/data/pathway-apply.json", import.meta.url), "utf8")) as { by: string; records: Record<string, unknown>[] };
  assert.match(b.by, /James Papagno/);
  const allowed = new Set(["id", "slug", "house_volumes", "primary_pathway", "secondary_pathways", "pathway_setting", "pathway_intentions", "pathway_suitability", "pathway_status", "pathway_classified_by", "pathway_classified_at"]);
  for (const r of b.records) {
    assert.match(String(r.id), /^[0-9a-f]{24}$/);
    for (const k of Object.keys(r)) assert.ok(allowed.has(k), `${r.slug}: field ${k}`);
    if (r.pathway_setting) assert.match(String(r.pathway_setting), /^[a-z0-9_]+$/, `${r.slug}: setting`);
    for (const s of (r.secondary_pathways as string[] | undefined) ?? []) assert.ok(PATHWAYS[s as keyof typeof PATHWAYS], `${r.slug}: ${s}`);
  }
});

test("workflows parse as YAML (a bad file fails at startup with no log)", () => {
  // No YAML parser in the test runner: catch the one shape that bit us, an unquoted
  // `key: value` colon inside a plain-scalar `run:` line.
  for (const f of ["pathway-apply.yml", "library-sync.yml"]) {
    const y = readFileSync(new URL(`../.github/workflows/${f}`, import.meta.url), "utf8");
    for (const line of y.split("\n")) {
      const m = line.match(/^\s*run:\s+(\S.*)$/);
      if (m && m[1] !== "|" && /:\s/.test(m[1])) assert.fail(`${f}: unquoted colon in plain-scalar run line: ${line.trim()}`);
    }
  }
});
