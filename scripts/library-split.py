#!/usr/bin/env python3
"""Split the library export (siteExport) into the files the exporters read.
usage: library-split.py EXPORT.json  ->  data/library/stays.json, destinations.json, offers.json, films.json"""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
x = json.load(open(sys.argv[1]))
assert x.get("stays") and x.get("destinations"), "empty export"
(ROOT / "data/library").mkdir(parents=True, exist_ok=True)
json.dump({"exportedAt": x["exportedAt"], "entities": x["stays"]}, open(ROOT / "data/library/stays.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x["destinations"]}, open(ROOT / "data/library/destinations.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("offers") or []}, open(ROOT / "data/library/offers.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("films") or []}, open(ROOT / "data/library/films.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("impact_notes") or []}, open(ROOT / "data/library/impact-notes.json", "w"), ensure_ascii=False)
# Stage 5 (Last Mile): approved arrival hubs and transfers; absent from older exports.
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("arrival_hubs") or []}, open(ROOT / "data/library/arrival-hubs.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("transfers") or []}, open(ROOT / "data/library/transfers.json", "w"), ensure_ascii=False)
# Stage 4b: public advisors' DNA and their own marks; absent from older exports.
json.dump({"exportedAt": x["exportedAt"], "entities": x.get("advisors") or []}, open(ROOT / "data/library/advisors.json", "w"), ensure_ascii=False)
print(len(x["stays"]), "stays,", len(x["destinations"]), "destinations,", len(x.get("offers") or []), "offers,", len(x.get("films") or []), "films,", len(x.get("impact_notes") or []), "impact notes,", len(x.get("arrival_hubs") or []), "arrival hubs,", len(x.get("transfers") or []), "transfers,", len(x.get("advisors") or []), "advisors, exported", x["exportedAt"])
