// Portal look (James, 2 Nov 2026): every portal (Partner Desk now; Advisor Desk, Traveler Journey and
// the house workspace later) wears the main brand: the same header, logo, type and Deep Sea action.
// The working rooms differ only where it helps people work:
//   - white working surfaces with hairline rules (no tinted panels: data reads cleaner on white)
//   - one quiet portal accent for wayfinding (the desk strip rule, the active rail item, Portfolio
//     Health), from the Deep Sea set: Partner Desk = Deep Teal. Advisor and Traveler will take Ocean
//     and Sea Glass when they are built, so a person moving between rooms knows where they are.
//   - one fixed set of status colours in every portal
//   - House Crimson stays the house's: the seal, Ledger IDs, partner codes, the house's own notes
// Values come from lib/palette.ts (DEEP_SEA, HOUSE_LEDGER); docs/brand-colours.md section 5.
export const PORTAL_ACCENT = { fill: "#0C5D61", tint: "#E6F1F1" } as const; // Deep Teal
