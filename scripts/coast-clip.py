# Clip OSM land (geo-maps earth-lands-100m, OSM land polygons) to each sea destination, write <out>/<dest>.geojson
import json, sys, os, shapely
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union
src, out = sys.argv[1], sys.argv[2]
BOX = {  # lng/lat, padded round every sailed route of the destination
 "galapagos": (-92.3, -1.8, -88.9, 1.9),
 "polar": (-76.0, -69.0, -33.0, -40.5),
 "antarctica": (-76.0, -69.0, -53.0, -52.0),
 "raja-ampat": (129.4, -2.6, 132.1, 0.8),
 "indonesia": (127.5, -5.2, 132.1, 0.8),
 "komodo": (117.0, -9.2, 120.5, -7.6),
 "costa-rica": (-86.3, 7.8, -82.3, 11.4),
 "fiji": (176.6, -19.3, 178.9, -16.3),
}
g = json.load(open(src))
geoms = g["geometries"] if "geometries" in g else [f["geometry"] for f in g["features"]]
boxes = {k: box(*v) for k, v in BOX.items()}
acc = {k: [] for k in BOX}
for gm in geoms:
    s = shape(gm)
    for p in (s.geoms if s.geom_type == "MultiPolygon" else [s]):
        b = p.bounds
        for k, (x0, y0, x1, y1) in BOX.items():
            if b[2] < x0 or b[0] > x1 or b[3] < y0 or b[1] > y1: continue
            c = shapely.clip_by_rect(p, x0, y0, x1, y1)
            if not c.is_valid: c = c.buffer(0)
            if not c.is_empty: acc[k].append(c)
os.makedirs(out, exist_ok=True)
for k, ps in acc.items():
    feats = []
    for c in ps:
        for q in (c.geoms if hasattr(c, "geoms") else [c]):
            if q.geom_type == "Polygon" and q.area > 0:
                feats.append({"type": "Feature", "properties": {"layer": "land"}, "geometry": mapping(q.simplify(0.00008, preserve_topology=True))})
    json.dump({"type": "FeatureCollection", "attribution": "Land: OpenStreetMap contributors (osmdata land polygons via geo-maps earth-lands-100m, ODbL)", "features": feats}, open(f"{out}/{k}.geojson", "w"), separators=(",", ":"))
    print(k, len(feats), os.path.getsize(f"{out}/{k}.geojson") // 1024, "KB")
