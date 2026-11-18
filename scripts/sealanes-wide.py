"""Fills the kept lanes for the wide waters (scripts/data/coast/lanes/<dest>.json) in parallel, then routes every route
file of those waters in place. Run after scripts/coast-routes.py, or whenever new voyages add new legs:
    python3 scripts/sealanes-wide.py [dest ...]
"""
import glob, json, os, sys
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sealanes as S

MAPS = "public/maps"

def _anchor(job):
    dest, p = job
    return dest, S._key(p), S.anchorage(p, S.land_of(MAPS, dest))

def _leg(job):
    dest, a, b = job
    land = S.land_of(MAPS, dest)
    try:
        p, moved = S.long_path(a, b, land)
        v = {"path": p, "moved": moved}
        if moved: v["clear"] = S.clearance(p, land)
        elif S.crosses(p, land): v["passage"] = True
    except Exception as e:   # a leg that breaks the router is drawn straight and flagged, never dropped
        print("  failed", dest, a, b, repr(e)[:120], file=sys.stderr, flush=True)
        v = {"path": [a, b], "moved": False, "passage": True}
    return dest, f"{S._key(a)}>{S._key(b)}", v

if __name__ == "__main__":
    dests = sys.argv[1:] or sorted(S.WIDE)
    only = os.environ.get("ONLY", "")
    files = [f for f in sorted(glob.glob(f"{MAPS}/routes/*.json")) if only in f and (lambda r: r.get("destination") in dests and r.get("type") != "overland")(json.load(open(f)))]
    routes = {f: json.load(open(f)) for f in files}
    with Pool(int(os.environ.get("JOBS") or os.cpu_count() or 2)) as pool:
        jobs = {}
        for r in routes.values():
            d = r["destination"]; c = S.lanes(d)
            for s in r["stops"]:
                p = s.get("charted") or [s["lng"], s["lat"]]
                if S._key(p) not in c["anchor"]: jobs[(d, S._key(p))] = (d, p)
        for n, (d, k, a) in enumerate(pool.imap_unordered(_anchor, list(jobs.values()), chunksize=8)):
            S.lanes(d)["anchor"][k] = a; S._DIRTY.add(d)
        S.save_lanes(); print(len(jobs), "anchorages", flush=True)
        jobs = {}
        for r in routes.values():
            d = r["destination"]; c = S.lanes(d); prev = None
            for s in r["stops"]:
                p = s.get("charted") or [s["lng"], s["lat"]]
                q = c["anchor"].get(S._key(p)) or p
                if prev is not None and str(s.get("mode", "sea")).lower() in S.SEA_MODES and f"{S._key(prev)}>{S._key(q)}" not in c["leg"]: jobs[(d, S._key(prev), S._key(q))] = (d, prev, q)
                prev = q
        print(len(jobs), "legs to route", flush=True)
        for n, (d, k, v) in enumerate(pool.imap_unordered(_leg, list(jobs.values()), chunksize=4)):
            S.lanes(d)["leg"][k] = v; S._DIRTY.add(d)
            if n % 50 == 49: S.save_lanes(); print(n + 1, flush=True)
        S.save_lanes()
    moved = passages = 0
    for f, r in routes.items():
        for s in r["stops"]:
            if "charted" in s: s["lng"], s["lat"] = s.pop("charted")   # route afresh from the charted positions
        S.route_stops(r, MAPS)
        moved += sum(s.get("lane") == "sea" for s in r["stops"]); passages += sum(s.get("lane") == "passage" for s in r["stops"])
        json.dump(r, open(f, "w"), indent=1, ensure_ascii=False)
    print(len(files), "route files;", moved, "legs routed round land;", passages, "passages left straight")
