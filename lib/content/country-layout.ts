// The new country page (James said "go" on 3 Nov 2026, 15:32, for Indonesia first): one order for every country,
// switched on per country here once James has reviewed it. Countries not listed keep their current page.
//   1 Hero (answer, three quick facts, the real advisors, Plan with James) · 2 Live board · 3 In short + key facts ·
//   4 The Atlas · 5 When to go · 6 Is it for you? · 7 Where to go · 8 How to see it · 9 Where to stay · 10 Voyages ·
//   11 From the field · 12 Questions · 13 Plan it.
export const COUNTRY_LAYOUT = new Set<string>(["indonesia"]);
export const countryLayoutOn = (slug: string) => COUNTRY_LAYOUT.has(slug);

/** The live board (lib/content/board.ts liveBoard): on for these countries and regions; the rest keep the What's
 *  Coming ticker they have. */
export const LIVE_BOARD = new Set<string>(["indonesia", "asia"]);
export const liveBoardOn = (slug: string) => LIVE_BOARD.has(slug);

/** Drafts for James show on previews only, never on production, until he approves them. */
export const showDrafts = () => process.env.VERCEL_ENV !== "production";
