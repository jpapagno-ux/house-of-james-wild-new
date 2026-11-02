import { PATHWAYS_ON } from "@/lib/content/pathways/flag";

// Wild Pathways on Voyages (James, 1 Nov 2026: chips switch on site-wide when Voyages launches).
// Off until the launch commit flips VOYAGES_LAUNCHED, so that one commit can be reverted alone.
export const VOYAGES_LAUNCHED = false;
export const VOYAGE_PATHWAYS_ON = PATHWAYS_ON && VOYAGES_LAUNCHED;
