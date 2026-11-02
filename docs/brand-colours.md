# Colour: The House Standard

Approved by James, 2 November 2026 (warm neutrals and the Heritage volume set confirmed the same day). A
top-studio approach: restrained, not busy. Five tones, one accent, one gradient. **Photography carries the
colour; pages are paper, stone mist and ink.** This replaces the Deep Sea buttons, the Tidewater sea-green and
aqua bands and the leathers (Field Olive included). Every new page, section, component and session follows it.

Sources: `lib/palette.ts` (house tones, crimson, gradient), `lib/volumes.ts` (the only place a volume colour is
written). `app/globals.css` carries the tokens; `npm run check:palette` runs before every build and fails it on drift.

## 1. Five tones

| Token | Hex | CSS | Use |
|---|---|---|---|
| Paper | `#FFFFFF` | `--jw-paper`, `--jw-ground` | page ground, cards |
| Stone Mist | `#F4F2EF` | `--jw-mist`, band (`bg-paper-card`, `bg-sand`, `bg-mist`) | the only band colour |
| Warm Stone | `#8C8277` | `--jw-stone` (`text-stone`) | numerals, keylines, large secondary words |
| Warm Stone text | `#6B635A` | `--jw-stone-text`, `.ledger-muted`, `.ledger-eyebrow` | small secondary text (5.9:1 on Paper, 5.3:1 on Stone Mist) |
| Graphite | `#2E2B28` | `--jw-graphite` (`text-ink`, `text-graphite`) | text, rules, active chips |
| Ink | `#1A1816` | `--jw-ink` (`bg-ink-deep`) | darkest grounds, the footer |
| Light keyline | `#CFC8BF` | `--jw-keyline`, `.ledger-rule` | secondary button and chip borders, rules |
| Border | `#DCD7D0` | `--jw-hairline`, `.ledger-border` | fine card borders |

- Stone Mist is the only band. A banded section that follows another banded section goes Paper, so two bands never
  run together.
- Warm mists are allowed as quiet panels: Stone Mist and the six volume mists (section 4), these exact tints only.
  Still no parchment textures, no browns, golds or tans as grounds.

## 2. One accent: House Crimson `#8B2525`

Crimson (`--jw-crimson`, `text-house`, `.house-crimson`, `.ledger-id`) is for: the seal, the logo and its rule,
Ledger IDs, key dates and the main action "Plan with James". **One or two crimson touches per screen** (the arrows
and rules of the button family are the approved exception). No other accent colour on general pages.

The general accent that older components read (`--jw-accent`, `.ledger-crimson`, `text-crimson`, `border-crimson`,
`bg-crimson`) is now **Graphite**, deepening to Ink. That one change keeps hundreds of eyebrows, hovers and active
fills quiet. Reach for `text-house` / `.ledger-id` only for the crimson touches above.

## 3. One gradient: Ink to Garnet

`linear-gradient(90deg | 180deg, #1A1816, #2E2B28, #3A1C1F, #5A1F23)` (`--jw-gradient`, `.jw-gradient`). Use only
for hero photo fades (bottom fade to `rgba(38,20,22,0.88)`, `--jw-hero-fade`, `.jw-hero-fade`), the ticker band
(home places marquee) and the opening. Nowhere else.

## 4. Volumes: the Heritage set

Natural pigments, warm to cool. A volume is told apart by a **5px tab** in its base, its **map pins**, and an
occasional **volume-mist panel**. Never coloured sections, buttons or chips. **Volume words use the deep value**
(the bases for saffron, ochre and limestone fail AA as text).

| Volume | Name | Base (tab, pins) | Deep (words) | Light (on dark) | Mist (quiet panel) |
|---|---|---|---|---|---|
| III Gatherings | Terracotta | `#A2482E` | `#5A2418` | `#DDA48E` | `#F7EDE8` |
| II Safaris & Reserves | Burnt Ochre | `#C2621E` | `#6B3510` | `#EDB98A` | `#FBF0E6` |
| VI Overland & Expeditions | Saffron | `#C4952A` | `#6B5212` | `#E9CF8E` | `#FAF4E4` |
| V Europe | Olive | `#6E7537` | `#353A1E` | `#C2C79A` | `#F2F3E8` |
| IV Voyages | Verdigris | `#3F7A70` | `#1E3F3A` | `#A9CCC4` | `#EDF4F2` |
| I Stays | Limestone | `#8C8277` | `#3D3934` | `#CFC8BF` | `#F4F2EF` |

How it flows (one edit swaps the set):
- `lib/volumes.ts` `VOLUME_STYLES`: `leather` = `pad` = base, `deep`, `light`, `tint` = mist.
- Helpers: `volumeLeather(k)` (tab), `volumeMark(k)` (pins, legends, dots, stamps), `volumeInk(k)` / `volumeText(k)`
  (words and rules: the deep), `volumeMist(k)`, `volumeLightInk(k)`.
- `volumeCss()` generates `:root { --vol-<k>-leather/-ink/-deep/-light/-mist }`, `.vol-<k> { --vol }` and the
  `.theme-vol-<k>` / `-page` scopes (`--vol-leather`, `--vol`, `--vol-deep`, `--vol-mist`); `app/layout.tsx`
  injects it. Tailwind `vol.*`, `leather.*`, `vol-mist.*`, `vol-deep.*` read those variables.
- No volume hex lives in `app/globals.css`, `tailwind.config.ts`, components, pages or maps. The palette check fails
  the build if one appears (it only warns inside the What's Coming build while that is in flight).
- The header's top edge (`.vol-tab` idea, kept at 3px so the sticky height does not move), the mega-menu panels and
  the footer volume cards carry the tab; `.vol-tab` / `.vol-tab-top` give any element a 5px edge in `--vol-leather`.

## 5. The button family (James approved, 2 Nov 2026, 17:59), chips and fields

Three levels, one set of classes in `app/globals.css`; no page styles its own buttons.

1. **The Ledger column**: the main action ("Plan with James", Hold a cabin, Check rates, Enquire, Send).
   `.ledger-btn--house`, `.ledger-btn--solid`, `.ledger-btn--primary`, and **every `.ledger-btn` that links to
   `/plan`**. A flex row 56px high (`.ledger-btn--compact` 48px, used in the header; 40px inside the sticky bars; full
   width on phones in the page), 1px Ink `#1A1816` border, square. Label: Manrope 12px 600, uppercase, 0.24em, Ink,
   24px in from the left. On the right a crimson `#8B2525` cell, 56px wide, holding a white 18x12 arrow (stroke 1.3);
   on hover and focus it widens to 84px (300ms; no animation with reduced motion). Focus ring: 2px crimson outline,
   3px offset. On dark or photographs (`.ledger-btn--light`, or inside `bg-ink*`, `.on-dark`, `.jw-onphoto`,
   `.jw-gradient`) the border and label go white; the cell stays crimson. The river waters re-tint the cell
   (`--jw-action`).
2. **The editorial line**: quiet links and secondary actions (View the stay, Read more, See dates, All voyages, card
   links): `.ledger-btn`, `.ledger-btn-ghost`. No box: Cormorant Garamond italic 22px (`.ledger-btn--lg` 28px; ghost
   20px), Ink words, a crimson arrow that stretches from 34px to 60px on hover and a 1px crimson rule beneath that
   grows from 28% to 100%. On dark the words go white and the arrow and rule take the soft crimson `#D7A7AA`.
3. **The seal**: the signature moment, used once, in the homepage "James knows a place" band (`.jw-seal-cta`): a
   64px round crimson wax seal (`radial-gradient(#A83636, #8B2525, #5E1717)`, "JW" in Cormorant) beside "Plan with
   James" in Cormorant 26px, "HE ANSWERS PERSONALLY" in Plex Mono beneath; on hover the seal turns -14deg and scales
   1.05.

- The arrows and cells are pseudo-elements, so no markup changes when a page uses the classes.
- **Chips, filters, tabs and search fields** stay squared graphite (`.house-chip`): Graphite and Warm Stone on white;
  active = Graphite fill and white words (`aria-pressed`, `aria-selected`, `aria-current`, `.is-active`), or a crimson
  underline (`.jw-tab`). No pills: a global rule squares any interactive or padded element that asked for
  `rounded-*` (dots, avatars and pins keep their round; `.jw-round` opts out).
- The Exceptional Few keeps its own buttons (its accent, squared, no cell or arrow).

## 6. Type

Cormorant Garamond display (400 at large sizes, line-height 0.92 to 1 for heroes: `.ledger-h1`, `.ledger-h2`);
Manrope body; IBM Plex Mono for eyebrows, Ledger IDs and dates with wide tracking (`.ledger-eyebrow`, `.ledger-id`).
Nav labels (header, menus, footer navigation) are small uppercase tracked Manrope (`.ledger-nav`).

## 7. Wild Pathways: graphite chips, a 6px dot

Pathway chips are squared graphite-outline chips with the pathway name; the pathway colour survives only as the
6px dot (`lib/pathways.ts` accent; `text` is Graphite and `tint` is Paper for all eight). The primary chip has the
Graphite border. Region pathway chips live in `lib/content/region-pathways.ts`.

## 8. Protected

- **River waters** (`.theme-waters-amazon | -nile | -river`, `lib/palette.ts` `WATERS_PALETTE`): their buttons,
  accents and pale bands stay; their buttons are squared like every other.
- **The Exceptional Few** (`.theme-ef-*`): per-property palettes, dark and day bands, own button accent (squared).
- Map pins, legends and route lines (volume bases), the seal artwork, founder marks, the hourglass and stamps
  (the On the Horizon sun keeps `STAMP_AQUA`; the Time Rewarded stamp keeps its teal: for James to confirm).
- Paper ephemera (postcards, luggage tags, margin notes, the verdict and calling cards) keep their paper colour:
  they are objects, not grounds.

## 9. The footer and "James knows a place"

- Homepage, just above the footer: `HouseInvitation` (`components/ledger/SiteFooter.tsx`): a Stone Mist band, James's
  portrait (4:5) with a 5px crimson tab and the round JW seal, "TALK TO THE HOUSE", "James knows a place." in
  Cormorant 92px light, the seal action and the phone, then 1982 / 44 years / J.W.
- The footer: warm Ink (`linear-gradient(180deg, #1A1816 70%, #241A19)`), `lib/palette.ts` `FOOTER` tones (body
  `#E9E4DE`, secondary `#B8AFA5`, legal `#8C8277`, labels in Plex Mono soft crimson `#D7A7AA`, rules `#3D3934`,
  field `#5A534B`). Top row: seal, "James Wild & Co." and the weekly entry field. Five columns: The Volumes (3x14px
  Heritage tabs), Destinations, The House (with the trade links), Before You Go, Talk to the House. Then the
  credentials and the legal line.

## 10. Copy

No em or en dashes in public copy.

## Retired (2 Nov 2026)

The Deep Sea action and its tokens (`--jw-sea-*`, ocean blue buttons), the Tidewater grounds (sea-green and aqua
bands, aqua rules, the `#F1F8F6` header wash), the cool House Standard draft (`#F4F5F6`, `#8A939B`, `#2B2F33`), the
leathers (Bottle Green, Saddle, Claret, Admiralty Navy, Aubergine as volume colours) and Field Olive, the per-volume
page accents (`.theme-vol-*` no longer re-tints the page), the Voyages navy accent on `.theme-sea`, the Linen footer
(the footer is Ink), the sage and rust Impact Note (now Stone Mist, Graphite, Warm Stone text). Earlier: the 30 Oct
header tones, the earth-tone pathway accents, the brass Horizon sun and the parchment grounds.

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
