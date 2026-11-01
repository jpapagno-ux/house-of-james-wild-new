# House rules for anyone building this site

## Colour (locked by James, 30 Oct 2026)
- Volume colours come only from `lib/volumes.ts` (`volumeInk`, `volumeLightInk`). Never write a
  volume hex anywhere else. `npm run check:palette` runs before every build and fails on drift.
- Destination-page sections are inked by their volume (stays green, safaris saddle, gatherings
  claret, overland olive, voyages navy), matching the map pins.
- House Crimson is for the house: seal, logo, Ledger IDs, "Plan with James". Never a volume colour.
- Wild Pathways are small theme chips linking to the pathway; they never replace a volume colour.
- Region pathway chips (approved 31 Oct 2026) live in `lib/content/region-pathways.ts`.
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
