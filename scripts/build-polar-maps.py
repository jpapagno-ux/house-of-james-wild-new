"""Builds a jw-route v1 file for each Antarctica21 voyage and each ship that sails it
(public/maps/routes/<ship>-<route>-<nights>n.json), from lib/content/polar/voyages/*.json, for the
house route chart on the polar voyage pages, the Magellan ship pages and the polar atlas. Flight days
(Punta Arenas to King George Island and back) are drawn as air legs; the rest join the day positions
by sea, routed round the coast and anchored offshore by scripts/sealanes.py. Positions are standard geographic points for the places named, approximate, and where the
research split a published block of days the order is indicative. Run from the repo root:
    python3 scripts/build-polar-maps.py .
"""
import copy, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sealanes import route_stops   # anchorages and sea lanes round the OSM coast (James, 8 Nov 2026)
ROOT = sys.argv[1]
SRC = os.path.join(ROOT, "lib/content/polar/voyages")
OUT = os.path.join(ROOT, "public/maps/routes")
SHIPS = {"magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer"}
LABELS = [
  {"text": "Drake Passage", "lat": -58.5, "lng": -64.5, "kind": "sea"},
  {"text": "Scotia Sea", "lat": -57.0, "lng": -45.0, "kind": "sea"},
  {"text": "Antarctic Peninsula", "lat": -67.0, "lng": -63.5, "kind": "region"},
]

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

for f in sorted(os.listdir(SRC)):
  if not f.endswith(".json"): continue
  v = json.load(open(os.path.join(SRC, f)))
  stops, prev = [], None
  # the airstrip the flights use (the outbound flight's landing), for the sail back before a return flight
  kgi = next((d for d in v["itinerary"] if re.search(r"King George Island", d["place"]) and not re.search(r" to ", d["place"])), None)
  near = lambda a, b: abs(a["lat"] - b["lat"]) < 0.35 and abs(a["lng"] - b["lng"]) < 0.8
  for d in v["itinerary"]:
    st = {"day": d["day"], "name": d["place"], "lat": d["lat"], "lng": d["lng"]}
    flight = re.search(r"flight", d["title"], re.I)
    # James, 9 Nov 2026 (the chart flew the ship straight off Penola Strait): a return flight leaves from King George
    # Island, so when the ship is elsewhere it first sails back there, then the flight leaves from the airstrip
    if prev is not None and flight and kgi and re.search(r"King George Island to ", d["place"]) and not near(prev, kgi):
      back = {"day": d["day"], "name": "King George Island", "lat": kgi["lat"], "lng": kgi["lng"], "mode": "sea", "kind": "airstrip",
              "path": [[prev["lng"], prev["lat"]], [kgi["lng"], kgi["lat"]]]}
      stops.append(back); prev = {"lat": kgi["lat"], "lng": kgi["lng"]}
    if prev is None: st["kind"] = "port"
    elif near(prev, d) and not flight:
      st["mode"] = stops[-1].get("mode", "air")   # the day ends where the last leg did (disembarking): no zero-length sail
    else:
      st["mode"] = "air" if flight else "sea"
      if not flight: st["path"] = [[prev["lng"], prev["lat"]], [d["lng"], d["lat"]]]
    if flight and re.search(r"King George Island", d["place"]) and not re.search(r" to ", d["place"]): st["kind"] = "airstrip"
    stops.append(st); prev = d
  stops[-1]["kind"] = "port"
  for ship in v["ships"]:
    rid = f"{ship}-{slug(v['route'])}-{v['nights']}n"
    route = {
      "id": rid, "type": "voyage", "destination": "polar",
      "title": f"{v['name']} aboard {SHIPS[ship]}",
      "subtitle": f"{v['nights']} nights · {v['route']} · {SHIPS[ship]}",
      "days": {str(d["day"]): (f"{d['label']}: " if d.get("label") else "") + d["title"] for d in v["itinerary"]},
      "stops": copy.deepcopy(stops),
      "map_note": "Positions approximate; ice and weather set the ship's course. Not a navigational chart",
      "fallback": {"labels": LABELS},
    }
    route_stops(route, os.path.join(ROOT, "public/maps"))
    json.dump(route, open(os.path.join(OUT, f"{rid}.json"), "w"), indent=1, ensure_ascii=False)
    print(rid)
