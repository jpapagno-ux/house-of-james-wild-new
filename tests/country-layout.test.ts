import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { COUNTRY_PAGES, shortAnswer } from "../lib/content/country-pages.ts";
import { BANNED, DIVE_FLAG, cleanCopy, signed } from "../components/maps/terrain/atlas.ts";

// The new country page (James, 3 Nov 2026): In short is 40 to 60 words of the answer, unreworded; the think-twice
// draft and the quick facts keep the house rules; the atlas list is a real <details> accordion in the served HTML.

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
const guides = readFileSync("lib/content/guides.ts", "utf8");
const answer = guides.match(/slug: "indonesia",[^]*?answer: "([^"]+)"/)![1];

test("In short: 40 to 60 words, whole sentences of the answer in order", () => {
  const s = shortAnswer(answer);
  assert.ok(words(s) >= 40 && words(s) <= 60, `${words(s)} words`);
  let at = 0;
  for (const sentence of s.match(/[^.!?]+[.!?]+/g)!) { const i = answer.indexOf(sentence.trim(), at); assert.ok(i >= at, `not from the answer: ${sentence}`); at = i; }
});

test("the think-twice draft and quick facts keep the house rules", () => {
  const ind = COUNTRY_PAGES.indonesia;
  for (const t of [...(ind.thinkTwice ?? []).flatMap((x) => [x.who, x.line]), ind.howLong!.text]) assert.ok(cleanCopy(t), `banned: ${t}`);
  assert.ok(BANNED.length > 0);
  for (const [, list] of Object.entries(ind.factSources)) for (const s of list) assert.ok(s.url.startsWith("/") || /indonesia\.travel|unesco\.org|kkprajaampat\.com|imigrasi\.go\.id/.test(s.url), s.url);
});

test("the atlas list is a folded <details> accordion, and dive sites fly the diver-down flag", () => {
  const src = readFileSync("components/maps/terrain/CountryAtlas.tsx", "utf8");
  assert.match(src, /<details className="jw-atlas__acc"/);
  assert.doesNotMatch(src, /<details[^>]*\bopen\b/);
  assert.match(src, /"@type": "ItemList"/);
  assert.equal(DIVE_FLAG.stripe, "#FFFFFF");
  assert.equal(signed({ text: "x", year: 2024 }), "James, 2024");
});

test("the Draft for James block never renders on production", () => {
  assert.match(readFileSync("lib/content/country-layout.ts", "utf8"), /showDrafts = \(\) => process\.env\.VERCEL_ENV !== "production"/);
  assert.match(readFileSync("components/destination/GuidePage.tsx", "utf8"), /v2\.drafts && extras\?\.thinkTwice/);
});
