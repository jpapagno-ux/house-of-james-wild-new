import fs from "node:fs";
import path from "node:path";
import { VOLUME_STYLES } from "@/lib/volumes";
import type { ShipItinerary, ShipRecord } from "./types";
import { routeFigureSvg, type FigureOverlay, type FigureRoute } from "@/lib/maps/route-figure";

// Ship itineraries on the house route chart (public/maps/jw-chart.js via jw-embed.js), the same
// engine as the Raja Ampat, Komodo and Costa Rica route pages. Each Nile itinerary has a jw-route
// v1 file in public/maps/routes/<ship>-<direction>-<nights>n.json, built from the ship data by
// scripts/build-nile-maps.py, which also builds the Nile chart data (public/maps/data/nile: the
// bbox, the land, and the river and Lake Nasser as an overlay).

type RouteFile = { id: string; title: string; subtitle?: string; stops: { day: number | string; name: string }[] } & Record<string, unknown>;
const DIR = () => path.join(process.cwd(), "public/maps/routes");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const esc = (x: unknown) => String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const shipRouteId = (ship: Pick<ShipRecord, "slug">, it: ShipItinerary) => `${ship.slug}-${slug(it.direction)}-${it.nights}n`;
export function readRoute(id: string): RouteFile | null {
  const f = path.join(DIR(), `${id}.json`);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as RouteFile) : null;
}
/** The Nile overlay (river ribbon and Lake Nasser) for the chart engine. */
export const NILE_CHART = { overlay: "/maps/data/nile/overlay.geojson" };

/** House inks for the engraved route figure (Voyages' Admiralty Navy, from lib/volumes.ts). */
export const FIGURE_INK = { route: VOLUME_STYLES.voyages.pad, boat: VOLUME_STYLES.voyages.deep, river: `rgb(${VOLUME_STYLES.voyages.light})`, ground: VOLUME_STYLES.voyages.tint };
function readOverlay(chart?: object): FigureOverlay | null {
  const o = (chart as { overlay?: string } | undefined)?.overlay;
  if (!o) return null;
  const f = path.join(process.cwd(), "public", o.replace(/^\//, ""));
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as FigureOverlay) : null;
}
/** The engraved figure (river, legs, stops and the boat sailing them) for a chart block's fallback. */
export function routeFigure({ id, routes, chart, label }: { id: string; routes: RouteFile[]; chart?: object; label: string }) {
  return routeFigureSvg({ id, routes: routes as unknown as FigureRoute[], overlay: readOverlay(chart), ink: FIGURE_INK, label });
}

/** The chart block for one or more routes: config for the engine, and the ordered stops as the
 *  fallback search engines and no-JS readers see (the engine draws over it). */
export function shipMapHtml({ id, routes, destination, chart, title }: { id: string; routes: RouteFile[]; destination: string; chart?: object; title: string }) {
  const ink = VOLUME_STYLES.voyages.pad;
  const cfg = JSON.stringify({ routes: routes.map((r) => ({ ...r, short: r.title })), kind: "voyage", destination, chart, kicker: "THE VOYAGE · BY RIVER", caption: "" }).replace(/</g, "\\u003c");
  const lists = routes.map((r) => `<p style="margin: 0 0 6px; font-size: 13px"><strong>${esc(r.title)}</strong></p><ol style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 6px 18px; margin: 0 0 14px; padding: 0; list-style: none; font-size: 14px">${r.stops.map((s) => `<li><span class="mono">Day ${esc(s.day)}</span> ${esc(s.name)}</li>`).join("")}</ol>`).join("");
  return `<div id="${esc(id)}" data-keep="1" data-gen="1" class="jw-maps jw-site" data-jw-map="itinerary" style="--jw-overland: ${ink}; --jw-voyages: ${ink}; --jw-acc: ${ink}">` +
    `<script type="application/json">${cfg}</script>` +
    `<div class="jw-frame chart"><figure class="jw-fallback" style="margin: 0; background: ${FIGURE_INK.ground}">` +
    routeFigure({ id: `${id}-fig`, routes, chart, label: `${title}: the boat sails ${routes[0]?.stops.map((s) => s.name).join(", ") ?? ""}` }) +
    `<figcaption style="padding: 14px 20px 16px">${lists}<span class="mono" style="font-size: 10px; letter-spacing: .08em">POSITIONS APPROXIMATE</span></figcaption></figure></div></div>`;
}
