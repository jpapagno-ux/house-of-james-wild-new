"""Sea lanes: routes a sailed leg around land, on the same coastline the house route chart draws
(public/maps/data/<dest>/base.geojson, the "land" layer). Used by scripts/build-ship-maps.py, so the
engraved chart, its SVG figure and the 3D terrain map all read one routed "path" per leg from the
route files (James, 3 Nov 2026: the line must go round the islands, never across them).

Method: a leg that already keeps clear of the coast stays a straight two-point path. Otherwise the
water round the leg is rasterised on a square-km grid, land is grown by a safety margin (1 km, then
0.6, 0.3 and 0.1 km where a strait is narrow), the shortest 16-way path is found (Dijkstra), and the
path is pulled taut (line of sight) so only the turning points round headlands and islands remain.
An anchorage the coastline data puts on or inside the shore reaches the nearest open water first
(its "landing": up to LANDING_KM, or as far as the chart puts the stop inland; tests/sea-lanes.test.ts
allows the same). Run on route files in place:
    python3 scripts/sealanes.py public/maps/routes/<id>.json ...
"""
import json, math, os, sys

import numpy as np
from matplotlib.path import Path
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

KM = 111.32           # km per degree of latitude
LANDING_KM = 3.0      # reach from an anchorage at the charted shore to open water
CLEAR_KM = 0.3        # a straight leg that keeps this far off the coast is left straight
MARGINS = (1.0, 0.6, 0.3, 0.1)
CELL_KM = 0.25
SEA_MODES = {"sea", "ship", "vessel", "boat", "zodiac", "kayak"}
_LAND = {}


COAST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "coast")
COAST_ALIAS = {"antarctica": "polar"}   # the Peninsula chart sits inside the polar coastline


def coast_file(maps_dir, dest):
    """The coastline a destination's legs are routed round: the OSM land polygons clipped for it (scripts/data/coast,
    built by scripts/coast-clip.py; James, 8 Nov 2026: the MapTiler 3D map draws OSM's coast, so the lanes must too),
    else the chart's own land (public/maps/data/<dest>/base.geojson)."""
    c = os.path.join(COAST_DIR, f"{COAST_ALIAS.get(dest, dest)}.geojson")
    return c if dest and os.path.exists(c) else os.path.join(maps_dir, "data", dest, "base.geojson")


def land_of(maps_dir, dest):
    """The land polygons for a destination: a list of (bbox, [ring, ...]) with rings as (n, 2) [lng, lat]."""
    if dest in _LAND: return _LAND[dest]
    f = coast_file(maps_dir, dest)
    out = []
    if dest and os.path.exists(f):
        for ft in json.load(open(f))["features"]:
            if (ft.get("properties") or {}).get("layer", "land") != "land": continue
            g = ft["geometry"]
            polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]] if g["type"] == "Polygon" else []
            for p in polys:
                rings = [np.asarray(r, float) for r in p]
                out.append(((rings[0][:, 0].min(), rings[0][:, 1].min(), rings[0][:, 0].max(), rings[0][:, 1].max()), rings))
    _LAND[dest] = out
    return out


class Grid:
    """Square-km cells round a leg: land, and km from each cell to the nearest land."""
    def __init__(self, a, b, land, spread=0.6, div=320):
        self.k = math.cos(math.radians((a[1] + b[1]) / 2))
        dx, dy = abs(a[0] - b[0]) * self.k * KM, abs(a[1] - b[1]) * KM
        pad = max(25.0, spread * max(dx, dy))                 # km of sea round the leg to find a way round
        self.cell = max(CELL_KM * 320 / div, (max(dx, dy) + 2 * pad) / div)
        self.dlat, self.dlng = self.cell / KM, self.cell / (KM * self.k)
        self.x0 = min(a[0], b[0]) - pad / (KM * self.k)
        self.y0 = min(a[1], b[1]) - pad / KM
        self.nx = int((max(a[0], b[0]) + pad / (KM * self.k) - self.x0) / self.dlng) + 1
        self.ny = int((max(a[1], b[1]) + pad / KM - self.y0) / self.dlat) + 1
        X, Y = np.meshgrid(self.x0 + (np.arange(self.nx) + 0.5) * self.dlng, self.y0 + (np.arange(self.ny) + 0.5) * self.dlat)
        pts = np.column_stack([X.ravel(), Y.ravel()])
        m = np.zeros(len(pts), bool)
        x1, y1 = self.x0 + self.nx * self.dlng, self.y0 + self.ny * self.dlat
        for (bx0, by0, bx1, by1), rings in land:
            if bx1 < self.x0 or bx0 > x1 or by1 < self.y0 or by0 > y1: continue
            inside = Path(rings[0]).contains_points(pts)
            for hole in rings[1:]: inside &= ~Path(hole).contains_points(pts)
            m |= inside
        self.land = m.reshape(self.ny, self.nx)
        self.dist = ndimage.distance_transform_edt(~self.land) * self.cell
        self.wet = ndimage.distance_transform_edt(self.land, return_indices=True)[1] if self.land.any() else None

    def ij(self, p):
        return (min(self.ny - 1, max(0, int((p[1] - self.y0) / self.dlat))), min(self.nx - 1, max(0, int((p[0] - self.x0) / self.dlng))))

    def ll(self, c):
        return [self.x0 + (c[1] + 0.5) * self.dlng, self.y0 + (c[0] + 0.5) * self.dlat]

    def free(self, a, b, margin):
        """Sailable cells: further than `margin` km from land, plus the landing round each end."""
        free = self.dist > margin
        I, J = np.ogrid[:self.ny, :self.nx]
        for p in (a, b):
            ci = self.ij(p)
            r = max(margin - self.dist[ci] + self.cell * 2 if self.dist[ci] < margin else 0, self.cell * 1.5)
            if self.land[ci]:   # charted inside the land: reach the nearest water, however far the chart puts it
                w = (self.wet[0][ci], self.wet[1][ci])
                r = max(r, math.hypot(w[0] - ci[0], w[1] - ci[1]) * self.cell + margin + self.cell * 2)
            else: r = min(r, LANDING_KM)
            free |= ((I - ci[0]) ** 2 + (J - ci[1]) ** 2) * self.cell ** 2 <= r * r
        return free


def km(a, b, k):
    return math.hypot((b[0] - a[0]) * k * KM, (b[1] - a[1]) * KM)


def clear(g, free, a, b):
    """Whether the straight segment a to b (lng, lat) stays on free cells."""
    n = max(2, int(km(a, b, g.k) / (g.cell * 0.4)) + 1)
    t = np.linspace(0, 1, n)
    i = np.clip(((a[1] + (b[1] - a[1]) * t - g.y0) / g.dlat).astype(int), 0, g.ny - 1)
    j = np.clip(((a[0] + (b[0] - a[0]) * t - g.x0) / g.dlng).astype(int), 0, g.nx - 1)
    return bool(free[i, j].all())


STEPS = [(di, dj) for di in range(-2, 3) for dj in range(-2, 3) if (di, dj) != (0, 0) and math.gcd(abs(di), abs(dj)) == 1]


def shifted(arr, di, dj):
    """arr[i + di, j + dj] at each cell (False off the grid)."""
    ny, nx = arr.shape
    out = np.zeros_like(arr)
    out[max(0, -di):ny - max(0, di), max(0, -dj):nx - max(0, dj)] = arr[max(0, di):ny - max(0, -di), max(0, dj):nx - max(0, -dj)]
    return out


def shortest(free, s, t):
    """Cells of the shortest 16-way path from s to t over free cells, or None."""
    ny, nx = free.shape
    idx = np.arange(ny * nx).reshape(ny, nx)
    rows, cols, w = [], [], []
    for di, dj in STEPS:
        ok = free & shifted(free, di, dj)
        if abs(di) == 2 or abs(dj) == 2:   # a knight's move needs the cells it passes free as well
            ok &= shifted(free, int(np.sign(di)), int(np.sign(dj))) & shifted(free, di // 2 if abs(di) == 2 else 0, dj // 2 if abs(dj) == 2 else 0)
        src = idx[ok]
        rows.append(src); cols.append(src + di * nx + dj); w.append(np.full(len(src), math.hypot(di, dj)))
    G = coo_matrix((np.concatenate(w), (np.concatenate(rows), np.concatenate(cols))), shape=(ny * nx, ny * nx)).tocsr()
    si, ti = s[0] * nx + s[1], t[0] * nx + t[1]
    d, pred = dijkstra(G, indices=si, return_predecessors=True)
    if not np.isfinite(d[ti]): return None
    out, c = [ti], ti
    while c != si: c = pred[c]; out.append(c)
    return [(c // nx, c % nx) for c in out[::-1]]


def _coast_km(p, land):
    """km from p to the nearest charted coast (any ring edge)."""
    k, best = math.cos(math.radians(p[1])), 1e18
    for _, rings in land:
        for r in rings:
            A = (r[:-1] - p) * [k * KM, KM]; B = (r[1:] - p) * [k * KM, KM]; D = B - A
            L = (D * D).sum(1); t = np.clip(-(A * D).sum(1) / np.where(L == 0, 1, L), 0, 1)
            best = min(best, float(np.hypot(*(A + D * t[:, None]).T).min()))
    return best


def _on_land(pts, land):
    m = np.zeros(len(pts), bool)
    for (bx0, by0, bx1, by1), rings in land:
        sel = (pts[:, 0] >= bx0) & (pts[:, 0] <= bx1) & (pts[:, 1] >= by0) & (pts[:, 1] <= by1)
        if not sel.any(): continue
        inside = Path(rings[0]).contains_points(pts[sel])
        for hole in rings[1:]: inside &= ~Path(hole).contains_points(pts[sel])
        m[np.flatnonzero(sel)[inside]] = True
    return m


def crosses(line, land):
    """Whether a leg crosses the charted land outside its two landings (the rule tests/sea-lanes.test.ts checks):
    3 km round an anchorage at sea, or, for a stop the chart puts inland, its distance to the coast plus 4 km."""
    a, b = line[0], line[-1]
    reach = [(_coast_km(np.asarray(p), land) + 4 if _on_land(np.asarray([p]), land)[0] else 3.0) for p in (a, b)]
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    pts = []
    for p, q in zip(line, line[1:]):
        n = max(2, int(math.ceil(km(p, q, k) / 0.1)) + 1)
        t = np.linspace(0, 1, n)[:, None]
        pts.append(np.asarray(p) + (np.asarray(q) - np.asarray(p)) * t)
    pts = np.vstack(pts)
    da = np.hypot((pts[:, 0] - a[0]) * k * KM, (pts[:, 1] - a[1]) * KM)
    db = np.hypot((pts[:, 0] - b[0]) * k * KM, (pts[:, 1] - b[1]) * KM)
    far = (da > reach[0]) & (db > reach[1])
    return bool(far.any() and _on_land(pts[far], land).any())


def sea_path(a, b, land):
    """A sailed leg from a to b ([lng, lat]) that goes round the charted land: ([[lng, lat], ...], rerouted)."""
    a, b = [float(a[0]), float(a[1])], [float(b[0]), float(b[1])]
    if not land or a == b: return [a, b], False
    for spread, div in ((0.6, 320), (0.6, 900), (1.5, 500), (1.5, 1000), (3.0, 700)):   # finer cells, then a wider sea
        g = Grid(a, b, land, spread, div)
        if not g.land.any(): return [a, b], False
        if clear(g, g.free(a, b, CLEAR_KM), a, b) and not crosses([a, b], land): return [a, b], False
        for margin in MARGINS:
            free = g.free(a, b, margin)
            free[g.ij(a)] = free[g.ij(b)] = True
            cells = shortest(free, g.ij(a), g.ij(b))
            if not cells: continue
            pts = [a] + [g.ll(c) for c in cells[1:-1]] + [b]
            # pull taut: from each kept point, jump to the furthest point still in line of sight
            out, i = [pts[0]], 0
            while i < len(pts) - 1:
                j = len(pts) - 1
                while j > i + 1 and not clear(g, free, pts[i], pts[j]): j -= 1
                out.append(pts[j]); i = j
            line = [[round(float(p[0]), 4), round(float(p[1]), 4)] for p in out[:-1]] + [b]
            if not crosses(line, land): return line, True
            break   # a coarse grid slipped past thin land: try finer cells
    print(f"  sealanes: no way round from {a} to {b}; left straight", file=sys.stderr)
    return [a, b], False


def route_stops(r, maps_dir):
    """Route every sailed leg of a jw-route v1 route (dict) in place. Returns the rerouted legs, "from > to"."""
    land = land_of(maps_dir, r.get("destination") or "")
    done, prev = [], None
    for s in r["stops"]:
        if prev is not None and land and str(s.get("mode", "sea")).lower() in SEA_MODES:
            p, moved = sea_path([prev["lng"], prev["lat"]], [s["lng"], s["lat"]], land)
            s["path"] = p
            if moved: s["lane"] = "sea"; done.append(f"{prev['name']} > {s['name']}")
            else: s.pop("lane", None)
        prev = s
    return done


def route_file(path, maps_dir):
    """Route one jw-route v1 file in place."""
    r = json.load(open(path))
    done = route_stops(r, maps_dir)
    json.dump(r, open(path, "w"), indent=1, ensure_ascii=False)
    return done


if __name__ == "__main__":
    for f in sys.argv[1:]:
        for leg in route_file(f, os.path.join(os.path.dirname(os.path.abspath(f)), "..")): print(f"{os.path.basename(f)}: {leg}")
