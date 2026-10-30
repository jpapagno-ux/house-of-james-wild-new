# Wild Pathways · Phase 1 Review Packet and Phase 2 Proposal

James Wild & Co · Living Ledger · Compass · 30 Oct 2026
Branch `feature/wild-pathways-foundation` (cut from `main` at `e2ad822b`) · commits `7170e67` → `151135b`
Preview deploy: `house-of-james-wild-5nbpf7vku-james-papagno-projects.vercel.app` (branch deploy; production untouched)

## 1. What to open

| Preview | Path | What it shows |
|---|---|---|
| Token sheet | `/preview/pathways` | Brief vs repository palette, eight accents with contrast, impact palette, volume aliases, links to all previews |
| Stays landing | `/preview/pathways/stays` | Six prominent pathway cards (all eight reachable), featured stays with chips, impact introduction, Compass and Ledger entries, advisor close |
| Featured stay | `/preview/pathways/stay/tswalu-reserve` (+ leeu-estates, monwana-thornybush, tengile-mala-mala-kirkmans-kamp, wilderness-mombo-luxury-camp) | Template in the brief's order with the Impact Note and Follow the Pathway |
| Pathway collection | `/preview/pathways/where-the-wild-lives` (+ seven more keys) | One collection page per pathway |
| Compass | `/preview/pathways/compass` | Traveller and trade views of the pathway adapter; pure-safari readings hand to Crux |
| Ledgers | `/preview/pathways/ledger` | Traveler journey, saved stays and advisor folio with the same chips; permissions in words |

Every preview is `noindex`; the live Stays pages, `/compass`, the six volumes and the Booking Live flags are unchanged. The SEO snapshot of every live page is byte-identical to `main`.

## 2. Acceptance against the brief (Foundation V1.3 §11)

| Criterion | Status | Evidence |
|---|---|---|
| Six Volumes intact | ✓ | `lib/volumes.ts` keys, romans, colours unchanged; `VOLUME_BRIEF_ID` aliases VOL-01…06 (D1) |
| Existing Compass working | ✓ | `components/destination/Compass.tsx` untouched; adapter is a separate pure module |
| No overwritten live data | ✓ | No Base44, Airtable, Supabase or Cloudinary writes; pathway data lives in `lib/content/pathways/pathway-map.json`, outside the nightly sync |
| One property, many relationships | ✓ | Monwana: Safaris + Stays, PATH-04 primary + PATH-07; one Ledger ID, one URL (`recordHref`) |
| Dialogue centrally governed | deferred by James | Existing gates (`verdicts.ts`, voice bank `CHOSEN`, Iggi origin tags) preserved; central schema scheduled for Phase 2 after data population |
| Claims are sourced | ✓ | `validatePathwayMap` rejects unsourced verified/partner statements and any figure that is not verified; Impact Note prints status, review date and source |
| Traveler/trade data secured | ✓ | No account data read in previews; trade view shows no prices or nets; Booking Live RLS and flags untouched |
| Palette consistent | ✓ | Additive semantic tokens; House root accent and volume themes unchanged (D2) |
| Mobile and keyboard accessibility | ✓ | `docs/wild-pathways/ACCESSIBILITY.md`: 0 violations in new components, keyboard walk, reduced motion, 390px scans |
| No bulk Wild Earth Stays import, merge or release | ✓ | Five sample records only; nothing merged or deployed to production |

Deliverables (§11): architecture audit and preservation map ✓ (`claude/phase1-architecture-audit.md` in the project); Ledger structure and access model ✓ (§6 of the audit, Ledger preview); James/Iggi inventory partial (assets located, schema deferred); Stays landing and featured-stay previews ✓; Impact Note ✓; Compass preview and cross-volume linkage ✓; 3–5 sample records ✓ (five); brand token comparison ✓; mobile/desktop, accessibility and SEO checks ✓; feature branch and preview URL ✓; test results ✓ (49 passing, 13 new).

## 3. Decisions taken (all by James, 30 Oct 2026)

| # | Decision |
|---|---|
| D1 | VOL-01…06 alias the live keys; nothing renumbered |
| D2 | Keep white / ink #2D2A26 / oxblood #8B2525 / Cormorant + Manrope; brief tokens added as semantic aliases |
| D3 | PATH-01 #38634B (forest #405A45 reserved for the Impact Note); PATH-07 #94512F (existing residence rust); PATH-03/04/05 darkened the smallest step for AA white text |
| D4 | Compass adapter in this repo only; safari and Botswana readings stay with Crux |
| D5 | Push access granted; branch created |
| — | Extend Booking Live as the Ledger backbone; no parallel identity |
| — | Impact Note wording approved |
| — | James/Iggi dialogue schema deferred until data population |

## 4. Awaiting sign-off

1. The five draft classifications in `pathway-map.json` (primary, secondary, volumes, suitability).
2. PATH-05 The Art of Stillness at #737769 (darkened from #929785): judge on the Vercel preview with photographs.
3. The House-wide `.ledger-eyebrow` contrast (3.43:1) — in scope or separate?
4. The illustrative card photographs on the Stays landing (one Ledger stay per pathway, chosen for the preview).

## 5. Risks carried forward

- `main` moves nightly (library sync). The branch should be rebased before any merge; conflicts are expected only in `app/globals.css`, `tailwind.config.ts`, `lib/volumes.ts` and the regenerated JSON.
- `template-pass-marks`, `fonts-cormorant-manrope` and `library-offers` touch the same stay template and sync script; merge order to be agreed.
- `tests/seo-baseline.json` is stale on `main` (126 of 489 pages); re-snapshot after the release branches land.
- Pathway classification is hand-kept in a JSON file. That is right for five records and wrong for 374: Phase 2 moves it into the library.

## 6. Phase 2 proposal — "Populate and connect"

Goal: take the Phase 1 models from five samples to the live Ledger, without a second content engine.

**2A · Source of truth for pathways (Base44 library)**
- Add to the Stay (and Camp, Residence, Voyage, Route) record: `primary_pathway`, `secondary_pathways[]`, `setting`, `intentions[]`, `suitability[]`, `pathway_status` (draft / approved), `classified_by`, `classified_at`.
- Extend `siteExport` and `scripts/export-stays.py` to carry those fields; `pathway-map.json` becomes a fallback override file, not the source.
- Impact statements as their own library record (`impact_notes`: record, kind, money, statement, source, reviewed, status), exported alongside offers.
- Owner: Base44 library; sync: nightly action, as today; IDs: existing Ledger IDs; fallback: the override file.

**2B · Classification pass**
- James approves pathway assignments in the library in batches by volume: Stays with verdicts first (≈ 20), then Safaris, Gatherings, Voyages, Overland, Europe.
- Iggi-assisted draft classification from record text (same rules as `suitedTo`), always marked draft until approved.

**2C · Live pages (flag-gated, `NEXT_PUBLIC_PATHWAYS=on`)**
- `/pathways` and `/pathways/[key]` as real routes (CollectionPage + ItemList JSON-LD, FAQ in James's governed voice, noindex until approved, then added to `LIVE_ROUTES`).
- Stays landing: pathway cards and chips replace the preview; the featured-stay template gains the Impact Note and Follow the Pathway sections behind the same flag.
- Cross-volume: Safaris, Gatherings, Voyages, Overland and Europe hubs surface matching pathways via `onPathway`.

**2D · Compass**
- Add the "Where are you drawn?" pathway step to the live Compass behind the flag, using the adapter; results carry pathway chips and reasons; safari readings keep handing to Crux.
- Trade presentation on `/for-advisors` once the Advisor Desk (Booking Live Phase 2) exists.

**2E · Ledger**
- Saved stays and folio items carry `primary_pathway` (denormalised from `properties`, no new table); "Save to My Ledger" label behind the existing SAVE flag; Compass readings saved only on consent.
- Advisor folio shortlist view (trade) as the first Advisor Desk screen.

**2F · James & Iggi**
- Central dialogue schema (`lib/content/dialogue.ts`: characterId, page, audience, intent, text, tone, source, approval, volume, pathway, asset) seeded from existing approved lines; drafts marked draft; rabbit and chameleon assets inventoried in Cloudinary.

**2G · SEO / AEO (marketing)**
- Eight pathway pages are the House's natural "best stays for X" answer surfaces: one H1 per pathway name, the setting as the H2, an `AnswerBlock` paragraph, 4–6 FAQs, CollectionPage + ItemList schema, internal links from every classified record (Follow the Pathway) and from the volume hubs.
- Keywords: map `data/seo-keywords.json` clusters to pathways (rainforest lodges → PATH-01, private island → PATH-02/07, wellness retreats → PATH-05, etc.) before writing the pages.
- `llms.txt`: add a pathways section so answer engines can cite the taxonomy by name.
- Re-snapshot the SEO baseline on `main`, then on the feature branch, so the guard reports only real change.

**Gate for Phase 2:** classifications approved for the first batch; library fields added and exported; flag off in production; same acceptance checks as Phase 1 re-run on live routes.

Estimated order: 2A → 2B (first batch) → 2C → 2D → 2E → 2F → 2G runs alongside 2C.
