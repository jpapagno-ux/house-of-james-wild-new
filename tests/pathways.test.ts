// Wild Pathways: the taxonomy, its tokens and the sample record map.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.ok(map.records.length >= 3 && map.records.length <= 5, "three to five sample records in Phase 1");
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
