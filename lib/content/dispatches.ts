import type { Dispatch } from "@/components/record/Dispatches";

// Dispatches from the road, by stay slug. A line is filed here only when the traveler chose to share it
// from My Folio and the House approved it: first name and date, never a family name, never a child's name.
// Nothing is written for a traveler.
export const DISPATCHES: Record<string, Dispatch[]> = {};

// Stays that show the band before a first dispatch arrives, with an open card inviting one
// (James, 22 Nov 2026: Noah's Forest by Tifakara first).
const OPEN = new Set(["noah-forest-by-tifakara"]);

export const dispatchesFor = (slug: string): Dispatch[] => DISPATCHES[slug] ?? [];
export const openForDispatches = (slug: string): boolean => OPEN.has(slug);
