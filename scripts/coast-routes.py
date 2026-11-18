# The coastline for the wide waters (the Caribbean, the Mediterranean, northern Europe, the Arctic, Asia, the Pacific,
# the Americas, the Atlantic crossings, the Seychelles): too large to keep whole at OSM's 100 m, so each is built in two
# tiers from the route files that sail it (James, 18 Nov 2026: every voyage in 3D, the boats round the islands):
#   near any port of call or sailed leg  -> OSM land at 100 m (@geo-maps/earth-lands-100m), so small cays are there
#   everywhere else in the region's box  -> OSM land at 1 km (@geo-maps/earth-lands-1km), so continents still block
# Writes scripts/data/coast/<dest>.geojson, which scripts/sealanes.py routes round and tests/sea-lanes.test.ts checks.
#   python3 scripts/coast-routes.py <earth-lands-100m map.geo.json> <earth-lands-1km map.geo.json> [dest ...]
import glob, json, os, sys
import shapely
from shapely.geometry import shape, box, mapping, Point, LineString
from shapely.ops import unary_union
from shapely.strtree import STRtree

fine_src, coarse_src, only = sys.argv[1], sys.argv[2], sys.argv[3:]
DESTS = ["caribbean", "mediterranean", "scandinavia-northern-europe", "arctic", "trans-atlantic", "asia", "oceania-and-pacific", "north-and-south-america", "seychelles"]
NEAR, LEG, PAD = 0.45, 0.2, 2.0   # degrees: fine land round a stop, along a short leg; box padding

def parts(path):
    g = json.load(open(path))
    out = []
    for gm in (g["geometries"] if "geometries" in g else [f["geometry"] for f in g["features"]]):
        s = shape(gm)
        out += list(s.geoms) if s.geom_type == "MultiPolygon" else [s]
    return out

fine, coarse = parts(fine_src), parts(coarse_src)
ftree, ctree = STRtree(fine), STRtree(coarse)
routes = [json.load(open(f)) for f in glob.glob("public/maps/routes/*.json")]
for dest in DESTS:
    if only and dest not in only: continue
    zone = []
    for r in routes:
        if r.get("destination") != dest or r.get("type") == "overland": continue
        st = r["stops"]
        for i, s in enumerate(st):
            zone.append(Point(s["lng"], s["lat"]).buffer(NEAR, 12))
            if i and abs(st[i - 1]["lng"] - s["lng"]) < 6 and abs(st[i - 1]["lat"] - s["lat"]) < 6:
                zone.append(LineString([(st[i - 1]["lng"], st[i - 1]["lat"]), (s["lng"], s["lat"])]).buffer(LEG, 4))
    if not zone: continue
    Z = unary_union(zone)
    x0, y0, x1, y1 = Z.bounds
    B = box(max(-180, x0 - PAD), max(-89, y0 - PAD), min(180, x1 + PAD), min(89, y1 + PAD))
    near = []
    for z in (Z.geoms if hasattr(Z, "geoms") else [Z]):
        zb = z.bounds
        for i in ftree.query(z):
            c = shapely.clip_by_rect(fine[i], *zb)
            if c.is_empty: continue
            if not c.is_valid: c = shapely.make_valid(c)
            if c.area > box(*zb).area * 0.98 and fine[i].area < c.area: continue   # an inverted clip, never land
            c = c.intersection(z)
            if not c.is_empty: near.append(c)
    far = []
    for i in ctree.query(B):
        c = coarse[i] if coarse[i].is_valid else shapely.make_valid(coarse[i])
        c = c.intersection(B)   # not clip_by_rect: on a continent that wraps a sea it can return the box with the land cut out
        if c.is_empty: continue
        c = c.difference(Z)
        if not c.is_empty: far.append(c)
    feats = []
    for c, tol in [(g, 0.0003) for g in near] + [(g, 0.004) for g in far]:
        for q in (c.geoms if hasattr(c, "geoms") else [c]):
            if q.geom_type != "Polygon" or q.area <= 0: continue
            assert not (len(q.exterior.coords) <= 6 and len(q.interiors) and q.area > 50), f"{dest}: inverted land"
            q = q.simplify(tol, preserve_topology=True)
            co = mapping(q)["coordinates"]
            feats.append({"type": "Feature", "properties": {"layer": "land"}, "geometry": {"type": "Polygon", "coordinates": [[[round(x, 5), round(y, 5)] for x, y in ring] for ring in co]}})
    out = f"scripts/data/coast/{dest}.geojson"
    json.dump({"type": "FeatureCollection", "attribution": "Land: OpenStreetMap contributors (osmdata land polygons via geo-maps earth-lands-100m and 1km, ODbL)", "features": feats}, open(out, "w"), separators=(",", ":"))
    print(dest, len(feats), os.path.getsize(out) // 1024, "KB", flush=True)
