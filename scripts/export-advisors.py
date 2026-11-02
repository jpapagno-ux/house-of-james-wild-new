#!/usr/bin/env python3
"""Advisor DNA and the advisor's own marks (Stage 4b) from the library export.
usage: export-advisors.py data/library/advisors.json lib/content/advisors-library.json

The library (Person records) is the only source of Advisor DNA: Pathways, volumes,
countries, who they plan for, languages, availability, the advisor's own match line
(exported only once the advisor confirmed it) and their first-hand marks on Ledger
records. Only public, real advisors reach this file; stand-ins never do. The site's
hand-written advisor cards stay where they are; this file is merged over them by slug."""
import json, sys
src = json.load(open(sys.argv[1]))["entities"]
PATHWAYS = {"PATH-01", "PATH-02", "PATH-03", "PATH-04", "PATH-05", "PATH-06", "PATH-07", "PATH-08"}
VOLUMES = {"stays", "safaris", "gatherings", "voyages", "overland", "europe"}
MARKS = {"Stayed", "Walked It", "Sailed It", "Sent Guests"}
out = []
for p in src:
    if not p.get("ledger_id") or not p.get("site_slug"):
        continue
    out.append({
        "slug": p["site_slug"], "ledgerId": p["ledger_id"], "name": p.get("name"),
        "pathways": [x for x in (p.get("pathways") or []) if x in PATHWAYS],
        "volumes": [x for x in (p.get("volumes") or []) if x in VOLUMES],
        "countries": [str(x) for x in (p.get("countries") or []) if x],
        "partyTypes": [str(x) for x in (p.get("party_types") or []) if x],
        "languages": [str(x) for x in (p.get("languages") or []) if x],
        "specialties": [str(x) for x in (p.get("specialties") or []) if x],
        "availability": p.get("availability") or "open",
        "matchNote": (p.get("match_note") or None) if p.get("dna_confirmed_date") else None,
        "confirmed": (p.get("dna_confirmed_date") or None),
        "updated": p.get("dna_updated_date") or None,
        "marks": [{"ledgerId": m["ledger_id"], "mark": m["mark"], "when": m.get("when") or None, "note": m.get("note") or None}
                  for m in (p.get("marks") or []) if isinstance(m, dict) and m.get("ledger_id") and m.get("mark") in MARKS],
    })
out.sort(key=lambda a: a["ledgerId"])
json.dump({"advisors": out}, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(len(out), "advisors with DNA,", sum(1 for a in out if a["confirmed"]), "confirmed,", sum(len(a["marks"]) for a in out), "marks")
