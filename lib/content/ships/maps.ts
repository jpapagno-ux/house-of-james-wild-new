import { TRIPS } from "@/lib/content/trips";
import { mapHtml } from "@/lib/content/trip-pages";
import { NILE_CHART, readRoute, shipMapHtml, shipRouteId } from "./routes";
import type { ShipEntry } from "./index";

// The route chart for a ship page, from the one engine (public/maps/jw-chart.js):
// the Nile ships draw each itinerary's route file over the river overlay; Aliikai
// shows the engraved chart of her 10 Day Raja Ampat North, the voyage James sailed.
export function shipMap(e: ShipEntry): { html: string; figCss?: string } | null {
  const s = e.data;
  if (e.waters === "nile") {
    const routes = s.itineraries.filter((i) => i.days.length).map((i) => readRoute(shipRouteId(s, i)));
    return routes.length && routes.every(Boolean) ? { html: shipMapHtml({ id: `jwmap-${s.slug}`, routes: routes.map((r) => r!), destination: "nile", chart: NILE_CHART, title: `Route map of ${s.name} on the Nile` }) } : null;
  }
  if (e.waters === "amazon" || e.waters === "galapagos") {
    const where = e.waters === "amazon" ? "in the Peruvian Amazon" : "in the Galapagos";
    const routes = s.itineraries.filter((i) => i.days.length).map((i) => readRoute(shipRouteId(s, i)));
    return routes.length && routes.every(Boolean) ? { html: shipMapHtml({ id: `jwmap-${s.slug}`, routes: routes.map((r) => r!), destination: e.waters, title: `Route map of ${s.name} ${where}`, kicker: e.waters === "amazon" ? "THE VOYAGE · BY RIVER" : "THE VOYAGE · BY SEA" }) } : null;
  }
  if (e.slug === "aliikai") {
    const trip = TRIPS["10-day-raja-ampat-north"];
    const html = trip ? mapHtml(trip) : "";
    return html ? { html, figCss: html.includes('data-gen="1"') ? undefined : `/maps/fig/${trip.id}.css` } : null;
  }
  return null;
}
