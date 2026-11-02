import { PATHWAYS_ON } from "@/lib/content/pathways/flag";

// Wild Pathways on Voyages (James, 1 Nov 2026: chips switch on site-wide when Voyages launches).
// Switched on in its own commit (Voyages launch); revert that commit to switch it off again.
export const VOYAGES_LAUNCHED = true;
export const VOYAGE_PATHWAYS_ON = PATHWAYS_ON && VOYAGES_LAUNCHED;
