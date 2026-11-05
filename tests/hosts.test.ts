import { test } from "node:test";
import assert from "node:assert/strict";
import { cardLine, parseHostProposal } from "../lib/platform/hosts.ts";

const C = [{ id: "11111111-2222-3333-4444-555555555555", name: "Matthew Christopher Smith", title: "International Sales Manager" }];
const pages = ["camp:lion-sands/river-lodge", "stay:marataba"];

test("the card line reads like the site's", () => {
  assert.equal(cardLine("Sales Manager", "Londolozi"), "Your host · Sales Manager, Londolozi");
  assert.equal(cardLine(null, null), "Your host");
});

test("a proposal names a person on one of the partner's own pages", () => {
  const ok = parseHostProposal({ pageKey: "camp:lion-sands/river-lodge", contactId: C[0].id, company: "MORE Collection" }, pages, C);
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.value.name, "Matthew Christopher Smith");
    assert.equal(ok.value.cardLine, "Your host · International Sales Manager, MORE Collection");
  }
  assert.equal(parseHostProposal({ pageKey: "stay:londolozi-reserve", name: "X Y" }, pages, C).ok, false);
  assert.equal(parseHostProposal({ pageKey: "stay:marataba", name: "A" }, pages, C).ok, false);
  assert.equal(parseHostProposal({ pageKey: "stay:marataba", name: "Ana Smith", jobTitle: "GM — lodge" }, pages, C).ok, false);
  assert.equal(parseHostProposal({ pageKey: "stay:marataba", name: "Ana Smith", contactId: "99999999-2222-3333-4444-555555555555" }, pages, C).ok, false);
});
