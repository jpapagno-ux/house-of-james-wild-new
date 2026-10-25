import type { Enquiry } from "./enquiry";

// Where each kind of enquiry is delivered at launch (James, 25 Oct 2026).
// Advisor applications and partner submissions go to advisors@jameswildco.com;
// trip enquiries wait for the main house address. Import-free so plain Node
// can test it; SITE.inboxes re-exports this.
export const INBOXES = {
  advisors: "advisors@jameswildco.com",
  partners: "advisors@jameswildco.com",
  trips: null as string | null,
};

export function inboxFor(e: Partial<Enquiry>): string | null {
  if (e.context?.from === "advisor-application") return INBOXES.advisors;
  if (e.context?.from === "partner") return INBOXES.partners;
  return INBOXES.trips;
}
