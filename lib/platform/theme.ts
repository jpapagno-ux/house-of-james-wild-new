// Portal look (James, 2 Nov 2026): every portal (Partner Desk now; Advisor Desk, Traveler Journey and
// the house workspace later) wears the main brand: the same header, logo, type and Deep Sea action.
// The working rooms differ only where it helps people work:
//   - option B "House Ledger" (chosen by James, 2 Nov 2026): a warm stone ground, white cards, warm
//     hairlines, graphite type and graphite buttons (components/platform/portal.module.css)
//   - House Crimson is the house's and the portals' one accent: the seal, Ledger IDs, partner codes,
//     the desk strip rule, the active rail item, Portfolio Health and the "needs you" flags
//   - one fixed set of status colours in every portal: in progress graphite, done Turquoise Green,
//     needs you Crimson on a pale blush
//   - the site header keeps the Deep Sea "Plan with James"; only the working room below it changes
// Values come from lib/palette.ts HOUSE_LEDGER; docs/brand-colours.md.
export const PORTAL_ACCENT = { fill: "#8B2525", tint: "#F3ECEA" } as const; // House Crimson
