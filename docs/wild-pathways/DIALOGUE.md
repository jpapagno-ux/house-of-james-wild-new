# Phase 2F · James & Iggi dialogue register

Status: **built, awaiting James's review** (30 Oct 2026). Preview: `/preview/pathways/dialogue` (noindex, flag-independent).
Brief: Foundation V1.3 §6 — "store centrally with character ID, page context, audience, intent, approved text, tone, author/source, approval status, linked volume/pathway and optional expression asset. Sample creative copy must be marked draft, never presented as authenticated."

## What it is

`lib/content/dialogue.ts` — the schema, the house rules as code, and the approved-asset inventory. Import-free so Node tests it directly.
`lib/content/dialogue-register.ts` — the live register, built from today's approved sources without copying their words:

| Source | Lines | State | Why |
|---|---|---|---|
| `verdicts.ts` VERDICTS | 6 | approved (James, 27 Oct, Ledger Proofs sheet) | James's Field Verdicts; the text stays in verdicts.ts, the register indexes it with a `source.ref` |
| `verdicts.ts` SIGNOFFS[0] | 1 | approved (James's own line) | "Never look back. Time is on your side." |
| SIGNOFFS[1–6] | 6 | draft | House drafts in his voice; become approved only when they appear in the Voice Bank `CHOSEN` |
| `iggi.ts` SAMPLES | 12 | draft | The /plan/iggi sample chats, labelled samples on the page; indexed so the Iggi embed can never mistake them for authenticated lines |
| `IGGI_STANDING` | 6 | draft, proposed | Lines Iggi would say anywhere (decline, advisor handoff, Crux handoff, follow-the-pathway, save-to-Folio, trade suitability) |

31 lines: 7 approved, 24 draft. The register throws at build if any rule is broken, so a bad line can't ship.

## The rules, as `validateDialogue` enforces them

1. Only `approval.status: "approved"` lines leave `approvedDialogue()`; approved lines carry `by` and `on`.
2. An approved **James** line must come from `james-verdict`, `james-own` or `voice-bank`, with a `source.ref`. A `house-draft` can never be approved directly — it must go through the Voice Bank, which is how James marks lines today.
3. **Iggi** lines carry an origin label (ledger / james / founder / partner / check), never claim field experience in the first person ("I stayed", "my visit"…), and a founder-origin line either names James or says there is no record.
4. `iggi-sample` lines are never approved as authenticated dialogue.
5. An approved line may only carry an **approved** asset.

## Schema

```ts
DialogueLine {
  id; character: "james" | "iggi";
  context: { page; record?; volume?; pathway? };   // page family or route; Ledger keys for records
  audience: "traveler" | "trade" | "both";
  intent: verdict | signoff | opener | answer | decline | handoff | nudge | caution;
  text; tone: dry | warm | practical | cheeky | curious | plain;
  source: { kind: james-verdict | james-own | voice-bank | house-draft | iggi-sample | ledger; ref?; author? };
  approval: { status: approved | draft | retired; by?; on?; note? };
  origin?: ledger | james | founder | partner | check;   // Iggi only
  asset?: DialogueAsset id;
}
```

This is the same shape the library's `IggiKnowledge` entity already uses for approved insight (`source_kind`, `approved_by`, `approved_at`, `status`), so when Iggi Core (Contract C3, PR #38 onward) reads dialogue from the library, the fields map one-to-one. Until then the register lives in the repo.

## Asset inventory (brief §6: "approved rabbit and chameleon assets")

| id | status | what | where |
|---|---|---|---|
| `iggi-portrait-charcoal` | approved | Iggi, charcoal on cream — live on /plan/iggi | Base44 media |
| `cheetah-pencil` | approved | pencil sketch on the verdict notes (friend of James, with permission) | `/public/brand/sketches` |
| `house-hare-seal` | approved | the house's rabbit: the JWC hare seal (cream / forest / navy / sand / linen) | Cloudinary `jwco-brand-kit/png/jwco-hare-*`, `wildco/guides/house-style/jwc-hare-seal-*` |
| `iggi-wink` | candidate | Iggi wink, forest monochrome — tagged character/icon | Cloudinary `wildco/brand/iggi/iggi-character-wink-forest` |
| `iggi-this-way` | candidate | Iggi pointing — suits handoffs and nudges | `wildco/brand/iggi/iggi-character-this-way-forest` |
| `iggi-seal` | candidate | Iggi's Compass seal (forest / linen; plus navy / sand / forest "iggis-compass-seal") | `wildco/brand/iggi/` |
| `iggi-engraved-v1` | draft | engraved art v1 | `wildco/brand/iggi/` |
| `iggi-character-a-d` | draft | four character studies | `wildco/brand/iggi/` |

The rabbit the audit couldn't find is the house hare seal, already in the brand kit. No new art is needed for Phase 2F.

## Decisions for James

1. Approve (or edit) the six Iggi standing lines on the preview page. Each is `draft` until you say so; I then set `approval: { approved, James Papagno, date }`.
2. Promote `iggi-wink` / `iggi-this-way` from candidate to approved if they are the expressions you want beside bubbles — I can't view Cloudinary from here, so this is your call by eye.
3. Sign-offs 2–6: mark them in the Voice Bank when you're ready; the register follows `CHOSEN` automatically.

## What this phase does not do

No live page renders a new bubble or line. Wiring the register into the stay template (an Iggi nudge under Follow the Pathway, say) and into the Iggi embed is Phase 2F-ii, after the lines above are approved and after Iggi Core lands its embed.
