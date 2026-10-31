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
