// The Stay-page data contract (Step 1, Leeu Estates reference implementation).
//
// One normalized shape the Stay page UI consumes. It is ASSEMBLED on the
// server from the house's sources of truth and never queried piecemeal by
// components:
//
//   James Wild & Co Intelligence Library  → editorial (lib/content/stays.json export)
//   JWC Booking Live / Supabase           → canonical accommodation units + commerce
//   Cloudinary (preferred), legacy CDN    → media
//   Booking engine (Tag Albie) via /api/rates → live rates, merged in the browser
//
// Rules carried by the types:
//   • nothing is invented: every optional field is null/empty when the source
//     has nothing, and the UI collapses it;
//   • a price is never shown without its provenance;
//   • "rate known" and "availability known" are separate facts.

export type PricingSourceType =
  | "LIVE_DYNAMIC"      // rates/availability from an approved live booking source
  | "RATE_CARD"         // an approved supplier rate sheet / seasonal contract
  | "FIXED_DEPARTURE"   // a dated departure (voyages) — reserved for later volumes
  | "FIT_PRICED"        // an itinerary priced by the house — reserved
  | "LEGACY_REFERENCE"  // imported/historical, internal only, never traveler-facing
  | "REQUEST_QUOTE"     // pricing designed/confirmed by an advisor
  | "HYBRID";           // some units/dates live, others card or manual

export type AvailabilityStatus =
  | "available"         // the source confirmed availability for the dates
  | "unavailable"       // the source answered and this unit is not open for the dates
  | "on_request"        // availability is confirmed by the house on request
  | "unknown";          // nothing has been checked

export type BookingMode = "live" | "request" | "inquiry";

/** Where a price came from. Required beside every displayed amount. */
export type PricingProvenance = {
  sourceType: PricingSourceType;
  provider: string;              // "Tag Albie booking engine", "Airtable rate card 2027-V1", "Intelligence Library import"
  currency: string;              // ISO 4217
  retrievedAt: string | null;    // ISO timestamp the live source answered
  verifiedAt: string | null;     // ISO date a card/import was approved or verified
  validFrom: string | null;      // ISO date the price applies from (live: check-in)
  validTo: string | null;        // ISO date the price applies to (live: check-out)
  availability: AvailabilityStatus;
  availabilityCheckedAt: string | null;
  reference: string | null;      // rate plan / rate-card version / legacy room id
};

export type Money = { amount: number; currency: string };

/** A price the traveler may see. `perNight` is derived for display only. */
export type DisplayPrice = {
  total: Money;                  // what the source quoted (live: the whole stay)
  perNight: Money | null;
  nights: number | null;
  label: string;                 // "Best Available Rate" / "2027 contracted rate"
  provenance: PricingProvenance;
};

/** The traveler-facing pricing state of ONE accommodation, resolved per unit. */
export type AccommodationPricingState =
  | { kind: "checking" }                                                            // live search in flight
  | { kind: "live"; options: DisplayPrice[]; dates: { checkIn: string; checkOut: string; adults: number } }
  | { kind: "rate_card"; from: DisplayPrice }                                        // rate known, availability on request
  | { kind: "request_quote"; reason: "no_live_rate_for_dates" | "no_approved_source" | "manual_pricing"; dates?: { checkIn: string; checkOut: string } }
  | { kind: "unavailable_for_dates"; dates: { checkIn: string; checkOut: string } }
  | { kind: "source_error" };                                                       // the live source did not answer

/** Occupancy is shown only when the source marks it verified. */
export type Occupancy = {
  status: "verified" | "unverified";
  maxAdults: number | null;
  maxChildren: number | null;
  maxOccupancy: number | null;
};

export type StayImage = { url: string; alt: string; source: "cloudinary" | "legacy_cdn" | "library" };

export type AccommodationUnit = {
  id: string;                    // Booking Live room_types.id
  code: string;                  // Booking Live room_types.code (stable slug)
  name: string;
  unitType: string | null;       // room | suite | cottage | house | villa | tent …
  group: "room" | "whole";       // rooms/suites vs units taken whole
  shortDescription: string | null;
  fullDescription: string | null;
  occupancy: Occupancy;
  bedConfiguration: string | null;
  size: { sqm: number | null; sqft: number | null };
  view: string | null;
  privatePool: boolean | null;   // null = not stated; never inferred
  privateTerrace: boolean | null;
  connectingAvailable: boolean | null;
  features: string[];            // structured features / amenities
  included: string[];
  excluded: string[];
  importantNotes: string[];      // traveler-facing only; supplier notes never reach here
  founderNote: string | null;
  media: { hero: StayImage | null; gallery: StayImage[] };
  /** The unit's declared pricing behaviour from Booking Live (per unit, not per property). */
  pricingMode: PricingSourceType;
  bookingMode: BookingMode;
  /** Live engine room name to match against /api/rates results (defaults to `name`). */
  liveMatchKey: string;
  /** Internal provenance of imported pricing. NEVER rendered to travelers. */
  legacyReference: { amount: number; currency: string; status: string; sourceRoomId: string | null } | null;
  /** An approved rate card "from" price, when Booking Live has a published card for this unit. */
  rateCardFrom: DisplayPrice | null;
  sortOrder: number | null;
};

export type StayEditorial = {
  slug: string;
  ledgerId: string | null;
  name: string;
  place: string | null;          // "Franschhoek · South Africa"
  country: string | null;
  tagline: string | null;
  quote: string | null;
  overview: string[];            // concise editorial paragraphs
  propertyFeatures: string[];    // the most important property-level features only
  founderNote: string | null;    // Stay-level founder note; rendered only when set
  verdict: { line: string; where: string | null; when: string | null } | null; // "James' take"
  status: { line: string | null; stamp: string | null; date: string | null };
  pathways: { primary: string; secondary: string[] } | null;
  hero: StayImage | null;
  bestMonths: string | null;
};

export type StayCommerce = {
  propertyId: string;
  propertySlug: string;
  propertyBookingMode: BookingMode;
  defaultCurrency: string;
  /** Live engine property key (Tag Albie), when the stay has one. */
  liveEngineProperty: string | null;
  /** Property-level pricing behaviour derived from its units. */
  pricingMode: PricingSourceType;
};

export type StayPageData = {
  editorial: StayEditorial;
  commerce: StayCommerce;
  accommodations: AccommodationUnit[];
  /** What the assembly could not find or verify, for the preview note and QA. Never rendered to travelers. */
  qa: string[];
  assembledAt: string;
};
