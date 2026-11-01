"""Builds the Nile chart data (public/maps/data/nile: bbox, land, river and Lake Nasser overlay) and a
jw-route v1 file per Nile ship itinerary (public/maps/routes/<ship>-<direction>-<nights>n.json) from
lib/content/ships/nile/*.json. Run from the repo root after a ship file changes:
    python3 scripts/build-nile-maps.py .
"""
import json, math, os, re, sys
ROOT = sys.argv[1]
MAPS = os.path.join(ROOT, "public/maps")
SHIPS = os.path.join(ROOT, "lib/content/ships/nile")

# The Nile's course, Qena to the High Dam, and Lake Nasser to Wadi Halfa (lat, lng): standard town positions.
NILE = [(26.60, 32.35), (26.32, 32.62), (26.16, 32.73), (26.14, 32.66), (26.05, 32.64), (25.92, 32.72), (25.80, 32.70), (25.70, 32.64),
        (25.62, 32.54), (25.45, 32.52), (25.29, 32.55), (25.15, 32.66), (24.98, 32.87), (24.80, 32.90), (24.64, 32.93),
        (24.47, 32.95), (24.38, 32.92), (24.20, 32.88), (24.09, 32.89), (23.97, 32.88)]
NASSER = [(23.97, 32.88), (23.75, 32.86), (23.55, 32.80), (23.30, 32.72), (23.05, 32.62), (22.86, 32.50), (22.72, 32.28),
          (22.58, 32.00), (22.45, 31.78), (22.34, 31.62), (22.10, 31.48), (21.90, 31.40)]
COURSE = NILE + NASSER[1:]

def ribbon(pts, half):
    """A polygon `half` degrees either side of a polyline (lat, lng), as GeoJSON [lng, lat] ring."""
    L, R = [], []
    for i, (la, lo) in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
        k = math.cos(math.radians(la))
        dx, dy = (b[1] - a[1]) * k, b[0] - a[0]
        n = math.hypot(dx, dy) or 1
        nx, ny = -dy / n, dx / n  # unit normal in (x east, y north)
        L.append([round(lo + nx * half / k, 4), round(la + ny * half, 4)])
        R.append([round(lo - nx * half / k, 4), round(la - ny * half, 4)])
    ring = L + R[::-1] + [L[0]]
    return ring

def write(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump(obj, open(p, "w"), ensure_ascii=False, indent=1 if p.endswith("route.json") else None)

# --- destination data ---
D = os.path.join(MAPS, "data/nile")
write(os.path.join(D, "meta.json"), {"slug": "nile", "name": "The Nile, Luxor to Aswan and Lake Nasser", "bbox": [31.2, 21.9, 33.9, 26.4], "attribution": "Land: Natural Earth · River course: approximate, after standard town positions"})
world = json.load(open(os.path.join(MAPS, "data/world.geojson")))
def touches(g):
    rings = g["coordinates"] if g["type"] == "Polygon" else [r for poly in g["coordinates"] for r in poly]
    return any(26 <= x <= 40 and 16 <= y <= 32 for ring in rings for x, y in ring)
land = [{"type": "Feature", "properties": {"layer": "land"}, "geometry": f["geometry"]} for f in world["features"] if touches(f["geometry"])]
write(os.path.join(D, "base.geojson"), {"type": "FeatureCollection", "features": land})
overlay = {"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"k": "lake", "name": "Nile"}, "geometry": {"type": "Polygon", "coordinates": [ribbon(NILE, 0.014)]}},
    {"type": "Feature", "properties": {"k": "lake", "name": "Lake Nasser"}, "geometry": {"type": "Polygon", "coordinates": [ribbon(NASSER, 0.06)]}},
    {"type": "Feature", "properties": {"k": "river", "name": "Nile"}, "geometry": {"type": "LineString", "coordinates": [[lo, la] for la, lo in COURSE]}},
]}
write(os.path.join(D, "overlay.geojson"), overlay)

# --- route files ---
def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def near(la, lo): return min(range(len(COURSE)), key=lambda i: (COURSE[i][0] - la) ** 2 + (COURSE[i][1] - lo) ** 2)
def river_path(a, b):
    i, j = near(a["lat"], a["lng"]), near(b["lat"], b["lng"])
    step = 1 if j > i else -1
    inner = [[COURSE[k][1], COURSE[k][0]] for k in range(i + step, j, step)] if i != j else []
    return [[a["lng"], a["lat"]]] + inner + [[b["lng"], b["lat"]]]

made = []
for f in sorted(os.listdir(SHIPS)):
    if not f.endswith(".json"): continue
    s = json.load(open(os.path.join(SHIPS, f)))
    for it in s["itineraries"]:
        if not it["days"]: continue
        rid = f"{s['slug']}-{slug(it['direction'])}-{it['nights']}n"
        stops = []
        days = it["days"]
        for i, d in enumerate(days):
            st = {"day": d["day"], "name": d["place"], "lat": d["lat"], "lng": d["lng"]}
            if i == 0 or i == len(days) - 1: st["kind"] = "port"
            if i > 0:
                prev = days[i - 1]
                off_river = lambda x: (x["lat"] - COURSE[near(x["lat"], x["lng"])][0]) ** 2 + (x["lng"] - COURSE[near(x["lat"], x["lng"])][1]) ** 2 > 0.002
                flew = re.search(r"\bfl(y|ies|ight|ew)\b", d["summary"] + " " + prev["summary"], re.I)
                if flew and "Abu Simbel" in (d["place"], prev["place"]): st["mode"] = "air"
                elif off_river(d): st["mode"] = "land"
                else:
                    st["mode"] = "sea"
                    p = river_path(prev, d) if not off_river(prev) else []
                    if len(p) > 2: st["path"] = p
            stops.append(st)
        lake = any(x["lat"] < 23.8 for x in days)
        labels = [{"text": "Nile", "lat": 25.45, "lng": 32.40, "kind": "sea"},
                  {"text": "Eastern Desert", "lat": 25.1, "lng": 33.45, "kind": "region"},
                  {"text": "Western Desert", "lat": 24.7, "lng": 32.15, "kind": "region"}]
        if lake: labels.append({"text": "Lake Nasser", "lat": 22.95, "lng": 32.95, "kind": "sea"})
        route = {"id": rid, "type": "voyage", "destination": "nile", "title": f"{it['direction']} aboard {s['name']}",
                 "subtitle": f"{it['nights']} nights · {it['direction']} · {s['name']}, {s['brandLine']}",
                 "days": {str(d["day"]): d["title"] for d in days}, "stops": stops,
                 "map_note": "After Natural Earth · river course and positions approximate, not a navigational chart",
                 "fallback": {"labels": labels}}
        json.dump(route, open(os.path.join(MAPS, "routes", rid + ".json"), "w"), ensure_ascii=False, indent=1)
        made.append(rid)
print("\n".join(made))
