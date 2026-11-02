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

House Crimson/Oxblood (`#8B2525`) is for the house itself: the JW seal, the logo and its rule line,
headings' accents and Ledger IDs. It is never used as a volume colour. From 2 Nov 2026 it is no
longer a button colour: "Plan with James" and every main action wear the Deep Sea action (section 5).

## 4. Pathways are theme chips, never a volume colour

The eight Wild Pathways (`lib/pathways.ts`) cut across volumes. They appear as small chips that
link to the pathway (e.g. "Where the Wild Lives" on Africa) and never replace a volume's ink on a
section, card, pin or stamp. Region → pathway chips live in `lib/content/region-pathways.ts`.

## 5. The Deep Sea palette: buttons, pathway chips and offer stamps

James, 2 Nov 2026: "Deeper blues and deeper colours. Stick to just blues, aquas, and even some aqua
turquoise greens, not so much browns and olives. Match the stamps to these as well."
`lib/palette.ts` is the source; `app/globals.css` carries the same values as `--jw-sea-*`, and
`npm run check:palette` fails the build on drift, on a fill below AA, or on a brown, gold, tan or
olive in a chip, button or offer stamp.

| Token | Fill | White on fill | Tint (outlined chips) | Pathway |
|---|---|---|---|---|
| Deep Navy `--jw-sea-navy` | `#162D54` | 13.66:1 | `#E9ECF2` | PATH-07 A Place of Our Own |
| Ocean Blue `--jw-sea-ocean` | `#1A4A80` | 8.99:1 | `#E8EEF6` | PATH-04 Where the Wild Lives |
| Deep Cerulean `--jw-sea-cerulean` | `#1C6BAE` | 5.58:1 | `#E8F1F9` | PATH-03 Above It All |
| Ink Slate `--jw-sea-slate` | `#3D4C66` | 8.66:1 | `#ECEFF3` | PATH-06 Off the Map |
| Deep Teal `--jw-sea-teal` | `#0C5D61` | 7.63:1 | `#E6F1F1` | PATH-02 Between Tides |
| Deep Aqua `--jw-sea-aqua` | `#08697F` | 6.29:1 | `#E5F2F5` | PATH-08 Rooted in Place |
| Turquoise Green `--jw-sea-turquoise` | `#11705A` | 6.02:1 | `#E8F3EF` | PATH-01 Into the Green |
| Sea Glass `--jw-sea-glass` | `#4A736D` | 5.30:1 | `#EDF2F1` | PATH-05 The Art of Stillness |

- **Buttons and calls to action** read `--jw-action` (Ocean Blue) and `--jw-action-deep` (Deep Teal,
  hover); Tailwind `bg-action` / `text-action`; `.ledger-btn--house` for "Plan with James". They never
  read the page accent, so a Stays, Safaris or Overland page no longer turns its buttons green, saddle
  or olive. One main action colour per page.
- **Pathway chips**: the primary chip is the solid fill with white text; secondary chips are the tint
  with the fill as text and a 30% fill border. The pathway name is always printed.
- **Stamps**: the On the Horizon sun is Stamp Aqua (`#1A8A8A` on light, `#8FD6CF` on dark) with the
  Voyages navy ink; the Time Rewarded offer stamp is inked in Deep Teal.
- **Unchanged**: the seal and logo, the volume inks and volume stamps (section 1), the founder marks,
  The Exceptional Few's per-property palettes (their buttons follow their own accent) and Europe's
  aubergine.

### River waters (James, 2 Nov 2026)

River voyages carry their own set, still without browns, golds or olives, through `.theme-waters-*`
on the Amazon and Nile hubs, their ship and voyage pages, and the By River hub (layouts under
`app/voyages/`). Buttons, accents, selected chips and the card tint follow; pathway chips keep
their pathway colours.

| Waters | Button | Hover | Accent (words, selected chips) | Card |
|---|---|---|---|---|
| Amazon (rainforest) | Emerald `#0A6B4E` 6.51:1 | Jungle `#1D5A3B` 8.15:1 | `#1A4F36` 9.48:1 | `#EEF5F1` |
| Nile (lapis) | Lapis `#23428F` 9.34:1 | Nile Turquoise `#0A6570` 6.76:1 | `#1B3471` 11.82:1 | `#EEF1F8` |
| By River | River Teal `#0E6467` 6.91:1 | Lapis `#23428F` 9.34:1 | `#0E4F52` 9.30:1 | `#EDF4F4` |

## 6. Tidewater grounds (James chose it, 2 Nov 2026)

Site-wide: a near-white page ground, white cards, fine aqua rules, and section bands that rotate gently
between two pale tints, so two bands of the same tint never sit in a row (the rotation runs over sibling
banded sections). Each volume leads with its own tint. `lib/palette.ts` TIDEWATER is the source; the
palette check holds the CSS in step and keeps muted ink AA on every band.

| Token | Value | Use |
|---|---|---|
| `--jw-ground` | `#FCFDFD` | page ground (body, `.ledger-page`) |
| `--jw-card` | `#FFFFFF` | cards (`.ledger-card`, `.ledger-paper`) on every volume except Europe |
| `--jw-rule-fine` | `#D3E6E4` | `.ledger-border` |
| `--jw-rule` | `#B5D3D0` | `.ledger-rule` |
| Band, pale sea-green | `#E8F3EE` | leads on the house and Stays (and Safaris, Gatherings, Overland) |
| Band, pale aqua | `#E5F2F4` | leads on Voyages; the alternate everywhere else |
| Band, Amazon | `#E7F2EA` | Amazon hubs, ships and voyages (alternate: aqua) |
| Band, Nile | `#E8EDF8` | Nile hubs, ships and voyages (alternate: aqua) |

Tailwind `bg-paper-card` and `bg-sand` read the band (`--jw-band-rgb`), so every former parchment panel,
image well and band follows. The atlas (`public/maps/jw-chart.css`, `jw-maps.css`), the header's lower
edge, the Linen footer and the "few left" dates pill moved off parchment and gold too.

Protected, unchanged: The Exceptional Few's dark and day bands, Europe's aubergine (and its card tint),
Gatherings marks, the seal and logo, founder marks and the hourglass. The paper ephemera (postcards,
luggage tags, margin notes, the verdict card) keep their paper colour: they are objects, not grounds.

## Retired

The header tones introduced on 30 Oct 2026 (#8B2525 stays, #A5692A, #405A45, #1E5F73, #94512F,
#5B3A5E) are retired as volume colours. Do not reintroduce them for volumes. The earth-tone pathway
accents (#38634B, #426E79, #73786C, #936F49, #737769, #766B63, #94512F, #8D6958), the brass Horizon sun
(#B08657) and the rust Time Rewarded stamp are retired from 2 Nov 2026, as are the parchment grounds
(#F6F4F0 panel, #EFEAE0 sand, the linen footer, the atlas parchment).

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
