import { SHIPS, shipPath, type ShipEntry } from "./index";
import { shipRouteId } from "./routes";
import { WATERS_HUBS } from "./registry";
import type { AtlasRoute } from "@/components/journey/RouteAtlas";

// Every route in Voyages for the atlas, from the registry's ships: each itinerary with a
// day by day, grouped by ship. Aliikai's routes are her two voyage pages' route files.
const ALIIKAI: AtlasRoute[] = [
  { id: "10-day-raja-ampat-north", label: "Aliikai: 10 Day Raja Ampat North", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", where: "Raja Ampat", group: "Aliikai" },
  { id: "5-day-komodo-island", label: "Aliikai: 5 Day Komodo Island", href: "/voyages/komodo/aliikai-5-day-komodo-island", where: "Komodo", group: "Aliikai" },
];

export function atlasRoutes(ships: ShipEntry[] = SHIPS): AtlasRoute[] {
  return ships.flatMap((e) => e.slug === "aliikai" ? ALIIKAI : e.data.itineraries.filter((i) => i.days.length).map((i) => ({
    id: shipRouteId(e.data, i), label: `${e.data.name}: ${i.nights} nights, ${i.direction.split(" (")[0]}`, href: shipPath(e.slug), where: WATERS_HUBS[e.waters].name, group: e.data.name,
  })));
}
