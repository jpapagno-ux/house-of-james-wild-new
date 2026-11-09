import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Either side of the voyage (James, 9 Nov 2026): every stay it names is a library stay; no dashes in public copy.
test("either side of the voyage: stays are library slugs and the copy has no dashes", async () => {
  const { eitherSideFor } = await import("../lib/content/ships/either-side.ts");
  const lib = JSON.parse(readFileSync("lib/content/stays.json", "utf8"));
  const rows: { slug: string }[] = Array.isArray(lib) ? lib : lib.stays ?? Object.values(lib);
  const slugs = new Set(rows.map((r) => r.slug));
  const t = eitherSideFor("star-breeze", "tahiti");
  assert.ok(t);
  for (const s of [...t!.arrive.stays, ...t!.stayOn.stays, ...t!.addNights.flatMap((a) => (a.stay ? [a.stay] : [])), ...(t!.operator?.hotels ?? [])]) assert.ok(slugs.has(s), s);
  assert.doesNotMatch(JSON.stringify(t), /[–—]/);
  assert.equal(eitherSideFor("magellan-explorer", "antarctica"), null);
});
