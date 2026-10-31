# Colour: one direction, house-wide

Locked by James, 30 October 2026. Every new page, section, component and session follows this.

## 1. The six volumes have one palette

`lib/volumes.ts` is the **only** place a volume colour is written (approved 29 Oct 2026).
Read it with `volumeInk(key)` (the ink on white) or `volumeLightInk(key)` (on dark grounds).

| Volume | Ink (on white) | Name |
|---|---|---|
| I · Stays | `#3E5A3A` | Bottle Green |
| II · Safaris & Reserves | `#7A4A24` | Saddle Leather |
| III · Gatherings | `#86232C` | Claret |
| IV · Voyages | `#2A3D5C` | Admiralty Navy |
| V · Europe | `#4E2E46` | Aubergine |
| VI · Overland & Expeditions | `#4D4C27` | Field Olive |

The same inks are used for header dots, mega-menu rules, footer tabs, chapter rails, stamps,
badges, map pins and legends, route lines (overland olive, voyages navy) and section markers.
`npm run check:palette` (run before every build) fails the build if the CSS `.vol-*` inks,
Tailwind's `vol.*`, the nav tones or the map categories drift from `lib/volumes.ts`.

## 2. Sections on destination pages take their volume's ink

On region and country pages, each section is inked by the volume it lists, matching its map pins:
Stays in Bottle Green; Safaris and reserves in Saddle Leather; Gatherings residences in Claret;
Journeys split by kind, overland routes in Olive and voyages in Navy. Use
`components/ledger/VolumeSection.tsx` (eyebrow, top rule and card rules in the volume's ink).

## 3. Crimson is the house

House Crimson/Oxblood (`#8B2525`) is for the house itself: headings' accents, the JW seal and
logo, Ledger IDs, and "Plan with James". It is never used as a volume colour.

## 4. Pathways are theme chips, never a volume colour

The eight Wild Pathways (`lib/pathways.ts`) cut across volumes. They appear as small chips that
link to the pathway (e.g. "Where the Wild Lives" on Africa) and never replace a volume's ink on a
section, card, pin or stamp. Region → pathway chips live in `lib/content/region-pathways.ts`.

## Retired

The header tones introduced on 30 Oct 2026 (#8B2525 stays, #A5692A, #405A45, #1E5F73, #94512F,
#5B3A5E) are retired as volume colours. Do not reintroduce them for volumes.

# Media: one Cloudinary library for every site

Locked 31 Oct 2026. Every site (James Wild & Co, Polar Crossings, Gatherings, Expedition Lending,
ARC | TERRA XY, Island Jim) draws on one Cloudinary library (cloud `jhlnq5h5`).
- **Rights live on the asset**, in structured metadata: `rights_status` (approved / hold /
  to_verify), `credit`, `licence_source` (owner, partner, getty, shutterstock, ai_generated),
  `allowed_sites`, `ledger_id`. A page shows an image only when it is approved for that site.
- **Folders follow the public_id path** (lowercase, hyphens, no spaces). Never upload a second copy
  for another site: reuse the one asset and add the site to `allowed_sites`.
- **Alt text is written per page**, not copied across sites; captions credit the owner.
- `scripts/cloudinary/housekeeping.mjs` (GitHub Action "Cloudinary housekeeping") files loose assets
  and fills the rights fields from what each asset already says; dry run first.
