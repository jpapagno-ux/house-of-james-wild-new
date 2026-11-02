import type { PathwayId } from "@/lib/pathways";
import { nextDate } from "@/lib/dates";
import { SHIPS } from "./index";
import { cardsFor, type ShipCardData } from "./cards";
import { shipsOnPathway } from "./registry";

// Wild Pathways for Voyages (James, 1 Nov 2026). The chip keeps the pathway's brand name; the
// voyage line is what a pathway page's "On the water" heading, meta and FAQ say. Above It All
// is not used for voyages yet. One URL per pathway (/pathways/<slug>); no /voyages/pathways/*.
export const VOYAGE_LINES: Record<PathwayId, string | null> = {
  "PATH-01": "Rainforest river cruises",
  "PATH-02": "Island hopping, diving and snorkel voyages",
  "PATH-03": null,
  "PATH-04": "Wildlife cruises and expedition voyages",
  "PATH-05": "Slow sailing and wellness voyages",
  "PATH-06": "Remote expedition voyages",
  "PATH-07": "Private yacht and boat charters for your group",
  "PATH-08": "Heritage and cultural river cruises",
};

const SMALL = new Set(["and", "for", "or", "the", "a", "of", "to", "your"]);
const title = (s: string) => s.split(" ").map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
/** "Looking for Heritage and Cultural River Cruises?" */
export const voyageQuestion = (p: PathwayId) => (VOYAGE_LINES[p] ? `Looking for ${title(VOYAGE_LINES[p]!).replace(/ For Your Group$/, " for Your Group")}?` : null);

/** Registry ships on a pathway (primary or secondary), sorted by next published sailing; undated last. */
export function voyagesOnPathway(p: PathwayId): ShipCardData[] {
  const next = (slug: string) => { const e = SHIPS.find((x) => x.slug === slug); return e ? nextDate(e.data.departures, (d) => d.date) : null; };
  return cardsFor(shipsOnPathway(p)).map((c) => ({ c, n: next(c.slug) })).sort((a, b) => (a.n ?? "9999").localeCompare(b.n ?? "9999")).map((x) => x.c);
}
