import { test } from "node:test";
import assert from "node:assert/strict";
import { isBuilt, live } from "../lib/routes.ts";

test("built pages pass, with queries and anchors", () => { assert.ok(isBuilt("/about/team#advisors")); assert.ok(isBuilt("/plan?advisor=kristina-larson")); assert.ok(isBuilt("/advisors/anthony-papagno")); });
test("unbuilt pages are caught", () => { assert.equal(isBuilt("/stays"), false); assert.equal(isBuilt("/the-ledger"), false); assert.equal(isBuilt("/about/philosophy"), false); });
test("external links always pass", () => assert.ok(isBuilt("https://wildcosafaris.com")));
test("guard on hides unbuilt links; off keeps all", () => {
  const links = [{ href: "/plan" }, { href: "/stays" }];
  assert.deepEqual(live(links, true), [{ href: "/plan" }]);
  assert.equal(live(links, false).length, 2);
});
