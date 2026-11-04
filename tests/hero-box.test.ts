// Run: node --experimental-strip-types --test tests/hero-box.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { heroBox } from "../lib/hero-box.ts";

test("a fixed hero height becomes a floor the hero can grow past", () => {
  assert.deepEqual(heroBox("h-[82svh] min-h-[620px]"), { className: "", style: { minHeight: "max(82svh, 620px)" } });
  assert.deepEqual(heroBox("h-[94svh]"), { className: "", style: { minHeight: "94svh" } });
  assert.deepEqual(heroBox("md:block h-[70svh] min-h-[480px]"), { className: "md:block", style: { minHeight: "max(70svh, 480px)" } });
  assert.deepEqual(heroBox(""), { className: "", style: {} });
});
