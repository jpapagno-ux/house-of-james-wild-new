"""Builds a jw-route v1 file per ship itinerary (public/maps/routes/<ship>-<direction>-<nights>n.json)
from lib/content/ships/<waters>/*.json (Amazon and Galapagos; the Nile has its own river-following
build, scripts/build-nile-maps.py), for the house route chart. Legs join the day positions in order;
courses and positions are approximate. Sailed legs go round the charted land (scripts/sealanes.py: the one
routed "path" per leg that the engraved chart, its SVG figure and the 3D terrain map all draw). Run from the repo root after a ship file changes:
    python3 scripts/build-ship-maps.py .
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sealanes import route_stops
ROOT = sys.argv[1]
MAPS = os.path.join(ROOT, "public/maps")
LABELS = {
  "amazon": [{"text": "Amazon", "lat": -4.35, "lng": -73.3, "kind": "sea"}, {"text": "Pacaya-Samiria", "lat": -4.9, "lng": -74.2, "kind": "region"}],
  "galapagos": [{"text": "Pacific Ocean", "lat": -1.3, "lng": -91.6, "kind": "sea"}],
  "indonesia": [{"text": "Indonesia", "lat": -4.0, "lng": 125.0, "kind": "sea"}],
  "tahiti": [{"text": "Pacific Ocean", "lat": -17.6, "lng": -148.6, "kind": "sea"}, {"text": "Society Islands", "lat": -16.2, "lng": -151.0, "kind": "region"}, {"text": "Tuamotu", "lat": -15.4, "lng": -146.4, "kind": "region"}],
}
# Where an Indonesian route's chart sits (the engine's regional data: public/maps/data/<dest>).
DEST = {"From Sorong": "raja-ampat", "Sorong round trip": "raja-ampat", "Ambon to Sorong": "indonesia"}
OUT = os.path.join(ROOT, "public/maps/routes")

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

for waters in LABELS:
  SHIPS = os.path.join(ROOT, "lib/content/ships", waters)
  for f in sorted(os.listdir(SHIPS)):
    if not f.endswith(".json"): continue
    s = json.load(open(os.path.join(SHIPS, f)))
    for it in s["itineraries"]:
        if not it["days"]: continue
        # A route whose length is not published (stops in the operator's order) ends in "-stops".
        rid = f"{s['slug']}-{slug(it['direction'])}-{str(it['nights']) + 'n' if it['nights'] is not None else 'stops'}"
        dest = DEST.get(it["direction"], "komodo") if waters == "indonesia" else waters
        stops, prev = [], None
        for d in it["days"]:
            st = {"day": d["day"], "name": d["place"], "lat": d["lat"], "lng": d["lng"]}
            if prev is None: st["kind"] = "port"
            else:
                # The leg's mode comes from the day itself (lib/content/ships: "mode": "air" only where the operator's
                # day says the guest flies), the one field the engraved chart and the 3D terrain map both read.
                st["mode"] = d.get("mode", "sea")
                st["path"] = [[prev["lng"], prev["lat"]], [d["lng"], d["lat"]]]
            stops.append(st); prev = d
        stops[-1]["kind"] = "port"
        route = {"id": rid, "type": "voyage", "destination": dest, "title": f"{it['name'][0].upper() + it['name'][1:]} aboard {s['name']}",
                 "subtitle": f"{str(it['nights']) + ' nights' if it['nights'] is not None else 'Stops in order'} · {it['direction'].split(' (')[0]} · {s['name']}",
                 "days": {str(d["day"]): d["title"] for d in it["days"]}, "stops": stops,
                 "map_note": ("Course" if waters in ("indonesia", "tahiti") else "River course") + " and positions approximate, not a navigational chart",
                 "fallback": {"labels": LABELS[waters]}}
        lanes = route_stops(route, MAPS)
        json.dump(route, open(os.path.join(OUT, f"{rid}.json"), "w"), indent=1, ensure_ascii=False)
        print(rid, *(f"\n  round the land: {l}" for l in lanes))

# The signature charter journeys (lib/content/ships/journeys.json, James 2 Nov 2026): one route file each,
# <slug>-<nights>n, the same jw-route v1 shape as the ship routes, with the dive flags as chart labels.
J = json.load(open(os.path.join(ROOT, "lib/content/ships/journeys.json")))
for j in J["journeys"]:
    rid = f"{j['slug']}-{j['nights']}n"
    stops, prev = [], None
    for d in j["days"]:
        st = {"day": d["day"], "name": d["place"], "lat": d["lat"], "lng": d["lng"]}
        if prev is None: st["kind"] = "port"
        else:
            st["mode"] = d.get("mode", "sea"); st["path"] = [[prev["lng"], prev["lat"]], [d["lng"], d["lat"]]]
        stops.append(st); prev = d
    stops[-1]["kind"] = "port"
    route = {"id": rid, "type": "voyage", "destination": j["region"], "title": j["name"],
             "subtitle": f"A typical week · {j['nights']} nights · from {j['embark'].split(',')[0]}",
             "days": {str(d["day"]): d["title"] for d in j["days"]}, "stops": stops,
             "map_note": "Course and positions approximate, not a navigational chart; days indicative",
             "fallback": {"labels": LABELS["indonesia"] + [{"text": f"⚑ {f['name']}", "lat": f["lat"], "lng": f["lng"], "kind": "sea-small"} for f in j["dive"]]}}
    lanes = route_stops(route, MAPS)
    json.dump(route, open(os.path.join(OUT, f"{rid}.json"), "w"), indent=1, ensure_ascii=False)
    print(rid, *(f"\n  round the land: {l}" for l in lanes))
