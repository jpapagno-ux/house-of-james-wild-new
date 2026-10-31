#!/usr/bin/env python3
"""Ledger export: what's coming. Every library stay with coming_status set
(announced / opening / rebuilding / reopened — James, 31 Oct 2026) becomes a
card on /whats-coming, released or not. Facts come from the brand's own site
only (source_url); nothing is invented here. Usage:
  python3 scripts/export-coming.py data/library/stays.json data/library/destinations.json lib/content/whats-coming.json
"""
import json, sys, html, re, pathlib, datetime

def text(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x or ""))).strip()

stays, dests = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
stays = stays.get("stays", stays) if isinstance(stays, dict) else stays
dests = dests.get("destinations", dests) if isinstance(dests, dict) else dests
D = {d["id"]: d for d in dests}
RELEASE = {r["slug"] for r in json.load(open(pathlib.Path(__file__).resolve().parent / "data" / "stay-release.json"))["released"]}
OWN = ("res.cloudinary.com", "media.base44.com", "cdn.prod.website-files.com", "base44.app", "jameswildco.com")
def owned(u):
    from urllib.parse import urlparse
    return bool(u) and (u.startswith("/") or (urlparse(u).hostname or "").endswith(OWN))

out = []
for s in stays:
    st = s.get("coming_status")
    if st not in ("announced", "opening", "rebuilding", "reopened"): continue
    slug = s.get("webflow_slug") or s.get("property_slug")
    d = D.get(s.get("destination_id")) or {}
    out.append({
        "slug": slug, "name": text(s.get("display_name") or s["name"]), "ledgerId": s.get("ledger_id"),
        "country": d.get("name"), "countrySlug": d.get("webflow_slug"), "regionSlug": d.get("region_slug"),
        "status": st, "date": s.get("coming_date"), "note": text(s.get("coming_note")) or None,
        "tagline": text(s.get("tagline")) or None,
        "hero": s.get("hero_image_url") if owned(s.get("hero_image_url")) else None,
        "source": s.get("source_url") or None,
        "href": f"/stays/{slug}" if slug in RELEASE else None,
        "bestMonths": s.get("best_months") or None, "airport": text(s.get("airport_name")) or None,
        "volume": s.get("house_volume") or None,
    })
out.sort(key=lambda x: (x["date"] or "9999", x["name"]))
json.dump({"exportedOn": datetime.date.today().isoformat(), "coming": out}, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)
print(len(out), "coming:", ", ".join(f"{x['name']} ({x['status']} {x['date']})" for x in out))
