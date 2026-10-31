// James & Iggi — the central dialogue register (Wild Pathways Phase 2F,
// Foundation Brief §6). One place that knows every line either character can
// say on the site: who says it, where, to whom, why, in what tone, where the
// words came from, whether James has approved them, and which approved
// drawing goes with them.
//
// Governance, in code rather than in a memo:
//   • Nothing renders unless approval.status is "approved" (approvedDialogue).
//   • A James line must trace to James: an approved verdict, his own sign-off,
//     or a line he marked in the Voice Bank. House drafts in his voice stay
//     draft until he marks them. He is never given a visit, a stay or an
//     endorsement he did not record.
//   • Iggi never speaks in the first person about field experience. He quotes
//     James ("James stayed…") from approved text, labels every answer by
//     origin (Ledger / James / founder / partner / needs a check) and hands
//     prices, availability and booking to a person.
//   • Sample creative copy is "draft" and is labelled as a sample wherever it
//     shows (today: /plan/iggi).
//   • A line may carry one expression asset; approved lines may only carry
//     approved assets.
//
// This module is import-free so plain Node can test it. Wiring to the live
// content (verdicts, sign-offs, Iggi samples) happens in dialogue/index.ts.

export type CharacterId = "james" | "iggi";
export type Audience = "traveler" | "trade" | "both";
export type Intent =
  | "verdict" // James's Field Verdict on a place
  | "signoff" // the line that closes a note
  | "opener" // Iggi's first line on a page
  | "answer" // Iggi answering from the record
  | "decline" // Iggi refusing to claim what isn't recorded
  | "handoff" // to an advisor, to Crux, to a person
  | "nudge" // a gentle next step (save it, follow the pathway)
  | "caution"; // What I'd Think Twice About
export type Tone = "dry" | "warm" | "practical" | "cheeky" | "curious" | "plain";
export type SourceKind =
  | "james-verdict" // lib/content/verdicts.ts, approved on the Ledger Proofs sheet
  | "james-own" // James's own words, recorded as his
  | "voice-bank" // a line James marked in the Voice Bank (CHOSEN)
  | "house-draft" // written in his voice by the house; not approved
  | "iggi-sample" // the sample chats on /plan/iggi; never authenticated
  | "ledger"; // facts from the record, phrased by Iggi
export type ApprovalStatus = "approved" | "draft" | "retired";
/** Origin label Iggi shows beside an answer (mirrors lib/content/iggi.ts TAGS). */
export type Origin = "ledger" | "james" | "founder" | "partner" | "check";

export type DialogueContext = {
  /** Where the line belongs: a route ("/stays/[slug]"), a page family ("stay", "destination", "voyage", "pathway", "compass", "folio") or "any". */
  page: string;
  /** Narrower context, when the line is about one record. Uses Ledger keys ("stay:leeu-estates", "camp:lion-sands/ivory-lodge"). */
  record?: string;
  volume?: string; // one of the six volume keys
  pathway?: string; // PATH-01 … PATH-08
};

export type DialogueLine = {
  id: string; // "james.verdict.stay:leeu-estates" / "iggi.opener.aguas-claras"
  character: CharacterId;
  context: DialogueContext;
  audience: Audience;
  intent: Intent;
  text: string;
  tone: Tone;
  source: { kind: SourceKind; ref?: string; author?: string };
  approval: { status: ApprovalStatus; by?: string; on?: string; note?: string };
  origin?: Origin; // Iggi only
  asset?: string; // DialogueAsset id
};

export type AssetKind = "portrait" | "expression" | "seal" | "sketch" | "icon";
export type DialogueAsset = {
  id: string;
  character: CharacterId | "house"; // the hare seal is the house's, not a character
  kind: AssetKind;
  name: string;
  /** Where it lives: a public path in this repo, a Base44 media URL, or a Cloudinary public id (cloud jhlnq5h5). */
  src: string;
  status: "approved" | "candidate" | "draft";
  note: string;
};

// ---------------------------------------------------------------------------
// Approved-asset inventory (brief §6: "use approved rabbit and chameleon
// assets; restrained monochromatic icons and occasional bubbles").
// Approved = already in use on the live site with James's sign-off.
// Candidate = finished art in Cloudinary awaiting James's word (the wink and
// this-way icons were promoted on 30 Oct 2026). Draft = tagged draft in Cloudinary.
export const DIALOGUE_ASSETS: DialogueAsset[] = [
  { id: "iggi-mark", character: "iggi", kind: "icon", name: "Iggi's mark (chameleon, compass tail)", src: "/components/iggi/IggiMark.tsx", status: "approved", note: "Chosen by James 30 Oct 2026 (Iggi Core candidate A). Stroke-only SVG, takes the page's ink through currentColor; the icon beside every Iggi bubble on the site" },
  { id: "iggi-portrait-charcoal", character: "iggi", kind: "portrait", name: "Iggi, charcoal on cream", src: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/3e26d6a56_generated_image.png", status: "approved", note: "Live on /plan/iggi since 28 Oct 2026" },
  { id: "cheetah-pencil", character: "james", kind: "sketch", name: "Cheetah, pencil", src: "/brand/sketches/cheetah-pencil.png", status: "approved", note: "Drawn by a friend of James, used with his permission (26 Oct 2026); on the verdict notes" },
  { id: "house-hare-seal", character: "house", kind: "seal", name: "James Wild & Co hare seal", src: "jwco-brand-kit/png/jwco-hare-600", status: "approved", note: "The house's rabbit: brand-kit seal (cream/forest/navy/sand/linen variants under wildco/guides/house-style/jwc-hare-seal-*)" },
  { id: "iggi-wink", character: "iggi", kind: "expression", name: "Iggi, wink (forest)", src: "wildco/brand/iggi/iggi-character-wink-forest", status: "approved", note: "Approved by James 30 Oct 2026. Cloudinary, monochrome forest line art; the expression beside Iggi's bubbles" },
  { id: "iggi-this-way", character: "iggi", kind: "expression", name: "Iggi, this way (forest)", src: "wildco/brand/iggi/iggi-character-this-way-forest", status: "approved", note: "Approved by James 30 Oct 2026. Pointing; the expression for handoffs and nudges" },
  { id: "iggi-seal", character: "iggi", kind: "seal", name: "Iggi's Compass seal", src: "wildco/brand/iggi/iggi-character-seal-forest", status: "candidate", note: "Cloudinary; forest and linen variants, plus iggis-compass-seal-{navy,sand,forest}" },
  { id: "iggi-engraved-v1", character: "iggi", kind: "portrait", name: "Iggi, engraved art v1", src: "wildco/brand/iggi/iggi-engraved-art-v1", status: "draft", note: "Tagged draft" },
  { id: "iggi-character-a-d", character: "iggi", kind: "portrait", name: "Iggi character studies a–d", src: "wildco/brand/iggi/iggi-character-a", status: "draft", note: "Four studies (a–d), tagged draft / image-to-image" },
];

// ---------------------------------------------------------------------------

const IGGI_FIRST_PERSON_FIELD_CLAIM = /\b(I|I've|I have|I'd|I was|I'm|we|we've)\s+(stayed|visited|slept|sailed|dived|surfed|been (there|to)|inspected|vetted|was there|were there)\b/i;
const IGGI_CLAIMS_JAMES = /\b(my|our)\s+(stay|visit|trip|voyage|safari|field note|verdict)s?\b/i;

/** The lines that may render. Drafts and retired lines never leave this gate. */
export function approvedDialogue(lines: DialogueLine[], filter: Partial<{ character: CharacterId; page: string; record: string; audience: Audience; intent: Intent; pathway: string; volume: string }> = {}): DialogueLine[] {
  return lines.filter((l) => {
    if (l.approval.status !== "approved") return false;
    if (filter.character && l.character !== filter.character) return false;
    if (filter.audience && l.audience !== "both" && l.audience !== filter.audience) return false;
    if (filter.intent && l.intent !== filter.intent) return false;
    if (filter.page && l.context.page !== "any" && l.context.page !== filter.page) return false;
    if (filter.record && l.context.record && l.context.record !== filter.record) return false;
    if (filter.pathway && l.context.pathway && l.context.pathway !== filter.pathway) return false;
    if (filter.volume && l.context.volume && l.context.volume !== filter.volume) return false;
    return true;
  });
}

/** House rules as checks. Returns the list of problems; empty means the register is sound. */
export function validateDialogue(lines: DialogueLine[], assets: DialogueAsset[] = DIALOGUE_ASSETS): string[] {
  const bad: string[] = [];
  const seen = new Set<string>();
  const assetById = new Map(assets.map((a) => [a.id, a]));
  for (const l of lines) {
    const at = l.id;
    if (seen.has(l.id)) bad.push(`${at}: duplicate id`);
    seen.add(l.id);
    if (!l.text.trim()) bad.push(`${at}: empty text`);
    if (!l.context.page) bad.push(`${at}: context.page required`);
    if (l.approval.status === "approved") {
      if (!l.approval.by || !l.approval.on) bad.push(`${at}: approved lines need approval.by and approval.on`);
      if (l.character === "james" && !["james-verdict", "james-own", "voice-bank"].includes(l.source.kind)) bad.push(`${at}: an approved James line must come from James (verdict, his own words, or the Voice Bank); got ${l.source.kind}`);
      if (l.character === "james" && !l.source.ref) bad.push(`${at}: an approved James line needs source.ref`);
      if (l.character === "iggi" && l.source.kind === "iggi-sample") bad.push(`${at}: sample copy is never approved as authenticated dialogue`);
      if (l.asset) {
        const a = assetById.get(l.asset);
        if (!a) bad.push(`${at}: unknown asset ${l.asset}`);
        else if (a.status !== "approved") bad.push(`${at}: approved line uses ${a.status} asset ${l.asset}`);
      }
    }
    if (l.source.kind === "house-draft" && l.approval.status === "approved") bad.push(`${at}: a house draft cannot be approved without James marking it (change source.kind to voice-bank with the pick id)`);
    if (l.character === "iggi") {
      if (!l.origin) bad.push(`${at}: Iggi lines carry an origin label`);
      if (IGGI_FIRST_PERSON_FIELD_CLAIM.test(l.text) || IGGI_CLAIMS_JAMES.test(l.text)) bad.push(`${at}: Iggi may not claim field experience in the first person`);
      if (l.origin === "founder" && !/\bJames\b/.test(l.text) && !/no founder (stay|visit|voyage)/i.test(l.text)) bad.push(`${at}: a founder-origin line names James or says there is no record`);
    }
    if (l.character === "james" && l.origin) bad.push(`${at}: origin labels are Iggi's`);
    if (l.asset && !assetById.has(l.asset)) bad.push(`${at}: unknown asset ${l.asset}`);
  }
  for (const a of assets) if (!a.src) bad.push(`asset ${a.id}: src required`);
  return bad;
}

// ---------------------------------------------------------------------------
// Builders: turn today's approved content into register lines without
// duplicating the words. The verdict text stays in verdicts.ts; the register
// is the index that governs it.

export type VerdictLike = { where: string; when: string; text: string[]; signoff?: string; sketch?: string };
export type SampleLike = { where: string; path: string; opener: string; answer: { tag: Origin; text: string }[] };

const VERDICT_APPROVAL = { status: "approved" as const, by: "James Papagno", on: "2026-10-27", note: "Ledger Proofs sheet" };

export function jamesVerdictLines(verdicts: Record<string, VerdictLike>): DialogueLine[] {
  return Object.entries(verdicts).map(([key, v]) => ({
    id: `james.verdict.${key}`,
    character: "james",
    context: { page: key.startsWith("camp:") ? "camp" : "stay", record: key },
    audience: "both",
    intent: "verdict",
    text: v.text.join(" "),
    tone: "dry",
    source: { kind: "james-verdict", ref: `verdicts.ts#${key}`, author: "James Papagno" },
    approval: VERDICT_APPROVAL,
    asset: v.sketch === "cheetah" ? "cheetah-pencil" : undefined,
  }));
}

/** The first sign-off is James's own; the rest are house drafts until he marks them in the Voice Bank. */
export function signoffLines(signoffs: readonly string[], chosen: Record<string, string> = {}): DialogueLine[] {
  const chosenText = new Set(Object.values(chosen));
  return signoffs.map((text, i) => {
    const own = i === 0;
    const marked = chosenText.has(text);
    return {
      id: `james.signoff.${i + 1}`,
      character: "james",
      context: { page: "any" },
      audience: "both",
      intent: "signoff",
      text,
      tone: "dry",
      source: own ? { kind: "james-own", ref: "verdicts.ts#SIGNOFFS[0]", author: "James Papagno" } : marked ? { kind: "voice-bank", ref: "voice/james-voice.ts#CHOSEN", author: "house, marked by James" } : { kind: "house-draft", author: "house" },
      approval: own || marked ? { status: "approved", by: "James Papagno", on: own ? "2026-10-26" : "2026-10-30", note: own ? "James's own line" : "Voice Bank pick" } : { status: "draft", note: "House draft in James's voice; awaiting the Voice Bank" },
    };
  });
}

/** Sample chats from /plan/iggi: every line is a draft, labelled as a sample on the page. */
export function iggiSampleLines(samples: SampleLike[]): DialogueLine[] {
  const out: DialogueLine[] = [];
  for (const s of samples) {
    const slug = s.path.split("/").filter(Boolean).pop() ?? "page";
    const page = s.path.startsWith("/stays/") ? "stay" : s.path.startsWith("/voyages/") ? "voyage" : s.path.startsWith("/destinations/") ? "destination" : "any";
    out.push({ id: `iggi.opener.${slug}`, character: "iggi", context: { page, record: s.path }, audience: "traveler", intent: "opener", text: s.opener, tone: "cheeky", origin: "ledger", source: { kind: "iggi-sample", ref: `iggi.ts#SAMPLES[${s.where}]` }, approval: { status: "draft", note: "Sample chat; shown as a sample on /plan/iggi" } });
    s.answer.forEach((a, i) => out.push({
      id: `iggi.answer.${slug}.${i + 1}`,
      character: "iggi",
      context: { page, record: s.path },
      audience: "traveler",
      intent: a.tag === "check" ? "handoff" : /won't claim|no founder/i.test(a.text) ? "decline" : "answer",
      text: a.text,
      tone: a.tag === "check" ? "practical" : "curious",
      origin: a.tag,
      source: { kind: "iggi-sample", ref: `iggi.ts#SAMPLES[${s.where}].answer[${i}]` },
      approval: { status: "draft", note: "Sample chat; shown as a sample on /plan/iggi" },
    }));
  }
  return out;
}

/** Iggi's standing lines: the few he says everywhere, written to the house rules. Approved by James, 30 Oct 2026 (wording audit pinned as FOLLOW-UPS #17). */
export const IGGI_STANDING: DialogueLine[] = [
  { id: "iggi.decline.no-founder-record", character: "iggi", context: { page: "any" }, audience: "both", intent: "decline", tone: "plain", origin: "founder", text: "There's no founder stay on record here, so I won't claim one. James only signs what he's seen.", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
  { id: "iggi.handoff.advisor", character: "iggi", context: { page: "any" }, audience: "traveler", intent: "handoff", tone: "practical", origin: "check", text: "Rates, availability and transfers need a current check. I'll pass your questions to an advisor, a person, if you'd like.", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
  { id: "iggi.handoff.crux", character: "iggi", context: { page: "compass", volume: "safaris" }, audience: "both", intent: "handoff", tone: "cheeky", origin: "ledger", text: "That's a safari reading through and through. Crux at Wild & Co Safaris has the Africa desk; I'll walk you over.", asset: "iggi-this-way", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
  { id: "iggi.nudge.follow-pathway", character: "iggi", context: { page: "stay" }, audience: "traveler", intent: "nudge", tone: "curious", origin: "ledger", text: "Drawn to this one? The pathway it sits on has more like it, each with its own Ledger ID.", asset: "iggi-this-way", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
  { id: "iggi.nudge.save-folio", character: "iggi", context: { page: "stay" }, audience: "traveler", intent: "nudge", tone: "warm", origin: "ledger", text: "Save it to your Folio and it keeps its pathway colours wherever you take it.", asset: "iggi-wink", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
  { id: "iggi.trade.suitability", character: "iggi", context: { page: "stay" }, audience: "trade", intent: "answer", tone: "practical", origin: "ledger", text: "For your client: who this suits, who it won't, the practical bits and the pathways it sits on. Nets and availability come from the desk, not from me.", source: { kind: "ledger", author: "house" }, approval: { status: "approved", by: "James Papagno", on: "2026-10-30", note: "Approved in review, 30 Oct 2026; wording audit to follow (FOLLOW-UPS #17)" } },
];
