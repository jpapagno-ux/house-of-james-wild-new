import { test } from "node:test";
import assert from "node:assert/strict";
import { setupStates, setupProgress } from "../lib/platform/setup.ts";
import { partnerInviteMail } from "../lib/platform/partner-mail.ts";

test("contributors see no commercial, banking or team steps", () => {
  const keys = setupStates({}, [], false).map((s) => s.key);
  assert.ok(!keys.includes("commercial") && !keys.includes("banking") && !keys.includes("team"));
  assert.ok(setupStates({}, [], true).some((s) => s.key === "banking"));
});

test("rooms and content are done only when every property has them", () => {
  const half = setupStates({ entries: 4, entriesTotal: 4, rooms: 2 }, [], true).find((s) => s.key === "rooms")!;
  assert.equal(half.state, "todo"); assert.equal(half.detail, "2 of 4 properties");
  const all = setupStates({ entries: 4, entriesTotal: 4, rooms: 4 }, [], true).find((s) => s.key === "rooms")!;
  assert.equal(all.state, "done");
});

test("a skipped step counts toward progress; data beats a skip", () => {
  const s = setupStates({ contacts: 2 }, ["hosts", "contacts"], true);
  assert.equal(s.find((x) => x.key === "hosts")!.state, "skipped");
  assert.equal(s.find((x) => x.key === "contacts")!.state, "done");
  assert.equal(setupProgress(s).done, 2);
});

test("partner invitation email: no dashes, names the places, one link", () => {
  const m = partnerInviteMail({ name: "Ana Smith", org: "The Good Life Bahamas", link: "https://x.test/partner/invite/abc", inviter: "James Papagno", role: "partner_admin", entries: ["Foster Hill", "Foxy Lady", "Marina House", "Ballymena"] });
  assert.match(m.subject, /^Ana, your Partner Desk is ready/);
  assert.match(m.html, /Foster Hill, Foxy Lady, Marina House and 1 more/);
  assert.ok(!/[–—]/.test(m.text + m.html));
  assert.match(m.text, /https:\/\/x\.test\/partner\/invite\/abc/);
});
