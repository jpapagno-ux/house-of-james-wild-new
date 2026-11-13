import { today, withActiveDepartures } from "@/lib/dates";
import type { ShipDeparture, ShipRecord } from "../types";
import { launchSafe, statusOf } from "../status";
import AmazonExplorer from "./beyond-amazon-explorer.json";
import AriaAmazon from "./aria-amazon.json";
import AquaNera from "./aqua-nera.json";
import DelfinIii from "./delfin-iii.json";
import Anakonda from "./anakonda-amazon-cruise.json";
import MvPremium from "./amazon-clipper-premium.json";

// The Amazon fleet, each filed from her operator's own site (photographs: each operator):
// andBeyond Amazon Explorer, Aria Amazon (Aqua Expeditions) and Delfin III (Delfín Amazon
// Cruises) in Peru; Anakonda in Ecuador; MV Premium (Amazon Clipper) as Brazil's one ship for now.
// Pathways per James's Amazon rule: Into the Green first, Where the Wild Lives second.
// Every departure passes lib/dates.ts; a status with a launch month reads from it (status.ts).
// Unpublished facts read "Ask us" in the files; nothing is filled in.
const settled = (d: ShipRecord): ShipRecord => ({
  ...d, status: statusOf(d), answer: launchSafe(d.answer, d), tagline: launchSafe(d.tagline, d),
  seo: { ...d.seo, description: launchSafe(d.seo.description, d) },
});

// Delfin III: the order of Delfín's rate tables (season by season) was a reading, not a label, so
// only the lowest published fare among the seasons still to sail is shown, as one row.
function lowestOnly(d: ShipRecord): ShipRecord {
  const deps = d.departures;
  const all = deps.flatMap((x) => Object.values(x.prices)).filter((p): p is number => typeof p === "number" && p > 0);
  if (!deps.length || !all.length) return { ...d, departures: [] };
  const first = deps.map((x) => x.date).sort()[0];
  const start = first > today() ? first : today();
  const end = deps.map((x) => x.dateTo ?? x.date).sort().pop()!;
  const row: ShipDeparture = { date: start, dateTo: end, season: null, itinerary: "3 or 4 nights", direction: "Nauta round trip", status: null, prices: { "Lowest published fare": Math.min(...all) } };
  return { ...d, departures: [row] };
}

const live = (x: unknown) => settled(withActiveDepartures(x as ShipRecord));
export const AMAZON_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: live(AmazonExplorer), offerRefs: [], credit: "andBeyond" },
  { data: live(AriaAmazon), offerRefs: ["aria-amazon"], credit: "Aqua Expeditions" },
  // Aqua Nera and Aria Amazon's routes and fares: scripts/partners/aqua-build.mjs (Aqua's booking data, 13 Nov 2026).
  { data: live(AquaNera), offerRefs: [], credit: "Aqua Expeditions" },
  { data: lowestOnly(live(DelfinIii)), offerRefs: [], credit: "Delfín Amazon Cruises" },
  { data: live(Anakonda), offerRefs: [], credit: "Anakonda Amazon Cruises" },
  { data: live(MvPremium), offerRefs: [], credit: "Amazon Clipper" },
];
