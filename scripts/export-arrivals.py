#!/usr/bin/env python3
"""Arrival hubs and transfers (Stage 5, Last Mile) from the library export.
usage: export-arrivals.py data/library/arrival-hubs.json data/library/transfers.json lib/content/arrivals.json

Only approved records leave the library (siteExport filters), so everything here
may be shown. A transfer with no typical_minutes is kept (the route is on record)
but the page says the time is not recorded rather than estimating one."""
import json, sys
hubs = json.load(open(sys.argv[1]))["entities"]
transfers = json.load(open(sys.argv[2]))["entities"]
MODES = {"private_car": "private car", "self_drive": "self-drive", "light_aircraft": "light aircraft", "scheduled_flight": "scheduled flight",
         "helicopter": "helicopter", "boat": "boat", "ferry": "ferry", "rail": "rail", "walk": "on foot"}
out = {
    "hubs": [{
        "id": h["id"], "ledgerId": h.get("ledger_id"), "name": h["name"], "kind": h.get("kind") or "airport", "code": h.get("code") or None,
        "city": h.get("city") or None, "country": h.get("country"), "servesCountries": h.get("serves_countries") or [],
        "coords": {"lat": h["latitude"], "lng": h["longitude"]} if h.get("latitude") is not None and h.get("longitude") is not None else None,
        "houseNotes": h.get("house_notes") or None, "gatewayOvernight": bool(h.get("is_gateway_overnight")), "gatewayRef": h.get("gateway_ref") or None,
        "sourceUrl": h.get("source_url") or None, "factChecked": h.get("last_fact_checked_date") or None,
    } for h in sorted(hubs, key=lambda h: (h.get("country") or "", h["name"]))],
    "transfers": [{
        "ledgerId": t.get("ledger_id"), "from": t["from_ref"], "to": t["to_ref"], "mode": MODES.get(t.get("mode") or "", t.get("mode") or "transfer"),
        "minutes": t.get("typical_minutes") if isinstance(t.get("typical_minutes"), (int, float)) and t.get("typical_minutes") > 0 else None,
        "km": t.get("distance_km") if isinstance(t.get("distance_km"), (int, float)) and t.get("distance_km") > 0 else None,
        "sourceUrl": t.get("source_url") or None, "factChecked": t.get("last_fact_checked_date") or None,
    } for t in transfers if t.get("from_ref") and t.get("to_ref")],
}
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(len(out["hubs"]), "arrival hubs,", len(out["transfers"]), "transfers,", sum(1 for t in out["transfers"] if t["minutes"]), "with a stated time")
