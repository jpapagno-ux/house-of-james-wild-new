// Pure geometry for the 3D terrain pilot (no MapLibre import, so plain Node tests can read it).

export type LngLat = [number, number];
/** One stop of a route, or one point of a points view. Coordinates come only from repo data. */
/** `mode` describes the leg arriving at this stop: "air" (a flight or air transfer marked in the repo's own data) draws a
 *  dashed great-circle arc flown by a plane; anything else is sailed by the vessel. */
export type TerrainStop = { lat: number; lng: number; name: string; day?: number | string; note?: string; path?: LngLat[]; mode?: string };
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

/** The legs of a route: leg i runs from stop i-1 to stop i, along the stop's own path when the repo has one, or a
 *  great-circle arc when the leg is flown. */
export function legsOf(stops: TerrainStop[]): LngLat[][] {
  return stops.slice(1).map((s, i) => {
    const from = lngLat(stops[i]), to = lngLat(s);
    const p = s.path && s.path.length >= 2 ? s.path : isAir(s) ? arcOf(from, to) : [from, to];
    return p.map((c) => [c[0], c[1]] as LngLat);
  });
}

const dist = (a: LngLat, b: LngLat) => Math.hypot((b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180), b[1] - a[1]);

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

/** Where a vehicle is after the first `t` of a polyline, and its heading (degrees, 0 = north). */
export function headingAt(line: LngLat[], t: number): { at: LngLat; bearing: number } {
  if (line.length < 2) return { at: line[0], bearing: 0 };
  const part = partOf(line, t);
  // partOf keeps line[0..k] and ends on segment k (line[k] to line[k+1]).
  const k = Math.max(0, Math.min(part.length - 2, line.length - 2));
  return { at: part[part.length - 1], bearing: bearingOf(line[k], line[k + 1]) };
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
