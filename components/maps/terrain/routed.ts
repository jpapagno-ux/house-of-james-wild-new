// The 3D terrain map draws the route files' own legs (public/maps/routes, read on the server by readRoute): the same
// stops, modes and sea-lane paths (scripts/sealanes.py) the engraved chart and its SVG figure draw, so the two maps
// can never disagree. A page with no route file keeps the stops it passes in.
import type { LngLat, TerrainRoute, TerrainStop } from "./geo";

type FileStop = { day?: number | string; name: string; lat: number; lng: number; mode?: string; path?: LngLat[] };

export function terrainRoute(name: string, file: { stops: unknown[] } | null | undefined, fallback: TerrainStop[]): TerrainRoute {
  const stops = (file?.stops ?? []) as FileStop[];
  if (stops.length < 2) return { name, stops: fallback };
  return { name, stops: stops.map((s) => ({ day: s.day, name: s.name, lat: s.lat, lng: s.lng, ...(s.mode ? { mode: s.mode } : {}), ...(s.path && s.path.length > 1 ? { path: s.path.map((p) => [p[0], p[1]] as LngLat) } : {}) })) };
}
