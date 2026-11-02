import { isPast } from "@/lib/dates";
import type { ShipRecord } from "./types";

// A ship's status from her data, never a hand-typed line that goes stale (audit, 1 Nov 2026):
// a ship with a `launch` month reads "launching November 2026" until that month has passed
// (lib/dates.ts), then simply "sailing", and the launch clause drops out of her copy.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const launchWords = (launch: string) => { const [y, m] = launch.split("-"); return m ? `${MONTHS[Number(m) - 1]} ${y}` : y; };

export const launched = (s: Pick<ShipRecord, "launch">, on?: string) => !!s.launch && isPast(s.launch, on);

export function statusOf(s: Pick<ShipRecord, "status" | "launch">, on?: string): string {
  if (!s.launch) return s.status;
  return launched(s, on) ? "sailing" : `launching ${launchWords(s.launch)}`;
}

/** Copy with the launch clause removed once she has launched ("..., launching in November 2026"). */
export function launchSafe(text: string, s: Pick<ShipRecord, "launch">, on?: string): string {
  if (!s.launch || !launched(s, on)) return text;
  const w = launchWords(s.launch).replace(" ", "\\s+");
  return text
    .replace(new RegExp(`,?\\s*launching(\\s+in)?\\s+${w}`, "gi"), "")
    .replace(new RegExp(`starts sailing (.+?) in ${w}`, "gi"), "sails $1")
    .replace(new RegExp(`\\s+from ${w}(?=[:.,])`, "gi"), "")
    .replace(/\s{2,}/g, " ");
}
