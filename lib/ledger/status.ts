// Ledger status → which mark a record may wear.
//
// A stamp is a claim James signs, so it is read ONLY from the record's
// `house_status` (+ `house_status_date`), which a person sets in the Base44
// Ledger after the visit or review happened. The site never infers a status,
// never upgrades one, and prints nothing for "unclassified".
//
//   founder_returned  → "Founder favorite"      (★ returned to ★)       round, oxblood
//   founder_visited   → "Field verified"         (★ toured & stayed ★)   round, oxblood
//   founder_vetted    → "Founder inspected"      (★ & approved ★)        round, oxblood
//   house_approved    → no stamp; a quiet line in the Ledger strip: "House approved"
//   partner_verified  → no stamp; a quiet line: "Partner verified"
//   unclassified      → nothing
//
// Separate, independent marks (each from its own Ledger fact, never from status):
//   host met in person          → HostMark on the host's portrait
//   a verified stay-longer offer → OfferStamp ("Time Rewarded")
//   a place on James's list, not yet vetted → HorizonStamp (never on a Ledger record)
//   an Overland route           → OverlandStamp (field tested + year, or designed by)

export type HouseStatus =
  | "unclassified"
  | "founder_visited"
  | "founder_returned"
  | "founder_vetted"
  | "house_approved"
  | "partner_verified";

export type LedgerStampKind =
  | "Founder favorite"
  | "Field verified"
  | "Founder inspected"
  | "Host met"
  | "Under observation"
  | "Gathering verified";

export function stampForStatus(status?: HouseStatus | null): LedgerStampKind | null {
  switch (status) {
    case "founder_returned":
      return "Founder favorite";
    case "founder_visited":
      return "Field verified";
    case "founder_vetted":
      return "Founder inspected";
    default:
      return null;
  }
}

// The plain-words line shown beside every record (and used in alt text and
// schema descriptions), e.g. "Founder stayed · 2026".
export function statusLine(status?: HouseStatus | null, date?: string | null): string | null {
  const year = date ? date.slice(0, 4) : "";
  const withYear = (s: string) => (year ? `${s} · ${year}` : s);
  switch (status) {
    case "founder_returned":
      return withYear("Founder favorite, returned to");
    case "founder_visited":
      return withYear("Founder stayed");
    case "founder_vetted":
      return withYear("Founder inspected & approved");
    case "house_approved":
      return "House approved";
    case "partner_verified":
      return "Partner verified";
    default:
      return null;
  }
}
