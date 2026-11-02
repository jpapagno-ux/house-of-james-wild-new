import { SHIPS, shipPath, type ShipEntry } from "./index";
import { readRoute, shipRouteId } from "./routes";
import { WATERS_HUBS } from "./registry";
import type { ShipItinerary } from "./types";
import type { AtlasRoute } from "@/components/journey/RouteAtlas";

// Every route in Voyages for the atlas, from the registry's ships, grouped for the route picker
// (James, 2 Nov 2026): one chip per ship, and ships that sail identical routes share one chip
// ("Ecoventura fleet" for Origin, Theory and Evolve), drawing each shared route once. Route chips
// get short labels ("Route A · 7 nights"). Aliikai's routes are her two voyage pages' files.
const ALIIKAI: AtlasRoute[] = [
  { id: "10-day-raja-ampat-north", label: "10 Day Raja Ampat North", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", where: "Raja Ampat", group: "Aliikai", groupHref: "/voyages/ships/aliikai" },
  { id: "5-day-komodo-island", label: "5 Day Komodo Island", href: "/voyages/komodo/aliikai-5-day-komodo-island", where: "Komodo", group: "Aliikai", groupHref: "/voyages/ships/aliikai" },
];

/** "Route A · 7 nights", "High water · 3 nights", "Luxor to Aswan · 4 nights". */
export function shortRoute(it: ShipItinerary): string {
  if (it.short) return it.short;
  const n = it.nights ? ` · ${it.nights} nights` : "";
  const letter = it.name.match(/^Itinerary ([A-Z](?:\+[A-Z])*)(?![A-Za-z])/);
  if (letter) return `Route ${letter[1]}${n}`;
  // Royal Galapagos names its weeks by length and letter ("8-day cruise A"): "8-day A · 7 nights".
  const rg = it.name.match(/^(\d+-day) (?:\w+ )?cruise ([A-Z])\b/i);
  if (rg) return `${rg[1]} ${rg[2]}${n}`;
  const rgn = it.name.match(/^(\d+-day) (\w+) cruise\b/i);
  if (rgn) return `${rgn[1]} ${rgn[2].toLowerCase()}${n}`;
  const head = it.direction.split(" (")[0].split(", ")[0];
  return `${head}${n}`;
}

const signature = (id: string) => readRoute(id)?.stops.map((s) => s.name).join(" > ") ?? id;

export function atlasRoutes(ships: ShipEntry[] = SHIPS): AtlasRoute[] {
  // Ships whose whole set of routes is identical sail as one fleet chip.
  const sets = ships.map((e) => ({ e, sig: e.data.itineraries.filter((i) => i.days.length).map((i) => signature(shipRouteId(e.data, i))).join(" | ") }));
  const out: AtlasRoute[] = [];
  const done = new Set<string>();
  for (const { e, sig } of sets) {
    if (e.slug === "aliikai") { out.push(...ALIIKAI); continue; }
    if (done.has(e.slug)) continue;
    const fleet = sig ? sets.filter((x) => x.sig === sig && x.e.reg.operator === e.reg.operator) : [{ e, sig }];
    fleet.forEach((x) => done.add(x.e.slug));
    // "Ecoventura fleet" only when every ship of that operator on these waters shares the routes;
    // otherwise the chip names the ships ("Theory and Evolve").
    const all = ships.filter((x) => x.reg.operator === e.reg.operator && x.waters === e.waters);
    const names = fleet.map((x) => x.e.data.name);
    const group = fleet.length === 1 ? e.data.name : fleet.length === all.length ? `${e.reg.operator} fleet` : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    const members = fleet.length > 1 ? fleet.map((x) => ({ name: x.e.data.name, href: shipPath(x.e.slug) })) : undefined;
    out.push(...e.data.itineraries.filter((i) => i.days.length).map((i) => ({
      id: shipRouteId(e.data, i), label: shortRoute(i), href: shipPath(e.slug), where: WATERS_HUBS[e.waters].name, group, groupHref: shipPath(e.slug), members, section: e.reg.operator ?? undefined,
    })));
  }
  return out;
}
