import type { ShipRecord } from "../types";
import SafariQuest from "./safari-quest.json";
import SafariExplorer from "./safari-explorer.json";
import WildernessAdventurer from "./wilderness-adventurer.json";
import WildernessExplorer from "./wilderness-explorer.json";
import WildernessDiscoverer from "./wilderness-discoverer.json";
import SafariEndeavour from "./safari-endeavour.json";
import WildernessLegacy from "./wilderness-legacy.json";

// UnCruise Adventures in Alaska (James, 19 Nov 2026: "begin on voyages in Alaska using UnCruise ... their full schedule
// and a full suite about their boats and animated maps"; UnCruise is a contracted partner: photographs and films credited
// to them). Seven boats, every 2027 and 2028 Alaska sailing and fare by cabin, from uncruise.com (read 19 Nov 2026), built by
// scripts/partners/uncruise-build.py from scripts/data/uncruise. Never hand-edit the JSON: change the data and re-run.
const CREDIT = "UnCruise Adventures";
export const ALASKA_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  SafariQuest, SafariExplorer, WildernessAdventurer, WildernessExplorer, WildernessDiscoverer, SafariEndeavour, WildernessLegacy,
].map((d) => ({ data: d as unknown as ShipRecord, offerRefs: [(d as { slug: string }).slug], credit: CREDIT }));
