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
| 30 Oct 2026 | Merge prep | Rebased on `f385855`; PR #32 opened |
| 30 Oct 2026 | PR #32 merge, production flag, make `/pathways` indexable | Approved and done: #32 squash-merged (`56de8bb`), sync run (`7d831d4`), #33 merged (`39cfc54`) |
| 30 Oct 2026 | Impact Notes batch 1 (21) | All published; Jaci's 27.2% and Angama US$20 pppn set `verified` by James; sync `568caca` |
| 30 Oct 2026 | Phase 2D Compass pathway reading on live `/compass` | Approved; shipped behind the flag |
| 30 Oct 2026 | Phase 2G SEO/AEO: keyword targets, tuned titles/descriptions, `llms.txt` pathways section | Shipped |
| 1 Nov 2026 | Pathway-apply channel + batch-3 refinements (#21) | Shipped |
| 1 Nov 2026 | 2F-ii feed: `/api/v1/dialogue` and `dialogueFeed` on the Iggi embed | Shipped |
| 1 Nov 2026 | House-wide audit; pathway lists and Compass name only stays with a page | Shipped |
| 1 Nov 2026 | Pathway pages as collections; soft safari handoff (#110) | Shipped |
| 1 Nov 2026 | Compass reads the whole Ledger (#107): 426 stays + 11 journeys, pathway gate, /compass/ledger.json | Shipped |
| 31 Oct 2026 | Batch 3: every live stay classified (364), approved and synced | Shipped |
| 31 Oct 2026 | Phase 2B approvals: 11 journeys live on the pathway pages; Ted Turner Reserves classified (library) | Shipped |
| 31 Oct 2026 | Phase 2B (voyages + overland routes): trip-map.json, cross-volume entries on pathway pages, `/preview/pathways/journeys` with 11 drafts | Code shipped; drafts await James |
| 30 Oct 2026 | Phase 2F dialogue register: schema, rules as code, asset inventory, review preview (no live rendering yet) | Shipped; approvals recorded same day |
| 30 Oct 2026 | Phase 2E Ledger pathway chips on saved stays and folio items (no schema change; chips resolve from the export by slug) | Shipped |

## Open

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Batch 1 classifications | James | **Closed** — 40 records approved in the library, 30 Oct 2026 (`pathway_classified_by: James Papagno (batch 1, drafted by Iggi)`) |
| 2 | `tests/seo-baseline.json` stale on `main` (126 of 489 pages) | this initiative | Closed 30 Oct 2026 — re-snapshotted under production env (550 pages, 491 indexable); snapshot now records real robots state |
| 3 | Stay template: hard-coded `#8a7f70` caption colour (3.82:1) and hero photo-dot buttons at 12×2px (WCAG 2.5.8 target size) | this initiative | Closed 30 Oct 2026 — captions use the `ink.faint` token (5.08:1); dots keep the 2px bar inside a 24×24 target. axe: 0 contrast / target-size issues on stay and country pages |
| 4 | James & Iggi central dialogue schema and asset inventory (rabbit art not in repo) | this initiative | Closed 30 Oct 2026 — `lib/content/dialogue.ts` + register, `docs/wild-pathways/DIALOGUE.md`, preview `/preview/pathways/dialogue`; the rabbit is the house hare seal in the brand kit |
| 5 | Base44 `siteExport` picks up the 2A change | — | **Closed** — confirmed by the 30 Oct manual sync (`7d831d4`): 30 approved classifications exported |
| 7 | Vercel `NEXT_PUBLIC_PATHWAYS=on` | — | **Closed** — set on Preview (07:37) and Production (08:42) on James's instruction |
| 9 | Ten approved batch-1 records are not yet in the site export (Serian camps, Sheba's Secret Garden, Angama Safari Camp, Casa Koko): no site slug / not live. They surface when those records are published to the site | library | Open |
| 10 | Phase 2F review | James | Closed 30 Oct 2026 — standing lines, wink / this-way expressions and sign-offs 2–7 approved |
| 17 | **Pinned:** wording audit of Iggi's six standing lines (approved 30 Oct 2026 to unblock 2F-ii; James wants a later pass on the words) | James + this initiative | Open — pinned |
| 18 | Phase 2F-ii: bubbles on stay pages and the Compass (30 Oct); `/api/v1/dialogue` feed + `dialogueFeed` on the embed URL (1 Nov). Site side closed; Core reads the feed per HANDOFF.md §6.3 | Iggi Core effort | Site side closed 1 Nov 2026 |
| 12 | Naming: traveller's saved collection is the **Folio** ("Save to My Folio"); the **Ledger** is the house portfolio — its volumes and content vetted by James Wild. Decided by James 30 Oct 2026; no account copy changes | James | Closed |
| 14 | Dulini Daunara Lodge linked to the Botswana destination in the library | James | Closed 30 Oct 2026 — relinked to South Africa (same destination as the other Dulini lodges) with James's approval; Okavango coordinates cleared, real pin still wanted |
| 15 | Stay record: literal `<br/>` shows as text in the Airport field | this initiative | Closed 30 Oct 2026 — exporter `line()` strips tags and joins breaks with ' · ' for `airport_name`; Tswalu's committed JSON patched the same way ahead of the nightly sync |
| 16 | axe on stay pages (pre-existing): room-photo scrollers and the mobile record bar lack keyboard access (`scrollable-region-focusable`); some content outside landmarks (`region`) | stay template owner | Open |
| 19 | 2B batch 2: eleven voyages and routes approved by James 31 Oct 2026 ("Approve all"); the four Ted Turner Reserves classified in the library the same day (Vermejo PATH-04, Ladder PATH-07, Armendaris PATH-06, Sierra Grande PATH-05) | James | Closed |
| 20 | 2B remaining volumes: Gatherings residences have no detail records yet (Morukuru preview only; Ted Turner houses link out), so nothing to classify until Gatherings pages exist. Library entities Residence / VesselVoyage / LandItinerary gain the pathway fields when the site starts reading them from the library | this initiative | Deferred |
| 21 | Batch 3 refinements: place-level `pathway_setting` for all 364 (146 settings, e.g. okavango_delta, maasai_mara, tulum) and the 35 tertiary pathways restored, applied through the new **pathway-apply channel** (`scripts/data/pathway-apply.json` → `.github/workflows/pathway-apply.yml` → library `pathwayApply`, OIDC, main only, pathway fields only). Future batches go the same way: a reviewed commit, never a hand write | this initiative | Closed 1 Nov 2026 |
| 22 | Compass reads the whole Ledger: 426 stays + 11 journeys answer; records served from `/compass/ledger.json` (page 493 KB → 150 KB); pathway gate (a named setting limits answers to its pathways); suitability from `bestFor`; founder marks tie-break; two-per-country diversity | this initiative | Closed 1 Nov 2026 — merged #107 |
| 23 | Public pathway pages and the Compass reading no longer name Crux: the handoff is to "the house's safari desk, Wild & Co Safaris" (James, 1 Nov 2026: soft handoff, one name, no confusion). Iggi's Crux line reworded the same way (counts toward #17). Internal names (ids, D4) unchanged | this initiative | Closed |
| 24 | Library regions: Camp Hwange → Zimbabwe, Isla Palenque → Panama (1 Nov). **Mozambique destination record created** (`6ae726820ae4b87e53618886`, region Africa, `coming_soon`) with Gorongosa and Benguerra Island linked to it; the export names the country and region but links no page until the record is live. Copy, hero and sections from the brands' sites, then flip to live | James / content | Open — fill and go live |
| 25 | House-wide audit 1 Nov 2026 (`docs/wild-pathways/HOUSE-AUDIT-1-NOV.md`): findings B2–B10 for the owning efforts (scrollers without keyboard access, 10px ribbon contrast, `<dl>` structure, redirect stubs, /for-advisors/apply); C11 pathway page weight: countries fold beyond eight cards (Wild 1.86 → 0.97 MB); the remaining weight is `next/image` srcset length, proposed as a `next.config` deviceSizes trim for the chrome effort | owners per finding | Open |
| 13 | Saving a Compass reading to a traveller's Ledger on consent (brief §5): deferred until the Advisor Desk / Booking Live Phase 2 defines where readings live; today "Send this reading to James" goes to /plan | this initiative | Deferred |
| 11 | Semrush API units: the pathway keyword targets were set from live results pages; refresh volumes and difficulty when units are available (semrush.com/mcp-access) | James | Open |
| 8 | HubShell breadcrumb only two levels on `/pathways/[key]` | this initiative | Closed 30 Oct 2026 — HubShell takes a `trail`; pathway pages show Home › Pathways › name and emit one BreadcrumbList (the page-level duplicate removed) |
| 6 | Branch merge order with `template-pass-marks`, `fonts-cormorant-manrope`, `library-offers` | James | Open — agree before any merge |

## Closed

| Date | Item |
|---|---|
| 30 Oct 2026 | Impact Note captions at 75–80% opacity on sage (3.5–3.9:1) → full forest copy |
| 30 Oct 2026 | Featured-stay preview `##anchor` double hash in RecordNav |
| 30 Oct 2026 | `.ledger-eyebrow` / `ink.faint` at 0.55 alpha → 0.68 site-wide; `/stays` 24 → 0 axe violations, home and `/compass` 0 |
| 30 Oct 2026 | Phase 2A library change made and checkpointed (`6ae47b6d4d1dfe912bede7e2`): Stay +9 fields, `ImpactNote` entity, `IMP` Ledger prefix, `siteExport` additions. Existing records untouched. |
