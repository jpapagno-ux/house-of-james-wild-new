// Estimated rate cards (James, 4 Nov 2026: Lion Sands' estimated 2027 prices stay on the site, marked
// "to be confirmed", until MORE's 2027 rate sheet replaces them). A card's seasons say when its rates are
// estimates (the house writes "verify" or "estimated" in the season while it waits for the contract), so
// the label follows the data and drops off by itself when the real card is loaded.

const ESTIMATE = /\b(verify|estimat\w*|from-rate)\b/i;

export const isEstimateSeason = (season: string | null | undefined): boolean => ESTIMATE.test(season ?? "");

/** The season as a traveler reads it: "Standard 2027 (library from-rate x2, verify)" becomes "Standard 2027". */
export function seasonLabel(season: string): string {
  if (!isEstimateSeason(season)) return season;
  return season.replace(/\s*\([^)]*\)\s*$/, "").trim() || season;
}

export const TBC = "To be confirmed";
export const tbcNote = (name: string) =>
  `Prices marked ${TBC.toLowerCase()} are estimated from ${name}'s published rates while their new rates are finalised. The house confirms the exact price before anything is held or charged.`;
