// The engraved route figure for river and sea voyages that have no hand-drawn fallback (the Nile
// ships and the Nile hub atlas, James 1 Nov 2026). It is the server-rendered picture the chart
// block shows before the live chart (jw-chart.js) loads, without script, in screenshots, and if
// the chart can't load: the river, the legs, the stops and the boat gliding along the sailing
// legs, the same SVG boat and animateMotion as the Raja Ampat figure (10-day-raja-ampat-north.map.html).
// With prefers-reduced-motion the boat is parked at the start and nothing moves.
// Pure: no imports, so the tests can run it; colours come in from lib/volumes.ts.

export type FigureStop = { day: number | string; name: string; lat: number; lng: number; mode?: string; kind?: string; path?: [number, number][] };
export type FigureRoute = { id: string; title?: string; stops: FigureStop[]; fallback?: { labels?: { text: string; lat: number; lng: number; kind?: string }[] } };
export type FigureOverlay = { features: { properties?: { k?: string }; geometry: { type: string; coordinates: unknown } }[] };
export type FigureInk = { route: string; boat: string; river: string; ground: string };

const W = 1000;
const H = 700;
const esc = (x: unknown) => String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f1 = (n: number) => n.toFixed(1);
const SEA = new Set(["sea", "ship", "vessel", "boat", "zodiac", "kayak"]);

/** Each leg in order: the mode it is travelled by and its points, [lng, lat]. */
export function legsOf(r: FigureRoute) {
  const out: { mode: string; pts: [number, number][] }[] = [];
  r.stops.forEach((s, i) => {
    if (!i) return;
    const prev = r.stops[i - 1];
    const pts: [number, number][] = s.path && s.path.length > 1 ? s.path : [[prev.lng, prev.lat], [s.lng, s.lat]];
    if (pts.every(([x, y]) => x === pts[0][0] && y === pts[0][1])) return; // a day in port
    out.push({ mode: s.mode ?? "sea", pts });
  });
  return out;
}

/** The boat's course: the sailing legs, joined in order. */
export function sailOf(r: FigureRoute): [number, number][] {
  const pts: [number, number][] = [];
  for (const l of legsOf(r)) {
    if (!SEA.has(l.mode)) continue;
    for (const p of l.pts) { const q = pts[pts.length - 1]; if (!q || q[0] !== p[0] || q[1] !== p[1]) pts.push(p); }
  }
  return pts;
}

export function routeFigureSvg({ id, routes, overlay, ink, label }: { id: string; routes: FigureRoute[]; overlay?: FigureOverlay | null; ink: FigureInk; label: string }) {
  const all: [number, number][] = routes.flatMap((r) => [...r.stops.map((s) => [s.lng, s.lat] as [number, number]), ...legsOf(r).flatMap((l) => l.pts)]);
  if (!all.length) return "";
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const kx = Math.cos((((y0 + y1) / 2) * Math.PI) / 180);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const sc = Math.min((W * 0.62) / Math.max((x1 - x0) * kx, 0.05), (H * 0.8) / Math.max(y1 - y0, 0.05));
  const P = ([lng, lat]: [number, number]): [number, number] => [W / 2 + (lng - cx) * kx * sc, H / 2 - (lat - cy) * sc];
  const d = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"}${f1(P(p)[0])} ${f1(P(p)[1])}`).join("");

  // the river and lakes from the destination's chart overlay
  let water = "";
  for (const ft of overlay?.features ?? []) {
    const g = ft.geometry;
    if (g.type === "Polygon") water += `<path d="${(g.coordinates as [number, number][][]).map((ring) => d(ring) + "Z").join("")}" fill="${ink.river}" stroke="${ink.route}" stroke-opacity=".35" stroke-width="1"/>`;
    else if (g.type === "LineString") water += `<path d="${d(g.coordinates as [number, number][])}" fill="none" stroke="${ink.route}" stroke-opacity=".45" stroke-width="1.2"/>`;
  }

  // place names from the route files (once each)
  const seenLabel = new Set<string>();
  const labels = routes.flatMap((r) => r.fallback?.labels ?? []).filter((l) => !seenLabel.has(l.text) && seenLabel.add(l.text)).map((l) => {
    const [x, y] = P([l.lng, l.lat]);
    const river = l.kind === "sea";
    return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="${river ? 20 : 17}" letter-spacing="${river ? 3 : 4}" font-style="${river ? "italic" : "normal"}" fill="${ink.route}" fill-opacity="${river ? 0.75 : 0.5}">${esc(river ? l.text : l.text.toUpperCase())}</text>`;
  }).join("");

  // every leg: dashed under way, solid ashore, dotted in the air
  const legs = routes.flatMap((r) => legsOf(r)).map((l) => {
    const dash = SEA.has(l.mode) ? "9 6" : l.mode === "air" || l.mode === "flight" ? "2 6" : "";
    return `<path d="${d(l.pts)}" fill="none" stroke="${ink.route}" stroke-width="${SEA.has(l.mode) ? 2.6 : 1.8}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  }).join("");

  // the stops, once each, with their names
  const seenStop = new Set<string>();
  const placed: [number, number, boolean][] = [];
  const stops = routes.flatMap((r) => r.stops).filter((s) => { const k = `${s.lng},${s.lat}`; if (seenStop.has(k)) return false; seenStop.add(k); return true; }).map((s) => {
    const [x, y] = P([s.lng, s.lat]);
    // names sit to the right; one that would sit on a name already placed goes to the left
    let left = x > W * 0.6;
    if (placed.some(([px, py, pl]) => pl === left && Math.abs(py - y) < 26 && Math.abs(px - x) < 160)) left = !left;
    placed.push([x, y, left]);
    const name = s.name.split(" — ")[0];
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="7" fill="${ink.ground}" stroke="${ink.route}" stroke-width="2.6"/>` +
      `<text x="${f1(x + (left ? -15 : 15))}" y="${f1(y + 7)}" text-anchor="${left ? "end" : "start"}" font-family="'EB Garamond', Georgia, serif" font-size="24" fill="${ink.boat}" stroke="${ink.ground}" stroke-width="5" paint-order="stroke">${esc(name)}</text>`;
  }).join("");

  // one boat for each different course (upstream and downstream sail opposite ways)
  const courses: [number, number][][] = [];
  const seenCourse = new Set<string>();
  for (const r of routes) { const s = sailOf(r); const k = d(s); if (s.length > 1 && !seenCourse.has(k)) { seenCourse.add(k); courses.push(s); } }
  const hull = `<g transform="scale(1.8)"><path d="M12 0Q7 -4.3 -1 -4.5L-8.5 -3.7Q-10.5 0 -8.5 3.7L-1 4.5Q7 4.3 12 0Z"/></g>`;
  const boats = courses.slice(0, 4).map((c, i) => {
    const pid = `${id}-sail${i ? `-${i}` : ""}`;
    const dur = Math.round(8 + 2.5 * c.length / 2);
    const [a, b] = [P(c[0]), P(c[1])];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return `<path id="${pid}" d="${d(c)}" fill="none"/>` +
      `<g class="ship">${hull}<animateMotion dur="${dur}s" begin="${i * 1.5}s" repeatCount="indefinite" rotate="auto" calcMode="linear" keyPoints="0;0;1;1;1" keyTimes="0;0.04;0.86;0.96;1"><mpath href="#${pid}"/></animateMotion></g>` +
      `<g class="ship-park" transform="translate(${f1(a[0])} ${f1(a[1])}) rotate(${f1(ang)})">${hull}</g>`;
  }).join("");

  const css = `<style>#${id} .ship path,#${id} .ship-park path{fill:${ink.boat};stroke:${ink.ground};stroke-width:1.4;paint-order:stroke}` +
    `#${id} .ship-park{display:none}@media (prefers-reduced-motion: reduce){#${id} .ship{display:none}#${id} .ship-park{display:inline}}</style>`;

  return `<svg id="${esc(id)}" class="jw-route-figure" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}" style="display: block; width: 100%; height: auto; background: ${ink.ground}">` +
    css + water + labels + legs + stops + boats + `</svg>`;
}
