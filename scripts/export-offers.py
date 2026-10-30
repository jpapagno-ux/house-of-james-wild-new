#!/usr/bin/env python3
"""Ledger export: offers. Turns the library's Offer records (siteExport.offers)
into lib/content/offers/library.json, which lib/content/offers/offers.ts merges
with the hand-kept Offer Ledger (a library record wins on the same ID).

usage: export-offers.py OFFERS.json OUT.json

Public terms only (siteExport never sends terms_source). Only `published`
offers show on the site (status Live); `cms_ready` ones ship as Draft so they
can be previewed but never appear. An offer needs a program, a headline and a
travel window (or a departure date for Final Call); anything less is skipped
and listed, never guessed.
"""
import json, sys, re

PROGRAMS = {"Worth Another Night", "Time Rewarded", "Final Call", "Book Early", "On the Horizon"}
SCOPES = {"stay": "stay", "residence": "residence", "vessel": "vessel", "reserve": "reserve", "itinerary": "itinerary"}
VOLUMES = {"stays", "safaris", "gatherings", "voyages", "europe", "overland"}
MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

def day(d):
    y, m, dd = d.split("-")
    return f"{int(dd)} {MON[int(m) - 1]} {y}"

def main(src, out):
    rows = json.load(open(src)).get("entities", [])
    keep, skipped = [], []
    for o in rows:
        name = (o.get("name") or "").strip()
        prog, head = o.get("program"), (o.get("headline") or "").strip()
        ref = o.get("ref")
        frm, to, dep = o.get("valid_from"), o.get("valid_to"), o.get("departure_date")
        if prog == "Final Call" and dep:
            frm, to = frm or dep, dep
        if prog not in PROGRAMS or not head or not ref or not (frm and to):
            skipped.append(f"{o.get('ledger_id') or o.get('id')} {name}: needs program, headline, page and dates"); continue
        oid = o.get("ledger_id") or f"OFR-LIB-{o['id']}"
        text = o.get("travel_text") or (f"departs {day(dep)}" if prog == "Final Call" and dep else f"{day(frm)} to {day(to)}")
        rec = {
            "id": oid, "year": int((re.search(r"OFR-(\d{4})", oid) or re.match(r"(\d{4})", frm)).group(1)),
            "status": "Live" if o.get("workflow_status") == "published" else "Draft",
            "scope": SCOPES.get(o.get("record_type") or "stay", "stay"), "ref": ref, "name": name, "country": "",
            "program": prog, "headline": head, "travel": {"from": frm, "to": to, "text": text},
            "source": "Base44 library", "checked": o.get("terms_checked_date") or (o.get("updated_date") or "")[:10],
        }
        if o.get("conditions"): rec["conditions"] = o["conditions"].strip()
        if o.get("volume") in VOLUMES: rec["volume"] = o["volume"]
        if dep: rec["departure"] = dep
        keep.append(rec)
    keep.sort(key=lambda r: r["id"])
    json.dump(keep, open(out, "w"), ensure_ascii=False, indent=1)
    print(len(keep), "library offers,", len(skipped), "skipped")
    for s in skipped: print("  skipped:", s)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
