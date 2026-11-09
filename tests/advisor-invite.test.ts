import { test } from "node:test";
import assert from "node:assert/strict";
import { dnaChanges, EMPTY_DNA, parseDna, parseProfile } from "../lib/platform/advisor-dna.ts";
import { advisorInviteMail, alertMail } from "../lib/platform/advisor-mail.ts";

const base = { pathways: ["PATH-01"], volumes: ["safaris"], countries: ["kenya"] };

test("card words are tidied: long dashes become commas, paragraphs keep one blank line", () => {
  const p = parseProfile({ title: "  Travel Advisor  —  Kenya ", intro: "On foot – and by canoe.", bio: "One.\n\n\n\nTwo." });
  assert.ok(p.ok);
  assert.equal(p.value.title, "Travel Advisor, Kenya");
  assert.equal(p.value.intro, "On foot, and by canoe.");
  assert.equal(p.value.bio, "One.\n\nTwo.");
});

test("card words have limits, and empty means none", () => {
  assert.equal(parseProfile({ bio: "x".repeat(1501) }).ok, false);
  assert.equal(parseProfile({ intro: "x".repeat(241) }).ok, false);
  const p = parseProfile({ title: "   " });
  assert.ok(p.ok && p.value.title === null);
});

test("the DNA carries the card words, and the house sees them change", () => {
  const p = parseDna({ ...base, intro: "Hello" });
  assert.ok(p.ok);
  assert.equal(p.value.intro, "Hello");
  const ch = dnaChanges({ ...EMPTY_DNA, ...p.value, intro: null }, p.value);
  assert.deepEqual(ch.map((c) => c.field), ["Introduction"]);
});

test("the invitation email names the advisor and the link, without long dashes", () => {
  const m = advisorInviteMail({ name: "Anthony Papagno", link: "https://example.com/advisor/invite/abc", inviter: "James Papagno" });
  assert.match(m.subject, /^Anthony, your Advisor Desk is ready/);
  assert.match(m.text, /https:\/\/example\.com\/advisor\/invite\/abc/);
  assert.doesNotMatch(m.text + m.html, /[–—]/);
});

test("alerts link to the right screen and escape what the advisor typed", () => {
  const m = alertMail({ kind: "request_sent", advisor: "<b>Ann</b>", ref: "AR-2026-000001", stay: "Tswalu", dates: "2027-05-01 to 2027-05-04" }, "https://x.test", "/desk/advisor-requests/1");
  assert.match(m.text, /https:\/\/x\.test\/desk\/advisor-requests\/1/);
  assert.ok(!m.html.includes("<b>Ann</b>"));
  const h = alertMail({ kind: "request_moved", ref: "AR-2026-000001", stay: "Tswalu", status: "held" }, "https://x.test", "/advisor/requests/1");
  assert.match(h.text, /priced and held/);
});
