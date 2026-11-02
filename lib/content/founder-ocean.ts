// The founder's surf and dive credential (James, 2 Nov 2026): one short line on James's advisor card
// where the page is about the ocean. His own statement: he has surfed and dived in Costa Rica, the
// Bahamas, the Galápagos, Peru, Panama and Indonesia; French Polynesia (Tahiti) since 1995, when his first trip surfed Teahupo'o, guiding and selling
// surf travel there ever since, and a Gold Certified Tahiti Specialist (Tahiti Tourisme); the
// Bahamas (Eleuthera) since 1983; diving and surfing for 44 years.
//
// Rules: the line speaks to the place, never to a stay or a sailing he has not stated. The one
// sailing on record is Aliikai in Raja Ampat, November 2024. No dashes, one line per card.
// Pure module (no imports), so the tests load it with plain Node.

export const FOUNDER_OCEAN_YEARS = 44;

/** Country pages (slugs) where James has stated he surfed and dived. */
export const SURFED_AND_DIVED: string[] = ["costa-rica", "bahamas", "ecuador-galapagos", "peru", "panama", "indonesia", "tahiti"];
/** Country pages that get the general line only: ocean country, not yet stated as surfed or dived (Palawan is a planned trip). */
export const OCEAN_GENERAL: string[] = ["philippines"];

const HERE = "Surfer and diver: has surfed and dived here.";
const GENERAL = `Surfer and diver for ${FOUNDER_OCEAN_YEARS} years.`;
/** French Polynesia: a Gold Certified Tahiti Specialist (Tahiti Tourisme's Tahiti Specialist Program, James, 2 Nov 2026;
 *  profile link to follow); surfing there since his first trip in 1995. */
const TAHITI = "Gold Certified Tahiti Specialist: has surfed and dived here since 1995.";
/** Windstar's Tahiti ships: James has sailed Windstar in French Polynesia with his wife, but which ship is not yet
 *  stated, so the line names the waters, never a ship (James, 2 Nov 2026). */
export const TAHITI_SHIP_LINE = "Gold Certified Tahiti Specialist: has surfed and dived in French Polynesia since 1995.";

/** Ocean-led voyage pages: the hubs and ship pages that carry James's card with the line. */
export const OCEAN_PAGES: Record<string, string> = {
  "/voyages/galapagos": "Surfer and diver: has surfed and dived the Galápagos.",
  "/voyages/indonesia": "Surfer and diver: has surfed and dived in Indonesia.",
  // The one ship he has sailed, as stated.
  "/voyages/ships/aliikai": "Surfer and diver: has surfed and dived in Indonesia, and sailed Aliikai in Raja Ampat in November 2024.",
  "/voyages/ships/star-breeze": "Gold Certified Tahiti Specialist: has surfed and dived in French Polynesia since 1995.",
  "/voyages/ships/wind-star": "Gold Certified Tahiti Specialist: has surfed and dived in French Polynesia since 1995.",
};
/** Galápagos ship pages: the place only; he has not sailed these ships. */
export const GALAPAGOS_SHIP_LINE = "Surfer and diver: has surfed and dived the Galápagos.";
/** Wild Pathways where the line belongs: Between Tides (islands and oceans). */
export const OCEAN_PATHWAYS: string[] = ["PATH-02"];

/** The line for James's card on a country page, or null where the page is not one of his ocean places. */
export function founderOceanForCountry(countrySlug: string | null | undefined): string | null {
  if (!countrySlug) return null;
  if (countrySlug === "tahiti") return TAHITI;
  if (SURFED_AND_DIVED.includes(countrySlug)) return HERE;
  if (OCEAN_GENERAL.includes(countrySlug)) return GENERAL;
  return null;
}
export const founderOceanForPathway = (pathwayId: string) => (OCEAN_PATHWAYS.includes(pathwayId) ? GENERAL : null);
/** The line for a voyage page: a hub or ship path; Galápagos ships take the place line. */
export function founderOceanForVoyage(path: string, waters?: string | null): string | null {
  return OCEAN_PAGES[path] ?? (waters === "galapagos" && path.startsWith("/voyages/ships/") ? GALAPAGOS_SHIP_LINE : null);
}
