import type { AccommodationUnit } from "@/lib/stay-page/contract";

// Essential facts for one unit. Every row comes from a stated value; an
// unverified occupancy, a null boolean or an empty string renders nothing.

export function factRows(u: AccommodationUnit): [string, string][] {
  const rows: [string, string][] = [];
  const o = u.occupancy;
  if (o.status === "verified") {
    if (o.maxOccupancy) rows.push(["Sleeps", `up to ${o.maxOccupancy}`]);
    if (o.maxAdults) rows.push(["Adults", `up to ${o.maxAdults}${o.maxChildren ? ` · children up to ${o.maxChildren}` : ""}`]);
  }
  if (u.bedConfiguration) rows.push(["Beds", u.bedConfiguration]);
  if (u.size.sqm || u.size.sqft) rows.push(["Size", [u.size.sqm ? `${u.size.sqm} m²` : null, u.size.sqft ? `${u.size.sqft} sq ft` : null].filter(Boolean).join(" · ")]);
  if (u.view) rows.push(["View", u.view]);
  if (u.privatePool != null) rows.push(["Private pool", u.privatePool ? "Yes" : "No"]);
  if (u.privateTerrace != null) rows.push(["Private terrace", u.privateTerrace ? "Yes" : "No"]);
  if (u.connectingAvailable != null) rows.push(["Connecting", u.connectingAvailable ? "Can connect" : "Not connecting"]);
  return rows;
}

/** The one or two words on the collapsed card: "Sleeps 2 · 1 queen bed · 48 m²" (verified facts only). */
export function cardFactLine(u: AccommodationUnit): string | null {
  const bits = [
    u.occupancy.status === "verified" && u.occupancy.maxOccupancy ? `Sleeps ${u.occupancy.maxOccupancy}` : null,
    u.bedConfiguration,
    u.size.sqm ? `${u.size.sqm} m²` : u.size.sqft ? `${u.size.sqft} sq ft` : null,
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : null;
}

export default function AccommodationFacts({ unit }: { unit: AccommodationUnit }) {
  const rows = factRows(unit);
  if (!rows.length) {
    return unit.occupancy.status !== "verified" ? <p className="text-[14px] ledger-muted">Sleeping plan and occupancy are confirmed with your quote.</p> : null;
  }
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
      {rows.map(([k, v]) => <div key={k} className="border-t ledger-border pt-2"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 text-[15px]">{v}</dd></div>)}
      {unit.occupancy.status !== "verified" && <p className="col-span-2 text-[13px] ledger-muted">Occupancy is confirmed with your quote.</p>}
    </dl>
  );
}
