// Rate-card intake: the template every static (contracted) card follows,
// set as code so each new partner is scaffolded the same way Lion Sands was
// (1 Nov 2026) instead of by hand.
//
// Input: the stay's canonical Booking Live units (room_types) and the card's
// headline terms. Output: the Airtable records to create, table by table, in
// the order their links resolve, with Room Codes that EQUAL the canonical
// codes (so the sync updates the canonical rows instead of duplicating them),
// plus the SQL that links the canonical rows to the Airtable record ids once
// they exist. Pure, no imports: plain Node tests it.
//
// What it never does: invent a rate. Seasons come in as the partner's card
// states them (per room for a base occupancy); a per-person card is converted
// to per-room × base occupancy and the season name says so, until Phase 2b
// adds the per-person basis.

export type IntakeUnit = { code: string; name: string; maxAdults: number | null; maxChildren: number | null; maxOccupancy: number | null; bedConfiguration?: string | null; description?: string | null };
export type IntakeSeason = { season: string; stayStart: string; stayEnd: string; nightly: number; basis: "per_room" | "per_person_sharing"; baseOccupancy?: number; extraAdult?: number | null; child0to3?: number | null; child4to11?: number | null; child12to17?: number | null; minNights?: number | null; priority?: number };
export type IntakeTax = { name: string; kind: "Tax" | "Fee"; basis: "% of room" | "Per person per night" | "Per room per night" | "Per stay"; percent?: number; amount?: number; includedInRate: boolean; jurisdiction?: string; minAge?: number };
export type IntakeInput = {
  ledgerId: string; slug: string; propertyName: string; timeZone: string;
  stayType: "Lodge" | "Resort" | "Family Residence"; merchantModel?: "Supplier-direct" | "House collection" | "Connected account";
  units: IntakeUnit[];
  plan: { code: string; name: string; boardBasis: "Room only" | "Bed & breakfast" | "Half board" | "Full board" | "Fully inclusive"; refundability: "Refundable" | "Partially refundable" | "Non-refundable"; inclusions?: string | null };
  card: { label: string; currency: string; effectiveFrom: string; effectiveTo: string; contractReference: string; depositPercent?: number; depositFixed?: number; balanceDueDays: number; cancellationSummary: string; cancellationTiers?: string; sampleData?: boolean; notes?: string };
  /** Seasons per unit code. A unit with no seasons is created (so it can be priced later) but the card will refuse to publish without an active rate for it. */
  seasons: Record<string, IntakeSeason[]>;
  taxes?: IntakeTax[];
};

export type AirtableWrite = { table: "Properties" | "Room Types" | "Rate Plans" | "Rate Cards" | "Seasonal Rates" | "Taxes & Fees"; key: string; fields: Record<string, unknown>; links: Record<string, string[]> };
export type IntakePlan = { writes: AirtableWrite[]; problems: string[]; linkSql: (ids: Record<string, string>) => string; perPersonConverted: string[] };

const CODE = /^[a-z0-9-]{1,60}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function buildIntake(input: IntakeInput): IntakePlan {
  const problems: string[] = [];
  const writes: AirtableWrite[] = [];
  const converted: string[] = [];
  if (!/^[A-Z]{3}-\d{4}-\d{6}$/.test(input.ledgerId)) problems.push(`Ledger ID "${input.ledgerId}" isn't STY-YYYY-NNNNNN`);
  if (!/^[a-z0-9-]{2,120}$/.test(input.slug)) problems.push(`slug "${input.slug}" isn't a site slug`);
  if (!/^[A-Z]{3}$/.test(input.card.currency)) problems.push("card currency must be an ISO code");
  if (!DATE.test(input.card.effectiveFrom) || !DATE.test(input.card.effectiveTo) || input.card.effectiveTo < input.card.effectiveFrom) problems.push("card effective dates missing or reversed");
  if (input.card.label.length > 60) problems.push("card label longer than 60 characters");
  if (!input.units.length) problems.push("no canonical units: file the units in Booking Live first");
  if (input.card.depositPercent != null && (input.card.depositPercent < 0 || input.card.depositPercent > 1)) problems.push("deposit % must be a fraction 0–1 (0.3 = 30%)");

  const propKey = `property:${input.slug}`;
  writes.push({ table: "Properties", key: propKey, links: {}, fields: {
    "Ledger ID": input.ledgerId, Property: input.propertyName, "Site Slug": input.slug, "Time Zone": input.timeZone,
    "Booking Mode": "Request", "Merchant Model": input.merchantModel ?? "Supplier-direct", "Stay Type": input.stayType, "Rate Source": "Rate Card",
    Notes: input.card.notes ?? `Scaffolded by the rate-card intake template (lib/booking-live/rates/intake.ts). Room Codes equal the canonical Booking Live codes; run the link SQL after creating these records, then approve and sync (docs/booking-live/RATE-CARD-PUSH.md).`,
  } });

  const seen = new Set<string>();
  for (const u of input.units) {
    if (!CODE.test(u.code)) problems.push(`unit "${u.name}": code "${u.code}" isn't lowercase-with-dashes (1–60)`);
    if (seen.has(u.code)) problems.push(`unit code "${u.code}" repeats`);
    seen.add(u.code);
    const occ = u.maxOccupancy ?? u.maxAdults ?? null;
    if (!occ) problems.push(`unit "${u.name}": max occupancy unknown — the card needs it (Max Adults / Max Occupancy)`);
    writes.push({ table: "Room Types", key: `room:${u.code}`, links: { Property: [propKey] }, fields: {
      "Room Code": u.code, "Room Name": u.name, "Max Adults": u.maxAdults ?? occ ?? 2, "Max Children": u.maxChildren ?? 0, "Max Occupancy": occ ?? 2, Active: true,
      Description: [u.bedConfiguration, u.description].filter(Boolean).join(". ") || undefined,
    } });
    writes.push({ table: "Rate Plans", key: `plan:${u.code}:${input.plan.code}`, links: { "Room Type": [`room:${u.code}`] }, fields: {
      "Plan Code": input.plan.code, "Plan Name": input.plan.name, "Board Basis": input.plan.boardBasis, Refundability: input.plan.refundability, Inclusions: input.plan.inclusions ?? undefined, Active: true,
    } });
  }

  const cardKey = `card:${input.card.label}`;
  writes.push({ table: "Rate Cards", key: cardKey, links: { Property: [propKey] }, fields: {
    Card: input.card.label, Status: "Draft", Currency: input.card.currency, "Effective From": input.card.effectiveFrom, "Effective To": input.card.effectiveTo,
    "Contract Reference": input.card.contractReference, "Deposit %": input.card.depositPercent ?? undefined, "Deposit Fixed": input.card.depositFixed ?? undefined,
    "Balance Due (days before arrival)": input.card.balanceDueDays, "Cancellation Summary": input.card.cancellationSummary, "Cancellation Tiers": input.card.cancellationTiers ?? "",
    Revision: 1, "Sample Data": input.card.sampleData ?? false,
  } });

  for (const u of input.units) {
    const seasons = input.seasons[u.code] ?? [];
    if (!seasons.length) problems.push(`unit "${u.name}": no seasons — the card can't publish until it has an active rate for every unit it lists`);
    seasons.forEach((s, i) => {
      if (!DATE.test(s.stayStart) || !DATE.test(s.stayEnd) || s.stayEnd < s.stayStart) problems.push(`unit "${u.name}" season "${s.season}": dates missing or reversed`);
      if (s.stayStart < input.card.effectiveFrom || s.stayEnd > input.card.effectiveTo) problems.push(`unit "${u.name}" season "${s.season}": outside the card's effective dates`);
      if (!(s.nightly >= 0)) problems.push(`unit "${u.name}" season "${s.season}": nightly rate missing`);
      const base = s.baseOccupancy ?? (u.maxOccupancy && u.maxOccupancy > 2 && s.basis === "per_room" ? u.maxOccupancy : 2);
      const perRoom = s.basis === "per_person_sharing" ? s.nightly * base : s.nightly;
      const name = s.basis === "per_person_sharing" ? `${s.season} (per person × ${base}, verify)` : s.season;
      if (s.basis === "per_person_sharing") converted.push(`${u.name} · ${s.season}`);
      writes.push({ table: "Seasonal Rates", key: `season:${u.code}:${i}`, links: { "Rate Card": [cardKey], "Room Type": [`room:${u.code}`], "Rate Plan": [`plan:${u.code}:${input.plan.code}`] }, fields: {
        Season: name, "Stay Start": s.stayStart, "Stay End": s.stayEnd, "Base Occupancy": base, "Nightly Gross": perRoom,
        "Extra Adult": s.extraAdult ?? undefined, "Child 0-3": s.child0to3 ?? undefined, "Child 4-11": s.child4to11 ?? undefined, "Child 12-17": s.child12to17 ?? undefined,
        "Min Nights": s.minNights ?? undefined, Priority: s.priority ?? 0, Active: true,
      } });
    });
  }

  (input.taxes ?? []).forEach((t, i) => {
    if (t.basis === "% of room" ? t.percent == null : t.amount == null) problems.push(`tax "${t.name}": ${t.basis === "% of room" ? "percent" : "amount"} missing`);
    writes.push({ table: "Taxes & Fees", key: `tax:${i}`, links: { "Rate Card": [cardKey] }, fields: {
      Name: t.name, Kind: t.kind, Basis: t.basis, Percent: t.percent ?? undefined, Amount: t.amount ?? undefined, "Included in Rate": t.includedInRate, Jurisdiction: t.jurisdiction ?? undefined, "Min Age": t.minAge ?? undefined,
    } });
  });

  const linkSql = (ids: Record<string, string>) => {
    const rows = input.units.filter((u) => ids[`room:${u.code}`]).map((u) => `('${u.code}','${ids[`room:${u.code}`]}')`);
    return [
      `-- Link the canonical Booking Live units to their Airtable Room Types (run once, before the first sync).`,
      rows.length ? `update public.room_types r set airtable_record_id = m.at from (values ${rows.join(", ")}) as m(code, at)\n  where r.code = m.code and r.property_id = (select id from public.properties where slug = '${input.slug}') and r.airtable_record_id is null;` : `-- (no room ids supplied)`,
      ids[propKey] ? `update public.properties set airtable_record_id = '${ids[propKey]}' where slug = '${input.slug}' and airtable_record_id is null;` : `-- (no property id supplied)`,
    ].join("\n");
  };

  return { writes, problems, linkSql, perPersonConverted: converted };
}

/** Group writes by table in creation order; links are resolved by the caller as it creates each table. */
export function intakeOrder(plan: IntakePlan): AirtableWrite["table"][] {
  return ["Properties", "Room Types", "Rate Plans", "Rate Cards", "Seasonal Rates", "Taxes & Fees"].filter((t) => plan.writes.some((w) => w.table === t)) as AirtableWrite["table"][];
}
