import { test } from "node:test";
import assert from "node:assert/strict";
import { TA, byCategory, displayAddress, httpsUrl, toTradeAccount, visibleToAdvisor } from "../lib/platform/trade-accounts.ts";

const rec = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  fields: { [TA.supplier]: "Silversea", [TA.category]: "Cruise", [TA.portal]: "https://www.example.test/agents/", [TA.loginType]: "Own login", [TA.openTo]: "All advisors", [TA.status]: "Active", [TA.show]: true, ...over },
});

test("a row is listed only when Show on Desk is ticked, it has a supplier and it is not Paused", () => {
  assert.ok(toTradeAccount(rec("r1")));
  assert.equal(toTradeAccount(rec("r2", { [TA.show]: undefined })), null);
  assert.equal(toTradeAccount(rec("r3", { [TA.status]: "Paused" })), null);
  assert.equal(toTradeAccount(rec("r4", { [TA.supplier]: "  " })), null);
});

test("the agent address is shown without scheme; only https is kept", () => {
  assert.equal(toTradeAccount(rec("r1"))?.portal, "example.test/agents");
  assert.equal(displayAddress("javascript:alert(1)"), "");
  assert.equal(httpsUrl("http://example.test"), "");
  assert.equal(httpsUrl("https://example.test/x"), "https://example.test/x");
});

test("the vault link is passed on only for a shared house login", () => {
  assert.equal(toTradeAccount(rec("r1", { [TA.vault]: "https://vault.example.test/item/1" }))?.vaultUrl, "");
  assert.equal(toTradeAccount(rec("r2", { [TA.loginType]: "Shared house login", [TA.vault]: "https://vault.example.test/item/1" }))?.vaultUrl, "https://vault.example.test/item/1");
  assert.equal(toTradeAccount(rec("r3", { [TA.loginType]: "Shared house login", [TA.vault]: "javascript:x" }))?.vaultUrl, "");
});

test("a blank Open to is House only; advisors see All advisors and rows naming them", () => {
  const all = [rec("a"), rec("b", { [TA.openTo]: undefined }), rec("c", { [TA.openTo]: "House only" }), rec("d", { [TA.openTo]: "Named advisors", [TA.named]: ["recKRISTINA"] })].map((r) => toTradeAccount(r)!);
  assert.equal(all[1].openTo, "House only");
  assert.deepEqual(visibleToAdvisor(all, null).map((a) => a.id), ["a"]);
  assert.deepEqual(visibleToAdvisor(all, "recANTHONY").map((a) => a.id), ["a"]);
  assert.deepEqual(visibleToAdvisor(all, "recKRISTINA").map((a) => a.id), ["a", "d"]);
});

test("an unconfirmed row says so; categories follow the house order, suppliers A to Z", () => {
  assert.equal(toTradeAccount(rec("r1", { [TA.status]: "To confirm" }))?.confirmed, false);
  const list = [rec("1", { [TA.supplier]: "Marriott", [TA.category]: "Hotel program" }), rec("2"), rec("3", { [TA.supplier]: "Royal Caribbean" }), rec("4", { [TA.supplier]: "Zed", [TA.category]: undefined })].map((r) => toTradeAccount(r)!);
  assert.deepEqual(byCategory(list).map(([c, l]) => [c, l.map((a) => a.supplier)]), [["Cruise", ["Royal Caribbean", "Silversea"]], ["Hotel program", ["Marriott"]], ["Other", ["Zed"]]]);
});
