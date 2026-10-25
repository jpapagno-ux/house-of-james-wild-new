import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// House wording rule (James, 25 Oct 2026): the 1982 date is always
// "Exploring since 1982" (the seal's "Journey design since 1982" is the one
// exception). Never "established", "founded" or a bare "Since 1982" label.
const BAD = [/\b(established|founded|est\.)\s*(in\s*)?1982/i, /·\s*Since 1982/, /Established["', ]+1982/i];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : /\.(tsx?|txt|json)$/.test(f) ? [p] : []; });
}

test("1982 is always 'Exploring since 1982'", () => {
  const hits = ["app", "components", "lib"].flatMap(files).filter((f) => !f.endsWith(".test.ts")).flatMap((f) => {
    const src = readFileSync(f, "utf8").split("\n");
    return src.map((l, i) => (BAD.some((r) => r.test(l)) && !/never|retired|not "founded"/i.test(l) ? `${f}:${i + 1}` : "")).filter(Boolean);
  });
  assert.deepEqual(hits, []);
});
