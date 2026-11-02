import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import { launchSafe, statusOf } from "../status";
import AmazonExplorer from "./beyond-amazon-explorer.json";

// The Amazon fleet. andBeyond Amazon Explorer filed 1 Nov 2026 from andbeyond.com (photographs:
// andBeyond); she sails the Peruvian Amazon from Nauta, reached via Iquitos. Pathways per James's
// Amazon rule: Into the Green first, Where the Wild Lives second. Her status reads from `launch`
// (December 2026) so it never goes stale. Other Amazon ships join as their photographs are filed.
const settled = (d: ShipRecord): ShipRecord => ({
  ...d, status: statusOf(d), answer: launchSafe(d.answer, d), tagline: launchSafe(d.tagline, d),
  seo: { ...d.seo, description: launchSafe(d.seo.description, d) },
});

export const AMAZON_SHIPS = [{ data: settled(withActiveDepartures(AmazonExplorer as unknown as ShipRecord)), offerRefs: [] as string[], credit: "andBeyond" }];
