// The postmark on the hero: one switch for the whole site, and a per-page
// switch. Keys: "stay:<slug>", "camp:<reserve>/<camp>", "reserve:<slug>".
export const MARKS_ON = true;
export const MARK_OFF = new Set<string>([
  // "stay:example-slug",
]);
export const markOn = (key: string) => MARKS_ON && !MARK_OFF.has(key);
export const yearOf = (ledgerId?: string | null) => ledgerId?.match(/\d{4}/)?.[0] ?? "2026";
