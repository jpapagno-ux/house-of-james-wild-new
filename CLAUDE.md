# House rules for anyone building this site

## Colour: The House Standard (James approved, 2 Nov 2026)
- Five warm tones, one accent, one gradient: Paper `#FFFFFF`, Stone Mist `#F4F2EF` (the only band), Warm Stone
  `#8C8277` (text `#6B635A`), Graphite `#2E2B28`, Ink `#1A1816`; keylines `#CFC8BF`, borders `#DCD7D0`. Source:
  `lib/palette.ts`. Photography carries the colour.
- House Crimson `#8B2525` is the single accent: seal, logo and rule, Ledger IDs, key dates, "Plan with James".
  One or two crimson touches per screen. `--jw-accent` / `.ledger-crimson` / `text-crimson` are Graphite now; use
  `text-house` / `.ledger-id` for real crimson.
- The one gradient, Ink to Garnet (`#1A1816, #2E2B28, #3A1C1F, #5A1F23`): hero photo fades, the ticker, the opening.
- Volumes (the Heritage set) come only from `lib/volumes.ts`: a 5px tab, map pins and an occasional volume-mist
  panel, never sections, buttons or chips; volume words use the deep (`volumeInk`). Never write a volume hex anywhere
  else: `volumeCss()` feeds the CSS variables and `npm run check:palette` (before every build) fails on drift.
- Buttons, chips, fields and tabs are squared (2px), never pills: `.ledger-btn` (secondary), `.ledger-btn--house`
  (Plan with James; every `.ledger-btn` to `/plan` wears it), `.ledger-btn--light` on dark, `.jw-chip`.
- Pathway chips are graphite outlines with a 6px pathway dot. River waters and The Exceptional Few are protected.
- No em or en dashes in public copy; no parchment textures; no browns, golds or tans as grounds.
- Media: one Cloudinary library for every site; rights in structured metadata, one copy per
  image, folders = public_id path (see `docs/brand-colours.md`, "Media").
- Full rule: `docs/brand-colours.md`.

## Sources (James, 31 Oct 2026)
- Facts, photos and pins for a property come only from that brand's own website (or its owner's
  media kit). Never use competitors as a source: other agencies, tour operators, booking sites,
  review sites or third-party guides. If the brand site can't supply it, flag the record for
  follow-up in Stay Studio instead of filling the gap.

## What's coming (James, 31 Oct 2026)
- Lodges that are announced, opening or rebuilding are tagged "WHAT'S COMING SECTION" in their
  Stay Studio review notes (Singita Elela, Dec 2026; andBeyond Xaranna Okavango Delta Lodge,
  Aug 2027). A dedicated site section will be built later as a separate build.

## Verified facts (James, 1 Nov 2026)
- Before writing about any property, check `docs/verified-facts.md`. Facts there override older copy
  anywhere on the site (e.g. Wilderness Ruckomechi: suites not tents, swimming pool not infinity pool,
  closed 20 Nov to 31 Mar).

## Dates (James, 1 Nov 2026)
- Dated content (offers, departures, sailings, sessions) is hidden automatically once its end date
  passes; the site rebuilds daily. Weekly and monthly syncs (to be built) also re-check terms and
  pull new dates. One rule, one helper: `lib/dates.ts`. Full rule: `docs/site-rules.md`.

## Where the house sells (James, 1 Nov 2026)
- No Habitas properties anywhere (Habitas closed Tulum and Namibia; records are excluded in the library).
- No Middle East stays, pages or maps (e.g. UAE, Oman, Jordan, Saudi Arabia, Qatar, Israel). Turkey may be added later.
- Egypt and Morocco are Africa, not the Middle East, and can be sold.
- No Malawi (James, 31 Oct 2026). Ethiopia is a future country (Lale's Camp held).
