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
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

KM = 111.32           # km per degree of latitude
LANDING_KM = 3.0      # reach from an anchorage at the charted shore to open water
INLAND_KM = 1.5       # a stop charted inland: the line may cross the shore to it, this far past the coast (James, 8 Nov 2026)
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
        # Land raster: each polygon is filled straight onto the grid (PIL), holes cut back out. The OSM coast round the
        # Chilean fjords is thousands of polygons, so a per-cell point-in-polygon test was far too slow.
        x1, y1 = self.x0 + self.nx * self.dlng, self.y0 + self.ny * self.dlat
        img = Image.new("1", (self.nx, self.ny), 0)
        dr = ImageDraw.Draw(img)
        px = lambda r: [((x - self.x0) / self.dlng - 0.5, (y - self.y0) / self.dlat - 0.5) for x, y in r]
        for (bx0, by0, bx1, by1), rings in land:
            if bx1 < self.x0 or bx0 > x1 or by1 < self.y0 or by0 > y1: continue
            if len(rings[0]) >= 3: dr.polygon(px(rings[0]), fill=1, outline=1)
            for hole in rings[1:]:
                if len(hole) >= 3: dr.polygon(px(hole), fill=0, outline=0)
        self.land = np.asarray(img, dtype=bool)
        self.dist = ndimage.distance_transform_edt(~self.land) * self.cell
        self.wet = ndimage.distance_transform_edt(self.land, return_indices=True)[1] if self.land.any() else None

    def ij(self, p):
        return (min(self.ny - 1, max(0, int((p[1] - self.y0) / self.dlat))), min(self.nx - 1, max(0, int((p[0] - self.x0) / self.dlng))))

    def ll(self, c):
        return [self.x0 + (c[1] + 0.5) * self.dlng, self.y0 + (c[0] + 0.5) * self.dlat]

    def free(self, a, b, margin, inland_km=0.0):
        """Sailable cells: further than `margin` km from land, plus the landing round each end."""
        free = self.dist > margin
        I, J = np.ogrid[:self.ny, :self.nx]
        for p in (a, b):
            ci = self.ij(p)
            r = max(margin - self.dist[ci] + self.cell * 2 if self.dist[ci] < margin else 0, self.cell * 1.5)
            if self.land[ci]:   # charted inside the land: reach the nearest water, however far the chart puts it
                w = (self.wet[0][ci], self.wet[1][ci])
                r = max(r, math.hypot(w[0] - ci[0], w[1] - ci[1]) * self.cell + margin + self.cell * 2 + inland_km)
            else: r = min(max(r, inland_km), LANDING_KM)
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


def land_hits(line, land):
    """The sampled points of a leg on land outside its two landings (what crosses() tests), as [[lng, lat], ...]."""
    a, b = line[0], line[-1]
    reach = [(_coast_km(np.asarray(p), land) + INLAND_KM if _on_land(np.asarray([p]), land)[0] else 3.0) for p in (a, b)]
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    pts = []
    for p, q in zip(line, line[1:]):
        n = max(2, int(math.ceil(km(p, q, k) / 0.1)) + 1)
        t = np.linspace(0, 1, n)[:, None]
        pts.append(np.asarray(p) + (np.asarray(q) - np.asarray(p)) * t)
    pts = np.vstack(pts)
    da = np.hypot((pts[:, 0] - a[0]) * k * KM, (pts[:, 1] - a[1]) * KM)
    db = np.hypot((pts[:, 0] - b[0]) * k * KM, (pts[:, 1] - b[1]) * KM)
    far = pts[(da > reach[0]) & (db > reach[1])]
    return far[_on_land(far, land)] if len(far) else far


def taut_free_path(g, free, a, b, land, tries=8):
    """Shortest path over free cells, pulled taut; islets thinner than a cell that the line still touches are blocked
    (their cells and the ring round them) and the path found again, up to `tries` times."""
    free = free.copy()
    for _ in range(tries):
        free[g.ij(a)] = free[g.ij(b)] = True
        cells = shortest(free, g.ij(a), g.ij(b))
        if not cells: return None
        pts = [a] + [g.ll(c) for c in cells[1:-1]] + [b]
        out, i = [pts[0]], 0
        while i < len(pts) - 1:
            j = len(pts) - 1
            while j > i + 1 and not clear(g, free, pts[i], pts[j]): j -= 1
            out.append(pts[j]); i = j
        line = [[round(float(p[0]), 4), round(float(p[1]), 4)] for p in out[:-1]] + [b]
        hits = land_hits(line, land)
        if not len(hits): return line
        for h in hits:
            ci = g.ij(h)
            free[max(0, ci[0] - 1):ci[0] + 2, max(0, ci[1] - 1):ci[1] + 2] = False
    return None


def crosses(line, land):
    """Whether a leg crosses the charted land outside its two landings (the rule tests/sea-lanes.test.ts checks):
    3 km round an anchorage at sea, or, for a stop the chart puts inland, its distance to the coast plus 4 km."""
    a, b = line[0], line[-1]
    reach = [(_coast_km(np.asarray(p), land) + INLAND_KM if _on_land(np.asarray([p]), land)[0] else 3.0) for p in (a, b)]
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


def sea_path(a, b, land, exits=True):
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
    for ck, wk in ((0.4, 15.0), (0.15, 15.0), (0.25, 40.0)):   # Stanley's Narrows and the fjord passes are narrower than 400 m
        line = corridor_path(a, b, land, cell_km=ck, width_km=wk)
        if line: return line, True
    line = exit_path(a, b, land) if exits else None
    if line: return line, True
    print(f"  sealanes: no way round from {a} to {b}; left straight", file=sys.stderr)
    return [a, b], False


def local_exit(p, land, open_km=1.0):
    """From a stop up a narrow arm (a fjord head, a cove), the way out to open water (open_km off the coast, in the
    largest water body within 25 km), on a fine 50 m grid: [[lng, lat], ...] from p to the exit, or None."""
    g = Grid(p, p, land, 0.0, 1000)
    lab, n = ndimage.label(~g.land, structure=np.ones((3, 3)))
    if not n: return None
    sizes = np.bincount(lab.ravel()); sizes[0] = 0
    main = lab == sizes.argmax()
    target = main & (g.dist > open_km)
    if not target.any(): return None
    for margin in (0.1, 0.05, 0.0):
        free = (g.dist > margin) & main
        ci = g.ij(p); I, J = np.ogrid[:g.ny, :g.nx]
        free |= ((I - ci[0]) ** 2 + (J - ci[1]) ** 2) * g.cell ** 2 <= (ANCHOR_KM + 2 * g.cell) ** 2
        # nearest reachable target: distance from p over free cells
        dist = ndimage.distance_transform_edt(~target)
        reach, _ = ndimage.label(free, structure=np.ones((3, 3)))
        comp = reach == reach[ci]
        cand = np.argwhere(comp & target)
        if not len(cand): continue
        t = tuple(cand[np.argmin(((cand - np.array(ci)) ** 2).sum(1))])
        cells = shortest(free, ci, t)
        if not cells: continue
        pts = [p] + [g.ll(c) for c in cells[1:]]
        out, i = [pts[0]], 0
        while i < len(pts) - 1:
            j = len(pts) - 1
            while j > i + 1 and not clear(g, free, pts[i], pts[j]): j -= 1
            out.append(pts[j]); i = j
        return [[round(float(q[0]), 4), round(float(q[1]), 4)] for q in out]
    return None


def exit_path(a, b, land):
    """Last resort for a leg that starts or ends up a narrow arm: leave the arm on a fine local grid, sail the open
    stretch with the usual router, come back up the other arm. Returns the joined line or None."""
    ea, eb = local_exit(a, land), local_exit(b, land)
    if not ea or not eb: return None
    a2, b2 = ea[-1], eb[-1]
    mid, _ = sea_path(a2, b2, land, exits=False)
    line = ea[:-1] + mid + eb[::-1][1:]
    return line if not crosses(line, land) else None


def corridor_path(a, b, land, cell_km=0.4, width_km=15.0):
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    span = max(abs(a[0] - b[0]) * k * KM, abs(a[1] - b[1]) * KM) + 2 * width_km
    if span / cell_km <= 3000:   # small enough to search the whole sea round the leg at the fine cell, no corridor
        f = Grid(a, b, land, 0.0, int(span / cell_km))
        f2 = Grid(a, b, land, width_km / max(1.0, span - 2 * width_km), int(span / cell_km)) if width_km > 25 else f
        for g in (f, f2):
            for margin in MARGINS:
                line = taut_free_path(g, g.free(a, b, margin, inland_km=1.2 if width_km > 15 else 0.0), a, b, land)
                if line: return line
    for erode in (2, 1, 0):   # widen the coarse water less if its way cuts across land the fine pass cannot follow
        line = _corridor(a, b, land, cell_km, width_km, erode)
        if line: return line
    return None


def _corridor(a, b, land, cell_km, width_km, erode):
    """Long legs through narrow water (the Strait of Magellan, the Beagle Channel, Stanley's narrows, the Chilean fjords):
    a coarse pass on a grid whose water is widened two cells (so channels narrower than a cell stay open) finds the way,
    then a fine pass (cell_km) inside a corridor width_km either side of it finds the real line round the land."""
    g = Grid(a, b, land, 0.6, 420)
    if not g.land.any(): return None
    water = ~ndimage.binary_erosion(g.land, iterations=erode) if erode else ~g.land
    for p in (a, b):
        ci = g.ij(p); I, J = np.ogrid[:g.ny, :g.nx]
        r = 2   # tight: a wide landing here lets the coarse line cut across a peninsula (Grytviken, Thatcher Peninsula)
        if g.land[ci]: w = (g.wet[0][ci], g.wet[1][ci]); r = max(r, int(math.hypot(w[0] - ci[0], w[1] - ci[1])) + 2)
        water |= (I - ci[0]) ** 2 + (J - ci[1]) ** 2 <= r * r
    cells = shortest(water, g.ij(a), g.ij(b))
    if not cells: return None
    coarse = [a] + [g.ll(c) for c in cells[1:-1]] + [b]
    xs, ys = [p[0] for p in coarse], [p[1] for p in coarse]
    lo, hi = [min(xs), min(ys)], [max(xs), max(ys)]
    k = math.cos(math.radians((lo[1] + hi[1]) / 2))
    span = max((hi[0] - lo[0]) * k * KM, (hi[1] - lo[1]) * KM) + 50
    pad = (width_km + 15) / KM   # the corridor must fit inside the fine grid
    lo, hi = [lo[0] - pad / k, lo[1] - pad], [hi[0] + pad / k, hi[1] + pad]
    span += 2 * (width_km + 15)
    f = Grid(lo, hi, land, 0.0, int(min(6000, span / cell_km)))
    img = Image.new("1", (f.nx, f.ny), 0)
    ImageDraw.Draw(img).line([((x - f.x0) / f.dlng - 0.5, (y - f.y0) / f.dlat - 0.5) for x, y in coarse], fill=1, width=1)
    near = ndimage.distance_transform_edt(~np.asarray(img, dtype=bool)) * f.cell <= width_km
    for margin in MARGINS:
        line = taut_free_path(f, f.free(a, b, margin, inland_km=1.2 if width_km > 15 else 0.0) & near, a, b, land)
        if line: return line
    return None


def clearance(line, land):
    """km from the coast at the lane's turning points (its inner vertices): the 3D map rounds each corner by at most half
    of it, so a lane threaded through a narrow channel keeps tight corners and stays at sea (components/maps/terrain/geo.ts)."""
    inner = line[1:-1]
    return round(min(_coast_km(np.asarray(p), land) for p in inner), 2) if inner else None


ANCHOR_KM = 0.4    # an anchorage keeps this far off the coast (clear of pockets the router cannot reach)


def anchorage(p, land):
    """The nearest point of open sea (the largest water body round the stop, not a lake or a sealed lagoon) at least
    ANCHOR_KM off the coast, for a stop the data pins on land: [lng, lat], or None if the stop is already at sea."""
    if not land or not _on_land(np.asarray([p]), land)[0]: return None
    g = Grid(p, p, land, 0.0, 600)                       # 25 km of coast and sea round the pin, ~0.08 km cells
    lab, n = ndimage.label(~g.land, structure=np.ones((3, 3)))
    if not n: return None
    sizes = np.bincount(lab.ravel()); sizes[0] = 0
    sea = (lab == sizes.argmax()) & (g.dist > ANCHOR_KM)
    if not sea.any(): sea = lab == sizes.argmax()
    i, j = g.ij(p)
    idx = ndimage.distance_transform_edt(~sea, return_indices=True)[1]
    c = (idx[0][i, j], idx[1][i, j])
    q = g.ll(c)
    return [round(float(q[0]), 4), round(float(q[1]), 4)]


def anchor_stops(r, land):
    """Move every sailed stop the data pins on land (an island's middle, a town inland) to its anchorage, so the line
    and the vessel end at sea beside it (James, 8 Nov 2026). The data's own position is kept as "charted"."""
    st = r["stops"]
    for k, s in enumerate(st):
        arrive = k > 0 and str(s.get("mode", "sea")).lower() in SEA_MODES
        leave = k + 1 < len(st) and str(st[k + 1].get("mode", "sea")).lower() in SEA_MODES
        if not (arrive or leave) or "charted" in s: continue
        a = anchorage([s["lng"], s["lat"]], land)
        if a: s["charted"] = [s["lng"], s["lat"]]; s["lng"], s["lat"] = a


def route_stops(r, maps_dir):
    """Route every sailed leg of a jw-route v1 route (dict) in place. Returns the rerouted legs, "from > to"."""
    land = land_of(maps_dir, r.get("destination") or "")
    if land and r.get("type") != "overland": anchor_stops(r, land)
    done, prev = [], None
    for s in r["stops"]:
        if prev is not None and land and str(s.get("mode", "sea")).lower() in SEA_MODES:
            p, moved = sea_path([prev["lng"], prev["lat"]], [s["lng"], s["lat"]], land)
            s["path"] = p
            if moved:
                s["lane"] = "sea"; done.append(f"{prev['name']} > {s['name']}")
                s["clear"] = clearance(p, land)
            else: s.pop("lane", None); s.pop("clear", None)
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
