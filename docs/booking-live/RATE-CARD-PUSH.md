# Pushing a static rate card to the site · the standing order

How a contracted (static) rate card goes from a partner's PDF to "Rates
available · From …" on a Stay page, in the order that keeps every guard in
place. Written from the Lion Sands push of 1 Nov 2026; use it for every card.

The chain: **Airtable (edit, approve)** → **sync** → **Supabase (Booking Live,
one transaction per card)** → **Stay page (the normalized contract)**.
Nothing on the site ever reads Airtable directly, and nothing prices from a
card that isn't Published, approved and in Supabase.

## 0. Before you start

- The stay must exist in Booking Live `properties` (its Ledger ID, e.g.
  `STY-2026-290658`) **and** carry canonical `room_types` (`source_system` set).
  If it doesn't, file the units first (see `supabase/seed/0011_step2_canonical_units.sql`
  for the shape) — the Stay page only assembles for stays that have them.
- Decide the pricing mode per unit: `rate_card` for a card-only stay; `hybrid`
  when the stay is also on the live engine (live wins for the dates, the card
  is the fallback).
- Have the partner's card (PDF/sheet) in hand. Figures come from the card, never
  from a website, an OTA or memory. If you must start from the library's
  "from" rates (as Lion Sands did), say so in Contract Reference and plan the
  real card as the next version.

## 1. Airtable · Commercial Rates base (`appvlwIuBrNrlqaRr`)

**The template (set 1 Nov 2026, from the Lion Sands push).** Don't type the
records by hand. Type the partner's card once as an intake JSON
(`IntakeInput`, see `scripts/booking-live/intake-example-lion-sands.json`) and run

```
node --experimental-strip-types tests/tools/rate-card-intake.ts intake.json
```

`lib/booking-live/rates/intake.ts` builds every record below, in link order,
with **Room Codes equal to the canonical Booking Live codes** (so the sync
updates the canonical units rather than duplicating them), converts per-person
seasons to per-room for the base occupancy with the season name saying so, and
refuses an intake that would fail the sync later (bad codes, seasons outside
the card, a unit with no seasons, unknown occupancy). Create the records with
the Airtable MCP table by table, carrying each table's returned ids into the
next table's `links`, then run the printed link SQL (step 2). `tests/rate-card-intake.test.ts`
and `tests/lion-sands-checkout.test.ts` are the checks a new card should pass
before approval: the same engine, the same figures the traveler will see.

The records, in this order, so links resolve:

1. **Properties** — one row: Ledger ID, Property, Site Slug (= the stay's URL
   slug), Time Zone, Booking Mode **Request**, Merchant Model, Stay Type, Rate
   Source **Rate Card**, Notes (source of the figures, what's missing).
2. **Room Types** — one row per sellable unit, linked to the property.
   `Room Code` must equal the canonical `room_types.code` in Booking Live
   (lowercase, dashes, never changed once rates exist). Max Adults / Children /
   Occupancy as the contract states.
3. **Rate Plans** — one per room (code `fi`, `bb`, `flexible` …), Board Basis,
   Refundability, Inclusions in the traveler's words.
4. **Rate Cards** — one row per contract version (`2027-V1`): Status **Draft**,
   Currency, Effective From/To, Contract Reference, Deposit %, Balance Due
   days, Cancellation Summary (what the traveler reads) and Cancellation Tiers
   (`60:30, 30:100`), Revision 1, linked to the property.
5. **Seasonal Rates** — one row per room × plan × season: Stay Start/End
   (inclusive nights, inside the card's dates), Base Occupancy, **Nightly
   Gross per room** (for Base Occupancy adults; per-person cards are converted
   to per-room and noted), Extra Adult and child bands, Min/Max Nights,
   Priority. Link Rate Card, Room Type, Rate Plan. Tick Active.
6. **Taxes & Fees**, **Promotions**, **Restrictions**, **Contract Terms**
   (private: net/commission) — as the contract says. Leave empty rather than
   guess.

## 2. Link the canonical units (first push for a stay only)

The sync upserts Room Types **by Airtable record id**. A canonical unit that
doesn't carry its Airtable id would be duplicated. Once, per stay:

```sql
update public.room_types r set airtable_record_id = m.at
from (values ('<room code>','rec…'), …) as m(code, at)
where r.code = m.code and r.property_id = (select id from public.properties where slug = '<slug>')
  and r.airtable_record_id is null;
update public.properties set airtable_record_id = 'rec…' where slug = '<slug>' and airtable_record_id is null;
```

(`supabase/manual/0010b_apply_rate_card.sql` must already be installed — it is.)

## 3. Approve

Status **Submitted** → the reviewer checks seasons, taxes, terms → James (or
finance) fills **Approved By** (or Approved At) and **Approved Revision =
Revision** → Status **Published**. The sync refuses a Published card without an
approver, with a revision mismatch, with rates outside the card's dates, with
overlapping published cards for the property, or with a Sample tick outside
Preview. Any later rate change needs a new Revision and a fresh approval (or a
new version, `2027-V2`).

## 4. Sync

Preferred: `POST /api/v1/internal/rates/sync` with the `BOOKING_LIVE_SYNC_SECRET`
(Vercel Cron does the same). It reads the whole base, runs `buildPlan`, writes
properties / room types / plans, then `apply_rate_card` **once per card in one
transaction**, retires cards deleted from Airtable, and writes the Sync Log.

Without the secret (how the Lion Sands push was done): export the base with the
Airtable MCP (`list_records_for_table`, every table, no field filter) into one
JSON file, then

```
node --experimental-strip-types tests/tools/sync-from-export.ts export.json STY-2026-290658 > /tmp/sync.sql
```

Read the first stderr line: `refused` must be `[]`. Run the SQL in Supabase
(MCP `execute_sql` or the SQL editor). It is the same `buildPlan` + `apply_rate_card`
path, so every guard above still applies. Add a **Sync Log** row by hand.

## 5. Verify

```sql
set role anon;
select r.name, s.amount_minor/100 nightly, v.version_label, v.status
from room_types r join properties p on p.id = r.property_id
left join seasonal_rate_rules s on s.room_type_id = r.id and s.active
left join rate_card_versions v on v.id = s.rate_card_version_id
where p.slug = '<slug>' order by r.sort_order; reset role;
```

Every unit should show a nightly figure against the published version under
the **anon** role (that is what the site reads). Then open the Stay page on the
Preview: each unit reads **Rates available · From US$…**, and the detail panel's
provenance line says *Contracted rate · Rate card 2027-V1 · verified <date> ·
availability confirmed on request*. The Stay-page cache is 15 minutes.

## 6. What the traveler sees, by state

A card-priced unit's **Check availability** opens Request to Reserve
(`/booking/property/<slug>`): dates and party → every unit priced night by
night with taxes already in the rate, Florida sales tax, total, deposit and
balance date → Request to Reserve → a stored, immutable quote (held 72 h) →
the house confirms with the property → payment (Phase 3) charges exactly the
stored quote. Worked for every Lion Sands unit in `LION-SANDS-CHECKOUT.md`.

| Card state | Stay page |
| --- | --- |
| no card / Draft / Submitted | Designed for you · Request availability |
| Published + approved + synced | Rates available · From [lowest nightly] · availability on request |
| Published but refused by the sync | unchanged (previous version or Designed for you); reason in Sync Log |
| stay also on the live engine | Live rate for the dates when the engine prices it; the card otherwise |

A card is never availability. Check Availability on a card-only stay routes to
Request to Reserve (`/booking/property/<slug>`), where the quote is priced
night by night from the same card.

## Lion Sands, 1 Nov 2026 (the reference run)

Property `rect5O0FxKCFyFlgv`, card `2027-V1` (`recn93SduMDyKaU7U`), 8 rooms,
8 fully-inclusive plans, 8 "Standard 2027" seasons (library per-person
from-rates × 2; whole residence as listed), approved and published on James's
instruction, synced with `tests/tools/sync-from-export.ts` from
`tests/fixtures/airtable-export-lion-sands.json`. Replace with the contracted
card as `2027-V2` (seasons, child bands, taxes, cancellation tiers, contract terms).
