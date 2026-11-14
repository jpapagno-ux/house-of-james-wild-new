// Pure geometry for the 3D terrain pilot (no MapLibre import, so plain Node tests can read it).

export type LngLat = [number, number];
/** One stop of a route, or one point of a points view. Coordinates come only from repo data. */
/** `mode` describes the leg arriving at this stop: "air" (a flight or air transfer marked in the repo's own data) draws a
 *  dashed great-circle arc flown by a plane; anything else is sailed by the vessel. */
export type TerrainStop = { lat: number; lng: number; name: string; day?: number | string; note?: string; path?: LngLat[]; mode?: string; /** km from the coast at the lane's turns (scripts/sealanes.py) */ clear?: number };
export type TerrainRoute = { name: string; stops: TerrainStop[] };
export type TerrainKind = "voyage" | "overland" | "points";

export const lngLat = (s: Pick<TerrainStop, "lat" | "lng">): LngLat => [s.lng, s.lat];

/** [[w, s], [e, n]] round a set of stops (and their sea paths). */
export function boundsOf(stops: TerrainStop[]): [LngLat, LngLat] {
  const pts = stops.flatMap((s) => [lngLat(s), ...(s.path ?? [])]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

const AIR = new Set(["air", "flight", "plane", "fly"]);
/** Whether the leg arriving at this stop is flown (same vocabulary as the SVG chart engine's MODE table). */
export const isAir = (s: Pick<TerrainStop, "mode">) => !!s.mode && AIR.has(s.mode.toLowerCase());

/** The stops the journey actually moves among, for framing the camera (James, 14 Nov 2026: "zoom in to the locations";
 *  a voyage that begins with a flight from a far city was framing the whole ocean and leaving the islands a dot).
 *  A stop is left out of the frame only when the traveller flies both to and from it (or it is the first or last stop
 *  and joined by a flight) and it lies far outside the cluster of the rest: more than three times the median distance
 *  from the median point, and at least 150 km. Evenly spread routes (a crossing) keep every stop. The route
 *  itself is untouched: only the camera's frame is. */
export function framedStops<T extends TerrainStop>(stops: T[]): T[] {
  if (stops.length < 4) return stops;
  const med = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
  const cx = med(stops.map((s) => s.lng)), cy = med(stops.map((s) => s.lat));
  const km = (s: TerrainStop) => { const dy = (s.lat - cy) * 111.2, dx = (s.lng - cx) * 111.2 * Math.cos((cy * Math.PI) / 180); return Math.hypot(dx, dy); };
  const d = stops.map(km), limit = Math.max(3 * med(d), 150);
  // Only a place the traveller flies to or from is ever left out: a port of call always stays in frame, however far.
  const flownOnly = (i: number) => (i === 0 || isAir(stops[i])) && (i === stops.length - 1 || isAir(stops[i + 1])) && (stops.length > 1);
  const kept = stops.filter((_, i) => !(d[i] > limit && flownOnly(i)));
  return kept.length >= 3 ? kept : stops;
}
/** Bounds for the camera: the framed stops and their paths, leaving out the long leg that arrives from a far outlier. */
export function frameBounds(stops: TerrainStop[]): [LngLat, LngLat] {
  const kept = framedStops(stops);
  if (kept.length === stops.length) return boundsOf(stops);
  const far = new Set(stops.filter((s) => !kept.includes(s)));
  // A kept stop reached straight from a far one keeps its pin but not the inbound path.
  return boundsOf(kept.map((s) => { const i = stops.indexOf(s); return i > 0 && far.has(stops[i - 1]) ? { ...s, path: undefined } : s; }));
}

/** A gentle great-circle arc from a to b, n segments (slerp on the sphere). */
export function arcOf(a: LngLat, b: LngLat, n = 48): LngLat[] {
  const r = Math.PI / 180, v = ([x, y]: LngLat) => [Math.cos(y * r) * Math.cos(x * r), Math.cos(y * r) * Math.sin(x * r), Math.sin(y * r)];
  const p = v(a), q = v(b), d = Math.acos(Math.min(1, Math.max(-1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])));
  if (d < 1e-9) return [a, b];
  const out: LngLat[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * p[0] + B * q[0], y = A * p[1] + B * q[1], z = A * p[2] + B * q[2];
    out.push([Math.atan2(y, x) / r, Math.atan2(z, Math.hypot(x, y)) / r]);
  }
  out[0] = a; out[n] = b;
  return out;
}

/** The legs of a route: leg i runs from stop i-1 to stop i. A flown leg is a great-circle arc; any other leg follows
 *  the stop's own path from the route file (public/maps/routes: for a sailed leg, the sea lane round the land that
 *  scripts/sealanes.py routes and the engraved chart draws), or a straight line when the file has none. */
export function legsOf(stops: TerrainStop[]): LngLat[][] {
  return stops.slice(1).map((s, i) => {
    const from = lngLat(stops[i]), to = lngLat(s);
    const p = isAir(s) ? arcOf(from, to) : s.path && s.path.length >= 2 ? s.path : [from, to];
    return p.map((c) => [c[0], c[1]] as LngLat);
  });
}

const dist = (a: LngLat, b: LngLat) => Math.hypot((b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180), b[1] - a[1]);

/** Rounds the turns of a routed sea lane (scripts/sealanes.py keeps 1 km off the charted coast; each corner is cut at
 *  most `cutKm`, a fraction of that margin, so the rounded line stays at sea): a short quadratic curve at every inner
 *  bend, so the line and the vessel sweep round a headland instead of snapping at a point. Ends are kept. */
export function smoothLine(line: LngLat[], cutKm = 0.6, n = 8): LngLat[] {
  if (line.length < 3) return line.slice();
  const km = (a: LngLat, b: LngLat) => dist(a, b) * 111.32;
  const lerp = (a: LngLat, b: LngLat, f: number): LngLat => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const out: LngLat[] = [line[0]];
  for (let i = 1; i < line.length - 1; i++) {
    const p = line[i - 1], c = line[i], q = line[i + 1];
    const d1 = km(p, c), d2 = km(c, q);
    if (!d1 || !d2) { out.push(c); continue; }
    const a = lerp(c, p, Math.min(cutKm, d1 * 0.3) / d1), b = lerp(c, q, Math.min(cutKm, d2 * 0.3) / d2);
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      out.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
    }
  }
  out.push(line[line.length - 1]);
  return out;
}

/** How far the 3D map may cut a corner of the lane arriving at this stop: 0.6 km in open water, half the lane's own
 *  clearance from the coast where it threads a narrow channel (the Beagle Channel, Stanley's Narrows, the fjords). */
export const cutFor = (s: Pick<TerrainStop, "clear">) => (typeof s.clear !== "number" ? 0.6 : s.clear < 0.25 ? 0 : Math.min(0.6, s.clear * 0.5)); // under 250 m off: sharp corners

/** Polyline length in km. */
export const lengthKm = (line: LngLat[]) => line.slice(1).reduce((t, p, i) => t + dist(line[i], p) * 111.32, 0);

/** The first `t` (0 to 1) of a polyline, by length. */
export function partOf(line: LngLat[], t: number): LngLat[] {
  if (line.length < 2 || t >= 1) return line.slice();
  if (t <= 0) return [line[0]];
  const seg = line.slice(1).map((p, i) => dist(line[i], p));
  let left = seg.reduce((a, b) => a + b, 0) * t;
  const out: LngLat[] = [line[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) { out.push(line[i + 1]); left -= seg[i]; continue; }
    const f = seg[i] ? left / seg[i] : 0;
    out.push([line[i][0] + (line[i + 1][0] - line[i][0]) * f, line[i][1] + (line[i + 1][1] - line[i][1]) * f]);
    break;
  }
  return out;
}

const tipOf = (line: LngLat[], t: number) => { const p = partOf(line, t); return p[p.length - 1]; };

/** Where a vehicle is after the first `t` of a polyline, and its heading (degrees, 0 = north): the bearing across a
 *  short window either side (`look`, a fraction of the line), so the vessel turns through a bend instead of snapping. */
export function headingAt(line: LngLat[], t: number, look = 0.02): { at: LngLat; bearing: number } {
  if (line.length < 2) return { at: line[0], bearing: 0 };
  const tt = Math.max(0, Math.min(1, t));
  const a = tipOf(line, Math.max(0, tt - look)), b = tipOf(line, Math.min(1, tt + look));
  const at = tipOf(line, tt);
  if (a[0] === b[0] && a[1] === b[1]) return { at, bearing: bearingOf(line[0], line[line.length - 1]) };
  return { at, bearing: bearingOf(a, b) };
}

/** Compass bearing from a to b, degrees (0 = north). */
export function bearingOf(a: LngLat, b: LngLat): number {
  const r = Math.PI / 180, [l1, p1] = [a[0] * r, a[1] * r], [l2, p2] = [b[0] * r, b[1] * r];
  const y = Math.sin(l2 - l1) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1);
  return ((Math.atan2(y, x) / r) + 360) % 360;
}

/** The day label for the chip: "Day 3" (or the stop's own label for a points view). */
export const dayLabel = (s: TerrainStop) => (s.day != null && s.day !== "" ? `Day ${s.day}` : null);

/** Clamp seabed in a Terrarium or Mapbox RGB elevation tile to sea level, in place, so the sea stays flat and the
 *  islands stand up from it (the AWS tiles carry bathymetry). Terrarium: h = R*256 + G + B/256 - 32768, 0 m = (128, 0, 0).
 *  Mapbox: h = -10000 + (R*65536 + G*256 + B) * 0.1, 0 m = 100000 = (1, 134, 160). */
export function clampSeabed(px: Uint8ClampedArray, encoding: "terrarium" | "mapbox"): void {
  for (let i = 0; i < px.length; i += 4) {
    if (encoding === "terrarium") {
      if (px[i] < 128) { px[i] = 128; px[i + 1] = 0; px[i + 2] = 0; }
    } else if (px[i] * 65536 + px[i + 1] * 256 + px[i + 2] < 100000) { px[i] = 1; px[i + 1] = 134; px[i + 2] = 160; }
  }
}
