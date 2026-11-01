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

// Advisor-addressed enquiries (James, 31 Oct 2026): while the house is in
// testing a real advisor gets their enquiry directly with hello@ copied.
// Personal addresses never live in lib/content/advisors.ts (public data), so
// they come from the ADVISOR_INBOXES env var, "slug=email,slug=email".
// James himself is hello@; stand-ins and advisors with no address fall back
// to hello@ alone.
export function parseAdvisorInboxes(raw: string | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (raw ?? "").split(",")) {
    const [slug, email] = pair.split("=").map((s) => s.trim());
    if (slug && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) out[slug] = email.toLowerCase();
  }
  return out;
}

export type Delivery = { to: string; cc: string[] } | null;

/** To whom an enquiry is sent, and who is copied. `advisorInboxes` is the parsed ADVISOR_INBOXES map. */
export function deliveryFor(e: Partial<Enquiry>, advisorInboxes: Record<string, string> = {}, fallback: string | null = null): Delivery {
  const base = inboxFor(e) ?? fallback;
  if (!base) return null;
  const from = e.context?.from;
  const isTrip = from !== "advisor-application" && from !== "partner";
  const slug = e.context?.advisor;
  const direct = isTrip && slug && slug !== "james-papagno" ? advisorInboxes[slug] : undefined;
  if (direct && direct !== base) return { to: direct, cc: [base] };
  return { to: base, cc: [] };
}
