import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TRAINING, TRAINING_NOTE_MAX, parseTrainingNote } from "../lib/platform/advisor-training.ts";

test("the training note is optional, trimmed and capped; nothing else is accepted", () => {
  assert.deepEqual(parseTrainingNote(null), { ok: true, note: null });
  assert.deepEqual(parseTrainingNote({}), { ok: true, note: null });
  assert.deepEqual(parseTrainingNote({ note: "   " }), { ok: true, note: null });
  assert.deepEqual(parseTrainingNote({ note: "  Reading a season in Botswana " }), { ok: true, note: "Reading a season in Botswana" });
  assert.equal(parseTrainingNote({ note: "x".repeat(TRAINING_NOTE_MAX + 1) }).ok, false);
  for (const bad of [{ note: 7 }, { note: "ok", advisor_id: "x" }, "note", []]) assert.equal(parseTrainingNote(bad).ok, false);
});

test("the training words carry no long dashes", () => {
  assert.doesNotMatch(Object.values(TRAINING).join(" "), /[–—]/);
});

test("the migration lets an advisor write only their own registration", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261119101500_advisor_training.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke insert, update, delete on public\.advisor_training_registrations from authenticated/);
  assert.match(sql, /advisor_id = private\.my_advisor_file\(\) or private\.is_advisor_keeper\(\)/);
  assert.equal((sql.match(/me uuid := private\.my_advisor_file\(\)/g) ?? []).length, 2);
});
