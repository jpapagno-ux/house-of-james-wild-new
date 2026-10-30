// Phase 2F: James & Iggi dialogue governance (Foundation Brief §6).
import { test } from "node:test";
import assert from "node:assert/strict";
import { DIALOGUE_ASSETS, IGGI_STANDING, approvedDialogue, iggiSampleLines, jamesVerdictLines, signoffLines, validateDialogue, type DialogueLine } from "../lib/content/dialogue.ts";
import { VERDICTS, SIGNOFFS } from "../lib/content/verdicts.ts";
import { CHOSEN } from "../lib/content/voice/chosen.ts";
import { SAMPLES } from "../lib/content/iggi.ts";

const REGISTER: DialogueLine[] = [...jamesVerdictLines(VERDICTS), ...signoffLines(SIGNOFFS, CHOSEN), ...IGGI_STANDING, ...iggiSampleLines(SAMPLES)];

test("the live register validates and only approved lines render", () => {
  assert.deepEqual(validateDialogue(REGISTER), []);
  const live = approvedDialogue(REGISTER);
  assert.ok(live.length > 0);
  assert.ok(live.every((l) => l.approval.status === "approved" && l.approval.by && l.approval.on));
  assert.ok(!live.some((l) => l.source.kind === "iggi-sample"), "samples never render as authenticated dialogue");
  assert.ok(!live.some((l) => l.source.kind === "house-draft"), "house drafts never render");
});

test("every James verdict is indexed, sourced and approved; the words stay in verdicts.ts", () => {
  const v = jamesVerdictLines(VERDICTS);
  assert.equal(v.length, Object.keys(VERDICTS).length);
  for (const l of v) {
    assert.equal(l.source.kind, "james-verdict");
    assert.match(l.source.ref!, /^verdicts\.ts#/);
    assert.equal(l.text, VERDICTS[l.context.record!].text.join(" "));
  }
  assert.equal(v.find((l) => l.context.record === "stay:monwana-thornybush")!.asset, "cheetah-pencil");
});

test("the standing lines and all seven sign-offs are approved by James (30 Oct 2026)", () => {
  assert.ok(IGGI_STANDING.every((l) => l.approval.status === "approved" && l.approval.by === "James Papagno"));
  assert.equal(signoffLines(SIGNOFFS, CHOSEN).filter((l) => l.approval.status === "approved").length, SIGNOFFS.length);
});

test("only James's own sign-off is approved until he marks the Voice Bank", () => {
  const s = signoffLines(SIGNOFFS);
  assert.equal(s.filter((l) => l.approval.status === "approved").length, 1);
  assert.equal(s[0].source.kind, "james-own");
  const marked = signoffLines(SIGNOFFS, { "signoff-3": SIGNOFFS[2] });
  assert.equal(marked[2].approval.status, "approved");
  assert.equal(marked[2].source.kind, "voice-bank");
});

test("the rules catch what the brief forbids", () => {
  const base = REGISTER[0];
  const bad: DialogueLine[] = [
    { ...base, id: "x1", character: "james", source: { kind: "house-draft" }, approval: { status: "approved", by: "house", on: "2026-10-30" } },
    { ...base, id: "x2", character: "iggi", origin: "founder", text: "I stayed at Tswalu in 2012 and loved it.", source: { kind: "ledger" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30" } },
    { ...base, id: "x3", character: "iggi", origin: "ledger", text: "Fine line.", source: { kind: "ledger" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30" }, asset: "iggi-seal" },
    { ...base, id: "x4", character: "iggi", text: "No label.", source: { kind: "ledger" }, approval: { status: "draft" }, origin: undefined },
    { ...base, id: "x5", character: "james", source: { kind: "james-verdict" }, approval: { status: "approved" } },
  ];
  const p = validateDialogue(bad);
  assert.ok(p.some((x) => x.startsWith("x1:") && /must come from James|house draft/.test(x)));
  assert.ok(p.some((x) => x.startsWith("x2:") && /first person/.test(x)));
  assert.ok(p.some((x) => x.startsWith("x3:") && /candidate asset/.test(x)));
  assert.ok(p.some((x) => x.startsWith("x4:") && /origin label/.test(x)));
  assert.ok(p.some((x) => x.startsWith("x5:") && /approval\.by/.test(x)));
});

test("Iggi's samples are drafts that label every answer by origin and hand checks to a person", () => {
  const s = iggiSampleLines(SAMPLES);
  assert.ok(s.every((l) => l.approval.status === "draft" && l.origin));
  assert.ok(s.some((l) => l.intent === "decline"), "the Aguas Claras decline is indexed");
  assert.ok(s.filter((l) => l.origin === "check").every((l) => l.intent === "handoff"));
});

test("asset inventory: approved assets are the ones already live; Cloudinary art is candidate or draft", () => {
  const approved = DIALOGUE_ASSETS.filter((a) => a.status === "approved").map((a) => a.id).sort();
  assert.deepEqual(approved, ["cheetah-pencil", "house-hare-seal", "iggi-portrait-charcoal", "iggi-this-way", "iggi-wink"]);
  assert.ok(DIALOGUE_ASSETS.filter((a) => a.id.startsWith("iggi-character") || a.id === "iggi-engraved-v1").every((a) => a.status === "draft"));
  assert.equal(new Set(DIALOGUE_ASSETS.map((a) => a.id)).size, DIALOGUE_ASSETS.length);
});

test("filters narrow by character, audience, page and record without leaking drafts", () => {
  const trade = approvedDialogue(REGISTER, { audience: "trade" });
  assert.ok(trade.every((l) => l.audience !== "traveler"));
  const leeu = approvedDialogue(REGISTER, { character: "james", intent: "verdict", record: "stay:leeu-estates" });
  assert.equal(leeu.length, 1);
  assert.equal(approvedDialogue(REGISTER, { character: "iggi", intent: "opener" }).length, 0, "no Iggi opener is approved yet");
});
