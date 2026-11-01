# Stay page · the normalized contract (Step 1, Leeu Estates reference)

Branch `feature/leeu-stay-page-v1`. Leeu Estates (`/stays/leeu-estates`,
STY-2026-000148) is the first Stay rendered from one normalized contract
instead of the hand-written room list in `lib/content/priced-stays.ts`.

## Sources of truth → one contract → the page

| Layer | Source | Adapter |
| --- | --- | --- |
| Editorial | Intelligence Library export (`lib/content/stays.json`), house verdict and Ledger status | `lib/stay-page/adapters/editorial.ts` |
| Accommodation units + commerce | JWC Booking Live (Supabase `properties`, `room_types`, published `rate_card_versions` / `seasonal_rate_rules`) | `lib/stay-page/adapters/booking-live.ts` (anon key, RLS, cached 15 min) |
| Media | Cloudinary ids on the unit first, then the source URLs carried over from the migration; retired hosts dropped | `lib/stay-page/adapters/media.ts` |
| Live rates | Tag Albie engine through the **unchanged** `GET /api/rates` route | merged in the browser by `lib/stay-page/pricing.ts` |

`lib/stay-page/assemble.ts` builds `StayPageData` (`lib/stay-page/contract.ts`)
and `app/stays/[slug]/page.tsx` renders it with `components/stay/*`. If Booking
Live has no canonical units for the slug, or cannot be reached, `assemble`
returns `null` and the page keeps its previous layout (`BookingPanel`), so the
live band is never lost.

## Canonical units

A `room_types` row is canonical when `source_system` is set (migrated from the
Intelligence Library) and its name carries no "(sample)" / "prototype". Leeu:
13 canonical units; the Airtable-born "Manor House Suite (sample)" is hidden.

## Pricing states, per unit

`resolvePricingState(unit, search, live)` in `lib/stay-page/pricing.ts`:

| Declared mode (`room_types.pricing_mode`) | Live answer for the dates | Published card | Traveler sees |
| --- | --- | --- | --- |
| LIVE_DYNAMIC / HYBRID | yes | — | **Live rate**, every plan with provenance, Check availability (engine, deep-linked) |
| LIVE_DYNAMIC / HYBRID | none for the dates | yes | **Rates available · From [card]**, availability confirmed on request |
| LIVE_DYNAMIC / HYBRID | none for the dates | no | **Designed for you** · Request availability |
| LIVE_DYNAMIC / HYBRID | engine down | — | plain "the engine didn't answer", Request availability |
| RATE_CARD | ignored | yes / no | From [card] / Designed for you |
| REQUEST_QUOTE, FIT_PRICED, FIXED_DEPARTURE, LEGACY_REFERENCE | ignored | yes / no | From [card] / Designed for you |

`legacy_reference` prices (`reference_from_rate`) are read onto the contract for
ordering and QA only, are stripped before the client bundle, and are never an
input to the resolver (`tests/stay-page.test.ts` asserts it).

Every displayed price carries `PricingProvenance`: source type, provider,
currency, retrieved_at / verified_at, valid_from / valid_to, availability
status and its check time, and the rate plan or card reference.

## Empty-state rules

Occupancy renders only when `occupancy_status = 'verified'`; null booleans,
empty arrays and empty strings collapse. Nothing is invented.

## QA (preview only)

Assembly notes (hidden records, units without photographs, unverified
occupancy, thin records) render in a dashed "Preview notes" box on non-production
deployments only.

## Step 2 (1 Nov 2026): Kayumanis, Le Quartier Français, Lion Sands

- The page now assembles the contract for **every** stay Booking Live lists with
  canonical units (`bookingLiveSlugs()`, one cached query), not only Leeu.
- Engine keys for the three Kayumanis stays live in `ENGINE_OVERRIDE`
  (`lib/content/stays.ts`) until the library carries them. Kayumanis Sanur is on
  the engine (`kayumanis-sanur`) but has no Ledger record, so it is not built.
- `lib/rates.ts` now reads rate plans from the engine's `RateCard` articles
  (plan name in `<h2>`), because Kayumanis and Le Quartier name their plans
  freely; the fixed-plan search remains the fallback and Leeu is unchanged.
- Canonical units were filed by `supabase/seed/0011_step2_canonical_units.sql`:
  Kayumanis Nusa Dua 4 · Ubud 4 · Jimbaran 2 (engine occupancy and beds,
  `source_system = tag_albie_engine`, `occupancy_status = verified`; library-only
  units unverified) · Le Quartier Français 6 (engine facts + library photos and
  reference rates) · Lion Sands 8 (library reserve record, `pricing_mode =
  rate_card`, per-person reference rates kept internal).
- Lion Sands is **not** on the engine. A Properties row, eight Room Types, one
  Fully-inclusive plan each and a **Draft** `2027-V1` card with one "Standard
  2027" season per room were scaffolded in the Commercial Rates base. The
  season figures are the library's per-person from-rates × 2 (whole residence
  as listed) and are placeholders: replace them with the contracted card, then
  Submit → Approve → Publish → sync. **Update, later on 1 Nov:** on James's
  instruction the card was approved, published and synced (8 rules, USD); Lion
  Sands now shows "Rates available · From US$3,886". The procedure is written up
  in `RATE-CARD-PUSH.md`; the contracted card should follow as `2027-V2`.
- Photographs: Kayumanis units have none on record yet (cards say "Photograph
  to follow"); Le Quartier and Lion Sands use the library's room photographs.
