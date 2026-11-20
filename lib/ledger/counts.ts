// The Ledger, counted: read from the Ledger's own files every time the site builds, so the tally on the home page,
// the Stays hub and /the-ledger follows the library by itself (James, 20 Nov 2026: "keep updating as we build on auto
// count each day"). The nightly library sync rebuilds the site, so the figures move the morning after a publish.
// Until now this was a fixed figure typed on 24 Oct 2026 (488 / 28 / 19); no export ever rewrote it.
//
// What is counted is what a traveller can open, not every row in the export:
//   stays     every stay with a published page (lib/content/stays.ts STAY_PAGES). Boats filed in the Stay library are
//             never stays (lib/content/vessels.ts), and a record still waiting for its photograph or copy is not
//             counted until its page exists.
//   vessels   every ship in the registry with a ship page (lib/content/ships/registry.ts).
//   journeys  every overland route, voyage and charter journey with a page of its own, each address counted once.
// The advisor tally is counted the same way where it is shown (components/home/Entrance.tsx: advisors with a page).
// Server-side only: these imports carry the whole Ledger and must never reach a client component.
import { STAY_PAGES } from "@/lib/content/stays";
import { SHIP_REGISTRY } from "@/lib/content/ships/registry";
import { TRIPS } from "@/lib/content/trips";
import { JOURNEYS, journeyPath } from "@/lib/content/ships/journeys";
import { POLAR_VOYAGES, voyagePath } from "@/lib/content/polar";
import { today } from "@/lib/dates";

const journeyPages = new Set<string>([
  ...Object.values(TRIPS).map((t) => t.seo.path),
  ...JOURNEYS.map((j) => journeyPath(j.slug)),
  ...POLAR_VOYAGES.map((v) => voyagePath(v.slug)),
]);

export const LEDGER_COUNTS = {
  stays: STAY_PAGES.length,
  vessels: SHIP_REGISTRY.filter((s) => s.page).length,
  journeys: journeyPages.size,
  countedOn: today(),
};
