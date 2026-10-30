# Wild Pathways · Follow-ups and sign-off log

Running record. One line per item; closed items stay for the audit trail.

## Sign-offs (James)

| Date | Item | Decision |
|---|---|---|
| 30 Oct 2026 | D1 Volume IDs | Alias VOL-01…06; no renumbering |
| 30 Oct 2026 | D2 House tokens | Keep white / ink / oxblood / Cormorant + Manrope; brief tokens additive |
| 30 Oct 2026 | D3 Pathway accents | PATH-01 #38634B, PATH-07 #94512F; PATH-03/04/05 darkened for AA |
| 30 Oct 2026 | D4 Compass scope | Adapter in this repo; safari/Botswana with Crux |
| 30 Oct 2026 | D5 Push access | Granted; `feature/wild-pathways-foundation` |
| 30 Oct 2026 | Impact Note wording | Approved |
| 30 Oct 2026 | PATH-05 at #737769 | Approved |
| 30 Oct 2026 | Stays landing card photographs | Approved |
| 30 Oct 2026 | `.ledger-eyebrow` contrast | In scope; fixed (alpha 0.55 → 0.68) |
| 30 Oct 2026 | Phase 2 "Populate and connect" | Approved to proceed |
| 30 Oct 2026 | Phase 2A spec: field names, `ImpactNote` as its own entity, go-ahead to edit library schema + `siteExport` | Approved |
| 30 Oct 2026 | Batch 1 (40 records) pathway classifications | Approved as drafted |
| 30 Oct 2026 | Merge prep | Rebased on `f385855`; PR #32 opened, awaiting James's merge |

## Open

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Batch 1 classifications | James | **Closed** — 40 records approved in the library, 30 Oct 2026 (`pathway_classified_by: James Papagno (batch 1, drafted by Iggi)`) |
| 2 | `tests/seo-baseline.json` stale on `main` (126 of 489 pages) | release-branch owner | Open — re-snapshot on `main` after Beckon releases land |
| 3 | Stay template: hard-coded `#8a7f70` caption colour (3.82:1) and hero photo-dot buttons at 12×2px (WCAG 2.5.8 target size) | `template-pass-marks` | Open — pre-existing, outside this branch |
| 4 | James & Iggi central dialogue schema and asset inventory (rabbit art not in repo) | this initiative | Deferred to Phase 2F, after data population |
| 5 | Base44 library: confirm the published `siteExport` carries `impact_notes` after the next nightly sync (if not, a Base44 deploy is needed — ask James first) | this initiative | Open — check 31 Oct |
| 7 | Vercel: set `NEXT_PUBLIC_PATHWAYS=on` on the **Preview** environment only, so branch deploys show the live routes | James (or on his say-so) | Open |
| 8 | HubShell breadcrumb is two levels (Home › page); `/pathways/[key]` wants Home › Pathways › name. Small change to `components/hub/Hub.tsx` shared with every hub; do with care | this initiative | Open |
| 6 | Branch merge order with `template-pass-marks`, `fonts-cormorant-manrope`, `library-offers` | James | Open — agree before any merge |

## Closed

| Date | Item |
|---|---|
| 30 Oct 2026 | Impact Note captions at 75–80% opacity on sage (3.5–3.9:1) → full forest copy |
| 30 Oct 2026 | Featured-stay preview `##anchor` double hash in RecordNav |
| 30 Oct 2026 | `.ledger-eyebrow` / `ink.faint` at 0.55 alpha → 0.68 site-wide; `/stays` 24 → 0 axe violations, home and `/compass` 0 |
| 30 Oct 2026 | Phase 2A library change made and checkpointed (`6ae47b6d4d1dfe912bede7e2`): Stay +9 fields, `ImpactNote` entity, `IMP` Ledger prefix, `siteExport` additions. Existing records untouched. |
