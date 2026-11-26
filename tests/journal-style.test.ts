// JWC-STYLE-01: the one flag and its preview switch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { journalSwitchAllowed, readJournalFlag, readJournalSwitch, resolveJournalStyle } from "../lib/journal-style/flag.ts";

test("the flag is off unless it is exactly on", () => {
  assert.equal(readJournalFlag({}), false);
  assert.equal(readJournalFlag({ NEXT_PUBLIC_JOURNAL_STYLE: "off" }), false);
  assert.equal(readJournalFlag({ NEXT_PUBLIC_JOURNAL_STYLE: "true" }), false);
  assert.equal(readJournalFlag({ NEXT_PUBLIC_JOURNAL_STYLE: "on" }), true);
});

test("?journal= reads 1 and 0, from either shape of search params", () => {
  assert.equal(readJournalSwitch({ journal: "1" }), true);
  assert.equal(readJournalSwitch({ journal: ["0", "1"] }), false);
  assert.equal(readJournalSwitch(new URLSearchParams("journal=1")), true);
  assert.equal(readJournalSwitch({ journal: "yes" }), null);
  assert.equal(readJournalSwitch({}), null);
  assert.equal(readJournalSwitch(undefined), null);
});

test("the switch works on previews and local builds, never in production", () => {
  assert.equal(journalSwitchAllowed({ VERCEL_ENV: "preview" }), true);
  assert.equal(journalSwitchAllowed({}), true);
  assert.equal(journalSwitchAllowed({ VERCEL_ENV: "production" }), false);
  assert.equal(journalSwitchAllowed({ NEXT_PUBLIC_VERCEL_ENV: "production" }), false);
});

test("flag off and no switch = the site as it is today", () => {
  assert.equal(resolveJournalStyle({ VERCEL_ENV: "preview" }), false);
  assert.equal(resolveJournalStyle({ VERCEL_ENV: "production" }, { journal: "1" }), false);
  assert.equal(resolveJournalStyle({ VERCEL_ENV: "preview" }, { journal: "1" }), true);
  assert.equal(resolveJournalStyle({ VERCEL_ENV: "preview", NEXT_PUBLIC_JOURNAL_STYLE: "on" }, { journal: "0" }), false);
  assert.equal(resolveJournalStyle({ VERCEL_ENV: "production", NEXT_PUBLIC_JOURNAL_STYLE: "on" }, { journal: "0" }), true);
});

// Every stay on the locked template opens with a written traveller introduction (James, 23 Nov 2026).
test("every template stay has a written introduction, with no dashes or Ledger wording", async () => {
  const { readFileSync } = await import("node:fs");
  const list = JSON.parse(readFileSync(new URL("../lib/journal-style/template-stays.json", import.meta.url), "utf8"));
  const intros = JSON.parse(readFileSync(new URL("../lib/journal-style/intros.json", import.meta.url), "utf8")).intros as Record<string, string>;
  for (const slug of (list.stays ?? list) as string[]) {
    const t = intros[slug];
    assert.ok(t && t.length > 60, `no introduction filed for ${slug}`);
    assert.ok(!/[\u2013\u2014]/.test(t), `dash in the introduction for ${slug}`);
    assert.ok(!/Ledger|STY-/.test(t), `Ledger wording in the introduction for ${slug}`);
  }
});

test("expect cards: every stay is on the template, every photograph named is described for that stay, no dashes", async () => {
  const { readFileSync } = await import("node:fs");
  const read = (f: string) => JSON.parse(readFileSync(new URL(`../lib/journal-style/${f}`, import.meta.url), "utf8"));
  const list = read("template-stays.json").stays as string[];
  const notes = read("photo-notes.json") as Record<string, { describe: Record<string, unknown>; extra: { id: string }[] } | string>;
  type Row = { title: string; line?: string; photo?: string | null };
  const cards = read("expect-cards.json") as Record<string, { experiences: Row[]; features: Row[]; also?: string } | string>;
  for (const [slug, e] of Object.entries(cards)) {
    if (typeof e !== "object") continue;
    assert.ok(list.includes(slug), `${slug}: on the template`);
    const n = notes[slug];
    const rp = (read("room-photos.json") as Record<string, Record<string, { id: string }> | string>)[slug];
    const known = new Set([...(typeof n === "object" ? [...Object.keys(n.describe), ...n.extra.map((x) => x.id.split("/").pop())] : []), ...(typeof rp === "object" ? Object.values(rp).map((x) => x.id.split("/").pop()) : [])]);
    for (const r of [...e.experiences, ...e.features]) {
      assert.doesNotMatch(`${r.title} ${r.line ?? ""}`, /[\u2013\u2014]/, `${slug}: ${r.title}`);
      if (r.photo) assert.ok(known.has(r.photo), `${slug}: ${r.title} names photograph ${r.photo}, which is not described or filed as a room photograph for the stay`);
    }
    assert.doesNotMatch(e.also ?? "", /[\u2013\u2014]/);
  }
});
