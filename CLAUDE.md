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
