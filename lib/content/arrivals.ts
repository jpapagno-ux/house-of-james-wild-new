// Arrival hubs and transfers — Stage 5 (Last Mile) of the Iggi Intelligence Core.
//
// Where a journey touches ground (an airport, bush airstrip, rail station or
// port) as a Ledger record (HUB-), and the legs the house has on record between
// a hub and a stay (TRF-). Only APPROVED records reach this file (the library's
// siteExport filters), and every fact came from the operator's own site, so a
// page may show it with its source. A transfer with no stated time is still a
// route on record: the page says the time is not recorded; it never estimates.
import data from "./arrivals.json";
import type { StayData } from "./stays";

export type HubKind = "airport" | "airstrip" | "rail" | "port" | "city";
export type ArrivalHub = {
  id: string; ledgerId: string | null; name: string; kind: HubKind; code: string | null; city: string | null; country: string | null;
  servesCountries: string[]; coords: { lat: number; lng: number } | null; houseNotes: string | null;
  gatewayOvernight: boolean; gatewayRef: string | null; sourceUrl: string | null; factChecked: string | null;
};
export type Transfer = { ledgerId: string | null; from: string; to: string; mode: string; minutes: number | null; km: number | null; sourceUrl: string | null; factChecked: string | null };

export const HUBS: ArrivalHub[] = data.hubs as ArrivalHub[];
export const TRANSFERS: Transfer[] = data.transfers as Transfer[];

const byId = new Map(HUBS.map((h) => [h.id, h]));
const byLedger = new Map(HUBS.filter((h) => h.ledgerId).map((h) => [h.ledgerId as string, h]));
export const hubByLedgerId = (id: string | null | undefined) => (id ? byLedger.get(id) ?? null : null);

const KIND_ORDER: Record<HubKind, number> = { airport: 0, airstrip: 1, rail: 2, port: 3, city: 4 };
const sortHubs = (a: ArrivalHub, b: ArrivalHub) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || Number(b.gatewayOvernight) - Number(a.gatewayOvernight) || a.name.localeCompare(b.name);

/** Approved hubs for a country, by its Ledger name: the ones in it, plus any that serve it (Derry and Belfast serve Ireland). */
export const hubsForCountry = (country: string | null | undefined): ArrivalHub[] =>
  country ? HUBS.filter((h) => h.country === country || h.servesCountries.includes(country)).sort(sortHubs) : [];

/** Approved hubs a stay's airport text was mapped to (library `linkArrivalHubs`). */
export const hubsForStay = (s: Pick<StayData, "arrivalHubIds">): ArrivalHub[] =>
  ((s.arrivalHubIds ?? []).map((id) => byId.get(id)).filter(Boolean) as ArrivalHub[]).sort(sortHubs);

/** Approved transfer legs that end at a stay, with their hub resolved. */
export const transfersForStay = (ledgerId: string | null | undefined) =>
  ledgerId ? TRANSFERS.filter((t) => t.to === ledgerId).map((t) => ({ ...t, hub: byLedger.get(t.from) ?? null })).filter((t) => t.hub) as (Transfer & { hub: ArrivalHub })[] : [];

/** Approved transfer legs that start at any hub of a country, with both ends resolved. */
export const transfersForCountry = (country: string | null | undefined, stays: StayData[]) => {
  const hubs = new Map(hubsForCountry(country).filter((h) => h.ledgerId).map((h) => [h.ledgerId as string, h]));
  const stayOf = new Map(stays.filter((s) => s.ledgerId).map((s) => [s.ledgerId as string, s]));
  return TRANSFERS.map((t) => ({ ...t, hub: hubs.get(t.from) ?? null, stay: stayOf.get(t.to) ?? null })).filter((t) => t.hub && t.stay) as (Transfer & { hub: ArrivalHub; stay: StayData })[];
};

export const hubLabel = (h: ArrivalHub) => (h.kind === "airport" && h.code ? `${h.name} (${h.code})` : h.name);
export const KIND_LABEL: Record<HubKind, string> = { airport: "Airport", airstrip: "Airstrip", rail: "Rail", port: "Port", city: "Gateway city" };

/** "about 50 minutes by private car" — only ever from a stated time. */
export const transferLine = (t: Transfer) => {
  if (!t.minutes) return null;
  const h = Math.floor(t.minutes / 60), m = t.minutes % 60;
  const time = h ? `${h} hour${h > 1 ? "s" : ""}${m ? ` ${m} minutes` : ""}` : `${m} minutes`;
  return `about ${time} by ${t.mode}`;
};

/** schema.org for a hub: Airport for airports (and airstrips, which Google treats the same), TrainStation, BoatTerminal, City. */
export const hubSchema = (h: ArrivalHub) => ({
  "@type": h.kind === "airport" || h.kind === "airstrip" ? "Airport" : h.kind === "rail" ? "TrainStation" : h.kind === "port" ? "BoatTerminal" : "City",
  name: h.name,
  ...(h.code && h.kind === "airport" ? { iataCode: h.code } : {}),
  ...(h.coords ? { geo: { "@type": "GeoCoordinates", latitude: h.coords.lat, longitude: h.coords.lng } } : {}),
  ...(h.country ? { address: { "@type": "PostalAddress", ...(h.city ? { addressLocality: h.city } : {}), addressCountry: h.country } } : {}),
  ...(h.sourceUrl ? { sameAs: h.sourceUrl } : {}),
  ...(h.ledgerId ? { identifier: h.ledgerId } : {}),
});
