import { COUNTRIES } from "@/lib/content/countries";
import { REGIONS } from "@/lib/site";
import { WATERS_HUBS } from "@/lib/content/ships/registry";

/** What the Where field offers as it is typed: every region, country and cruising water with a page in the Ledger. */
export const atlasPlaces = (): string[] => [...new Set([...REGIONS.map((r) => r.label), ...COUNTRIES.map((c) => c.name), ...Object.values(WATERS_HUBS).map((w) => w.name)])].sort((a, b) => a.localeCompare(b));
