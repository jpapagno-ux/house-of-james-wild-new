// House brand rules that must never drift (CLAUDE.md, "Tengile MalaMala"; docs/verified-facts.md).
// Kirkman's Kamp and Tengile River Lodge are Tengile MalaMala Collection lodges, never &Beyond.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const TENGILE = ["STY-2026-000293", "STY-2026-000294", "STY-2026-143672", "STY-2026-683455", "STY-2026-426518"];
const stays = JSON.parse(readFileSync(new URL("../lib/content/stays.json", import.meta.url), "utf8")).stays as { ledgerId: string | null; name: string; slug: string }[];

test("Tengile MalaMala lodges never carry an &Beyond name", () => {
  const found = stays.filter((s) => s.ledgerId && TENGILE.includes(s.ledgerId));
  assert.ok(found.length >= 2, "Kirkman's Kamp and Tengile River Lodge are on the Ledger");
  for (const s of found) assert.doesNotMatch(s.name, /beyond/i, `${s.ledgerId} ${s.slug} is named "${s.name}"`);
});

test("no stay named for Kirkman's or Tengile sits under &Beyond", () => {
  for (const s of stays) if (/kirkman|tengile/i.test(s.name + " " + s.slug)) assert.doesNotMatch(s.name, /beyond/i, `${s.slug} is named "${s.name}"`);
});
