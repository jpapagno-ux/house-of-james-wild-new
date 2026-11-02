"""Builds a jw-route v1 file per ship itinerary (public/maps/routes/<ship>-<direction>-<nights>n.json)
from lib/content/ships/<waters>/*.json (Amazon and Galapagos; the Nile has its own river-following
build, scripts/build-nile-maps.py), for the house route chart. Legs join the day positions in order;
courses and positions are approximate. Run from the repo root after a ship file changes:
    python3 scripts/build-ship-maps.py .
"""
import json, os, re, sys
ROOT = sys.argv[1]
LABELS = {
  "amazon": [{"text": "Amazon", "lat": -4.35, "lng": -73.3, "kind": "sea"}, {"text": "Pacaya-Samiria", "lat": -4.9, "lng": -74.2, "kind": "region"}],
  "galapagos": [{"text": "Pacific Ocean", "lat": -1.3, "lng": -91.6, "kind": "sea"}],
}
OUT = os.path.join(ROOT, "public/maps/routes")

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

for waters in LABELS:
  SHIPS = os.path.join(ROOT, "lib/content/ships", waters)
  for f in sorted(os.listdir(SHIPS)):
    if not f.endswith(".json"): continue
    s = json.load(open(os.path.join(SHIPS, f)))
    for it in s["itineraries"]:
        if not it["days"]: continue
        rid = f"{s['slug']}-{slug(it['direction'])}-{it['nights']}n"
        stops, prev = [], None
        for d in it["days"]:
            st = {"day": d["day"], "name": d["place"], "lat": d["lat"], "lng": d["lng"]}
            if prev is None: st["kind"] = "port"
            else:
                st["mode"] = "sea"
                st["path"] = [[prev["lng"], prev["lat"]], [d["lng"], d["lat"]]]
            stops.append(st); prev = d
        stops[-1]["kind"] = "port"
        route = {"id": rid, "type": "voyage", "destination": waters, "title": f"{it['name'].capitalize()} aboard {s['name']}",
                 "subtitle": f"{it['nights']} nights · {it['direction'].split(' (')[0]} · {s['name']}",
                 "days": {str(d["day"]): d["title"] for d in it["days"]}, "stops": stops,
                 "map_note": "River course and positions approximate, not a navigational chart",
                 "fallback": {"labels": LABELS[waters]}}
        json.dump(route, open(os.path.join(OUT, f"{rid}.json"), "w"), indent=1, ensure_ascii=False)
        print(rid)
