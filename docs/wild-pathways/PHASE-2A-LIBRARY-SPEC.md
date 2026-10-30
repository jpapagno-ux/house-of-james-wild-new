# Phase 2A · Library spec: pathways and impact notes in Base44

Status: **proposed, awaiting James's approval before any schema change.** 30 Oct 2026.
Library: "James Wild & Co. Intelligence Library" (`6a7932161e9318dca1f24474`, wild-intel-vault). Read-only inspection only so far.

## What exists today (observed)

- `Stay` (109 fields) already carries `ledger_id`, `house_status`, `house_volume` (single enum of the six keys), `best_for[]`, `fact_blocks`, `faq_blocks`, `aeo_approved`, `content_status`, and the Webflow-era content fields the site renders.
- `Offer` is the house pattern for a dated, sourced, status-gated public record: `record_type`/`record_id`, `volume`, `terms_source` (private), `terms_checked_date`, `workflow_status`.
- `siteExport` (`base44/functions/siteExport/entry.ts`) exports an explicit allowlist of public fields for Stay, Destination and Offer; nothing leaves the library unless named there. Offers export only when `workflow_status` is `published` or `cms_ready`.
- `IggiKnowledge` already models approved, de-identified insight with `source_kind`, `approved_by`, `approved_at`, `status` — the right shape to reuse for the Phase 2F dialogue schema.

## Proposed changes (additive; no existing field renamed or removed)

### A. `Stay` — eight new fields

| Field | Type | Notes |
|---|---|---|
| `primary_pathway` | enum `PATH-01`…`PATH-08` | Sets the record's default accent |
| `secondary_pathways` | array of the same enum | Never contains the primary |
| `pathway_setting` | string | Controlled vocabulary kept in the site (`lib/pathways.ts`): e.g. `bushveld`, `kalahari`, `okavango_delta`, `winelands` |
| `pathway_intentions` | array of string | Traveler intentions, snake_case |
| `pathway_suitability` | array of string | Complements `best_for` (which stays as is) |
| `pathway_status` | enum `draft` / `approved` | Site renders pathway content only when `approved` |
| `pathway_classified_by` | string | Person or "iggi-draft" |
| `pathway_classified_at` | date | |
| `house_volumes` | array of the six volume keys | Multi-volume membership (brief §3: one property, many volumes). `house_volume` stays as the primary and is unchanged |

Same fields, same names, on `Residence`, `Vessel`/`VesselVoyage`, `LandItinerary` and `AfricanReserve` when their volumes are classified (Phase 2B batches 2–6).

### B. New entity `ImpactNote` (modelled on `Offer`)

| Field | Type | Notes |
|---|---|---|
| `name` | string | Short internal label |
| `ledger_id` | string | `IMP-2026-XXXXXX`, assigned by `fillMissingLedgerIds` |
| `record_type` | enum stay / residence / vessel / reserve / itinerary | |
| `record_id` | string | The record's library id; `siteExport` resolves `ref` to the site slug as it does for offers |
| `kind` | enum conservation / habitat / marine / employment / sourcing / culture / community / levy / beneficiary | Matches `ImpactKind` in `lib/pathways.ts` |
| `money` | enum guest_levy / voluntary_donation / property_spend / none | Guest levies, gifts and property spending are never conflated |
| `statement` | string | Public sentence; no figure unless `status` is `verified` |
| `source` | string | **Public** short attribution ("Tswalu Foundation annual report 2025"); the site prints it |
| `source_url` | string | Private; never exported |
| `reviewed_date` | date | Printed on the site |
| `status` | enum verified / partner_reported / pending_review / unavailable | Printed on the site in words |
| `workflow_status` | enum draft / needs_review / cms_ready / published / archived | Exported only when `published` or `cms_ready` |

### C. `siteExport`

- Add the eight `Stay` fields to `STAY_FIELDS`.
- Add `impact_notes`: `ImpactNote` records with `workflow_status` published/cms_ready, public fields only (`id, ledger_id, record_type, record_id, kind, money, statement, source, reviewed_date, status, updated_date`) plus `ref` (site slug), exactly as offers.

### D. Site (this branch — built now, inert until the fields arrive)

- `scripts/library-split.py` writes `data/library/impact-notes.json`.
- `scripts/export-stays.py` emits `pathway` and `volumes` on each stay when the library carries them (null otherwise).
- `scripts/export-impact.py` writes `lib/content/pathways/impact-library.json`.
- `lib/content/pathways/index.ts` reads the library first and falls back to `pathway-map.json`; the JSON file becomes an override for the few cases the library cannot express.
- `scripts/sync-library.sh` gains the impact export step.

## Validation rules (enforced on the site, mirrored in the library UI later)

1. Primary pathway never repeats as secondary.
2. `verified` / `partner_reported` statements must carry a `source`.
3. Any percentage, currency or "revenue" figure is rejected unless `status` is `verified`.
4. Nothing renders publicly while `pathway_status` is `draft`.

## How the change would be made (on approval)

Direct code edit in the Base44 sandbox (no builder credits): add the entity file `base44/entities/ImpactNote.jsonc`, extend `base44/entities/Stay.jsonc`, extend `siteExport/entry.ts`; then `create_checkpoint`. Existing records are untouched (new fields are empty); the nightly site sync picks up nothing until James classifies and approves records.

## Approval needed

- [ ] Field names and enums above
- [ ] `ImpactNote` as a separate entity (vs. a block on `Stay`) — recommended separate, like `Offer`, so one note can be reviewed and dated on its own
- [ ] Go-ahead to edit the library schema and `siteExport`
