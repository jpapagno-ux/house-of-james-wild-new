// The Voyages category pages (James, 2 Nov 2026, Part 4.6): a category gets its own page only when
// 3 or more ships qualify on published facts. Diving waits for Indonesia.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { SHIP_REGISTRY } from "../lib/content/ships/registry.ts";

const root = new URL("../", import.meta.url);
const paged = SHIP_REGISTRY.filter((s) => s.page);

test("family and solo each have 3 or more ships on published facts", () => {
  assert.ok(paged.filter((s) => s.traits?.minChildAge !== undefined).length >= 3, "family");
  assert.ok(paged.filter((s) => s.traits?.single && s.traits.single.kind !== "applies").length >= 3, "solo");
});

test("diving has no category page until Indonesia is built", () => {
  assert.ok(!existsSync(new URL("app/voyages/diving", root)));
  assert.ok(existsSync(new URL("app/voyages/family/page.tsx", root)));
  assert.ok(existsSync(new URL("app/voyages/solo/page.tsx", root)));
  assert.ok(existsSync(new URL("app/voyages/honeymoon/page.tsx", root)));
});
