import type { Enquiry } from "./enquiry";
import { SITE } from "./site";

// Advisor applications and partner submissions go to advisors@jameswildco.com;
// trip enquiries go to the main house inbox once it's confirmed.
export function inboxFor(e: Partial<Enquiry>): string | null {
  if (e.context?.from === "advisor-application") return SITE.inboxes.advisors;
  if (e.context?.from === "partner") return SITE.inboxes.partners;
  return SITE.inboxes.trips;
}
