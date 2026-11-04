import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// No invented people on the public site (James, 3 Nov 2026). Stand-in advisors (`sample: true`) stay in the data but
// every page reads ADVISORS, which drops them unless a deployment sets NEXT_PUBLIC_SHOW_STAND_INS=true.

const src = readFileSync("lib/content/advisors.ts", "utf8");

test("ADVISORS drops stand-ins unless the preview flag is set", () => {
  assert.match(src, /export const SHOW_STAND_INS = process\.env\.NEXT_PUBLIC_SHOW_STAND_INS === "true";/);
  assert.match(src, /export const ADVISORS: Advisor\[\] = SHOW_STAND_INS \? ALL_ADVISORS : ALL_ADVISORS\.filter\(\(a\) => !a\.sample\);/);
});

test("nothing outside the advisor data reads the unfiltered list or the sample desks", () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mjs)$/.test(n) ? [p] : []; });
  const bad = [...walk("app"), ...walk("components"), ...walk("lib")]
    .filter((f) => !f.endsWith("lib/content/advisors.ts") && !f.endsWith("lib/content/advisor-samples.ts"))
    .filter((f) => /\bALL_ADVISORS\b|\bSAMPLE_DESKS\b/.test(readFileSync(f, "utf8")));
  assert.deepEqual(bad, []);
});
