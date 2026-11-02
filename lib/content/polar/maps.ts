import { readRoute, shipMapHtml } from "@/lib/content/ships/routes";
import { polarRouteId, type PolarVoyage } from "./index";

// The route chart for polar pages, on the one engine (public/maps/jw-chart.js). Voyages that stay
// inside the Antarctic Peninsula chart (public/maps/data/antarctica, its bbox) draw over its
// engraved land; voyages that reach South Georgia, the Falklands or Puerto Montt fit the chart
// to their own stops on the globe, as the Galápagos and Amazon charts do.
const BOX = [-76, -68.5, -56, -52]; // public/maps/data/antarctica/meta.json
type Route = NonNullable<ReturnType<typeof readRoute>>;
const inBox = (r: Route) => r.stops.every((s) => { const p = s as unknown as { lat: number; lng: number }; return p.lng >= BOX[0] && p.lng <= BOX[2] && p.lat >= BOX[1] && p.lat <= BOX[3]; });

export function chartFor(routes: Route[], id: string, title: string): { html: string } | null {
  if (!routes.length) return null;
  const destination = routes.every(inBox) ? "antarctica" : "polar";
  return { html: shipMapHtml({ id, routes, destination, title, kicker: "POLAR CROSSINGS · BY AIR AND SEA" }) };
}

export function voyageMap(v: PolarVoyage): { html: string } | null {
  const r = readRoute(polarRouteId(v));
  return r ? chartFor([r], `jwmap-${v.slug}`, `Route map of the ${v.name}`) : null;
}
