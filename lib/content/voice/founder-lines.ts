// Founder lines (James, 11 Nov 2026: "quotes for me across some of these stays and cruises"). Short verdicts for the
// places James has slept on or sailed, drafted from what he has told the house and marked by him in the Voice Bank
// ("Verdicts, round 2", artifact JW8ybHnhwER5BgXmk5xet6, collection `picks`, ids vr-*). Only lines he marked "Use it"
// or rewrote "my way" are copied here; nothing is ever written for him. Keyed by page: "stay:<slug>" or "ship:<slug>".
// They fill the verdict column of the why / who / verdict band where there is no full Ledger verdict yet.

export type FounderLine = { line: string; where: string; when: string };

export const FOUNDER_LINES: Record<string, FounderLine> = {
  // filled from James's marks in the Voice Bank
};

export const founderLine = (key: string): FounderLine | undefined => FOUNDER_LINES[key];
