import type { Enquiry } from "./enquiry";

// Where each kind of enquiry is delivered at launch (James, 25 Oct 2026).
// Advisor applications and partner submissions go to advisors@jameswildco.com;
// trip enquiries go to hello@jameswildco.com. Import-free so plain Node
// can test it; SITE.inboxes re-exports this.
export const INBOXES = {
  advisors: "advisors@jameswildco.com",
  partners: "advisors@jameswildco.com",
  trips: "hello@jameswildco.com" as string | null,
  // The Traveller Folio: booking information, Book now confirmations and
  // live updates during travel, each sent from myfolio@ and referenced by
  // the traveller's Folio ID (James, 25 Oct 2026). Used once booking is live.
  folio: "myfolio@jameswildco.com",
};

/** Subject line for any Folio email, always carrying the traveller's ID. */
export const folioSubject = (folioId: string, what: string) => `${what} · Folio ${folioId}`;

export function inboxFor(e: Partial<Enquiry>): string | null {
  if (e.context?.from === "advisor-application") return INBOXES.advisors;
  if (e.context?.from === "partner") return INBOXES.partners;
  return INBOXES.trips;
}
