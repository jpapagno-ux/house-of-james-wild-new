#!/usr/bin/env python3
"""Split the library export (siteExport) into the files the exporters read.
usage: library-split.py EXPORT.json  ->  data/library/stays.json, data/library/destinations.json"""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
x = json.load(open(sys.argv[1]))
assert x.get("stays") and x.get("destinations"), "empty export"
(ROOT / "data/library").mkdir(parents=True, exist_ok=True)
json.dump({"exportedAt": x["exportedAt"], "entities": x["stays"]}, open(ROOT / "data/library/stays.json", "w"), ensure_ascii=False)
json.dump({"exportedAt": x["exportedAt"], "entities": x["destinations"]}, open(ROOT / "data/library/destinations.json", "w"), ensure_ascii=False)
print(len(x["stays"]), "stays,", len(x["destinations"]), "destinations, exported", x["exportedAt"])
