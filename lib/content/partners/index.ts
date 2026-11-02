import type { Partner } from "./types";
import { ANTARCTICA21 } from "./antarctica21";
import { ECOVENTURA, GALAXY_CRUISES, ROYAL_GALAPAGOS, VIANATURA } from "./galapagos";
import { RASCAL_VOYAGES, SILOLONA_SOJOURNS } from "./indonesia";

// The partner registry: one record per house partner, each rendered by app/partners/[partner]
// (components/partners/PartnerPage). To add one (Ecoventura, A&K, andBeyond), file its record
// beside antarctica21.ts and list it here; the page, the /partners list and the sitemap follow.
export type { Partner } from "./types";
export const PARTNER_LIST: Partner[] = [ANTARCTICA21, ROYAL_GALAPAGOS, GALAXY_CRUISES, ECOVENTURA, VIANATURA, RASCAL_VOYAGES, SILOLONA_SOJOURNS];
export const partnerBySlug = (slug: string) => PARTNER_LIST.find((p) => p.slug === slug);
export const partnerPath = (slug: string) => `/partners/${slug}`;
/** The partner whose fleet a ship sails in (her page links to the partner page). */
export const partnerForShip = (ship: string) => PARTNER_LIST.find((p) => p.fleet?.includes(ship));
