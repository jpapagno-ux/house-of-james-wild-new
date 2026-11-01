#!/usr/bin/env python3
"""Ledger export: places. A place is a Destination record that sits INSIDE a country
(parent_destination_id set): Rapa Nui inside Chile. Destination-first (Stage 2, 1 Nov 2026).

usage: export-places.py DESTINATIONS.json STAYS_OUT.json OUT.json

Writes lib/content/places-library.json: one row per place with its Ledger ID, parent country
slug, region, display subtitle and the stays selected for it (stays carry placeSlug, from
destination_place_id). Editorial copy for a place lives in lib/content/guides.ts; this file
carries the library's identity and relationships only, so a place is never a country and a
stay is never duplicated.
"""
import json, sys
from pathlib import Path

dests = json.load(open(sys.argv[1]))["entities"]
stays = json.load(open(sys.argv[2]))["stays"]
by_id = {d["id"]: d for d in dests}
out = []
for d in sorted(dests, key=lambda d: d.get("name") or ""):
    pid = d.get("parent_destination_id")
    if not pid or not d.get("webflow_slug"): continue
    parent = by_id.get(pid) or {}
    if not parent.get("webflow_slug"):
        print("place without a live parent:", d.get("name"), file=sys.stderr); continue
    out.append({
        "slug": d["webflow_slug"], "name": d.get("name"), "ledgerId": d.get("ledger_id"),
        "parentSlug": parent["webflow_slug"], "regionSlug": d.get("region_slug") or parent.get("region_slug"),
        "subtitle": d.get("display_subtitle"),
        "stays": [s["slug"] for s in stays if s.get("placeSlug") == d["webflow_slug"]],
    })
json.dump({"places": out}, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(len(out), "places")
